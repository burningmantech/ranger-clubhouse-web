import Component from '@glimmer/component';
import { service } from '@ember/service';
import { SURVEY_MANAGEMENT, TRAINER, INTAKE } from "clubhouse/constants/roles";

export default class NavbarAreaTrainingComponent extends Component {
  @service session;

  get canManageSurveys() {
    return this.session.hasRole(SURVEY_MANAGEMENT);
  }

  get isTrainer() {
    return this.session.hasTrueRole(TRAINER);
  }

  get hasIntake() {
    return this.session.hasRole(INTAKE);
  }
}
