import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ui-empty-state', function (hooks) {
  setupRenderingTest(hooks);

  test('renders title', async function (assert) {
    await render(hbs`<UiEmptyState @title="Nothing here" />`);
    assert.dom('.ui-empty-state-title').hasText('Nothing here');
  });

  test('renders description', async function (assert) {
    await render(hbs`<UiEmptyState @description="No records found." />`);
    assert.dom('.ui-empty-state-description').hasText('No records found.');
  });

  test('renders title and description together', async function (assert) {
    await render(hbs`<UiEmptyState @title="No results" @description="Try a different search." />`);
    assert.dom('.ui-empty-state-title').hasText('No results');
    assert.dom('.ui-empty-state-description').hasText('Try a different search.');
  });

  test('does not render icon div when @icon is absent', async function (assert) {
    await render(hbs`<UiEmptyState @title="Empty" />`);
    assert.dom('.ui-empty-state-icon').doesNotExist();
  });

  test('renders action block when provided', async function (assert) {
    await render(hbs`
      <UiEmptyState @title="Empty">
        <button type="button">Add item</button>
      </UiEmptyState>
    `);
    assert.dom('.ui-empty-state-action').exists('renders action container');
    assert.dom('.ui-empty-state-action button').hasText('Add item');
  });

  test('does not render action container without block', async function (assert) {
    await render(hbs`<UiEmptyState @title="Empty" />`);
    assert.dom('.ui-empty-state-action').doesNotExist();
  });
});
