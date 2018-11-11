import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import DS from 'ember-data';
import RSVP from 'rsvp';

export default class MeTimesheetRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = (params.year || (new Date).getFullYear());
    const person_id = this.session.user.id;
    const queryParams = {
      person_id,
      year,
    };

    return RSVP.hash({
      timesheets: this.store.query('timesheet', queryParams).catch((response) => {
        if (response instanceof DS.NotFoundError) {
          return [];
        }
        throw response;
      }),
      timesheetInfo: this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }).then((result) => result.info),
      year: year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.set('canCorrectThisYear', (model.timesheetInfo.correction_year == model.year));
  }
}
