import Component from '@ember/component';
import $ from 'jquery';

const tabShow = function (e) {
  e.preventDefault()
  $(this).tab('show')
};

export default class TabsHelperComponent extends Component {
  tabid =  null;

  didRender() {
    $('#'+this.tabid+' a').click(tabShow);
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    $('#'+this.tabid+' a').unbind('click', tabShow);
  }
}
