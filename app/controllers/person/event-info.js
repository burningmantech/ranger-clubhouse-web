import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {ADMIN, TECH_NINJA, VC} from 'clubhouse/constants/roles';
import {htmlSafe} from '@ember/template';
import {TRAINING} from "clubhouse/constants/positions";

export default class PersonEventInfoController extends ClubhouseController {
  queryParams = ['year'];

  @tracked person;
  @tracked eventInfo;
  @tracked personEvent;
  @tracked haveUserInfo = false;
  @tracked userInfoInSync = false;
  @tracked userInfo;
  @tracked isSubmitting = false;
  @tracked onlineCourses;
  @tracked onlineCourseOptions;
  @tracked courseForm;
  @tracked vehicleInfo;

  get isCurrentYear() {
    return +this.year === this.house.currentYear();
  }

  get canManageOnlineCourse() {
    return this.session.hasRole(TECH_NINJA) || this.session.isRealTrainer;
  }

  get canSignAgreements() {
    return this.session.hasRole([ADMIN, VC]);
  }

  @action
  async saveOnlineCourse(model, isValid) {
    if (!isValid) {
      return;
    }

    if (!model.id) {
      this.modal.info(null, 'No course selected.');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.ajax.request(`person-online-course/${this.person.id}/change`, {
        method: 'POST', data: {
          online_course_id: model.id,
          position_id: TRAINING,
          year: this.year,
        }
      });
      if (+this.person.id === this.session.userId) {
        await this.session.loadUser();
      }
      this.toast.success('Course successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  async save(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await model.save();
      if (+this.person.id === this.session.userId) {
        await this.session.loadUser();
      }
      this.toast.success('Information successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  markOnlineCourseCompleted() {
    this.modal.confirm('Confirm Mark As Completed',
      'Are you absolutely sure you want to mark this person as having completed the online course? Your actions will be logged and subject to review.',
      async () => {
        try {
          this.isSubmitting = true;
          await this.ajax.request(`person-online-course/${this.person.id}/mark-completed`, {
            method: 'POST',
            data: {year: this.year, position_id: TRAINING}
          });
          this.toast.success('Person has been marked as completing the online course.');
          this.eventInfo = (await this.ajax.request(`person/${this.person.id}/event-info`, {data: {year: this.year}})).event_info;
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      }
    );
  }

  @action
  async getUserInfo() {
    this.haveUserInfo = false;
    this.isSubmitting = true;
    try {
      await this._retrieveUserInfo();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  async syncAccountInfo() {
    this.isSubmitting = true;
    try {
      const result = await this.ajax.request(`person-online-course/${this.person.id}/sync-info`, {method: 'POST'});
      if (result.status === 'not-setup') {
        this.modal.info('Missing Account', 'No Online Course account has been setup or account is not linked');
      } else if (result.status === 'success') {
        this.toast.success('Account info successfully synced');
      } else {
        this.toast.error(`Unknown status ${result.status}`);
      }

      await this._retrieveUserInfo();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  async _retrieveUserInfo() {
    const result = await this.ajax.request(`person-online-course/${this.person.id}/info`);
    if (result.status === 'not-setup') {
      this.modal.info('Missing Account', 'No Online Course account has been setup or account is not linked');
    } else if (result.status === 'success') {
      this.haveUserInfo = true;
      this.userInfo = result.user;
      this.userInfoInSync = result.in_sync;
    } else {
      this.toast.error(`Unknown status ${result.status}`);
    }
  }

  @action
  resetPassword() {
    this.modal.confirm('Confirm Password Reset',
      "Please confirm you wish to reset the Online Course account's password. You will be shown the new password, AND an email sent to the user with the new password.",
      async () => {
        try {
          this.isSubmitting = true;
          const {
            status,
            password
          } = await this.ajax.request(`person-online-course/${this.person.id}/reset-password`, {method: 'POST'});
          if (status === 'success') {
            this.modal.info('Password Successfully Reset', `The new password is ${password}`);
          } else if (status === 'no-account') {
            this.toast.error('Password reset failed - account is not setup or linked.');
          } else {
            this.toast.error(`Unknown status ${status}`);
          }
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      }
    );
  }

  @action
  showInfoAttribute(attr) {
    const expected = this.userInfo[attr + '_expected'];
    const value = this.userInfo[attr];

    if (expected === undefined) {
      return value;
    }

    return htmlSafe(`${value}<br><b class="text-danger">Not in sync</b><br>Expected [${expected}]`);
  }
}
