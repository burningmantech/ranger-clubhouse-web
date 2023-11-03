import Component from '@glimmer/component';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence,} from 'ember-changeset-validations/validators';

export default class PositionLineupComponent extends Component {
  @tracked entry;
  @tracked isSubmitting = false;

  @service house;
  @service store;

  validations = {
    description: [validatePresence({presence: true, message: 'Enter a lineup description.'})],
  };

  @action
  newEntry() {
    this.entry = this.store.createRecord('position-lineup');
  }

  @action
  async editEntry(entry) {
    try {
      this.isSubmitting = true;
      await entry.reload();
      this.entry = entry;
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancel() {
    this.entry = null;
  }

  get positionOptions() {
    return this.args.positions.map((p) => [p.active ? p.title : `${p.title} [inactive]`, +p.id]);
  }

  @action
  async save(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await model.save();
      this.args.positionLineups.update();
      this.entry = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
