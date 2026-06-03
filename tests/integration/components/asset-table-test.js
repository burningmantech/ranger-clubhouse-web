import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {click, fillIn, render, waitFor} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

const YEAR = (new Date()).getFullYear();

// Build a live asset-person RecordArray (the component calls
// this.args.assets.update(), so @assets must be a store.query result).
function queryAssets(owner) {
  const store = owner.lookup('service:store');
  return store.query('asset-person', {person_id: 1, year: YEAR});
}

module('Integration | Component | asset-table', function (hooks) {
  setupRenderingTest(hooks);

  hooks.afterEach(function () {
    // Success toasts arm a 7s setTimeout; clear them so the test runner
    // does not wait on the outstanding timer.
    this.owner.lookup('service:toast').clear();
  });

  test('@mode="checkout" renders only checked-out rows with action buttons', async function (assert) {
    // Two still-out rows, one returned row. Only the two should appear.
    this.server.create('asset-person', {
      asset_id: 1,
      asset: {id: 1, type: 'radio', barcode: 'B-1001', description: 'Radio One', year: YEAR},
    });
    this.server.create('asset-person', {
      asset_id: 2,
      asset: {id: 2, type: 'radio', barcode: 'B-1002', description: 'Radio Two', year: YEAR},
    });
    this.server.create('asset-person', {
      asset_id: 3,
      checked_in: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      check_in_person_id: 1,
      check_in_person: {id: 1, callsign: 'Returner'},
      asset: {id: 3, type: 'radio', barcode: 'B-1003', description: 'Radio Three', year: YEAR},
    });

    this.set('assets', await queryAssets(this.owner));

    await render(hbs`<AssetTable @assets={{this.assets}} @attachments={{this.attachments}}
                                 @year={{this.year}} @mode="checkout" />`);

    assert.dom('tbody tr').exists({count: 2}, 'only the two checked-out rows render');
    assert.dom(this.element).includesText('2 assets found');
    assert.dom('tbody').includesText('B-1001');
    assert.dom('tbody').includesText('B-1002');
    assert.dom('tbody').doesNotIncludeText('B-1003');

    // Per-row Check In + Change Attachment buttons appear in checkout mode.
    assert.dom('tbody').includesText('Check In');
    assert.dom('tbody').includesText('Change Attachment');
  });

  test('@mode="history" renders only returned rows with check-in info and no action buttons', async function (assert) {
    this.server.create('asset-person', {
      asset_id: 1,
      asset: {id: 1, type: 'radio', barcode: 'B-1001', description: 'Radio One', year: YEAR},
    });
    this.server.create('asset-person', {
      asset_id: 2,
      checked_in: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      check_in_person_id: 1,
      check_in_person: {id: 1, callsign: 'Returner Two'},
      asset: {id: 2, type: 'radio', barcode: 'B-1002', description: 'Radio Two', year: YEAR},
    });

    this.set('assets', await queryAssets(this.owner));

    await render(hbs`<AssetTable @assets={{this.assets}} @year={{this.year}} @mode="history" />`);

    assert.dom('tbody tr').exists({count: 1}, 'only the returned row renders');
    assert.dom(this.element).includesText('1 asset found');
    assert.dom('tbody').includesText('B-1002');
    assert.dom('tbody').doesNotIncludeText('B-1001');

    // The returned row shows who checked it in.
    assert.dom('tbody').includesText('Returner Two');

    // No per-row check-in / attachment editing in history mode.
    assert.dom('tbody').doesNotIncludeText('Check In');
    assert.dom('tbody').doesNotIncludeText('Change Attachment');
  });

  test('checkout empty state', async function (assert) {
    this.set('assets', await queryAssets(this.owner));

    await render(hbs`<AssetTable @assets={{this.assets}} @attachments={{this.attachments}}
                                 @year={{this.year}} @mode="checkout" />`);

    assert.dom('tbody tr').exists({count: 1}, 'only the empty-state row renders');
    assert.dom('tbody').includesText('No assets are currently checked out.');
  });

  test('history empty state names the year', async function (assert) {
    this.set('assets', await queryAssets(this.owner));
    this.set('year', YEAR);

    await render(hbs`<AssetTable @assets={{this.assets}} @year={{this.year}} @mode="history" />`);

    assert.dom('tbody tr').exists({count: 1}, 'only the empty-state row renders');
    assert.dom('tbody').includesText(`No assets were returned in ${YEAR}.`);
  });

  test('attachment update flow: open modal, pick attachment, submit', async function (assert) {
    // Reference attachment the user will pick.
    this.server.create('asset-attachment', {id: 7, description: 'Mini Mag Mount'});

    this.server.create('asset-person', {
      id: 50,
      asset_id: 1,
      attachment_id: null,
      attachment: null,
      asset: {id: 1, type: 'radio', barcode: 'B-1001', description: 'Radio One', year: YEAR},
    });

    this.set('assets', await queryAssets(this.owner));
    this.set('attachments', this.server.db.assetAttachments.map((a) => ({
      id: a.id,
      description: a.description,
    })));

    await render(hbs`<AssetTable @assets={{this.assets}} @attachments={{this.attachments}}
                                 @year={{this.year}} @mode="checkout" />`);

    // Cell starts with no attachment.
    assert.dom('tbody').doesNotIncludeText('Mini Mag Mount', 'attachment not yet set');

    // Open the modal via the stable data-test hook on the Change Attachment
    // button (keyed by barcode), rather than an incidental utility class.
    assert.dom('[data-test-change-attachment="B-1001"]').hasText('Change Attachment');
    await click('[data-test-change-attachment="B-1001"]');
    await waitFor('.modal-title');
    assert.dom('.modal-title').includesText('Update attachment for B-1001');

    // The select offers the seeded attachment option.
    assert.dom('select[name="attachment_id"] option').exists();
    assert.dom('.modal-body').includesText('Mini Mag Mount');

    // Pick the attachment and submit.
    await fillIn('select[name="attachment_id"]', '7');
    await click('.modal .btn-submit');

    // PATCH landed: the Mirage DB row now carries attachment_id 7 and the
    // embedded attachment the handler echoed back.
    const row = this.server.db.assetPeople.find('50');
    assert.strictEqual(row.id, '50', 'PATCH hit the correct asset-person id');
    assert.strictEqual(String(row.attachment_id), '7', 'attachment_id was persisted');

    // Success toast was raised.
    const toast = this.owner.lookup('service:toast');
    assert.strictEqual(toast.loaf.length, 1, 'one toast was shown');
    assert.strictEqual(toast.loaf[0].type, 'success');
    assert.strictEqual(toast.loaf[0].message, 'Attachment successfully updated.');

    // Modal closed and the cell now reflects the new attachment description
    // (the PATCH response refreshed the embedded attachment in place).
    assert.dom('.modal-title').doesNotExist('modal closed after submit');
    assert.dom('tbody').includesText('Mini Mag Mount', 'displayed attachment updated');
  });
});
