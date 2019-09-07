import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class MentorMenteesRoute extends Route {
  queryParams = {
    year: {
      refreshModel: true
    }
  };

  model(params) {
    const year = requestYear(params);
    return RSVP.hash({
      mentees: this.ajax.request('mentor/mentees', { data: { year } })
                  .then((result) => result.mentees),
      year
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('filter', 'all');
    }
  }
}
