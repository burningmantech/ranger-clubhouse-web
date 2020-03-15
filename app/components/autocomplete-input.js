import Component from '@glimmer/component';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {run} from '@ember/runloop';

export default class AutocompleteInputComponent extends Component {
  @tracked isSearching = false;
  @tracked noResultsFound = false;
  @tracked selectionIdx = -1;
  @tracked options = [];
  @tracked isFocused = false;
  @tracked text = '';

  enterPressed = false;

  /**
   * Handle input into the search field.
   *
   * @param event
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

      if (this.enterPressed && options.length == 1) {
        this._selectOption(options[0]);
      }

      if (options.length == 0) {
        this.noResultsFound = true;
      }
    }).catch((response) => {
      // An undefined response means no search was done
      if (response != undefined) {
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
   * @param event
   */

  @action
  keyDownEvent(event) {
    const key = event.key;
    const oldSelection = this.selectionIdx;
    switch (key) {
      case 'ArrowUp':
        if (this.selectionIdx == -1) {
          // No selection yet.
          this.selectionIdx = 0;
        } else if (this.selectionIdx >= 1) {
          this.selectionIdx = this.selectionIdx - 1;
        }
        break;

      case 'ArrowDown':
        if (this.selectionIdx == -1) {
          // No selection yet.
          this.selectionIdx = 0;
        } else if (this.selectionIdx < (this.options.length - 1)) {
          this.selectionIdx = this.selectionIdx + 1;
        }
        break;

      case 'Enter':
        event.preventDefault();

        if (this.isSearching) {
          this.enterPressed = true;
        } else if (this.options) {
          if (this.options.length == 1) {
            this._selectOption(this.options[0]);
            // select this.
          } else if (this.selectionIdx != -1) {
            this._selectOption(this.options[this.selectionIdx]);
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (this.isFocused) {
          this.inputElement.blur();
        }
        break;
    }

    // Scroll selected item into view
    if (oldSelection != this.selectionIdx) {
      this.resultsElement.querySelector(`[data-result-id="${this.selectionIdx}"]`).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
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
      run('afterRender', () => {
        this.isFocused = false;
      })
    }, 100);
  }

  @action
  clickSelection(option) {
    this._selectOption(option);
  }

  _selectOption(option) {
    const onSelect = this.args.onSelect;
    if (!onSelect) {
      return;
    }

    onSelect(option);
    this.isFocused = false;
    this.selectionIdx = -1;
    this.inputElement.blur();
  }

  /**
   * Track the input element when inserted into the dom
   * @param element
   */

  @action
  inputInsertElement(element) {
    this.inputElement = element;
  }

  /**
   * Callback to parent component when the mode has changed
   *
   * @param value selected mode value
   * @param event selection event.
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

  @computed('args.mode')
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

    run('afterRender', () => {
      element.style.left = `${this.inputElement.offsetLeft}px`;
      element.style.width = `${this.inputElement.offsetWidth}px`;
    });
  }

  /**
   * Stop tracking the soon-to-be-destroyed results box
   */

  @action
  resutsBoxDestroyEvent() {
    this.resultsElement = null;
  }
}
