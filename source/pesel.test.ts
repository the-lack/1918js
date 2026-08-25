import { expect } from "bun:test"
import { $ } from "./lib/bdd-utility"
import { Pesel, validate_pesel } from "./pesel.ts"
import fc from "fast-check";
import { get_fc_numeric_string, get_fc_string_with_at_least_one_non_digit } from "./lib/fc-utilities.ts";

const { scenario, given, when, then, and } = $

// ── Test data ─────────────────────────────────────────────────────
const example = {
  thats_valid1: "44051401458",
  thats_valid2: "98112868513",
  thats_valid3: "87121158173",

  thats_valid_and_contains_control_digit_equal_zero: "55030101230",

  thats_empty: "",

  that_contains_invalid_control_number: {
     value: "44051401459",
     invalid_current_control_digit: "9",
     what_control_digit_should_be: "8"
  },

  thats_blank: fc.nat({ max: 100 }).map(fc_length => " ".repeat(fc_length)),
  that_contains_at_least_one_non_digit: get_fc_string_with_at_least_one_non_digit({ exact_length: 11}),
  thats_has_invalid_length: fc.oneof(
          get_fc_numeric_string({ min_length: 11 + 1 }),
          get_fc_numeric_string({ max_length: 11 - 1 })
        ),
  thats_not_a_string: fc.anything().filter(element => typeof element !== "string")
} as const;

const pesel_validation_implementations = [Pesel.try_parse, validate_pesel]

// ──── Test suite for shared kernel of functional and value object implementations ────
for(const validate_pesel of pesel_validation_implementations)  {
    scenario `rejects empty input`
    (
        given `empty input`
        (
          _ => example.thats_empty
        ),

        when `empty input validated`
        (
          test => validate_pesel(test.input)
        ),
    
        then `input is rejected`
        (
          test => expect(test.result.ok).toBe(false)
        ),

        and `the reason provided in the error is invalid length`
        (
          test => expect(test.result.error).toStrictEqual({
            name: "PeselHasInvalidLength",
            message: "PESEL has invalid length"
          })
        )  
    )


    scenario `rejects non-string input`
    (
        given `non-string input`.
        from_fc
        (
          _ => example.thats_not_a_string
        ),

        when `non-string input is rejected`
        (
          test => validate_pesel(test.input as any)
        ),
    
        then `input is rejected`
        (
          test => expect(test.result.ok).toBe(false)
        ),

        and `the reason is invalid type`
        (
          test => expect(test.result.error).toStrictEqual({
            name: "PeselIsNotString",
            message: "PESEL is not of type `string`"
          })
        )
    )

    scenario `rejects blank input`
    (
        given `blank input`.
        from_fc
        (
          _ => example.thats_blank
        ),

        when `blank input is validated`
        (
          test => validate_pesel(test.input)
        ),
    
        then `input is rejected`
        (
          test => expect(test.result.ok).toBe(false)
        )
    )


    scenario `rejects non-numeric input`
    (
        given `non-numeric input`.
        from_fc
        (
          _ => example.that_contains_at_least_one_non_digit
        ),

        when `non-numeric input is validated`
        (
          test => validate_pesel(test.input)
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
          _ => example.thats_has_invalid_length
        ),

        when `validation occurs`
        (
          test => validate_pesel(test.input)
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
          _ => example.that_contains_invalid_control_number.value
        ),

        when `validation occurs`
        (
          test => validate_pesel(test.input)
        ),
    
        then `input is rejected`
        (
          test => expect(test.result.ok).toBe(false)
        ),
    
        and `the reason is control digit mismatch`
        (
          test => expect(test.result.error).toStrictEqual({
            name: "PeselControlDigitMismatch",
            message: "Calculated control digit does not match one contained in the PESEL"
          })
        )
    )
}

// ──── Test suite for value object implementation ────

scenario `valid pesel comparison`
(
    given `valid pesel value`
    (
      _ => example.thats_valid1
    ),

    when `it's used for initializing 2 independent VOs`
    (
      test => ({
                pesel1: Pesel.try_parse(test.input),
                pesel2: Pesel.try_parse(test.input)
              })
    ),

    then `both VOs are valid`
    (
      test => {
                expect(test.result.pesel1.ok).toBe(true)
                expect(test.result.pesel2.ok).toBe(true)
              }
    ),

    and `both VOs contain same value`
    (
      test => expect(test.result.pesel1.value?.as_string()).
              toEqual(test.result.pesel2.value?.as_string())
    ),

    and `their 'equals' comparison says they contain same value`
    (
      test => expect(test.result.pesel1.value?.equals(test.result.pesel2.value)).
              toBe(true)
    )
    
)

scenario `valid pesel comparison`
(
    given `2 different valid pesel values`
    (
      _ => ({ value1: example.thats_valid1, value2: example.thats_valid2 })
    ),

    when `they are used for initializing 2 independent VOs`
    (
      test => ({
                pesel1: Pesel.try_parse(test.input.value1),
                pesel2: Pesel.try_parse(test.input.value2)
              })
    ),

    then `both VOs are valid`
    (
      test => {
                expect(test.result.pesel1.ok).toBe(true)
                expect(test.result.pesel2.ok).toBe(true)
              }
    ),

    and `both VOs contain different value`
    (
      test => expect(test.result.pesel1.value?.as_string()).
              not.
              toEqual(test.result.pesel2.value?.as_string())
    ),

    and `their 'equals' comparison says they do not contain same value`
    (
      test => expect(test.result.pesel1.value?.equals(test.result.pesel2.value))
              .not.
              toBe(true)
    )
)

scenario `accepts valid pesel`
(
    given `valid pesel`.
    such_as
    (
      _ => [example.thats_valid1, example.thats_valid2, example.thats_valid3]
    ),

    when `valid pesel is validated`
    (
      test => Pesel.try_parse(test.input)
    ),

    then `input is accepted`
    (
      test => expect(test.result.ok).toBe(true)
    ),

    and `return value object`
    (
      test => expect(test.result.value).toBeInstanceOf(Pesel)
    ),

    and `value object value contains original input`
    (
      test => expect(test.input as string).toEqual(test.result?.value!.as_string())
    )
)

scenario `accepts valid pesel with control digit equal zero`
(
    given `valid pesel`
    (
      _ => example.thats_valid_and_contains_control_digit_equal_zero
    ),

    when `valid pesel is validated`
    (
      test => Pesel.try_parse(test.input)
    ),

    then `input is accepted`
    (
      test => expect(test.result.ok).toBe(true)
    ),
   
    and `return value object`
    (
      test => expect(test.result.value).toBeInstanceOf(Pesel)
    ),

    and `value object value contains original input`
    (
      test => expect(test.input as string).toEqual(test.result?.value!.as_string())
    )
)

scenario `pesel is not equal to a non-pesel`
(
  given `a valid pesel`
  (
    _ => example.thats_valid1
  ),

  when `it's compared with a string`
  (
    test => ({
      pesel: Pesel.try_parse(test.input).value!,
      other: test.input
    })
  ),

  then `they are not equal`
  (
    test => expect(test.result.pesel.equals(test.result.other)).toBe(false)
  )
)

// ──── Test suite for functional implementation ────
scenario `accepts valid pesel`
(
    given `valid pesel`.
    such_as
    (
      _ => [example.thats_valid1, example.thats_valid2, example.thats_valid3]
    ),

    when `valid pesel is validated`
    (
      test => validate_pesel(test.input)
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
      _ => example.thats_valid_and_contains_control_digit_equal_zero
    ),

    when `valid pesel is validated`
    (
      test => validate_pesel(test.input)
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

