import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

// Stub out session

class SessionStub extends Service {
  user = { isAdmin: true, isVC: true };
  userId = 0;
}

module('Integration | Component | dashboard-ranger', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);
  });
  test('it renders', async function(assert) {
    const person = server.create('person', { roles: [  ]});

    this.sessionService = this.owner.lookup('service:session');
    this.set('sessionService.userId', person.id);
    this.set('person', person);
    this.set('milestones', { period: 'after-event', training: { status: 'pending' }, alpha_shift: { status: 'pending' }});
    this.set('photo', { });
    this.set('motds', [])
    this.set('noop', () => { });
    await render(hbs`<DashboardRanger
                    @milestones={{this.milestones}}
                    @person={{this.person}}
                    @photo={{this.photo}}
                    @motds={{this.motds}}
                    @debugUpdateAction={{this.noop}}
                    @uploadAction={{this.noop}}
                    @showBehaviorAgreementAction={{this.noop}}
                    />`);

    assert.dom('div.dashboard-box').exists();
  });
});
