import Component from '@glimmer/component';
import { TypeLabels }from 'clubhouse/models/provision';

export default class VcMaintenaceExpireProvisionsComponent extends Component {
  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }
}
