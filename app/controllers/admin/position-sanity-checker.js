import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminPositionSanityCheckerController extends ClubhouseController {
  @tracked isSubmitting = false;

  get userCanRepair() {
    return this.session.isAdmin;
  }

  @action
  async repairPeople(thing, people, repair_params) {
    const fixPeople = people.filter((p) => p.checked);

    if (!fixPeople.length) {
      this.modal.info('No Callsigns Selected', 'Please select one or more callsigns to repair.');
      return;
    }

    let people_ids;

    if (thing === 'team_positions' || thing === 'team_membership') {
      const isTeam = thing === 'team_membership';
      repair_params = {};
      fixPeople.forEach((p) => {
        (repair_params[+p.id] ||= []).push(isTeam ? p.team_id : p.position_id);
      });
      people_ids = Object.keys(repair_params).map((id) => +id);
    } else if (thing === 'deactivated_teams') {
      repair_params = {teamId: fixPeople[0].team_id};
      people_ids = fixPeople.map((p) => +p.id);
    } else {
      people_ids = fixPeople.map((p) => p.id);
    }

    this.isSubmitting = true;
    try {
      const results = await this.ajax.request('position/repair', {
        method: 'POST',
        data: {repair: thing, people_ids, repair_params}
      })
      let haveErrors = false;

      results.forEach((result) => {
        let person;

        if (result.position_id) {
          person = people.find((p) => +p.id === +result.id && +p.position_id === +result.position_id);
        } else if (result.team_id) {
          person = people.find((p) => +p.id === +result.id && +p.team_id === +result.team_id);
        } else {
          person = people.find((p) => +p.id === +result.id);
        }

        if (person) {
          set(person, 'checked', false);
          set(person, 'errors', result.errors);
          set(person, 'fixed', !result.errors);
          set(person, 'messages', result.messages);
          if (result.errors) {
            haveErrors = true;
          }
        }
      });

      if (haveErrors) {
        this.toast.error('One or more errors occurred while trying to repair.');
      } else {
        this.toast.success('The repair was successful!');
      }
      this.house.scrollToElement(`#${thing}-table`);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
