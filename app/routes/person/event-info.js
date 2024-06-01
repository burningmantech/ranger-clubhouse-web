import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {TRAINING} from "clubhouse/constants/positions";
import {TECH_NINJA} from "clubhouse/constants/roles";

export default class PersonEventInfoRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);
    const personId = this.modelFor('person').id;

    this.year = year;

    const hash = {
      eventInfo: await this.ajax.request(`person/${personId}/event-info`, {data: {year}})
        .then(({event_info}) => event_info),
      personEvent: await this.store.findRecord('person-event', `${personId}-${year}`, {reload: true}),
      vehicleInfo: await this.ajax.request(`vehicle/info/${personId}`, {data: {include_eligible_teams: 1}}).then(({info}) => info)
    }

    if (this.session.hasRole(TECH_NINJA) || this.session.isRealTrainer) {
      hash.courseInfo = await this.ajax.request(`person-online-course/${personId}/course-info`, {
        data: {
          year,
          position_id: TRAINING
        }
      }).then(({online_course}) => online_course);
      hash.courses = await this.ajax.request('online-course', {
        data: {
          year,
          position_id: TRAINING
        }
      }).then(({online_course}) => online_course);
    }

    return hash;
  }

  setupController(controller, model) {
    const {eventInfo, courses} = model;
    const options = courses?.map((c) => [`${c.name} (course id ${c.course_id})`, c.id]) ?? [];
    if (options.length) {
      options.unshift(['-', 0]);
    }
    controller.year = this.year;
    controller.person = this.modelFor('person');
    controller.eventInfo = eventInfo;
    controller.personEvent = model.personEvent;
    controller.onlineCourses = courses;
    controller.onlineCourseOptions = options;
    controller.haveUserInfo = false;
    controller.courseForm = {id: model.courseInfo?.id};
    controller.vehicleInfo = model.vehicleInfo;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
