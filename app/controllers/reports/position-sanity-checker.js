import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { Role } from 'clubhouse/constants/roles';

export default class ReportsPositionSanityCheckerController extends Controller {
  get userCanRepair() {
    return this.session.user.hasRole([ Role.ADMIN, Role.GRANT_POSITION ]);
  }

  @action
  repairPeople(thing, people) {
    const fixPeople = people.filter((p) => p.checked );

    if (fixPeople.length == 0) {
      this.modal.info('No Callsigns Selected', 'Please select one or more callsigns to repair.');
      return;
    }

    const people_ids = fixPeople.map((p) => p.id);

    this.set('isSubmitting', true);
    this.ajax.request('position/repair', { method: 'POST', data: { repair: thing, people_ids }}).then((results) => {
      let haveErrors = false;

      results.forEach((result) => {
        const person = people.find((p) => p.id == result.id);

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
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }
}
