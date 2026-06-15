import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {schedule, later} from '@ember/runloop';
import {cached, tracked} from '@glimmer/tracking';
import {BmidStatusOptions, IN_PREP, READY_TO_PRINT, SUBMITTED} from 'clubhouse/models/bmid';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import {filterAndSortBmids, bmidTitleFilterOptions, bmidTeamFilterOptions} from 'clubhouse/utils/bmid-view';
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

export default class VcBmidController extends ClubhouseController {
  queryParams = ['year', 'filter'];

  bmidStatusOptions = BmidStatusOptions;

  filterOptions = [
    ['Specials (titles, meals, showers, or early arrival)', 'special'],
    ['Alphas', 'alpha'],
    ['Vets w/claimed tickets/SAPs OR In-Person training sign-ups', 'qualified'],
    ['BMIDs marked as "Issues" or "Do Not Print"', 'nonprint'],
    ['No shift signups', 'no-shifts'],
    ['In Prep', IN_PREP],
    ['Ready To Print', READY_TO_PRINT],
    ['Submitted BMIDs', SUBMITTED],
    /*
    {
      groupName: 'Deprecated',
      options: [
        ['Vets w/shift after 8/10 OR PASSED training', 'signedup'],
      ]
    },
    */
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
    return +this.year !== this.session.currentYear();
  }

  /*
   * Return the BMIDs to view which is filtered, and sorted
   */

  _buildViewBmids() {
    const {titleFilter, teamFilter, wantFilter, qualifiedFilter, textFilter, sortColumn} = this;
    this.viewBmids = filterAndSortBmids(this.bmids, {
      titleFilter, teamFilter, wantFilter, qualifiedFilter, textFilter, sortColumn
    });
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
    return bmidTitleFilterOptions(this.bmids);
  }

  /*
   * Build the team filter options. Split out combined teams if a
   * '+' or '/' is in the field. (e.g., Pre/Post becomes two teams [Pre, Post],)
   */

  get teamFilterOptions() {
    return bmidTeamFilterOptions(this.bmids);
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
  async saveBmid(model, isValid) {
    if (!isValid) {
      return;
    }

    if (await this.saveModel.save({model, message: 'BMID successfully updated.'})) {
      this.entry = null;
    }
  }

  /*
   * Save a BMID being edited in the table.
   */

  @action
  async saveInlineBmid(model) {
    await this.saveModel.save({model, message: 'BMID successfully updated.'});
  }


  @action
  openProvisionDialog(bmid) {
    bmid.showProvisionDialog = true;
  }

  @action
  closeProvisionDialog(bmid) {
    bmid.showProvisionDialog = false;
  }

  @action
  onProvisionUpdate(bmid, pkg) {
    bmid.loadProvisions(pkg);
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
    bmid.notes = event.target.value;
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
     * any characters. the target.value will be "". The record column might be
     * null, so check to see if both are empty, and do nothing.
     * Otherwise, setting the column to "" will cause isDirty to be set and
     * we don't want that.
     */

    if (isEmpty(value) && isEmpty(bmid[column])) {
      return;
    }

    bmid[column] = isEmpty(value) ? null : value;
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
        meals: bmid.mealsShortLabel,
        showers: bmid.showers_granted ? 'Y' : 'N',
        mvr: bmid.org_vehicle_insurance ? 'Y' : 'N',
        team: bmid.team,
        notes: bmid.notes,
        wap_status: bmid.wap_id ? bmid.wap_status : 'missing',
        access_date: bmid.admission_date || 'unspecified',
      }
    });

    this.download.downloadCsv(`bmids-${this.year}-${this.filter}.csv`, CSV_COLUMNS, bmids);
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
}
