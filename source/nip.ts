import { err, ok } from "./lib/result"

export { validateNip };

// ── functional implementation ────────────────────────────────────────────────
const NIP_MODULO = 11
const NIP_CONTROL_DIGIT_INDEX = 9
const NIP_ALLOWED_LENGTH = 10
const NIP_WEIGHTS: readonly number[] = [6, 5, 7, 2, 3, 4, 5, 6, 7]
const NIP_ALLOWED_CHARACTERS: readonly string[] =
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function validateNip(nipCandidate: unknown) {

  if (typeof nipCandidate !== "string")
    return err(invalidType(nipCandidate))

  if (!hasValidLength(nipCandidate))
    return err(invalidLength(nipCandidate));

  if (!hasOnlyDigits(nipCandidate))
    return err(invalidCharacters());

  if (hasOnlyZeros(nipCandidate))
    return err(containsOnlyZeros())
    
  const { calculatedControlDigit, receivedControlDigit } =
    deriveNipControlDigit(nipCandidate);

  if (calculatedControlDigit === 10)
    return err(invalidControlDigit());

  if (receivedControlDigit !== calculatedControlDigit)
    return err(controlDigitMismatch({
      calculatedControlDigit,
      receivedControlDigit
    }));

  return ok(nipCandidate);
}

// ── helpers ──────────────────────────────────────────────────────────────────
function hasOnlyDigits(nipCandidate: string) {
  for (const character of nipCandidate) {
    if (!NIP_ALLOWED_CHARACTERS.includes(character))
      return false;
  }

  return true
}

function hasValidLength(nipCandidate: string) {
  return nipCandidate.length === NIP_ALLOWED_LENGTH
}

function deriveNipControlDigit(nipCandidate: string) {
  const digits = nipCandidate.split("").map(Number);
  const allDigitsExceptControlDigit = digits.slice(0, NIP_CONTROL_DIGIT_INDEX);

  const weightedSum = allDigitsExceptControlDigit
    .reduce((acc, digit, index) => acc + digit * NIP_WEIGHTS[index]!, 0);

  const calculatedControlDigit = weightedSum % NIP_MODULO;
  const receivedControlDigit = digits[NIP_CONTROL_DIGIT_INDEX]!;

  return {
    calculatedControlDigit,
    receivedControlDigit
  };
}

function hasOnlyZeros(nipCandidate: string) {
  for (const character of nipCandidate) {
    if (character !== "0") return false
  }

  return true
}

// ── errors  ──────────────────────────────────────────────────────────────────
function invalidType(nipCandidate: unknown) {
  return {
      name: "NipIsNotString",
      message: "NIP is not of type `string`",
      meta: {
        expectedType: "string",
        receivedType: typeof nipCandidate
      }
    } as const
}

function invalidCharacters() {
  return {
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
  } as const
}

function invalidLength(nipCandidate: string) {
  return {
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expectedLength: NIP_ALLOWED_LENGTH,
      receivedLength: nipCandidate.length
    }
  } as const
}

function invalidControlDigit() {
  return {
    name: "NipCalculatedControlDigitCannotBeTen",
    message: "Control digit calculated for NIP cannot equal 10"
  } as const
}

function controlDigitMismatch(controlDigit: {
  calculatedControlDigit: number;
  receivedControlDigit: number;
}) {
  return {
    name: "NipControlDigitMismatch",
    message: "Received NIP control digit does not match calculated control digit",
    meta:
    {
      expectedControlDigit: controlDigit.calculatedControlDigit,
      receivedControlDigit: controlDigit.receivedControlDigit,
      controlDigitIndex: NIP_CONTROL_DIGIT_INDEX,
    }
  } as const
}

function containsOnlyZeros() {
  return {
    name: "NipContainsOnlyZeros",
    message: "Received NIP contains only digits equal to zero 0",
  } as const
}
