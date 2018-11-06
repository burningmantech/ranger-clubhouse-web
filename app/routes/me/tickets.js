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
                .then((results) => results.ticketing_info )
                .catch((response) => this.house.handleErrorResponse(response)),

      accessDocuments: this.store.query('access-document', { person_id })
                      .catch((response) => { this.house.handleErrorResponse(response) }),

      wapSONames: this.ajax.request('access-document/sowap', { data: deliveryParams })
                  .then((result) => result.names)
                  .catch((response) => this.house.handleErrorResponse(response) ),

      ticketDelivery: this.store.query('access-document-delivery', deliveryParams).then((rows) => {
        return rows.firstObject;
      }).catch((response) => {
          // No record found, create the record
          if (response instanceof DS.NotFoundError) {
            return this.store.createRecord('access-document-delivery', {
              person_id: this.session.user.id,
              year,
            });
          } else {
            this.house.handleErrorResponse(response);
          }
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
