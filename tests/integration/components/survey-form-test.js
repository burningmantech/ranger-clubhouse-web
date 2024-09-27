import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {authenticateUser} from "../../helpers/authenticate-user";
import { run } from '@ember/runloop';

module('Integration | Component | survey-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const store = this.owner.lookup('service:store');
    const survey = run(() => store.createRecord('survey', {}));

    this.set('surveyEntry', survey);
    this.set('positionOptions', []);
    this.set('mentorPositionOptions', []);
    this.set('menteePositionOptions', []);
    this.set('cancelSurveyAction', () => {});
    this.set('onSave', () => {});

    await render(hbs`<SurveyForm @survey={{this.surveyEntry}}
@positionOptions={{this.positionOptions}}
@mentorPositionOptions={{this.mentorPositionOptions}}
@menteePositionOptions={{this.menteePositionOptions}}
@onCancel={{this.cancelSurveyAction}}
@onSave={{this.saveSurveyAction}} />`);

    assert.dom('form').exists();
  });
});
