---
outline: "deep"
---

# Error reference

Validation is performed in the order errors are presented.

Only one error at a time is returned.

Some errors provided additional information (metadata) regarding the error.

## NIP errors

#### Error: invalid type
Occurs when a received value is not of type `string`

```ts
{
    name: "NipIsNotString",
    message: "NIP is not of type `string`",
    meta: {
      expected_type: "string",
      received_type:  | "number"                       
                      | "bigint" 
                      | "boolean" 
                      | "symbol" 
                      | "undefined" 
                      | "object" 
                      | "function"
    }
}
```

#### Error: invalid length
Occurs when length is different than 10

```ts
{
    name: "NipInvalidLength",
    message: "NIP has invalid length",
    meta: {
      expected_length: 10,
      received_length: number    
}
```

#### Error: non-numeric characters
Occurs when provided value contains non-numeric characters

```ts
{
    name: "NipContainsNonDigits",
    message: "NIP contains characters that are not digits"
}
```

#### Error: zeroed out value
Occurs when user tries to bypass nip validation and provides zeroed out value "0000000000".
```ts
{
    name: "NipContainsOnlyZeros",
    message: "Received NIP contains only digits equal to zero 0",
}
```

#### Error: invalid control digit
Occurs when a control digit derived from weighted sum of digits exceeds 9 (single-digit) break point.

Control digit has to be a single digit. Cannot be 10 (two digits).
```ts
{
    name: "NipCalculatedControlDigitCannotBeTen",
    message: "Control digit calculated for NIP cannot equal 10"
}
```

#### Error: control digit mismatch

Occurs when received control digit (contained in NIP on index 9) is different from what was calculated based on the rest of digits.

```ts
{
  name: "NipControlDigitMismatch",
  message: "Received NIP control digit does not match calculated control digit",
  meta:
  {
    expected_control_digit: number,
    received_control_digit: number,
    control_digit_index: 9,
  }
}

```

## REGON errors

#### Error: invalid type
Occurs when a received value is not of type `string`

```ts
{
  name: "RegonIsNotString",
  message: "REGON is not of type `string`",
  meta: {
    expected_type: "string",
    received_type:  | "number"                       
                    | "bigint" 
                    | "boolean" 
                    | "symbol" 
                    | "undefined" 
                    | "object" 
                    | "function"
  }
}
```

#### Error: invalid length
Occurs when length is different than 9 and 14
```ts
{
    name: "RegonInvalidLength",
    message: "REGON has invalid length",
    meta: {
      expected_length: [9, 14],
      received_length: number
    }
}
```

#### Error: non-numeric characters
Occurs when provided value contains non-numeric characters
```ts
{
    name: "RegonContainsNonDigits",
    message: "REGON contains characters that are not digits",
}
```

#### Error: zeroed out value
Occurs when user tries to bypass regon validation and provides zeroed out value "000000000" or "00000000000000".
```ts
{
    name: "RegonContainsOnlyZeros",
    message: "Received REGON contains only digits equal to zero 0",
}
```

#### Error: invalid control digit
Occurs when received control digit is different from what was calculated based on the rest of digits.

- 14-length regon contains 2 control digits (on index 8 and 13)
- 9-length regon contains 1 control digit (on index 8)
```ts
{
    name: "RegonControlDigitMismatch",
    message: "Received REGON control digit does not match calculated control digit",
    meta: {
      expected_control_digit: number,
      received_control_digit: number,
      control_digit_index: number, // (8 or 13)
    }
}
```

## PESEL errors

#### Error: invalid type
Occurs when a received value is not of type `string`

```ts
{
    name: "PeselIsNotString",
    message: "PESEL is not of type `string`",
    meta: {
      expected_type: "string",
      received_type:  | "number"                       
                      | "bigint" 
                      | "boolean" 
                      | "symbol" 
                      | "undefined" 
                      | "object" 
                      | "function"
    }
}
```

#### Error: invalid length
Occurs when length is different than 11.

```ts
{
    name: "PeselHasInvalidLength",
    message: "PESEL has invalid length",
    meta: {
      expected_length: 11,
      received_length: number
    }
}
```

#### Error: non-numeric characters
Occurs when provided value contains non-numeric characters

```ts
{
    name: "PeselContainsNonDigitCharacters",
    message: "PESEL contains non-numeric characters"
}
```

#### Error: zeroed out value
Occurs when user tries to bypass pesel validation and provides zeroed out value "00000000000".

```ts
{
    name: "PeselContainsOnlyZeros",
    message: "Received PESEL contains only digits equal to zero 0",
}
```

#### Error: invalid control digit
Occurs when received control digit (on index 10) is different from what was calculated based on the rest of digits.

```ts
{
    name: "PeselControlDigitMismatch",
    message: "Calculated control digit does not match one contained in the PESEL",
    meta: {
      received_control_digit: number,
      expected_control_digit: number,
      control_digit_index: 10,
    }
}
```
