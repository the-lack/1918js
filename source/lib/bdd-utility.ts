import fc from "fast-check";
import { it, describe } from "bun:test";

type MetaData = {
  label: string;
};

type Given<T> = GivenStep<T> | GivenFcStep<T> | GivenSuchAsStep<T>

type GivenStep<GivenReturnType> = {
  kind: "given";
  label: string;
  fn: (_: never) => GivenReturnType;
};

type GivenFcStep<GivenReturnedArbitraryType> = {
  kind: "given_fc";
  label: string;
  fn: (_: never) => fc.Arbitrary<GivenReturnedArbitraryType>;
};

type GivenSuchAsStep<GivenSuchAsReturnType> = {
  kind: "given_such_as";
  label: string;
  fn: (_: never) => GivenSuchAsReturnType[];
};

type WhenStep<GivenReturnType, WhenReturnType> = {
  kind: "when";
  label: string;
  fn: (args: { input: GivenReturnType }) => WhenReturnType;
};

type ThenStep<WhenReturnTYpe, GivenReturnType> = {
  kind: "then";
  label: string;
  fn: (args: { result: WhenReturnTYpe, input: GivenReturnType }) => void;
};

type AndStep<WhenReturnType, GivenReturnType> = {
  kind: "and_also";
  label: string;
  fn: (args: { result: WhenReturnType, input: GivenReturnType }) => void;
};

function template_label(
  strings: TemplateStringsArray,
  values: unknown[],
): string {
  return String.raw({ raw: strings }, ...values);
}

function make_given() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    const given = <GivenReturnType>(
      fn: (_: never) => GivenReturnType,
    ): GivenStep<GivenReturnType> & MetaData => ({
      kind: "given",
      label,
      fn,
    });

    given.from_fc = <GivenFcReturnType>(
      fn: (_: never) => fc.Arbitrary<GivenFcReturnType>,
    ): GivenFcStep<GivenFcReturnType> & MetaData => ({
      kind: "given_fc",
      label,
      fn,
    });

    given.such_as = <GivenSuchAsReturnType>(
      fn: (_: never) => GivenSuchAsReturnType[],
    ): GivenSuchAsStep<GivenSuchAsReturnType> & MetaData => ({
      kind: "given_such_as",
      label,
      fn,
    });

    return given;
  };
}

function make_when() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    return <GivenReturnType, WhenReturnType>(
      fn: (args: { input: GivenReturnType }) => WhenReturnType,
    ): WhenStep<GivenReturnType, WhenReturnType> & MetaData => ({
      kind: "when",
      label,
      fn,
    });
  };
}

function make_then() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    return <WhenReturnType, GivenReturnType>(
      fn: (args: { result: WhenReturnType, input: GivenReturnType }) => void,
    ): ThenStep<WhenReturnType, GivenReturnType> & MetaData => ({
      kind: "then",
      label,
      fn,
    });
  };
}

function make_and() {
  return (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const label = template_label(strings, values);

    return <WhenOutput, GivenInput>(
      fn: (args: { result: WhenOutput, input: GivenInput }) => void,
    ): AndStep<WhenOutput, GivenInput> & MetaData => ({
      kind: "and_also",
      label,
      fn,
    });
  };
}

export const $ = {
  scenario,
  given: make_given(),
  when: make_when(),
  then: make_then(),
  and: make_and()
};

type GivenValue<G> =
  G extends GivenStep<infer T>
  ? T
  : G extends GivenFcStep<infer T>
  ? T
  : G extends GivenSuchAsStep<infer T>
  ? T
  : never;


function scenario(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const title = template_label(strings, values);

  return function register_scenario<
    G extends Given<any> & MetaData,
    Z,
  >(
    given: G,
    when: WhenStep<GivenValue<G>, Z> & MetaData,
    then: ThenStep<Z, GivenValue<G>> & MetaData,
    ...ands: AndStep<Z, GivenValue<G>>[]
  ) {

    describe(`SCENARIO: ${title}`, () => {


      if (given.kind === "given_such_as") {
        const given_inputs = given.fn(undefined as never);

        describe.each(given_inputs)(`GIVEN ${given.label}`, (given_single_input) => {
          describe(`WHEN ${when.label}`, () => {
            const when_result = when.fn({ input: given_single_input });

            it(`THEN ${then.label}`, () => {
              then.fn({ result: when_result, input: given_single_input });
            })

            for (const and of ands) {
              it(`AND ${and.label}`, () => {
                and.fn({ result: when_result, input: given_single_input })
              })
            }
          })
        })

        return
      }


      if (given.kind === "given") {
        const given_input = given.fn(undefined as never);

        describe(`GIVEN ${given.label}`, () => {
          describe(`WHEN ${when.label}`, () => {
            const when_result = when.fn({ input: given_input });

            it(`THEN ${then.label}`, () => {
              then.fn({ result: when_result, input: given_input });
            })

            for (const and of ands) {
              it(`AND ${and.label}`, () => {
                and.fn({ result: when_result, input: given_input })
              })
            }
          })
        })
        return
      }

      if (given.kind === "given_fc") {
        describe(`GIVEN ${given.label}`, () => {
          describe(`WHEN ${when.label}`, () => {
            it(
              `THEN ${then.label} ${ands.map(and => "AND " + and.label).join(" ")}`,
              () => {
                fc.assert(
                  fc.property(
                    given.fn(undefined as never),
                    (given_input) => {
                      const when_result = when.fn({ input: given_input });
                      then.fn({ result: when_result, input: given_input });

                      for (const and of ands) {
                        and.fn({ result: when_result, input: given_input })
                      }
                    },
                  ),
                );
              })
          })
        })
        return
      }

    })
  };
}
