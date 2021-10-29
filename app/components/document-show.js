import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { NotFoundError} from '@ember-data/adapter/error'

export default class DocumentShowComponent extends Component {
  @service house;
  @service store;

  @tracked isLoading = false;
  @tracked document = null;
  @tracked documentBody = null;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.store.find('document', this.args.tag).then((result) => {
      this.document = result;
      this.documentBody = htmlSafe(this.document.body);
      if (this.args.onLoad) {
        this.args.onLoad();
      }
    }).catch((response) => {
      if (response instanceof NotFoundError) {
        this.documentBody = htmlSafe(`<b class="text-danger">Document tag [${this.args.tag}] not found.</b>`);
      } else {
        this.house.handleErrorResponse(response);
      }
    })
      .finally(() => this.isLoading = false);
  }
}
