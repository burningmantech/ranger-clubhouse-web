import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {POG_HALF_MEAL, POG_MEAL, POG_SHOWER, StatusOptions} from 'clubhouse/models/person-pog';

export default class PersonPogsComponent extends Component {
  @service house;
  @service modal;
  @service session;
  @service store;
  @service toast;

  @tracked entry;

  statusOptions = StatusOptions;
  pogOptions = [
    ['Full Meal Pog', POG_MEAL],
    ['1/2 Meal Pog', POG_HALF_MEAL],
    ['Shower Pog', POG_SHOWER],
  ];

  @action
  newEntry() {
    this.entry = this.store.createRecord('person-pog', {
      person_id: this.args.person.id,
      pog: POG_MEAL
    });
  }

  @action
  editEntry(entry) {
    this.entry = entry;
  }

  @action
  closeEntry() {
    this.entry = null;
  }

  @action
  saveEntry(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.entry.isNew;
    model.save().then(() => {
      if (isNew) {
        this.args.personPogs.update();
        this.toast.success('Pog successfully saved');
      }
      this.entry = null;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  deleteEntry() {
    this.modal.confirm('Delete Pog?', `Are you sure you want to delete this pog?`, () => {
      this.entry.destroyRecord().then(() => {
        this.entry = null;
        this.toast.success('Pog was successfully deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }
}
