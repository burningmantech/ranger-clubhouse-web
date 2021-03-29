import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { STAFF_CREDENTIAL} from 'clubhouse/models/access-document';

module('Integration | Helper | ticket-type-human', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('type', STAFF_CREDENTIAL);
    await render(hbs`{{ticket-type-human this.type}}`);

    assert.dom(this.element).hasText(/Staff Credential/);

    await render(hbs`{{ticket-type-human 'blah'}}`);
    assert.dom(this.element).hasText(/blah/);
  });
});
