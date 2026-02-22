const { test, describe } = require("node:test");
const assert = require("node:assert");

const average = require("../utils/for_testing").average;

describe("average", () => {
  test("of one value is the value itself", () => {
    assert.strictEqual(average([5]), 5);
  });

  test("of many is calculated correctly", () => {
    assert.strictEqual(average([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 5.5);
  });

  test("of empty array is zero", () => {
    assert.strictEqual(average([]), 0);
  });
});
