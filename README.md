
# 1918js

### what is this?
validation library for polish identifiers

### features

- nip validation (functional API)
- nip parsing (value object / nominal type implementation)

- regon validation (functional API)
- regon parsing (value object / nominal type implementation)


- no external dependencies
- extensive testing (unit tests, property-based tests, mutation-tests)

### how to use

NIP validation

  1. functional implementation
  
  ```typescript
  import { validate_nip } from "1918js"
  import { nip_candidate } from "./some_data_source"
  
  const result = validate_nip(nip_candidate)
  
  if(!result.ok) {
    console.log(`validation failed :( here's the error: ${result.error}`)
  }
  
  if(result.ok) {
    console.log(`validation passed :) ${result.value}`)
  }
  ```
  
  2. value-object / nominal typing implementation
  
  ```typescript
  import { Nip } from "1918js"
  import { nip_candidate, another_nip_candidate } from "./some_data_source"
  
  const result = Nip.try_parse(nip_candidate)
  
  if(!result.ok) {
    console.log(`validation failed :( here's the error: ${result.error}`)
  }
  
  if(result.ok) {
    const nip_object = result.value
    console.log(`now we have a valid value object :)`)
    console.log(`our nip value: nip_object.as_string()`)
    
    const { value: nip_object2 ) = Nip.try_parse(nip_candidate) // assume valid
  
    const are_they_equal: boolean = nip_object.equals(nip_object2);
  }
  
  ```


REGON validation


  1. functional implementation
  
  ```typescript
  import { validate_regon } from "1918js"
  import { regon_candidate } from "./some_data_source"
  
  const result = validate_regon(regon_candidate)
  
  if(!result.ok) {
    console.log(`validation failed :( here's the error: ${result.error}`)
  }
  
  if(result.ok) {
    console.log(`validation passed :) ${result.value}`)
  }
  ```
  
  2. value-object / nominal typing implementation
  
  ```typescript
  import { Regon } from "1918js"
  import { regon_candidate, another_regon_candidate } from "./some_data_source"
  
  const result = Regon.try_parse(regon_candidate)
  
  if(!result.ok) {
    console.log(`validation failed :( here's the error: ${result.error}`)
  }
  
  if(result.ok) {
    const regon_object = result.value
    console.log(`now we have a valid value object :)`)
    console.log(`our regon value: regon_object.as_string()`)
    
    const { value: regon_object2 ) = Regon.try_parse(regon_candidate) // assume valid
  
    const are_they_equal: boolean = regon_object.equals(regon_object2);
  }
  
  ```


# roadmap

- [ ] pesel support
