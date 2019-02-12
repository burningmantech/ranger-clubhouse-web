import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | admin/slot-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    server.loadFixtures();

    const store = this.owner.lookup('service:store');
    const slot = server.create('slot', {
      begins: '2018-09-01 11:45:00',
      ends: '2018-09-01 18:15:00',
      position_id: 2,
      description: 'Afternoon',
      active: true
    });

    const positions = await store.query('position', {});
    this.set('slot', slot);
    this.set('positions', positions);
    this.set('trainerSlots', []);
    this.set('onCancel', () => { });
    this.set('onSave', () => { });

    await render(hbs`{{admin/slot-form slot=slot positions=positions trainerSlots=trainerSlots onCancel=onCancel onSave=onSave}}`);

    //assert.dom(this.element).hasText('');
    assert.dom('input#slot-description').hasValue('Afternoon');
    assert.dom('input#slot-active').isChecked();
    assert.dom('select[name=position_id]').hasValue('2');
  });
});
