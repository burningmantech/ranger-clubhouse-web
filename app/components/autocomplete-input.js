import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {debounce, schedule} from '@ember/runloop';
import {service} from '@ember/service';
import focusElement from "clubhouse/utils/focus-element";

const CLICK_DEBOUNCE_MS = 350;

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

  @tracked items = [];

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

  /**
   * Set by the search results, and shown at the top of the dropdown.
   */

  @tracked title;

  @tracked banner;
  @tracked sectionTitle;
  @tracked sections;
  @tracked sectionActive;

  /**
   * If the section button was clicked -- refocus input after blur
   * @type {boolean}
   */

  isRefocusing = false;

  get inputClass() {
    return this.args.inputClass || 'form-control autocomplete-input';
  }

  /**
   * Obtain the mode text for display.
   *
   * @returns {string}
   */

  get modeText() {
    const mode = this.args.mode;
    const opt = this.args.modeOptions.find((o) => o.value === mode);

    return opt ? opt.label : `Unknown ${mode}`;
  }

  /**
   * Return the text to show when no results were found.
   *
   * @returns {string}
   */

  get noResultsText() {
    return this.args.noResultsText ?? 'No results found';
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
    this._runSearch(this.args.onSearch(value));
  }

  async _runSearch(promise) {
    try {
      const results = await promise;
      const {sections} = results;
      this.banner = results.banner ?? null;
      if (sections) {
        this.sections = sections;
        this._setupSection(sections[0]);
      } else {
        this.sections = null;
        this._setupSection(results);
      }

      if (!this.items.length) {
        this.noResultsFound = true;
      } else {
        this.noResultsFound = false;
        if (this.enterPressed && this.items.length === 1) {
          // Choose the item if the enter key was pressed before the search completed.
          this._selectOption(this.items[0]);
        }
      }
    } catch (response) {
      // An undefined response means no search was done
      if (response !== undefined) {
        this.house.handleErrorResponse(response);
      }
    } finally {
      this.isSearching = false;
      this.enterPressed = false;
    }
  }

  @action
  selectSection(section, event) {
    event.stopPropagation();
    this._setupSection(section);
    this.isRefocusing = true;
    focusElement(this.inputElement);
  }

  _setupSection(section) {
    this.selectionIdx = -1;

    if (this.sectionActive) {
      this.sectionActive.active = false;
    }

    section.active = true;
    this.sectionActive = section;
    this.sectionTitle = section.sectionTitle ?? null;

    if ('groups' in section) {
      this.items = [];
      let index = 0;
      section.groups.forEach((group) => {
        group.items.forEach((item) => {
          item.index = index++;
          this.items.push(item);
        })
      });
      this.title = section.title;
      this.options = section.groups;
    } else {
      this.items = section;
      this.options = section;
    }
  }

  /**
   * When input field is focused, clear out the results, and let the parent know
   * focus was received.
   */

  @action
  focusEvent(event) {
    this.selectionIdx = -1;
    this.isFocused = true;
    this.hasSelected = false;

    if (this.isRefocusing) {
      // Refocusing.. don't rerun the event.
      this.isRefocusing = false;
      return;
    }

    // Safari prevent autocomplete hack.
    if (event.target.hasAttribute('autocomplete')) {
      event.target.removeAttribute('readonly');
    }

    if (this.args.focusBorder) {
      this.wrapperBlock.classList.add("autocomplete-focused");
    }

    if (this.args.form) {
      this.args.form.preventSubmit = true;
    }

    this.items = [];

    if (this.args.onFocus) {
      const promise = this.args.onFocus();
      if (promise) {
        this._runSearch(promise);
      }
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
        } else if (this.selectionIdx < (this.items.length - 1)) {
          this.selectionIdx = this.selectionIdx + 1;
        }
        break;

      case 'Enter':
        if (this.isSearching) {
          this.enterPressed = true;
        } else if (this.items.length === 1) {
          this._selectOption(this.items[0]);
        } else if (this.selectionIdx !== -1) {
          this._selectOption(this.items[this.selectionIdx]);
        }
        break;

      case 'Escape':
        if (this.isFocused) {
          this.inputElement.blur();
        }

        this.args.onEscape?.();
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
   *
   * @param {Event} event
   */

  @action
  blurEvent(event) {
    setTimeout(() => {
      schedule('afterRender', () => this._handleBlur(event.target))
    }, 100);
    return true;
  }

  _handleBlur(target) {
    if (this.isRefocusing) {
      return;
    }

    if (target.hasAttribute('autocomplete')) {
      target.setAttribute('readonly', '');
    }

    if (this.args.focusBorder) {
      this.wrapperBlock.classList.remove("autocomplete-focused");
    }

    if (this.args.form) {
      this.args.form.preventSubmit = false;
    }

    if (!this.isFocused) {
      return true;
    }

    setTimeout(() => {
      schedule('afterRender', () => {
        if (this.args.selectOnBlur && this.items.length > 0) {
          if (this.items.length === 1 || this.selectionIdx === -1) {
            this._selectOption(this.items[0]);
          } else {
            this._selectOption(this.items[this.selectionIdx]);
          }
        }
        this.isFocused = false;
      })
    }, 100);

    return true;
  }

  /**
   * Handle either a mousedown or click event on a result item.
   *
   * @param {object} option
   * @param {Event} event
   */

  @action
  clickSelection(option, event) {
    event.stopPropagation();
    debounce(this, this._selectOption, option, CLICK_DEBOUNCE_MS);
    return false;
  }

  /**
   * Ignore any clicks or mousedown events in an area (the section header)
   * and setup to refocus the input field.
   *
   * @param event
   * @returns {boolean}
   */

  @action
  ignoreClick(event) {
    event.stopPropagation();
    this.isRefocusing = true;
    focusElement(this.inputElement);
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

    if (!this.args.keepFocusOnSelect) {
      this.inputElement.blur();
    }
  }

  /**
   * Track the input element when inserted into the dom
   * @param {HTMLInputElement} element
   */

  @action
  inputInsertElement(element) {
    this.inputElement = element;

    if (element.hasAttribute('autocomplete')) {
      // Safari hack to prevent autofill suggestion.
      element.setAttribute('readonly', '');
    }

    if (this.args.autofocus) {
      focusElement(element);
    }
  }

  /**
   * Callback to parent component when the mode has changed
   *
   * @param {string} value selected mode value
   * @param {Function} closeDropdown
   * @param {MouseEvent} event selection event.
   */

  @action
  selectModeEvent(value, closeDropdown, event) {
    event.preventDefault();
    const {onModeChange} = this.args;
    closeDropdown();
    onModeChange?.(value);
  }

  /**
   * Adjust the results box position and width to match the input field.
   *
   * @param {Element} element
   */

  @action
  resultsBoxInsertedEvent(element) {
    this.resultsElement = element;

    if (this.args.renderBelow) {
      return;
    }

    schedule('afterRender', () => {
      element.style.offsetTop = `${this.inputElement.getBoundingClientRect().top + 15}px`;
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

  @action
  wrapperBlockInserted(block) {
    this.wrapperBlock = block;
  }
}
