import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import shirtOptions from 'clubhouse/utils/shirt-options';
import {ADMIN, QUARTERMASTER} from "clubhouse/constants/roles";

export default class PersonSwagRoute extends ClubhouseRoute {
  async model() {
    const person_id = this.modelFor('person').id;
    return {
      swags: await this.ajax.request('swag').then(({swag}) => swag),
      personSwag: await this.store.query('person-swag', {person_id}),
    };
  }

  setupController(controller, model) {
    const shirts = shirtOptions(model.swags, false);

    controller.person = this.modelFor('person');
    controller.tshirtOptions = shirts.tshirtOptions;
    controller.longSleeveOptions = shirts.longSleeveOptions;
    controller.shirtsById = shirts.shirtsById;
    controller.swags = model.swags;
    controller.personSwag = model.personSwag;
    controller.canEdit = this.session.hasRole([ADMIN, QUARTERMASTER]);
  }
}
