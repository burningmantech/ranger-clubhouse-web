import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonWorkHistoryController extends Controller {
  @tracked showPositionYearEntries = false;
  @tracked showPositionAllEntries = false;

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
}
