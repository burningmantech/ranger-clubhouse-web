import { module, test } from 'qunit';
import {
  HUMAN_QUESTION,
  HUMAN_ANSWER,
  isHumanAnswerValid,
} from 'clubhouse/utils/human-check';

module('Unit | Utility | human-check', function () {
  test('the question text and the expected answer never drift apart', function (assert) {
    // Guards M1: the prompt the user sees and the value createAccount() checks
    // against must always agree. Parse the operands back out of the question
    // and confirm they sum to HUMAN_ANSWER.
    const operands = HUMAN_QUESTION.match(/\d+/g).map((n) => parseInt(n, 10));
    const sum = operands.reduce((total, n) => total + n, 0);
    assert.strictEqual(sum, HUMAN_ANSWER, `"${HUMAN_QUESTION}" must equal ${HUMAN_ANSWER}`);
  });

  test('it accepts the exact integer answer, trimmed', function (assert) {
    assert.true(isHumanAnswerValid(String(HUMAN_ANSWER)));
    assert.true(isHumanAnswerValid(`  ${HUMAN_ANSWER}  `));
  });

  test('it rejects decorated, non-numeric, and wrong answers', function (assert) {
    assert.false(isHumanAnswerValid('35.0'), 'no decimals');
    assert.false(isHumanAnswerValid('+35'), 'no sign prefix');
    assert.false(isHumanAnswerValid('35x'), 'no trailing junk');
    assert.false(isHumanAnswerValid('34'), 'wrong number');
    assert.false(isHumanAnswerValid(''), 'empty string');
    assert.false(isHumanAnswerValid(null), 'null');
    assert.false(isHumanAnswerValid(undefined), 'undefined');
  });

  test('it throws on a numeric (non-string) input because it calls .trim()', function (assert) {
    // The helper does `(raw ?? '').trim()`. A number is not nullish, so the ??
    // passes it straight through and `.trim` is not a function — this throws.
    // Callers are expected to pass the raw string field value.
    assert.throws(() => isHumanAnswerValid(HUMAN_ANSWER), TypeError);
  });

  test('it accepts leading-zero forms that parse to the answer (preserved behavior)', function (assert) {
    // The digits-only regex passes '035' and parseInt('035', 10) === 35. This is
    // unchanged from the original controller; documented here so a future tighten
    // is a deliberate decision, not an accident.
    assert.true(isHumanAnswerValid('035'));
  });
});
