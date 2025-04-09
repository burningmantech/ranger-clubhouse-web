import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, AWARD_MANAGEMENT} from "clubhouse/constants/roles";

export default class PersonAwardsRoute extends ClubhouseRoute {
  async model() {
    if (this.session.hasRole([ADMIN, AWARD_MANAGEMENT])) {
      return {
        awards: await this.ajax.request('award').then(({award}) => award),
        personAwards: await this.store.query('person-award', {person_id: this.modelFor('person').id}),
        positions: await this.ajax.request('position', {data: {awards_eligible: 1}}).then(({position}) => position),
        teams: await this.ajax.request('team', {data: {awards_eligible: 1}}).then(({team}) => team),
      };
    } else {
      return null;
    }
  }

  setupController(controller, model) {
    controller.person = this.modelFor('person');

    if (model) {
      controller.awards = model.awards;
      controller.canEdit = true;
      controller.personAwards = model.personAwards;
      controller.positions = model.positions;
      controller.teams = model.teams;
    } else {
      controller.canEdit = false;
    }
  }
}
