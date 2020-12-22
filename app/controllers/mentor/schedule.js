import Controller from '@ember/controller';
import EmberObject, { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { slotSignup } from 'clubhouse/utils/slot-signup';
import { tracked } from '@glimmer/tracking';

const SEARCH_RATE_MS = 300;

export default class MentorScheduleController extends Controller {
  @tracked slot;
  @tracked foundPeople;
  @tracked noSearchMatch;
  @tracked addPersonForm;
  @tracked removePersonForm;
  @tracked isSearching;
  @tracked isSubmitting;
  @tracked signedInSlot;
  @tracked apparelSlot;

  queryParams = [ 'year' ];

  get removeStudentOptions() {
    const options = [
      [ '-', null ]
    ];

    this.slot.people.forEach((alpha) => {
      options.push([ `${alpha.callsign} (${alpha.first_name} ${alpha.last_name})`, alpha.id]);
    });

    return options;
  }


  // Show the dialog to add a person
  @action
  showAddPersonAction(slot) {
    this.slot = slot;
    this.foundPeople = null;
    this.noSearchMatch = null;
    this.addPersonForm = EmberObject.create({ name: '' });
  }

  @action
  searchPeopleAction(field, model) {
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  _performSearch(model) {
    const query = model.name.trim();

    if (query.length < 2) {
      return;
    }

    this.isSearching = true;
    this.ajax.request('person', {
      data: {
        query,
        basic: 1,
        search_fields: 'name,callsign,email',
        exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked,past prospective',
        limit: 10
      }
    }).then((results) => {
      this.foundPeople = results.person;
      if (!results.person) {
        this.noSearchMatch = query;
      }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => { this.isSearching = false; })
  }


  @action
  cancelSearchAction() {
    this.addPersonForm = null;
  }

  @action
  addPersonAction(person, slot) {
    slotSignup(this, slot, person, () => {
      this.addPersonForm = null;
      this.send('refreshRoute');
    });
  }

  // Remove a student from the session
  @action
  removePersonAction(model) {
    const personId = model.person_id;
    const person = this.slot.people.find((student) => student.id == personId );

    this.isSubmitting = true;

    this.ajax.delete(`person/${personId}/schedule/${this.slot.id}`)
      .then((results) => {
        if (results.status === 'success') {
          this.slot.people.removeObject(person);
          this.toast.success(`${person.callsign} was successfully removed from this training session.`);
        } else {
          this.toast.error(`The server responded with an unknown status code [${results.status}]`);
        }
        this.removePersonForm = null;
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  // Show the remove student dialog
  @action
  showRemovePersonAction(slot) {
    this.slot = slot;
    this.removePersonForm = EmberObject.create({ person_id: null });
  }

  // Cancel/close the student detail dialog
  @action
  cancelRemovePersonAction() {
    this.removePersonForm = null;
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
      this.modal.info(null, 'No Alphas were found to be signed in for this shift.');
    } else {
      this.signedInSlot = slot;
    }
  }

  @action
  clearSignedInSheet() {
    this.signedInSlot = null;
  }

  // Show the shirts goodie page
  @action
  showAlphaApparel(slot) {
    const someone = slot.people.find((p) => p.on_alpha_shift);

    if (!someone) {
      this.modal.info(null, 'No Alphas were found to be signed in for this shift.');
    } else {
      this.apparelSlot = slot;
    }
  }

  @action
  clearAlphaApparel() {
    this.apparelSlot = null;
  }
}
