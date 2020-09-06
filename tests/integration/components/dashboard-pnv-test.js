import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import Service from '@ember/service';

// Stub out session

const sessionStub = Service.extend({
  user: {isAdmin: true, isVC: true}, // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
  userId: 0
});

module('Integration | Component | dashboard-pnv', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', sessionStub);
  });

  test('it renders', async function (assert) {
    const person = server.create('person', {roles: []});

    this.sessionService = this.owner.lookup('service:session');
    this.set('sessionService.userId', person.id);
    this.set('person', person);
    this.set('milestones', {
      training: {status: 'pending'},
      alpha_shift: {status: 'pending'},
      surveys: {sessions: [], trainers: []}
    });
    this.set('photo', {photo_status: 'approved'});
    this.set('uploadAction', () => {});
    this.set('showBehaviorAgreementAction', () => {});
    this.set('debugUpdateAction', () => {});
    await render(hbs`<DashboardPnv @milestones={{this.milestones}}
                  @person={{this.person}}
                  @photo={{this.photo}}
                  @motds={{this.motds}}
                  @uploadAction={{this.showUploadDialogAction}}
                  @showBehaviorAgreementAction={{this.showBehaviorAgreementAction}}
                  @debugUpdateAction={{this.debugUpdateAction}} />`);

    assert.dom('.mugshot').exists();
    assert.dom('.dashboard-box').exists();
    assert.dom('.dashboard-group').exists();
  });
});
