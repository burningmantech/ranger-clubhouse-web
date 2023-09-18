import Component from '@glimmer/component';
import { TypeLabels } from 'clubhouse/models/provision';

export default class VcMaintenaceCleanProvisionsComponent extends Component {
  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }
}
