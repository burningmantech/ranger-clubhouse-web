import Component from '@glimmer/component';

export default class FormLabelComponent extends Component {
  get labelClasses() {
    const { fixed, auto, class: className, size } = this.args;

    const classes=[];

    if (fixed || auto) {
      classes.push('col-form-label');
      if (fixed) {
        classes.push('col-form-label-fixed')
      }
      if (auto) {
        classes.push('col-sm-12 col-lg-auto');
      }
    }

    if (size) {
      classes.push(`col-form-label-${size}`);
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  }
}
