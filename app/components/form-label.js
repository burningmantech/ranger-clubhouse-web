import Component from '@glimmer/component';

export default class FormLabelComponent extends Component {
  get labelClasses() {
    const { fixed, fixedSmall, auto, class: className, size } = this.args;

    const classes=[];

    if (fixed || fixedSmall || auto) {
      classes.push('col-form-label');
      if (fixed) {
        classes.push('col-form-label-fixed')
      } else if (fixedSmall) {
        classes.push('col-form-label-fixed-small')
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
