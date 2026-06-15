import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class DocumentEdit extends Component {
  @service ajax;
  @service errors;
  @service storePayload;
  @service saveModel;
  @service modal;
  @service store;
  @service toast;

  @tracked isLoading;
  @tracked isDeleting;

  @tracked document;

  constructor() {
    super(...arguments);
    this._loadDocument();
  }

  async _loadDocument() {
    this.isLoading = true;
    try {
      const document = (await this.ajax.request('/document/resource-edit', {
        method: 'GET',
        data: {
          resource_type: this.args.type,
          resource_entity_id: this.args.entityId
        }
      })).document;

      this.document = document.id ? this.storePayload.pushPayload('document', document) : this.store.createRecord('document', document);
      this.isLoading = false;
    } catch (e) {
      this.errors.handleErrorResponse(e);
      this.args.onClose();
    }
  }

  @action
  async saveAction(model) {
    model.resource_type = this.args.type;
    model.resource_entity_id = this.args.entityId;
    if (await this.saveModel.save({model, message: 'Document has been successfully saved', owner: this})) {
      this.args.onClose();
    }
  }

  @action
  deleteAction() {
    this.modal.confirm('Confirm Deletion', 'Are you sure you want to delete this document?', async () => {
      try {
        this.isDeleting = true;
        await this.ajax.request('/document/resource-delete', {
          method: 'DELETE',
          data: {
            resource_type: this.args.type,
            resource_entity_id: this.args.entityId
          }
        })
        this.toast.success('Document deleted');
        this.args.onClose();
      } catch (e) {
        this.errors.handleErrorResponse(e);
        this.isDeleting = false;
      }
    })
  }
}
