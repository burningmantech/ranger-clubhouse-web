import Controller from '@ember/controller';
import EmberObject, { action, computed } from '@ember/object';
import { debounce } from '@ember/runloop';

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

  // Deal with add a student to a session error
  _handleJoinSessionError(result, person) {
    const modal = this.modal;
    const slot = this.slot;

    switch (result.status) {
    case 'full':
      modal.info('The shift is full.', `The shift is at capacity with ${result.signed_up} indivduals signed up.`);
      break;

    case 'no-slot':
      modal.info('The slot could not be found?', `The slot ${slot.id} was not found in the database. This looks like a bug!`);
      break;

    case 'no-position':
      modal.info('Position not held', `The person does not hold the Alpha position order to sign up for this shift.`);
      break;

    case 'exists':
      modal.info('Already signed up', `Huh, looks like ${person.callsign} is already signed up for the session.`);
      break;

    case 'not-active':
      modal.info('Inactive Shift', 'Sign ups are not allowed because the shift has not been activated. Please check back later and try again.');
      break;

    case 'multiple-enrollment':
      modal.open('modal-multiple-enrollment', {
        title: 'Multiple Enrollments Not Allowed',
        slots: result.slots,
        person
      });
      break;

    default:
      modal.info('Unknown status response', `Sorry, I did not understand the status response of [${result.status}] from the server`);
      break;
    }
  }

  @action
  cancelSearchAction() {
    this.set('addPersonForm', null);
  }

  @action
  addPersonAction(person) {
    this.ajax.post(`person/${person.id}/schedule`, {
        data: {
          slot_id: this.slot.id
        }
      })
      .then((result) => {
        if (result.status != 'success') {
          this._handleJoinSessionError(result, person);
          return;
        }

        this.set('addPersonForm', null);

        if (result.full_forced) {
          this.toast.success('Successfully signed up, and the shift is overcapacity. Hope you know what you are doing!');
        } else if (result.trainer_forced) {
          this.toast.success('Successfully signed up, and the trainer is now signed up for multiple training sessions.');
        } else if (result.multiple_forced) {
          this.modal.open('modal-multiple-enrollment', {
            title: 'Sign Up Forced - Other Enrollments Found',
            slots: result.slots,
            person,
            forced: true,
          });
        } else {
          this.toast.success('Successfully signed up.');
        }

        this.send('refreshRoute');
      })
      .catch((response) => this.house.handleErrorResponse(response));
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
