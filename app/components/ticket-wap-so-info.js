import Component from '@glimmer/component';
import {set} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import Changeset from 'ember-changeset';
import {fadeOut, fadeIn} from 'ember-animated/motions/opacity';
import {inject as service} from '@ember/service';

import moment from 'moment';

export default class TicketWapSoInfoComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSaved = false;
  @tracked wapSOList;
  @tracked wapSOCount;

  constructor() {
    super(...arguments);

    this.defaultDate = moment(this.args.ticketingInfo.wap_so_default_date);
    this.buildWAPSOList();
  }

  buildWAPSOList() {
    const info = this.args.ticketingInfo;
    const defaultDate = this.defaultDate;

    const list = this.args.ticketPackage.wapso.map((row) => {
      return new Changeset({
        id: row.id,
        name: row.name,
        access_date: (row.access_date || defaultDate)
      });
    });

    // Pad out to the max
    const max = info.wap_so_max;

    while (list.length < max) {
      list.push(new Changeset({id: 'new', name: '', access_date: defaultDate}));
    }

    this.wapSOList = list;
    this.wapSOCount = this.args.ticketPackage.wapso.length;
  }

  get isSOListDirty() {
    return !!this.wapSOList.find((so) => so.isDirty);
  }

  // Update the SO WAP list - this is special cased since
  // multiple tickets are involved, *and* WAP SO tickets may be
  // created on the fly.

  @action
  saveSONamesAction() {
    const names = [];

    // Grab the name for a new record, or any name value (blank or not)
    // for an existing ticket
    this.wapSOList.forEach((row) => {
      const {id, name} = row;
      if (!isEmpty(name)) {
        set(row, 'name', name.trim());
      }

      if ((id === 'new' && !isEmpty(name)) || id !== 'new') {
        names.push({id, name});
      }
    });

    this.toast.clear();
    this.ajax.request(`ticketing/${this.args.person.id}/wapso`, {method: 'PATCH', data: {names}})
      .then((result) => {
        // Update the list
        set(this.args.ticketPackage, 'wapso', result.names);
        this.buildWAPSOList();
        this.toast.success('Your Significant Other Work Access Passes have been sucessfully updated.');
        this.isSaved = true;
      }).catch((response) => this.house.handleErrorResponse(response));
  }

  * transition({insertedSprites, removedSprites}) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
