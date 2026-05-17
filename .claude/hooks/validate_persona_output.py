#!/usr/bin/env python3
"""Stop / SubagentStop hook — enforce the BMAD persona Output Validation Protocol.

When a persona has just written a deliverable artifact under `_bmad-output/`,
this hook blocks the stop exactly once and instructs the model to run the
self-validation protocol (checklist scoring + confidence gate) before the
output reaches the user.

`stop_hook_active` guards against loops: the hook blocks once, the model runs
the protocol, and the follow-up stop is allowed through.

The hook fails open — any parse/IO error exits 0 so a normal session is never
broken.
"""
import json
import os
import sys

WATCH_DIR = "_bmad-output"
WRITE_TOOLS = {"Write", "Edit", "MultiEdit", "NotebookEdit"}


def fail_open():
    sys.exit(0)


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        fail_open()

    # Already inside a hook-triggered continuation — let it through.
    if data.get("stop_hook_active"):
        fail_open()

    transcript_path = data.get("transcript_path", "")
    if not transcript_path or not os.path.exists(transcript_path):
        fail_open()

    try:
        with open(transcript_path, "r", encoding="utf-8") as fh:
            lines = fh.readlines()
    except Exception:
        fail_open()

    # Walk backwards, collecting deliverable writes since the last genuine user
    # turn (tool_result entries also have role=user, so they are skipped).
    deliverables = []
    for raw in reversed(lines):
        raw = raw.strip()
        if not raw:
            continue
        try:
            entry = json.loads(raw)
        except Exception:
            continue

        message = entry.get("message", {}) or {}
        role = message.get("role")
        content = message.get("content")

        if role == "user":
            is_genuine = isinstance(content, str)
            if isinstance(content, list):
                kinds = {b.get("type") for b in content if isinstance(b, dict)}
                if kinds and kinds != {"tool_result"}:
                    is_genuine = True
            if is_genuine:
                break

        if role == "assistant" and isinstance(content, list):
            for block in content:
                if not isinstance(block, dict) or block.get("type") != "tool_use":
                    continue
                if block.get("name") not in WRITE_TOOLS:
                    continue
                inp = block.get("input", {}) or {}
                path = inp.get("file_path") or inp.get("notebook_path") or ""
                if WATCH_DIR in path:
                    deliverables.append(path)

    if not deliverables:
        fail_open()

    unique = "\n".join(f"  - {p}" for p in sorted(set(deliverables)))
    reason = (
        "A BMAD persona deliverable was just written:\n"
        f"{unique}\n\n"
        "Before presenting it to the user, you MUST run the Output Validation "
        "Protocol (.claude/quality/validation-protocol.md):\n"
        "1. Identify the persona and pick the matching checklist in "
        ".claude/quality/checklists/ (analysis | architecture | dev | qa) plus "
        "general.md.\n"
        "2. Score the deliverable against every checklist item; state a single "
        "confidence percentage (0-100).\n"
        "3. If confidence < 80% OR any (critical) item fails: revise the "
        "deliverable now and re-score. Loop autonomously and silently until it "
        "passes — do not ask the user to weigh in mid-fix.\n"
        "4. Once it passes, present the deliverable with a short "
        "'✅ Validation summary' (checklist result + final confidence %).\n\n"
        "If what you just wrote is NOT a persona deliverable meant for review, "
        "say so in one line and stop."
    )

    print(json.dumps({"decision": "block", "reason": reason}))
    sys.exit(0)


if __name__ == "__main__":
    main()
