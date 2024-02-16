import Component from '@glimmer/component';
import { StatusLabels} from "clubhouse/models/prospective-application";

export default class VcApplicationRelatedComponent extends Component {
  statusLabel(status) {
    return StatusLabels[status] ?? `Bug: ${status}`;
  }
}
