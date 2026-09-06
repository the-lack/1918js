import { err, ok, type Result } from './lib/result';

// ── module api ───────────────────────────────────────────────────────────────
export { validatePesel }

// ── implementation ───────────────────────────────────────────────────────────
const PESEL_ALLOWED_CHARACTERS: readonly string[] =
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const PESEL_ALLOWED_LENGTH = 11
const PESEL_CONTROL_DIGIT_INDEX = 10
const PESEL_WEIGHTS =
  [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1] as const;
const PESEL_MODULO = 10

/**
 * @description verifies validity of received PESEL
 *
 * @example
 *
 * declare const input: unknown;
 * declare const log: Function;
 * 
 * const result = validatePesel(input);
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
 *     case 'CONTROL_DIGIT_MISMATCH':
 *       log('Input contains invalid control digit: ', error.meta.receivedControlDigit);
 *       log('It should be: ', error.meta.expectedControlDigit);
 *       log('Control digit position is: ', error.meta.controlDigitIndex + 1);
 *       break;
 *   }
 * }
 */
function validatePesel(peselCandidate: unknown): Result<string, PeselError> {

  if (typeof peselCandidate !== 'string')
    return err(invalidType(peselCandidate))

  if (!hasValidLength(peselCandidate))
    return err(invalidLength(peselCandidate))

  if (!hasOnlyDigits(peselCandidate))
    return err(notNumeric())

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
    if (character !== '0') return false
  }

  return true
}

function hasOnlyDigits(peselCandidate: string) { 
  for (const character of peselCandidate) {
    if (!PESEL_ALLOWED_CHARACTERS.includes(character))
      return false
  }
  return true
}

function derivePeselControlDigit(peselCandidate: string) {
  const peselDigitsExceptControlDigit = peselCandidate.substring(0, PESEL_CONTROL_DIGIT_INDEX).split('').map(Number)

  let weightedSum = 0;
  for(let index = 0; index < peselDigitsExceptControlDigit.length; index++) {
        const peselDigit  = peselDigitsExceptControlDigit[index]
        const peselWeight = PESEL_WEIGHTS[index]

        if(!peselDigit || !peselWeight) continue

        const product = peselWeight * peselDigit
        weightedSum += product;
  }
  
  const subtrahend = weightedSum % PESEL_MODULO;
  const calculatedControlDigit = subtrahend === 0 ? 0 : 10 - subtrahend;
  const receivedControlDigit = Number(peselCandidate.charAt(PESEL_CONTROL_DIGIT_INDEX));

  return { receivedControlDigit , calculatedControlDigit }
}
// ── errors ───────────────────────────────────────────────────────────────────
function invalidType(peselCandidate: unknown) {
  return {
    code: 'INVALID_TYPE',
    meta: {
      expectedType: 'string',
      receivedType: typeof peselCandidate
    }
  } as const
}

function invalidLength(peselCandidate: string) {
  return {
    code: 'INVALID_LENGTH',
    meta: {
      expectedLength: PESEL_ALLOWED_LENGTH,
      receivedLength: peselCandidate.length
    }
  } as const
}

function notNumeric() {
  return {
    code: 'NOT_NUMERIC',
  } as const
}

function containsOnlyZeros() {
  return {
    code: 'ZEROED_OUT',
  } as const
}

function controlDigitMismatch(digits: { receivedControlDigit: number, calculatedControlDigit: number }) {
  return {
    code: 'CONTROL_DIGIT_MISMATCH',
    meta: {
      receivedControlDigit: digits.receivedControlDigit,
      expectedControlDigit: digits.calculatedControlDigit,
      controlDigitIndex: PESEL_CONTROL_DIGIT_INDEX,
    }
  } as const
}

// ── types ────────────────────────────────────────────────────────────────────
type PeselError =
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
      controlDigitIndex: number
    }
 }
