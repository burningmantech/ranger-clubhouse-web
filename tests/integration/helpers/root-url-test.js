import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'clubhouse/config/environment';

module('Integration | Helper | root-url', function(hooks) {
  setupRenderingTest(hooks);

  // The root-url should render a URL prefixed with the root url 
  test('it renders', async function(assert) {
    this.set('value', '/image.jpg');

    await render(hbs`{{root-url value}}`);

    assert.equal(this.element.textContent.trim(), ENV.rootURL + 'image.jpg');
  });
});
