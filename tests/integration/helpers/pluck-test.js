import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
//import { A } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | pluck', function(hooks) {
  setupRenderingTest(hooks);

  const records = [
    { id: 1, title: 'row 1' },
    { id: 2, title: 'row 2' },
  ];

  test('it finds the record', async function(assert) {
    this.setProperties({
      pluckId: 1,
      records,
      column: 'title',
      defaultValue: 'nothing'
    });

    await render(hbs`{{pluck this.pluckId this.records this.column this.defaultValue}}`);

    assert.dom(this.element).hasText('row 1');
  });

  test('it does not find the record', async function(assert) {
    this.setProperties({
      pluckId: 999,
      records,
      column: 'title',
      defaultValue: 'nothing'
    });

    await render(hbs`{{pluck this.pluckId this.records this.column this.defaultValue}}`);

    assert.dom(this.element).hasText('nothing');
  });

});
