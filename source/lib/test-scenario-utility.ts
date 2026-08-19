import fc from "fast-check";
import { describe, it } from "vitest";

export function scenario(scenario_title: string) {
  return {
    fc: () => scenario_fc(scenario_title),
    for_values: <GivenValues extends readonly any[]>(given_values: GivenValues) => scenario_for_values(scenario_title, given_values),
    given: <GivenValue>(given_label: string, arrange: () => GivenValue) => ({
      when: <WhenResult>(when_label: string, act: (given_value: GivenValue) => WhenResult) => ({
        then: (then_label: string, assert: (when_result: WhenResult, given_val: GivenValue) => void) => {
          describe(scenario_title, () => {
            it(`GIVEN ${given_label} WHEN ${when_label} THEN ${then_label}`, () => {
              const given_value = arrange();
              const when_result = act(given_value);
              assert(when_result, given_value);
            });
          });
        },
      }),
    }),
  };
}

function scenario_for_values<InitialValue>(scenario_title: string, initial_values: readonly InitialValue[]) {
  return {
    given: <GivenValue>(given_label: string, arrange: (initial_value: InitialValue) => GivenValue) => ({
      when: <WhenResult>(
        when_label: string,
        act: (given_value: GivenValue) => WhenResult
      ) => ({
        then: (
          then_label: string,
          assert: (when_result: WhenResult, given_value: GivenValue) => void
        ) => {
          describe(scenario_title, () => {
            const given_values = initial_values.map(arrange)
            it.each(given_values)(
              `GIVEN ${given_label} WHEN ${when_label} THEN ${then_label}`,
              (given_value) => {
                const when_result = act(given_value);
                assert(when_result, given_value);
              }
            );
          });
        },
      }),
    }),
  };
}


function scenario_fc(scenarioTitle: string) {
  return {
    given: <GivenSetupResult>(
      givenLabel: string,
      setup: () => fc.Arbitrary<GivenSetupResult>
    ) => ({
      when: <WhenActionResult>(
        whenLabel: string,
        action: (givenVal: GivenSetupResult) => WhenActionResult
      ) => ({
        then: (
          thenLabel: string,
          assertion: (whenResult: WhenActionResult, givenVal: GivenSetupResult) => void
        ) => {
          describe(scenarioTitle, () => {
            it(`GIVEN ${givenLabel} WHEN ${whenLabel} THEN ${thenLabel}`, () => {
              const arbitrary = setup();

              fc.assert(
                fc.property(arbitrary, (givenVal) => {
                  const whenResult = action(givenVal);
                  assertion(whenResult, givenVal);
                })
              );
            });
          });
        },
      }),
    }),
  };
}
