import Component from '@glimmer/component';
import {tracked} from "@glimmer/tracking";
import {action, computed, set} from '@ember/object';
import {inject as service} from '@ember/service';
import {config} from 'clubhouse/utils/config';
import {htmlSafe} from '@ember/string';
import moment from 'moment';
import ENV from 'clubhouse/config/environment';

const COMPLETED = 'completed';
const ACTION_NEEDED = 'action-needed';
const NOT_AVAILABLE = 'not-available';
const SKIP = 'skip';
const BLOCKED = 'blocked';
const OPTIONAL = 'optional';
const WAITING = 'waiting';

const AUDITOR_TASKS = [{
  name: 'Review and Update Personal Information',
  check(milestones) {
    if (milestones.has_reviewed_pi) {
      return {result: COMPLETED};
    }

    return {
      result: ACTION_NEEDED,
      route: 'me.personal-info',
      isVisitPersonInfo: true,
    };
  }
},

  {
    name: 'Sign the Burning Man Behavioral Standards Agreement (optional)',
    check(milestones) {
      if (milestones.behavioral_agreement) {
        return {result: COMPLETED};
      }

      return {
        result: OPTIONAL,
        isBehavioralAgreement: true,
        message: 'All volunteers are asked to sign the optional Behavioral Standards Agreement.'
      };
    }
  },

  {
    name: 'Read the Ranger Manual & Complete Part 1 of Training (online)',
    check(milestones) {
      if (milestones.online_training_passed) {
        return {result: COMPLETED};
      }

      if (!milestones.online_training_enabled) {
        return {result: WAITING, message: 'Part 1 of Training (online) is not quite ready yet. Check back later.'}
      }

      return {
        result: ACTION_NEEDED,
        message: 'The online portion of training will take 1 to 3 hours to complete. Note: it may take up to 15 mins or more for the Clubhouse to register your course completion.',
        isOnlineTraining: true
      };
    }
  },

  {
    name: 'Sign up for Part 2 of Training (face-to-face)',
    check(milestones, prevCompleted) {
      if (!prevCompleted) {
        return {result: NOT_AVAILABLE, message: 'You need to complete the items listed above.'}
      }

      if (milestones.training.status != 'missing') {
        return {result: COMPLETED};
      }

      if (milestones.trainings_available) {
        return {
          result: ACTION_NEEDED,
          isTrainingSignup: true,
          route: 'me.schedule',
        };
      } else {
        return {
          result: WAITING,
          message: 'Training sign ups are not yet available and usually do not open until mid-to-late April. Please check back later.'
        };
      }
    }
  },

  {
    name: 'Complete Training',
    check(milestones) {
      switch (milestones.training.status) {
        case 'passed':
          return {result: COMPLETED};

        case 'missing':
          return {
            result: NOT_AVAILABLE,
            message: 'You need to sign up for a training session. Walkins are not allowed.'
          };

        case 'failed':
          return {
            result: BLOCKED,
            message: `You did not attend or failed to complete training on ${moment(milestones.training.begins).format('dddd, MMMM Do YYYY')} located at ${milestones.training.description}. Email the Training Academy to sign up for another session.`,
            email: 'TrainingAcademyEmail',
          };

        case 'pending':
          return {
            result: ACTION_NEEDED,
            message: `The training session starts ${moment(milestones.training.begins).format('ddd MMM DD [@] HH:mm')} located in ${milestones.training.description}. If you cannot make the session, please remove your sign up from the schedule.`,
          };

        default:
          return {
            result: BLOCKED,
            message: `Unknown training status [${milestones.training.status}]. This is a bug`
          };
      }
    }
  },

  {
    name: 'Take a Training Survey (optional)',
    check(milestones) {

      if (milestones.surveys.sessions.length > 0) {
        return {
          result: OPTIONAL,
          message: 'Please take a moment to provide feedback on your face-to-face training experience.',
          survey: true
        };

      }
      return {result: SKIP}; // Only show the step IF a survey is available (marked as passed training, and a survey has been created)
    }
  },

  {
    name: 'Interested in being a Black Rock Ranger?',
    check() {
      return {
        result: ACTION_NEEDED,
        message: htmlSafe('<a href="https://rangers.burningman.org/ranger-application-process/" target="_blank" rel="noopener">Sign up</a> to be notified when Ranger applications open next year.')
      }
    }
  }
];

export default class DashboardAuditorComponent extends Component {
  @service house;
  @service toast;
  @service session;
  @service ajax;

  @tracked showBehaviorAgreement = false;

  isDevelopmentEnv = (ENV.environment == 'development' || config('DeploymentEnvironment') == 'Staging');

  @computed('args.milestones.behavioral_agreement')
  get tasks() {
    const milestones = this.args.milestones;
    const tasks = [];
    let prevCompleted = true;

    AUDITOR_TASKS.forEach((task) => {
      const check = task.check(milestones, prevCompleted);

      if (check.result == SKIP) {
        return;
      }

      check.name = task.name;

      if (check.email) {
        check.email = config(check.email);
      }

      if (check.result != COMPLETED && check.result != OPTIONAL) {
        if (check.result == ACTION_NEEDED || check.result == NOT_AVAILABLE) {
          check.isActive = true;
        } else if (check.result != BLOCKED) {
          // Another action needs to be taken first.
          check.result = NOT_AVAILABLE;
        }

        prevCompleted = false;
      }
      tasks.push(check);
    });

    return tasks;

  }

  get isNotUser() {
    return this.session.userId != this.args.person.id;
  }

  @action
  showBehaviorAgreementAction(event) {
    event.preventDefault();
    this.showBehaviorAgreement = true;
  }

  @action
  closeAgreement() {
    if (this.showBehaviorAgreement) {
      this.showBehaviorAgreement = false;
    }
  }

  @action
  signAgreement() {
    const person = this.args.person;

    person.set('behavioral_agreement', true);
    person.save().then(() => {
      this.toast.success('Your agreement has been successfully recorded.');
      this.showBehaviorAgreement = false;
      set(this.args.milestones, 'behavioral_agreement', true);
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
