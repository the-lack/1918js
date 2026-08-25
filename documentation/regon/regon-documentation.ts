// REGON validation

const SOME_DATA_SOURCE = {
  regon_candidate: "630303023",
}

// functional implementation example
import { validate_regon } from "1918js"

const functional_result = validate_regon(SOME_DATA_SOURCE.regon_candidate)

if(functional_result.ok) {
  console.log(`validation passed :) ${functional_result.value}`)
}

if(!functional_result.ok) {
  console.log(`validation failed :(`)
  console.log(` here's the error: ${functional_result.error}`)
}

// value-object implementation example
import { Regon } from "1918js"

const vo_result = Regon.try_parse(SOME_DATA_SOURCE.regon_candidate)
const vo_result_duplicate = Regon.try_parse(SOME_DATA_SOURCE.regon_candidate)

if(vo_result.ok && vo_result_duplicate.ok) {
  console.log(`now we have a valid value object :)`)
  console.log(`our regon value: ${vo_result.value.as_string()}`)

  const are_they_equal: boolean =
    vo_result.value.equals(vo_result_duplicate.value);

  console.log(are_they_equal)
}

if(!vo_result.ok || !vo_result_duplicate.ok) {
  console.log(`validation failed :(`)
}
