import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from '@ember/utils';

export default class ReportsPersonVehiclesController extends ClubhouseController {
  queryParams = ['year'];

  @tracked editEntry;
  @tracked stickerEditEntry;

  @tracked filter = 'all';
  @tracked numberFilter = '';
  @tracked typeFilter = 'all';

  filterTypeOptions = [
    {id: 'all', title: 'All'},
    {id: 'fleet', title: 'Fleet'},
    {id: 'personal', title: 'Personal'},
  ];

  filterOptions = [
    {id: 'all', title: 'All'},
    {id: 'pending', title: 'Pending'},
    {id: 'approved', title: 'Approved'},
    {id: 'rejected', title: 'Rejected'},
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
        ((!isEmpty(v.sticker_number) && v.sticker_number.toLowerCase().indexOf(number) !== -1)
          || (!isEmpty(v.license_number) && v.license_number.toLowerCase().indexOf(number) !== -1)
          || (!isEmpty(v.rental_number) && v.rental_number.toLowerCase().indexOf(number) !== -1)
        )
      )
    }

    vehicles = [...vehicles]; // convert from Ember records array to regular array
    vehicles.sort((a, b) => {
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
  newEditAction() {
    this.editEntry = this.store.createRecord('vehicle', {
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
  editStickerAction(entry) {
    this._commonEdit(entry, true)
  }

  @action
  editEntryAction(entry) {
    this._commonEdit(entry, false);
  }

  _commonEdit(entry, isSticker) {
    entry.reload().then(() => {
      if (isSticker) {
        this.stickerEditEntry = entry;
      } else {
        this.editEntry = entry;
      }
      entry.callsign = entry.person ? entry.person.callsign : '';
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  saveStickerAction(model, isValid) {
    this._commonSaveEntry(model, isValid, true)
  }

  @action
  saveEditAction(model, isValid) {
    this._commonSaveEntry(model, isValid, false)
  }

  @action
  _commonSaveEntry(model, isValid, isSticker) {
    if (!isValid) {
      return;
    }

    const isNew = isSticker ? false : this.editEntry.isNew;
    if (model.type === 'fleet') {
      model.driving_sticker = 'staff';
    }
    this.house.saveModel(model, 'Vehicle successfully saved',
      () => {
        if (isSticker) {
          this.stickerEditEntry = null;
        } else {
          this.editEntry = null;
        }
        if (isNew) {
          this.person_vehicle.update().catch((response) => this.house.handleErrorResponse(response));
        }
      });
  }

  get canEditVehicles() {
    return this.session.isAdmin;
  }

  @action
  deleteAction(entry) {
    this.modal.confirm('Delete Entry', 'Are you sure you want to delete this entry?', () => {
      entry.destroyRecord().then(() => {
        this.editEntry = null;
        this.toast.success('Vehicle record has been deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  cancelEditAction() {
    this.editEntry = null;
  }

  @action
  cancelStickerAction() {
    this.stickerEditEntry = null;
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
      {key: 'rental_number', title: 'DPW Request ID'},
      {key: 'driving_sticker', title: 'Driving Sticker'},
      {key: 'sticker_number', title: 'Sticker #'},
      {key: 'license_state', title: 'License State'},
      {key: 'license_number', title: 'License #'},
      {key: 'ranger_logo', title: 'Ranger Logo'},
      {key: 'fuel_chit', title: 'Fuel Chit'},
      {key: 'amber_light', title: 'Amber Light'},
      {key: 'notes', title: 'Notes'},
      {key: 'response', title: 'Response to person'},
      {key: 'request_comment', title: 'Requester Comment'},
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
        driving_sticker: v.drivingStickerLabel,
        rental_number: v.rental_number,
        sticker_number: v.sticker_number,
        ranger_logo: v.rangerLogoLabel,
        amber_light: v.amberLightLabel,
        fuel_chit: v.fuelChitLabel,
        notes: v.notes,
        response: v.response,
        request_comment: v.request_comment,
      };
    });

    this.house.downloadCsv(`${this.year}-vehicles.csv`, COLUMNS, rows);
  }
}
