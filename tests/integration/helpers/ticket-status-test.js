import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | ticket-status', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {

    await render(hbs`{{ticket-status 'expired'}}`);
    assert.dom('span').hasClass('class', 'text-danger').hasText(/Expired/);

    await render(hbs`{{ticket-status 'blahblah'}}`);
    assert.dom('*').hasText(/blahblah/);
  });
});
