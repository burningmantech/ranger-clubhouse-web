import Controller from '@ember/controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';

export default class AdminRbsMessageLogController extends Controller {
  queryParams = ['year', 'page', 'status', 'direction'];

  statusOptions = [
    {id: 'verify', title: 'Sent verify code'},
    {id: 'failed', title: 'Failed broadcast'},
    {id: 'sent', title: 'Sent message'},
    {id: 'start', title: 'Recevied start'},
    {id: 'stop', title: 'Received stop'},
    {id: 'help', title: 'Received help'},
    {id: 'stats', title: 'Received stats'},
    {id: 'next', title: 'Received next'},
  ];

  directionOptions = [
    {id: '', title: 'Any'},
    {id: 'inbound', title: 'Received messages'},
    {id: 'outbound', title: 'Sent messages'}
  ];

  @tracked page;
  @tracked year;
  @tracked status;
  @tracked direction;

  @action
  changeYearAction(year) {
    this.page = null;
    this.year = year;
  }

  @action
  goNextPage() {
    this.page = +this.currentPage + 1;
  }

  @action
  goPrevPage() {
    this.page = +this.currentPage - 1;
  }

  @action
  submitAction() {
    const form = this.searchForm;

    if (!isEmpty(form.status)) {
      this.status = form.status.join(',');
    } else {
      this.status = null;
    }
    this.direction = isEmpty(form.direction) ? null : form.direction;
    this.page = null;
  }
}
