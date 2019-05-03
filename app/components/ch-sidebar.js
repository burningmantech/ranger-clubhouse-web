import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import { action } from '@ember/object';
import $ from 'jquery';

@classNames('sidebar-expanded', 'd-none', 'd-md-block', 'd-print-none')
export default class ChSidebarComponent extends Component {
  elementId = 'sidebar-container';

  didInsertElement() {
    super.didInsertElement(...arguments);

    // Hide submenus
    $('#body-row .collapse').collapse('hide');

    // Collapse/Expand icon
    $('#collapse-icon').addClass('fa-angle-double-left');

    // Collapse click
    $('[data-toggle=sidebar-colapse]').click(this.sidebarCollapse);

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

    this.house.setKey('sidebarCollapse', collapsed);

    return false;
  }
}
