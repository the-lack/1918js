import { err, ok } from "./lib/result";

export { validate_pesel, Pesel }

// ── functional implementation ────────────────────────────────────────────────
const ALLOWED_CHARACTERS: readonly string[] =
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PESEL_ALLOWED_LENGTH = 11
const PESEL_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1] as const;

function validate_pesel(pesel_candidate: unknown) {

  if (typeof pesel_candidate !== "string")
    return err(invalid_type(pesel_candidate))

  if (!has_valid_length(pesel_candidate))
    return err(invalid_length(pesel_candidate))

  if (!has_only_digits(pesel_candidate))
    return err(invalid_characters())

  if (has_only_zeros(pesel_candidate))
    return err(contains_only_zeros())

  const digits = derive_pesel_control_digits(pesel_candidate)

  if (digits.received_control_number !== digits.calculated_control_number) {
    return err(control_digit_mismatch(digits))
  }

  return ok(pesel_candidate)
}

// ── nominal value-object shell ───────────────────────────────────────────────
class Pesel {
  #value: string

  private constructor(value: string) {
    this.#value = value
  }

  static try_parse(candidate: unknown) {
    const result = validate_pesel(candidate as any)

    if (!result.ok) return result

    return ok(new Pesel(result.value))
  }

  as_string(): string {
    return this.#value
  }

  equals(other: unknown): other is Pesel {
    if (!(other instanceof Pesel)) return false;
    return this.#value === other.#value;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function has_valid_length(pesel_candidate: string) {
  return pesel_candidate.length === PESEL_ALLOWED_LENGTH
}

function has_only_zeros(pesel_candidate: string) {
  for (const character of pesel_candidate) {
    if (character !== "0") return false
  }

  return true
}

function has_only_digits(pesel_candidate: string) {
  for (const character of pesel_candidate) {
    if (!ALLOWED_CHARACTERS.includes(character))
      return false
  }
  return true
}

function derive_pesel_control_digits(pesel_candidate: string) {
  const pesel_digits: number[] = pesel_candidate.split("").map(Number)
  const received_control_number = pesel_digits.pop()!

  const weighted_sum = pesel_digits.reduce((accumulator, current_digit, index) => {
    return accumulator + (current_digit * PESEL_WEIGHTS[index]!)
  }, 0)

  const subtrahend = weighted_sum % 10;
  const calculated_control_number = subtrahend === 0 ? 0 : 10 - subtrahend;

  return { received_control_number, calculated_control_number }
}

// ── errors  ──────────────────────────────────────────────────────────────────
function invalid_type(pesel_candidate: unknown) {
  return {
    name: "PeselIsNotString",
    message: "PESEL is not of type `string`",
    meta: {
      expected_type: "string",
      received_type: typeof pesel_candidate
    }
  } as const
}

function invalid_length(pesel_candidate: string) {
  return {
    name: "PeselHasInvalidLength",
    message: "PESEL has invalid length",
    meta: {
      expected_length: PESEL_ALLOWED_LENGTH,
      received_length: pesel_candidate.length
    }
  } as const
}

function invalid_characters() {
  return {
    name: "PeselContainsNonDigitCharacters",
    message: "PESEL contains non-numeric characters"
  } as const
}

function contains_only_zeros() {
  return {
    name: "PeselContainsOnlyZeros",
    message: "Received PESEL contains only digits equal to zero 0",
  } as const
}
function control_digit_mismatch(digits: { received_control_number: number, calculated_control_number: number }) {
  return {
    name: "PeselControlDigitMismatch",
    message: "Calculated control digit does not match one contained in the PESEL",
    meta: {
      received_control_digit: digits.received_control_number,
      expected_control_digit: digits.calculated_control_number,
      control_digit_position: PESEL_ALLOWED_LENGTH,
    }
  } as const
}
