import {module, test} from 'qunit';
import {click, currentURL, visit} from '@ember/test-helpers';
import {setupApplicationTest} from 'ember-qunit';
import {authenticateUser} from '../helpers/authenticate-user';

// hq.js beforeModel() gates the whole HQ interface on the ADMIN or
// SHIFT_MANAGEMENT role.
const ADMIN_ROLE = 1;

// The dialogs render inside a BsModal which tethers its content to a wormhole
// outside the test root, so scope text assertions to the whole document.
function documentText() {
  return document.body.textContent.replace(/\s+/g, ' ');
}

// Click the first element of `selector` whose visible text contains `label`.
// Neither the sidebar links nor the UiButton-backed dialog buttons carry a
// data-test hook, so text is the stable handle.
function clickText(selector, label) {
  const element = [...document.querySelectorAll(selector)].find((el) =>
    el.textContent.replace(/\s+/g, ' ').trim().includes(label)
  );
  if (!element) {
    throw new Error(`No ${selector} found containing text "${label}"`);
  }
  return click(element);
}

module('Acceptance | hq shift', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.user = this.server.create('person', {roles: [ADMIN_ROLE]});
    this.subject = this.server.create('person', {
      callsign: 'Hardware',
      status: 'active',
      on_site: true,
    });

    // Endpoints the parent hq.js model() hook fans out to that have no global
    // Mirage handler. Kept local so this route's test owns its data contract.
    this.server.get('/api/person/:id/timesheet-summary', () => ({summary: {}}));
    this.server.get('/api/person-banner', ({personBanners}) => personBanners.all());
    // The route calls session.updateOnDuty() when the operator has no signed-in
    // position; answer it so the model hook resolves cleanly.
    this.server.get('/api/person/:id/onduty', () => ({onduty: null}));
  });

  test('renders the shift page for an on site person', async function (assert) {
    await authenticateUser(this.user.id);

    await visit(`/hq/${this.subject.id}/shift`);

    assert.strictEqual(currentURL(), `/hq/${this.subject.id}/shift`, 'privileged operator reaches the shift route');
    assert.dom(this.element).includesText('Start A Shift', 'the shift section offers a check in');
    assert.dom(this.element).includesText('Radios & Gear', 'the assets section renders');
    // The pogs section indexes eventPeriods by the event period.
    assert.dom(this.element).includesText('Meals & Showers', 'the pogs section renders');
    assert.dom(this.element).includesText('Checkout Radio', 'the radio task is suggested');
    assert.notOk(documentText().includes('bug was tripped over'), 'no error dialog is raised');
  });

  test('an off site person can be sent to Site Registration without a confirmation', async function (assert) {
    this.subject.update({on_site: false});
    await authenticateUser(this.user.id);

    await visit(`/hq/${this.subject.id}/shift`);
    assert.dom(this.element).includesText('is marked as OFF SITE', 'the off site notice renders');

    await clickText('a', 'Begin Site Registration');

    assert.strictEqual(currentURL(), `/hq/${this.subject.id}/site-checkin`, 'the hand-off link is followed');
    assert.notOk(documentText().includes('No Shift Started'), 'no shift confirmation blocks the hand-off');
  });

  test('leaving an on site person without starting a shift asks for confirmation', async function (assert) {
    await authenticateUser(this.user.id);

    await visit(`/hq/${this.subject.id}/shift`);
    await clickText('a', 'Timesheet / Corrections');

    assert.ok(documentText().includes('No Shift Started'), 'the confirmation dialog is shown');
    assert.strictEqual(currentURL(), `/hq/${this.subject.id}/shift`, 'the transition was aborted');

    await clickText('button', 'Cancel');
    assert.notOk(documentText().includes('No Shift Started'), 'cancelling closes the dialog');

    // The guard must re-arm: it used to abort only once per entry.
    await clickText('a', 'Timesheet / Corrections');
    assert.ok(documentText().includes('No Shift Started'), 'the next navigation is guarded too');
    assert.strictEqual(currentURL(), `/hq/${this.subject.id}/shift`, 'still on the shift page');
  });
});
