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

    await render(hbs`{{ch-form/select name="test" value="Banana" options=options name="fruit" controlClass="myselect"}}`);

    assert.dom('select').hasClass('myselect');
    assert.dom('select').hasAttribute('name', 'fruit');
    assert.dom('option').exists({ count: 4 }, 'should render 4 options');
    assert.equal(this.element.querySelector('select option[value="Apple"]').selected, false);
    assert.dom('select option[value="Apple"]').hasText('Apple');
    assert.equal(this.element.querySelector('select option[value="Banana"]').selected, true);
    assert.dom('select option[value="Banana"]').hasText('Banana');
  });

  test('it accepts object options', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', 'm');
    this.set('options', [{id: 'b', title: 'Berlin'}, {id: 'm', title: 'Moscow'}, {id: 't', title: 'Tokyo'}]);

    await render(hbs`{{ch-form/select name="test" value=value options=options name="fruit" controlClass="myselect"}}`);

    assert.dom('select').hasClass('myselect');
    assert.dom('select').hasAttribute('name', 'fruit');
    assert.dom('option').exists({ count: 3 }, 'should render 3 options');
    assert.dom('select option[value="b"]').hasText('Berlin');
    assert.equal(this.element.querySelector('select option[value="b"]').selected, false);
    assert.dom('select option[value="m"]').hasText('Moscow');
    assert.equal(this.element.querySelector('select option[value="m"]').selected, true);
    assert.dom('select option[value="t"]').hasText('Tokyo');
    assert.dom('select option[value="t"]').doesNotHaveAttribute('selected');
  });

  test('it includes blank', async function(assert) {
    this.set('value', '');
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`{{ch-form/select name="test" value=value options=options includeBlank=true}}`);

    assert.dom('select option').exists({ count: 5 }, 'should render 5 options');
    assert.equal(this.element.querySelector('option[value=""]').selected, true);
    assert.dom('option').hasText('-');
    assert.equal(this.element.querySelector('option[value="Banana"]').selected, false);
    assert.dom('option[value="Banana"]').hasText('Banana');
  });

  test('it supports multiple selection', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', ['Apple', 'Durian']);
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`{{ch-form/select name="test" value=value options=options multiple=true}}`);

    assert.dom('select').hasAttribute('multiple');
    assert.dom('select option').exists({ count: 4 }, 'should render 4 options');
    assert.dom('select option[value="Apple"]').hasText('Apple');
    assert.equal(this.element.querySelector('select option[value="Apple"]').selected, true, 'Apple should be selected');
    assert.dom('select option[value="Banana"]').hasText('Banana');
    assert.equal(this.element.querySelector('select option[value="Banana"]').selected, false, 'Banana should not be selected');
    assert.dom('select option[value="Cherry"]').hasText('Cherry');
    assert.equal(this.element.querySelector('select option[value="Cherry"]').selected, false, 'Cherry should not be selected');
    assert.dom('select option[value="Durian"]').hasText('Durian');
    assert.equal(this.element.querySelector('select option[value="Durian"]').selected, true, 'Durian should be selected');
  });

});
