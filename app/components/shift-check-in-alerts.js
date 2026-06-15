import Component from '@glimmer/component';
import {ECHELON} from "clubhouse/constants/person_status";
import {isEmpty} from '@ember/utils';
import {cached} from '@glimmer/tracking';
import {ADMIN, CAN_FORCE_SHIFT} from "clubhouse/constants/roles";
import {service} from '@ember/service';

export default class ShiftCheckInAlerts extends Component {
  @service session;

  get userCanForceCheckIn() {
    return this.session.hasRole([ADMIN, CAN_FORCE_SHIFT]);
  }

  @cached
  get hasTrainingNoRequiredPositions() {
    const {positions = []} = this.args;
    return positions.some((p) => isEmpty(p.blockers));
  }

  @cached
  get trainingNotPassed() {
    return this.args.person?.status !== ECHELON && !(this.args.eventInfo?.in_person_training_passed ?? false);
  }
}
