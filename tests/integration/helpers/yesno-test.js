import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Helper | yesno', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders Y for true and N for false', async function(assert) {
    this.set('value', true);
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('Y');

    this.set('value', false);
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('N');
  });

  test('it renders Y for truthy non-boolean values', async function(assert) {
    this.set('value', 1);
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('Y');

    this.set('value', 'hello');
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('Y');
  });

  test('it renders N for falsy non-boolean values', async function(assert) {
    this.set('value', 0);
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('N');

    this.set('value', '');
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('N');

    this.set('value', null);
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('N');

    this.set('value', undefined);
    await render(hbs`{{yesno this.value}}`);
    assert.dom(this.element).hasText('N');
  });
});
