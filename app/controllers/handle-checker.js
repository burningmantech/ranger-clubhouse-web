import Controller from '@ember/controller';
import EmberObject, { computed, observer } from '@ember/object';
import { HandleConflict } from '../utils/handle-conflict';
import {
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  EyeRhymeRule,
  FccRule,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule
} from '../utils/handle-rules';

let nextCheckId = 1;

const CheckedHandle = EmberObject.extend({
  conflicts: computed('allConflicts', 'controller.{handleRules,entityTypes}.@each.enabled', function() {
    const enabledRules = new Set(this.get('controller.handleRules').filterBy('enabled').mapBy('id'));
    const enabledEntities = new Set(this.get('controller.entityTypes').filterBy('enabled').mapBy('name'));
    return this.get('allConflicts').filter((c) => {
      if (c.conflictingHandle && !enabledEntities.has(c.conflictingHandle.entityType)) {
        return false;
      }
      return enabledRules.has(c.ruleId);
    });
  }),
});

export default Controller.extend({
  currentName: '',

  init() {
    this._super(...arguments);
    this.set('checkedHandles', []); // Array of {id string, name string, conflicts HandleConflict[]}
    this.set('allHandles', []); // Same Handle objects as model
  },

  /** Maps rule ID to {name string, rule object, enabled boolean} */
  handleRules: computed('model', function() {
    const handles = this.model.toArray();
    const rules = [];
    const addRule = (rule, name) => rules.pushObject(EmberObject.create({
      id: rule.id,
      name: name,
      rule: rule,
      enabled: true,
    }));
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

  ruleNames: computed('handleRules', function() {
    return this.get('handleRules').reduce((names, rule) => {
      names[rule.id] = rule.name;
      return names;
    }, {});
  }),

  entityTypes: computed('model', function() {
    return this.get('model').mapBy('entityType').uniq().sort().map((type) => EmberObject.create({
      id: type.dasherize(),
      name: type,
      enabled: true,
    }));
  }),

  allEnabledHandles: computed('allHandles', 'entityTypes.@each.enabled', function() {
    const enabled = new Set(this.get('entityTypes').filterBy('enabled').mapBy('name'));
    return this.get('allHandles').filter((handle) => enabled.has(handle.entityType));
  }),

  incrementallyBuildAllHandles: observer('model', function() {
    // Rendering 2500 handles takes a long time, so don't prevent interactivity.
    // Copy 100 handles at a time into allHandles and let the template
    // incrementally render them.  TODO there's probably a cleaner approach.
    let nextSize = 100;
    let incrementallyAdd = () => {
      let model = this.get('model');
      this.set('allHandles', model.slice(0, nextSize));
      if (this.get('allHandles').length < model.length) {
        nextSize += 100;
        setTimeout(incrementallyAdd, 0);
      }
    };
    setTimeout(incrementallyAdd, 0);
  }),

  actions: {
    /** Checks the currently-entered name against each rule and updates checkedHandles with the results. */
    checkCurrentName() {
      const name = this.currentName;
      const conflicts = [];
      const rules = Object.values(this.handleRules).map((obj) => obj.rule);
      const id = nextCheckId++;
      rules.map((rule) => conflicts.push(...rule.check(name)));
      conflicts.sort(HandleConflict.comparator);
      this.get('checkedHandles').unshiftObject(CheckedHandle.create({
        controller: this,
        id: id,
        name: name,
        allConflicts: conflicts,
      }));
      this.set('currentName', '');
    },

    /** Resets the list of checked handles. */
    clearCheckedHandles() {
      this.set('checkedHandles', []);
    },
  },

});
