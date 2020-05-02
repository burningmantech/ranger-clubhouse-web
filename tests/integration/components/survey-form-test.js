import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | survey-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('surveyEntry', {});
    this.set('positions', [ ]);
    this.set('cancelSurveyAction', () => { });
    this.set('onSave', () => { });

    await render(hbs`<SurveyForm @survey={{this.surveyEntry}} @positions={{this.positions}} @onCancel={{this.cancelSurveyAction}} @onSave={{this.saveSurveyAction}} />`);

    assert.dom('form').exists();
  });
});
