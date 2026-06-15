import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | slot-info-link', function (hooks) {
  setupRenderingTest(hooks);

  test('renders an info link with icon when info is provided', async function (assert) {
    this.set('description', 'Swing');
    this.set('info', 'Women of Khaki');

    await render(hbs`<SlotInfoLink @description={{this.description}} @info={{this.info}} />`);

    assert.dom('a').exists('renders a link when info is present');
    assert.dom('a').hasText('Swing');
    assert.dom('a i.fa-solid').hasClass('fa-question-circle', 'renders the question-circle info icon');
  });

  test('renders plain description without a link when info is absent', async function (assert) {
    this.set('description', 'Man Burn');

    await render(hbs`<SlotInfoLink @description={{this.description}} />`);

    assert.dom('a').doesNotExist('no link when info is absent');
    assert.dom('i.fa-question-circle').doesNotExist('no info icon when info is absent');
    assert.dom(this.element).hasText('Man Burn');
  });
});
