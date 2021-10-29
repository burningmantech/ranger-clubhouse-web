import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | year-range', function(hooks) {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('years', [ 2011, 2012, 2015, 2017, 2018, 2019, 2020]);

    await render(hbs`{{year-range this.years}}`);

    assert.strictEqual(this.element.textContent.trim(), '2011 - 2012, 2015, 2017 - 2020');
  });
});
