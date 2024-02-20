import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {setting} from "clubhouse/utils/setting";
import {action} from '@ember/object';
import dayjs from 'dayjs';
import {tracked} from '@glimmer/tracking';

export default class MentorSetupMentorDataController extends ClubhouseController {
  @tracked isSubmitting;
  @tracked didSetup;

  ghdTime = setting('GroundhogDayTime');

  get isGroundhogDayServer() {
    return this.session.isGroundhogDayServer;
  }

  get trainingYear() {
    return dayjs(this.ghdTime).format('YYYY');
  }

  get groundhogDay() {
    return this.ghdTime;
  }

  @action
  setup() {
    this.modal.confirm('Confirm Setting Up Training Data', 'Are you sure you want to do this?', async () => {
      try {
        this.isSubmitting = true;
        await this.ajax.post('mentor/setup-training-data');
        this.didSetup = true;
        this.toast.success('Setup was successfully');
      } catch (response) {
        this.house.handleErrorResponse(response);
      } finally {
        this.isSubmitting = false;
      }
    });
  }

}
