# Log
Dirty storage of TODOs, ideas, issues and thoughts that come up during project development.

# Todosy

- [X] PESEL Validation
  - [X] TDD/BDD Tests
  - [X] Functional implementation
  - [X] Value-object implementation

- [X] Bump up unit test coverage to 100%
    - [X] Test NIP VO
    - [X] Test REGON VO

- [X] Bump up mutation test coverage to 100%

- [ ] Clean up implementation of REGON to make it copy-pasteable
- [ ] Clean up implementation of PESEL to make it copy-pasteable

- [ ] Make source code copy-pasteable. Shadcn type beat implementation
- [ ] Create documentation page. Document:
        - [ ] Code samples
        - [ ] Possible errors for each validator
        - [ ] VOs and how to use them correctly 
        - [ ] Install steps
        - [ ] Example with a Zod Schema + catch all implementation
        - [ ] Throwing vs result

- [ ] Add all-zero edge case check for:
    - [ ] PESEL 
    - [ ] NIP
    - [ ] REGON

- [ ] Make API camelCased because JavaScript conventions and yada yada

# Docs
- [x] Add license
- [X] Add author
- [X] Add package description
- [X] Add git repository link
- [X] Add entrypage/start page link

# Improvemenets (optional)
- [ ] Add unwrap to the Result
- [ ] Extract testing utils to beautestiful
- [X] Add "AND" syntax to BDD
- [ ] How can we stop having 20/30 fucking file in the root directory.
      Single config.ts that contains a defineConfigObject that serializes the files to:
       vite.config.ts, vitest.config.ts all type safe and good and chill :)

# Maybe?
  input => result =>
    expect(result).toEqual(invalid_length_error(input))

- these should be named ({ result, input })
(result, input) => expect(result).toEqual(invalid_length_error())

# Typing?

tdd typing problem

tiny example:

when `input is validated`
(
  input => validate_pesel(input)
),

then `error is correct`
(
  result => expect(result.error).toEqual(...)
)


current implementation returns:

{ ok: boolean, reason: string }


so typescript fails with:

property 'error' does not exist


problem: during red-first tdd, the test should be allowed to describe the future contract, but the current return type prevents the test from compiling.

need to think about whether then should be able to express the intended/future result type instead of being strictly constrained by the current implementation type.


# Would be great if exepect(value) would infer in  .toEqual(inffered)

# Proper message report + "AND" should be contained in the test suite


# Custom wrapping of multiple values somehow and just diplsayng one that fails?

   ✓ SCENARIO: rejecting regon with invalid control digit (5)
     ✓ GIVEN regon with invalid control digit: 630303021 (1)
       ✓ WHEN regon is validated (1)
         ✓ THEN regon is rejected for invalid control digit 1ms
     ✓ GIVEN regon with invalid control digit: 12345678512346 (1)
       ✓ WHEN regon is validated (1)
         ✓ THEN regon is rejected for invalid control digit 0ms
     ✓ GIVEN regon with invalid control digit: 12345678812343 (1)
       ✓ WHEN regon is validated (1)
         ✓ THEN regon is rejected for invalid control digit 0ms
     ✓ GIVEN regon with invalid control digit: 12345678542341 (1)
       ✓ WHEN regon is validated (1)
         ✓ THEN regon is rejected for invalid control digit 0ms
     ✓ GIVEN regon with invalid control digit: 123457781 (1)
       ✓ WHEN regon is validated (1)
         ✓ THEN regon is rejected for invalid control digit 0ms

too many examples

# Make each "AND" statement narrow the type for next one!!! very smart :)

- [ ] Fix the runtime assertion ! issues
- [ ] Code execution should happen at test execution and not scenario registration
- [ ] When should you refactor tests during development?
- [ ] debug statement that you can put on top of your test scenario instead of logging manually
- [ ] vitest leftover in nip tests
