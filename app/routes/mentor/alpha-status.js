import Route from '@ember/routing/route';

export default class MentorAlphaStatusRoute extends Route {
  model() {
    return this.ajax.request('mentor/mentees', { data: { exclude_bonks: 1 }});
  }

  setupController(controller, model) {
    const mentees = model.mentees;

    mentees.forEach((person) => {
      if (person.callsign_approved && person.photo_approved && person.trained) {
        person.position_eligible = true;

        if (person.status == 'prospective') {
          person.status_eligible = true;
        }
      }
    });
    controller.set('mentees', model.mentees);
    controller.set('year', this.house.currentYear());

    controller.set('filter', 'all');
  }
}
