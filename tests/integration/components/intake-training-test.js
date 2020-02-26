import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | intake-training', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.setProperties({
      trainings: [ { slot_id: 9999, slot_begins: "2020-02-03 12:34:56", training_passed: true, training_rank: 2, training_notes: [], slot_has_ended: true } ],
      person: {}
    });

    await render(hbs`<IntakeTraining @trainings={{this.trainings}} @person={{this.person}}/>`);
    assert.dom('button').exists().hasText('View Training');

    this.set('noTrainings', []);
    await render(hbs`<IntakeTraining @trainings={{this.noTrainings}} @person={{this.person}}/>`);
    assert.dom('button').doesNotExist();
    assert.dom('i').hasText('No training signups');

  });
});
