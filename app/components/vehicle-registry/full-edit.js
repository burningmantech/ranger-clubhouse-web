import Component from '@glimmer/component';
import {validatePresence} from 'ember-changeset-validations/validators';
import {VehicleClassOptions} from 'clubhouse/constants/vehicles';
import {States, CanadianProvinces} from 'clubhouse/constants/countries';
import { action } from '@ember/object';
import {debounce} from '@ember/runloop';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class VehicleRegistryFullEditComponent extends Component {
  @service ajax;

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

  typeOptions = [
    {id: 'fleet', title: 'Fleet'},
    {id: 'personal', title: 'Personal'},
  ];

  vehicleClassOptions = VehicleClassOptions;

  statusOptions = [
    {id: 'pending', title: 'Pending'},
    {id: 'approved', title: 'Approved'},
    {id: 'rejected', title: 'Denied'}
  ];

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
    {id: 'permanent-new', title: 'Permanent New'},
    {id: 'permanent-existing', title: 'Permanent Reauthorize'},
    {id: 'event', title: 'Event Only'}
  ];

  amberLightOptions = [
    {id: 'none', title: 'None'},
    {id: 'department', title: 'Department Supplied'},
    {id: 'already-has', title: 'Personal'}

  ];

  vehicleValidations = {
    vehicle_make: [validatePresence(true)],
    vehicle_model: [validatePresence(true)],
    vehicle_color: [validatePresence(true)],
  };


  _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.length < 2) {
      return reject();
    }

    return this.ajax.request('callsigns', {data: {query: callsign, type: 'all', limit: 20}})
      .then(({callsigns}) => {
        if (callsigns.length > 0) {
          return resolve(callsigns.map(({callsign}) => callsign));
        }
        return reject();
      }, reject);
  }

  @action
  searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }
}
