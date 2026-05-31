import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {RegisterValidations} from 'clubhouse/validations/register';
import {HUMAN_QUESTION, isHumanAnswerValid} from 'clubhouse/utils/human-check';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

// Wizard steps, in flow order. stepAction() only accepts these values so a stray
// or stale step can never render the unknown-step fallback.
export const STEPS = ['ask-intent', 'ranger', 'audit', 'register'];

// Where on the public site prospective volunteers fill out a Volunteer Form.
// Referenced from more than one step in the template, so it lives here as a
// single source. HTTPS only — this links to a PII-collecting form.
const PROFILES_URL = 'https://profiles.burningman.org';

// Why-are-you-here options for the registration form's intent radio group.
const INTENT_OPTIONS = [
  ['Regional Ranger — not a Black Rock Ranger this year', 'Regional'],
  ['Audit training — not becoming a Ranger this year', 'Sitin'],
  ['Become a Black Rock Ranger at Burning Man this year', 'Ranger'],
  ['Other reason', 'Other'],
];

// Form fields copied verbatim into the `person` payload sent to the API.
//
// This intentionally diverges from the validation keys: `human` (the bot check)
// and `password_confirmation` are validated client-side but must NOT be sent as
// person attributes. Do not derive this list from the validations.
const REGISTER_FIELDS = [
  'email',
  'first_name',
  'mi',
  'last_name',
  'street1',
  'street2',
  'apt',
  'city',
  'state',
  'country',
  'zip',
  'password',
  'home_phone',
  'alt_phone',
];

// Initial transient wizard state. Used by both the controller's reset and the
// route's setupController so the defaults are defined exactly once.
const WIZARD_DEFAULTS = Object.freeze({step: 'ask-intent', registerForm: {}});

const HUMAN_ERROR_MSG = 'Are you sure you are human? The answer is not right. Try again.';
const SUCCESS_TITLE = 'Account Successfully Created';
const SUCCESS_BODY = 'Congratulations Auditor! You have successfully created a Clubhouse account. ' +
  'After closing this dialog, you will be redirected to the login. Go ahead and login.';

const RANGER_INTENT_TITLE = "You're in the wrong place to become a Ranger";
const RANGER_INTENT_BODY =
  '<p><b>You do not create a Clubhouse account to become a Black Rock Ranger.</b></p>' +
  '<ul class="lh-lg">' +
    `<li><b>Do this:</b> go to <a href="${PROFILES_URL}" target="_blank" rel="noopener noreferrer">profiles.burningman.org</a> and submit a Volunteer Form.</li>` +
    '<li>The Ranger Volunteer Coordinators will reach out with your next steps once they receive your application.</li>' +
    '<li>This registration form is only for people who want to <b>audit</b> training, or who are training as a <b>Regional Ranger</b> — not as a BRC Ranger.</li>' +
  '</ul>';

export default class RegisterController extends ClubhouseController {
  @tracked isSaving = false;
  @tracked step = WIZARD_DEFAULTS.step;
  @tracked registerForm = WIZARD_DEFAULTS.registerForm;

  registerValidations = RegisterValidations;
  profilesUrl = PROFILES_URL;
  humanQuestion = HUMAN_QUESTION;
  intentOptions = INTENT_OPTIONS;

  // Reset per-visit wizard state. The controller is an app-lifetime singleton,
  // so the route calls this on every entry to avoid showing a stale step or a
  // half-filled form to a returning visitor.
  resetWizard() {
    this.step = WIZARD_DEFAULTS.step;
    this.registerForm = {};
  }

  @action
  async createAccount(model, isValid) {
    // Guard against double-submit: the request is in flight, ignore further taps.
    if (this.isSaving) {
      return;
    }

    if (!isValid) {
      return;
    }

    // A would-be Black Rock Ranger does not register here. Redirect them to the
    // Volunteer Form instead of posting an auditor account. Checked before the
    // bot quiz so we never make them solve it just to be turned away.
    if (model.get('intent') === 'Ranger') {
      this.modal.info(RANGER_INTENT_TITLE, RANGER_INTENT_BODY);
      return;
    }

    // Bot check. UX deterrent only — the API must re-validate `human`.
    const humanAnswer = (model.get('human') ?? '').trim();
    if (!isHumanAnswerValid(humanAnswer)) {
      model.pushErrors('human', HUMAN_ERROR_MSG);
      this.house.scrollToTop();
      return;
    }

    const person = {status: 'auditor'};
    const intent = model.get('intent');

    REGISTER_FIELDS.forEach((field) => {
      person[field] = model.get(field);
    });

    this.isSaving = true;
    try {
      // `human` is sent so the server can independently enforce the bot check.
      const result = await this.ajax.post('person/register', {data: {person, intent, human: humanAnswer}});
      this.handleRegisterResult(result);
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSaving = false;
    }
  }

  handleRegisterResult(result) {
    switch (result.status) {
      case 'success':
        this.modal.info(SUCCESS_TITLE, SUCCESS_BODY, () => {
          this.router.transitionTo('login');
        });
        break;

      default:
        this.modal.info('Unknown Status', `An unknown response received from the server [${result.status}]`);
        break;
    }
  }

  @action
  stepAction(step) {
    if (STEPS.includes(step)) {
      this.step = step;
    }
  }
}
