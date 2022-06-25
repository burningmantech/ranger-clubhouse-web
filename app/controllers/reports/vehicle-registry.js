import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {States, CanadianProvinces} from 'clubhouse/constants/countries';
import {debounce} from '@ember/runloop';
import {validatePresence} from 'ember-changeset-validations/validators';
import { VehicleClassOptions } from 'clubhouse/constants/vehicles';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';

export default class ReportsPersonVehiclesController extends ClubhouseController {
  queryParams = ['year'];

  @tracked entry;
  @tracked filter = 'all';
  @tracked numberFilter = '';
  @tracked typeFilter = 'all';

  filterTypeOptions = [
    { id: 'all', title: 'All' },
    { id: 'fleet', title: 'Fleet' },
    { id: 'personal', title: 'Personal' },
  ];

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
    { id: 'fleet', title: 'Fleet' },
    { id: 'personal', title: 'Personal' },
  ];

  vehicleClassOptions = VehicleClassOptions;

  statusOptions = [
    {id: 'pending', title: 'Pending'},
    {id: 'approved', title: 'Approved'},
    {id: 'rejected', title: 'Denied'}
  ];

  drivingStickerOptions = [
 //   {id: 'none', title: 'None'},
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

  filterOptions = [
    {id: 'all', title: 'All'},
    {id: 'pending', title: 'Pending'},
    {id: 'approved', title: 'Approved'},
    {id: 'rejected', title: 'Rejected'},
  ];


  amberLightLabels = {
    none: '-',
    'already-has': 'Personal',
    'department': 'Department'
  };

  drivingStickerLabels = {
    none: '-',
    staff: 'Staff',
    prepost: 'Pre/Post',
    other: 'Other'
  };

  fuelChitLabels = {
    none: '-',
    'single-use': 'Single Use',
    event: 'Event'
  };

  logoLabels = {
    none: '-',
    'permanent-new': 'Permanent New',
    'permanent-existing': 'Permanent Reauthorized',
    event: 'Event Only'
  };

  vehicleTypeOptions = [
    [ 'Personal Vehicle', 'personal' ],
    [ 'Fleet Vehicle', 'fleet' ],
  ];

  get viewVehicles() {
    let vehicles = this.person_vehicle;

    switch (this.filter) {
      case 'pending':
        vehicles = vehicles.filter((v) => v.isPending);
        break;
      case 'rejected':
        vehicles = vehicles.filter((v) => v.isRejected);
        break;
      case 'approved':
        vehicles = vehicles.filter((v) => v.isApproved);
        break;
    }

    switch (this.typeFilter) {
      case 'personal':
        vehicles = vehicles.filter((v) => v.isPersonal);
        break;
      case 'fleet':
        vehicles = vehicles.filter((v) => v.isFleet);
        break;
     }


    if (this.numberFilter) {
      const number = this.numberFilter.toLocaleLowerCase();
      vehicles = vehicles.filter((v) =>
        ( (!isEmpty(v.sticker_number) && v.sticker_number.toLowerCase().indexOf(number) !== -1)
          || (!isEmpty(v.license_number) && v.license_number.toLowerCase().indexOf(number) !== -1)
          || (!isEmpty(v.rental_number) && v.rental_number.toLowerCase().indexOf(number) !== -1)
        )
      )
    }

    vehicles = vehicles.toArray();
    vehicles.sort((a,b) => {
      const aName = a.isFleet ? (isEmpty(a.team_assignment) ? '1A' : a.team_assignment) : a.person.callsign;
      const bName = b.isFleet ? (isEmpty(b.team_assignment) ? '1A' : b.team_assignment) : b.person.callsign;

      return aName.toLowerCase().localeCompare(bName.toLowerCase());
    });
    return vehicles;
  }

  @action
  clearNumberFilterAction() {
    this.numberFilter = '';
  }

  @action
  newAction() {
    this.entry = this.store.createRecord('vehicle', {
      type: 'fleet',
      event_year: this.year,
      status: 'pending',
      driving_sticker: 'prepost',
      fuel_chit: 'none',
      ranger_logo: 'none',
      amber_light: 'none',
      vehicle_class: 'Pickup Truck',
      team_assignment: '',
    });
  }

  @action
  editAction(entry) {
    entry.reload().then(() => {
      this.entry = entry;
      entry.callsign = entry.person ? entry.person.callsign : '';
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.entry.isNew;
    this.house.saveModel(model, 'Vehicle successfully saved',
      () => {
        this.entry = null;
        if (isNew) {
          this.person_vehicle.update().catch((response) => this.house.handleErrorResponse(response));
        }
      });
  }

  @action
  deleteAction(entry) {
    this.modal.confirm('Delete Entry', 'Are you sure you want to delete this entry?', () => {
      entry.destroyRecord().then(() => {
        this.entry = null;
        this.toast.success('Vehicle record has been deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  cancelAction() {
    this.entry = null;
  }

  _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.length < 2) {
      return reject();
    }

    return this.ajax
      .request('callsigns', {data: {query: callsign, type: 'all', limit: 20}})
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

  @action
  exportToCSV() {
    const COLUMNS = [
      {key: 'callsign_team', title: 'Person/Team'},
      {key: 'status', title: 'Status'},
      {key: 'vehicle_year', title: 'Vehicle Year'},
      {key: 'vehicle_make', title: 'Vehicle Make'},
      {key: 'vehicle_model', title: 'Vehicle Model'},
      {key: 'vehicle_color', title: 'Vehicle Color'},
      {key: 'rental_number', title: 'Rental #' },
      {key: 'driving_sticker', title: 'Driving Sticker'},
      {key: 'sticker_number', title: 'Sticker #'},
      {key: 'license_state', title: 'License State'},
      {key: 'license_number', title: 'License #'},
      {key: 'ranger_logo', title: 'Ranger Logo'},
      {key: 'fuel_chit', title: 'Fuel Chit'},
      {key: 'amber_light', title: 'Amber Light'},
      {key: 'notes', title: 'Notes'},
      {key: 'response', title: 'Response to person' },
      {key: 'request_comment', title: 'Requester Comment' },
    ];

    const rows = this.viewVehicles.map((v) => {
      return {
        callsign_team: (v.isFleet ? v.team_assignment : (v.person ? v.person.callsign : `Deleted Person #${v.person_id}`)),
        status: v.status,
        vehicle_year: v.vehicle_year,
        vehicle_make: v.vehicle_make,
        vehicle_model: v.vehicle_model,
        vehicle_color: v.vehicle_color,
        license_state: v.license_state,
        license_number: v.license_number,
        driving_sticker: this.drivingStickerLabels[v.driving_sticker],
        rental_number: v.rental_number,
        sticker_number: v.sticker_number,
        ranger_logo: this.logoLabels[v.ranger_logo],
        amber_light: this.amberLightLabels[v.amber_light],
        fuel_chit: this.fuelChitLabels[v.fuel_chit],
        notes: v.notes,
        response: v.response,
        request_comment: v.request_comment,
      };
    });

    this.house.downloadCsv(`${this.year}-vehicles.csv`, COLUMNS, rows);
  }
}
