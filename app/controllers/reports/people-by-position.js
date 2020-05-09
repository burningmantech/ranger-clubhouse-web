import Controller from '@ember/controller';
import {later} from '@ember/runloop';
import EmberObject from '@ember/object';
import {action, computed} from '@ember/object';
import _ from 'lodash';
import {tracked} from '@glimmer/tracking';

class ViewPosition extends EmberObject {
  @tracked expanded = false;

  @computed('statuses.@each.selected', 'people')
  get visiblePeople() {
    const statuses = this.statuses;
    const visibleStatuses = new Set(statuses.filterBy('selected').mapBy('name'));
    if (statuses.length === visibleStatuses.length) {
      return this.people;
    }
    return this.people.filter((p) => visibleStatuses.has(p.status));
  }

  @computed('missingPeople')
  get missingOnPlayaCount() {
    return this.missingPeople.filterBy('on_site').length;
  }
}

export default class PeopleByPositionController extends Controller {
  queryParams = ['onPlaya'];
  onPlaya = false;

  @computed('people', 'positions', 'statuses')
  get viewPositions() {
    const people = this.people;
    const lookupPeople = (ids) => ids ? ids.map((id) => people[id]).sortBy('callsign') : [];
    return this.positions.map((position) =>
      ViewPosition.create({
        id: position.id,
        title: position.title,
        type: position.type,
        allRangers: position.all_rangers,
        allPeople: position.new_user_eligible,
        totalPeople: position.num_people,
        onPlayaCount: position.num_on_site,
        people: lookupPeople(position.personIds),
        missingPeople: lookupPeople(position.missingPersonIds),
        statuses: this.statuses,
      }))
      .sortBy('title');
  }

  @computed('positions')
  get positionTypes() {
    return this.positions.mapBy('type').uniq().sort()
      .map((type) => EmberObject.create({name: type, selected: true}));
  }

  @computed('viewPositions', 'positionTypes.@each.selected')
  get visiblePositions() {
    const selected = new Set(this.positionTypes.filterBy('selected').mapBy('name'));
    const positions = this.viewPositions;
    return selected.size === 0 ? positions : positions.filter((p) => selected.has(p.type));
  }

  @computed('people')
  get statuses() {
    return _.map(_.uniq(_.map(_.values(this.people), 'status')).sort(),
      (status) =>{ return {name: status, selected: true} });
  }

  @action
  toggleExpanded(position) {
    position.expanded = !position.expanded;
  }

  @action
  expandAllPositions(expanded) {
    // Expand or collapse all iteratively asynchronously because rendering the contents takes awhile
    const positions = this.viewPositions;
    const advance = (i) => (() => {
      if (i < positions.length) {
        positions[i].expanded = expanded;
        later(advance(i + 1), 1);
      }
    });
    later(advance(0), 1);
  }
}
