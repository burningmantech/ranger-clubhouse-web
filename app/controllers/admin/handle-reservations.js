import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  TypeLabels,
  TYPE_BRC_TERM,
  TYPE_DECEASED_PERSON,
  TYPE_DISMISSED_PERSON,
  TYPE_RADIO_JARGON,
  TYPE_RANGER_TERM,
  TYPE_SLUR,
  TYPE_TWII_PERSON,
  TYPE_UNCATEGORIZED,
} from 'clubhouse/models/handle-reservation';

export default class HandleReservationController extends ClubhouseController {

  @tracked handleReservations;

  @tracked entry = null;

  typeOptions = [
    ['BRC term', TYPE_BRC_TERM],
    ['Deceased person', TYPE_DECEASED_PERSON],
    ['Dismissed person', TYPE_DISMISSED_PERSON],
    ['Radio jargon', TYPE_RADIO_JARGON],
    ['Ranger term', TYPE_RANGER_TERM],
    ['Slur', TYPE_SLUR],
    ['TWII Person', TYPE_TWII_PERSON],
    ['Uncategorized', TYPE_UNCATEGORIZED],
  ];

  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  @action
  newHandleReservation() {
    this.entry = this.store.createRecord('handle-reservation');
  }

  @action
  editHandleReservation(handleReservation) {
    this.entry = handleReservation;
  }

  @action
  removeHandleReservation() {
    this.modal.confirm('Delete Handle Reservation', `Are you sure you wish to delete "${this.entry.handle}"? This operation cannot be undone.`, () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('The handle reservation has been deleted.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  saveHandleReservation(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The handle reservation has been ${model.isNew ? 'created' : 'updated'}.`, () => {
      this.handleReservations.update();
      this.entry = null;
    });
  }

  @action
  cancelHandleReservation() {
    this.entry = null;
  }
}
