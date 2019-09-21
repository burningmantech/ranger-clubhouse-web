import Route from '@ember/routing/route';

export default class ReportsPeopleByRoleRoute extends Route {
    model() {
      return this.ajax.request('person/by-role');
    }

    setupController(controller,model) {
      controller.set('roles', model.roles);
    }
}
