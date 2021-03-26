import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | alert-group', function(hooks) {
  setupRenderingTest(hooks);

  function setupAlertTest(props) {
    props.set('heading', 'Test Heading');
    props.set('description', 'Test Description');
    props.set('email', 'ranger@example.com');
    props.set('numbers', { off_playa: { phone: '444-444-4444' }, on_playa: { phone: '555-555-555' } });
  }

  test('it renders off playa only', async function(assert) {
    setupAlertTest(this);

    this.set('group', [
      { title: 'Title1', description: 'Description1', on_playa: true }
    ]);


    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.hasText(/Title1/);
    row.hasText(/Description1/);
    row.hasText(/555-555-555/);
    row.doesNotIncludeText('444-444-4444');
  });

  test('it renders on playa only', async function(assert) {
    setupAlertTest(this);
    this.set('group', [
      { title: 'Title1', description: 'Description1', on_playa: false }
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.hasText(/444-444-4444/);
    row.doesNotIncludeText('555-555-5555');
  });

  test('it renders not optout', async function(assert) {
    setupAlertTest(this);
    this.set('group', [
      { title: 'Title1', description: 'Description1', on_playa: true, no_opt_out: true }
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.includesText('SMS cannot be opted out of');
    row.includesText('Email cannot be opted out of');
    row.doesNotIncludeText('444-444-4444');
    row.doesNotIncludeText('555-555-5555');
  });

  test('it renders email only', async function(assert) {
    setupAlertTest(this);
    this.set('group', [
      { title: 'Title1', description: 'Description1', email_only: true }
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.includesText('ranger@example.com');
    row.includesText('only email used');
  });

  test('it renders sms only', async function(assert) {
    setupAlertTest(this);
    this.set('group', [
      { title: 'Title1', description: 'Description1', sms_only: true }
    ]);

    await render(hbs`<AlertGroup @group={{this.group}}
            @email={{this.email}} @numbers={{this.numbers}} @heading={{this.heading}}
            @description={{this.description}} />`);

    const row = assert.dom('div.row');
    row.exists();
    row.doesNotIncludeText('ranger@example.com');
    row.includesText('only SMS used');
  });
});
