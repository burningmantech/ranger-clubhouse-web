import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import Selectable from "clubhouse/utils/selectable";
import _ from 'lodash';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'}
];

class ViewPosition {
  @tracked expanded = false;
  @tracked positionsScrollList;
  @tracked positions;
  @tracked positionTypes;

  constructor(obj) {
    Object.assign(this, obj);
  }

  @cached
  get visiblePeople() {
    const statuses = this.statuses;
    const visibleStatuses = new Set(statuses.filter((s) => s.selected).map((s) => s.name));
    if (statuses.length === visibleStatuses.length) {
      return this.people;
    }
    return this.people.filter((p) => visibleStatuses.has(p.status));
  }

  @cached
  get missingOnPlayaCount() {
    return this.missingPeople.reduce((total, p) => total + (p.on_site ? 1 : 0), 0);
  }
}

export default class PeopleByPositionController extends ClubhouseController {
  queryParams = ['onPlaya'];
  @tracked onPlaya = false;
  @tracked statuses;
  @tracked showMatch = false;

  @cached
  get visiblePositions() {
    const selected = new Set(this.positionTypes.filter((p) => p.selected).map((p) => p.name));
    const positions = this.viewPositions;
    return positions.filter((p) => selected.has(p.type) && (!this.showMatch || p.visiblePeople.length));
  }

  @cached
  get viewPositions() {
    const people = this.people;
    const lookupPeople = (ids) => ids ? _.sortBy(ids.map((id) => people[id]), 'callsign') : [];
    return _.sortBy(this.positions.map((position) =>
      new ViewPosition({
        id: position.id,
        title: position.title,
        active: position.active,
        type: position.type,
        allRangers: position.all_rangers,
        allPeople: position.new_user_eligible,
        totalPeople: position.num_people,
        onPlayaCount: position.num_on_site,
        people: lookupPeople(position.personIds),
        missingPeople: lookupPeople(position.missingPersonIds),
        statuses: this.statuses,
      })), 'title');
  }

  @cached
  get positionTypes() {
    return _.uniq(_.map(this.positions, 'type'))
      .sort()
      .map((type) => new Selectable({name: type}, true));
  }

  @action
  exportToCSV(position) {
    this.house.downloadCsv(`${this.house.currentYear()}-${position.title.replace(/ /g, '-')}.csv`, CSV_COLUMNS, position.people);
  }
}
