import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonWorkHistoryController extends ClubhouseController {
  @tracked showPositionYearEntries = false;
  @tracked showPositionAllEntries = false;
  @tracked showYear = false;

  @tracked showEntireYear = false;
  @tracked yearEntries = [];
  @tracked position = [];
  @tracked entries = [];

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
  showEntireYearAction(year){
    this.showEntireYear = year;
    this.yearEntries = this.yearTotals[year].entries;
  }

  @action
  closeEntireYearAction() {
    this.showEntireYear = null;
  }

}
