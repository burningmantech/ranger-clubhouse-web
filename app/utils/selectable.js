import {tracked} from '@glimmer/tracking';

/**
 * Generic selectable wrapper. Copies all enumerable own-properties of `obj`
 * onto the instance (via Object.assign) and adds a tracked `selected` flag.
 *
 * Subclasses pass a domain record through super(obj); consumers read the
 * copied fields directly. For TeamMember the expected `obj` shape is:
 *   { id, callsign, status, is_member, positions: [{id, joined_on, worked_on,
 *     is_training, is_trainer}, ...] }
 * NOTE: copied fields are plain (non-tracked); only `selected` (and any
 * @tracked fields declared on subclasses) participate in reactivity.
 */
export default class Selectable {
  @tracked selected;

  constructor(obj, selected = false) {
    Object.assign(this, obj);
    this.selected = selected;
  }
}
