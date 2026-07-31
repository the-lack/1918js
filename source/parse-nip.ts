export const parseNip = try_parse_nip;


/* -------------------------------------------------------------------------- */
/*                                   Entry                                    */
/* -------------------------------------------------------------------------- */

/**
 * @summary
 * Parses and validates NIP - Polish Tax Identification Number (TIN)
 *
 * @param
 * {string} nip - 10-digit NIP
 *
 * @returns
 * `NipValidationResult` object indicating success or failure.
 *
 * @throws This function does not throw.
 *
 * @description
 * Performs the following validation checks:
 * - the input contains only digits
 * - the input length is exactly 10 characters
 * - the control digit matches the checksum computed from the first nine digits
 * - the computed checksum is not `10`
 *
 * @example
 * const result = parseNip("5260250995");
 * if (result.success) console.log(result.value);
 *
 * @see Standard documentation - https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-taxation/taxpayer-identification-number-tin_en#general-overview
 *
 */
function try_parse_nip(nip: string): NipValidationResult {

  if (!has_valid_length(nip)) return error_invalid_length(nip);
  if (!has_only_digits(nip))  return error_non_digits();

  const checksums = calculate_nip_checksum(nip);

  if (checksums.expected === 10) return error_checksum_cannot_equal_10();
  if (checksums.received !== checksums.expected) return error_checksum_mismatch(checksums);

  return { success: true, value: nip };

}

/* -------------------------------------------------------------------------- */
/*                                 Validation                                 */
/* -------------------------------------------------------------------------- */

const NIP_CONTROL_NUMBER_INDEX = 9
const NIP_EXPECTED_LENGTH = 10

function has_only_digits(nip: string) {
  return /^\d+$/.test(nip);
}

function has_valid_length(nip: string) {
  return nip.length === NIP_EXPECTED_LENGTH
}

function calculate_nip_checksum(nip: string) {
  const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const NIP_MODULO = 11

  const digits = nip.split("").map(Number);
  const digits_except_checksum = digits.slice(0, NIP_CONTROL_NUMBER_INDEX);

  const sum = digits_except_checksum.reduce((acc, digit, index) => acc + digit * NIP_WEIGHTS[index], 0);

  const expected_checksum = sum % NIP_MODULO;
  const received_checksum = digits[NIP_CONTROL_NUMBER_INDEX];

  return {
    expected: expected_checksum,
    received: received_checksum,
  };

}

/* -------------------------------------------------------------------------- */
/*                                  Errors                                    */
/* -------------------------------------------------------------------------- */

function error_non_digits(): NipValidationResult {
  return { success: false, errorCode: "NIP_CONTAINS_NON_DIGITS" };
}

function error_invalid_length(nip: string): NipValidationResult {
  return {
    success: false,
    errorCode: "NIP_INVALID_LENGTH",
    meta: { expectedLength: NIP_EXPECTED_LENGTH, receivedLength: nip.length },
  };
}

function error_checksum_cannot_equal_10(): NipValidationResult {
  return { success: false, errorCode: "NIP_CHECKSUM_CANNOT_BE_10" };
}

function error_checksum_mismatch(checksums: { expected: number; received: number }): NipValidationResult {
  return {
    success: false,
    errorCode: "NIP_INVALID_CHECKSUM",
    meta: {
      controlNumberIndex: NIP_CONTROL_NUMBER_INDEX,
      expectedControlNumber: checksums.expected,
      receivedControlNumber: checksums.received,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

export type NipValidationResult =
  |
  {
    success: true
    value: string
    errorCode?: never
    meta?: never
  }
  |
  ({ success: false } & NipError)

export type NipError =
  |
  {
    errorCode: "NIP_INVALID_LENGTH"
    meta:
    {
      expectedLength: typeof NIP_EXPECTED_LENGTH
      receivedLength: number
    };
  }
  |
  {
    errorCode: "NIP_CONTAINS_NON_DIGITS"
  }
  |
  {
    errorCode: "NIP_CHECKSUM_CANNOT_BE_10"
  }
  |
  {
    errorCode: "NIP_INVALID_CHECKSUM"
    meta:
    {
      expectedControlNumber: number
      receivedControlNumber: number
      controlNumberIndex: typeof NIP_CONTROL_NUMBER_INDEX
    };
  };

export type NipErrorCode = NipError["errorCode"];


