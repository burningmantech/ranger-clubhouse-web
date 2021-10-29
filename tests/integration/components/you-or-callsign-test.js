import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | you-or-callsign', function (hooks) {
  setupRenderingTest(hooks);


  test('it renders', async function (assert) {
    this.owner.register('service:session', class MockService extends Service {
      get userId() {
        return 99;
      }
    });
    this.set('person', {id: 99, callsign: 'hubcap'})
    await render(hbs`<YouOrCallsign @person={{this.person}} @youLabel="you are" @callsignVerb="is" />`);

    assert.strictEqual(this.element.textContent.trim(), 'you are');

    this.set('person', {id: 88, callsign: 'bucket'})
    await render(hbs`<YouOrCallsign @person={{this.person}} @youLabel="you are" @callsignVerb="is" />`);

    assert.strictEqual(this.element.textContent.trim(), 'bucket is');
  });
});
