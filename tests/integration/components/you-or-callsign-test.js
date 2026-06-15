import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | you-or-callsign', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', class MockSession extends Service {
      get userId() {
        return 99;
      }
    });
  });

  test('renders the you label when the person is the logged-in user', async function (assert) {
    this.set('person', {id: 99, callsign: 'hubcap'});

    await render(hbs`<YouOrCallsign @person={{this.person}} @youLabel="you are" @callsignVerb="is" />`);

    assert.strictEqual(this.element.textContent.trim(), 'you are');
  });

  test('renders the callsign and verb when the person is not the logged-in user', async function (assert) {
    this.set('person', {id: 88, callsign: 'bucket'});

    await render(hbs`<YouOrCallsign @person={{this.person}} @youLabel="you are" @callsignVerb="is" />`);

    assert.strictEqual(this.element.textContent.trim(), 'bucket is');
  });
});
