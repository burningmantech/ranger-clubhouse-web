import Component from '@glimmer/component';
import {action,set} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import { inject as service } from '@ember/service';

/*
* For debugging purposes ONLY
*/

export default class DashboardDebuggingComponent extends Component {
  @service house;
  @service session;
  @service ajax;

  @tracked showDebugging = false;

  @action
  photoStatus(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, {method: 'POST', data: {photo_status: status}}).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  onlineTraining(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, {method: 'POST', data: {online_training: status}}).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  clearBehavioralAgreement() {
    const person = this.args.person;

    person.set('behavioral_agreement', false);
    person.save().then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));

  }

  @action
  clearPIReview() {
    const person = this.args.person;

    person.set('has_reviewed_pi', false);
    person.save().then(() => {
      set(this.args.milestones, 'has_reviewed_pi', false);
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));

  }

  @action
  training(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, {method: 'POST', data: {training: status}}).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  alphaShift(status) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, {method: 'POST', data: {alpha: status}}).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  goBoom(act) {
    const person = this.args.person;

    this.ajax.request(`person/${person.id}/onboard-debug`, {method: 'POST', data: {action: act}}).then(() => {
      this._reloadPage();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  toggleDebugging() {
    this.showDebugging = !this.showDebugging;
  }

  _reloadPage() {
    location.reload(true);
  }
}
