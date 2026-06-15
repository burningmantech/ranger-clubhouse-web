import Component from '@glimmer/component';
import {service} from '@ember/service';
import PositionTypes from 'clubhouse/constants/position-types';
import PositionValidations from 'clubhouse/validations/position';
import {
  TEAM_CATEGORY_ALL_MEMBERS,
  TEAM_CATEGORY_OPTIONAL,
  TEAM_CATEGORY_PUBLIC,
  TYPE_TRAINING
} from 'clubhouse/models/position';
import {TECH_NINJA} from 'clubhouse/constants/roles';

const TRAINER_TITLE = /\btrainer\b/i;
const BLANK_OPTION = ['-', null];

export default class PositionEditComponent extends Component {
  @service scroll;
  @service session;

  positionTypes = PositionTypes;
  positionValidations = PositionValidations;

  categoryOptions = [
    ['Recommended to all new & existing members', TEAM_CATEGORY_ALL_MEMBERS],
    ['Optional - membership required', TEAM_CATEGORY_OPTIONAL],
    ['Public - available to anyone', TEAM_CATEGORY_PUBLIC]
  ];

  constructor() {
    super(...arguments);
    this.scroll.scrollToTop(true);
  }

  get isTechNinja() {
    return this.session.hasRole(TECH_NINJA);
  }

  get teamOptions() {
    return [BLANK_OPTION, ...this.args.teams.map((team) => [team.title, team.id])];
  }

  get trainingOptions() {
    const trainings = this.args.positions.filter(
      (p) => p.type === TYPE_TRAINING && !TRAINER_TITLE.test(p.title ?? '')
    );
    return [BLANK_OPTION, ...trainings.map((p) => [p.title, p.id])];
  }

  get parentPositionOptions() {
    const others = this.args.positions.filter((p) => p.id !== this.args.position.id);
    return [BLANK_OPTION, ...others.map((p) => [p.title, p.id])];
  }
}
