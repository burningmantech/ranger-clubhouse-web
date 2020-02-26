import Controller from '@ember/controller';
import {action} from '@ember/object';

export default class PersonUnifiedFlaggingController extends Controller {
  @action
  noteSubmitted() {
    this._reloadHistory();
  }

  @action
  savePersonAction(model, isValid) {
    if (!isValid) {
      return;
    }

    model.save().then(() => this.toast.success('Person successfully saved'))
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  toggleBlackFlag() {
    const flag = !this.history.black_flag;
    this.modal.confirm('Confirm Black Flag Action',
      `Are you REALLY sure you want to ${flag ? 'SET' : 'CLEAR'} the ${this.year} Black Flag?`,
      () => {
        this.ajax.request(`intake/${this.person.id}/black-flag`, {
          method: 'POST',
          data: {year: this.year, black_flag: flag ? 1 : 0}
        })
          .then(() => {
            this._reloadHistory();
            this.toast.success(`The black flag has been ${flag ? 'SET' : 'CLEARED'}.`);
          })
          .catch((response) => this.house.handleErrorResponse(response));
      });
  }

  _reloadHistory() {
    this.ajax.request(`intake/${this.person.id}/history`, {method: 'GET', data: {year: this.year}})
      .then((result) => this.set('history', result.person))
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
