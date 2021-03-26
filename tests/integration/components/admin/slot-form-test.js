import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | admin/slot-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.server.loadFixtures();

    const slot = this.server.create('slot', {
      begins: '2018-09-01 11:45:00',
      ends: '2018-09-01 18:15:00',
      position_id: 2,
      description: 'Afternoon',
      active: true
    });

    this.set('slot', slot);
    this.set('positions', [ { id: 1, title: 'Alpha' }]);
    this.set('trainerSlots', [{ id: 99, title: 'Position 99'}]);
    this.set('onCancel', () => { });
    this.set('onSave', () => { });
    this.set('onClone', () => { });

    await render(hbs`<Admin::SlotForm @slot={{this.slot}} @positions={{this.positions}}
        @trainerSlots={{this.trainerSlots}} @onCancel={{this.onCancel}} @onSave={{this.onSave}} @onClone={{this.onClone}} />`);

    //assert.dom(this.element).hasText('');
    assert.dom('input#slot-description').hasValue('Afternoon');
    assert.dom('input#slot-active').isChecked();
    assert.dom('select[name=position_id]').hasValue('1');
  });
});
