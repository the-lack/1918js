import { err, ok } from "./lib/result";

export { validate_pesel }

const ALLOWED_CHARACTERS: readonly string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const ALLOWED_LENGTH = 11
const PESEL_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1] as const;

function validate_pesel(pesel_candidate: string) {
  if (typeof pesel_candidate !== "string")
    return err({
      name: "PeselIsNotString",
      message: "PESEL is not of type `string`"
    } as const)

  if (pesel_candidate.length !== ALLOWED_LENGTH)
    return err({
      name: "PeselHasInvalidLength",
      message: "PESEL has invalid length"
    } as const)

  for (const character of pesel_candidate) {
    if (!ALLOWED_CHARACTERS.includes(character))
      return err({
        name: "PeselContainsNonDigitCharacters",
        message: "PESEL contains non-numeric characters"
      } as const)
  }

  const pesel_digits: number[] = pesel_candidate.split("").map(Number)
  const received_control_number = pesel_digits.pop()

  const weighted_sum = pesel_digits.reduce((accumulator, current_digit, index) => {
    return accumulator + (current_digit * PESEL_WEIGHTS[index]!)
  }, 0)

  const subtrahend = weighted_sum % 10;
  const calculated_control_number = subtrahend === 0 ? 0 : 10 - subtrahend;

  if (received_control_number !== calculated_control_number) {
    return err({
      name: "PeselControlDigitMismatch",
      message: "Calculated control digit does not match one contained in the PESEL"
    } as const)
  }

  return ok(pesel_candidate)
}

