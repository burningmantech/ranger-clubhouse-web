import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {DECEASED, AUDITOR, PAST_PROSPECTIVE, SUSPENDED} from "clubhouse/constants/person_status";
import { action } from '@ember/object';
import _ from 'lodash';

const CSV_COLUMNS = [
  { title: 'Callsign', key: 'callsign'},
  { title: 'Status', key: 'status'}
];

class ViewPosition {
  @tracked expanded = false;
  @tracked positionsScrollList;
  @tracked positions;

  constructor(obj) {
    Object.assign(this, obj);
  }

  get visiblePeople() {
    const statuses = this.statuses;
    const visibleStatuses = new Set(statuses.filterBy('selected').mapBy('name'));
    if (statuses.length === visibleStatuses.length) {
      return this.people;
    }
    return this.people.filter((p) => visibleStatuses.has(p.status));
  }

  get missingOnPlayaCount() {
    return this.missingPeople.reduce((total, p) => total + (p.on_site ? 1 : 0), 0);
  }
}

class SelectChoice {
  @tracked selected;

  constructor(name, selected) {
    this.name = name;
    this.selected = selected;
  }
}

export default class PeopleByPositionController extends ClubhouseController {
  queryParams = ['onPlaya'];
  onPlaya = false;

  get visiblePositions() {
    const selected = new Set(this.positionTypes.filterBy('selected').mapBy('name'));
    const positions = this.viewPositions;
    return positions.filter((p) => selected.has(p.type));
  }

  buildViewPositions() {
    const people = this.people;
    const lookupPeople = (ids) => ids ? _.sortBy(ids.map((id) => people[id]),'callsign') : [];
    this.viewPositions = _.sortBy(this.positions.map((position) =>
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
      })),'title');
  }

  buildPositionTypes() {
    this.positionTypes = _.uniq(_.map(this.positions, 'type'))
      .sort()
      .map((type) => new SelectChoice(type, true));
  }

  buildStatuses() {
    this.statuses = _.map(_.uniq(_.map(_.values(this.people), 'status')).sort(),
      (status) => new SelectChoice(status, status !== DECEASED && status !== AUDITOR && status !== PAST_PROSPECTIVE && status !== SUSPENDED));
  }

  @action
  exportToCSV(position) {
    this.house.downloadCsv(`${this.house.currentYear()}-${position.title.replace(/ /g, '-')}.csv`, CSV_COLUMNS, position.people);
  }
 }
