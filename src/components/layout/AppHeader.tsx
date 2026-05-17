import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          bmad_demo
        </Link>
        <div className="flex items-center gap-4">
          <button
            aria-label="Open cart"
            className="rounded-sm p-1 text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </button>
          <Link
            href="/login"
            className="text-sm font-medium text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
