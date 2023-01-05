import Component from '@glimmer/component';
import {ShirtTypeLabels} from 'clubhouse/models/swag';

export default class SwagTableComponent extends Component {
  shirtLabel(swag) {
    return swag.shirt_type ? ShirtTypeLabels[swag.shirt_type] : '-';
  }
}
