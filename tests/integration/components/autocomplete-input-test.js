import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, fillIn} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | autocomplete-input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the search input with the placeholder and text', async function (assert) {
    this.setProperties({
      placeholder: 'enter callsign',
      onSearch: spy(),
      onSelect: spy(),
      text: 'Some text',
    });

    await render(hbs`<AutocompleteInput @placeholder={{this.placeholder}}
                @onSearch={{this.onSearch}}
                @onSelect={{this.onSelect}}
                @text={{this.text}}
 />`);

    assert
      .dom('input[type="search"]')
      .exists('the search input renders')
      .hasAttribute('placeholder', 'enter callsign', 'the placeholder is bound from the arg');
    assert.dom('input[type="search"]').hasValue('Some text', 'the input value is bound from the text arg');
  });

  test('it invokes onSearch with the typed value and renders the results', async function (assert) {
    // onSearch must return a promise that resolves to the result list.
    const onSearch = spy();
    const results = [{callsign: 'Hubcap'}];
    const wrappedSearch = (value) => {
      onSearch(value);
      return Promise.resolve(results);
    };

    this.setProperties({
      placeholder: 'enter callsign',
      onSearch: wrappedSearch,
      onSelect: spy(),
    });

    await render(hbs`<AutocompleteInput @placeholder={{this.placeholder}}
                @onSearch={{this.onSearch}}
                @onSelect={{this.onSelect}} as |opt|>
      {{opt.callsign}}
    </AutocompleteInput>`);

    await fillIn('input[type="search"]', 'Hub');

    assert.true(onSearch.called, 'onSearch was invoked when typing');
    assert.deepEqual(onSearch.lastArgs, ['Hub'], 'onSearch received the typed value');
    assert.dom('.autocomplete-item').includesText('Hubcap', 'the search result is rendered via the yielded block');
  });
});
