import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import { module, test } from 'qunit';
import dayjs from 'dayjs';

module('Unit | Utility | admission-date-options', function(hooks) {

  hooks.beforeEach(function() {
    // Labels are produced with dayjs' English locale; pin it so the
    // formatted-day assertions are deterministic regardless of the runner's
    // configured locale.
    dayjs.locale('en');
  });

  test('it builds the option list for an explicit day range', function(assert) {
    const result = admissionDateOptions(2019, '1-3');

    const expected = [
      [ 'Unspecified', '' ],
      [ 'Sat, 08/03/19', '2019-08-03' ],
      [ 'Fri, 08/02/19', '2019-08-02' ],
      [ 'Thu, 08/01/19', '2019-08-01' ],
      [ 'Any', 'any' ],
    ];

    assert.deepEqual(result, expected);
  });

  test('it falls back to days 5-26 when the range is null', function(assert) {
    const result = admissionDateOptions(2019, null);

    // Unspecified + 22 days (5..26 inclusive) + Any.
    assert.strictEqual(result.length, 24);
    assert.deepEqual(result[0], [ 'Unspecified', '' ]);
    assert.strictEqual(result[1][1], '2019-08-26', 'first day option is the high end');
    assert.strictEqual(result[22][1], '2019-08-05', 'last day option is the low end');
    assert.deepEqual(result[result.length - 1], [ 'Any', 'any' ]);
  });

  test('a malformed range falls back to the 5-26 default', function(assert) {
    const result = admissionDateOptions(2019, '-');

    assert.strictEqual(result.length, 24);
    assert.strictEqual(result[1][1], '2019-08-26');
    assert.strictEqual(result[22][1], '2019-08-05');
  });

  test('an original date not already present is prepended', function(assert) {
    const result = admissionDateOptions(2019, '1-3', '2019-12-25');

    assert.strictEqual(result[0][1], '2019-12-25', 'original date is the first option');
    // The standard list still follows, starting with Unspecified.
    assert.deepEqual(result[1], [ 'Unspecified', '' ]);
    assert.deepEqual(result[result.length - 1], [ 'Any', 'any' ]);
  });

  test('an original date already in the range is not duplicated', function(assert) {
    const result = admissionDateOptions(2019, '1-3', '2019-08-02');

    const matches = result.filter((opt) => opt[1] === '2019-08-02');
    assert.strictEqual(matches.length, 1, 'the existing option is not prepended again');
    assert.deepEqual(result[0], [ 'Unspecified', '' ]);
  });
});
