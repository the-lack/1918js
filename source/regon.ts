import { err, ok, type Result } from './lib/result';

// ── module api ───────────────────────────────────────────────────────────────
export { validateRegon }

// ── implementation ───────────────────────────────────────────────────────────
const REGON_ALLOWED_CHARACTERS: readonly string[] =
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const REGON_ALLOWED_LENGTHS: readonly number[] = [9, 14];
const REGON9_WEIGHTS: readonly number[] =
  [8, 9, 2, 3, 4, 5, 6, 7] as const;
const REGON14_WEIGHTS: readonly number[] =
  [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8] as const;
const REGON_MODULO = 11

function validateRegon(regonCandidate: unknown): Result<string, RegonError> {
  if (typeof regonCandidate !== 'string')
    return err(invalidType(regonCandidate))

  if (!hasValidLength(regonCandidate))
    return err(invalidLength(regonCandidate))

  if (!hasOnlyDigits(regonCandidate))
    return err(invalidCharacters())

  if (hasOnlyZeros(regonCandidate))
    return err(containsOnlyZeros())

  // always verify first control digit
  // (if regons is of length 9 then keep it. if regon is of length 14 then treat it as 9-length regon)
  const regonOfLength9Representation = regonCandidate.substring(0, 9)
  const digits = deriveRegonControlDigits(regonOfLength9Representation, REGON9_WEIGHTS)

  if (digits.receivedControlDigit !== digits.calculatedControlDigit)
    return err(controlDigitMismatch({ ...digits, index: regonOfLength9Representation.length - 1 }))

  // if length is 14 also verify second control digit
  if (regonCandidate.length === 14) {
    const digitsForRegon14 = deriveRegonControlDigits(regonCandidate, REGON14_WEIGHTS)

    if (digitsForRegon14.receivedControlDigit !== digitsForRegon14.calculatedControlDigit)
      return err(controlDigitMismatch({ ...digitsForRegon14, index: regonCandidate.length - 1 }))
  }

  return ok(regonCandidate)
}

// ── helpers ──────────────────────────────────────────────────────────────────
function deriveRegonControlDigits(regon: string, weights: readonly number[]) {
  let weightedSum = 0;
  weights.forEach((weight, index) => {
    const regonNumber = Number(regon[index]);
    weightedSum += weight * regonNumber;
  })

  const receivedControlDigit = Number(regon[regon.length - 1]);
  const calculatedControlDigit = weightedSum % REGON_MODULO === 10 ? 0 : weightedSum % REGON_MODULO

  return { receivedControlDigit, calculatedControlDigit }
}


function hasOnlyDigits(regonCandidate: string) {
  for (const character of regonCandidate) {
    if (!REGON_ALLOWED_CHARACTERS.includes(character))
      return false;
  }

  return true
}

function hasOnlyZeros(regonCandidate: string) {
  for (const character of regonCandidate) {
    if (character !== '0') return false
  }

  return true
}

function hasValidLength(regonCandidate: string) {
  return REGON_ALLOWED_LENGTHS.includes(regonCandidate.length)
}

// ── errors ───────────────────────────────────────────────────────────────────
function invalidType(regonCandidate: unknown) {
  return {
    code: 'INVALID_TYPE',
    meta: {
      expectedType: 'string',
      receivedType: typeof regonCandidate
    }
  } as const
}

function invalidLength(regon: string) {
  return {
    code: 'INVALID_LENGTH',
    meta: {
      expectedLength: REGON_ALLOWED_LENGTHS,
      receivedLength: regon.length
    }
  } as const
}

function invalidCharacters() {
  return {
    code: 'NOT_NUMERIC',
  } as const
}

function containsOnlyZeros() {
  return {
    code: 'ZEROED_OUT',
  } as const
}

function controlDigitMismatch(controlDigit: { calculatedControlDigit: number; receivedControlDigit: number, index: number },) {
  return {
    code: 'CONTROL_DIGIT_MISMATCH',
    meta: {
      expectedControlDigit: controlDigit.calculatedControlDigit,
      receivedControlDigit: controlDigit.receivedControlDigit,
      controlDigitIndex: controlDigit.index,
    }
  } as const
}

// ── types ────────────────────────────────────────────────────────────────────
type RegonError =
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
      expectedLength: readonly number[],
      receivedLength: number
    }
  }
  |
  {
    code: 'NOT_NUMERIC',
  }
  |
  {
    code: 'ZEROED_OUT',
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
