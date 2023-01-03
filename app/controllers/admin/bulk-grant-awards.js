import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {TypeLabels, TypeSortOrder} from 'clubhouse/models/award';
import _ from 'lodash';

export default class AdminBulkGrantAwardsController extends ClubhouseController {
  @tracked awards;
  @tracked results;
  @tracked haveResults;
  @tracked serviceYears = 5;
  @tracked peopleList;

  @tracked haveServiceYearsResults = false;
  @tracked serviceYearsResults = [];

  @tracked awardId;

  @tracked committed = false;

  @tracked isSubmitting = false;

  @tracked people;
  @tracked callsigns;

  serviceYearOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  @cached
  get awardOptions() {
    const groups = _.map(_.groupBy(this.awards, 'type'), (options, type) => ({
      type,
      groupName: TypeLabels[type] ?? type,
      options: options.map((o) => [ o.title, o.id ])
    }));

    groups.sort((a, b) => ((TypeSortOrder[a.type] ?? 99) - (TypeSortOrder[b.type] ?? 99)));

    return groups;
  }

  get awardSelected() {
    return this.awards.find((a) => +a.id === +this.awardId);
  }

  @action
  previewServiceYearGrant() {
    this._grantServiceYears(false);
  }

  @action
  commitServiceYearGrant() {
    this._grantServiceYears(true);
  }

  _grantServiceYears(commit) {
    this.isSubmitting = true;
    this.committed = false;
    this.haveServiceYearsResults = false;

    this.ajax.request('award/bulk-grant-service-years-award', {
      method: 'POST', data: {service_years: +this.serviceYears, award_id: +this.awardId, commit}
    }).then(({people}) => {
      this.serviceYearsResults = people;
      this.haveServiceYearsResults = true;
      this.committed = commit;
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  previewGrant() {
    this._grantAward(false);
  }

  @action
  commitGrant() {
    this._grantAward(true);
  }

  _grantAward(commit) {
    this.isSubmitting = true;
    this.committed = false;
    this.haveResults = false;
    this.results = [];

    this.ajax.request('award/bulk-grant-award', {
      method: 'POST', data: {award_id: +this.awardId, callsigns: this.callsigns, commit}
    }).then(({people}) => {
      this.results = people;
      this.haveResults = true;
      this.committed = commit;
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  get resultErrors() {
    return this.results.reduce((total, r) => total + (r.not_found ? 1 : 0), 0);
  }
}
