import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import $ from 'jquery';

const sidebarCollapse = function(event) {
  if (event) {
    event.preventDefault();
  }

  $('.menu-collapsed').toggleClass('d-none');
  $('.sidebar-submenu').toggleClass('d-none');
  $('.submenu-icon').toggleClass('d-none');
  $('#sidebar-container').toggleClass('sidebar-expanded sidebar-collapsed');
  //$('main').toggleClass('sidebar-offset-expanded sidebar-offset-collapsed');

  // Treating d-flex/d-none on separators with title
  var separatorTitle = $('.sidebar-separator-title');
  if (separatorTitle.hasClass('d-flex')) {
      separatorTitle.removeClass('d-flex');
  } else {
      separatorTitle.addClass('d-flex');
  }

  // Collapse/Expand icon
  $('#collapse-icon').toggleClass('fa-angle-double-left fa-angle-double-right');

  return false;
};

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
    $('[data-toggle=sidebar-colapse]').click(sidebarCollapse);
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    $('[data-toggle=sidebar-colapse]').unbind('click', sidebarCollapse);
  }
}
