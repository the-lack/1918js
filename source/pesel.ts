import { err, ok, type Result } from "./lib/result";

// ── module api ───────────────────────────────────────────────────────────────
export { validatePesel }

// ── implementation ───────────────────────────────────────────────────────────
const ALLOWED_CHARACTERS: readonly string[] =
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PESEL_ALLOWED_LENGTH = 11
const PESEL_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1] as const;
const PESEL_CONTROL_DIGIT_INDEX = 10

function validatePesel(peselCandidate: unknown): Result<string, PeselError> {

  if (typeof peselCandidate !== "string")
    return err(invalidType(peselCandidate))

  if (!hasValidLength(peselCandidate))
    return err(invalidLength(peselCandidate))

  if (!hasOnlyDigits(peselCandidate))
    return err(invalidCharacters())

  if (hasOnlyZeros(peselCandidate))
    return err(containsOnlyZeros())

  const digits = derivePeselControlDigit(peselCandidate)

  if (digits.receivedControlDigit !== digits.calculatedControlDigit) {
    return err(controlDigitMismatch(digits))
  }

  return ok(peselCandidate)
}

// ── helpers ──────────────────────────────────────────────────────────────────
function hasValidLength(peselCandidate: string) {
  return peselCandidate.length === PESEL_ALLOWED_LENGTH
}

function hasOnlyZeros(peselCandidate: string) {
  for (const character of peselCandidate) {
    if (character !== "0") return false
  }

  return true
}

function hasOnlyDigits(peselCandidate: string) {
  for (const character of peselCandidate) {
    if (!ALLOWED_CHARACTERS.includes(character))
      return false
  }
  return true
}

function derivePeselControlDigit(peselCandidate: string) {
  const peselDigitsExceptControlDigit = peselCandidate.substring(0, PESEL_CONTROL_DIGIT_INDEX).split("").map(Number)

  let weightedSum = 0;
  for(let index = 0; index < peselDigitsExceptControlDigit.length; index++) {
        const peselDigit  = peselDigitsExceptControlDigit[index]
        const peselWeight = PESEL_WEIGHTS[index]

        if(!peselDigit || !peselWeight) continue

        const product = peselWeight * peselDigit
        weightedSum += product;
  }
  
  const subtrahend = weightedSum % 10;
  const calculatedControlDigit = subtrahend === 0 ? 0 : 10 - subtrahend;
  const receivedControlDigit = Number(peselCandidate.charAt(PESEL_CONTROL_DIGIT_INDEX));

  return { receivedControlDigit , calculatedControlDigit }
}
// ── errors ───────────────────────────────────────────────────────────────────
function invalidType(peselCandidate: unknown) {
  return {
    name: "PeselIsNotString",
    message: "PESEL is not of type `string`",
    meta: {
      expectedType: "string",
      receivedType: typeof peselCandidate
    }
  } as const
}

function invalidLength(peselCandidate: string) {
  return {
    name: "PeselHasInvalidLength",
    message: "PESEL has invalid length",
    meta: {
      expectedLength: PESEL_ALLOWED_LENGTH,
      receivedLength: peselCandidate.length
    }
  } as const
}

function invalidCharacters() {
  return {
    name: "PeselContainsNonDigitCharacters",
    message: "PESEL contains non-numeric characters"
  } as const
}

function containsOnlyZeros() {
  return {
    name: "PeselContainsOnlyZeros",
    message: "Received PESEL contains only digits equal to zero 0",
  } as const
}

function controlDigitMismatch(digits: { receivedControlDigit: number, calculatedControlDigit: number }) {
  return {
    name: "PeselControlDigitMismatch",
    message: "Calculated control digit does not match one contained in the PESEL",
    meta: {
      receivedControlDigit: digits.receivedControlDigit,
      expectedControlDigit: digits.calculatedControlDigit,
      controlDigitIndex: PESEL_ALLOWED_LENGTH - 1,
    }
  } as const
}

// ── types ────────────────────────────────────────────────────────────────────
type PeselError =
  {
    name: "PeselIsNotString",
    message: "PESEL is not of type `string`",
    meta: {
      expectedType: "string",
      receivedType:
      | "number"
      | "bigint"
      | "boolean"
      | "symbol"
      | "undefined"
      | "object"
      | "function"
      | "string"
    }
  }
  |
  {
    name: "PeselHasInvalidLength",
    message: "PESEL has invalid length",
    meta: {
      expectedLength: 11,
      receivedLength: number
    }
  }
  |
  {
    name: "PeselContainsNonDigitCharacters",
    message: "PESEL contains non-numeric characters"
  }
  |
  {
    name: "PeselContainsOnlyZeros",
    message: "Received PESEL contains only digits equal to zero 0",
  }
  |
  {
    name: "PeselControlDigitMismatch",
    message: "Calculated control digit does not match one contained in the PESEL",    
    meta:
    {
      expectedControlDigit: number,
      receivedControlDigit: number,
      controlDigitIndex: number
    }
 }
