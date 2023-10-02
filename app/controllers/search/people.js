import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {STATUS_OPTIONS} from 'clubhouse/constants/person_status';
import _ from 'lodash';
import {isEmpty} from '@ember/utils';

export default class SearchPeopleController extends ClubhouseController {
  @tracked searchForm;
  @tracked people;
  @tracked isSubmitting;
  @tracked haveResults;
  @tracked includeYearsWorked = false;
  @tracked includePhotoStatus = false;
  @tracked includeOnlineCourse = false;
  @tracked includeTrainingStatus = false;
  @tracked includeTicketingInfo = false;
  @tracked includeCreateDate = false;

  @tracked currentQuery = {};

  statusOptions = STATUS_OPTIONS;

  yearsWorkOpOptions = [
    ['Exact', 'eq'],
    ['Greater Than Or Equal To', 'gte'],
    ['Lesser Than Or Equal To', 'lte']
  ];

  photoStatusOptions = [
    ['Any', ''],
    'approved',
    'missing',
    'rejected',
  ];

  onlineCourseOptions = [
    ['Any', ''],
    ['Missing Course', 'missing'],
    ['Started Course', 'started'],
    ['Completed Course', 'completed'],
  ];

  trainingStatusOptions = [
    ['Any', ''],
    ['No Sign-Up', 'missing'],
    ['Signed-Up', 'signed-up'],
    ['Passed', 'passed'],
    ['Not Passed/No Show', 'failed'],
  ];

  ticketingOptions = [
    ['-', ''],
    ['Started', 'started'],
    ['Not Started', 'not-started'],
    ['Finished', 'finished'],
    ['Not Finished', 'not-finished'],
    ['Not Finished w/Claimed', 'not-finished-claimed'],
  ];

  constructor() {
    super(...arguments);
    const currentYear = this.house.currentYear();
    this.year = currentYear;
    this.yearCreatedOptions = _.range(currentYear, 2010);
    this.yearCreatedOptions.unshift(['Any', 0]);
    // 1 means find all accounts with a null created_at -- i.e., accounts created prior to 2008.
    this.yearCreatedOptions.push(['Prior to 2010', 1]);
    this.statusYearOptions = _.range(currentYear, 1995, -1);
    this.statusYearOptions.unshift(['Current Status', 0]);
  }

  @action
  searchAction(model) {
    const query = {};
    this.currentQuery = query;
    if (model.statuses.length) {
      query.statuses = model.statuses.join(',');
    }

    const status_year = +model.status_year;
    if (status_year) {
      query.status_year = status_year;
    }

    if (model.year_created) {
      query.year_created = model.year_created;
    }

    this.includeYearsWorked = false;
    let years_worked = model.years_worked;
    if (!isEmpty(years_worked)) {
      // Allow zero as a valid option.
      query.years_worked = +years_worked;
      query.years_worked_op = model.years_worked_op;
      this.includeYearsWorked = true;
    }


    if (model.include_years_worked) {
      query.include_years_worked = 1;
      this.includeYearsWorked = true;
    }

    this.includePhotoStatus = false;

    if (model.photo_status !== '') {
      this.includePhotoStatus = true;
      query.photo_status = model.photo_status;
    }

    if (model.include_photo_status) {
      query.include_photo_status = 1;
      this.includePhotoStatus = true;
    }

    this.includeOnlineCourse = false;
    if (model.include_online_course) {
      this.includeOnlineCourse = true;
      query.include_online_course = 1;
    }
    if (model.online_course_status !== '') {
      this.includeOnlineCourse = true;
      query.online_course_status = model.online_course_status;
    }

    this.includeTrainingStatus = false;

    if (model.include_training_status) {
      this.includeTrainingStatus = true;
      query.include_training_status = 1;
    }
    if (model.training_status !== '') {
      query.training_status = model.training_status;
      this.includeTrainingStatus = true;
    }

    this.includeTicketingInfo = false;
    if (model.ticketing_status !== '') {
      query.ticketing_status = model.ticketing_status;
      this.includeTicketingInfo = true;
    }

    if (model.include_ticketing_info) {
      query.include_ticketing_info = 1;
      this.includeTicketingInfo = true;
    }

    if (model.include_created_at) {
      this.includeCreatedAt = true;
    }

    this._checkQuery();
  }

  _checkQuery() {
    if (!this.currentQuery.statuses || !this.currentQuery.statuses.length) {
      if (this.currentQuery.status_year > 0) {
        this.modal.info(`No Statuses Select`,
          'The status year was selected, yet no statuses were checked. Check the statuses you are interested in.');
      } else {
        this.modal.confirm(`No Statuses Select`,
          `Warning: No statuses were selected. This will might be a slow query resulting in possibly an extremely long listing of ALL Clubhouse accounts. Are you sure you want to do this?`,
          () => this._runQuery());
      }
    } else {
      this._runQuery();
    }
  }

  async _runQuery() {
    this.isSubmitting = true;
    this.haveResults = false;
    try {
      const {people} = await this.ajax.request('person/advanced-search', {data: this.currentQuery});
      this.people = people;
      this.haveResults = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  exportToCSV() {
    const query = this.currentQuery;

    let CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'First Name', key: 'first_name'},
      {title: 'Last Name', key: 'last_name'},
      {title: 'Email', key: 'email'},
      {title: 'Current Status', key: 'status'}
    ];

    if (query.status_year) {
      CSV_COLUMNS = [...CSV_COLUMNS,
        {title: 'Old Status', key: 'old_status'},
        {title: 'New Status', key: 'new_status'},
        {title: 'Status Updated On', key: 'status_changed_at', format: 'date'}
      ];
    }

    if (query.include_years_worked) {
      CSV_COLUMNS.push({title: 'Years Rangered', key: 'years_worked'});
    }

    if (this.includePhotoStatus) {
      CSV_COLUMNS.push({title: 'Photo Status', key: 'photo_status'});
    }

    if (this.includeOnlineCourse) {
      CSV_COLUMNS.push({title: 'Online Course Started', key: 'online_course_started', format: 'date'});
      CSV_COLUMNS.push({title: 'Online Course Finished', key: 'online_course_finished', format: 'date'});
    }

    if (this.includeTrainingStatus) {
      CSV_COLUMNS.push({title: 'Training Status', key: 'training_status'});
      CSV_COLUMNS.push({title: 'Training Date', key: 'training_date', format: 'date'});
      CSV_COLUMNS.push({title: 'Training Signed-Up On', key: 'training_signed_up_at', format: 'date'});
    }

    if (this.includeTicketingInfo) {
      CSV_COLUMNS.push({title: 'Ticketing Started', key: 'ticketing_started_at', format: 'date'});
      CSV_COLUMNS.push({title: 'Ticketing Finished', key: 'ticketing_finished_at', format: 'date'});
    }

    if (this.includeCreateDate) {
      CSV_COLUMNS.push({title: 'Created On', key: 'created_at', format: 'date'});
    }

    this.house.downloadCsv('people-search.csv', CSV_COLUMNS, this.people);
  }
}
