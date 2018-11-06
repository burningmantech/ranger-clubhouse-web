import Route from '@ember/routing/route';

export default class TrainingRoute extends Route {
  beforeModel() {
    if (!this.session.user.teacher.is_trainer) {
      this.toast.danger("Sorry, you do not have the privileges to access this");
      this.transitionTo('me.overview');
    }
  }

  model(params) {
    const positionId = (params.position_id == 'dirt' ? 13 : params.position_id)
    return this.ajax.request(`training/${positionId}`)
          .then((results) => results)
          .catch((response) => this.house.handleErrorResponse(response));
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('training', model);
  }
}
