import { err, ok } from "./lib/result"

export { validate_nip, Nip };

// ── functional implementation ────────────────────────────────────────────────
const NIP_MODULO = 11
const NIP_CONTROL_DIGIT_INDEX = 9
const NIP_ALLOWED_LENGTH = 10
const NIP_WEIGHTS: readonly number[] = [6, 5, 7, 2, 3, 4, 5, 6, 7]
const NIP_ALLOWED_CHARACTERS: readonly string[] =
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function validate_nip(nip_candidate: unknown) {

  if (typeof nip_candidate !== "string")
    return err(invalid_type(nip_candidate))

  if (!has_valid_length(nip_candidate))
    return err(invalid_length(nip_candidate));

  if (!has_only_digits(nip_candidate))
    return err(invalid_characters());

  if (has_only_zeros(nip_candidate))
    return err(contains_only_zeros())
    
  const { calculated_control_digit, received_control_digit } =
    derive_nip_control_digits(nip_candidate);

  if (calculated_control_digit === 10)
    return err(invalid_control_digit());

  if (received_control_digit !== calculated_control_digit)
    return err(control_digit_mismatch({
      calculated_control_digit,
      received_control_digit
    }));

  return ok(nip_candidate);
}

// ── nominal value-object shell ───────────────────────────────────────────────
class Nip {
  #value: string;

  private constructor(nip_candidate: string) {
    this.#value = nip_candidate;
  }

  static try_parse(nip_candidate: unknown) {
    const result = validate_nip(nip_candidate)

    if (!result.ok) return result;

    return ok(new Nip(result.value))
  }

  as_string(): string {
    return this.#value;
  }

  equals(other: unknown) {
    if (!(other instanceof Nip)) return false;

    return this.#value === other.#value;
  }
}


// ── helpers ──────────────────────────────────────────────────────────────────
function has_only_digits(nip_candidate: string) {
  for (const character of nip_candidate) {
    if (!NIP_ALLOWED_CHARACTERS.includes(character))
      return false;
  }

  return true
}

function has_valid_length(nip_candidate: string) {
  return nip_candidate.length === NIP_ALLOWED_LENGTH
}

function derive_nip_control_digits(nip_candidate: string) {
  const digits = nip_candidate.split("").map(Number);
  const all_digits_except_control_digit = digits.slice(0, NIP_CONTROL_DIGIT_INDEX);

  const weighted_sum = all_digits_except_control_digit
    .reduce((acc, digit, index) => acc + digit * NIP_WEIGHTS[index]!, 0);

  const calculated_control_digit = weighted_sum % NIP_MODULO;
  const received_control_digit = digits[NIP_CONTROL_DIGIT_INDEX]!;

  return {
    calculated_control_digit,
    received_control_digit
  };
}

function has_only_zeros(nip_candidate: string) {
  for (const character of nip_candidate) {
    if (character !== "0") return false
  }

  return true
}


// ── errors  ──────────────────────────────────────────────────────────────────
function invalid_type(nip_candidate: unknown) {
  return {
      name: "NipIsNotString",
      message: "NIP is not of type `string`",
      meta: {
        expected_type: "string",
        received_type: typeof nip_candidate
      }
    } as const
}

function invalid_characters() {
  return {
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
  } as const
}

function invalid_length(nip_candidate: string) {
  return {
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expected_length: NIP_ALLOWED_LENGTH,
      received_length: nip_candidate.length
    }
  } as const
}

function invalid_control_digit() {
  return {
    name: "NipCalculatedControlDigitCannotBeTen",
    message: "Control digit calculated for NIP cannot equal 10"
  } as const
}

function control_digit_mismatch(control_digit: {
  calculated_control_digit: number;
  received_control_digit: number;
}) {
  return {
    name: "NipControlDigitMismatch",
    message: "Received NIP control digit does not match calculated control digit",
    meta:
    {
      expected_control_digit: control_digit.calculated_control_digit,
      received_control_digit: control_digit.received_control_digit,
      control_digit_index: NIP_CONTROL_DIGIT_INDEX,
    }
  } as const
}

function contains_only_zeros() {
  return {
    name: "NipContainsOnlyZeros",
    message: "Received NIP contains only digits equal to zero 0",
  } as const
}
