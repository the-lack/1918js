import { err, ok, type Result } from "./lib/result"

/* -------------------------------------------------------------------------- */
/*                                    Entry                                   */
/* -------------------------------------------------------------------------- */

/**
 * @summary   Parses and validates NIP.
 * @param     {string} nip - 10-digit NIP
 * @returns   Result<string, NipError> object indicating success or failure.
 *
 * @throws    This function does not throw.
 *
 * @description
 * Performs, in order, following validation checks:
 * - the input length is exactly 10 characters
 * - the input contains only digits
 * - the control digit matches the checksum computed from the first nine digits
 * - the computed checksum is not `10`
 *
 * @example
 * const result = try_parse_Nip("5260250995");
 * if (result.ok) console.log(result.value);
 *
 * @see Standard documentation - https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-taxation/taxpayer-identification-number-tin_en#general-overview
 *
 */
export const tryParseNip = try_parse_nip;


/* -------------------------------------------------------------------------- */
/*                              Implementation                                */
/* -------------------------------------------------------------------------- */

function try_parse_nip(nip: string): Result<string, NipError> {

  if (!has_valid_length(nip)) return err(invalid_length(nip));
  if (!has_only_digits(nip)) return err(invalid_characters());

  const control_digits = derive_nip_control_digits(nip);

  if (control_digits.expected === 10) return err(invalid_control_digit());
  if (control_digits.received !== control_digits.expected) return err(control_digit_mismatch(control_digits));

  return ok(nip);

}

/* -------------------------------------------------------------------------- */
/*                                 Validation                                 */
/* -------------------------------------------------------------------------- */

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

  const sum = digits_except_checksum.reduce((acc, digit, index) => acc + digit * NIP_WEIGHTS[index], 0);

  const expected_checksum = sum % NIP_MODULO;
  const received_checksum = digits[NIP_CONTROL_DIGIT_INDEX];

  return {
    expected: expected_checksum,
    received: received_checksum,
  };

}

/* -------------------------------------------------------------------------- */
/*                                  Errors                                    */
/* -------------------------------------------------------------------------- */

function invalid_characters(): NipError {
  return {
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
  }
}

function invalid_length(nip: string): NipError {
  return {
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expectedLength: NIP_EXPECTED_LENGTH,
      receivedLength: nip.length
    }
  }
}

function invalid_control_digit(): NipError {
  return {
    name: "NipCalculatedControlDigitCannotBeTen",
    message: "Control digit calculated for NIP cannot equal 10"
  }
}

function control_digit_mismatch(control_digit: { expected: number; received: number }): NipError {
  return {
    name: "NipControlDigitMismatch",
    message: "Received NIP control digit does not match calculated control digit",
    meta:
    {
      expectedControlDigit: control_digit.expected,
      receivedControlDigit: control_digit.received,
      controlDigitIndex: NIP_CONTROL_DIGIT_INDEX,
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */


export type NipError =
  |
  {
    name: "NipInvalidLength"
    message: "NIP has invalid length"
    meta: {
      expectedLength: typeof NIP_EXPECTED_LENGTH
      receivedLength: number
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
      expectedControlDigit: number
      receivedControlDigit: number
      controlDigitIndex: typeof NIP_CONTROL_DIGIT_INDEX
    };
  }

export type NipErrorName = NipError["name"];
