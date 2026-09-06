---
outline: "deep"
---

# Error reference

Validation is performed in the order errors are presented below.

Only one error is returned at a time.

If multiple validation rules are violated, the first encountered error is returned.

Some errors include additional information in the form of metadata (`meta`).

## NIP errors

```ts
declare const input: unknown;
declare const log: Function;

const result = validateNip(input);

if (!result.ok) {
 let error = result.error

 switch (error.code) {
   case 'INVALID_TYPE':
      log('Input is of type: ', error.meta.receivedType)
      log('Should be: ', error.meta.expectedType)
      break;

   case 'INVALID_LENGTH':
      log('Input is of length: ', error.meta.receivedLength)
      log('Should be of length: ', error.meta.expectedLength)
      break;

   case 'NOT_NUMERIC':
     log('Input contains non-numeric characters');
     log('Invalid characters found: ', error.meta.invalidCharacters)
     break;

   case 'ZEROED_OUT':
     log('Input contains only zeros. Do not try to trick us.');
     break;

   case 'INVALID_CONTROL_DIGIT':
     log('Control number derived from weighted sum of all digits is invalid');
     log('This means control number is a 2-digit number (e.g. 10)');
     log('This is not allowed as control number has to be single digit');
     break;

   case 'CONTROL_DIGIT_MISMATCH':
     log('Input contains invalid control digit: ', error.meta.receivedControlDigit);
     log('It should be: ', error.meta.expectedControlDigit);
     log('Control digit position is: ', error.meta.controlDigitIndex + 1);
     break;
 }
}
```

## REGON errors

```ts
declare const input: unknown;
declare const log: Function;

const result = validateRegon(input);

if (!result.ok) {
 let error = result.error

 switch (error.code) {
   case 'INVALID_TYPE':
      log('Input is of type: ', error.meta.receivedType)
      log('Should be: ', error.meta.expectedType)
      break;

   case 'INVALID_LENGTH':
      log('Input is of length: ', error.meta.receivedLength)
      log('Should be of length: ', error.meta.expectedLength)
      break;

   case 'NOT_NUMERIC':
     log('Input contains non-numeric characters');
     log('Invalid characters found: ', error.meta.invalidCharacters)
     break;

   case 'ZEROED_OUT':
     log('Input contains only zeros. Do not try to trick us.');
     break;

   case 'CONTROL_DIGIT_MISMATCH':
     log('Input contains invalid control digit: ', error.meta.receivedControlDigit);
     log('It should be: ', error.meta.expectedControlDigit);
     log('Control digit position is: ', error.meta.controlDigitIndex + 1);
     break;
 }
}
```

## PESEL errors

```ts
declare const input: unknown;
declare const log: Function;

const result = validatePesel(input);

if (!result.ok) {
  let error = result.error

  switch (error.code) {
    case 'INVALID_TYPE':
       log('Input is of type: ', error.meta.receivedType)
       log('Should be: ', error.meta.expectedType)
       break;

    case 'INVALID_LENGTH':
       log('Input is of length: ', error.meta.receivedLength)
       log('Should be of length: ', error.meta.expectedLength)
       break;

    case 'NOT_NUMERIC':
      log('Input contains non-numeric characters');
      log('Invalid characters found: ', error.meta.invalidCharacters)
      break;

    case 'ZEROED_OUT':
      log('Input contains only zeros. Do not try to trick us.');
      break;

    case 'CONTROL_DIGIT_MISMATCH':
      log('Input contains invalid control digit: ', error.meta.receivedControlDigit);
      log('It should be: ', error.meta.expectedControlDigit);
      log('Control digit position is: ', error.meta.controlDigitIndex + 1);
      break;
  }
}
```
