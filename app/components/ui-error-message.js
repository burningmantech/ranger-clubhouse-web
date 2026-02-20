import Component from '@glimmer/component';

export default class UiErrorMessageComponent extends Component {
  get errorList() {
    const { error, errors } = this.args;
    if (errors) {
      return Array.isArray(errors) ? errors : [errors];
    }
    if (error) {
      // Ember Data errors may have a payload with errors array
      if (error.errors) {
        return error.errors.map((e) => e.detail ?? e.title ?? String(e));
      }
      return [String(error)];
    }
    return [];
  }
}