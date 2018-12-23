import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch-form/select', function(hooks) {
  setupRenderingTest(hooks);

  test('it accepts array options', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', 'Banana');
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`{{ch-form/select value="Banana" options=options name="fruit" controlClass="myselect"}}`);

    assert.dom('select').hasClass('myselect');
    assert.dom('select').hasAttribute('name', 'fruit');
    assert.equal(this.element.querySelectorAll('select option').length, 4);
    assert.dom('select option[value="Apple"]').doesNotHaveAttribute('selected');
    assert.dom('select option[value="Apple"]').hasText('Apple');
    // TODO why isn't value option selected?
    //assert.dom('select option[value="Banana"]').hasAttribute('selected');
    assert.dom('select option[value="Banana"]').hasText('Banana');
  });

  test('it accepts object options', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', 'm');
    this.set('options', [{id: 'b', title: 'Berlin'}, {id: 'm', title: 'Moscow'}, {id: 't', title: 'Tokyo'}]);

    await render(hbs`{{ch-form/select value=value options=options name="fruit" controlClass="myselect"}}`);

    assert.dom('select').hasClass('myselect');
    assert.dom('select').hasAttribute('name', 'fruit');
    assert.equal(this.element.querySelectorAll('select option').length, 3);
    assert.dom('select option[value="b"]').hasText('Berlin');
    assert.dom('select option[value="b"]').doesNotHaveAttribute('selected');
    assert.dom('select option[value="m"]').hasText('Moscow');
    // TODO why isn't value option selected?
    //assert.dom('select option[value="m"]').hasAttribute('selected');
    assert.dom('select option[value="t"]').hasText('Tokyo');
    assert.dom('select option[value="t"]').doesNotHaveAttribute('selected');
  });

  test('it includes blank', async function(assert) {
    this.set('value', ''); // doesn't cause blank item to be selected
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`{{ch-form/select value=value options=options includeBlank=true}}`);

    assert.equal(this.element.querySelectorAll('select option').length, 5);
    assert.dom('select option').doesNotHaveAttribute('selected', 'true');
    assert.dom('select option').hasText('-');
    assert.dom('select option[value="Banana"]').doesNotHaveAttribute('selected');
    assert.dom('select option[value="Banana"]').hasText('Banana');
  });

  test('it supports multiple selection', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', ['Apple', 'Durian']);
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`{{ch-form/select value="Banana" options=options multiple=true}}`);

    assert.dom('select').hasAttribute('multiple');
    assert.equal(this.element.querySelectorAll('select option').length, 4);
    // TODO why isn't value option selected?
    assert.dom('select option[value="Apple"]').hasText('Apple');
    //assert.dom('select option[value="Apple"]').hasAttribute('selected');
    assert.dom('select option[value="Banana"]').hasText('Banana');
    assert.dom('select option[value="Banana"]').doesNotHaveAttribute('selected');
    assert.dom('select option[value="Cherry"]').hasText('Cherry');
    assert.dom('select option[value="Cherry"]').doesNotHaveAttribute('selected');
    // TODO why isn't value option selected?
    assert.dom('select option[value="Durian"]').hasText('Durian');
    //assert.dom('select option[value="Durian"]').hasAttribute('selected');
  });

});
