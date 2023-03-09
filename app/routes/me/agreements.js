import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { tracked } from '@glimmer/tracking';

class Agreement {
  @tracked title;
  @tracked available;
  @tracked signed;
  @tracked tag;

  constructor(agreement){
    this.title = agreement.title;
    this.available = agreement.available;
    this.signed = agreement.signed;
    this.tag = agreement.tag;
  }
}

export default class MeAgreementsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`agreements/${this.session.userId}`);
  }

  setupController(controller, model) {
    controller.set('agreements', model.agreements.map((a) => new Agreement(a)));
  }
}
