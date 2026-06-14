import Service from '@ember/service';
import {run} from '@ember/runloop';
import {isEmpty} from '@ember/utils';
import dayjs from "dayjs";

/**
 * CSV / file / URL downloads.
 */

export default class DownloadService extends Service {
  /**
   * Download an array as a CSV file.
   *
   * @param {string} filename
   * @param {Object[]} columns column list
   * @param {string} columns.title the title for each column
   * @param {string} columns.key the key into each data row
   * @param {Object[]} data
   */

  downloadCsv(filename, columns, data) {
    const headers = columns.map((column) => {
      let header = typeof column === 'string' ? column : column.title;
      header = header.replace(/"/g, '""');
      if (header.search(/("|,|\n)/g) >= 0) {
        header = `"${header}"`;
      }

      return header;
    });

    let contents = headers.join(',') + "\n";

    data.forEach((line) => {
      let fields = [];
      columns.forEach((column) => {
        let value, yesno = false, format;
        if (typeof column == 'string') {
          value = line[column];
        } else {
          if ('value' in column) {
            value = column.value;
          } else if (column.blank) {
            value = '';
          } else {
            value = line[column.key];
          }

          if (column.yesno) {
            yesno = true;
          } else if (column.format) {
            format = column.format;
          }
        }

        if (yesno) {
          value = value ? 'Y' : 'N';
        } else if (format) {
          switch (format) {
            case 'date':
              if (value) {
                value = dayjs(value).format('YYYY-MM-DD');
              } else {
                value = '';
              }
              break;
          }
        } else {
          value = isEmpty(value) ? '' : value.toString();
        }

        value = value.replace(/"/g, '""');
        if (value.search(/("|,|\n)/g) >= 0) {
          value = `"${value}"`;
        }
        fields.push(value);
      });
      contents += fields.join(',') + "\n";
    });

    this.downloadFile(filename, contents, 'text/csv');

    return contents;
  }

  /**
   * Download a file
   *
   * @param {string} filename download as name
   * @param {string} contents
   * @param {string} type MIME type (e.g., text/csv, text/html, etc.)
   */

  downloadFile(filename, contents, type) {
    run('afterRender', () => {
      const {document, URL} = window;
      const anchor = document.createElement('a');

      anchor.download = filename;
      anchor.href = URL.createObjectURL(new Blob([contents], {type}));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    })
  }

  /**
   * Download a URL
   *
   * @param {string} url
   */

  downloadUrl(url) {
    run('afterRender', () => {
      const {document} = window;
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = url.split('/').pop();
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    });
  }
}
