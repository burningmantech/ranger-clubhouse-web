import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class PersonRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.MANAGE, this);
  }

  model(params) {
    const year = requestYear(params);
    const personId = params.person_id;

    return RSVP.hash({
      person: this.store.find('person', personId).then((person) => {
        return person.loadRangerInfo().then(() => { return person });
      }),
      yearInfo: this.ajax.request(`person/${personId}/yearinfo`, { data: { year } })
             .then((result) => result.year_info),

    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', model.person);
    controller.set('yearInfo', model.yearInfo);
  }
}
