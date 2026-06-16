import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class MentorPostSeasonSummaryRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);
    this.year = year;
    return (await this.ajax.request('mentor/mentees', {data: {year}})).mentees;
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('mentees', model);
    controller.setupMentees();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('callsignFilter', '');
    }
  }
}
