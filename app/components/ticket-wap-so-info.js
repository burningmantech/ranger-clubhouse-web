import Component from '@ember/component';
import { set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';
import Changeset from 'ember-changeset';

import moment from 'moment';

@tagName('')
export default class TicketWapSoInfoComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument('object') person;
  @argument(optional('object')) ticket;
  @argument('object') toggleCard;
  @argument('object') nextSection;
  @argument('object') showing;

  isSaved = false;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments)
  }

  @computed('wapSOList.@each.name')
  get wapSOCount() {
    return this.ticketPackage.wapso.length;
  }

  @computed('ticketingInfo.wap_so_default_date')
  get defaultDate() {
    return moment(this.ticketingInfo.wap_so_default_date);
  }

  @computed('wapSOList.@each.isDirty')
  get isSOListDirty() {
    return this.wapSOList.find((so) => so.isDirty) ? true : false;
  }

  @computed('ticketPackage.wapso.@each.{id,name}')
  get wapSOList() {
    const info = this.ticketingInfo;
    const defaultDate = this.defaultDate;

    const list = this.ticketPackage.wapso.map((row) => {
      return new Changeset({
        id: row.id,
        name: row.name,
        access_date: (row.access_date || defaultDate)
      });
    });

    // Pad out to the max
    const max = info.wap_so_max;

    while (list.length < max) {
      list.pushObject(new Changeset({id: 'new', name: '', access_date: defaultDate }));
    }

    return list;
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
      const name = row.get('name'), id = row.get('id');
      if (!isEmpty(name)) {
        set(row, 'name', name.trim());
      }

      if ((id == 'new' && !isEmpty(name)) || id != 'new') {
        names.push({ id, name });
      }
    });

    this.toast.clear();
    this.ajax.request(`ticketing/${this.person.id}/wapso`, {
      method: 'PATCH',
      data: { names }
    }).then((result) => {
      // Update the list
      this.set('ticketPackage.wapso', result.names);
      this.toast.success('Your Significant Other Work Access Passes have been sucessfully updated.');
      this.set('isSaved', true);
    }).catch((response) => this.house.handleErrorResponse(response));
  }

}
