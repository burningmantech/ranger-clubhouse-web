import Tab from 'ember-bootstrap/components/bs-tab';
import { action }from '@ember/object';

/**
 * Extend the <BsTab /> component to fix a link bug.
 */

export default class UiTabComponent extends Tab {
  @action
  select(id, event){
    event.preventDefault();
    super.select(id);
  }
}
