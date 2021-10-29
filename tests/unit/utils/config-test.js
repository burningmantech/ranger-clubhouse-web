import { config } from 'clubhouse/utils/config';
import { module, test } from 'qunit';
import ENV from 'clubhouse/config/environment';

module('Unit | Utility | config', function(/*hooks*/) {

  test('it works', function(assert) {
    ENV['clientConfig'] = { MyTest: 'Dusty'};

    let result = config('MyTest');

    assert.strictEqual(result, 'Dusty', 'Returned correct value');
  });
});
