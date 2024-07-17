import Component from '@glimmer/component';
import {service} from '@ember/service';
import {setting} from 'clubhouse/utils/setting';
import {htmlSafe} from '@ember/template';
import dayjs from 'dayjs';
import {
  ACTION_NEEDED,
  BLOCKED,
  COMPLETED,
  NOT_AVAILABLE,
  OPTIONAL,
  SKIP,
  URGENT,
  WAITING
} from "clubhouse/constants/dashboard";
import * as DashboardStep from 'clubhouse/constants/dashboard-steps';
import {BONKED, PROSPECTIVE, UBERBONKED} from "../constants/person_status";

const SETUP_ACCOUNT_STEPS = [
  DashboardStep.UPLOAD_PHOTO,
  DashboardStep.PHOTO_APPROVAL,
  DashboardStep.VERIFY_PERSONAL_INFO,
  DashboardStep.SIGN_BEHAVIORAL_AGREEMENT,
  DashboardStep.MISSING_BPGUID,
];

const TRAINING_STEPS = [
  DashboardStep.ONLINE_COURSE,
  DashboardStep.SIGN_UP_FOR_TRAINING,
  DashboardStep.ATTEND_TRAINING,
  DashboardStep.TAKE_STUDENT_SURVEY
];

const ALPHA_SHIFT_DISCLAIMER = 'Alpha shifts are only available Saturday (the day before the gate opens), Sunday, Monday, and Tuesday. No shifts are offered later in the week.';

const ALPHA_STEPS = [
  DashboardStep.SIGN_RADIO_CHECKOUT_AGREEMENT,
  DashboardStep.SIGN_MOTOR_POOL_PROTOCOL,
  {
    name: 'Sign up for an Alpha shift',
    check({milestones, person}) {
      if (person.status === BONKED || person.status === UBERBONKED) {
        return {result: SKIP};
      }

      if (milestones.alpha_shift) {
        return {result: COMPLETED}
      }

      if (milestones.training.status !== 'pass') {
        return {
          result: NOT_AVAILABLE,
          message: 'You must ATTEND and PASS an In-Person Training first before being allowed to sign up for an Alpha shift. ' + ALPHA_SHIFT_DISCLAIMER,
        };
      }

      if (person.status !== PROSPECTIVE && milestones.alpha_shifts_available) {
        return {
          result: ACTION_NEEDED,
          route: 'me.schedule',
          linkedMessage: {
            route: 'me.schedule',
            prefix: htmlSafe(`${ALPHA_SHIFT_DISCLAIMER}<br><br>Visit `),
            text: 'Me > Schedule / Sign Up',
            suffix: 'to sign up for an Alpha shift.'
          }
        };
      }

      return {
        result: WAITING,
        message: `Not Available Yet. Alpha shifts will be available after noon Pacific on ${dayjs(milestones.alpha_shift_publish_date).format('MMMM Do')} OR the Wednesday AFTER you complete training, which ever is later. ${ALPHA_SHIFT_DISCLAIMER}`,
      };
    }
  },

  {
    name: 'Attend your Alpha shift',
    check({milestones, person}) {
      if (person.status === BONKED || person.status === UBERBONKED) {
        return {
          result: BLOCKED,
          message: 'You did not pass your Alpha shift. You are unable to sign up for Ranger shifts this season.',
        };
      }

      if (milestones.alpha_shift) {
        if (milestones.alpha_shift.status === 'pending') {
          return {
            result: ACTION_NEEDED,
            message: htmlSafe(
              `<p>Please read "<a href="${milestones.alpha_shift_prep_link}" target="_blank" rel="noopener noreferrer">Becoming a Ranger: On-playa Alpha Shifts</a>"`
              + ` on the Ranger website.</p>Your Alpha shift starts ${dayjs(milestones.alpha_shift.begins).format('ddd MMM DD [@] HH:mm')}.`
              + `<p class="text-danger"><b>ARRIVE 30 MINUTES EARLY.</b> Late arrivals will be turned away.</p>`
              + `<p>Alpha shifts are long 10+ hours. The first 2 hours are review, and practice. 6 hours are spent in
                the field with Mentors. The last 2+ hours are Mentor evaluations and may involve a lot of waiting. (We
                have a lot of Alphas to assess at the end of the day, and it takes time.)</p>`
              + `<p>Show up prepared with snacks and a meal, layered clothing, a hat, sunglasses, comfortable walking shoes,
            sunscreen, a water container (water and electrolytes are offered), a pen or pencil, a notebook, and, if
            attending a swing shift (2pm til midnight), a flashlight or headlamp. </p>`
              + `<p>Check-in at the Hat Rack located at Ranger HQ, 5:45 &amp; the Esplanade close to Center Camp.</p>`
              + `If you know you won't be able to make your Alpha shift please email the Mentor Cadre or stop by Ranger HQ on playa.`),
            email: 'MentorEmail'
          };
        } else {
          return {
            result: URGENT,
            message: "It looks like you've missed your Alpha shift. You are welcome to apply again next year. If you believe this is in error, please email the Volunteer Coordinators.",
            email: 'VcEmail'
          };
        }
      }

      if (!milestones.alpha_shifts_available) {
        return {result: NOT_AVAILABLE, message: 'Alpha shifts are not available yet.'};
      }

      return {result: NOT_AVAILABLE, message: 'Please sign up for an Alpha shift.'}
    }
  },
  DashboardStep.TAKE_ALPHA_SURVEY,
]

const STEP_GROUPS = [
  {title: 'Setup Your Clubhouse Account', steps: SETUP_ACCOUNT_STEPS},
  {title: 'Train to be a Ranger ', steps: TRAINING_STEPS},
  {title: 'Attend your Alpha shift', steps: ALPHA_STEPS}
];

export default class DashboardPNVComponent extends Component {
  @service session;

  get isNotUser() {
    return this.session.userId != this.args.person.id;
  }

  get stepGroups() {
    const {milestones, photo, person, agreements} = this.args;
    let haveActiveGroup = false;
    let prevCompleted = true;
    const groups = [], completed = [];

    let includePhotoStepInCompleted = false;

    STEP_GROUPS.forEach((group) => {
      let haveAction = false, stepsCompleted = true;
      const steps = [];
      let includePhotoStep = false;

      group.steps.forEach((step) => {
        const check = step.check({milestones, photo, person, isPNV: true, prevCompleted, agreements});
        if (check.result === SKIP) {
          return;
        }

        if (!check.name) {
          check.name = step.name;
        }

        if (check.email) {
          check.email = setting(check.email);
        }

        if (check.result === COMPLETED) {
          completed.push(check);
          if (check.isUploadPhoto) {
            includePhotoStepInCompleted = true;
          }
        } else {
          if (check.isPhotoStep) {
            includePhotoStep = true;
          }
          if (check.result !== OPTIONAL) {
            stepsCompleted = false;
            if (!haveAction || check.result === ACTION_NEEDED) {
              check.isActive = true;
              haveAction = true;
            }
          }
          steps.push(check);
        }
      });

      if (!steps.length) {
        return;
      }

      const actions = {
        title: group.title,
        steps
      };

      if (!stepsCompleted && prevCompleted) {
        prevCompleted = false;
      }

      if (!haveActiveGroup && haveAction) {
        actions.isActive = true;
        haveActiveGroup = true;
      } else if (haveActiveGroup) {
        steps.forEach((t) => {
          // If a previous group has actions, mark any group as not available.
          if (t.result === ACTION_NEEDED || t.result === URGENT) {
            t.result = NOT_AVAILABLE;
          }
        })
      }

      actions.includePhotoStep = includePhotoStep;
      if (actions.isActive) {
        actions.haveUrgentActions = steps.some((t) => (t.result === URGENT));
        actions.haveActions = steps.some((t) => (t.result !== COMPLETED && t.result !== WAITING && t.result !== OPTIONAL));
        actions.haveWaiting = steps.some((t) => t.result === WAITING);
      }

      groups.push(actions);
    });

    if (completed.length) {
      groups.push({title: 'Completed', steps: completed, includePhotoStep: includePhotoStepInCompleted});
    }

    groups[groups.length - 1].isLast = true;
    return groups;
  }

  get haveUrgentActions() {
    return this.stepGroups.some((g) => g.haveUrgentActions);
  }

  get haveActions() {
    return this.stepGroups.some((g) => g.haveActions);
  }

  get haveWaiting() {
    return this.stepGroups.some((g) => g.haveWaiting);
  }
}
