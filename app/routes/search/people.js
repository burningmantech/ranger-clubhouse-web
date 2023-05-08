import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import EmberObject from '@ember/object';

export default class SearchPeopleRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.people = [];
    controller.hasResults = false;
    controller.isSubmitting = false;
    controller.searchForm = EmberObject.create({
      statuses: [],
      year_created: 0,
      status_year: 0,
      years_worked: '',
      years_worked_op: 'eq',
      include_years_worked: false,
      photo_status: '',
      include_photo_status: false,
      online_course: '',
      include_online_course: false,
      online_course_status: '',
      include_training_status: false,
      training_status: '',
    });
  }
}
