import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-auditor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('person', {});
    this.set('milestones', {
      training: {status: 'pending'}, alpha_shift: {status: 'pending'}, surveys: {sessions: [], trainers: []}
    });
    this.set('motds', []);
    this.set('showBehaviorAgreementAction', () => {});
    this.set('debugUpdateAction', () => {});

    await render(hbs`<DashboardAuditor
                    @milestones={{this.milestones}}
                    @person={{this.person}}
                    @motds={{this.motds}}
                    @showBehaviorAgreementAction={{this.showBehaviorAgreementAction}}
                    @debugUpdateAction={{this.debugUpdateAction}}
                    />`);

    assert.dom('div.homepage-title').exists();
  });
});
