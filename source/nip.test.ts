import { expect, describe as suite } from "bun:test";
import fc from 'fast-check';
import { type NipErrorName, validate_nip } from "./nip";
import { scenario } from "./lib/test-scenario-utility";
import { get_fc_numeric_string, get_fc_string_with_at_least_one_non_digit } from "./lib/fc-utilities";

/* -------------------------------------------------------------------------- */
/*                               Test Suite                                   */
/* -------------------------------------------------------------------------- */

const nips = {
  valid_examples: () => ["7791011327", "7811897358", "5252546391"],
}

type NipValidationResult = ReturnType<typeof validate_nip>

suite("parse_nip", () => {

  scenario("too long input")
    .fc()
    .given("string of length > 10", () => fc.string({ minLength: 10 + 1 }))
    .when("string is parsed as nip", validate_nip)
    .then("string is rejected for being too long", (result, input) =>
      expect(result).toStrictEqual<NipValidationResult>({
        ok: false,
        error: {
          name: "NipInvalidLength",
          message: "NIP has invalid length",
          meta: {
            expected_length: 10,
            received_length: input.length
          }
        }
      })
    )

  scenario("too short input")
    .fc()
    .given("nip number of length < 10", () => fc.string({ maxLength: 10 - 1 }))
    .when("nip is parsed", validate_nip)
    .then("nip is rejected", (result, input) =>
      expect(result).toStrictEqual<NipValidationResult>({
        ok: false,
        error: {
          name: "NipInvalidLength",
          message: "NIP has invalid length",
          meta: {
            expected_length: 10,
            received_length: input.length
          }
        }
      })
    )

  scenario("perfect length input")
    .fc()
    .given("number of length = 10", () => fc.string({ minLength: 10, maxLength: 10 }))
    .when("number is parsed", validate_nip)
    .then("number is not rejected for invalid length", (result) => {
      expect(result?.error?.name).not.toBe<NipErrorName>("NipInvalidLength")
    })

  scenario("non-numeric input with proper length")
    .fc()
    .given("non-numeric input", () =>
      get_fc_string_with_at_least_one_non_digit()
        .filter(value => value.length === 10))
    .when("input is parsed", validate_nip)
    .then("input is rejected for containing non-digits", (result) =>
      expect(result).toStrictEqual<NipValidationResult>({
        ok: false,
        error: {
          name: "NipContainsNonDigits",
          message: "NIP contains characters that are not digits"
        }
      })
    )

  scenario("digit-only input with proper length")
    .fc()
    .given("digit-only input", () => get_fc_numeric_string({ min_length: 10, max_length: 10 }))
    .when("input is parsed", validate_nip)
    .then("is not rejected for containing non-digits", (result) =>
      expect(result).not.toStrictEqual<NipValidationResult>({
        ok: false,
        error: {
          name: "NipContainsNonDigits",
          message: "NIP contains characters that are not digits"
        }
      })
    )

  scenario("nips with mismatched control digit")
    .for_values(nips.valid_examples())
    .given("nip with invalid control digit ($tampered)", (valid_nip) => tamper_nip_control_digit(valid_nip))
    .when("nip is parsed", (transformed_nip) => validate_nip(transformed_nip.tampered))
    .then("nip is rejected", (result, input) => {
      expect(result).toStrictEqual<NipValidationResult>({
        ok: false,
        error: {
          name: "NipControlDigitMismatch",
          message: "Received NIP control digit does not match calculated control digit",
          meta: {
            control_digit_index: 9,
            expected_control_digit: input.original_control_digit,
            received_control_digit: input.received_control_digit,
          }
        }
      })
    })

  scenario("rejecting nips where calculated control digit equals 10")
    .given("nip where calculated control digit is equal to 10", () => "9000000000")
    .when("nip is parsed", validate_nip)
    .then("nip is rejected for invalid control digit equal 10", (result) => {
      expect(result).toStrictEqual<NipValidationResult>({
        ok: false,
        error: {
          name: "NipCalculatedControlDigitCannotBeTen",
          message: "Control digit calculated for NIP cannot equal 10"
        }
      });
    });

  scenario("accepting valid nips")
    .for_values(nips.valid_examples())
    .given("valid nip (%s)", valid_nip => valid_nip)
    .when("nip is parsed", validate_nip)
    .then("nip is accepted", (result, input) => {
      expect(result).toStrictEqual<NipValidationResult>({
        ok: true,
        value: input
      })
    })
})


/* -------------------------------------------------------------------------- */
/*                                  Helpers                                    */
/* -------------------------------------------------------------------------- */

function tamper_nip_control_digit(nip: string) {
  const nip_array = [...nip];

  const original_control_digit = Number(nip_array[9]);

  const received_control_digit =
    original_control_digit === 9
      ? 8
      : original_control_digit + 1;

  nip_array[9] = String(received_control_digit);

  return {
    original: nip,
    tampered: nip_array.join(""),
    original_control_digit,
    received_control_digit,
  };
}

