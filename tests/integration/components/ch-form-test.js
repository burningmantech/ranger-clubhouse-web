import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import $ from 'jquery';

module('Integration | Component | ch form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a basic form', async function(assert) {
    // Template block usage:

    const model = Object.create({ field1: 'something' });

    this.set('model', model);
    await render(hbs`
      {{#ch-form "someform" model as |f|}}
        Some form text
        {{f.input 'field1' type="text"}}
      {{/ch-form}}
    `);

    const form = $('form');
    assert.equal(form.text().trim(), 'Some form text');

    const input = $('input[type="text"]');
    assert.equal(input.attr('name'), 'field1');
    assert.equal(input.attr('value'), 'something');
  });
});
