import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class ReportsAlphaShirtsRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.VC ]);
  }

  model() {
    return this.ajax.request(`person/alpha-shirts`).then((result) => result.alphas);
  }

  setupController(controller, model) {
    controller.set('year', this.house.currentYear());
    controller.set('alphas', model);

    const shortSleeve = _.sortBy(_.map(_.groupBy(model, 'teeshirt_size_style'), (group, type) => {
      return { type, count: group.length }
    }), 'type');

    const longSleeve = _.sortBy(_.map(_.groupBy(model, 'longsleeveshirt_size_style'), (group, type) => {
      return { type, count: group.length }
    }), 'type');

    controller.set('shirtGroups', [
      {
        name: 'Tee Shirts',
        exportName: 'tee-shirts',
        types: shortSleeve
      },
      {
        name: 'Long Sleeves',
        exportName: 'long-sleeves',
        types: longSleeve
      }
    ]);

  }
}
