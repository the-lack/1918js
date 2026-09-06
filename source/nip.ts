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

/**
 * @description verifies validity of received NIP
 *
 * @example
 *
 * declare const input: unknown;
 * declare const log: Function;
 * 
 * const result = validateNip(input);
 *
 * if (!result.ok) {
 *   let error = result.error
 *
 *   switch (error.code) {
 *     case 'INVALID_TYPE':
 *        log('Input is of type: ', error.meta.receivedType)
 *        log('Should be: ', error.meta.expectedType)
 *        break;
 * 
 *     case 'INVALID_LENGTH':
 *        log('Input is of length: ', error.meta.receivedLength)
 *        log('Should be of length: ', error.meta.expectedLength)
 *        break;
 * 
 *     case 'NOT_NUMERIC':
 *       log('Input contains non-numeric characters');
 *       break;
 * 
 *     case 'ZEROED_OUT':
 *       log('Input contains only zeros. Do not try to trick us.');
 *       break;
 * 
 *     case 'INVALID_CONTROL_DIGIT':
 *       log('Control number derived from weighted sum of all digits is invalid');
 *       log('This means control number is a 2-digit number (e.g. 10)');
 *       log('This is not allowed as control number has to be single digit');
 *       break;
 * 
 *     case 'CONTROL_DIGIT_MISMATCH':
 *       log('Input contains invalid control digit: ', error.meta.receivedControlDigit);
 *       log('It should be: ', error.meta.expectedControlDigit);
 *       log('Control digit position is: ', error.meta.controlDigitIndex + 1);
 *       break;
 *   }
 * }
 */
function validateNip(nipCandidate: unknown): Result<string, Readonly<NipError>> {

  if (typeof nipCandidate !== 'string')
    return err(invalidType(nipCandidate))

  if (!hasValidLength(nipCandidate))
    return err(invalidLength(nipCandidate));

  const { hasOnlyDigits, invalidCharacters } = checkIfHasOnlyDigits(nipCandidate)

  if (!hasOnlyDigits)
    return err(hasNonNumericCharacters(invalidCharacters));

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
function checkIfHasOnlyDigits(nipCandidate: string) {
  let invalidCharacters: { character: string, index: number }[] = []
  let hasOnlyDigits = true;

  Array.from(nipCandidate)
    .forEach((character, index) => {
      if (!NIP_ALLOWED_CHARACTERS.includes(character)) {
        invalidCharacters.push({ character, index })
        hasOnlyDigits = false
      }
    });

  return { hasOnlyDigits, invalidCharacters }
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

function hasNonNumericCharacters(invalidCharacters: { character: string, index: number }[]) {
  return {
    code: 'NOT_NUMERIC',
    meta: {
      invalidCharacters
    }
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
    code: 'NOT_NUMERIC',
    meta: { invalidCharacters: { character: string, index: number }[] }
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
