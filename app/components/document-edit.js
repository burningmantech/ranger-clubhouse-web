import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class DocumentEdit extends Component {
  @service ajax;
  @service house;
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

      this.document = document.id ? this.house.pushPayload('document', document) : this.store.createRecord('document', document);
      this.isLoading = false;
    } catch (e) {
      this.house.handleErrorResponse(e);
      this.args.onClose();
    }
  }

  @action
  async saveAction(model) {
    this.isSubmitting = true;
    try {
      model.resource_type = this.args.type;
      model.resource_entity_id = this.args.entityId;
      await model.save();
      this.toast.success('Document has been successfully saved');
      this.args.onClose();
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isSubmitting = false;
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
        this.house.handleErrorResponse(e);
        this.isDeleting = false;
      }
    })
  }
}
