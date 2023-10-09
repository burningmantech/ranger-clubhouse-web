import Component from '@glimmer/component';
import {GENDER_CUSTOM, GenderIdentityLabels} from "clubhouse/models/person";
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class PersonalInfoViewComponent extends Component {
  @service house;

  @action
  shirtTitle(shirtId) {
    if (!shirtId) {
      return 'Unknown';
    }

    return !shirtId ? 'Unknown' : (this.args.shirtsById[shirtId]?.title ?? `Unknown Swag ID ${shirtId}`);
  }

  genderIdentityLabel(person) {
    switch (person.gender_identity) {
      case GENDER_CUSTOM:
        return person.gender_custom;
      default:
        return GenderIdentityLabels[person.gender_identity] ?? person.gender_identity;
    }
  }
}
