/* eslint-disable @typescript-eslint/no-explicit-any */
import { Feature, flattenFeature } from ".";

describe("feature ", () => {
  it("tests empty features ", () => {
    const featureEmptyTree: Feature = {};

    expect(Object.entries(featureEmptyTree).length).toEqual(0);
  });

  it("tests features ", () => {
    const featureTree1: Feature = {
      ALLOW_ENEMIES: false,
      WITH_ENEMIES: {
        MAX_AMOUNT: 10,
        MAX_HEALTH: 100,
        MAX_SPEED: 1,
        DEFAULT_AVATAR: "🤖 ",
      },
    };

    expect(Object.entries(featureTree1).length).toEqual(2);

    const testFeature: Feature = {
      ui: {
        darkMode: true,
        responsiveLayout: {
          mobile: true,
          desktop: false,
        },
      },
      performance: {
        caching: "aggressive",
        lazyLoading: {
          enabled: true,
          threshold: 200,
        },
      },
    };

    const result = flattenFeature(testFeature);
    expect(Object.keys(result).length).toEqual(6);
  });
});
