import { expect } from "bun:test";
import { $ } from "./lib/bdd-utility"
import { validate_regon, Regon } from "./regon";
import { get_fc_numeric_string } from "./lib/fc-utilities";
import fc from "fast-check";

const { scenario, given, when, then, and } = $;

const valid_regon_9_length = "630303023"
const valid_regon_14_length = "12345678512347"

const invalid_regon9_with_wrong_control_digit         = "630303021"
const invalid_regon14_with_wrong_first_control_digit  = "12345678812343"
const invalid_regon14_with_wrong_second_control_digit = "12345678512346"

const valid_regon9_where_control_digit_is_0  = "123457780"
const valid_regon14_where_control_digit_is_0 = "12345678542340"

const invalid_regon9_where_control_digit_should_be_0_yet_is_not  = "123457781"
const invalid_regon14_where_control_digit_should_be_0_yet_is_not = "12345678542341"

const zeroed_out_regon_9  = "0".repeat(9)
const zeroed_out_regon_14 = "0".repeat(14)

const regon_validation_implementations = [Regon.try_parse, validate_regon]

for(const validate_regon of regon_validation_implementations) {

    scenario `rejecting non-string value`
      (
        given `non-string regon value`.
          such_as
          (
            _ => [undefined, 80082, 67, {}] as unknown[]
          ),

        when `validated`
          (
            test => validate_regon(test.input as any)
          ),

        then `regon is rejected for being non-string`
          (
            test => expect(test.result).toStrictEqual({
              ok: false,
              error: {
                name: "RegonIsNotString",
                message: "REGON is not of type `string`"
              }
            })
          )
      )
  
  scenario `rejecting for invalid length`
    (
      given `input of length $length`
        .such_as
        (
          _ => [0,
            9 - 1,
            9 + 1,
            14 - 1,
            14 + 1]
            .map(length => ({ length, value: " ".repeat(length) }))
        ),

      when `input is validated`
        (
          ({ input }) => validate_regon(input.value)
        ),

      then `input is rejected for invalid length`
        (
          ({ result, input }) => {
            expect(result)
              .toStrictEqual(invalid_length_error(input.value))
          }
        )
    )

  scenario `not rejecting input for invalid length`
    (
      given `input of length $length`
        .such_as
        (
          _ => [9, 14].map(length => ({ length, value: " ".repeat(length) }))
        ),

      when `input is validated`
        (
          ({ input })=> validate_regon(input.value)
        ),

      then `input is not rejected for invalid length`
        (
          ({ result, input }) => expect(result).not.toEqual(invalid_length_error(input.value))
        )
    )

  scenario `rejecting for non-digit characters`
    (
      given `non-numeric input`
        .such_as
        (
          _ => [
                ...set_of_regons_with_non_digit_tampered(valid_regon_9_length),
                ...set_of_regons_with_non_digit_tampered(valid_regon_14_length)
               ]
        ),

      when `input validated`
        (
          ({ input }) => validate_regon(input)
        ),

      then `input is rejected for having non-digit characters`
        (
          ({ result }) => {
            expect(result).toStrictEqual({
              ok: false,
              error: invalid_characters_error()
            })
          }
        )
    )

  scenario `not rejecting when containing only digits`
    (
      given `digit-only input`
        .from_fc
        (
          _ => fc.oneof(
            get_fc_numeric_string({ min_length: 9, max_length: 9 }),
            get_fc_numeric_string({ min_length: 14, max_length: 14 }))
        ),

      when `input validated`
        (
          ({ input }) => validate_regon(input)
        ),

      then `input is not rejected for having non-digit characters`
        (
          ({ result }) => {
            expect(result).not.toEqual({
              ok: false,
              error: invalid_characters_error()
            })
          }
        )
    )

  scenario `rejecting regon with invalid control digit`
    (
      given `regon with invalid control digit: %s`
        .such_as
        (
          _ => [invalid_regon9_with_wrong_control_digit, invalid_regon14_with_wrong_second_control_digit, invalid_regon14_with_wrong_first_control_digit, invalid_regon14_where_control_digit_should_be_0_yet_is_not, invalid_regon9_where_control_digit_should_be_0_yet_is_not]
        ),

      when `regon is validated`
        (
          ({ input }) => validate_regon(input)
        ),

      then `regon is rejected for invalid control digit`
        (
          ({ result }) =>
            expect(result).toMatchObject({
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
          _ => [zeroed_out_regon_9, zeroed_out_regon_14]
        ),

      when `regon is validated`
        (
          ({ input }) => validate_regon(input)
        ),

      then `regon is rejected for containing only 0s`
        (
          ({ result }) => {
            expect(result.ok).toBe(false)
            expect(result.error).toEqual(contains_only_zeros_error())
          }
        )
    )

  scenario `rejecting regon with any of the digits tampered`
    (
      given `tampered regon: %s`
        .such_as
        (
          _ => [
                ...set_of_regons_with_one_digit_tampered(valid_regon_9_length),
                ...set_of_regons_with_one_digit_tampered(valid_regon_14_length),
              ]
        ),

      when `tampered regon is validated`
        (
          ({ input }) => validate_regon(input)
        ),

      then `regon is rejected for having invalid control digit`
        (
          ({ result }) =>
            expect(result).toMatchObject({
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
                ...set_of_regons_with_control_digit_tampered(valid_regon_9_length, "first_control_digit"),
                ...set_of_regons_with_control_digit_tampered(valid_regon_14_length, "first_control_digit"),
                ...set_of_regons_with_control_digit_tampered(valid_regon_14_length, "second_control_digit") 
               ]
        ),

      when `tampered regon validated`
        (
          ({ input }) => validate_regon(input.tampered_regon)
        ),

      then `regon is rejected for invalid control digit`
        (
          ({ result, input }) => {
            expect(result.ok).toBe(false)
            expect(result.error).toMatchObject(invalid_control_digit_error({
              expected_control_digit: input.original_control_digit,
              received_control_digit: input.tampered_control_digit,
              control_digit_index: input.tampered_digit_index,
            }))
          }
        )
    )
}

scenario `accepting valid regon`
  (
    given `valid regon %s`
      .such_as
      (
        _ => [valid_regon_9_length, valid_regon_14_length, valid_regon9_where_control_digit_is_0, valid_regon14_where_control_digit_is_0]
      ),

    when `input validated`
      (
        ({ input }) => validate_regon(input)
      ),

    then `input is accepted`
      (
        ({ result, input }) => {
          expect(result.ok).toBe(true)
          expect(result.value).toBe(input)
        }
      )
  )

// vo validation
scenario `valid regon comparison`
(
    given `valid regon value`
    .such_as
    (
      _ => [valid_regon_9_length, valid_regon_14_length]
    ),

    when `it's used for initializing 2 independent VOs`
    (
      test => ({
                regon1: Regon.try_parse(test.input),
                regon2: Regon.try_parse(test.input)
              })
    ),

    then `both VOs are valid`
    (
      test => {
                expect(test.result.regon1.ok).toBe(true)
                expect(test.result.regon2.ok).toBe(true)
              }
    ),

    and `both VOs contain same value`
    (
      test => expect(test.result.regon1.value?.as_string()).
              toEqual(test.result.regon2.value?.as_string())
    ),

    and `their 'equals' comparison says they contain same value`
    (
      test => expect(test.result.regon1.value?.equals(test.result.regon2.value)).
              toBe(true)
    )
    
)

scenario `valid regon comparison`
(
    given `2 different valid regon values`.
    such_as
    (
      _ => [
        ({ value1: valid_regon_9_length, value2: valid_regon9_where_control_digit_is_0 }),
        ({ value1: valid_regon_14_length, value2: valid_regon14_where_control_digit_is_0 })
      ]
    ),

    when `they are used for initializing 2 independent VOs`
    (
      test => ({
                regon1: Regon.try_parse(test.input.value1),
                regon2: Regon.try_parse(test.input.value2)
              })
    ),

    then `both VOs are valid`
    (
      test => {
                expect(test.result.regon1.ok).toBe(true)
                expect(test.result.regon2.ok).toBe(true)
              }
    ),

    and `both VOs contain different value`
    (
      test => expect(test.result.regon1.value?.as_string()).
              not.
              toEqual(test.result.regon2.value?.as_string())
    ),

    and `their 'equals' comparison says they do not contain same value`
    (
      test => expect(test.result.regon1.value?.equals(test.result.regon2.value))
              .not.
              toBe(true)
    )
)

scenario `accepts valid regon`
(
    given `valid regon`.
    such_as
    (
      _ => [valid_regon_9_length]
    ),

    when `valid regon is validated`
    (
      test => Regon.try_parse(test.input)
    ),

    then `input is accepted`
    (
      test => expect(test.result.ok).toBe(true)
    ),

    and `return value object`
    (
      test => expect(test.result.value).toBeInstanceOf(Regon)
    ),

    and `value object value contains original input`
    (
      test => expect(test.input as string).toEqual(test.result?.value!.as_string())
    )
)


scenario `regon is not equal to a non-regon`
(
  given `a valid regon`
  (
    _ => valid_regon_9_length
  ),

  when `it's compared with a string`
  (
    test => ({
      regon: Regon.try_parse(test.input).value!,
      other: test.input
    })
  ),

  then `they are not equal`
  (
    test => expect(test.result.regon.equals(test.result.other)).toBe(false)
  )
)
  
function set_of_regons_with_non_digit_tampered(regon: string) {
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


function set_of_regons_with_control_digit_tampered(regon: string, which_digit: "first_control_digit" | "second_control_digit") {
  const legal_control_digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);
  const first_control_digit_position = 9 - 1
  const second_control_digit_position = 14 - 1

  const digit_to_tamper = which_digit === "first_control_digit" ? first_control_digit_position : second_control_digit_position;

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
        expected_length: [9, 14],
        received_length: input.length
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

function invalid_control_digit_error(opts?: { expected_control_digit: number, received_control_digit: number, control_digit_index: number }) {
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

