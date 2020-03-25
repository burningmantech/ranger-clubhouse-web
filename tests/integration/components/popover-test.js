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

    await render(hbs`
        <Popover @title="A Title">
            some text
        </Popover>
    `);

    assert.dom('div.popover-container').exists();
    assert.dom('.popover-container a ').exists();
    // open the popover
    await click('.popover-container a');
    assert.dom('h3').exists().hasText('A Title');
    assert.dom('div.popover-body').hasAnyText('some text');
  });
});
