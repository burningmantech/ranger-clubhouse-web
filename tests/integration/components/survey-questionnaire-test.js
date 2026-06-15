import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | survey-questionnaire', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the survey title, group, and question', async function (assert) {
    this.set('survey', {
      id: 1,
      type: 'training',
      year: 2020,
      title: 'A Training Survey',
      survey_groups: [
        {
          id: 10,
          title: 'A Group',
          description: 'This is the group description',
          type: 'normal',
          survey_questions: [
            {
              id: 12,
              sort_index: 1,
              type: 'text',
              code: 'good',
              is_required: true,
              description: 'What is your quest?',
            },
          ],
        },
      ],
    });
    this.set('trainers', []);
    this.set('slot', {
      id: 20,
      description: 'Burn Weekend',
      begins: '2020-08-25 01:00:00',
      position: {title: 'Training'},
    });
    this.set('user', {id: 99, callsign: 'i love you 99'});
    this.set('surveyDoneAction', spy());

    await render(hbs`<SurveyQuestionnaire @survey={{this.survey}}
                     @person={{this.user}}
                     @trainers={{this.trainers}}
                     @slot={{this.slot}}
                     @onDone={{this.surveyDoneAction}}  />`);

    assert.dom('h1').hasText('A Training Survey', 'the survey title renders');
    assert.dom('form').includesText('This is the group description', 'the group description renders');
    assert.dom('form').includesText('What is your quest?', 'the question text renders');
    // The text question type renders a textarea bound to question_<id>.
    assert.dom('[name="question_12"]').exists('the text question input renders');
  });
});
