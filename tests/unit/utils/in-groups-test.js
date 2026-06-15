import inGroups from 'clubhouse/utils/in-groups';
import { module, test } from 'qunit';

module('Unit | Utility | in-groups', function(/*hooks*/) {

  test('empty array yields an empty result', function(assert) {
    assert.deepEqual(inGroups([], 5), []);
  });

  test('a group count below 2 returns the whole array as a single group', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 1), [[1, 2, 3]]);
    assert.deepEqual(inGroups([1, 2, 3], 0), [[1, 2, 3]]);
    assert.deepEqual(inGroups([1, 2, 3], -1), [[1, 2, 3]]);
  });

  test('an odd-length array into two groups splits with the remainder trailing', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 2), [[1, 2], [3]]);
  });

  test('an evenly divisible array splits into equal groups', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
  });

  test('more groups than elements, balanced, gives one element per group', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 5, true), [[1], [2], [3]]);
  });

  test('more groups than elements, unbalanced, returns a single group', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 5), [[1, 2, 3]]);
  });

  test('seven elements into three balanced groups front-loads the larger group', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3, 4, 5, 6, 7], 3, true), [[1, 2, 3], [4, 5], [6, 7]]);
  });

  test('seven elements into three unbalanced groups trails the remainder', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3, 4, 5, 6, 7], 3), [[1, 2, 3], [4, 5, 6], [7]]);
  });
});
