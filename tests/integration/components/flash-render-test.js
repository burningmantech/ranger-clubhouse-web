import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import FlashMessage from 'ember-cli-flash/flash/object';

const flashStubService = Service.extend({
    queue: null,
});

module('Integration | Component | flash render', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:flashstub', flashStubService);
    // Calling inject puts the service instance in the context of the test,
    // making it accessible as "locationService" within each test
    this.flash = this.owner.lookup('service:flashstub');
  });


  test('it renders a flash message', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.set('flash.queue', [ FlashMessage.create({ message: 'The alien invasion is complete.'}) ]);

    await render(hbs`{{flash-render flash=flash}}`);

    assert.ok(find("div.flash-message").textContent.indexOf('The alien invasion is complete') !== -1);
  });
});
