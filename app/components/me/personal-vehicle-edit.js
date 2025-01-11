import Component from '@glimmer/component';
import {CanadianProvinces, States} from "clubhouse/constants/countries";
import {VehicleClassOptions} from "clubhouse/constants/vehicles";
import {validatePresence} from 'ember-changeset-validations/validators';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MePersonalVehicleEditComponent extends Component {
  @service house;
  @service toast;

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
    {id: 'permanent-new', title: 'New'},
    {id: 'permanent-existing', title: 'Reauthorize'},
    {id: 'event', title: 'Event Only'}
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
  async saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.args.entry.isNew;

    try {
      await model.save();
      this.toast.success(`The request was successfully ${isNew ? 'submitted' : 'updated'}.`);
      if (isNew) {
        this.args.vehicles.update();
      }
      this.args.onFinish();
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    }
  }
}
