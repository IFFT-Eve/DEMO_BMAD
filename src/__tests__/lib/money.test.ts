import { describe, it, expect } from "vitest";
import { formatCents } from "@/lib/money";

describe("formatCents", () => {
  it("formats typical product prices to USD string", () => {
    expect(formatCents(1999)).toBe("$19.99");
    expect(formatCents(2499)).toBe("$24.99");
    expect(formatCents(4999)).toBe("$49.99");
    expect(formatCents(7999)).toBe("$79.99");
    expect(formatCents(1499)).toBe("$14.99");
    expect(formatCents(3499)).toBe("$34.99");
  });

  it("formats zero cents to $0.00", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats one cent correctly", () => {
    expect(formatCents(1)).toBe("$0.01");
  });

  it("formats whole dollar amounts without trailing decimal issue", () => {
    expect(formatCents(100)).toBe("$1.00");
    expect(formatCents(1000)).toBe("$10.00");
  });
});
