import { expect } from "bun:test"
import { $ } from "./lib/bdd-utility"
import { validatePesel } from "./pesel.ts"
import fc from "fast-check";
import { get_fc_numeric_string, get_fc_string_with_at_least_one_non_digit } from "./lib/fc-utilities.ts";

const { scenario, given, when, then, and } = $

// ── Test data ────────────────────────────────────────────────────────────────
const example_pesel = {
  thats_valid1: "44051401458",
  thats_valid2: "98112868513",
  thats_valid3: "87121158173",

  thats_valid_and_contains_control_digit_equal_zero: "55030101230",

  thats_empty: "",

  thats_zeroed_out: "0".repeat(11),

  that_contains_invalid_control_number: {
     value: "44051401459",
     current_invalid_control_digit: 9,
     what_control_digit_should_be: 8
  },

  thats_blank: fc.nat({ max: 100 }).map(fc_length => " ".repeat(fc_length)),
  that_contains_at_least_one_non_digit: get_fc_string_with_at_least_one_non_digit({ exact_length: 11}),
  thats_has_invalid_length: fc.oneof(
          get_fc_numeric_string({ min_length: 11 + 1 }),
          get_fc_numeric_string({ max_length: 11 - 1 })
        ),
  thats_not_a_string: fc.anything().filter(element => typeof element !== "string")
} as const;

// ──── Test suite ─────────────────────────────────────────────────────────────
scenario `rejects empty input`
(
    given `empty input`
    (
      _ => example_pesel.thats_empty
    ),

    when `empty input validated`
    (
      test => validatePesel(test.input)
    ),

    then `input is rejected`
    (
      test => expect(test.result.ok).toBe(false)
    ),

    and `the error provides reason (invalid length), and metadata`
    (
      test => expect(test.result.error).toStrictEqual({
        name: "PeselHasInvalidLength",
        message: "PESEL has invalid length",
        meta: {
          expectedLength: 11,
          receivedLength: test.input.length
        }
      })
    ) 
)

scenario `rejects non-string input`
(
    given `non-string input`.
    from_fc
    (
      _ => example_pesel.thats_not_a_string
    ),

    when `non-string input is rejected`
    (
      test => validatePesel(test.input as any)
    ),

    then `input is rejected`
    (
      test => expect(test.result.ok).toBe(false)
    ),

    and `the error provides reason (invalid type) as well as metadata`
    (
      test => expect(test.result.error).toStrictEqual({
        name: "PeselIsNotString",
        message: "PESEL is not of type `string`",
        meta: {
          expectedType: "string",
          receivedType: typeof test.input
        }
      })
    )
)

scenario `rejects blank input`
(
    given `blank input`.
    from_fc
    (
      _ => example_pesel.thats_blank
    ),

    when `blank input is validated`
    (
      test => validatePesel(test.input)
    ),

    then `input is rejected`
    (
      test => expect(test.result.ok).toBe(false)
    )
)

scenario `rejecting pesel containing only 0s`
(
  given `pesel full of zeros`
    (
      _ => example_pesel.thats_zeroed_out
    ),

  when `pesel is validated`
    (
      ({ input }) => validatePesel(input)
    ),

  then `pesel is rejected for containing only 0s`
    (
      ({ result }) => {
        expect(result.ok).toBe(false)
        expect(result.error).toStrictEqual({
            name: "PeselContainsOnlyZeros",
            message: "Received PESEL contains only digits equal to zero 0",              
        })
      }
    )
)

scenario `rejects non-numeric input`
(
    given `non-numeric input`.
    from_fc
    (
      _ => example_pesel.that_contains_at_least_one_non_digit
    ),

    when `non-numeric input is validated`
    (
      test => validatePesel(test.input)
    ),

    then `input is rejected`
    (
      test => expect(test.result.ok).toBe(false)
    ),

    and `the reason is containing non-numeric characters`
    (
      test => expect(test.result.error).toStrictEqual({
        name: "PeselContainsNonDigitCharacters",
        message: "PESEL contains non-numeric characters"
      })
    )
)


scenario `rejects numeric input of invalid length`
(
    given `numeric input but of invalid length`.
    from_fc
    (
      _ => example_pesel.thats_has_invalid_length
    ),

    when `validation occurs`
    (
      test => validatePesel(test.input)
    ),

    then `input is rejected`
    (
      test => expect(test.result.ok).toBe(false)
    )
)

scenario `rejecting pesel with invalid control number`
(
    given `pesel with invalid control number`
    (
      _ => example_pesel.that_contains_invalid_control_number
    ),

    when `validation occurs`
    (
      test => validatePesel(test.input.value)
    ),

    then `input is rejected`
    (
      test => expect(test.result.ok).toBe(false)
    ),

    and `the error provides reason (control digit mismatch) and metadata`
    (
      test => expect(test.result.error).toStrictEqual({
        name: "PeselControlDigitMismatch",
        message: "Calculated control digit does not match one contained in the PESEL",
        meta: {
          receivedControlDigit: test.input.current_invalid_control_digit,
          expectedControlDigit: test.input.what_control_digit_should_be,
          controlDigitIndex: 11 - 1,
        }
      })
    )
  )

scenario `accepts valid pesel`
(
    given `valid pesel`.
    such_as
    (
      _ => [example_pesel.thats_valid1, example_pesel.thats_valid2, example_pesel.thats_valid3]
    ),

    when `valid pesel is validated`
    (
      test => validatePesel(test.input)
    ),

    then `input is accepted`
    (
      test => expect(test.result.ok).toBe(true)
    ),

    and `returns value that matches the input`
    (
      test => expect(test.input).toEqual(test.result?.value as any)
    )
)

scenario `accepts valid pesel with control digit equal zero`
(
    given `valid pesel`
    (
      _ => example_pesel.thats_valid_and_contains_control_digit_equal_zero
    ),

    when `valid pesel is validated`
    (
      test => validatePesel(test.input)
    ),

    then `input is accepted`
    (
      test => expect(test.result.ok).toBe(true)
    ),

    and `returns value that matches the original input`
    (
      test => expect(test.result.value).toEqual(test.input)
    )   
)
