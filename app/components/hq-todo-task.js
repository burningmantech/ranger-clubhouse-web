import Component from '@glimmer/component';

/**
 * Renders a single HQ to-do task line with a status icon, status color, and
 * an optional blink animation for the active task.
 *
 * The visual appearance is driven entirely by the @todo task's state:
 *
 *   - ignore    -> banned icon, muted text
 *   - completed -> check icon, success text
 *   - otherwise -> open circle icon (regular style), optionally blinking
 */
export default class HqTodoTaskComponent extends Component {
  /**
   * The Font Awesome icon name for the task's current state.
   *
   * @returns {string}
   */
  get iconName() {
    const {todo} = this.args;
    if (todo.ignore) {
      return 'ban';
    }
    if (todo.completed) {
      return 'check';
    }
    return 'circle';
  }

  /**
   * The Font Awesome style for the icon. Undefined falls back to the solid
   * style within the fa-icon helper, matching the original markup.
   *
   * @returns {string|undefined}
   */
  get iconType() {
    const {todo} = this.args;
    return (todo.ignore || todo.completed) ? undefined : 'far';
  }

  /**
   * The text color / blink class(es) applied to the task line.
   *
   * @returns {string}
   */
  get statusClass() {
    const {todo} = this.args;
    if (todo.ignore) {
      return 'text-muted';
    }
    if (todo.completed) {
      return 'text-success';
    }
    return todo.blink ? 'hq-todo-blink' : '';
  }
}
