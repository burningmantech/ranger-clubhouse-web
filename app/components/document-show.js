import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { NotFoundError} from '@ember-data/adapter/error'

export default class DocumentShowComponent extends Component {
  @service errors;
  @service store;

  @tracked isLoading = false;
  @tracked document = null;
  @tracked documentBody = null;

  constructor() {
    super(...arguments);

    this._loadDocument();
  }

  async _loadDocument() {
    this.isLoading = true;
    this.store.unloadAll('document');
    try {
      this.document = await this.store.queryRecord('document', {tag: this.args.tag});
      this.documentBody = htmlSafe(this.document.body);
      if (this.args.onLoad) {
        this.args.onLoad();
      }
    } catch (response) {
      if (response instanceof NotFoundError) {
        this.documentBody = htmlSafe(`<b class="text-danger">Document tag [${this.args.tag}] not found.</b>`);
      } else {
        this.errors.handleErrorResponse(response);
      }
    } finally {
      this.isLoading = false;
    }
  }
}
