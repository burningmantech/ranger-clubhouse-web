import Route from '@ember/routing/route';
import { run } from '@ember/runloop';

export default class TrainingSessionSignupSheetRoute extends Route {
  setupController(controller) {
    controller.set('training', this.modelFor('training'));
    controller.setProperties(this.modelFor('training/session'));
  }

  actions = {
    didTransition() {
      run.schedule('afterRender', () => {
        window.print();
      })
    }
  }
}
