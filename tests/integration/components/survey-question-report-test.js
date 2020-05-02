import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | survey-question-report', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('responses', {
      good: {
        description: 'a question',
        type: 'text',
        code: 'good',
        slots: [
          {
            id: 1,
            description: 'Training',
            begins: '2020-08-25 01:00:00',
            answers: [
              {response: 'a response'}
            ]
          }
        ]
      }
    });
    await render(hbs`<SurveyQuestionReport
                        @code="good"
                        @responses={{this.responses}}
                        @trainingId=13
                       />`);

    assert.dom('#question-good').exists();

  });
});
