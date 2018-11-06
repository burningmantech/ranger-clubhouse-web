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
    const queryParams = {
      person_id: this.session.user.id,
      year,
    };

    return RSVP.hash({
      timesheets: this.store.query('timesheet', queryParams).catch((response) => {
        if (response instanceof DS.NotFoundError) {
          return [];
        }
        alert("Failed to retrieve timesheets: "+response);
      }),
      year: year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('timesheets', model.timesheets);
    controller.set('year', model.year);
  }
}
