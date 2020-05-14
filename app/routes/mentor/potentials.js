import Route from '@ember/routing/route';

export default class MentorPotentialsRoute extends Route {
  model() {
    return this.ajax.request('mentor/mentees', { data: { have_training: 1 }});
  }

  setupController(controller, model) {
    controller.set('mentees', model.mentees);
    controller.set('year', this.house.currentYear());
    controller.set('filter', 'all');
  }
}
