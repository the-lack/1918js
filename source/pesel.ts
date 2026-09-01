import { err, ok } from "./lib/result";

export { validatePesel }

// ── functional implementation ────────────────────────────────────────────────
const ALLOWED_CHARACTERS: readonly string[] =
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PESEL_ALLOWED_LENGTH = 11
const PESEL_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1] as const;

function validatePesel(peselCandidate: unknown) {

  if (typeof peselCandidate !== "string")
    return err(invalidType(peselCandidate))

  if (!hasValidLength(peselCandidate))
    return err(invalidLength(peselCandidate))

  if (!hasOnlyDigits(peselCandidate))
    return err(invalidCharacters())

  if (hasOnlyZeros(peselCandidate))
    return err(containsOnlyZeros())

  const digits = derivePeselControlDigit(peselCandidate)

  if (digits.receivedControlNumber !== digits.calculatedControlNumber) {
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
  const peselDigits: number[] = peselCandidate.split("").map(Number)
  const receivedControlNumber = peselDigits.pop()!

  const weightedSum = peselDigits.reduce((accumulator, currentDigit, index) => {
    return accumulator + (currentDigit * PESEL_WEIGHTS[index]!)
  }, 0)

  const subtrahend = weightedSum % 10;
  const calculatedControlNumber = subtrahend === 0 ? 0 : 10 - subtrahend;

  return { receivedControlNumber, calculatedControlNumber }
}

// ── errors  ──────────────────────────────────────────────────────────────────
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

function controlDigitMismatch(digits: { receivedControlNumber: number, calculatedControlNumber: number }) {
  return {
    name: "PeselControlDigitMismatch",
    message: "Calculated control digit does not match one contained in the PESEL",
    meta: {
      receivedControlDigit: digits.receivedControlNumber,
      expectedControlDigit: digits.calculatedControlNumber,
      controlDigitIndex: PESEL_ALLOWED_LENGTH - 1,
    }
  } as const
}
