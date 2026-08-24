import { err, ok, type Result } from "./lib/result"

export { validate_nip, Nip, type NipError, type NipErrorName };

class Nip {
  #value: string;

  private constructor(nip: string) {
    this.#value = nip;
  }

  static try_parse(nip_candidate: string): Result<Nip, NipError> {
    const result = validate_nip(nip_candidate)

    if (!result.ok) return result;
    else return ok(new Nip(result.value))
  }

  as_string(): string {
    return this.#value;
  }

  equals(other: unknown): other is Nip {
    if (this === other) return true;
    if (!(other instanceof Nip)) return false;

    return this.#value === other.#value;
  }
}

function validate_nip(nip: string): Result<string, NipError> {

  if (!has_valid_length(nip)) return err(invalid_length(nip));
  if (!has_only_digits(nip)) return err(invalid_characters());

  const control_digits = derive_nip_control_digits(nip);

  if (control_digits.expected === 10) return err(invalid_control_digit());
  if (control_digits.received !== control_digits.expected) return err(control_digit_mismatch(control_digits));

  return ok(nip);

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
  const digits_except_checksum = digits.slice(0, NIP_CONTROL_DIGIT_INDEX);

  const sum = digits_except_checksum.reduce((acc, digit, index) => acc + digit * NIP_WEIGHTS[index]!, 0);

  const expected_checksum = sum % NIP_MODULO;
  const received_checksum = digits[NIP_CONTROL_DIGIT_INDEX]!;

  return {
    expected: expected_checksum,
    received: received_checksum,
  };

}

function invalid_characters(): Readonly<NipError> {
  return {
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
  }
}

function invalid_length(nip: string): Readonly<NipError> {
  return {
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expected_length: NIP_EXPECTED_LENGTH,
      received_length: nip.length
    }
  }
}

function invalid_control_digit(): Readonly<NipError> {
  return {
    name: "NipCalculatedControlDigitCannotBeTen",
    message: "Control digit calculated for NIP cannot equal 10"
  }
}

function control_digit_mismatch(control_digit: { expected: number; received: number }): Readonly<NipError> {
  return {
    name: "NipControlDigitMismatch",
    message: "Received NIP control digit does not match calculated control digit",
    meta:
    {
      expected_control_digit: control_digit.expected,
      received_control_digit: control_digit.received,
      control_digit_index: NIP_CONTROL_DIGIT_INDEX,
    }
  }
}

type NipError =
  |
  {
    name: "NipInvalidLength"
    message: "NIP has invalid length"
    meta: {
      expected_length: typeof NIP_EXPECTED_LENGTH
      received_length: number
    };
  }
  |
  {
    name: "NipContainsNonDigits"
    message: "NIP contains characters that are not digits"
  }
  |
  {
    name: "NipCalculatedControlDigitCannotBeTen"
    message: "Control digit calculated for NIP cannot equal 10"
  }
  |
  {
    name: "NipControlDigitMismatch",
    message: "Received NIP control digit does not match calculated control digit"
    meta: {
      expected_control_digit: number
      received_control_digit: number
      control_digit_index: typeof NIP_CONTROL_DIGIT_INDEX
    };
  }

type NipErrorName = NipError["name"];
