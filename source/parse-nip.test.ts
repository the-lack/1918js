import { expect, suite } from "vitest";
import { fc } from '@fast-check/vitest';
import { NipErrorCode, NipValidationResult, tryParseNip as parse_nip } from "./parse-nip";
import { scenario } from "./lib/test-scenario-utility";

/* -------------------------------------------------------------------------- */
/*                               Test Suite                                   */
/* -------------------------------------------------------------------------- */

const nips = {
  valid_examples: () => ["7791011327", "7811897358", "5252546391"],
}

suite("parse_nip", () => {

  scenario("rejecting too long nip")
    .fc()
    .given("nip number of length > 10", () => get_fc_numeric_string({
      min_length: 10 + 1,
    }))
    .when("nip is parsed", parse_nip)
    .then("nip is rejected", (result, input) =>
      expect(result).toStrictEqual<NipValidationResult>({
        success: false,
        errorCode: "NIP_INVALID_LENGTH",
        meta: {
          expectedLength: 10,
          receivedLength: input.length
        }
      })
    )

  scenario("rejecting too short nip")
    .fc()
    .given("nip number of length < 10", () => get_fc_numeric_string({
      max_length: 10 - 1,
    }))
    .when("nip is parsed", parse_nip)
    .then("nip is rejected", (result, input) =>
      expect(result).toStrictEqual<NipValidationResult>({
        success: false,
        errorCode: "NIP_INVALID_LENGTH",
        meta:
        {
          expectedLength: 10,
          receivedLength: input.length
        }
      })
    )

  scenario("not rejecting valid length nip")
    .fc()
    .given("nip number of length = 10", () => get_fc_numeric_string({
      min_length: 10, max_length: 10,
    }))
    .when("nip is parsed", parse_nip)
    .then("nip is not rejected for invalid length", (result) =>
      expect(result?.errorCode).not.toEqual<NipErrorCode>("NIP_INVALID_LENGTH")
    )

  scenario("rejecting non-numeric nip")
    .fc()
    .given("non-numeric nip", () =>
      get_fc_string_with_at_least_one_non_digit()
        .filter(value => value.length === 10))
    .when("nip is parsed", parse_nip)
    .then("nip is rejected for containing non-digits", (result) =>
      expect(result).toStrictEqual<NipValidationResult>({
        success: false,
        errorCode: "NIP_CONTAINS_NON_DIGITS",
      })
    )

  scenario("not rejecting numeric nip")
    .fc()
    .given("numeric nip", () => get_fc_numeric_string({ min_length: 10, max_length: 10 }))
    .when("nip is parsed", parse_nip)
    .then("nip is not rejected for containing non-digits", (result) =>
      expect(result).not.toStrictEqual<NipValidationResult>({
        success: false,
        errorCode: "NIP_CONTAINS_NON_DIGITS",
      })
    )

  scenario("rejecting nips with invalid checksum")
    .for_values(nips.valid_examples())
    .given("nip with invalid checksum ($tampered)", (valid_nip) => tamper_nip_checksum(valid_nip))
    .when("nip is parsed", (transformed_nip) => parse_nip(transformed_nip.tampered))
    .then("nip is rejected", (result, input) => {
      expect(result).toStrictEqual<NipValidationResult>({
        success: false,
        errorCode: "NIP_INVALID_CHECKSUM",
        meta: {
          controlNumberIndex: 9,
          expectedControlNumber: input.originalControlNumber,
          receivedControlNumber: input.receivedControlNumber,
        }
      })
    })

  scenario("rejecting nips where calculated checksum equals 10")
    .given("nip with calculated checksum equal to 10", () => "9000000000")
    .when("nip is parsed", parse_nip)
    .then("nip is rejected", (result) => {
      expect(result).toStrictEqual<NipValidationResult>({
        success: false,
        errorCode: "NIP_CHECKSUM_CANNOT_BE_10",
      });
    });

  scenario("accepting valid nips")
    .for_values(nips.valid_examples())
    .given("valid nip (%s)", valid_nip => valid_nip)
    .when("nip is parsed", parse_nip)
    .then("nip is accepted", (result, input) => {
      expect(result).toStrictEqual<NipValidationResult>({
        success: true,
        value: input
      })
    })
})


/* -------------------------------------------------------------------------- */
/*                                  Helpers                                    */
/* -------------------------------------------------------------------------- */

function get_fc_numeric_string(options: { min_length?: number; max_length?: number; }) {
  return fc
    .array(fc.integer({ min: 0, max: 9 }), {
      minLength: options?.min_length,
      maxLength: options?.max_length,
    })
    .map(digits => digits.join(""));
}

function get_fc_string_with_at_least_one_non_digit() {
  return fc.stringMatching(/.*\D.*/);
}

function tamper_nip_checksum(nip: string) {
  const nip_array = [...nip];

  const originalControlNumber = Number(nip_array[9]);

  const receivedControlNumber =
    originalControlNumber === 9
      ? 8
      : originalControlNumber + 1;

  nip_array[9] = String(receivedControlNumber);

  return {
    original: nip,
    tampered: nip_array.join(""),
    originalControlNumber,
    receivedControlNumber,
  };
}


