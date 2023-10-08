import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {TRAINING} from "clubhouse/constants/positions";
import {COURSE_FOR_ALL, CourseForOptions} from "clubhouse/models/online-course";

export default class AdminOnlineCourseController extends ClubhouseController {
  queryParams = ['year'];

  @tracked positions;
  @tracked onlineCourses;
  @tracked entry;
  @tracked positionOptions;
  @tracked isSubmitting;
  @tracked haveEnrollment = false;
  @tracked haveCourseList = false;
  @tracked enrollment;
  @tracked enrollmentCourse;

  courseForOptions = CourseForOptions;

  @action
  newEntry() {
    this.entry = this.store.createRecord('online-course', {
      position_id: TRAINING,
      year: this.year,
    });
  }

  @action
  editEntry(entry) {
    this.entry = entry;
  }

  @action
  cancelEntry() {
    this.entry = null;
  }

  @action
  async saveEntry(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await model.save();
      this.entry = null;
      await this.onlineCourses.update();
      this.toast.success('Entry was successfully saved.');
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  deleteEntry() {
    this.modal.confirm('Delete Entry', 'Are you sure you want to delete the entry?', async () => {
      this.isSubmitting = true;
      try {
        await this.entry.destroyRecord();
        this.entry = null;
        await this.onlineCourses.update();
        this.toast.success('Entry has been deleted.');
      } catch (response) {
        this.house.handleErrorResponse(response);
      } finally {
        this.isSubmitting = false;
      }
    })
  }

  @action
  async setName(entry) {
    this.isSubmitting = true;
    try {
      const result = await this.ajax.request(`online-course/${entry.id}/set-name`, { method: 'POST'});
      this.house.pushPayload('online-course', result.online_course);
      this.toast.success('Name successfully set from the LMS.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  _clearResults() {
    this.haveEnrollment = false;
    this.haveCourseList = false;
  }

  @action
  async retrieveEnrollment(course) {
    this.isSubmitting = true;
    this._clearResults();
    try {
      const result = await this.ajax.request(`online-course/${course.id}/enrollment`);
      this.enrollment = result.people;
      this.enrollmentCourse = course;
      this.haveEnrollment = true;
      this.toast.success('Enrollment ');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  async retrieveCourses() {
    this.isSubmitting = true;
    this._clearResults();
    try {
      const result = await this.ajax.request(`online-course/courses`);
      this.courseList = result.courses;
      this.haveCourseList = true;
      this.toast.success('Course listing successfully retrieved.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  createFromMoodleCourse(course) {
    this.entry = this.store.createRecord('online-course', {
      course_id: course.id,
      name: course.fullname,
      position_id: TRAINING,
      course_for: COURSE_FOR_ALL,
      year: this.house.currentYear(),
    });
  }
}
