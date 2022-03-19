import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminOnlineTrainingCoursesController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked courses = [];

  @action
  setCourseAction(course_id, type) {
    this.isSubmitting = true;
    this.ajax.request('online-training/set-course-type', {
      method: 'POST', data: {
        course_id,
        type
      }
    }).then(() => this._refreshList())
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  _refreshList() {
    return this.ajax.request('online-training/courses')
      .then(({courses}) => this.courses = courses)
      .catch((response) => this.house.handleErrorResponse(response))
  }
}
