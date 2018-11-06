import Controller from '@ember/controller';
import { computed } from '@ember/object';
import {
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  EyeRhymeRule,
  FccRule,
  HandleConflict,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule
} from '../utils/handle-rules';

let nextCheckId = 1;

export default Controller.extend({
  currentName: '',
  checkedHandles: null, // Array of {id string, name string, conflicts HandleConflict[]}

  init() {
    this._super(...arguments);
    this.checkedHandles = []; // default properties can't be objects or arrays for some reason
  },

  /** Maps rule ID to {name string, rule object, enabled boolean} */
  handleRules: computed('model', function() {
    const handles = this.model.toArray();
    const rules = {};
    const addRule = (rule, name) => rules[rule.id] = {name: name, rule: rule, enabled: true};
    addRule(new MinLengthRule(), 'Minimum Length');
    addRule(new FccRule(), 'FCC naughty words');
    addRule(new PhoneticAlphabetRule(handles), 'Phonetic alphabet');
    addRule(new SubstringRule(handles), 'Substring');
    addRule(new EditDistanceRule(handles), 'Edit distance');
    addRule(new AmericanSoundexRule(handles), 'American Soundex');
    addRule(new DoubleMetaphoneRule(handles), 'Double Metaphone');
    addRule(new EyeRhymeRule(handles), 'Eye rhymes');
    return rules;
  }),

  // TODO support filtering by handle entity types; might need a helper since hbs doesn't
  // natively have "if x or y" for "conflict doesn't have an entity type or entity type in enabled"

  actions: {
    /** Checks the currently-entered name against each rule and updates checkedHandles with the results. */
    checkCurrentName() {
      const name = this.currentName;
      const conflicts = [];
      const rules = Object.values(this.handleRules).map((obj) => obj.rule);
      const id = nextCheckId++;
      rules.map((rule) => conflicts.push(...rule.check(name)));
      conflicts.sort(HandleConflict.comparator);
      this.checkedHandles.unshiftObject({id: id, name: name, conflicts: conflicts});
      this.set('currentName', '');
    },

    /** Resets the list of checked handles. */
    clearCheckedHandles() {
      this.set('checkedHandles', []);
    },
  },

});
