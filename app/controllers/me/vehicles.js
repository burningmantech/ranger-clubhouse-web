import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';
import {States, CanadianProvinces} from 'clubhouse/constants/countries';
import { VehicleClassOptions } from 'clubhouse/constants/vehicles';

export default class MeVehiclesController extends Controller {
  @tracked entry = null;
  @tracked documentLoaded = false;

  stateOptions = [
    {
      groupName: 'Choose State',
      options: States,
    },
    {
      groupName: 'Choose Canadian Province',
      options: CanadianProvinces,
    },
    {
      groupName: 'Other',
      options: [
        {id: 'NA', title: 'Not Available'}
      ]
    }
  ];

  vehicleClassOptions = VehicleClassOptions;

  drivingStickerOptions = [
    {id: 'none', title: 'None'},
    {id: 'prepost', title: 'Pre/Post'},
    {id: 'staff', title: 'Staff'},
  ];

  fuelChitOptions = [
    {id: 'none', title: 'None'},
    {id: 'single-use', title: 'Single Use'},
    {id: 'event', title: 'Event'},
  ];

  rangerLogoOptions = [
    {id: 'none', title: 'None'},
    {id: 'permanent-new', title: 'Permanent - Re-Authorization'},
    {id: 'permanent-existing', title: 'Permanent - New'},
    {id: 'event', title: 'Event Week Only' }
  ];

  amberLightOptions = [
    {id: 'none', title: 'None'},
    {id: 'department', title: 'Ranger Department Supplied'},
    {id: 'already-has', title: 'Providing My Own'}

  ];

  vehicleValidations = {
    vehicle_make: [validatePresence(true)],
    vehicle_model: [validatePresence(true)],
    vehicle_color: [validatePresence(true)],
  };

  @action
  newAction() {
    this.entry = this.store.createRecord('vehicle', {
      type: 'personal',
      event_year: this.house.currentYear(),
      person_id: this.session.userId,
      status: 'pending',
      vehicle_class: 'Pickup Truck'
    });
  }

  @action
  editAction(entry) {
    this.entry = entry;
  }

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.entry.isNew;

    model.save().then(() => {
      this.entry = null;
      this.toast.success(`The request was successfully ${isNew ? 'submitted' : 'updated'}.`);
      if (isNew) {
        this.vehicles.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  cancelAction() {
    this.entry = null;
  }

  @action
  deleteAction(entry) {
  this.modal.confirm('Delete Vehicle Request',
    `Are you sure you want to delete your request for the vehicle "${entry.vehicle_year} ${entry.vehicle_make} ${entry.vehicle_model} ${entry.vehicle_color}"?`,
    () => {
      entry.destroyRecord().then(() => {
        this.toast.success('Request was successfully deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  signPersonVehicleAgreementAction() {
    this.personEvent.signed_personal_vehicle_agreement = true;
    this.personEvent.save().then(() => {
      this.toast.success('Agreement has been successfully recorded.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  documentLoadedAction() {
    this.documentLoaded = true;
  }
}
