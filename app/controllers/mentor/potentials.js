import Controller from '@ember/controller';
import { action, computed, get, set } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class MentorPotentialsController extends Controller {
  filterOptions = [
    [ 'All', 'all' ],
    [ 'Mentor Flagged', 'mentor-flag' ],
    [ 'Training Flagged', 'training-flag' ],
    [ 'No Photo', 'no-photo' ],
    [ 'No Callsign', 'no-handle' ],
    [ 'Not Trained', 'no-training']
  ];

  @computed('filter', 'potentials')
  get viewPotentials() {
    const potentials = this.potentials;

    switch (this.filter) {
    case 'mentor-flag':
      return potentials.filter((p) => p.mentors_flag == 1);

    case 'training-flag':
      return potentials.filter((p) => {
        return p.trainings.find((t) => t.rank >= 4);
      });

    case 'no-photo':
      return potentials.filter((p) => !p.photo_approved);

    case 'no-handle':
      return potentials.filter((p) => !p.callsign_approved);

    case 'no-training':
        return potentials.filter((p) => !p.trained);

    default:
      return potentials;
    }
  }

  @action
  editAction(person) {
    this.set('person', person);
  }

  _buildPotential(row) {
    const flag_note = get(row, 'mentors_flag_note');
    const notes = get(row, 'mentors_notes');

    return {
      id: get(row, 'id'),
      mentors_flag: get(row, 'mentors_flag') ? 1 : 0,
      mentors_flag_note: isEmpty(flag_note) ? null : flag_note,
      mentors_notes: isEmpty(notes) ? null : notes,
    }
  }

  @action
  saveAction(model) {
    const person = this.person;
    this.ajax.request('mentor/potentials', { method: 'POST', data: { potentials: [ this._buildPotential(model) ] }})
      .then(() => {
        // everything good! update the backing object.
        set(person, 'mentors_flag', model.get('mentors_flag'));
        set(person, 'mentors_flag_note', model.get('mentors_flag_note'));
        set(person, 'mentors_notes',  model.get('mentors_notes'));
        this.set('person', null);
        this.toast.success('The potentials have been successfully updated.');
      }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancelAction() {
    this.set('person', null);
  }

  @action
  saveAll() {
    const potentials = this.viewPotentials.map((row) => this._buildPotential(row));

    if (potentials.length == 0) {
      this.toast.error("No potentials found?");
      return;
    }

    this.ajax.request('mentor/potentials', { method: 'POST', data: { potentials }})
      .then(() => {
        this.toast.success('The potentials have been successfully updated.');
      }).catch((response) => this.house.handleErrorResponse(response));
  }
}
