import { err, ok } from "./lib/result";

export { validate_regon, Regon }

// ── functional implementation ────────────────────────────────────────────────
const REGON9_WEIGHTS: readonly number[]  =  [8, 9, 2, 3, 4, 5, 6, 7] as const;
const REGON14_WEIGHTS: readonly number[] = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8] as const;
const REGON_VALID_LENGTHS: readonly number[] = [9, 14];
const REGON_ALLOWED_CHARACTERS: readonly string[] =
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function validate_regon(regon_candidate: unknown) {
  if(typeof regon_candidate !== "string")
    return err(invalid_type(regon_candidate))
  
  if(!has_valid_length(regon_candidate))
    return err(invalid_length(regon_candidate))

  if (!has_only_digits(regon_candidate))
    return err(invalid_characters())
  
  if (has_only_zeros(regon_candidate))
    return err(contains_only_zeros())

  // always verify first control digit (always treating regon as if it was of length 9)
  const regon_of_length_9_representation = regon_candidate.substring(0, 9)
  const digits = derive_regon_control_digits(regon_of_length_9_representation, REGON9_WEIGHTS)

  if (digits.received_control_digit !== digits.calculated_control_digit)
    return err(control_digit_mismatch({...digits, index: regon_of_length_9_representation.length - 1 }))

  // optionally, if length is 14, verify second control digit too
  if(regon_candidate.length === 14)  {
    const digits_for_regon14 = derive_regon_control_digits(regon_candidate, REGON14_WEIGHTS)

    if (digits_for_regon14.received_control_digit !== digits_for_regon14.calculated_control_digit)
      return err(control_digit_mismatch({...digits_for_regon14, index: regon_candidate.length - 1 }))
  }

  return ok(regon_candidate)
}

// ── nominal value-object shell ───────────────────────────────────────────────
class Regon {
  #value: string;

  private constructor(regon: string) {
    this.#value = regon;
  }

  static try_parse(regon_candidate: unknown) {
    const result = validate_regon(regon_candidate)

    if (!result.ok) return result;

    return ok(new Regon(result.value))
  }

  as_string(): string {
    return this.#value;
  }

  equals(other: unknown): other is Regon {
    if (!(other instanceof Regon)) return false;

    return this.#value === other.#value;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function derive_regon_control_digits(regon: string, weights: readonly number[]) {
    let weighted_sum = 0;
    weights.forEach((weight, index) => {
      const regon_number = Number(regon[index]);
      weighted_sum += weight * regon_number;
    })
    
    const received_control_digit = Number(regon[regon.length - 1]);
    const calculated_control_digit = weighted_sum % 11 === 10 ? 0 : weighted_sum % 11

    return { received_control_digit, calculated_control_digit }
}


function has_only_digits(regon_candidate: string) {
  for (const character of regon_candidate) {
    if (!REGON_ALLOWED_CHARACTERS.includes(character))
      return false;
  }

  return true
}

function has_only_zeros(regon_candidate: string) {
  for (const character of regon_candidate) {
      if(character !== "0") return false
  }

  return true
}

function has_valid_length(regon_candidate: string) {
  return REGON_VALID_LENGTHS.includes(regon_candidate.length)
}

// ── errors  ──────────────────────────────────────────────────────────────────
function invalid_type(regon_candidate: unknown) {
  return {
      name: "RegonIsNotString",
      message: "REGON is not of type `string`",
      meta: {
        expected_type: "string",
        received_type: typeof regon_candidate
      }
    } as const
}

function invalid_length(regon: string) {
  return {
    name: "RegonInvalidLength",
    message: "REGON has invalid length",
    meta: {
      expected_length: REGON_VALID_LENGTHS,
      received_length: regon.length
    }
  } as const
}

function invalid_characters() {
  return {
    name: "RegonContainsNonDigits",
    message: "REGON contains characters that are not digits",
  } as const
}

function contains_only_zeros() {
  return {
    name: "RegonContainsOnlyZeros",
    message: "Received REGON contains only digits equal to zero 0",
  } as const
}

function control_digit_mismatch(control_digits: { calculated_control_digit: number; received_control_digit: number, index: number },) {
  return {
    name: "RegonControlDigitMismatch",
    message: "Received REGON control digit does not match calculated control digit",
    meta: {
      expected_control_digit: control_digits.calculated_control_digit,
      received_control_digit: control_digits.received_control_digit,
      control_digit_index: control_digits.index,
    }
  } as const
}
