import {setting} from 'clubhouse/utils/setting';
import { module, test } from 'qunit';
import ENV from 'clubhouse/config/environment';

module('Unit | Utility | config', function(/*hooks*/) {

  test('it works', function(assert) {
    ENV['clientConfig'] = { MyTest: 'Dusty'};

    let result = setting('MyTest');

    assert.strictEqual(result, 'Dusty', 'Returned correct value');
  });
});
