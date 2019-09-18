import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { observes } from '@ember-decorators/object';
import { isEmpty } from '@ember/utils';
import { schedule, later } from '@ember/runloop';
import {
  MealOptions,
  BmidStatusOptions,
  ShowerOptions
} from 'clubhouse/constants/bmid';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import Changeset from 'ember-changeset';

/*
 * BMID management controller
 */

// How many elements to render at a time
const BMID_RENDER_SLICE = 100;

const CSV_COLUMNS = [
  'callsign',
  'title1',
  'title2',
  'title3',
  'meals',
  'showers',
  'mvr',
  'team',
  'notes',
  'wap_status',
  'access_date',
];

export default class VcBmidController extends Controller {
  queryParams = [ 'year', 'filter' ];

  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;

  filterOptions = [
    [ 'Specials (titles, meals, showers, or early arrival)', 'special' ],
    [ 'Alphas', 'alpha' ],
    [ 'Vets w/shift after 8/10 OR PASSED training; excludes PNVs', 'signedup' ],
    [ 'BMIDs marked as "Issues" or "Do Not Print"', 'nonprint' ],
    [ 'Submitted BMIDs', 'submitted' ],
    [ 'Printed BMIDs', 'printed' ],
    [ 'No shift signups', 'no-shifts' ]
  ];

  sortColumn = 'callsign';
  titleFilter = 'All';
  teamFilter = 'All';

  sortOptions = [
    'callsign',
    'status',
    'title1',
    'title2',
    'title3',
    'mvr',
    'showers',
    'meals',
    'wap',
    'team',
    'notes'
  ];


  textFilterFields = [
    'person.callsign',
    'title1',
    'title2',
    'title3',
    'team',
    'notes'
  ];

  /*
   * Return the BMIDs to view which is filtered, and sorted
   */

  @computed('sortColumn', 'titleFilter', 'teamFilter', 'textFilter', 'bmids.[]')
  get viewBmids() {
    let bmids = this.bmids;
    const titleFilter = this.titleFilter;
    let key;

    if (this.titleFilter != 'All') {
      bmids = bmids.filter((bmid) => (bmid.title1 == titleFilter || bmid.title2 == titleFilter || bmid.title3 == titleFilter ));
    }

    if (this.teamFilter != 'All') {
      bmids = bmids.filter((bmid) => (!isEmpty(bmid.team) && bmid.team.indexOf(this.teamFilter) !== -1));
    }

    if (!isEmpty(this.textFilter)) {
      const regexp = new RegExp(this.textFilter, 'i');

      bmids = bmids.filter((bmid) => {
        let haveMatch = false;
        this.textFilterFields.forEach((field) => {
          const value = bmid.get(field);

          if (!isEmpty(value) && regexp.test(value)) {
            haveMatch = true;
          }
        });

        return haveMatch;
      });
    }

    switch (this.sortColumn) {
      case 'callsign':
        // Sort by callsign
        bmids.sort((a,b) => {
          const personA = (a.person ? a.person.callsign.toLowerCase() : `Deleted #${a.person_id}`);
          const personB = (b.person ? b.person.callsign.toLowerCase() : `Deleted #${b.person_id}`);
          return personA.localeCompare(personB);
        });
        break;

      case 'status':
      case 'title1':
      case 'title2':
      case 'title3':
      case 'meals':
      case 'team':
      case 'notes':
        key = this.sortColumn;
        bmids.sort((a,b) => {
          const aCol = a[key], bCol = b[key];

          // Have empty values appear at the end
          if (!aCol) { return 1; }
          if (!bCol) { return -1; }

          const result = aCol.toLowerCase().localeCompare(bCol.toLowerCase());
          if (result) {
            return result;
          }

          const personA = (a.person ? a.person.callsign.toLowerCase() : `Deleted #${a.person_id}`);
          const personB = (b.person ? b.person.callsign.toLowerCase() : `Deleted #${b.person_id}`);
          return personA.localeCompare(personB);
        });
        break;

      case 'mvr':
        // With Insurance first
        bmids.sort((a,b) => {
          const result = b.org_vehicle_insurance - a.org_vehicle_insurance;
          if (result) {
            return result;
          }

          const personA = (a.person ? a.person.callsign.toLowerCase() : `Deleted #${a.person_id}`);
          const personB = (b.person ? b.person.callsign.toLowerCase() : `Deleted #${b.person_id}`);
          return personA.localeCompare(personB);
        });
        break;

      case 'showers':
        // With showers first
        bmids.sort((a,b) => {
          const result = b.showers - a.showers;
          if (result) {
            return result;
          }

          const personA = (a.person ? a.person.callsign.toLowerCase() : `Deleted #${a.person_id}`);
          const personB = (b.person ? b.person.callsign.toLowerCase() : `Deleted #${b.person_id}`);
          return personA.localeCompare(personB);

        });
        break;

      case 'wap':
        bmids.sort((a,b) => {
          const result = a.access_date_sortable - b.access_date_sortable;
          if (result) {
            return result;
          }
          const personA = (a.person ? a.person.callsign.toLowerCase() : `Deleted #${a.person_id}`);
          const personB = (b.person ? b.person.callsign.toLowerCase() : `Deleted #${b.person_id}`);
          return personA.localeCompare(personB);

        });
        break;
    }

    return bmids;
  }

  /*
   * Take a chunk out of viewBmids and add it to renderBmids.
   *
   * Ember may lock up the browser trying to render a large table.
   * Gradually build up the to-be-rendered BMIDs for a better UI experience.
   */


  _setRenderBmidsSlice(startSlice) {
    const viewBmids = this.viewBmids;
    let slice =  viewBmids.slice(startSlice, startSlice + BMID_RENDER_SLICE);
    this.set('renderBmids', this.renderBmids.concat(slice));
    slice = slice.map((row) => new Changeset(row));
    this.set('editableBmids', this.editableBmids.concat(slice));

    if (this.renderBmids.length < viewBmids.length) {
      schedule('afterRender', this, () => {
        later(() => { this._setRenderBmidsSlice(startSlice + BMID_RENDER_SLICE) }, 1)
      });
    } else {
      this.set('isRendering', false);
    }
  }

  /*
   * Kick off building up over time the BMIDs to be shown
   */

  @observes('viewBmids', 'bmids', 'editMode')
  startRenderBmids() {
    if (this.isRendering) {
      return;
    }

    this.set('isRendering', true);
    this.set('renderBmids', []);
    this.set('editableBmids', []);
    later(() => { this._setRenderBmidsSlice(0) }, 1);
  }

  /*
   * How many BMIDs have not been saved.
   */

  @computed('editableBmids.@each.isDirty')
  get unsaveRows() {
    return this.editableBmids.reduce((total, row) => (row.isDirty ? 1 : 0)+total, 0);
  }

  /*
   * Build the title filter options
   */

  @computed('bmids.[]', 'bmids.@each.{title1,title2,title3}')
  get titleFilterOptions() {
    const titles = {};

    this.bmids.forEach((bmid) => {
      if (!isEmpty(bmid.title1)) {
        titles[bmid.title1] = true;
      }
      if (!isEmpty(bmid.title2)) {
        titles[bmid.title2] = true;
      }
      if (!isEmpty(bmid.title3)) {
        titles[bmid.title3] = true;
      }
    });

    const options = Object.keys(titles).sort();
    options.unshift('All');

    return options;
  }

  /*
   * Build the team filter options. Split out combined teams if a
   * '+' or '/' is in the field. (e.g., Pre/Post becomes two teams [Pre, Post],)
   */

  @computed('bmids.{[],@each.team}')
  get teamFilterOptions() {
    const teams = {};

    this.bmids.forEach((bmid) => {
      if (!isEmpty(bmid.team)) {
        bmid.team.split(/(\+|\/)/).forEach((word) => {
          if (word != '+' && word != '/')
            teams[word] = true;
         });
      }
    });

    const options = Object.keys(teams).sort();
    options.unshift('All');

    return options;
  }

  /*
   * Build the access dates allowed for the current year
   */

  @computed('year')
  get admissionDateOptions() {
    return admissionDateOptions(this.year, this.ticketingInfo.wap_date_range);
  }

  @action
  toggleEditMode() {
    this.toggleProperty('editMode');
  }

  @action
  editBmid(bmid) {
    this.set('entry', bmid);

  }

  @action
  cancelBmid() {
    this.set('entry', null);
  }

  /*
   * Save a BMID being edited in a the modal box. Need to close the modal down after
   * a successful save.
   */

  @action
  saveBmid(model, isValid) {
    if (!isValid) {
      return;
    }

    model.save().then(() => {
      this.toast.success('BMID successfully updated.');
      this.set('entry', null);
    })
    .catch((response) => this.house.handleErrorResponse(response));
  }

  /*
   * Save a BMID being edited in the table.
   */

  @action
  saveInlineBmid(model) {
    model.save().then(() => {
      this.toast.success('BMID successfully updated.');
    })
    .catch((response) => this.house.handleErrorResponse(response));
  }

  /*
   * Provide a string filter. Verify any regular expressions entered are valid.
   */

  @action
  textFilterAction() {
    this.set('textFilterError', '');
    const filter = this.textFilterInput;

    if (isEmpty(filter)) {
      return;
    }

    try {
      RegExp(filter);
      this.set('textFilter', filter);
    } catch(e) {
      this.set('textFilterError', e.toString());
    }
  }

  @action
  clearTextFilterAction() {
    this.set('textFilter', '');
    this.set('textFilterInput', '');
    this.set('textFilterError', '');
  }

  /*
   * Increase the note textarea rows when editing inline and the note receives
   * focus.
   */

  @action
  focusNote(event) {
    event.target.rows = 10;
  }

  /*
   * When losing focus on the note field - reduce the textarea rows back to 1
   * and store what was entered.
   */

  @action
  blurNote(bmid, event) {
    bmid.set('notes', event.target.value);
    event.target.rows = 1;
  }

  /*
   * Update a field on blur/lost of focus.
   */

  @action
  updateColumn(bmid, column, event) {
    const value = event.target.value;

    /*
     * When a blank field is entered and then exited without entering
     * any characters. the target.value will be "". The record column  might be
     * null, so check to see if both are empty, and do nothing.
     * Otherwise setting the column to "" will cause isDirty to be set and
     * we don't want that.
     */

    if (isEmpty(value) && isEmpty(bmid.get(column))) {
      return;
    }

    bmid.set(column, isEmpty(value) ? null : value);
  }

  /*
   * Export current selection to a CSV file
   */

  @action
  exportCSV() {
    const bmids = this.viewBmids.map((bmid) => {
      return {
        callsign: bmid.person.callsign,
        title1: bmid.title1,
        title2: bmid.title2,
        title3: bmid.title3,
        meals: bmid.meals,
        showers: bmid.showers ? 'Y' : 'N',
        mvr: bmid.org_vehicle_insurance ? 'Y' : 'N',
        team: bmid.team,
        notes: bmid.notes,
        wap_status: bmid.wap_id ? bmid.wap_status : 'missing',
        access_date: bmid.admission_date || 'unspecified',
      }
    });

    this.house.downloadCsv(`bmids-${this.year}-${this.filter}.csv`, CSV_COLUMNS, bmids);
  }

  /*
   * Sort the table
   */

  @action
  sortBmidsAction(column) {
    this.set('sortColumn', column);
  }
}
