import { ok, Result } from "./lib/result";
import { NipError, tryParseNip } from "./parse-nip";

// @summary value object implementation for NIP with nominal typing
export class Nip {
  #value: string;

  private constructor(nip: string) {
    this.#value = nip;
  }

  // @param   nipCandidate - raw NIP string to validate
  // @returns result containing either successfully parsed Nip instance or a NipError
  static tryParse(nipCandidate: string): Result<Nip, NipError> {
    const result = tryParseNip(nipCandidate)

    if (!result.ok) return result;
    else return ok(new Nip(result.value))
  }

  // @returns valid NIP value in a string format
  asString(): string {
    return this.#value;
  }

  // @summary compares this instance with another value for equality
  equals(other: unknown): other is Nip {
    if (this === other) return true;
    if (!(other instanceof Nip)) return false;

    return this.#value === other.#value;
  }
}
