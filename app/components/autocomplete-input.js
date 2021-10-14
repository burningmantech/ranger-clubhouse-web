import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {schedule} from '@ember/runloop';
import {inject as service} from '@ember/service';

export default class AutocompleteInputComponent extends Component {
  @service house;

  /**
   * Is a search running?
   * @type {boolean}
   */
  @tracked isSearching = false;

  /**
   * Set true if no results were found.
   * @type {boolean}
   */
  @tracked noResultsFound = false;

  /**
   * Item currently select (key up/down is used to 'select' the item)
   * @type {number}
   */
  @tracked selectionIdx = -1;

  /**
   * An array of strings containing the search results
   * @type {{string}[]}
   */
  @tracked options = [];

  /**
   * True if the search input field has focus.
   * @type {boolean}
   */
  @tracked isFocused = false;

  /**
   * What the user has typed.
   * @type {string}
   */
  @tracked text = '';

  /**
   * Has the enter key been pressed?
   * @type {boolean}
   */
  enterPressed = false;

  /**
   * Prevent multiple selection from happening when multiple events fire.
   * E.g., when a mousedown event happens the click event will follow - only
   * process the first event.
   *
   * @type {boolean}
   */
  hasSelected = false;

  get inputClass() {
    return this.args.inputClass || 'form-control autocomplete-input';
  }

  /**
   * Handle input into the search field.
   *
   * @param {InputEvent} event
   */
  @action
  inputEvent(event) {
    const value = event.target.value;

    this.text = value;
    this.isSearching = true;
    this.noResultsFound = false;
    this.isFocused = true;

    this.args.onSearch(value).then((options) => {
      this.options = options;
      this.selectionIdx = -1;

      // Choose the item if the enter key was pressed before the search completed.
      if (this.enterPressed && options.length === 1) {
        this._selectOption(options[0]);
      }

      if (!options.length) {
        this.noResultsFound = true;
      }
    }).catch((response) => {
      // An undefined response means no search was done
      if (response !== undefined) {
        this.house.handleErrorResponse(response);
      }
    })
      .finally(() => {
        this.isSearching = false;
        this.enterPressed = false;
      });
  }

  /**
   * When input field is focused, clear out the results, and let the parent know
   * focus was received.
   */

  @action
  focusEvent() {
    this.isFocused = true;
    this.selectionIdx = -1;
    this.options = [];
    if (this.args.onFocus) {
      this.args.onFocus();
    }
  }

  /**
   * Handle arrow {up/down}, escape and enter keys.
   *
   * Arrow {Up/Down} change the selected item
   * Enter:
   *     - if only one item, select that
   *     - if searching, delay until results are received, and if only one result, select that
   *     - if item selected, use that
   * @param {KeyboardEvent} event
   */

  @action
  keyUpEvent(event) {
    const key = event.key;
    const oldSelection = this.selectionIdx;

    switch (key) {
      case 'ArrowUp':
        if (this.selectionIdx === -1) {
          // No selection yet.
          this.selectionIdx = 0;
        } else if (this.selectionIdx >= 1) {
          this.selectionIdx = this.selectionIdx - 1;
        }
        break;

      case 'ArrowDown':
        if (this.selectionIdx === -1) {
          // No selection yet.
          this.selectionIdx = 0;
        } else if (this.selectionIdx < (this.options.length - 1)) {
          this.selectionIdx = this.selectionIdx + 1;
        }
        break;

      case 'Enter':
        if (this.isSearching) {
          this.enterPressed = true;
        } else if (this.options) {
          if (this.options.length === 1) {
            this._selectOption(this.options[0]);
          } else if (this.selectionIdx !== -1) {
            this._selectOption(this.options[this.selectionIdx]);
          }
        }
        break;

      case 'Escape':
        if (this.isFocused) {
          this.inputElement.blur();
        }
        break;

      default:
        return true;
    }

    event.stopPropagation();

    // Scroll selected item into view
    if (oldSelection != this.selectionIdx && this.resultsElement) {
      const item = this.resultsElement.querySelector(`[data-result-id="${this.selectionIdx}"]`);
      if (item) {
        item.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }

    return false;
  }

  /**
   * When the input element is blurred, clear out the results box after delaying.
   * Don't remove the results box before the user has had a change to click the link.
   */

  @action
  blurEvent() {
    if (!this.isFocused) {
      return;
    }
    setTimeout(() => {
      schedule('afterRender', () => {
        this.isFocused = false;
      })
    }, 100);
  }

  /**
   * Handle either a mousedown or click event on a result item.
   *
   * @param {object} option
   * @param {Event} event
   */

  @action
  clickSelection(option, event) {
    event.stopImmediatePropagation();
    this._selectOption(option);
    return false;
  }

  /**
   * Process the selected item. Callback to calling component, and blur the input element.
   *
   * @param {object} option
   * @private
   */

  _selectOption(option) {
    if (this.hasSelected) {
      return;
    }
    const onSelect = this.args.onSelect;
    if (!onSelect) {
      return;
    }

    onSelect(option);
    this.isFocused = false;
    this.hasSelected = true;
    this.selectionIdx = -1;
    this.inputElement.blur();
  }

  /**
   * Track the input element when inserted into the dom
   * @param {InputEvent} element
   */

  @action
  inputInsertElement(element) {
    this.inputElement = element;
  }

  /**
   * Callback to parent component when the mode has changed
   *
   * @param {string} value selected mode value
   * @param {MouseEvent} event selection event.
   */

  @action
  selectModeEvent(value, event) {
    event.preventDefault();
    if (this.args.onModeChange) {
      this.args.onModeChange(value);
    }
  }

  /**
   * Obtain the mode text for display.
   *
   * @returns {string}
   */

  get modeText() {
    const mode = this.args.mode;
    const opt = this.args.modeOptions.find((o) => o.value == mode);

    return opt ? opt.label : `Unknown ${mode}`;
  }

  /**
   * Adjust the results box position and width to match the input field.
   *
   * @param {Element} element
   */
  @action
  resutsBoxInsertedEvent(element) {
    this.resultsElement = element;

    schedule('afterRender', () => {
      element.style.left = `${this.inputElement.offsetLeft}px`;
      element.style.width = `${this.inputElement.offsetWidth}px`;
    });
  }

  /**
   * Stop tracking the soon-to-be-destroyed results box
   */

  @action
  resultsBoxDestroy() {
    this.resultsElement = null;
    this.hasSelected = false;
  }
}
