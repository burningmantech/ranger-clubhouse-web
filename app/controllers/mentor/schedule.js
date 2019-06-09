import Controller from '@ember/controller';
import EmberObject, { action, computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import { slotSignup } from 'clubhouse/utils/slot-signup';

const SEARCH_RATE_MS = 300;

export default class MentorScheduleController extends Controller {
  queryParams = [ 'year' ];

  @computed('slot.people')
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
    this.set('slot', slot);
    this.set('foundPeople', null);
    this.set('noSearchMatch', null);
    this.set('addPersonForm', EmberObject.create({ name: '' }));
  }

  @action
  searchPeopleAction(field, model) {
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  _performSearch(model) {
    const query = model.get('name');

    if (query == '' || query.length < 2) {
      return;
    }

    this.ajax.request('person', {
      data: {
        query,
        basic: 1,
        search_fields: 'name,callsign,email',
        exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked,past prospective',
        limit: 10
      }
    }).then((results) => {
      this.set('foundPeople', results.person);
      if (results.person.length == 0) {
        this.set('noSearchMatch', query);
      }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    })
  }


  @action
  cancelSearchAction() {
    this.set('addPersonForm', null);
  }

  @action
  addPersonAction(person) {
    slotSignup(this, this.training, person, () => {
      this.set('addPersonForm', null);
      this.send('refreshRoute');
    });
  }

  // Remove a student from the session
  @action
  removePersonAction(model) {
    const personId = model.get('person_id');
    const person = this.slot.people.find((student) => student.id == personId );

    this.ajax.delete(`person/${personId}/schedule/${this.slot.id}`)
      .then((results) => {
        if (results.status == 'success') {
          this.slot.people.removeObject(person);
          this.toast.success(`${person.callsign} was successfully removed from this training session.`);
        } else {
          this.toast.error(`The server responded with an unknown status code [${results.status}]`);
        }
        this.set('removePersonForm', null);
      })
      .catch((response) => this.house.handleErrorResponse(response));
  }

  // Show the remove student dialog
  @action
  showRemovePersonAction(slot) {
    this.set('slot', slot);
    this.set('removePersonForm', EmberObject.create({ person_id: null }));
  }

  // Cancel/close the student detail dialog
  @action
  cancelRemovePersonAction() {
    this.set('removePersonForm', null);
  }

  // Show the signup sheet page
  @action
  showSignupSheet(slot) {
    this.set('signupSheetSlot', slot);
  }

  @action
  clearSignupSheet() {
    this.set('signupSheetSlot', null);
  }

  // Show the Alpha Info / Signed In sheet page
  @action
  showSignedInSheet(slot) {
    const someone = slot.people.find((p) => p.on_alpha_shift);

    if (!someone) {
      this.modal.info(null, 'No Alphas were found to be signed in for this shift.');
    } else {
      this.set('signedInSlot', slot);
    }
  }

  @action
  clearSignedInSheet() {
    this.set('signedInSlot', null);
  }

  // Show the shirts goodie page
  @action
  showAlphaApparel(slot) {
    const someone = slot.people.find((p) => p.on_alpha_shift);

    if (!someone) {
      this.modal.info(null, 'No Alphas were found to be signed in for this shift.');
    } else {
      this.set('apparelSlot', slot);
    }
  }

  @action
  clearAlphaApparel() {
    this.set('apparelSlot', null);
  }
}
