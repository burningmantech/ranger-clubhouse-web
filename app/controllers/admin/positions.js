import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import PositionTypes from 'clubhouse/constants/position-types';
import {ADMIN} from 'clubhouse/constants/roles';
import {ATTR_LABELS, TYPE_FRONTLINE} from 'clubhouse/models/position';
import _ from 'lodash';
import {later} from '@ember/runloop';

export default class AdminPositionsController extends ClubhouseController {
  @tracked positions;
  @tracked positionLineups;
  @tracked roles;
  @tracked teams;

  @tracked position = null;

  @tracked typeFilter;
  @tracked activeFilter;
  @tracked allRangersFilter;
  @tracked viewAs;
  @tracked attrFilters;

  typeOptions = ['All', ...PositionTypes];

  activeOptions = [
    {id: 'all', title: 'All'},
    {id: 'active', title: 'Active'},
    {id: 'inactive', title: 'Inactive'},
  ];

  allRangersOptions = [
    ['All', 'all'],
    ['All Rangers', 'all-rangers'],
    ['Not-All Rangers', 'not']
  ];

  viewAsOptions = [
    ['List', 'list'],
    ['Teams', 'teams']
  ];

  attrOptions = ATTR_LABELS;

  constructor() {
    super(...arguments);
    this.resetFilters();
  }

  resetFilters() {
    this.typeFilter = 'All';
    this.activeFilter = 'all';
    this.allRangersFilter = 'all';
    this.viewAs = 'list';
    this.attrFilters = [];
  }

  get canManagePositions() {
    return this.session.hasRole(ADMIN);
  }

  @cached
  get teamById() {
    return _.keyBy(this.teams, 'id');
  }

  @cached
  get roleById() {
    return _.keyBy(this.roles, 'id');
  }

  @cached
  get roleOptions() {
    return this.roles.map(({id, title}) => ({id, title}));
  }

  @cached
  get viewPositions() {
    const {typeFilter, activeFilter, allRangersFilter, attrFilters} = this;
    const tests = [];

    if (typeFilter !== 'All') {
      tests.push((p) => p.type === typeFilter);
    }

    if (activeFilter === 'active') {
      tests.push((p) => p.active);
    } else if (activeFilter === 'inactive') {
      tests.push((p) => !p.active);
    }

    if (allRangersFilter === 'all-rangers') {
      tests.push((p) => p.all_rangers);
    } else if (allRangersFilter === 'not') {
      tests.push((p) => !p.all_rangers);
    }

    if (attrFilters.length) {
      tests.push((p) => attrFilters.every((attr) => p[attr]));
    }

    return this.positions.filter((p) => tests.every((test) => test(p)));
  }

  @cached
  get viewByTeams() {
    const byTeamId = _.groupBy(this.viewPositions, 'team_id');
    // A position is "general" when it has no team, or references a team that no longer exists.
    const general = this.viewPositions.filter((p) => !p.team_id || !this.teamById[p.team_id]);

    return [
      {title: 'General Positions / Unassociated with Team', team_positions: general},
      ...this.teams.map((team) => ({
        id: team.id,
        title: team.title,
        team_positions: byTeamId[team.id] ?? [],
      })),
    ];
  }

  @cached
  get positionScrollItems() {
    return this.viewPositions.map((p) => ({id: `position-${p.id}`, title: p.title}));
  }

  @cached
  get teamScrollList() {
    return this.viewByTeams
      .filter((team) => team.id)
      .map((team) => ({id: `team-${team.id}`, title: team.title}));
  }

  @action
  newAction() {
    this.position = this.store.createRecord('position', {type: TYPE_FRONTLINE});
  }

  @action
  editAction(position) {
    this.position = position;
  }

  @action
  deleteAction() {
    const {position} = this;
    this.modal.confirm(`Confirm Deleting "${position.title}"`,
      'By deleting this position important historical information will be lost. Are you sure you want to do this?',
      async () => {
        try {
          await position.destroyRecord();
          this.toast.success('The position has been deleted.');
          this.position = null;
          this.house.scrollToTop(true);
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
  }

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;
    this.house.saveModel(model, `The position has been ${isNew ? 'created' : 'updated'}.`, async () => {
      try {
        if (isNew) {
          await this.positions.update(); // re-query so the new position appears in the list
        }
        this._scrollToPosition(this.position.id);
        this.position = null;
      } catch (response) {
        this.house.handleErrorResponse(response);
      }
    });
  }

  @action
  cancelAction() {
    const {position} = this;
    this.position = null;

    if (position.isNew) {
      position.unloadRecord();
      this.house.scrollToTop(true);
    } else {
      this._scrollToPosition(position.id);
    }
  }

  @action
  updateAttrFilters(flags) {
    this.attrFilters = flags;
  }

  _scrollToPosition(positionId) {
    // Let the list re-render before scrolling to the row.
    later(() => this.house.scrollToElement(`#position-${positionId}`, true), 100);
  }
}
