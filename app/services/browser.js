import Service, {service} from '@ember/service';

/**
 * Browser-platform odds and ends: clipboard + external script loading.
 */

export default class BrowserService extends Service {
  @service toast;

  cachedScripts = {};

  /**
   * Load an external script, and cache it
   */

  loadScript(url) {
    if (this.cachedScripts[url]) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      document.head.append(script);
      script.onload = () => {
        this.cachedScripts[url] = true;
        resolve();
      };
      script.onerror = () => reject();
      script.src = url; // Boom!
    });
  }

  async copyToClipboard(thing) {
    const success = 'Copied to the clipboard.';

    const text = typeof thing === 'string' ? thing : thing.textContent;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast.success(success);
      } catch (err) {
        this.toast.error(`Sorry, unable to copy the text to the clipboard. Error: [${err}]`);
      }
      return;
    } else if (window.clipboardData) {
      window.clipboardData.setData('Text', text);
      this.toast.success(success);
      return;
    }


    // Create a Range object used to select the element's text.
    const range = document.createRange();
    const selection = window.getSelection();

    // Select the text into the range
    range.selectNodeContents(thing);
    // Remove previously selected range
    selection.removeAllRanges();
    // And now set the new range
    selection.addRange(range);

    try {
      // Copy the selection to the clipboard
      document.execCommand("copy");
    } catch (err) {
      this.toast.error(`Sorry, unable to copy the text to the clipboard. Error: [${err}]`);
      return;
    }

    selection.removeAllRanges();
    this.toast.success(success);
  }
}
