import Route from '@ember/routing/route';

export default class TrainingSessionRoute extends Route {
  model(params) {
    return this.ajax.request(`training-session/${params.slot_id}`);
  }
}
