import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class MeAgreementsController extends ClubhouseController {
  @tracked showAgreementForSigning;
  @tracked showAgreementToView;
  @tracked showTeam;

  @tracked agreements;
  @tracked teams;

  @action
  reviewAgreementToSign(agreement) {
    this.house.scrollToTop();
    this.showAgreementForSigning = agreement;
  }

  @action
  closeAgreementToSign(signed) {
    this.showAgreementForSigning.signed = signed;
    this.showAgreementForSigning = null;
  }

  @action
  showAgreement(agreement) {
    this.house.scrollToTop();
    this.showAgreementToView = agreement;
  }

  @action
  closeAgreementView() {
    this.showAgreementToView = null;
  }

  @action
  openTeamDocument(team) {
    this.house.scrollToTop();
    this.showTeam = team;
  }

  @action
  closeTeamDocument() {
    this.showTeam = null;
  }
}
