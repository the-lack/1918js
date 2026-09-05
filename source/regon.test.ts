import { expect } from "bun:test";
import {  scenario, given, when, then, and  } from "./lib/bdd-utility"
import { validateRegon } from "./regon";

// ── test data ────────────────────────────────────────────────────────────────
const example_regon = {
  of_length_9_thats_valid: "630303023",
  of_length_14_thats_valid: "12345678512347",

  of_length_9_thats_invalid_cuz_has_wrong_control_digit: "630303021",
  of_length_14_thats_invalid_cuz_has_wrong_first_control_digit: "12345678812343",
  of_length_14_thats_invalid_cuz_has_wrong_second_control_digit: "12345678512346",

  of_length_9_thats_valid_where_control_digit_is_0: "123457780",
  of_length_14_thats_valid_where_control_digit_is_0: "12345678542340",

  of_length_9_thats_invalid_cuz_control_digit_should_be_0_yet_is_not: "123457781",
  of_length_14_thats_invalid_cuz_control_digit_should_be_0_yet_is_not: "12345678542341",

  of_length_9_thats_completely_zeroed_out: "0".repeat(9),
  of_length_14_thats_completely_zeroed_out: "0".repeat(14),

  set_of_non_string_values: [undefined, 80082, 67, {}],

  set_of_invalid_length_values: [0, 9 - 1, 9 + 1, 14 - 1, 14 + 1]
    .map(length => ({ length, value: " ".repeat(length) })),

  get set_of_9_length_values_with_non_numeric_characters() {
    return set_of_tampered_regons_with_non_digit_characters(this.of_length_9_thats_valid)
  },

  get set_of_14_length_values_with_non_numeric_characters() {
    return set_of_tampered_regons_with_non_digit_characters(this.of_length_14_thats_valid)
  },

  get set_of_9_length_invalid_regons_with_invalid_control_digit() {
    return create_set_of_all_possible_invalid_control_digit_variations(example_regon.of_length_9_thats_valid, "first_control_digit")
  },

  get set_of_14_length_invalid_regons_with_invalid_first_control_digit() {
    return create_set_of_all_possible_invalid_control_digit_variations(example_regon.of_length_14_thats_valid, "first_control_digit")
  },

  get set_of_14_length_invalid_regons_with_invalid_second_control_digit() {
    return create_set_of_all_possible_invalid_control_digit_variations(example_regon.of_length_14_thats_valid, "second_control_digit")
  },

  get set_of_9_length_regons_with_one_digit_tampered () {
    return set_of_regons_with_one_digit_tampered(this.of_length_9_thats_valid)
   },

  get set_of_14_length_regons_with_one_digit_tampered () {
    return set_of_regons_with_one_digit_tampered(this.of_length_14_thats_valid)
  }
} as const


// ── test suite ───────────────────────────────────────────────────────────────
scenario `rejecting invalid type`
  (
    given `non-string value`.
      such_as
      (
        _ => example_regon.set_of_non_string_values
      ),

    when `validated`
      (
        test => validateRegon(test.input)
      ),

    then `regon is rejected`
      (
        test => expect(test.result.ok).toBe(false)
      ),

    and `the reason is invalid type (not string)`
      (
        test => expect(test.result.error).toStrictEqual({
          name: "RegonIsNotString",
          message: "REGON is not of type `string`",
          meta: {
            expectedType: "string",
            receivedType: typeof test.input
          }
        })
      )
  )

scenario `rejecting for invalid length`
  (
    given `input of length $length`
      .such_as
      (
        _ => example_regon.set_of_invalid_length_values
      ),

    when `input is validated`
      (
        test => validateRegon(test.input.value)
      ),

    then `input is rejected for invalid length`
      (
        test => expect(test.result).toStrictEqual(invalid_length_error(test.input.value))
      )
  )

scenario `rejecting for non-digit characters`
  (
    given `non-numeric input`
      .such_as
      (
        _ => [
          ...example_regon.set_of_9_length_values_with_non_numeric_characters,
          ...example_regon.set_of_14_length_values_with_non_numeric_characters
        ]
      ),

    when `input validated`
      (
        test => validateRegon(test.input)
      ),

    then `input is rejected for having non-digit characters`
      (
        test => expect(test.result).toStrictEqual({ ok: false, error: invalid_characters_error() })
      )
  )

scenario `rejecting regon with invalid control digit`
  (
    given `regon with invalid control digit: %s`
      .such_as
      (
        _ => [
          example_regon.of_length_9_thats_invalid_cuz_has_wrong_control_digit,
          example_regon.of_length_9_thats_invalid_cuz_control_digit_should_be_0_yet_is_not,
          example_regon.of_length_14_thats_invalid_cuz_has_wrong_second_control_digit,
          example_regon.of_length_14_thats_invalid_cuz_has_wrong_first_control_digit,
          example_regon.of_length_14_thats_invalid_cuz_control_digit_should_be_0_yet_is_not
        ]
      ),

    when `regon is validated`
      (
        test => validateRegon(test.input)
      ),

    then `regon is rejected for invalid control digit`
      (
        test =>
          expect(test.result).toMatchObject({
            ok: false,
            error: {
              name: invalid_control_digit_error().name,
              message: invalid_control_digit_error().message
            }
          })
      )
  )

scenario `rejecting regon containing only 0s`
  (
    given `regon full of zeros`.
      such_as
      (
        _ => [
          example_regon.of_length_9_thats_completely_zeroed_out,
          example_regon.of_length_14_thats_completely_zeroed_out
        ]
      ),

    when `regon is validated`
      (
        test => validateRegon(test.input)
      ),

    then `regon is rejected`
      (
        test => expect(test.result.ok).toBe(false)
      ),

    and `the reason is it containing only 0s`
      (
        test => expect(test.result.error).toStrictEqual(contains_only_zeros_error())
      )
  )

scenario `rejecting regon with any of the digits tampered`
  (
    given `tampered regon: %s`
      .such_as
      (
        _ => [
          ...example_regon.set_of_9_length_regons_with_one_digit_tampered,
          ...example_regon.set_of_14_length_regons_with_one_digit_tampered
        ]
      ),

    when `tampered regon is validated`
      (
        test => validateRegon(test.input)
      ),

    then `regon is rejected for having invalid control digit`
      (
        test =>
          expect(test.result).toMatchObject({
            ok: false,
            error: {
              name: invalid_control_digit_error().name,
              message: invalid_control_digit_error().message
            }
          })
      )
  )

scenario `valid regon rejected after tampering control digit`
  (
    given `regon with tampered control digit $tampered_regon`
      .such_as
      (
        _ => [
          ...example_regon.set_of_9_length_invalid_regons_with_invalid_control_digit,
          ...example_regon.set_of_14_length_invalid_regons_with_invalid_first_control_digit,
          ...example_regon.set_of_14_length_invalid_regons_with_invalid_second_control_digit
        ]
      ),

    when `regon validated`
      (
        test => validateRegon(test.input.tampered_regon)
      ),

    then `regon is rejected`
      (
        test => expect(test.result.ok).toBe(false)
      ),

    and `the reason is invalid control digit`
      (

        test => expect(test.result.error)
          .toMatchObject(invalid_control_digit_error({
            expectedControlDigit: test.input.original_control_digit,
            receivedControlDigit: test.input.tampered_control_digit,
            controlDigitIndex: test.input.tampered_digit_index,
          }))
      )
  )

scenario `accepting valid regon`
  (
    given `valid regon %s`
      .such_as
      (
        _ => [
          example_regon.of_length_9_thats_valid,
          example_regon.of_length_14_thats_valid,
          example_regon.of_length_9_thats_valid_where_control_digit_is_0,
          example_regon.of_length_14_thats_valid_where_control_digit_is_0
        ]
      ),

    when `input validated`
      (
        test => validateRegon(test.input)
      ),

    then `input is accepted`
      (
        test => expect(test.result.ok).toBe(true)
      ),

    and `returned value matches input`
      (
        test => expect(test.result.value).toBe(test.input)
      )
  )

// ── helpers ──────────────────────────────────────────────────────────────────
function set_of_tampered_regons_with_non_digit_characters(regon: string) {
  const non_digits = ["A", "X", "-", " "];

  return [...regon].flatMap((_, index) =>
    non_digits.map(non_digit => {
      const copy = [...regon];
      copy[index] = non_digit;

      return copy.join("");
    })
  );
}

function set_of_regons_with_one_digit_tampered(regon: string) {
  const increment_digit_with_wraparound = (digit: number) =>
    (digit + 1) % 10;

  const regon_arr = [...regon]
  return regon_arr.map((_, index) =>
    regon_arr.map((digit, i) =>
      i === index
        ? increment_digit_with_wraparound(Number(digit)).toString()
        : digit
    ).join("")
  );
}

function create_set_of_all_possible_invalid_control_digit_variations(regon: string, which_digit: "first_control_digit" | "second_control_digit") {
  const legal_control_digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);
  const first_control_digit_index = 9 - 1
  const second_control_digit_index = 14 - 1

  const digit_to_tamper = which_digit === "first_control_digit" ? first_control_digit_index : second_control_digit_index;

  const original_control_digit = regon[digit_to_tamper];
  const alternative_illegal_control_digits = legal_control_digits.filter(digit => digit !== original_control_digit)

  const illegal_alternative_regons = alternative_illegal_control_digits.map(invalid_control_digit => {
    const copy = [...regon];
    copy[digit_to_tamper] = invalid_control_digit;
    return {
      original_control_digit: Number(original_control_digit),
      tampered_control_digit: Number(invalid_control_digit),
      tampered_regon: copy.join(""),
      tampered_digit_index: digit_to_tamper
    }
  });

  return illegal_alternative_regons
}


function invalid_length_error(input: string) {
  return {
    ok: false,
    error: {
      name: "RegonInvalidLength",
      message: "REGON has invalid length",
      meta: {
        expectedLength: [9, 14],
        receivedLength: input.length
      }
    }
  } as const;
}

function invalid_characters_error() {
  return {
    name: "RegonContainsNonDigits",
    message: "REGON contains characters that are not digits",
  } as const
}

function invalid_control_digit_error(opts?: { expectedControlDigit: number, receivedControlDigit: number, controlDigitIndex: number }) {
  return {
    name: "RegonControlDigitMismatch",
    message: "Received REGON control digit does not match calculated control digit",
    ...(opts ? { meta: opts } : {})
  }
}

function contains_only_zeros_error() {
  return {
    name: "RegonContainsOnlyZeros",
    message: "Received REGON contains only digits equal to zero 0",
  } as const
}

