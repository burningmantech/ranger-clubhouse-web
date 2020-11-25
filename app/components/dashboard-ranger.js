import Component from '@glimmer/component';
import {tracked} from "@glimmer/tracking";
import {inject as service} from '@ember/service';
import {htmlSafe} from '@ember/string';
import {config} from 'clubhouse/utils/config';
import moment from 'moment';
import {
  ACTION_NEEDED,
  AFTER_EVENT,
  BEFORE_EVENT,
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

function usingTicket(t) {
  return (t && (t.status === 'claimed' || t.status === 'submitted'));
}

class StepGroup {
  @tracked steps;
  @tracked title;
  @tracked isActive;

  constructor(title, steps, isActive) {
    this.title = title;
    this.steps = steps;
    this.isActive = isActive;
  }
}

function buildTickets({ticketing_package, ticketing_period}) {
  const pkg = ticketing_package;
  const isClosed = ticketing_period === 'closed';
  const claimed = [], banked = [];

  pkg.tickets.forEach((t) => {
    if (usingTicket(t)) {
      claimed.push({type: t.type});
    } else if (t.status === 'banked' || (isClosed && t.status === 'qualified')) {
      banked.push({type: t.type, expiry_date: t.expiry_date})
    }
  });

  if (usingTicket(pkg.vehicle_pass)) {
    claimed.push({type: pkg.vehicle_pass.type});
  }

  if (usingTicket(pkg.wap)) {
    claimed.push({type: pkg.wap.type});
  }

  if (pkg.wapso.length) {
    const names = [];
    pkg.wapso.forEach((t) => {
      if (usingTicket(t)) {
        names.push(t.name);
      }
    });
    if (names.length) {
      claimed.push({type: 'work_access_pass_so', count: names.length, names})
    }
  }

  return {claimed, banked};
}

const STEPS = [
  DashboardStep.UPLOAD_PHOTO,
  DashboardStep.PHOTO_APPROVAL,
  DashboardStep.MISSING_BPGUID,
  DashboardStep.VERIFY_TIMESHEETS,
  {
    name: 'Claim Tickets, Vehicle Passes, and Work Access Passes',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      const period = milestones.ticketing_period;

      if (period !== 'open' || !milestones.ticketing_package) {
        return {result: SKIP};
      }

      const tickets = buildTickets(milestones);

      if (tickets.claimed.length || tickets.banked.length) {
        // stuff has been claimed..
        return {
          result: COMPLETED,
          route: 'me.tickets',
          isTicketing: true,
          ticketingOpen: true,
          tickets,
          immediate: false, // move it down
        };
      }
      return {
        result: ACTION_NEEDED,
        route: 'me.tickets',
        immediate: true,
        isTicketing: true,
        ticketingOpen: true,
        tickets
      };
    }
  },

  DashboardStep.VERIFY_PERSONAL_INFO,
  DashboardStep.ONLINE_TRAINING,
  DashboardStep.SIGN_UP_FOR_TRAINING,
  DashboardStep.ATTEND_TRAINING,

  {
    name: 'Sign up for a Green Dot Mentee shift',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      const {art_trainings: arts} = milestones;
      const gd = arts.find((a) => a.is_green_dot_mentee);

      if (!gd || gd.mentee_slot) {
        return {result: SKIP};
      }

      return {
        result: ACTION_NEEDED,
        message: 'Besides attending Green Dot Training, you must sign up for, walk, and pass a Green Dot Mentee shift in order to become a Green Dot.',
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
    name: 'Walk and pass a Green Dot Mentee shift',
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
          prefix: htmlSafe(`You are signed up for a Green Dot Mentee shift starting ${moment(gd.mentee_slot.begins).format('ddd MMM DD [@] HH:mm')}.<br><br>Visit`),
          text: 'Me > Schedule / Sign Up',
          suffix: 'to remove your sign-up from the schedule if you cannot make it.'
        }
      }
    }
  },

  DashboardStep.SIGN_UP_FOR_SHIFTS,

  {
    name: 'Sign Up For & Attend Advanced Ranger Training (ART)',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      const {art_trainings: arts} = milestones;
      if (!arts.length) {
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
        result: ACTION_NEEDED,
        message: 'Since you have not Rangered in a while, you will need to walk a Cheetah Cub shift before returning to Active status. Email the Mentor Cadre to sign up for one.',
        email: 'MentorEmail'
      };
    }
  },

  {
    name: 'Walk your Cheetah Cub shift',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (!milestones.is_cheetah_cub) {
        return {result: SKIP};
      }

      const signup = milestones.cheetah_cub_shift;

      if (signup && signup.status === 'pending') {
        return {
          result: ACTION_NEEDED,
          message: htmlSafe(`<b>ARRIVE 15 MINUTES EARLY. Late arrivals will NOT be allowed to walk.</b><div class="my-2">Your Cheetah Cub shift starts at ${moment(signup.begins).format('ddd MMM DD [@] HH:mm')}.</div>If you know you won't be able to make your Cheetah shift please email the Mentor Cadre or stop by the Mentor Shack at Ranger HQ.`),
          email: 'MentorEmail'
        };
      }

      return {result: SKIP};
    }
  },


  {
    name: 'Ticketing has closed',
    period: BEFORE_EVENT,
    check({milestones}) {
      if (milestones.ticketing_period !== 'closed' || !milestones.ticketing_package) {
        return {result: SKIP};
      }

      return {
        result: NOT_AVAILABLE,
        isTicketing: true,
        isTicketingClosed: true,
        tickets: buildTickets(milestones),
      };
    }
  },

  DashboardStep.SIGN_MOTORPOOL_AGREEMENT,
  //DashboardStep.SIGN_BEHAVIORAL_AGREEMENT,
  DashboardStep.SIGN_RADIO_CHECKOUT_AGREEMENT,
  DashboardStep.VERIFY_TIMESHEETS_FINISHED,

  {
    name: 'Submit Personal Vehicle Request(s)',
    skipPeriod: AFTER_EVENT,
    check({milestones}) {
      if (!milestones.vehicle_requests_allowed) {
        return {result: SKIP};
      }

      const vr = milestones.vehicle_requests;
      if (vr.find((r) => r.status === 'approved')) {
        return {
          result: COMPLETED,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'Your vehicle request has been approved. Visit',
            text: 'Me > Vehicle Requests',
            suffix: 'for details.'
          }
        };
      } else if (vr.find((r) => r.status === 'pending')) {
        return {
          result: WAITING,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'Your vehicle request is pending review. Visit',
            text: 'Me > Vehicle Requests',
            suffix: 'to adjust or delete your request.'
          }
        };

      } else if (vr.find((r) => r.status === 'rejected')) {
        return {
          result: URGENT,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'Your vehicle request has been denied. Visit',
            text: 'Me > Vehicle Requests',
            suffix: 'for details.'
          }
        };
      } else {
        return {
          result: ACTION_NEEDED,
          linkedMessage: {
            route: 'me.vehicles',
            prefix: 'You have been approved to submit vehicle requests for driving stickers and other items. Visit',
            text: 'Me > Vehicle Requests',
            suffix: 'to submit a request.'
          }
        };
      }
    }
  },
];

const NON_RANGER_STEPS = [
  DashboardStep.UPLOAD_PHOTO,
  DashboardStep.PHOTO_APPROVAL,
  DashboardStep.MISSING_BPGUID,
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

  get stepGroups() {
    const groups = [];
    const isAfterEvent = (this.args.milestones.period === AFTER_EVENT);
    const {immediateSteps, steps} = this._processStepGroup(this.args.person.isNonRanger ? NON_RANGER_STEPS : STEPS);

    if (immediateSteps.length) {
      groups.push(new StepGroup('Immediate Action Need', immediateSteps, true));
    }

    if (!steps.length) {
        steps.push(isAfterEvent ? AFTER_EVENT_NO_MORE_THINGS_STEP : BEFORE_EVENT_NO_MORE_THINGS_STEP);
    }

    groups.push(new StepGroup(isAfterEvent ? 'After Event Action Items' : 'Preparation For Playa', steps,
      !immediateSteps.length
    ));


    groups[groups.length - 1].isLast = true;

    return groups;
  }

  _processStepGroup(checks) {
    const {milestones, photo, person} = this.args;
    const period = milestones.period;
    let haveAction = false;

    const steps = [], immediateSteps = [];

    checks.forEach((step) => {
      if ((step.period && step.period !== period)
        || (step.skipPeriod && step.skipPeriod === period)) {
        return;
      }

      const check = step.check({milestones, photo, person});
      if (check.result === SKIP) {
        return;
      }

      check.name = step.name;

      if (check.email) {
        check.email = config(check.email);
      }

      if (check.result !== COMPLETED /*&& check.result !== OPTIONAL*/) {
        if (!haveAction || (check.result === ACTION_NEEDED || check.result === OPTIONAL || check.result === URGENT)) {
          check.isActive = true;
          haveAction = true;
        }
      }

      if (check.immediate || step.immediate) {
        immediateSteps.push(check);
      } else {
        steps.push(check);
      }
    });

    this._sortSteps(steps);
    this._sortSteps(immediateSteps);

    return {steps, immediateSteps};
  }

  _sortSteps(steps) {
    steps.forEach((s, idx) => s.sort_index = idx);
    steps.sort((a, b) => {
      const compare = (a.sticky ? 3 : RESULT_PRIORITIES[a.result]) - (b.sticky ? 3 : RESULT_PRIORITIES[b.result]);
      return compare ? compare : (a.sort_index - b.sort_index);
    });
  }
}
