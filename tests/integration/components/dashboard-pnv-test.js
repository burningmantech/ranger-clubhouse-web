import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';
import Service from '@ember/service';

// Stub out session so the component's `isNotUser` getter resolves against a
// known userId.
class ServiceStub extends Service {
  user = {isAdmin: true, isVC: true};
  userId = 0;
}

module('Integration | Component | dashboard-pnv', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', ServiceStub);
  });

  test('it renders the onboarding checklist, greeting, announcements, and step groups', async function (assert) {
    const person = this.server.create('person', {status: 'active', callsign: 'Hubcap', roles: []});

    this.sessionService = this.owner.lookup('service:session');
    this.set('sessionService.userId', person.id);
    this.set('person', person);
    this.set('milestones', {
      training: {status: 'pending'},
      alpha_shift: {status: 'pending'},
      surveys: {sessions: [], trainers: []},
    });
    this.set('photo', {photo_status: 'approved'});
    this.set('motds', [{id: 1, subject: 'Test Announcement', created_at: '2020-01-01 12:34:56', message: 'Hello'}]);
    this.uploadAction = spy();
    this.showBehaviorAgreementAction = spy();
    this.debugUpdateAction = spy();

    await render(hbs`<DashboardPnv @milestones={{this.milestones}}
                  @person={{this.person}}
                  @photo={{this.photo}}
                  @motds={{this.motds}}
                  @uploadAction={{this.uploadAction}}
                  @showBehaviorAgreementAction={{this.showBehaviorAgreementAction}}
                  @debugUpdateAction={{this.debugUpdateAction}} />`);

    // Title and personalized greeting (status active, not prospective => "Alpha").
    assert.dom('.homepage-title').hasText('Clubhouse Onboarding Checklist', 'the onboarding title renders');
    assert.dom(this.element).includesText('Hello Alpha Hubcap.', 'the greeting addresses the Alpha by callsign');

    // @motds is supplied, so the announcement subject renders via DashboardMotd.
    assert.dom(this.element).includesText('Test Announcement', 'the announcement subject renders');

    // The step groups render as a checklist of dashboard groups.
    assert.dom('.dashboard-box').exists('the checklist container renders');
    assert.dom('.dashboard-group').exists('at least one step group renders');
    assert.dom('.dashboard-group-title-text').exists('a step group title renders');
  });
});
