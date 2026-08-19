import { err, ok, type Result } from "./lib/result";

export { validate_regon, Regon }

class Regon {
  #value: string;

  private constructor(regon: string) {
    this.#value = regon;
  }

  static try_parse(regon_candidate: string): Result<Regon, RegonError> {
    const result = validate_regon(regon_candidate)

    if (!result.ok) return result;
    else return ok(new Regon(result.value))
  }

  as_string(): string {
    return this.#value;
  }

  equals(other: unknown): other is Regon {
    if (this === other) return true;
    if (!(other instanceof Regon)) return false;

    return this.#value === other.#value;
  }
}




const validate_regon = (regon: string): { ok: true, value: string, error?: never } | Result<string, RegonError> => {
  if (regon.length === 9) {
    if (!(/^\d+$/.test(regon))) return err(invalid_characters())
    if (regon === "0".repeat(9)) return err(contains_only_zeros())

    const weights = [8, 9, 2, 3, 4, 5, 6, 7] as const;

    let received_control_number = Number(regon[regon.length - 1]);

    let weighted_sum = 0;
    weights.forEach((weight, index) => {
      const regon_number = Number(regon[index]);
      weighted_sum += weight * regon_number;
    })

    const calculated_control_number = weighted_sum % 11 === 10 ? 0 : weighted_sum % 11

    if (received_control_number !== calculated_control_number)
      return err(invalid_control_digit({ received: received_control_number, expected: calculated_control_number, index: regon.length - 1 }))


    return ok(regon)
  }

  if (regon.length === 14) {
    if (!(/^\d+$/.test(regon))) return err(invalid_characters())
    const weights = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8] as const;

    let received_control_number = Number(regon[regon.length - 1]);

    let weighted_sum = 0;
    weights.forEach((weight, index) => {
      const regon_number = Number(regon[index]);
      weighted_sum += weight * regon_number;
    })

    const calculated_control_number = weighted_sum % 11 === 10 ? 0 : weighted_sum % 11

    const regon14_as_regon9 = regon.substring(0, 9)

    const regon9_validation = validate_regon(regon14_as_regon9)

    if (!regon9_validation.ok) {
      return { ok: false, error: regon9_validation.error }
    }

    if (received_control_number !== calculated_control_number)
      return err(invalid_control_digit({ received: received_control_number, expected: calculated_control_number, index: regon.length - 1 }))

    return ok(regon)

  }

  return err(invalid_length(regon))
}

function invalid_length(regon: string) {
  return {
    name: "RegonInvalidLength",
    message: "REGON has invalid length",
    meta: {
      expected_length: [14, 9],
      received_length: regon.length
    }
  }
}

function invalid_characters() {
  return {
    name: "RegonContainsNonDigits",
    message: "REGON contains characters that are not digits",
  }
}

function contains_only_zeros() {
  return {
    name: "RegonContainsOnlyZeros",
    message: "Received REGON contains only digits equal to zero 0",
  }
}


function invalid_control_digit(control_digit: { expected: number; received: number, index: number },) {
  return {
    name: "RegonControlDigitMismatch",
    message: "Received REGON control digit does not match calculated control digit",
    meta: {
      expected_control_digit: control_digit.expected,
      received_control_digit: control_digit.received,
      control_digit_index: control_digit.index,
    }
  }
}


type RegonError = ReturnType<typeof invalid_length> | ReturnType<typeof invalid_characters> | ReturnType<typeof invalid_control_digit> | ReturnType<typeof contains_only_zeros>
