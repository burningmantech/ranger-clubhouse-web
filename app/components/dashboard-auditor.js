import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {config} from 'clubhouse/utils/config';
import {htmlSafe} from '@ember/template';
import {
  ACTION_NEEDED,
  BLOCKED,
  COMPLETED,
  NOT_AVAILABLE,
  OPTIONAL,
  SKIP,
  URGENT
} from "clubhouse/constants/dashboard";
import * as DashboardStep from 'clubhouse/constants/dashboard-steps';

const RANGER_INTEREST_STEP = {
  name: 'Interested in being a Black Rock Ranger?',
  check() {
    return {
      result: ACTION_NEEDED,
      message: htmlSafe(`<a href="https://rangers.burningman.org/ranger-application-process/" target="_blank" rel="noopener noreferrer">Sign up</a> to be notified when the ${(new Date).getFullYear() + 1} Ranger applications open up.`)
    }
  }
};

const AUDITOR_STEPS = [
  DashboardStep.VERIFY_PERSONAL_INFO,
//  DashboardStep.SIGN_BEHAVIORAL_AGREEMENT, TODO: revisit after Council decision.
  DashboardStep.ONLINE_TRAINING,
  DashboardStep.SIGN_UP_FOR_TRAINING,
  DashboardStep.ATTEND_TRAINING,
  DashboardStep.TAKE_STUDENT_SURVEY,
  RANGER_INTEREST_STEP
];

const OFFSEASON_STEPS = [
  RANGER_INTEREST_STEP
];

export default class DashboardAuditorComponent extends Component {
  @service session;

  get isOffSeason() {
    return this.args.milestones.period === 'after-event';
  }

  /**
   * The Auditor dashboard is similar to the PNV dashboard - all prior steps must be completed
   * before the current step is allowed.
   *
   * One exception is "Interested in being a Black Rock Ranger?" step shown at the bottom and always allowed.
   *
   * @returns {[]}
   */

  get steps() {
    const {milestones, person, agreements} = this.args;
    const steps = [];
    let prevCompleted = true;

    const periodSteps = (this.isOffSeason ? OFFSEASON_STEPS : AUDITOR_STEPS);

    periodSteps.forEach((step) => {
      const check = step.check({milestones, prevCompleted, person, isAuditor: true, agreements});

      if (check.result === SKIP) {
        return;
      }

      if (!check.name) {
        check.name = step.name;
      }

      if (check.email) {
        check.email = config(check.email);
      }

      if (check.result !== COMPLETED && check.result !== OPTIONAL) {
        if (check.result === ACTION_NEEDED || check.result === URGENT) {
          check.isActive = true;
        } else if (check.result !== BLOCKED) {
          // Another action needs to be taken first.
          check.result = NOT_AVAILABLE;
        }

        prevCompleted = false;
      }
      steps.push(check);
    });

    return steps;
  }

  get isNotUser() {
    return this.session.userId != this.args.person.id;
  }
}
