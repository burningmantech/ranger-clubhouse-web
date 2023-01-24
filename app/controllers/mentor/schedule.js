import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject, {action} from '@ember/object';
import {debounce} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

const SEARCH_RATE_MS = 300;

export default class MentorScheduleController extends ClubhouseController {
  @service shiftManage;

  @tracked slot;
  @tracked slots;

  @tracked foundPeople;
  @tracked noSearchMatch;
  @tracked addPersonForm;
  @tracked removePersonForm;
  @tracked isSearching;
  @tracked isSubmitting;

  @tracked signedInSlot;
  @tracked apparelSlot;
  @tracked signupSheetSlot;

  queryParams = ['year'];

  get hideShiftSchedule() {
    return !!(this.signedInSlot || this.apparelSlot || this.signupSheetSlot);
  }

  // Show the dialog to add a person
  @action
  showAddPersonAction(slot) {
    this.slot = slot;
    this.foundPeople = null;
    this.noSearchMatch = null;
    this.addPersonForm = EmberObject.create({name: ''});
  }

  @action
  searchPeopleAction(field, model) {
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  async _performSearch(model) {
    const query = model.name.trim();

    if (query.length < 2) {
      return;
    }

    this.isSearching = true;
    try {
      const people = await this.ajax.request('person/search', {
        data: {
          query,
          search_fields: 'name,callsign,email',
          exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked,past prospective',
          limit: 10
        }
      });
      this.foundPeople = people;
      if (!people.length) {
        this.noSearchMatch = query;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSearching = false;
    }
  }


  @action
  cancelSearchAction() {
    this.addPersonForm = null;
  }

  @action
  addPersonAction(person, slot) {
    this.shiftManage.slotSignup(slot, person, () => {
      this.addPersonForm = null;
      this.isSubmitting = true;
      this.ajax.request('mentor/alpha-schedule', {data: {year: this.year}}).then((result) => {
        this.slots = result.slots;
      }).catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.isSubmitting = false)
    });
  }

  // Remove a student from the session
  @action
  removePersonAction(slot, person) {
    const personId = +person.id;

    this.modal.confirm(
      'Remove Sign Up',
      `Are you sure you want to remove ${person.callsign} from the mentee shift?`,
      () => {
        this.isSubmitting = true;
        this.ajax.delete(`person/${personId}/schedule/${slot.id}`)
          .then((results) => {
            if (results.status === 'success') {
              slot.people.removeObject(person);
              this.toast.success(`${person.callsign} was successfully removed from the mentee shift.`);
            } else {
              this.toast.error(`The server responded with an unknown status code [${results.status}]`);
            }
          })
          .catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.isSubmitting = false);
      });
  }

  // Show the signup sheet page
  @action
  showSignupSheet(slot) {
    this.signupSheetSlot = slot;
  }

  @action
  clearSignupSheet() {
    this.signupSheetSlot = null;
  }

  // Show the Alpha Info / Signed In sheet page
  @action
  showSignedInSheet(slot) {
    const someone = slot.people.find((p) => p.on_alpha_shift);

    if (!someone) {
      this.modal.info('No Alphas Found', 'No Alphas are signed into this mentee shift.');
    } else {
      this.signedInSlot = slot;
    }
  }

  @action
  clearSignedInSheet() {
    this.signedInSlot = null;
  }

  // Show the shirts goodies page
  @action
  showAlphaApparel(slot) {
    const someone = slot.people.find((p) => p.on_alpha_shift);

    if (!someone) {
      this.modal.info('No Alphas Found', 'No Alphas are signed into this mentee shift.');
    } else {
      this.apparelSlot = slot;
    }
  }

  @action
  clearAlphaApparel() {
    this.apparelSlot = null;
  }
}
