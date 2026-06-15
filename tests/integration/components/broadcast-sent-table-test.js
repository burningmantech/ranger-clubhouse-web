import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Component | broadcast-sent-table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('result', { people: [] });

    await render(hbs`<BroadcastSentTable result={{this.result}} />`);

    assert.dom('table').exists();
  });
});
