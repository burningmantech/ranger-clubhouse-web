import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty} from '@ember/utils';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default class ChSidebarComponent extends Component {
  @service house;

  get themeClass() {
    return isEmpty(this.args.theme) ? 'default' : this.args.theme;
  }

  @action
  sidebarInserted() {
    // Collapse/Expand icon
    $('#collapse-icon').addClass('fa-angle-double-left');

    // Does the user want the sidebar collapsed?
    if (this.house.getKey('sidebarCollapse')) {
      this.sidebarToggle();
    }
  }

  @action
  sidebarToggle() {
    let collapsed;

    $('.menu-collapsed').toggleClass('d-none');
    $('.sidebar-submenu').toggleClass('d-none');
    $('.submenu-icon').toggleClass('d-none');
    $('#sidebar-container').toggleClass('sidebar-expanded sidebar-collapsed');

    // Treating d-flex/d-none on separators with title
    var separatorTitle = $('.sidebar-separator-title');
    if (separatorTitle.hasClass('d-flex')) {
        separatorTitle.removeClass('d-flex');
        collapsed = true;
    } else {
        separatorTitle.addClass('d-flex');
        collapsed = false;
    }

    // Collapse/Expand icon
    $('#collapse-icon').toggleClass('fa-angle-double-left fa-angle-double-right');

    // Save the collapsed preference
    this.house.setKey('sidebarCollapse', collapsed);

    return false;
  }
}
