import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';
import {makePerson} from 'clubhouse/tests/helpers/factories';
import Service from '@ember/service';

// The component's `isNotUser` getter reads session.userId.
class ServiceStub extends Service {
  userId = 0;
}

module('Integration | Component | dashboard-auditor', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', ServiceStub);
  });

  test('it renders the auditor checklist, greeting, and the auditor advisory note', async function (assert) {
    this.set('person', makePerson({callsign: 'Hubcap', first_name: 'Pat', status: 'auditor'}));
    // No `period` => in-season => the auditor steps (not the off-season message) render.
    this.set('milestones', {
      training: {status: 'pending'},
      alpha_shift: {status: 'pending'},
      surveys: {sessions: [], trainers: []},
    });
    this.set('motds', [{id: 1, subject: 'Auditor Notice', created_at: '2020-01-01 12:34:56', message: 'Hi'}]);
    this.showBehaviorAgreementAction = spy();
    this.debugUpdateAction = spy();

    await render(hbs`<DashboardAuditor
                    @milestones={{this.milestones}}
                    @person={{this.person}}
                    @motds={{this.motds}}
                    @showBehaviorAgreementAction={{this.showBehaviorAgreementAction}}
                    @debugUpdateAction={{this.debugUpdateAction}} />`);

    assert.dom('div.homepage-title').hasText('Clubhouse Auditor Checklist', 'the auditor title renders');
    assert.dom(this.element).includesText(
      'Hello Auditor Pat. Your Clubhouse handle is Hubcap.',
      'the greeting addresses the auditor by name and callsign'
    );

    // The supplied @motds renders the announcement subject.
    assert.dom(this.element).includesText('Auditor Notice', 'the announcement subject renders');

    // The fixed auditor advisory note renders.
    assert.dom(this.element).includesText(
      'You are NOT on a path to becoming a Black Rock Ranger.',
      'the auditor advisory note renders'
    );

    // In-season => the off-season "trainings will not be available" paragraph is hidden.
    assert.dom(this.element).doesNotIncludeText(
      'trainings will not',
      'the off-season message is hidden when no off-season period is set'
    );

    // The checklist group with its steps renders.
    assert.dom('.dashboard-box').exists('the auditor checklist container renders');
  });
});
