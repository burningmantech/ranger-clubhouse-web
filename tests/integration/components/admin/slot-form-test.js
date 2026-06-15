import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {click, render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | admin/slot-form', function (hooks) {
  setupRenderingTest(hooks);

  // A valid, *persisted* slot per the form contract: description present,
  // begins < ends, a numeric position_id and max so the changeset validates
  // and onSave can actually fire. It must be a real Ember Data record pushed
  // into the store (not a Mirage record) so `slot.isNew` is false — that drives
  // the "Update" submit label and the presence of the clone button.
  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    this.set('slot', store.push({
      data: {
        id: '10',
        type: 'slot',
        attributes: {
          begins: '2018-09-01 11:45:00',
          ends: '2018-09-01 18:15:00',
          position_id: 2,
          description: 'Afternoon',
          max: 5,
          active: true,
        },
      },
    }));
    this.set('slots', []);
    this.set('positions', [
      {id: 1, title: 'Alpha', active: true},
      {id: 2, title: 'Position 2', active: true},
    ]);
    this.set('trainerSlots', [{id: 99, title: 'Position 99'}]);
    this.set('onCancel', spy());
    this.set('onSave', spy());
    this.set('onClone', spy());
  });

  async function renderForm(context) {
    await render(hbs`<Admin::SlotForm @slot={{this.slot}} @positions={{this.positions}} @slots={{this.slots}}
        @trainerSlots={{this.trainerSlots}} @onCancel={{this.onCancel}} @onSave={{this.onSave}} @onClone={{this.onClone}} />`);
    return context;
  }

  test('it renders the slot values into the form fields', async function (assert) {
    await renderForm(this);

    assert.dom('input#slot-description').hasValue('Afternoon');
    assert.dom('input#slot-active').isChecked();
    assert.dom('select[name=position_id]').hasValue('2');
  });

  test('clicking the back link invokes onCancel', async function (assert) {
    await renderForm(this);

    // Both "Back to slots listing" links share the onCancel handler; click the first.
    await click(this.element.querySelector('a'));

    assert.true(this.onCancel.called, 'onCancel fired');
    assert.false(this.onSave.called, 'onSave did not fire');
  });

  function buttonByLabel(context, label) {
    return [...context.element.querySelectorAll('button.btn-submit')]
      .find((b) => b.textContent.includes(label));
  }

  test('submitting the valid form invokes onSave with the changeset', async function (assert) {
    await renderForm(this);

    const updateButton = buttonByLabel(this, 'Update');
    assert.dom(updateButton).exists('the Update submit button is present');

    await click(updateButton);

    assert.true(this.onSave.called, 'onSave fired on submit');
    // onSubmit receives (changeset, isValid, originalModel).
    assert.true(this.onSave.lastArgs[1], 'form submitted as valid');
    assert.false(this.onClone.called, 'onClone did not fire for the update action');
  });

  test('clicking "Create new slot from this one" invokes onClone', async function (assert) {
    await renderForm(this);

    const cloneButton = buttonByLabel(this, 'Create new slot from this one');
    assert.dom(cloneButton).exists('clone button is present for an existing slot');

    await click(cloneButton);

    assert.true(this.onClone.called, 'onClone fired');
    assert.false(this.onSave.called, 'onSave did not fire for the clone action');
  });
});
