import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | autocomplete-input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.setProperties({
      placeholder: 'enter callsign',
      onSearch() {
      },
      onSelect() {
      },
      onFocus() {
      },
      text: 'Some text'
    });


    await render(hbs`<AutocompleteInput @placeholder={{this.placeholder}}
                @onSearch={{this.onSearch}}
                @onSelect={{this.onSelect}}
                @onFocus={{this.onFocus}}
                @text={{this.text}}
 />`);

    assert.dom('input').exists().hasAttribute('placeholder', 'enter callsign');
  });
});
