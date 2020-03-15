import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

const sessionStub = Service.extend({
  user: { hasRole() { return true}, is_on_duty_at_hq: false  }, // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
});

module('Integration | Component | search-item-bar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', sessionStub);
  });

  test('it renders', async function(assert) {

    await render(hbs`<SearchItemBar />`);
    assert.dom('div.row').exists();
    assert.dom('input').exists();
  });
});
