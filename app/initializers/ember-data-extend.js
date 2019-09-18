import DS from 'ember-data';

export default {
  name: 'ember-data-extend',

  initialize: function() {
    DS.Model.reopen({
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
