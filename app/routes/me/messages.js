import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeMessagesRoute extends Route.extend(MeRouteMixin) {
  afterModel(model) {
    const person = this.modelFor('me');
    return this.store.query('person-message', {person_id: person.id}).then((messages) => {
      model.messages = messages;
    })
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('messages', model.messages);
  }
}
