import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | survey-questionnaire', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('survey', {
        id: 1,
        type: 'training',
        year: 2020,
        title: 'A Training Survey',
        survey_groups: [
          {
            id: 10,
            title: 'A Group',
            description: 'This is group',
            type: 'trainer',
            survey_questions: [
              {
                id: 12,
                sort_index: 1,
                type: 'text',
                code: 'good',
                description: 'What is your quest?'
              }
            ]
          }
        ]
      });
    this.set('trainers', []);
    this.set('slot', {
        id: 20,
        begins: '2020-08-25 01:00:00'
    });
    this.set('user', { id: 99, callsign: 'i love you 99'});

    this.set('surveyDoneAction', () => { });

    await render(hbs`<SurveyQuestionnaire @survey={{this.survey}}
                     @person={{thisuser}}
                     @trainers={{this.trainers}}
                     @slot={{this.slot}}
                     @onDone={{this.surveyDoneAction}}  />`);

    assert.dom('h1').hasText('A Training Survey');

  });
});
