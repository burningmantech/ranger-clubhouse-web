import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {authenticateUser} from '../../helpers/authenticate-user';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | survey-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the survey form fields for a new survey', async function (assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const store = this.owner.lookup('service:store');
    const survey = store.createRecord('survey', {
      type: 'training',
      title: 'A Training Survey',
      prologue: 'Welcome',
      epilogue: 'Goodbye',
    });

    this.set('surveyEntry', survey);
    this.set('positionOptions', []);
    this.set('mentorPositionOptions', []);
    this.set('menteePositionOptions', []);
    this.set('cancelSurveyAction', spy());
    this.set('saveSurveyAction', spy());

    await render(hbs`<SurveyForm @survey={{this.surveyEntry}}
@surveyEntry={{this.surveyEntry}}
@positionOptions={{this.positionOptions}}
@mentorPositionOptions={{this.mentorPositionOptions}}
@menteePositionOptions={{this.menteePositionOptions}}
@onCancel={{this.cancelSurveyAction}}
@onSave={{this.saveSurveyAction}} />`);

    assert.dom('form').exists('the survey form is rendered');
    assert.dom('[name="type"]').exists('the type field is rendered');
    assert.dom('[name="title"]').hasValue('A Training Survey', 'the title field is populated from the survey');
    assert.dom('[name="active"]').exists('the active checkbox is rendered');
  });

  test('it fires onSave after a successful submit', async function (assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const store = this.owner.lookup('service:store');
    const survey = store.createRecord('survey', {
      type: 'training',
      position_id: 1,
      title: 'A Training Survey',
      prologue: 'Welcome',
      epilogue: 'Goodbye',
    });

    // Make save() resolve without hitting the API.
    survey.save = () => Promise.resolve(survey);

    const onSave = spy();
    this.set('surveyEntry', survey);
    this.set('positionOptions', []);
    this.set('mentorPositionOptions', []);
    this.set('menteePositionOptions', []);
    this.set('cancelSurveyAction', spy());
    this.set('saveSurveyAction', onSave);

    await render(hbs`<SurveyForm @survey={{this.surveyEntry}}
@surveyEntry={{this.surveyEntry}}
@positionOptions={{this.positionOptions}}
@mentorPositionOptions={{this.mentorPositionOptions}}
@menteePositionOptions={{this.menteePositionOptions}}
@onCancel={{this.cancelSurveyAction}}
@onSave={{this.saveSurveyAction}} />`);

    assert.dom('button[type="submit"]').exists('the submit button is rendered');
    await click('button[type="submit"]');

    assert.true(onSave.called, 'the onSave callback fired after submit');
  });
});
