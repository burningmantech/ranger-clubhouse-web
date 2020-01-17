import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import { isEmpty } from '@ember/utils';

export default class RegisterRoute extends Route.extend(UnauthenticatedRouteMixin) {
  queryParams = {
    step: { refreshModel: true }
  };

  model({ step }){
    if (isEmpty(step)) {
      step = 'ask-intent';
    }

    return { step };
  }

  setupController(controller, model) {
      super.setupController(...arguments);

      controller.set('step', model.step);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('step', 'ask-intent');
    }
  }
}
