import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

// The component derives a meal "type" from which periods (pre/event/post) the
// person qualifies for, then renders a distinct title + description per type.
// The previous tests matched the substring "You qualify for three meals/day",
// which appears in nearly every branch and so could not tell branches apart.
// Each test below asserts text unique to the branch under test.
module('Integration | Component | meal-info', function (hooks) {
  setupRenderingTest(hooks);

  test('all three periods render the "Eat It All" pass', async function (assert) {
    this.set('eventInfo', {meals: {pre: true, event: true, post: true}, meals_status: 'claimed'});

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.dom('dt').includesText('Eat It All Meal Pass');
    assert.dom('dd').includesText('pre-event period, the event week, and post event week');
  });

  test('pre + event renders the Pre-Event and During Event pass', async function (assert) {
    this.set('eventInfo', {meals: {pre: true, event: true, post: false}, meals_status: 'claimed'});

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.dom('dt').includesText('Pre-Event and During Event Pass');
    assert.dom('dd').includesText('both the Pre-Event period and the event week itself');
  });

  test('event only renders the Event Week pass', async function (assert) {
    this.set('eventInfo', {meals: {pre: false, event: true, post: false}, meals_status: 'claimed'});

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.dom('dt').includesText('Event Week Meal Pass');
    assert.dom('dd').includesText('during the event week');
  });

  test('no qualifying periods renders the Pogs description', async function (assert) {
    this.set('eventInfo', {meals: {pre: false, event: false, post: false}, meals_status: ''});

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.dom('dt').includesText('Pogs');
    assert.dom('dd').includesText('Every time you ranger a 6+ hour shift');
    assert.dom('dd').doesNotIncludeText('three meals/day');
  });

  test('a banked meal pass renders the banked note', async function (assert) {
    this.set('eventInfo', {meals: {pre: true, event: true, post: false}, meals_status: 'banked'});

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.dom('dt').includesText('Pre-Event and During Event Pass');
    assert.dom('dd').includesText('The earned meal pass for this event has been banked');
  });

  test('a non-banked status does not render the banked note', async function (assert) {
    this.set('eventInfo', {meals: {pre: true, event: true, post: false}, meals_status: 'claimed'});

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.dom('dd').doesNotIncludeText('has been banked');
  });
});
