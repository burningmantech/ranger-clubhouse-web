import Component from '@glimmer/component';
import buildAddressForClipboard from "clubhouse/utils/build-address-for-clipboard";

export default class PersonSimpleFormComponent extends Component {
  get homeAddressText() {
    return buildAddressForClipboard(this.args.person);
  }
}
