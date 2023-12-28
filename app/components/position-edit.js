import Component from '@glimmer/component';
import PositionTypes from 'clubhouse/constants/position-types';
import PositionValidations from 'clubhouse/validations/position';
import {
  TEAM_CATEGORY_ALL_MEMBERS,
  TEAM_CATEGORY_OPTIONAL,
  TEAM_CATEGORY_PUBLIC,
  TYPE_TRAINING
} from "clubhouse/models/position";
import { service } from '@ember/service';

export default class PositionEditComponent extends Component {
  @service house;

  positionTypes = PositionTypes;
  positionValidations = PositionValidations;

  categoryOptions = [
    ['Recommended to all new & existing members', TEAM_CATEGORY_ALL_MEMBERS],
    ['Optional - membership required', TEAM_CATEGORY_OPTIONAL],
    ['Public - available to anyone', TEAM_CATEGORY_PUBLIC]
  ];

  constructor() {
    super(...arguments);

    this.teamPositionOptions = [
      ['-', null]
    ];

    this.args.teams.forEach((team) => this.teamPositionOptions.push([team.title, team.id]));

    this.trainingOptions = [
      ['-', '']
    ];

    this.args.positions.forEach((position) => {
      if (position.type === TYPE_TRAINING && !position.title.match(/\btrainer\b/i)) {
        this.trainingOptions.push([position.title, position.id]);
      }
    });

    this.house.scrollToTop();
  }
}
