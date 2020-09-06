import Component from '@glimmer/component';
import * as Dashboard from 'clubhouse/constants/dashboard';

const ICONS = {
  [Dashboard.COMPLETED]: {name: 'check-circle'},
  [Dashboard.WAITING]: {name: 'hourglass-half'},
  [Dashboard.ACTION_NEEDED]: {name: 'arrow-right', color: 'success'},
  [Dashboard.NOT_AVAILABLE]: {name: 'circle', type: 'far'},
  [Dashboard.URGENT]: {name: 'exclamation-circle', color: 'danger'},
  [Dashboard.BLOCKED]: {name: 'times', color: 'danger'},
  [Dashboard.OPTIONAL]: {name: 'file-signature'},
  [Dashboard.NOTE]: {name: 'hand-point-right', type: 'far'},
};

export default class DashboardIconComponent extends Component {
  constructor() {
    super(...arguments);
    this.icon = ICONS[this.args.result];
  }
}
