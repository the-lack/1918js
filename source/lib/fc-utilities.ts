import { fc } from "@fast-check/vitest"

export function get_fc_string_with_at_least_one_non_digit() {
  return fc.stringMatching(/.*\D.*/);
}

export function get_fc_numeric_string(options?: { min_length?: number; max_length?: number; }) {
  return fc
    .array(fc.integer({ min: 0, max: 9 }), {
      minLength: options?.min_length,
      maxLength: options?.max_length,
    })
    .map(digits => digits.join(""));
}
