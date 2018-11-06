import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';


export default class PersonAssetsRoute extends Route {
  model(params) {
    const model = this.modelFor('person');
    const year = requestYear(params);

    return RSVP.hash({
      person: model.person,
      assets: this.ajax.request(`assets/`),
      year,
    });
  }
}
