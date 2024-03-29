import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MANAGE, VIEW_PII} from 'clubhouse/constants/roles';
import shirtOptions from 'clubhouse/utils/shirt-options';

export default class PersonPersonalInfoRoute extends ClubhouseRoute {
  // User has to be an Admin or have Login Manage AND View Personal Info
  roleRequired = [ADMIN, [MANAGE, VIEW_PII]];

  async model() {
    return {
      shirts: await this.ajax.request('swag/shirts').then(({shirts}) => shirts),
      languages: await this.store.query('person-language', { person_id: this.modelFor('person').id })
    };
  }

  setupController(controller, model) {
    controller.person = this.modelFor('person');
    controller.setProperties(shirtOptions(model.shirts));
    controller.set('languages', model.languages)
  }
}
