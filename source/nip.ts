import { err, ok, type Result } from './lib/result'

// ── module api ───────────────────────────────────────────────────────────────
export { validateNip };

// ── implementation ───────────────────────────────────────────────────────────
const NIP_ALLOWED_CHARACTERS: readonly string[] =
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const NIP_ALLOWED_LENGTH = 10
const NIP_CONTROL_DIGIT_INDEX = 9
const NIP_WEIGHTS: readonly number[] =
  [6, 5, 7, 2, 3, 4, 5, 6, 7]
const NIP_MODULO = 11

function validateNip(nipCandidate: unknown): Result<string, Readonly<NipError>> {

  if (typeof nipCandidate !== 'string')
    return err(invalidType(nipCandidate))

  if (!hasValidLength(nipCandidate))
    return err(invalidLength(nipCandidate));

  if (!hasOnlyDigits(nipCandidate))
    return err(invalidCharacters());

  if (hasOnlyZeros(nipCandidate))
    return err(containsOnlyZeros())

  const { calculatedControlDigit, receivedControlDigit } =
    deriveNipControlDigit(nipCandidate);

  // special edge case where calculated control digit could turn out to be 2-digits.
  // cannot be classified as control digit mismatch as user simply cannot provide
  // a number that is a valid control digit because digits are single character
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
  const digitsExceptControlDigit = nipCandidate.substring(0, NIP_CONTROL_DIGIT_INDEX).split('').map(Number);

  let weightedSum = 0;
  for (let index = 0; index < digitsExceptControlDigit.length; index++) {
    const nipDigit = digitsExceptControlDigit[index]
    const nipWeight = NIP_WEIGHTS[index]

    if (!nipDigit || !nipWeight) continue

    const product = nipWeight * nipDigit
    weightedSum += product;
  }

  const calculatedControlDigit = weightedSum % NIP_MODULO;
  const receivedControlDigit = Number(nipCandidate.charAt(NIP_CONTROL_DIGIT_INDEX));

  return {
    calculatedControlDigit,
    receivedControlDigit
  };
}

function hasOnlyZeros(nipCandidate: string) {
  for (const character of nipCandidate) {
    if (character !== '0') return false
  }

  return true
}

// ── errors ───────────────────────────────────────────────────────────────────
function invalidType(nipCandidate: unknown) {
  return {
    code: 'INVALID_TYPE',
    meta: {
      expectedType: 'string',
      receivedType: typeof nipCandidate
    }
  } as const
}

function invalidCharacters() {
  return {
    code: 'NON_NUMERIC',
  } as const
}

function invalidLength(nipCandidate: string) {
  return {
    code: 'INVALID_LENGTH',
    meta: {
      expectedLength: NIP_ALLOWED_LENGTH,
      receivedLength: nipCandidate.length
    }
  } as const
}

function invalidControlDigit() {
  return {
    code: 'INVALID_CONTROL_DIGIT',
  } as const
}

function controlDigitMismatch(controlDigit: {
  calculatedControlDigit: number;
  receivedControlDigit: number;
}) {
  return {
    code: 'CONTROL_DIGIT_MISMATCH',
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
    code: 'ZEROED_OUT',
  } as const
}

// ── types ────────────────────────────────────────────────────────────────────
type NipError =
  {
    code: 'INVALID_TYPE',
    meta: {
      expectedType: 'string',
      receivedType:
      | 'number'
      | 'bigint'
      | 'boolean'
      | 'symbol'
      | 'undefined'
      | 'object'
      | 'function'
      | 'string' // limitation of TS, won't be string
    }
  }
  |
  {
    code: 'INVALID_LENGTH',
    meta: {
      expectedLength: number,
      receivedLength: number
    }
  }
  |
  {
    code: 'NON_NUMERIC',
  }
  |
  {
    code: 'ZEROED_OUT',
  }
  |
  {
    code: 'INVALID_CONTROL_DIGIT',
  }
  |
  {
    code: 'CONTROL_DIGIT_MISMATCH',
    meta:
    {
      expectedControlDigit: number,
      receivedControlDigit: number,
      controlDigitIndex: number,
    }
  }
