import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';
import {States, CanadianProvinces} from 'clubhouse/constants/countries';
import { VehicleClassOptions } from 'clubhouse/constants/vehicles';
import { PERSONAL_VEHICLE_AGREEMENT_TAG, MOTORPOOL_POLICY_TAG} from 'clubhouse/models/document';

export default class MeVehiclesController extends ClubhouseController {
  @tracked entry = null;
  @tracked motorpoolPolicySigned;
  @tracked personalVehicleSigned;
  @tracked showAgreementTag;

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
    {id: 'event', title: 'Event Only' }
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
      vehicle_class: 'Pickup Truck',

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
  reviewPersonalVehicleAgreement() {
    this.showAgreementTag = PERSONAL_VEHICLE_AGREEMENT_TAG;
  }

  @action
  reviewMotorpoolPolicy() {
    this.showAgreementTag = MOTORPOOL_POLICY_TAG;
  }

  @action
  closeAgreement(signed) {
    if (this.showAgreementTag === MOTORPOOL_POLICY_TAG) {
      this.motorpoolPolicySigned = signed;
    } else {
      this.personalVehicleSigned = signed;
    }

    this.showAgreementTag = null;
  }
}
