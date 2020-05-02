import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | survey-trainer-rating-line', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('responses', {
      good: {
        rating_count: 2,
        mean: 6.5,
        variance: 0.1,
      }
    });
     await render(hbs`<SurveyTrainerRatingLine @title="Goodie" @code="good" @responses={{this.responses}} />`);

     assert.dom('tr').exists();
     assert.dom('td:first-child').exists().hasText('Goodie');
     assert.dom('td:nth-child(2)').hasText(/6\.5/);
 });
});
