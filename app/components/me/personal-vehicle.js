import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {STATUS_PENDING, TYPE_PERSONAL} from "clubhouse/models/vehicle";

export default class MePersonalVehicleComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service store;
  @service toast;

  @tracked isSubmitting;
  @tracked entry = null;

  @action
  newAction() {
    this.entry = this.store.createRecord('vehicle', {
      type: TYPE_PERSONAL,
      event_year: this.house.currentYear(),
      person_id: this.session.userId,
      status: STATUS_PENDING,
      vehicle_class: 'Pickup Truck',
    });
  }

  @action
  editAction(entry) {
    this.entry = entry;
  }

  @action
  finishEdit() {
    this.entry = null;
  }

  @action
  deleteAction(entry) {
    this.modal.confirm('Delete Vehicle Request',
      `Are you sure you want to delete your request for the vehicle "${entry.vehicle_year} ${entry.vehicle_make} ${entry.vehicle_model} ${entry.vehicle_color}"?`,
      async () => {
        try {
          this.isSubmitting = true;
          await entry.destroyRecord();
          this.toast.success('Request was successfully deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }
}
