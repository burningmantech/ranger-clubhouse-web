import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeRangerInfoRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.session.user.id;
    const year = (params.year || (new Date).getFullYear());

    return RSVP.hash({
      yearInfo: this.ajax.request('person/'+person_id+'/yearinfo', { data: { year } })
                .then((result) => { return result.year_info; }),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('yearInfo', model.yearInfo);
    controller.set('year', model.year);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
