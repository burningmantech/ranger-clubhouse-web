import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';

module('Integration | Component | popover', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Popover @title="A Title">some text</Popover>`);

    assert.dom('a').exists();
    // open the popover
    await click('a');
    assert.dom('.popover-header').exists().hasText('A Title');
    assert.dom('.popover-body').hasAnyText('some text');
  });
});
