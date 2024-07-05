import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {schedule, later} from '@ember/runloop';
import {cached, tracked} from '@glimmer/tracking';
import {MealOptions, BmidStatusOptions, ShowerOptions, IN_PREP, READY_TO_PRINT, SUBMITTED} from 'clubhouse/models/bmid';
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
  {title: 'req. meals', key: 'earned_meals'},
  'showers',
  {title: 'req. showers', key: 'earned_showers'},
  'mvr',
  'team',
  'notes',
  'wap_status',
  'access_date',
];

const TEXT_FILTER_FIELDS = [
  'person.callsign',
  'title1',
  'title2',
  'title3',
  'team',
  'notes'
];

export default class VcBmidController extends ClubhouseController {
  queryParams = ['year', 'filter'];

  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;

  filterOptions = [
    ['Specials (titles, meals, showers, or early arrival)', 'special'],
    ['Alphas', 'alpha'],
    ['Vets w/claimed tickets/SAPs OR In-Person training sign-ups', 'qualified'],
    ['BMIDs marked as "Issues" or "Do Not Print"', 'nonprint'],
    ['No shift signups', 'no-shifts'],
    ['In Prep', IN_PREP],
    ['Ready To Print', READY_TO_PRINT],
    ['Submitted BMIDs', SUBMITTED],
    {
      groupName: 'Deprecated',
      options: [
        ['Vets w/shift after 8/10 OR PASSED training', 'signedup'],
      ]
    },
  ];

  @tracked sortColumn = 'callsign';

  @tracked qualifiedFilter = 'all';
  @tracked teamFilter = 'All';
  @tracked textFilter = '';
  @tracked textFilterError = null;
  @tracked textFilterInput = '';
  @tracked titleFilter = 'All';
  @tracked wantFilter = '';
  @tracked filter;

  @tracked isRendering = false;
  @tracked renderBmids = [];
  @tracked editableBmids = [];
  @tracked viewBmids = [];

  @tracked editMode = false;

  @tracked entry = null;

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

  wantFilterOptions = [
    ['', ''],
    ['All Eat', 'all_eat'],
    ['Event Week Eat', 'event_week'],
    ['Any Eats', 'any_eat'],
    ['Showers', 'showers']
  ];

  qualifiedFilterOptions = [
    ['Qualified & Unqualified', 'all'],
    ['Meets qualifications', 'qualified'],
    ['Does not meet  qualifications', 'unqualified'],
  ]

  get notCurrentYear() {
    return +this.year !== this.house.currentYear();
  }

  /*
   * Return the BMIDs to view which is filtered, and sorted
   */

  _buildViewBmids() {
    let bmids = this.bmids;
    const {titleFilter, teamFilter, wantFilter, qualifiedFilter} = this;
    let key;

    if (titleFilter !== 'All') {
      bmids = bmids.filter((bmid) => (bmid.title1 === titleFilter || bmid.title2 === titleFilter || bmid.title3 === titleFilter));
    }

    if (teamFilter !== 'All') {
      bmids = bmids.filter((bmid) => (!isEmpty(bmid.team) && bmid.team.indexOf(teamFilter) !== -1));
    }

    switch (wantFilter) {
      case 'all_eat':
        bmids = bmids.filter((bmid) => bmid.earned_meals === 'all');
        break;
      case 'event_week':
        bmids = bmids.filter((bmid) => bmid.earned_meals === 'event');
        break;
      case 'any_eat':
        bmids = bmids.filter((bmid) => (bmid.earned_meals === 'all' || bmid.earned_meals === 'event'));
        break;
      case 'showers':
        bmids = bmids.filter((bmid) => (bmid.earned_showers || bmid.allocated_showers || bmid.showers));
        break;
    }

    switch (qualifiedFilter) {
      case 'qualified':
        bmids = bmids.filter((bmid) => !bmid.notQualifiedToPrint);
        break;
      case 'unqualified':
        bmids = bmids.filter((bmid) => bmid.notQualifiedToPrint);
        break;
    }

    if (!isEmpty(this.textFilter)) {
      const regexp = new RegExp(this.textFilter, 'i');

      bmids = bmids.filter((bmid) => {
        let haveMatch = false;
        TEXT_FILTER_FIELDS.forEach((field) => {
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
        bmids.sort((a, b) => a.sortCallsign.localeCompare(b.sortCallsign));
        break;

      case 'status':
      case 'title1':
      case 'title2':
      case 'title3':
      case 'meals':
      case 'team':
      case 'notes':
        key = this.sortColumn;
        bmids.sort((a, b) => {
          const aCol = a[key], bCol = b[key];

          // Have empty values appear at the end
          if (isEmpty(aCol)) {
            return 1;
          }
          if (isEmpty(bCol)) {
            return -1;
          }

          const result = aCol.toLowerCase().localeCompare(bCol.toLowerCase());
          if (result) {
            return result;
          }
          return a.sortCallsign.localeCompare(b.sortCallsign);
        });
        break;

      case 'mvr':
        // With Insurance first
        bmids.sort((a, b) => {
          const result = b.org_vehicle_insurance - a.org_vehicle_insurance;
          if (result) {
            return result;
          }

          return a.sortCallsign.localeCompare(b.sortCallsign);
        });
        break;

      case 'showers':
        // With showers first
        bmids.sort((a, b) => {
          const aShowers = (a.showers || a.earned_showers || a.allocated_showers) ? 1 : 0;
          const bShowers = (b.showers || b.earned_showers || b.allocated_showers) ? 1 : 0;
          const result = bShowers - aShowers;
          if (result) {
            return result;
          }

          return a.sortCallsign.localeCompare(b.sortCallsign);
        });
        break;

      case 'wap':
        bmids.sort((a, b) => {
          const result = a.access_date_sortable - b.access_date_sortable;
          if (result) {
            return result;
          }
          return a.sortCallsign.localeCompare(b.sortCallsign);
        });
        break;
    }

    this.viewBmids = bmids;
    this.startRenderBmids();
  }

  @cached
  get hasUnqualifiedToPrint() {
    return this.viewBmids.find((b) => (b.notQualifiedToPrint && b.status === IN_PREP));
  }

  /*
   * Take a chunk out of viewBmids and add it to renderBmids.
   *
   * Ember may lock up the browser trying to render a large table.
   * Gradually build up the to-be-rendered BMIDs for a better UI experience.
   */


  _setRenderBmidsSlice(startSlice) {
    const viewBmids = this.viewBmids;
    let slice = viewBmids.slice(startSlice, startSlice + BMID_RENDER_SLICE);
    this.renderBmids = this.renderBmids.concat(slice);
    slice = slice.map((row) => new Changeset(row));
    this.editableBmids = this.editableBmids.concat(slice);

    if (this.renderBmids.length < viewBmids.length) {
      schedule('afterRender', this, () => {
        later(() => {
          this._setRenderBmidsSlice(startSlice + BMID_RENDER_SLICE)
        }, 1)
      });
    } else {
      this.isRendering = false;
    }
  }

  /*
   * Kick off building up over time the BMIDs to be shown
   */

  startRenderBmids() {
    if (this.isRendering) {
      return;
    }


    if (this.viewBmids.length < 200) {
      // Don't bother with smaller batches
      this.renderBmids = this.viewBmids;
      this.editableBmids = this.viewBmids;
      return;
    }

    this.isRendering = true;
    this.renderBmids = [];
    this.editableBmids = [];
    later(() => this._setRenderBmidsSlice(0), 1);
  }

  /*
   * How many BMIDs have not been saved.
   */

  get unsaveRows() {
    return this.editableBmids.reduce((total, row) => (row.isDirty ? 1 : 0) + total, 0);
  }

  /*
   * Build the title filter options
   */

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

  get teamFilterOptions() {
    const teams = {};

    this.bmids.forEach((bmid) => {
      if (!isEmpty(bmid.team)) {
        bmid.team.split(/(\+|\/)/).forEach((word) => {
          if (word !== '+' && word !== '/')
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

  get admissionDateOptions() {
    return admissionDateOptions(this.year, this.ticketingInfo.wap_date_range);
  }

  @action
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.startRenderBmids();
  }

  @action
  editBmid(bmid) {
    this.entry = bmid;
  }

  @action
  cancelBmid() {
    this.entry = null;
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
      this.entry = null;
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
    const filter = this.textFilterInput;
    this.textFilterError = '';

    if (isEmpty(filter)) {
      return;
    }

    try {
      RegExp(filter);
      this.textFilter = filter;
      this._buildViewBmids();
    } catch (e) {
      this.textFilterError = e.toString();
    }
  }

  @action
  clearTextFilterAction() {
    this.textFilter = '';
    this.textFilterInput = '';
    this.textFilterError = '';
    this._buildViewBmids();
  }

  @action
  changeFilter(name, value) {
    this[name] = value;
    this._buildViewBmids();
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
        earned_meals: bmid.earned_meals,
        showers: bmid.showers ? 'Y' : 'N',
        earned_showers: bmid.earned_showers ? 'Y' : 'N',
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
    this.sortColumn = column;
    this._buildViewBmids();
    this.startRenderBmids();
  }

  @action
  rowColor(bmid) {
    if (!bmid.has_approved_photo) {
      return 'table-danger';
    }

    if (bmid.notQualifiedToPrint && bmid.status === IN_PREP) {
      return 'table-warning';
    }

    return '';
  }
}
