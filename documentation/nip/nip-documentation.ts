// NIP validation
 
const SOME_DATA_SOURCE = {
  nip_candidate: "7791011327",
}

// functional implementation example
import { validate_nip } from "1918js"

const result = validate_nip(SOME_DATA_SOURCE.nip_candidate)

if (result.ok) {
  console.log(`validation passed :) ${result.value}`)
}

if (!result.ok) {
  console.log(`validation failed :( here's the error: ${result.error}`)
}

// value-object implementation example
import { Nip } from "1918js"

const vo_result = Nip.try_parse(SOME_DATA_SOURCE.nip_candidate);
const vo_result_duplicate = Nip.try_parse(SOME_DATA_SOURCE.nip_candidate);

if (vo_result.ok) {
  const nip_object = vo_result.value;
  const nip_object_duplicate = vo_result_duplicate.value;

  console.log(`now we have a valid value object :)`);
  console.log(`our nip value: ${nip_object.as_string()}`);


  const are_they_equal: boolean = nip_object.equals(nip_object_duplicate);
  console.log(are_they_equal)
}

if (!vo_result.ok) {
  console.log(`validation failed :( here's the error: ${vo_result.error}`);
};
