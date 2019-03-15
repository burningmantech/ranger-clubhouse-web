import inGroups from 'clubhouse/utils/in-groups';
import { module, test } from 'qunit';

module('Unit | Utility | in-groups', function(/*hooks*/) {

  test('empty', function(assert) {
    assert.deepEqual(inGroups([], 5), []);
  });

  test('justOne', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 1), [[1, 2, 3]]);
  });

  test('twoOdd', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 2), [[1, 2], [3]]);
  });

  test('twoEven', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
  });

  test('notEnough - balanced', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 5, true), [[1], [2], [3]],);
  });
  test('notEnough - unbalanced', function(assert) {
    assert.deepEqual(inGroups([1, 2, 3], 5), [[1,2,3]],);
  });
});
