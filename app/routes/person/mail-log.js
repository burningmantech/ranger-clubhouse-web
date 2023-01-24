import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp'
import {ADMIN, VC} from 'clubhouse/constants/roles';

export default class PersonMailLogRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];

  queryParams = {
    year: {refreshModel: true},
    page: {refreshModel: true},
  };

  model(params) {
    const person_id = this.modelFor('person').id;
    const page = params.page ?? 1;

    return RSVP.hash({
      logs: this.ajax.request(`mail-log`, {data: {person_id, page}}),
      stats: this.ajax.request('mail-log/stats', {data: {person_id}}),
      emailHistory: this.ajax.request('email-history', {
        data: {
          person_id,
          include_source_person: 1
        }
      }).then(({email_history}) => email_history),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.set('stats', model.stats);
    controller.set('logs', model.logs.mail_log);
    controller.set('meta', model.logs.meta);
    controller.set('emailHistory', model.emailHistory);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('mailLog', null);
      controller.set('year', null);
      controller.set('page', null);
    }
  }
}
