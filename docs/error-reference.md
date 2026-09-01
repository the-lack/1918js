---
outline: "deep"
---

# Error reference

Validation is performed in the order errors are presented.

Only one error at a time is returned.

Some errors provide additional information (metadata) regarding the error.

## NIP errors

```ts
type NipError =
  {
    name: "NipIsNotString",
    message: "NIP is not of type `string`",
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
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expectedLength: 10,
      receivedLength: number
    }
  }
  |
  {
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
  }
  |
  {
    name: "NipContainsOnlyZeros",
    message: "Received NIP contains only digits equal to zero 0",
  }
  |
  {
    name: "NipCalculatedControlDigitCannotBeTen",
    message: "Control digit calculated for NIP cannot equal 10"
  }
  |
  {
    name: "NipControlDigitMismatch",
    message: "Received NIP control digit does not match calculated control digit",
    meta:
    {
      expectedControlDigit: number,
      receivedControlDigit: number,
      controlDigitIndex: 9,
    }
  }
```

## REGON errors

```ts
type RegonError =
  {
    name: "RegonIsNotString",
    message: "REGON is not of type `string`",
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
    name: "RegonInvalidLength",
    message: "REGON has invalid length",
    meta: {
      expectedLength: readonly number[],
      receivedLength: number
    }
  }
  |
  {
    name: "RegonContainsNonDigits",
    message: "REGON contains characters that are not digits"
  }
  |
  {
    name: "RegonContainsOnlyZeros",
    message: "Received REGON contains only digits equal to zero 0",
  }
  |
  {
    name: "RegonControlDigitMismatch",
    message: "Received REGON control digit does not match calculated control digit",
    meta:
    {
      expectedControlDigit: number,
      receivedControlDigit: number,
      controlDigitIndex: number,
    }
  }
```

## PESEL errors

```ts
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
```
