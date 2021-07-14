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

    await render(hbs`<ChForm::Select @name="test" @value="Banana" @options={{this.options}} @name="fruit" @controlClass="myselect" />`);

    assert.dom('select').hasClass('myselect');
    assert.dom('select').hasAttribute('name', 'test');
    assert.dom('option').exists({ count: 4 }, 'should render 4 options');
    assert.false(this.element.querySelector('select option[value="Apple"]').selected);
    assert.dom('select option[value="Apple"]').hasText('Apple');
    assert.true(this.element.querySelector('select option[value="Banana"]').selected);
    assert.dom('select option[value="Banana"]').hasText('Banana');
  });

  test('it accepts object options', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', 'm');
    this.set('options', [{id: 'b', title: 'Berlin'}, {id: 'm', title: 'Moscow'}, {id: 't', title: 'Tokyo'}]);

    await render(hbs`<ChForm::Select @name="test" @value={{this.value}} @options={{this.options}} @controlClass="myselect" />`);

    assert.dom('select').hasClass('myselect');
    assert.dom('select').hasAttribute('name', 'test');
    assert.dom('option').exists({ count: 3 }, 'should render 3 options');
    assert.dom('select option[value="b"]').hasText('Berlin');
    assert.false(this.element.querySelector('select option[value="b"]').selected);
    assert.dom('select option[value="m"]').hasText('Moscow');
    assert.true(this.element.querySelector('select option[value="m"]').selected);
    assert.dom('select option[value="t"]').hasText('Tokyo');
    assert.dom('select option[value="t"]').doesNotHaveAttribute('selected');
  });

  test('it includes blank', async function(assert) {
    this.set('value', '');
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`<ChForm::Select @name="test" @value={{this.value}} @options={{this.options}} @includeBlank={{true}} />`);

    assert.dom('select option').exists({ count: 5 }, 'should render 5 options');
    assert.true(this.element.querySelector('option[value=""]').selected);
    assert.dom('option').hasText('-');
    assert.false(this.element.querySelector('option[value="Banana"]').selected);
    assert.dom('option[value="Banana"]').hasText('Banana');
  });

  test('it supports multiple selection', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('value', ['Apple', 'Durian']);
    this.set('options', ['Apple', 'Banana', 'Cherry', 'Durian']);

    await render(hbs`<ChForm::Select @name="test" @value={{this.value}} @options={{this.options}} @multiple={{true}} />`);

    assert.dom('select').hasAttribute('multiple');
    assert.dom('select option').exists({ count: 4 }, 'should render 4 options');
    assert.dom('select option[value="Apple"]').hasText('Apple');
    assert.true(this.element.querySelector('select option[value="Apple"]').selected, 'Apple should be selected');
    assert.dom('select option[value="Banana"]').hasText('Banana');
    assert.false(this.element.querySelector('select option[value="Banana"]').selected,  'Banana should not be selected');
    assert.dom('select option[value="Cherry"]').hasText('Cherry');
    assert.false(this.element.querySelector('select option[value="Cherry"]').selected, 'Cherry should not be selected');
    assert.dom('select option[value="Durian"]').hasText('Durian');
    assert.true(this.element.querySelector('select option[value="Durian"]').selected, 'Durian should be selected');
  });

});
