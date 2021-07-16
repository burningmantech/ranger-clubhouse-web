export function initialize(/* application */) {
  if ('toBlob' in HTMLCanvasElement.prototype) {
    return;
  }

  // Older IE Edge versions do not have toBlob
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      const dataURL = this.toDataURL(type, quality).split(',')[1];
      setTimeout(function () {

        let binStr = atob(dataURL),
          len = binStr.length,
          arr = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback(new Blob([arr], {type: type || 'image/png'}));
      });
    }
  });
}

export default {
  initialize
};
