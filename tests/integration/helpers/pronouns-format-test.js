import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as Pronouns from 'clubhouse/constants/pronouns';

module('Integration | Helper | pronouns-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { pronouns: '', pronouns_custom: 'blah'});

    await render(hbs`{{pronouns-format this.person}}`);
    assert.strictEqual(this.element.textContent.trim(), '');

    this.set('person', {  pronouns: 'female', pronouns_custom: 'blah'});
    await render(hbs`{{pronouns-format this.person}}`);
    assert.strictEqual(this.element.textContent.trim(), '('+Pronouns.FEMALE_LABEL+')');

    this.set('person', {  pronouns: 'custom', pronouns_custom: 'abc/def/123'});
    await render(hbs`{{pronouns-format this.person}}`);
    assert.strictEqual(this.element.textContent.trim(),'(abc/def/123)');
  });
});
