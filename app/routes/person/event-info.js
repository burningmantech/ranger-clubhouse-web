import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';
import {TRAINING} from "clubhouse/constants/positions";
import {TECH_NINJA} from "clubhouse/constants/roles";

export default class PersonEventInfoRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    const personId = this.modelFor('person').id;

    this.year = year;

    const hash = {
      eventInfo: this.ajax.request(`person/${personId}/event-info`, {data: {year}})
        .then((result) => result.event_info),
      personEvent: this.store.findRecord('person-event', `${personId}-${year}`, {reload: true}),
    }

    if (this.session.hasRole(TECH_NINJA) || this.session.isRealTrainer) {
      hash.courseInfo = this.ajax.request(`person-online-course/${personId}/course-info`, {
        data: {
          year,
          position_id: TRAINING
        }
      }).then(({online_course}) => online_course);
      hash.courses = this.ajax.request('online-course', {
        data: {
          year,
          position_id: TRAINING
        }
      }).then(({online_course}) => online_course);
    }

    return RSVP.hash(hash);
  }

  setupController(controller, model) {
    const {eventInfo, courses} = model;
    const options = courses?.map((c) => [`${c.name} (course id ${c.course_id})`, c.id]) ?? [];
    options.unshift(['-', 0]);
    controller.set('year', this.year);
    controller.set('person', this.modelFor('person'));
    controller.set('eventInfo', eventInfo);
    controller.set('personEvent', model.personEvent);
    controller.set('onlineCourses', courses);
    controller.set('onlineCourseOptions', options);
    controller.set('haveUserInfo', false);
    controller.set('courseForm', {id: model.courseInfo?.id});
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
