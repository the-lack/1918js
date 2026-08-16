import { fc } from "@fast-check/vitest";
import { describe, it } from "vitest";

type MetaData = {
  label: string;
};

type Given<T> = GivenStep<T> | GivenFcStep<T> | GivenSuchAsStep<T>

type GivenStep<T> = {
  kind: "given";
  label: string;
  fn: (_: never) => T;
};

type GivenFcStep<T> = {
  kind: "given_fc";
  label: string;
  fn: (_: never) => fc.Arbitrary<T>;
};

type GivenSuchAsStep<T> = {
  kind: "given_such_as";
  label: string;
  fn: (_: never) => T[];
};

type WhenStep<T, Z> = {
  kind: "when";
  label: string;
  fn: (given_result: T) => Z;
};

type ThenStep<Z, G> = {
  kind: "then";
  label: string;
  fn: (when_result: Z, when_input: G) => void;
};

type AndStep<Z, G> = {
  kind: "and_also";
  label: string;
  fn: (when_result: Z, when_input: G) => void;
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

    const given = <T>(
      fn: (_: never) => T,
    ): GivenStep<T> & MetaData => ({
      kind: "given",
      label,
      fn,
    });

    given.from_fc = <T>(
      fn: (_: never) => fc.Arbitrary<T>,
    ): GivenFcStep<T> & MetaData => ({
      kind: "given_fc",
      label,
      fn,
    });

    given.such_as = <T>(
      fn: (_: never) => T[],
    ): GivenSuchAsStep<T> & MetaData => ({
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

    return <T, Z>(
      fn: (given_result: T) => Z,
    ): WhenStep<T, Z> & MetaData => ({
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

    return <Z, G>(
      fn: (when_result: Z, when_input: G) => void,
    ): ThenStep<Z, G> & MetaData => ({
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

    return <Z, G>(
      fn: (when_result: Z, when_input: G) => void,
    ): AndStep<Z, G> & MetaData => ({
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
    then: ThenStep<Z,GivenValue<G> > & MetaData,
    ...ands: AndStep<Z, GivenValue<G>>[]
  ) {


    describe(title, () => {

      if (given.kind === "given_such_as") {
        const given_values = given.fn(undefined as never);

        it.each
          (given_values)
          (`GIVEN ${given.label} WHEN ${when.label} THEN ${then.label}`, (given_result) => {
            const when_result = when.fn(given_result);
            then.fn(when_result,given_result);
            ands.forEach(and_expression => and_expression.fn(when_result, given_result))
          })
            return
          }

        it(
          `GIVEN ${given.label} WHEN ${when.label} THEN ${then.label}`,
          () => {
            if (given.kind === "given_fc") {
              fc.assert(
                fc.property(
                  given.fn(undefined as never),
                  (given_result) => {
                    const when_result = when.fn(given_result);
                    then.fn(when_result, given_result);
                    ands.forEach(and_expression => and_expression.fn(when_result, given_result))
                  },
                ),
              );

              return;
            }

            if (given.kind === "given") {
              const given_result = given.fn(undefined as never);
              const when_result = when.fn(given_result);
              then.fn(when_result, given_result);
              ands.forEach(and_expression => and_expression.fn(when_result, given_result))

              return;
            }
          },
        );
      });
  };
}
