import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Helper | slot-full-indicator', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a success bar with the floored percentage width', async function(assert) {
    this.set('signedUp', 42);
    this.set('max', 50);

    await render(hbs`{{slot-full-indicator this.signedUp this.max}}`);

    assert.dom(this.element).hasText('42/50');
    assert.dom('.progress-bar').hasAttribute('style', 'width: 84%');
    assert.dom('.progress-bar').hasClass('bg-success');
  });

  test('it renders a warning bar when at least 85% full', async function(assert) {
    this.set('signedUp', 9);
    this.set('max', 10);

    await render(hbs`{{slot-full-indicator this.signedUp this.max}}`);

    assert.dom(this.element).hasText('9/10');
    assert.dom('.progress-bar').hasAttribute('style', 'width: 90%');
    assert.dom('.progress-bar').hasClass('bg-warning');
  });

  test('it renders a full bar at 100% when signed up equals max', async function(assert) {
    this.set('signedUp', 24);
    this.set('max', 24);

    await render(hbs`{{slot-full-indicator this.signedUp this.max}}`);

    assert.dom(this.element).hasText('FULL 24/24');
    assert.dom('.progress-bar').hasAttribute('style', 'width: 100%');
    assert.dom('.progress-bar').hasClass('bg-light-red');
  });

  test('it renders a full bar when overfull', async function(assert) {
    this.set('signedUp', 24);
    this.set('max', 20);

    await render(hbs`{{slot-full-indicator this.signedUp this.max}}`);

    assert.dom(this.element).hasText('FULL 24/20');
    assert.dom('.progress-bar').hasAttribute('style', 'width: 100%');
    assert.dom('.progress-bar').hasClass('bg-light-red');
  });

  test('it treats max of 0 as full at 100% width', async function(assert) {
    this.set('signedUp', 0);
    this.set('max', 0);

    await render(hbs`{{slot-full-indicator this.signedUp this.max}}`);

    assert.dom(this.element).hasText('FULL 0/0');
    assert.dom('.progress-bar').hasAttribute('style', 'width: 100%');
    assert.dom('.progress-bar').hasClass('bg-light-red');
  });
});
