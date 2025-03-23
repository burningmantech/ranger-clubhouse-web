import Component from '@glimmer/component';
import {validatePresence} from 'ember-changeset-validations/validators';
import {VehicleClassOptions} from 'clubhouse/constants/vehicles';
import {States, CanadianProvinces} from 'clubhouse/constants/countries';
import { action } from '@ember/object';
import {debounce} from '@ember/runloop';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import RSVP from 'rsvp';
import {TYPE_PERSONAL} from "clubhouse/models/vehicle";

export default class VehicleRegistryFullEditComponent extends Component {
  @service ajax;
  @service house;

  @tracked isLoading = false;
  @tracked requestInfo = null;

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
    {id: 'permanent-new', title: 'New'},
    {id: 'permanent-existing', title: 'Reauthorize'},
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


  constructor() {
    super(...arguments);

    const {entry} = this.args;
    if (!entry.isNew && entry.type === TYPE_PERSONAL) {
      this._loadPersonInfo(entry.person_id);
    }
  }

  async _loadPersonInfo(personId) {
    this.isLoading = true;
    try {
      const {info} = await this.ajax.request(`vehicle/info/${personId}`, { data: { include_eligible_teams: 1}});
      this.requestInfo = {
        mvr_positions: info.mvr_positions,
        mvr_signups: info.mvr_signups,
        pvr_positions: info.pvr_positions,
        mvr_teams: info.mvr_teams,
        pvr_teams: info.pvr_teams,
      };
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isLoading = false;
    }
  }

  async _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.length < 2) {
      return reject();
    }

    try {
      const {callsigns} = await this.ajax.request('callsigns', {data: {query: callsign, type: 'all', limit: 20}});
      if (callsigns.length > 0) {
        return resolve(callsigns.map(({callsign}) => callsign));
      }
      return reject();
    } catch (e) {
      this.house.handleErrorResponse(e);
    }
  }

  @action
  searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }
}
