import Component from '@glimmer/component';
import {tracked} from "@glimmer/tracking";
import {service} from '@ember/service';
import {htmlSafe} from '@ember/template';
import {setting} from 'clubhouse/utils/setting';
import dayjs from 'dayjs';
import {
  ACTION_NEEDED,
  AFTER_EVENT,
  COMPLETED,
  NOT_AVAILABLE,
  NOTE,
  OPTIONAL,
  SKIP,
  URGENT,
  WAITING
} from "clubhouse/constants/dashboard";
import * as DashboardStep from 'clubhouse/constants/dashboard-steps';

const RESULT_PRIORITIES = {
  [URGENT]: 1,
  [ACTION_NEEDED]: 2,
  // 3 is "sticky completed", a completed item which needs to be close to the top
  [WAITING]: 4,
  [NOT_AVAILABLE]: 5,
  [OPTIONAL]: 6,
  [COMPLETED]: 7,
};

// See dashboard-steps.js for the definition of a step.

class StepGroup {
  @tracked steps;
  @tracked title;
  @tracked isActive;
  @tracked isUrgent;

  constructor(title, steps, isActive, isUrgent = false) {
    this.title = title;
    this.steps = steps;
    this.isActive = isActive;
    this.isUrgent = isUrgent;
  }
}


const STEPS = [
  DashboardStep.SIGN_NDA,
  DashboardStep.UPLOAD_PHOTO,
  DashboardStep.PHOTO_APPROVAL,
  DashboardStep.MISSING_BPGUID,
  DashboardStep.VERIFY_TIMESHEETS,
  DashboardStep.TICKETING_OPEN,
  DashboardStep.VERIFY_PERSONAL_INFO,
  DashboardStep.ONLINE_COURSE,
  DashboardStep.SIGN_UP_FOR_TRAINING,
  DashboardStep.ATTEND_TRAINING,

  {
    name: 'Sign up for a Green Dot Mentee shift',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      const {art_trainings: arts} = milestones;
      const gd = arts.find((a) => a.is_green_dot_mentee);

      if (!gd) {
        return {result: SKIP};
      }

      if (gd.mentee_slot) {
        return {result: COMPLETED};
      }

      return {
        result: ACTION_NEEDED,
        message: 'Besides attending Green Dot Training, you must sign up for, attend, and pass a Green Dot Mentee shift in order to become a Green Dot.',
        linkedMessage: {
          route: 'me.schedule',
          prefix: 'Visit',
          text: 'Me > Schedule / Sign Up',
          suffix: 'to sign up for a mentee shift.'
        }
      }
    }
  },

  {
    name: 'Attend & Pass a Green Dot Mentee shift',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      const {art_trainings: arts} = milestones;
      const gd = arts.find((a) => a.is_green_dot_mentee);

      if (!gd || !gd.mentee_slot) {
        return {result: SKIP};
      }

      return {
        result: WAITING,
        linkedMessage: {
          route: 'me.schedule',
          prefix: htmlSafe(`You are signed up for a Green Dot Mentee shift starting ${dayjs(gd.mentee_slot.begins).format('ddd MMM DD [@] HH:mm')}.<br><br>Visit`),
          text: 'Me > Schedule / Sign Up',
          suffix: 'to remove your sign-up from the schedule if you cannot make it.'
        }
      }
    }
  },

  DashboardStep.SIGN_MOTORPOOL_AGREEMENT,
  //DashboardStep.SIGN_BEHAVIORAL_AGREEMENT,
  DashboardStep.SIGN_RADIO_CHECKOUT_AGREEMENT,
  DashboardStep.VERIFY_TIMESHEETS_FINISHED,

  {
    name: 'Sign Up For & Attend Advanced Ranger Training (ART)',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      const {art_trainings: arts} = milestones;
      if (!arts.length || !milestones.online_course_enabled || !milestones.trainings_available) {
        // For the case where dirt trainings are not available or online training is not available,
        // skip showing any ART info.
        return {result: SKIP};
      }

      let result;
      if (arts.find((a) => (a.status === 'no-show' || a.status === 'fail'))) {
        result = URGENT;
      } else if (arts.find((a) => (a.status === 'no-shift'))) {
        result = ACTION_NEEDED;
      } else if (arts.find((a) => (a.status === 'pending'))) {
        result = WAITING;
      } else {
        result = COMPLETED;
      }

      const checked = {
        result,
        arts,
      };

      if (result !== COMPLETED) {
        checked.route = 'me.schedule';
      }

      return checked;
    }
  },

  {
    name: 'Sign up for a Burn Weekend shift (highly recommended)',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (milestones.burn_weekend_signup) {
        return {
          result: COMPLETED,
          message: 'Thank you for signing up for a Burn Weekend shift.'
        };
      }

      if (milestones.burn_weekend_available) {
        return {
          result: ACTION_NEEDED,
          linkedMessage: {
            route: 'me.schedule',
            prefix: 'The Burn Weekend and especially the Burn Perimeter shifts are usually understaffed and our busiest time. Visit',
            text: 'Me > Schedule / Sign Up',
            suffix: 'to sign up for a Burn Weekend shift.'
          }
        };
      }

      return {
        result: SKIP
      };
    }
  },

  DashboardStep.SIGN_UP_FOR_SHIFTS,
  DashboardStep.TAKE_STUDENT_SURVEY,

  {
    name: "Take a Trainer's Training Survey (optional)",
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (milestones.surveys.trainers.length > 0) {
        return {
          result: ACTION_NEEDED,
          message: 'Thank you for teaching. Please provide feedback on your fellow trainers:',
          survey: 'trainer'
        };
      }
      return {result: SKIP}; // Only show the step IF a survey is available (marked as passed training, and a survey has been created)
    }
  },

  {
    name: 'Contact the Mentors to sign up for a Cheetah Cub shift',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (!milestones.is_cheetah_cub) {
        return {result: SKIP};
      }

      if (milestones.cheetah_cub_shift) {
        return {result: COMPLETED}
      }

      return {
        result: milestones.online_course_passed ? URGENT : ACTION_NEEDED,
        message: 'Since you have not Rangered in a while, you will need to attend a Cheetah Cub shift before returning to Active status. Email the Mentor Cadre to sign up for one.',
        email: 'MentorEmail'
      };
    }
  },

  {
    name: 'Attend your Cheetah Cub shift',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (!milestones.is_cheetah_cub) {
        return {result: SKIP};
      }

      const signup = milestones.cheetah_cub_shift;

      if (signup && signup.status === 'pending') {
        return {
          result: ACTION_NEEDED,
          message: htmlSafe(`<b>ARRIVE 15 MINUTES EARLY. Late arrivals will NOT be allowed to walk.</b><div class="my-2">Your Cheetah Cub shift starts at ${dayjs(signup.begins).format('ddd MMM DD [@] HH:mm')}.</div>If you know you won't be able to make your Cheetah shift please email the Mentor Cadre or stop by the Mentor Shack at Ranger HQ.`),
          email: 'MentorEmail'
        };
      }

      return {result: SKIP};
    }
  },


  DashboardStep.TICKETING_CLOSED,

  {
    name: 'Sign the Sandman Affidavit',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (milestones.sandman_affidavit_signed) {
        return {result: COMPLETED};
      }

      // Person has passed Sandman training, still needs to sign stuff.
      if (milestones.sandman_affidavit_unsigned) {
        return {
          result: URGENT,
          immediate: true,
          linkedMessage: {
            route: 'me.agreements',
            prefix: 'You have to digitally sign the Sandman Affidavit to be allowed to work a Sandman shift. Visit',
            text: 'Me > Agreements',
            suffix: 'to view and sign the affidavit.'
          }
        };
      }

      // Person is not a Sandperson, or has not completed training.
      return {
        result: SKIP
      };
    }
  },
  DashboardStep.VEHICLE_REQUESTS,
  DashboardStep.AFTER_EVENT_STATUS_ADVISORY,
 ];

const NON_RANGER_STEPS = [
  DashboardStep.SIGN_NDA,
  DashboardStep.UPLOAD_PHOTO,
  DashboardStep.PHOTO_APPROVAL,
  DashboardStep.MISSING_BPGUID,
  DashboardStep.ONLINE_COURSE,
  DashboardStep.TICKETING_OPEN,
  DashboardStep.TICKETING_CLOSED,
  DashboardStep.VEHICLE_REQUESTS,
  DashboardStep.VERIFY_TIMESHEETS,
  DashboardStep.VERIFY_PERSONAL_INFO,
  DashboardStep.SIGN_UP_FOR_SHIFTS,
  DashboardStep.SIGN_MOTORPOOL_AGREEMENT,
  //DashboardStep.SIGN_BEHAVIORAL_AGREEMENT,
  DashboardStep.SIGN_RADIO_CHECKOUT_AGREEMENT,
  DashboardStep.VERIFY_TIMESHEETS_FINISHED,
];

const AFTER_EVENT_NO_MORE_THINGS_STEP = {
  name: 'Watch Announce and Thank You!',
  result: NOTE,
  message: htmlSafe("The Clubhouse has nothing for you to do at the moment. Watch Announce for next steps and additional information.<br><br>Thank you for your volunteering efforts, and hope to see you at the next event or Ranger gathering!"),
  isActive: true
};

// An impossibility but ya never know..
const BEFORE_EVENT_NO_MORE_THINGS_STEP = {
  name: 'Watch the Announce mailing list',
  result: ACTION_NEEDED,
  message: 'The Clubhouse has nothing for you to do at the moment.  Watch Announce for next steps and additional information.',
  isActive: true
}

export default class DashboardRangerComponent extends Component {
  @service session;
  @service house;

  constructor() {
    super(...arguments);
    this.isAfterEvent = this.args.milestones.period === AFTER_EVENT;
  }

  get serviceInfo() {
    const {non_ranger_years, rangered_years} = this.args.years;
    const rangerYears = rangered_years.length, nonRangerYears = non_ranger_years.length;

    if (!rangerYears && !nonRangerYears) {
      return 'stopping by';
    }

    const info = [];
    if (rangerYears) {
      info.push(`rangering ${rangerYears} burn${rangerYears !== 1 ? 's' : ''}`);
    }

    if (nonRangerYears) {
      info.push(`volunteering ${nonRangerYears} year${nonRangerYears !== 1 ? 's' : ''}`);
    }

    return info.join(' and for ');
  }

  get stepGroups() {
    const groups = [];
    const isAfterEvent = (this.args.milestones.period === AFTER_EVENT);
    const {
      immediateSteps,
      steps,
      completed
    } = this._processStepGroup(this.args.person.isNonRanger ? NON_RANGER_STEPS : STEPS);

    if (immediateSteps.length) {
      groups.push(new StepGroup('IMMEDIATE ACTION REQUIRED', immediateSteps, true, true));
    } else if (!steps.length) {
      steps.push(isAfterEvent ? AFTER_EVENT_NO_MORE_THINGS_STEP : BEFORE_EVENT_NO_MORE_THINGS_STEP);
    }

    if (!isAfterEvent || steps.length) {
      groups.push(new StepGroup(isAfterEvent ? 'After Event Action Items' : 'Preparation For Playa', steps,
        !immediateSteps.length
      ));
    }

    if (completed.length) {
      groups.push(new StepGroup('Completed', completed));
    }


    groups[groups.length - 1].isLast = true;

    return groups;
  }

  _processStepGroup(checks) {
    const {milestones, photo, person, agreements} = this.args;
    const period = milestones.period;
    let haveAction = false;

    const steps = [], immediateSteps = [], completed = [];

    checks.forEach((step) => {
      if ((step.period && step.period !== period)
        || (step.skipPeriod && step.skipPeriod === period)) {
        return;
      }

      const check = step.check({milestones, photo, person, house: this.house, agreements});
      if (check.result === SKIP) {
        return;
      }

      if (!check.name) {
        check.name = step.name;
      }

      if (check.email) {
        check.email = setting(check.email);
      }

      if (check.result !== COMPLETED) {
        if (!haveAction || (check.result === ACTION_NEEDED || check.result === OPTIONAL || check.result === URGENT)) {
          check.isActive = true;
          haveAction = true;
        }
      }

      if (check.immediate || step.immediate) {
        immediateSteps.push(check);
      } else if (check.result === COMPLETED) {
        completed.push(check);
      } else {
        steps.push(check);
      }
    });

    this._sortSteps(steps);
    this._sortSteps(immediateSteps);
    this._sortSteps(completed);

    return {steps, immediateSteps, completed};
  }

  _sortSteps(steps) {
    steps.forEach((s, idx) => s.sort_index = idx);
    steps.sort((a, b) => {
      const compare = (a.sticky ? 3 : RESULT_PRIORITIES[a.result]) - (b.sticky ? 3 : RESULT_PRIORITIES[b.result]);
      return compare ? compare : (a.sort_index - b.sort_index);
    });
  }
}
