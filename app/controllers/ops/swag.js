import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {
  TypeOptions, ShirtTypeOptions,
  TYPE_DEPT_PATCH, TYPE_DEPT_PIN, TYPE_DEPT_SHIRT, TYPE_ORG_PATCH, TYPE_ORG_PIN
} from 'clubhouse/models/swag';

export default class OpsSwagController extends ClubhouseController {
  @tracked entry = null;
  @tracked swags;

  typeOptions = TypeOptions;
  shirtTypeOptions = ShirtTypeOptions;

  @cached
  get swagTables() {
    const tables = {
      deptPatches: [],
      deptPins: [],
      deptShirts: [],
      orgPatches: [],
      orgPins: [],
      other: []
    };

    this.swags.forEach((swag) => {
      switch (swag.type) {
        case TYPE_DEPT_PATCH:
          tables.deptPatches.push(swag);
          break;
        case TYPE_DEPT_PIN:
          tables.deptPins.push(swag);
          break;
        case TYPE_DEPT_SHIRT:
          tables.deptShirts.push(swag);
          break;
        case TYPE_ORG_PATCH:
          tables.orgPatches.push(swag);
          break;
        case TYPE_ORG_PIN:
          tables.orgPins.push(swag);
          break;
        default:
          tables.other.push(swag);
          break;
      }
    });

    return tables;
  }

  @action
  newSwag() {
    this.entry = this.store.createRecord('swag');
  }

  @action
  editSwag(swag) {
    this.entry = swag;
  }

  @action
  removeSwag() {
    this.modal.confirm('Delete Swag', `Are you sure you wish to delete "${this.entry.title}"? This operation cannot be undone.`, () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('The swag has been deleted.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  saveSwag(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The swag has been ${model.isNew ? 'created' : 'updated'}.`, () => {
      this.entry = null;
      this.swags.update(); // refresh the lists.
    });
  }

  @action
  cancelSwag() {
    this.entry = null;
  }
}
