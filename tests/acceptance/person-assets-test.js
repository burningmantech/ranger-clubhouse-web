import { module, test } from 'qunit';
import { visit, click, fillIn, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../helpers/authenticate-user';
import dayjs from 'dayjs';

const YEAR = new Date().getFullYear();

function now() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

module('Acceptance | person assets', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    // The logged-in user needs a privileged role to view another person's
    // page (PersonRoute.roleRequired). Give them ADMIN.
    this.user = this.server.create('person', { roles: [1] });
    this.subject = this.server.create('person');
  });

  test('shows the checkout section, history heading, and only returned assets in history', async function (assert) {
    await authenticateUser(this.user.id);

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
        year: YEAR,
      },
    });

    // A returned asset (checked_in set + check_in_person) -> belongs in History.
    this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 20,
      checked_in: now(),
      check_in_person_id: 1,
      check_in_person: { id: 1, callsign: 'Returner' },
      asset: {
        id: 20,
        type: 'radio',
        barcode: 'IN-200',
        description: 'Returned Asset',
        perm_assign: false,
        year: YEAR,
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

    // Exactly one "Check In" button: only the still-out checkout row has one.
    const checkInButtons = [...this.element.querySelectorAll('button')].filter(
      (b) => b.textContent.trim() === 'Check In'
    );
    assert.strictEqual(checkInButtons.length, 1, 'only the checked-out row offers Check In');

    // The returned row shows who returned it.
    assert.dom(this.element).includesText('Returner', 'history row shows the check-in person');
  });

  test('checking in an asset moves it from the checkout table to the history table', async function (assert) {
    await authenticateUser(this.user.id);

    const row = this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 30,
      asset: {
        id: 30,
        type: 'radio',
        barcode: 'MOVE-300',
        description: 'Moving Asset',
        perm_assign: false,
        year: YEAR,
      },
    });

    // The default checkin handler does NOT mutate the underlying asset-person
    // DB row, so the assets.update() re-query that runs after check-in would
    // resurrect the row as still-out. Override it to flip the matching
    // asset-person row by asset_id, mirroring the real backend.
    this.server.post('/api/asset/:id/checkin', ({ assetPeople }, request) => {
      const assetId = request.params.id;
      const checkedIn = now();
      const checkInPerson = { id: 1, callsign: 'Checkin Hubcap' };

      const match = assetPeople
        .all()
        .models.find((m) => String(m.attrs.asset_id) === String(assetId) && !m.attrs.checked_in);

      if (match) {
        match.update({
          checked_in: checkedIn,
          check_in_person_id: checkInPerson.id,
          check_in_person: checkInPerson,
        });
      }

      return { checked_in: checkedIn, check_in_person: checkInPerson };
    });

    await visit(`/person/${this.subject.id}/assets`);

    // Before: one Check In button (the row is in the checkout table).
    const checkInBefore = [...this.element.querySelectorAll('button')].filter(
      (b) => b.textContent.trim() === 'Check In'
    );
    assert.strictEqual(checkInBefore.length, 1, 'asset starts in the checkout table');

    await click(checkInBefore[0]);

    // The check-in transport is a raw fetch (the ajax service does not register
    // a test waiter), so click()'s settled() can resolve before the in-place
    // checked_in flip re-renders. Wait for the checkout row to drop.
    const countCheckIn = () =>
      [...this.element.querySelectorAll('button')].filter(
        (b) => b.textContent.trim() === 'Check In'
      ).length;
    await waitUntil(() => countCheckIn() === 0);

    // After: the Check In button is gone (row left the checkout table) and the
    // history table now shows the returned check-in person.
    assert.strictEqual(countCheckIn(), 0, 'asset left the checkout table after check-in');
    assert.dom(this.element).includesText('MOVE-300', 'asset still listed (now in history)');
    assert.dom(this.element).includesText('Checkin Hubcap', 'history shows the check-in person');

    // The Mirage DB row was flipped to returned.
    row.reload();
    assert.ok(row.checked_in, 'underlying asset-person row is now checked in');
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
        year: YEAR,
      },
    });

    await visit(`/person/${this.subject.id}/assets`);

    // Open the attachment modal from the checkout row.
    const changeButtons = [...this.element.querySelectorAll('button')].filter(
      (b) => b.textContent.trim() === 'Change Attachment'
    );
    assert.strictEqual(changeButtons.length, 1, 'checkout row offers Change Attachment');
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

    // Only a returned asset exists; the checkout table should be empty.
    this.server.create('asset-person', {
      person_id: this.subject.id,
      asset_id: 50,
      checked_in: now(),
      check_in_person_id: 1,
      check_in_person: { id: 1, callsign: 'Returner' },
      asset: {
        id: 50,
        type: 'radio',
        barcode: 'EMPTY-500',
        description: 'Returned Only',
        perm_assign: false,
        year: YEAR,
      },
    });

    await visit(`/person/${this.subject.id}/assets`);

    assert.dom(this.element).includesText('No assets are currently checked out.', 'checkout empty-state copy');
  });
});
