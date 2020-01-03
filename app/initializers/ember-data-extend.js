import Model from '@ember-data/model';

export default {
  name: 'ember-data-extend',

  initialize: function() {
    Model.reopen({
      save() {
        return this._super(...arguments).then(() => {
          if (this.onSaved) {
            this.onSaved(this);
          }
        });
      }
    });
  }
};
