import { err, ok } from "./lib/result"

export { validate_nip, Nip };

class Nip {
  #value: string;

  private constructor(nip: string) {
    this.#value = nip;
  }

  static try_parse(nip_candidate: string) {
    const result = validate_nip(nip_candidate as any)

    if (!result.ok) return result;

    return ok(new Nip(result.value))
  }

  as_string(): string {
    return this.#value;
  }

  equals(other: unknown): other is Nip {
    if (!(other instanceof Nip)) return false;

    return this.#value === other.#value;
  }
}

function validate_nip(nip_candidate: string) {

  if (!has_valid_length(nip_candidate))
    return err(invalid_length(nip_candidate));

  if (!has_only_digits(nip_candidate))
    return err(invalid_characters());

  const { calculated_control_digit, received_control_digit } = derive_nip_control_digits(nip_candidate);

  if (calculated_control_digit === 10)
    return err(invalid_control_digit());

  if (received_control_digit !== calculated_control_digit)
    return err(control_digit_mismatch({
      calculated_control_digit,
      received_control_digit
    }));

  return ok(nip_candidate);
}

const NIP_CONTROL_DIGIT_INDEX = 9
const NIP_EXPECTED_LENGTH = 10

function has_only_digits(nip: string) {
  return /^\d+$/.test(nip);
}

function has_valid_length(nip: string) {
  return nip.length === NIP_EXPECTED_LENGTH
}

function derive_nip_control_digits(nip: string) {
  const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const NIP_MODULO = 11

  const digits = nip.split("").map(Number);
  const all_digits_except_control_digit = digits.slice(0, NIP_CONTROL_DIGIT_INDEX);

  const weighted_sum = all_digits_except_control_digit.reduce((acc, digit, index) => acc + digit * NIP_WEIGHTS[index]!, 0);

  const calculated_control_digit = weighted_sum % NIP_MODULO;
  const received_control_digit = digits[NIP_CONTROL_DIGIT_INDEX]!;

  return {
    calculated_control_digit,
    received_control_digit
  };
}

function invalid_characters() {
  return {
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
  } as const
}

function invalid_length(nip: string) {
  return {
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expected_length: NIP_EXPECTED_LENGTH,
      received_length: nip.length
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
