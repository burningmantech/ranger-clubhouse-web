import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MentorAlphaStatusRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('mentor/mentees', { data: { exclude_bonks: 1 }});
  }

  setupController(controller, model) {
    // Eligibility is computed authoritatively by the API (alpha_status_eligible /
    // alpha_position_eligible); the controller and row template read those fields
    // directly, so no client-side re-derivation is needed here.
    controller.set('mentees', model.mentees);
    controller.set('year', this.session.currentYear());

    controller.set('filter', 'all');
  }
}
