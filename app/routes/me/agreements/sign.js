import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeAgreementsSignRoute extends ClubhouseRoute {
  model({ tag }) {
    return this.ajax.request(`agreements/${this.session.userId}/${tag}`);
  }

  setupController(controller, model) {
    controller.set('agreement', model);
    controller.set('didSign', model.signature);
  }
}
