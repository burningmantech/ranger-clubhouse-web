import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from "lodash";

class Agreement {
  @tracked title;
  @tracked available;
  @tracked signed;
  @tracked tag;

  constructor(agreement) {
    this.title = agreement.title;
    this.available = agreement.available;
    this.signed = agreement.signed;
    this.tag = agreement.tag;
  }
}

export default class MeAgreementsRoute extends ClubhouseRoute {
  async model() {
    const id = this.session.userId;
    return {
      agreements: (await this.ajax.request(`agreements/${id}`)).agreements,
      membership: (await this.ajax.request(`person/${id}/membership`)).membership
    };
  }

  setupController(controller, model) {
    controller.agreements = model.agreements.map((a) => new Agreement(a));
    controller.teams = model.membership.teams.filter((t) => !isEmpty(t.document_tag));
  }
}
