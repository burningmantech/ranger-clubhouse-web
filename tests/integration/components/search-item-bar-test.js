import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class SessionStub extends Service {
  user = { hasRole() { return true}, is_on_duty_at_hq: false  };
}

module('Integration | Component | search-item-bar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);
  });

  test('it renders', async function(assert) {
    await render(hbs`<SearchItemBar />`);
    assert.dom('div.row').exists();
    assert.dom('input').exists();
  });
});
