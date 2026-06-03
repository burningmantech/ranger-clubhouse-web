import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | popover', function (hooks) {
  setupRenderingTest(hooks);

  test('renders the trigger text and reveals the title and body on click', async function (assert) {
    await render(hbs`<Popover @title="A Title" @text="More info">Body content</Popover>`);

    assert.dom('a').exists('renders the trigger link');
    assert.dom('a').hasText('More info', 'trigger shows the @text');

    // open the popover
    await click('a');

    assert.dom('.popover-header').exists().hasText('A Title');
    assert.dom('.popover-body').includesText('Body content', 'body shows the yielded content');
    assert.dom('.popover-body button').hasText('Close', 'body includes the close button');
  });
});
