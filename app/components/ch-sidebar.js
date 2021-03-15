import Component from '@glimmer/component';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {inject as service} from '@ember/service';

const COLLAPSED_PREF = 'sidebarCollapsed';

export default class ChSidebarComponent extends Component {
  @service house;
  @service session;

  get themeClass() {
    return isEmpty(this.args.theme) ? 'default' : this.args.theme;
  }

  get renderAsDropdown() {
    return (this.session.isSmallScreen && !this.args.noSmallScreen);
  }

  @action
  sidebarInserted() {
    // Does the user want the sidebar collapsed?
    if (this.house.getKey(COLLAPSED_PREF)) {
      this.sidebarToggle();
    }
  }

  _toggleClass(selector, classNames) {
    const classes = classNames.split(' ');
    document.querySelectorAll(selector).forEach((element) => {
      classes.forEach((name) => element.classList.toggle(name));
    });
  }

  @action
  sidebarToggle() {
    // Adjust the sidebar width and style
    this._toggleClass('#sidebar-container', 'sidebar-expanded sidebar-collapsed');

    // Show or hide the group titles, link text, and ranger logo
    this._toggleClass('.sidebar-group-title', 'd-none');
    this._toggleClass('.sidebar-link-text', 'd-none')
    this._toggleClass('.sidebar-ranger-logo', 'd-none');

    // Collapse/Expand icon
    this._toggleClass('#collapse-icon', 'fa-angle-double-left fa-angle-double-right');

    // Save the collapsed preference
    this.house.setKey(COLLAPSED_PREF, !this.house.getKey(COLLAPSED_PREF));

    return false;
  }
}
