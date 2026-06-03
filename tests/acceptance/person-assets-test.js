import { module, test } from 'qunit';
import { visit, click, fillIn, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../helpers/authenticate-user';
import dayjs from 'dayjs';

const ADMIN_ROLE = 1;

function now() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

// Single source of truth for "find the per-row action buttons". The AssetTable
// template tags Check In and Change Attachment buttons with data-test hooks
// keyed by the asset barcode, so selection is stable instead of scanning every
// button's trimmed textContent.
function checkInButtons(root) {
  return [...root.querySelectorAll('[data-test-check-in]')];
}

function changeAttachmentButtons(root) {
  return [...root.querySelectorAll('[data-test-change-attachment]')];
}

module('Acceptance | person assets', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    // The logged-in user needs a privileged role to view another person's
    // page (PersonRoute.roleRequired). Give them ADMIN.
    this.user = this.server.create('person', { roles: [ADMIN_ROLE] });
    this.subject = this.server.create('person');
    // The current year drives which asset-person rows are returned by the
    // /api/asset-person handler (it filters on asset.year).
    this.year = new Date().getFullYear();
  });

  test('shows the checkout section, history heading, and only returned assets in history', async function (assert) {
    await authenticateUser(this.user.id);

    // A returned asset is attributed to a real Mirage person rather than a
    // hardcoded id, so the rendered callsign is tied to created data.
    const returner = this.server.create('person', { callsign: 'Returner' });

    // A still-checked-out asset (checked_in null) -> belongs in the Checkout table.
    this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 10,
      asset: {
        id: 10,
        type: 'radio',
        barcode: 'OUT-100',
        description: 'Still Out Asset',
        perm_assign: false,
        year: this.year,
      },
    });

    // A returned asset (checked_in set + check_in_person) -> belongs in History.
    this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 20,
      checked_in: now(),
      check_in_person_id: returner.id,
      check_in_person: { id: returner.id, callsign: returner.callsign },
      asset: {
        id: 20,
        type: 'radio',
        barcode: 'IN-200',
        description: 'Returned Asset',
        perm_assign: false,
        year: this.year,
      },
    });

    await visit(`/person/${this.subject.id}/assets`);

    // Checkout section: the checkout form is present.
    assert.dom('input[name="barcode"]').exists('checkout form barcode field renders');

    // Both section headings render, including the renamed history heading.
    assert.dom(this.element).includesText('Asset Checkout', 'checkout section title present');
    assert.dom(this.element).includesText('Asset Checkout History', 'renamed history heading present');

    // The checked-out asset appears (its Check In button confirms it is in the
    // checkout table), and the returned asset does NOT show a Check In button.
    assert.dom(this.element).includesText('OUT-100', 'checked-out asset barcode is shown');
    assert.dom(this.element).includesText('IN-200', 'returned asset barcode is shown');

    // Exactly one Check In button, and it is the still-out row (keyed by barcode).
    const checkIns = checkInButtons(this.element);
    assert.strictEqual(checkIns.length, 1, 'only the checked-out row offers Check In');
    assert.strictEqual(checkIns[0].getAttribute('data-test-check-in'), 'OUT-100',
      'the Check In button belongs to the still-out asset');

    // The returned row shows who returned it (the real Mirage person's callsign).
    assert.dom(this.element).includesText(returner.callsign,
      'history row shows the check-in person callsign');
  });

  test('checking in an asset moves it from the checkout table to the history table', async function (assert) {
    await authenticateUser(this.user.id);

    // The person performing the check-in is the logged-in user.
    const checkedInAt = now();

    const row = this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 30,
      asset: {
        id: 30,
        type: 'radio',
        barcode: 'MOVE-300',
        description: 'Moving Asset',
        perm_assign: false,
        year: this.year,
      },
    });

    // The default checkin handler does NOT mutate the underlying asset-person
    // DB row, so the assets.update() re-query that runs after check-in would
    // resurrect the row as still-out. Override it to flip the matching
    // asset-person row by asset_id, mirroring the real backend, and attribute
    // the check-in to the logged-in user.
    this.server.post('/api/asset/:id/checkin', ({ assetPeople }, request) => {
      const assetId = request.params.id;
      const checkInPerson = { id: this.user.id, callsign: this.user.callsign };

      const match = assetPeople
        .all()
        .models.find((m) => String(m.attrs.asset_id) === String(assetId) && !m.attrs.checked_in);

      if (match) {
        match.update({
          checked_in: checkedInAt,
          check_in_person_id: checkInPerson.id,
          check_in_person: checkInPerson,
        });
      }

      return { checked_in: checkedInAt, check_in_person: checkInPerson };
    });

    await visit(`/person/${this.subject.id}/assets`);

    // Before: one Check In button (the row is in the checkout table).
    const before = checkInButtons(this.element);
    assert.strictEqual(before.length, 1, 'asset starts in the checkout table');
    assert.strictEqual(before[0].getAttribute('data-test-check-in'), 'MOVE-300',
      'the Check In button is for the MOVE-300 asset');

    await click(before[0]);

    // The check-in transport is a raw fetch (the ajax service does not register
    // a test waiter), so click()'s settled() can resolve before the in-place
    // checked_in flip re-renders. Wait for the checkout row to drop.
    await waitUntil(() => checkInButtons(this.element).length === 0);

    // After: the Check In button is gone (row left the checkout table) and the
    // history table now shows the returned check-in person (the logged-in user).
    assert.strictEqual(checkInButtons(this.element).length, 0,
      'asset left the checkout table after check-in');
    assert.dom(this.element).includesText('MOVE-300', 'asset still listed (now in history)');
    assert.dom(this.element).includesText(this.user.callsign,
      'history shows the logged-in user as the check-in person');

    // The Mirage DB row was flipped to returned, with the exact timestamp and
    // check-in person id the handler recorded.
    row.reload();
    assert.strictEqual(row.checked_in, checkedInAt,
      'underlying row carries the recorded check-in timestamp');
    assert.strictEqual(String(row.check_in_person_id), String(this.user.id),
      'underlying row records the logged-in user as the check-in person');
  });

  test('changing an attachment updates the displayed description', async function (assert) {
    await authenticateUser(this.user.id);

    // Two attachment options for the select.
    this.server.create('asset-attachment', { id: 1, description: 'Mic Attachment', parent_type: 'radio' });
    this.server.create('asset-attachment', { id: 2, description: 'Speaker Attachment', parent_type: 'radio' });

    this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 40,
      attachment_id: null,
      attachment: null,
      asset: {
        id: 40,
        type: 'radio',
        barcode: 'ATT-400',
        description: 'Attachable Asset',
        perm_assign: false,
        year: this.year,
      },
    });

    await visit(`/person/${this.subject.id}/assets`);

    // Open the attachment modal from the checkout row (keyed by barcode).
    const changeButtons = changeAttachmentButtons(this.element);
    assert.strictEqual(changeButtons.length, 1, 'checkout row offers Change Attachment');
    assert.strictEqual(changeButtons[0].getAttribute('data-test-change-attachment'), 'ATT-400',
      'the Change Attachment button is for the ATT-400 asset');
    await click(changeButtons[0]);

    assert.dom('.modal').exists('attachment modal is open');

    // Choose "Speaker Attachment" (id 2) and submit.
    await fillIn('.modal select[name="attachment_id"]', '2');
    await click('.modal .btn-submit');

    // Modal closes and the updated attachment description is rendered in the cell.
    assert.dom('.modal').doesNotExist('attachment modal closed after save');
    assert.dom(this.element).includesText('Speaker Attachment', 'cell shows the new attachment description');
  });

  test('checkout section shows an empty-state message when nothing is checked out', async function (assert) {
    await authenticateUser(this.user.id);

    const returner = this.server.create('person', { callsign: 'Returner' });

    // Only a returned asset exists; the checkout table should be empty.
    this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 50,
      checked_in: now(),
      check_in_person_id: returner.id,
      check_in_person: { id: returner.id, callsign: returner.callsign },
      asset: {
        id: 50,
        type: 'radio',
        barcode: 'EMPTY-500',
        description: 'Returned Only',
        perm_assign: false,
        year: this.year,
      },
    });

    await visit(`/person/${this.subject.id}/assets`);

    assert.dom(this.element).includesText('No assets are currently checked out.', 'checkout empty-state copy');
    // No checkout-row Check In button exists in the empty state.
    assert.strictEqual(checkInButtons(this.element).length, 0,
      'no Check In buttons when nothing is checked out');
  });
});
