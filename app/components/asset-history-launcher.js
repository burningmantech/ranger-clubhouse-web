import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Single owner of the "Show Asset History" button + ModalAssetHistory modal,
 * replacing the duplicated showHistory/closeHistory pattern that previously
 * lived in both asset-checkout-form and asset-table.
 *
 * @assetId  - id of the asset whose history to show
 * @label    - button text (defaults to "History")
 * @type     - UiButton type (defaults to "secondary")
 * @size     - UiButton size (defaults to "sm")
 */
export default class AssetHistoryLauncherComponent extends Component {
  @tracked showHistory = false;

  get label() {
    return this.args.label ?? 'History';
  }

  get type() {
    return this.args.type ?? 'secondary';
  }

  get size() {
    return this.args.size ?? 'sm';
  }

  @action
  open() {
    this.showHistory = true;
  }

  @action
  close() {
    this.showHistory = false;
  }
}
