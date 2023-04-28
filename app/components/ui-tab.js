import Tab from 'ember-bootstrap/components/bs-tab';
import {action} from '@ember/object';
import {service} from '@ember/service';

/**
 * Extend the <BsTab /> component to fix a link bug.
 */

export default class UiTabComponent extends Tab {
  @service house;
  @service router;

  @action
  select(id, event) {
    event.preventDefault();
    super.select(id);

    // Record when the user clicks on a tab.
    const pane = this.childPanes.find((pane) => pane.id === this.isActiveId);
    const url = this.router.currentURL;
    const tab_title = pane ? pane.title : 'unknown';
    this.house.actionRecord('client-route-tab', {
      url,
      tab_title,
      tab_id: this.isActiveId
    }, `${url}#${this.isActiveId}`);
  }
}
