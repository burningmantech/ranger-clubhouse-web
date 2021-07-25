import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Helper | dayjs-format', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the given date', async function (assert) {
    await render(hbs`{{dayjs-format "2020-01-01 01:00:00" "YYYY"}}`);
    assert.dom(this.element).hasText('2020');

  });

  test('it renders now', async function (assert) {
    await render(hbs`{{dayjs-format "" "YYYY"}}`);
    assert.dom(this.element).hasText((new Date).getFullYear().toString());
  });

  test('it renders with the advanced format plugin', async function (assert) {
    await render(hbs`{{dayjs-format "2020-01-05 01:00:00" "Do"}}`);
    assert.dom(this.element).hasText("5th");
  });

  test('it renders with the object support plugin', async function (assert) {
    this.set('objValue', {year: 2021, month: 1, day: 5})
    await render(hbs`{{dayjs-format this.objValue "YYYY-MM-DD"}}`);
    // Yes, objValue.month == 1, and the expected month string is 02.. because javascript.
    assert.dom(this.element).hasText("2021-02-05");
  });

});
