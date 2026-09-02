import { expect } from "bun:test";
import fc from 'fast-check';
import { scenario, given, when, then, and } from "./lib/bdd-utility"
import { validateNip } from "./nip";
import { get_fc_string_with_at_least_one_non_digit } from "./lib/fc-utilities";

// ── test data ────────────────────────────────────────────────────────────────
const example_nip = {
  set_of_valid_examples: ["7791011327", "7811897358", "5252546391"],

  thats_has_length_above_10: fc.string({ minLength: 10 + 1 }),
  thats_has_length_below_10: fc.string({ maxLength: 10 - 1 }),
  thats_zeroed_out: "0".repeat(10),

  that_contains_at_least_one_non_numeric_character: get_fc_string_with_at_least_one_non_digit()
          .filter(value => value.length === 10),


  where_calculated_control_digit_equals_10: "9000000000",
  set_of_non_string_values: [undefined, 80082, 67, {}] as unknown[],

  get set_with_invalid_control_digits() {
    return this.set_of_valid_examples.map(tamper_nip_control_digit)
  } 
}

// ── test suite ───────────────────────────────────────────────────────────────
scenario `rejecting non-string value`
  (
    given `non-string nip value`.
      such_as
      (
        _ => example_nip.set_of_non_string_values
      ),

    when `validated`
      (
        test => validateNip(test.input)
      ),

    then `nip is rejected for being non-string`
      (
        test => expect(test.result.ok).toBe(false)
      ),

    and `the reason is invalid type (not string)`
      (
        test => expect(test.result.error).toStrictEqual({
          name: "NipIsNotString",
          message: "NIP is not of type `string`",
          meta: {
            expectedType: "string",
            receivedType: typeof test.input
          }
        })
      )
  )

scenario`rejecting input with length other than 10`
  (
    given `string of length > 10`
      .from_fc
      (
        _ => fc.oneof(example_nip.thats_has_length_above_10,
                      example_nip.thats_has_length_below_10)
      ),

    when `validated`
      (
        test => validateNip(test.input)
      ),

    then `input is rejected for being too long`
      (
        test => expect(test.result.ok).toBe(false)
      ),

    and `the reason is invalid length`
      (
        test => expect(test.result.error).
          toStrictEqual({
            name: "NipInvalidLength",
            message: "NIP has invalid length",
            meta: {
              expectedLength: 10,
              receivedLength: test.input.length
            }
          })
      )
  )

scenario`rejecting nip containing only 0s`
  (
    given `nip full of zeros`
      (
        _ => example_nip.thats_zeroed_out
      ),

    when `nip is validated`
      (
        test => validateNip(test.input)
      ),

    then `nip is rejected for containing only 0s`
      (
        test => {
          expect(test.result.ok).toBe(false)
          expect(test.result.error).toStrictEqual({
            name: "NipContainsOnlyZeros",
            message: "Received NIP contains only digits equal to zero 0",
          })
        }
      )
  )

scenario`non-numeric input with proper length`
  (
    given `non-numeric input`.
      from_fc
      (
        _ => example_nip.that_contains_at_least_one_non_numeric_character
      ),

    when `input is parsed`
      (
        test => validateNip(test.input)
      ),

    then `input is rejected for containing non-digits`
      (
        test => expect(test.result).toStrictEqual({
          ok: false,
          error: {
            name: "NipContainsNonDigits",
            message: "NIP contains characters that are not digits"
          }
        })
      )
  )

scenario`nips with mismatched control digit`
  (
    given `nip with invalid control digit`
      .such_as
      (
        _ => example_nip.set_with_invalid_control_digits
      ),

    when `nip is parsed`
      (
        test => validateNip(test.input.tampered)
      ),

    then `nip is rejected`
      (
        test => expect(test.result.ok).toBe(false)
      ),

    and `the reason is invalid control_digit`
    (
        test => expect(test.result.error).toStrictEqual({
            name: "NipControlDigitMismatch",
            message: "Received NIP control digit does not match calculated control digit",
            meta: {
              controlDigitIndex: 9,
              expectedControlDigit: test.input.original_control_digit,
              receivedControlDigit: test.input.received_control_digit,
          }
        })
    )
      
  )


scenario`rejecting nips where calculated control digit equals 10`
  (
    given `nip where calculated control digit is equal to 10`
      (
        _ => example_nip.where_calculated_control_digit_equals_10
      ),

    when `nip is parsed`
      (
        test => validateNip(test.input)
      ),

    then `nip is rejected for invalid control digit equal 10`
      (
        test => expect(test.result).toStrictEqual({
          ok: false,
          error: {
            name: "NipCalculatedControlDigitCannotBeTen",
            message: "Control digit calculated for NIP cannot equal 10"
          }
        })
      )
  )

scenario`accepting valid nips`
  (
    given `valid nip (%s)`
      .such_as
      (
        _ => example_nip.set_of_valid_examples
      ),

    when `nip is parsed`
      (
        test => validateNip(test.input)
      ),

    then `nip is accepted`
      (
        test => expect(test.result.ok).toBe(true)
      ),

    and `return value matches input`
    (
        test => expect(test.result.value).toEqual(test.input)
    )
  )

// ── helpers ──────────────────────────────────────────────────────────────────
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

