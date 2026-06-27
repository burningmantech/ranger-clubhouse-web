import { module, test } from 'qunit';
import { visit, currentURL, click, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../helpers/authenticate-user';

// The /reports parent route gates access on the ADMIN or MANAGE role.
const ADMIN_ROLE = 1;

// Click the first <button> whose normalized visible text contains `label`.
// UiExportToCSVButton carries no data-test hook, so text is the stable handle.
function clickButton(label) {
  const button = [...document.querySelectorAll('button')].find((el) =>
    el.textContent.replace(/\s+/g, ' ').trim().includes(label)
  );
  if (!button) {
    throw new Error(`No button found containing text "${label}"`);
  }
  return click(button);
}

module('Acceptance | reports forced-signins', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.user = this.server.create('person', { roles: [ADMIN_ROLE] });

    // The route fans out to ajax.request('timesheet/forced-signins-report'),
    // which the ajax service prefixes with the /api namespace. Return two rows:
    // a normal row (blockers: []) and the crash case (blockers: 'unknown').
    this.server.get('/api/timesheet/forced-signins-report', () => ({
      entries: [
        {
          id: 1,
          callsign: 'Hardware',
          position_title: 'Dirt',
          on_duty: '2026-08-30 12:00:00',
          forced_by_callsign: 'Tool',
          forced_by_id: 2,
          signin_force_reason: 'covering the shift',
          blockers: [],
        },
        {
          id: 3,
          callsign: 'Spanner',
          position_title: 'Gate',
          on_duty: '2026-08-31 18:00:00',
          forced_by_callsign: 'Wrench',
          forced_by_id: 4,
          signin_force_reason: 'needed bodies',
          blockers: 'unknown',
        },
      ],
    }));
  });

  test('renders both rows including a row whose blockers is the string "unknown"', async function (assert) {
    await authenticateUser(this.user.id);

    await visit('/reports/forced-signins');

    assert.strictEqual(currentURL(), '/reports/forced-signins', 'reaches the report route');
    assert.dom(this.element).includesText('Hardware', 'normal row callsign renders');
    assert.dom(this.element).includesText('Spanner', 'the "unknown"-blockers row renders without crashing');
  });

  test('clicking Export To CSV does not crash on the "unknown"-blockers row', async function (assert) {
    await authenticateUser(this.user.id);

    await visit('/reports/forced-signins');
    await clickButton('Export To CSV');
    await settled();

    assert.dom('table').exists('the table still renders after exporting CSV');
  });
});
