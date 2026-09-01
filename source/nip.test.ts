import { expect, describe as suite } from "bun:test";
import fc from 'fast-check';
import { $ } from "./lib/bdd-utility"
import { validate_nip } from "./nip";
import { get_fc_string_with_at_least_one_non_digit } from "./lib/fc-utilities";

const { scenario: scenario, given, when, then } = $

/* -------------------------------------------------------------------------- */
/*                               Test Suite                                   */
/* -------------------------------------------------------------------------- */

const nips = {
  valid_examples: () => ["7791011327", "7811897358", "5252546391"] as const,
}

// ──── Test suite for shared kernel of functional and value object implementations ────
suite("parse_nip", () => {
  scenario `rejecting non-string value`
    (
      given `non-string nip value`.
        such_as
        (
          _ => [undefined, 80082, 67, {}] as unknown[]
        ),

      when `validated`
        (
          test => validate_nip(test.input)
        ),

      then `nip is rejected for being non-string`
        (
          test => expect(test.result).toStrictEqual({
            ok: false,
            error: {
              name: "NipIsNotString",
              message: "NIP is not of type `string`",
              meta: {
                expected_type: "string",
                received_type: typeof test.input
              }
            }
          })
        )
    )

  scenario `too long input`
    (
      given `string of length > 10`
        .from_fc
        (
          _ => fc.string({ minLength: 10 + 1 })
        ),

       when `string is parsed as nip`
       (
         test => validate_nip(test.input)
       ),
       
      then `string is rejected for being too long`
      (
        test => expect(test.result).
          toStrictEqual({
              ok: false,
              error: {
                name: "NipInvalidLength",
                message: "NIP has invalid length",
                meta: {
                  expected_length: 10,
                  received_length: test.input.length
                }
              }
         })          
      )
    )    
        
  scenario `too short input`
  (
    given `nip number of length < 10`.from_fc
    (
      _ =>  fc.string({ maxLength: 10 - 1 })
    ),

    when `nip is parsed`
    (
      test => validate_nip(test.input)
    ),

    then `nip is rejected`
    (
      test => expect(test.result).toStrictEqual({
        ok: false,
        error: {
          name: "NipInvalidLength",
          message: "NIP has invalid length",
          meta: {
            expected_length: 10,
            received_length: test.input.length
          }
        }
      })       
    )
  )


  scenario `rejecting nip containing only 0s`
  (
    given `nip full of zeros`
      (
        _ => "0".repeat(10)
      ),

    when `nip is validated`
      (
        ({ input }) => validate_nip(input)
      ),

    then `nip is rejected for containing only 0s`
      (
        ({ result }) => {
          expect(result.ok).toBe(false)
          expect(result.error).toStrictEqual({
              name: "NipContainsOnlyZeros",
              message: "Received NIP contains only digits equal to zero 0",              
          })
        }
      )
  )    

  scenario `non-numeric input with proper length`
  (
      given `non-numeric input`.
      from_fc
      (
       _ => get_fc_string_with_at_least_one_non_digit()
          .filter(value => value.length === 10)
      ),

      when `input is parsed`
      (
        test => validate_nip(test.input)
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

  scenario `nips with mismatched control digit`
  (
    given `nip with invalid control digit`
    .such_as
      (
      _ => nips.valid_examples().map(tamper_nip_control_digit)
      ),

      when `nip is parsed`
      (
         test => validate_nip(test.input.tampered)
      ),
      then `nip is rejected`
      (
       test => expect(test.result).toStrictEqual({
        ok: false,
        error: {
          name: "NipControlDigitMismatch",
          message: "Received NIP control digit does not match calculated control digit",
          meta: {
            control_digit_index: 9,
            expected_control_digit: test.input.original_control_digit,
            received_control_digit: test.input.received_control_digit,
          }
        }
      })         
      )
  )


  scenario `rejecting nips where calculated control digit equals 10`
  (
    given `nip where calculated control digit is equal to 10`
      (
        _ => "9000000000"          
      ),

    when `nip is parsed`
      (
        test => validate_nip(test.input)
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

  scenario `accepting valid nips`
  (
    given `valid nip (%s)`
    .such_as
    (
      _ => [...nips.valid_examples()]
    ),

    when `nip is parsed`
    (
      test => validate_nip(test.input)
    ),

    then `nip is accepted`
    (
      test => expect(test.result).toStrictEqual({
        ok: true,
        value: test.input
      })
    )
  ) 
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

