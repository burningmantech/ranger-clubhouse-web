import Component from '@glimmer/component';
import {ALPHA, DEEP_FREEZE} from 'clubhouse/constants/positions';
import _ from 'lodash';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import dayjs from 'dayjs';
import { service } from '@ember/service';

export default class WorkHistoryComponent extends Component {
  @service ajax;
  @service house;
  @service session;

  @tracked showPositionYearEntries = false;
  @tracked showPositionAllEntries = false;
  @tracked showYear = false;

  @tracked showEntireYear = false;
  @tracked yearEntries = [];
  @tracked position = [];
  @tracked entries = [];

  @tracked isLoading = true;

  constructor() {
    super(...arguments);

    this._loadWorkHistory();
  }

  async _loadWorkHistory() {
    try {
      this.timesheet = await this.ajax.request('timesheet', {data: {person_id: this.args.person.id}}).then(({timesheet}) => timesheet);
    } catch (response) {
      this.house.handleErrorResponse(response);
      this.timesheet = [];
    } finally {
      this.isLoading = false;
    }

    const positionsByYear = {};
    const positionsById = {};

    const yearTotals = {};
    let totalDuration = 0;

    const entries = this.timesheet.filter((t) => t.position_id !== ALPHA && t.position_id !== DEEP_FREEZE && !t.position.title.includes('Training'));

    entries.forEach((t) => {
      t.year = dayjs(t.on_duty).year();
      const position = positionsByYear[t.year] ||= {};
      const positionByYear = (position[t.position_id] ||= {entries: [], duration: 0});
      positionByYear.entries.push(t);
      positionByYear.duration += t.duration;

      const positionById = (positionsById[t.position_id] ||= {
        id: t.position_id,
        title: t.position.title,
        years: {},
        duration: 0,
        entries: []
      });
      positionById.duration += t.duration;
      positionById.entries.push(t);

      const positionByYearId = (positionById.years[t.year] ||= {id: t.position_id, duration: 0, entries: []});
      positionByYearId.entries.push(t);
      positionByYearId.duration += t.duration;

      yearTotals[t.year] ||= {duration: 0, entries: []};
      yearTotals[t.year].duration += t.duration;
      yearTotals[t.year].entries.push(t);
      totalDuration += t.duration;
    });

    this.years = _.uniqBy(entries, 'year').map((t) => t.year);
    this.yearTotals = yearTotals;
    this.totalDuration = totalDuration;
    this.positionsByYear = positionsByYear;
    this.positionsById = positionsById;
    this.positions = _.sortBy(_.values(positionsById), 'title');
    this.hasInaccurateTimesheets = !!entries.find((t) => t.year < 2008);
    this.hasNonRangerWork = !!entries.find((t) => t.is_non_ranger);
    this.isMe = (this.session.userId === this.args.person.id);
  }


  @action
  showPositionYearSummaryAction(positionId, year) {
    this.showPositionYearEntries = true;
    this.showYear = year;
    this.position = this.positionsById[positionId];
    this.entries = this.positionsByYear[year][positionId].entries;
  }

  @action
  closePositionYearSummaryAction() {
    this.showPositionYearEntries = false;
  }

  @action
  showPositionAllEntriesAction(positionId) {
    this.showPositionAllEntries = true;
    this.position = this.positionsById[positionId];
  }

  @action
  closePositionAllEntriesAction() {
    this.showPositionAllEntries = false;
  }

  @action
  showEntireYearAction(year) {
    this.showEntireYear = year;
    this.yearEntries = this.yearTotals[year].entries;
  }

  @action
  closeEntireYearAction() {
    this.showEntireYear = null;
  }
}
