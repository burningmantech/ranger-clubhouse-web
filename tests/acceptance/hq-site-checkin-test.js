import { module, test } from 'qunit';
import { visit, currentURL, click, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../helpers/authenticate-user';

// hq.js beforeModel() gates the whole HQ interface on the ADMIN or
// SHIFT_MANAGEMENT role; ADMIN also satisfies the controller's
// canEditEmergencyContact (session.isAdmin).
const ADMIN_ROLE = 1;

// Click the first <button> whose visible text contains `label`. The wizard
// renders each step as a modal with UiButton-backed footer buttons that carry
// no data-test hooks, so text is the stable handle. Returns a settled promise.
function clickButton(label) {
  const button = [...document.querySelectorAll('button')].find((el) =>
    el.textContent.replace(/\s+/g, ' ').trim().includes(label)
  );
  if (!button) {
    throw new Error(`No button found containing text "${label}"`);
  }
  return click(button);
}

// The wizard renders each step inside a BsModal that tethers its content to a
// wormhole outside the test root, so scope text assertions to the whole
// document rather than the `.modal` placeholder element.
function documentText() {
  return document.body.textContent.replace(/\s+/g, ' ');
}

module('Acceptance | hq site-checkin', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.user = this.server.create('person', { roles: [ADMIN_ROLE] });
    this.subject = this.server.create('person', {
      callsign: 'Hardware',
      status: 'active',
      on_site: false,
    });
    this.year = new Date().getFullYear();

    // Endpoints the parent hq.js model() hook fans out to that have no global
    // Mirage handler. Kept local so this route's test owns its data contract.
    this.server.get('/api/person/:id/timesheet-summary', () => ({ summary: {} }));
    this.server.get('/api/person-banner', ({ personBanners }) => personBanners.all());
    // The route calls session.updateOnDuty() when the operator has no signed-in
    // position; answer it so the model hook resolves cleanly.
    this.server.get('/api/person/:id/onduty', () => ({ onduty: null }));
  });

  test('renders the On-Site Registration page for a person who is not yet on site', async function (assert) {
    await authenticateUser(this.user.id);

    await visit(`/hq/${this.subject.id}/site-checkin`);

    assert.strictEqual(
      currentURL(),
      `/hq/${this.subject.id}/site-checkin`,
      'privileged operator reaches the site-checkin route'
    );
    assert.dom(this.element).includesText('On-Site Registration', 'page heading renders');
    assert.dom(this.element).includesText('Agreements', 'agreements section renders');
    assert.dom(this.element).includesText('Provisions Summary', 'provisions summary section renders');

    // The global person-event mock returns asset_authorized + signed_motorpool,
    // so both agreements display as signed.
    assert
      .dom(this.element)
      .includesText('Radio Checkout Agreement has been signed', 'radio agreement shows signed');
    assert
      .dom(this.element)
      .includesText('Vehicle Use Protocol has been signed', 'motorpool agreement shows signed');

    // Begin button is present; the "marked on site" success notice is NOT shown
    // because the person is not on_site yet.
    assert.dom(this.element).includesText('Begin On-Site Registration', 'begin button renders');
    assert
      .dom(this.element)
      .doesNotIncludeText('Marked On Site', 'no completion notice before check-in');
  });

  test('shows the completion notice and shift link for a person already on site', async function (assert) {
    await authenticateUser(this.user.id);
    this.subject.update({ on_site: true });

    await visit(`/hq/${this.subject.id}/site-checkin`);

    assert
      .dom(this.element)
      .includesText('Hardware Marked On Site', 'completion notice names the person');
    assert
      .dom(this.element)
      .includesText('Start Shift Check-In', 'offers the link to start a shift');
    assert
      .dom('a.btn-success')
      .exists('the Start Shift Check-In action is a button-styled link');
  });

  test('walking the wizard to the end marks the person on site', async function (assert) {
    await authenticateUser(this.user.id);

    // Make the Radios step a clean pass-through: with radio_eligible off, the
    // step renders the "Shift Radios Only" branch (no asset checkout components)
    // and checkForRadio advances immediately without a confirmation modal.
    this.server.get('/api/person/:id/event-info', () => ({
      event_info: {
        year: this.year,
        trainings: [],
        radio_eligible: 0,
        radio_max: 0,
        meals: '',
        showers: '',
        radio_info_available: true,
      },
    }));

    await visit(`/hq/${this.subject.id}/site-checkin`);

    // Open the wizard.
    await clickButton('Begin On-Site Registration');
    assert.ok(
      documentText().includes('Verify Camp Information'),
      'wizard opens on the camp-info step'
    );

    // Step 1 (camp) and Step 2 (emergency contact) each save the person record.
    await clickButton('Save & Next');
    assert.ok(
      documentText().includes('Verify Emergency Contact Information'),
      'advanced to the emergency-contact step'
    );

    await clickButton('Save & Next');
    assert.ok(documentText().includes('Radios'), 'advanced to the radios step');

    // Step 3 (radios) -> advance to the final step.
    await clickButton('Next');
    assert.ok(
      documentText().includes('Mark Person As On Site'),
      'reached the final step'
    );

    // The person is not on site until the final action runs.
    assert.false(this.subject.reload().on_site, 'person is not on site before finishing');

    // Final step: mark on site.
    await clickButton('Mark As On Site');
    await settled();

    assert.true(this.subject.reload().on_site, 'person is persisted as on_site after finishing');
    assert.notOk(
      documentText().includes('Mark Person As On Site'),
      'wizard closes after marking on site'
    );
    assert
      .dom(this.element)
      .includesText('Marked On Site', 'completion notice renders after finishing');
  });

  test('redirects an operator who lacks HQ permissions away from the route', async function (assert) {
    // A plain user with no ADMIN/SHIFT_MANAGEMENT role.
    const plainUser = this.server.create('person', { roles: [] });
    await authenticateUser(plainUser.id);

    await visit(`/hq/${this.subject.id}/site-checkin`);

    assert.notStrictEqual(
      currentURL(),
      `/hq/${this.subject.id}/site-checkin`,
      'unauthorized operator is bounced off the site-checkin route'
    );
  });
});
