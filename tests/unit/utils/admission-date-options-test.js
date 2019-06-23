import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import { module, test } from 'qunit';

module('Unit | Utility | admission-date-options', function() {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = admissionDateOptions(2019, "1-3");

    const match = [
      [ 'Unspecified', '' ],
      [ 'Sat, 08/03/19', '2019-08-03' ],
      [ 'Fri, 08/02/19', '2019-08-02' ],
      [ 'Thu, 08/01/19', '2019-08-01' ],
      [ 'Any', 'any' ],
    ];

    assert.deepEqual(match, result);
  });
});
