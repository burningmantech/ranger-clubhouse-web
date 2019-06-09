import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { debounce } from '@ember/runloop';
import { set } from '@ember/object';
import { action, computed } from '@ember/object';
import { slotSignup } from 'clubhouse/utils/slot-signup';

const SEARCH_RATE_MS = 300;

export default class TrainingSlotController extends Controller {
  rankOptions = [
    1, 2, 3,
    ["FLAG", 4]
  ];

  showEmails = false;

  // How many people have passed
  @computed('students.@each.passed')
  get passedCount() {
    let passed = 0;
    this.students.forEach((student) => {
      if (student.scored && student.passed) {
        passed++;
      }
    });

    return passed;
  }

  // How many Dirt Vets (2 or more rangering years) OR
  // ART vets (if not a ART alpha)
  @computed('students')
  get vetCount() {
    let vets = 0;
    const is_art = this.training.is_art;

    this.students.forEach((student) => {
      if (is_art) {
        if (!student.is_art_alpha) {
          vets++;
        }
      } else if (student.years > 1) {
        vets++;
      }
    });

    return vets;
  }

  // How many dirt alphas or ART alphas are there
  @computed('students')
  get alphaCount() {
    const is_art = this.training.is_art;
    let alphas = 0;

    this.students.forEach((student) => {
      if (is_art) {
        if (student.is_art_alpha) {
          alphas++;
        }
      } else if (student.years == 0) {
        alphas++;
      }
    });

    return alphas;
  }

  @computed('students')
  get firstYearCount() {
    let firstYear = 0;

    this.students.forEach((student) => {
      if (student.years == 1) {
        firstYear++;
      }
    });

    return firstYear;
  }

  @computed('students.[]')
  get removeStudentOptions() {
    const options = [
      [ '-', null ]
    ];

    this.students.forEach((student) => {
      options.push([ `${student.callsign} (${student.first_name} ${student.last_name})`, student.id]);
    });

    return options;
  }

  // Set the ranking for a person
  @action
  changeRankAction(student, rank) {
    set(student, 'rank', rank);
  }

  // Save the student scores in bulk.
  @action
  saveAllStudentsAction() {
    const scores = this.students.map((student) => ({
      id: student.id,
      notes: student.notes,
      rank: student.rank,
      passed: student.passed
    }));

    this.toast.clear();
    this.set('isSubmitting', true);
    this.ajax.post(`training-session/${this.slot.id}/score`, {
        data: {
          students: scores
        }
      }).then((results) => {
        this.set('students', results.students);
        this.toast.success('The entire training session was successfully updated.');
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }

  // Show the dialog to add a person
  @action
  showAddPersonAction() {
    this.set('foundPeople', null);
    this.set('noSearchMatch', null);
    this.set('addPersonForm', EmberObject.create({
      name: ''
    }));
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
        exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked',
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
    slotSignup(this, this.slot, person, () => {
      this.set('addPersonForm', null);
      // Refresh the list
      this.ajax.request(`training-session/${this.slot.id}`).then((results) => {
        this.set('students', results.students);
      });
    });
  }

  // Remove a student from the session
  @action
  removePersonAction(model) {
    const personId = model.get('person_id');
    const person = this.students.find((student) => student.id == personId );

    this.ajax.delete(`person/${personId}/schedule/${this.slot.id}`)
      .then((results) => {
        if (results.status == 'success') {
          this.students.removeObject(person);
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
  showRemovePersonAction() {
    this.set('removePersonForm', EmberObject.create({ person_id: null }));
  }

  // Cancel/close the student detail dialog
  @action
  cancelRemovePersonAction() {
    this.set('removePersonForm', null);
  }

  // Toggle the email list
  @action
  toggleEmailListAction() {
    this.set('showEmails', !this.showEmails);
  }
}
