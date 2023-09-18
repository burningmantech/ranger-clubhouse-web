import Component from '@glimmer/component';
import {TypeLabels} from "clubhouse/models/access-document";

export default class VcMaintenaceCleanAccessDocumentsComponent extends Component {
  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

}
