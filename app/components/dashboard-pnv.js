import Component from '@glimmer/component';
import { tracked } from "@glimmer/tracking";
import { action, computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { config } from 'clubhouse/utils/config';
import { htmlSafe } from '@ember/string';
import { debounce } from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import moment from 'moment';

const COMPLETED = 'completed';
const ACTION_NEEDED = 'action-needed';
const NOT_AVAILABLE = 'not-available';
const URGENT = 'urgent';
const WAITING = 'waiting';
const SKIP = 'skip';
const BLOCKED = 'blocked';
const OPTIONAL = 'optional';

const SETUP_ACCOUNT_TASKS = [{
    name: 'Review and Update Personal Information',
    check(milestones) {
      if (milestones.has_reviewed_pi) {
        return { result: COMPLETED };
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
        return { result: COMPLETED };
      }

      return {
        result: OPTIONAL,
        //message: 'All volunteers must read and agree to the Standards Agreement.',
        message: 'All volunteers are asked to sign the optional Behavioral Standards Agreement.',
        isBehavioralAgreement: true
      };
    }
  },

  {
    name: 'Upload a BMID Photo',
    check(milestones) {
      if (milestones.photo_status != 'missing') {
        return { result: COMPLETED, isPhotoTask: true };
      }

      if (!milestones.photo_upload_enabled) {
        return { result: WAITING, message: 'Photo uploading is not available at this time. Check back later.' }
      }
      return { result: ACTION_NEEDED, isPhotoUpload: true, isPhotoTask: true };
    }
  },

  {
    name: 'Photo Approval',
    check(milestones, prevCompleted, photo) {
      let reasons;
      switch (milestones.photo_status) {
      case 'approved':
        return { result: COMPLETED };
      case 'submitted':
        return { result: WAITING, message: 'The photo is being reviewed. Usually photos are approved within 2 to 3 days.' }
      case 'rejected':
        reasons = photo.rejections.map((reason) => `<li>${reason}</li>`).join();
        return {
          result: URGENT,
          message: htmlSafe(`Your photo was rejected for the following reasons: <ul>${reasons}</ul> Please upload a new photo which comforms to the BMID requirements.`),
          isPhotoUpload: true
        };
      default:
        return { result: NOT_AVAILABLE, message: 'Upload a photo first.' };
      }
    }
  },
  {
    name: 'Link your Burner Profile',
    check(milestones) {
      if (milestones.missing_bpguid) {
        return {
          result: URGENT,
          message: 'Contact the Ranger Volunteer Coordinators to get your Burner Profile and Clubhouse account linked.',
          email: 'VCEmail',
        };

      }
      return { result: SKIP }; // Only show the step IF a BPGUID is needed.
    }
  }
];

const TRAINING_TASKS = [{
    name: 'Read the Ranger Manual & Complete Part 1 of Training (online)',
    check(milestones, prevCompleted) {
      if (milestones.manual_review_passed) {
        return { result: COMPLETED };
      }

      if (!prevCompleted) {
        return { result: NOT_AVAILABLE, message: 'You need to complete the item(s) listed above.' }
      }

      if (!milestones.manual_review_enabled) {
        return { result: WAITING, message: 'Part 1 of Training (online) is not quite ready yet. Check back later.' }
      }

      return { result: ACTION_NEEDED, message: 'The online portion of training will take 1 to 2 hours to complete.', linkUrl: milestones.manual_review_link };
    }
  },

  {
    name: 'Sign up for Part 2 of Ranger Training (face-to-face)',
    check(milestones) {
      if (milestones.training.status != 'missing') {
        return { result: COMPLETED };
      }

      if (!milestones.manual_review_passed) {
        return { result: NOT_AVAILABLE, message: 'You need to complete Part 1 of Training (online) first before being allowed to sign up for Part 2 of Training (face-to-face).' };
      }

      if (milestones.trainings_available) {
        return {
          result: ACTION_NEEDED,
          isSignup: true,
          route: 'me.schedule',
        };
      } else {
        return { result: WAITING, message: 'Training sign ups are not yet available. Please check back later.' };
      }
    }
  },

  {
    name: 'Attend Part 2 of Training (face-to-face)',
    check(milestones) {
      switch (milestones.training.status) {
      case 'passed':
        return { result: COMPLETED };

      case 'missing':
        return { result: NOT_AVAILABLE, message: 'You need to sign up for a training session.' };

      case 'failed':
        return {
          result: URGENT,
          message: `You did not attend or failed to complete training on ${moment(milestones.training.begins).format('dddd, MMMM Do YYYY')} located at ${milestones.training.description}. Email the Training Academy to sign up for another session.`,
          email: 'TrainingAcademyEmail',
        };

      case 'pending':
        return {
          result: ACTION_NEEDED,
          message: `The training session starts ${moment(milestones.training.begins).format('ddd MMM DD [@] HH:mm')} located in ${milestones.training.description}. If you cannot make the session, please remove your sign up from the schedule.`,
        }
      }
    }
  },
];

const ALPHA_TASKS = [{
    name: 'Sign up for an Alpha shift',
    check(milestones) {
      if (milestones.bonked) {
        return { result: SKIP };
      }

      if (milestones.alpha_shift) {
        return { result: COMPLETED }
      }

      if (milestones.training.status != 'passed') {
        return { result: NOT_AVAILABLE, message: 'You need to attend and pass training before being allowed to sign up for an Alpha shift.' };
      }

      if (milestones.alpha_shifts_available) {
        return { result: ACTION_NEEDED, isSignup: true, route: 'me.schedule' };
      }

      return { result: WAITING, message: 'Not Available Yet. Alpha shifts will be available on July 15th OR the Wednesday AFTER you complete training, which ever is later.' };
    }
  },

  {
    name: 'Walk your Alpha shift',
    check(milestones) {
      if (milestones.bonked) {
        return {
          result: BLOCKED,
          message: 'You did not pass your Alpha shift. You are unable to sign up for Ranger shifts this season.',
        };
      }

      if (milestones.alpha_shift) {
        if (milestones.alpha_shift.status == 'pending') {
          return {
            result: ACTION_NEEDED,
            message: htmlSafe(`Please read "<a href="${milestones.alpha_shift_prep_link}" target="_blank" rel="noopener">Becoming a Ranger: On-playa Alpha Shifts</a>" in the Ranger Manual.<br>Your Alpha shift starts ${moment(milestones.alpha_shift.begins).format('ddd MMM DD [@] HH:mm')}.<br><b>ARRIVE 15 MINUTES EARLY. Late arrivals will NOT be allowed to walk.</b><br>If you know you won't be able to make your Alpha shift please email the Mentor Cadre or stop by Ranger HQ on playa.`),
            email: 'MentorEmail'
          };
        } else {
          return {
            result: URGENT,
            message: "It looks like you've missed your Alpha shift. You are welcome to apply again next year. If you believe this is in error, please email the Mentor Cadre.",
            email: 'MentorEmail'
          };
        }
      }

      if (!milestones.alpha_shifts_available) {
        return { result: NOT_AVAILABLE, message: 'Alpha shifts are not available yet.' };
      }

      return { result: NOT_AVAILABLE, message: 'Please sign up for an Alpha shift.' }
    }
  }
]

const TASK_GROUPS = [
  { title: 'Setup Your Clubhouse Account', tasks: SETUP_ACCOUNT_TASKS },
  { title: 'Train to be a Ranger ', tasks: TRAINING_TASKS },
  { title: 'Walk your Alpha shift', tasks: ALPHA_TASKS }
];

const MOBILE_MAX_WIDTH = 719;
const RESIZE_DEBOUNCE_DELY = 250;

export default class DashboardPNVComponent extends Component {
  @service house;
  @service toast;
  @service session;
  @service ajax;

  @tracked showBehaviorAgreement = false;
  @tracked showDebugging = false;

  @tracked isMobileScreen = false;

  isDevelopmentEnv = (ENV.environment == 'development' || config('DeploymentEnvironment') == 'Staging');

  constructor() {
    super(...arguments);

    /*
     * Notify when the sceen resizes so the layout can adjust accordingly.
     *
     * On mobile screens (width <= MOBILE_MAX_WIDTH), the photo is placed below
     * the upload photo task.
     *
     * On desktop screens (width > MOBILE_MAX_WIDTH), the photo is floated right
     * in the first task group.
     */

    window.addEventListener('resize', this._bounceResizeEvent, false);

    this.isMobileScreen = (document.documentElement.clientWidth <= MOBILE_MAX_WIDTH);
  }

  willDestroy() {
    window.removeEventListener('resize', this._bounceResizeEvent, false);
  }

  @action
  _bounceResizeEvent() {
    debounce(this, this._resizeWindow, RESIZE_DEBOUNCE_DELY);
  }

  _resizeWindow() {
    this.isMobileScreen = (document.documentElement.clientWidth <= MOBILE_MAX_WIDTH);
  }

  get isNotUser() {
    return this.session.userId != this.args.person.id;
  }

  @computed('args.milestones.behavioral_agreement')
  get taskGroups() {
    const milestones = this.args.milestones;
    const photo = this.args.photo;
    let haveActiveGroup = false;
    let prevCompleted = true;

    return TASK_GROUPS.map((group) => {
      let haveAction = false,
        tasksCompleted = true;

      const actions = { title: group.title };

      const tasks = [];

      group.tasks.forEach((task) => {
        const check = task.check(milestones, prevCompleted, photo);
        if (check.result == SKIP) {
          return;
        }

        const result = {
          name: task.name,
          result: check.result,
          message: check.message,
          route: check.route,
          isBehavioralAgreement: check.isBehavioralAgreement,
          isPhotoUpload: check.isPhotoUpload,
          isPhotoTask: check.isPhotoTask,
          isVisitPersonInfo: check.isVisitPersonInfo,
          isSignup: check.isSignup,
          linkUrl: check.linkUrl
        };

        if (check.email) {
          result.email = config(check.email);
        }

        if (check.result != COMPLETED && check.result != OPTIONAL) {
          tasksCompleted = false;
          if (!haveAction || check.result == ACTION_NEEDED) {
            result.isActive = true;
            haveAction = true;
          }
        }

        tasks.push(result);
      });

      actions.tasks = tasks;

      if (!tasksCompleted && prevCompleted) {
        prevCompleted = false;
      }

      if (!haveActiveGroup && haveAction) {
        actions.isActive = true;
        haveActiveGroup = true;
      } else if (haveActiveGroup) {
        tasks.forEach((t) => {
          // If a previous group is has actions, mark any group as not available.
          if (t.result == ACTION_NEEDED || t.result == URGENT) {
            t.result = NOT_AVAILABLE;
          }
        })
      }

      if (actions.isActive) {
        actions.haveUrgentActions = tasks.some((t) => (t.result == URGENT));
        actions.haveActions = tasks.some((t) => (t.result != COMPLETED && t.result != WAITING && t.result != OPTIONAL));
        actions.haveWaiting = tasks.some((t) => t.result == WAITING);
      }

      return actions;
    });
  }

  @computed('taskGroups')
  get haveUrgentActions() {
    return this.taskGroups.some((g) => g.haveUrgentActions);
  }

  @computed('taskGroups')
  get haveActions() {
    return this.taskGroups.some((g) => g.haveActions);
  }

  @computed('taskGroups')
  get haveWaiting() {
    return this.taskGroups.some((g) => g.haveWaiting);
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
      this.toast.success('Your agreement has been succesfully recorded.');
      this.showBehaviorAgreement = false;
      set(this.args.milestones, 'behavioral_agreement', true);
    }).catch((response) => this.house.handleErrorResponse(response));
  }


  /*
   * For debugging purposes ONLY
   */

  @action
  photoStatus(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, { method: 'POST', data: { photo_status: status } }).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  manualReview(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, { method: 'POST', data: { manual_review: status } }).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  clearBehavioralAgreement() {
    const person = this.args.person;

    person.set('behavioral_agreement', false);
    person.save().then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));

  }

  @action
  clearPIReview() {
    const person = this.args.person;

    person.set('has_reviewed_pi', false);
    person.save().then(() => {
      set(this.args.milestones, 'has_reviewed_pi', false);
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));

  }

  @action
  training(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, { method: 'POST', data: { training: status } }).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  alphaShift(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, { method: 'POST', data: { alpha: status } }).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  goBoom(act) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, { method: 'POST', data: { action: act } }).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  toggleDebugging() {
    this.showDebugging = !this.showDebugging;
  }

  _reloadPage() {
    location.reload(false);
  }
}
