import Component from '@glimmer/component';
import {ECHELON} from "clubhouse/constants/person_status";
import {isEmpty} from "lodash";
import {cached} from '@glimmer/tracking';
import {ADMIN, CAN_FORCE_SHIFT} from "clubhouse/constants/roles";
import {service} from '@ember/service';

export default class ShiftCheckInAlerts extends Component {
  @service session;

  constructor() {
    super(...arguments);

    this.userCanForceCheckIn = this.session.hasRole([ADMIN, CAN_FORCE_SHIFT]);
  }

  @cached
  get hasTrainingNoRequiredPositions() {
    return !!this.args.positions.find((p) => isEmpty(p.blockers));
  }

  @cached
  get trainingNotPassed() {
    if (this.args.person.status === ECHELON) {
      return false;
    } else {
      return !this.args.eventInfo.in_person_training_passed;
    }
  }
}
