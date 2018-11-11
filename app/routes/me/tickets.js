import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import DS from 'ember-data';

export default class MeTicketsRoute extends Route.extend(MeRouteMixin) {
  beforeModel() {
    const user = this.session.user;
    if (user.isAuditor || user.isPastProspective || user.isProspectiveWaitlist) {
      this.toast.danger('Auditors, past prospectives, and prospective waitlisted do not have access to this page.');
      this.transitionTo('me.overview');
    }
  }

  model(params) {
    const year = (params.year || (new Date).getFullYear());
    const person_id = this.session.user.id;
    const deliveryParams = { person_id, year };

    return RSVP.hash({
      ticketingInfo: this.ajax.request('access-document/ticketing-info')
                .then((results) => results.ticketing_info ),
      accessDocuments: this.store.query('access-document', { person_id }),
      wapSONames: this.ajax.request('access-document/sowap', { data: deliveryParams })
                  .then((result) => result.names),
      ticketDelivery: this.store.queryRecord('access-document-delivery', deliveryParams).then((row) => {
          if (row) {
            return row;
          }
          // No delivery record yet, create one.
          return this.store.createRecord('access-document-delivery', {
            person_id: this.session.user.id,
            year,
          });
      })
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('accessDocuments', model.accessDocuments);
    controller.set('wapSONames', model.wapSONames);
    controller.set('ticketDelivery', model.ticketDelivery);
    controller.set('ticketingInfo', model.ticketingInfo);
  }
}
