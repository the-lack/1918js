# 1918js - [documentation](https://the-lack.github.io/1918js/)

### what is this?
validation library for polish identifiers

### features
- validation utilities for polish identifiers: NIP, PESEL, REGON
- no external dependencies
- extensive testing (unit tests, property-based tests, mutation-tests)

### how to use

```ts
import { validateRegon } from "1918js"

declare const someUnknownUserInput: unknown;

const result = validateRegon(someUnknownUserInput)

if(result.ok) {
  console.log("happy path :)")
  console.log("our value: ", result.value)
}

if(!result.ok) {
  console.log("you know what path this is :(")

  // error is accessed as a value, never thrown
  console.log("error name", result.error.name)
  console.log("error message", result.error.message)
}
```
