import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | slot-full-indicator', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('signedUp', 42);
    this.set('max', 50);

    await render(hbs`{{slot-full-indicator signedUp max}}`);

    assert.dom(this.element).hasText('42/50');
    //assert.dom('.progress-bar').hasStyle({width: '84%'});
    assert.dom('.progress-bar').hasClass('bg-success');
  });

  test('it renders when close to full', async function(assert) {
    this.set('signedUp', 9);
    this.set('max', 10);

    await render(hbs`{{slot-full-indicator signedUp max}}`);

    assert.dom(this.element).hasText('9/10');
    //assert.dom('.progress-bar').hasStyle({width: '90%'});
    assert.dom('.progress-bar').hasClass('bg-warning');
  });

  test('it renders when full', async function(assert) {
    this.set('signedUp', 24);
    this.set('max', 24);

    await render(hbs`{{slot-full-indicator signedUp max}}`);

    assert.dom(this.element).hasText('FULL 24/24');
    //assert.dom('.progress-bar').hasStyle({width: '100%'});
    assert.dom('.progress-bar').hasClass('bg-light-red');
  });

  test('it renders when overfull', async function(assert) {
    this.set('signedUp', 24);
    this.set('max', 20);

    await render(hbs`{{slot-full-indicator signedUp max}}`);

    assert.dom(this.element).hasText('FULL 24/20');
    //assert.dom('.progress-bar').hasStyle({width: '100%'});
    assert.dom('.progress-bar').hasClass('bg-light-red');
  });
});
