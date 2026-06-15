import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

// Hoisted so the fixture and the assertions share the exact same strings and
// cannot drift apart (the previous test asserted doesNotIncludeText against a
// phone number with a trailing digit the fixture never used, making the
// assertion vacuously true).
const OFF_PLAYA_PHONE = '444-444-4444';
const ON_PLAYA_PHONE = '555-555-555';
const EMAIL = 'ranger@example.com';

module('Integration | Component | alert-group', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('heading', 'Test Heading');
    this.set('description', 'Test Description');
    this.set('email', EMAIL);
    this.set('numbers', {
      off_playa: {phone: OFF_PLAYA_PHONE},
      on_playa: {phone: ON_PLAYA_PHONE},
    });
  });

  test('renders the on-playa phone when the alert is on_playa', async function (assert) {
    this.set('group', [
      {title: 'Title1', description: 'Description1', on_playa: true},
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.includesText('Title1');
    row.includesText('Description1');
    row.includesText(ON_PLAYA_PHONE);
    row.doesNotIncludeText(OFF_PLAYA_PHONE);
  });

  test('renders the off-playa phone when the alert is not on_playa', async function (assert) {
    this.set('group', [
      {title: 'Title1', description: 'Description1', on_playa: false},
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.includesText(OFF_PLAYA_PHONE);
    row.doesNotIncludeText(ON_PLAYA_PHONE);
  });

  test('renders opt-out notices and no phone/email when no_opt_out is set', async function (assert) {
    this.set('group', [
      {title: 'Title1', description: 'Description1', on_playa: true, no_opt_out: true},
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.includesText('SMS cannot be opted out of');
    row.includesText('Email cannot be opted out of');
    row.doesNotIncludeText(OFF_PLAYA_PHONE);
    row.doesNotIncludeText(ON_PLAYA_PHONE);
  });

  test('renders only the email when email_only is set', async function (assert) {
    this.set('group', [
      {title: 'Title1', description: 'Description1', email_only: true},
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.includesText(EMAIL);
    row.includesText('only email used');
  });

  test('renders only SMS and omits the email when sms_only is set', async function (assert) {
    this.set('group', [
      {title: 'Title1', description: 'Description1', sms_only: true, on_playa: false},
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.doesNotIncludeText(EMAIL);
    row.includesText('only SMS used');
  });

  test('renders one row per alert when the group has multiple alerts', async function (assert) {
    this.set('group', [
      {title: 'First Alert', description: 'First Description', on_playa: true},
      {title: 'Second Alert', description: 'Second Description', on_playa: false},
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    assert.dom('div.row').exists({count: 2});
    assert.dom(this.element).includesText('First Alert');
    assert.dom(this.element).includesText('Second Alert');
    // A separator <hr> is rendered between (but not before) alerts.
    assert.dom('hr').exists({count: 1});
  });

  test('renders the heading but no rows when the group is empty', async function (assert) {
    this.set('group', []);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    assert.dom('.card-header').includesText('Test Heading - Test Description');
    assert.dom('div.row').doesNotExist();
  });

  test('renders the heading but no rows when the group is undefined', async function (assert) {
    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    assert.dom('.card-header').includesText('Test Heading - Test Description');
    assert.dom('div.row').doesNotExist();
  });
});
