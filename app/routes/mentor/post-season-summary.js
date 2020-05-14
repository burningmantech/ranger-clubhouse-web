import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class MentorPostSeasonSummaryRoute extends Route {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return RSVP.hash({
      mentees: this.ajax.request('mentor/mentees', {data: {year}}).then((result) => result.mentees),
      year
    });
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('mentees', model.mentees);
    controller.setupMentees();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('filter', 'all');
    }
  }
}
