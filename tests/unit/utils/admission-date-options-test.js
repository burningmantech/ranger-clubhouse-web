import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import { module, test } from 'qunit';

module('Unit | Utility | admission-date-options', function() {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = admissionDateOptions(2019, "20-25");

    const match = [
      [ 'Unspecified', '' ],
      [ 'Sun, 08/25/19', '2019-08-25' ],
      [ 'Sat, 08/24/19', '2019-08-24' ],
      [ 'Fri, 08/23/19', '2019-08-23' ],
      [ 'Thu, 08/22/19', '2019-08-22' ],
      [ 'Wed, 08/21/19', '2019-08-21' ],
      [ 'Tue, 08/20/19', '2019-08-20' ],
      [ 'Any', 'any' ],
    ];

    assert.deepEqual(match, result);
  });
});
