import Component from '@glimmer/component';
import {GenderIdentityOptions} from 'clubhouse/models/person';

export default class MePiiGeneralComponent extends Component {
  genderIdentityOptions = GenderIdentityOptions;
}
