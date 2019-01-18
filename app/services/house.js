import Service from '@ember/service';
import ENV from 'clubhouse/config/environment';
import { inject as service } from '@ember-decorators/service';
import DS from 'ember-data';

export default class HouseService extends Service {
  @service toast;
  @service session;
  @service router;

  handleErrorResponse(response) {
    let message, errorType;
    let responseErrors = null;

    if (ENV.showAjaxErrors) {
      console.error("Error Response: ", JSON.stringify(response));
    }

    if (response) {
      let status;
      if (response instanceof DS.InvalidError) {
        responseErrors = response.errors.map((error) => error.title);
        status = 422;
      } else {
        const data = response.json ? response.json : response.payload;
        status = response.status;
        if (data) {
          if (data.errors) {
            responseErrors = data.errors.map((error) => error.title);
          } else if (data.error) {
            responseErrors = [data.error];
          }
        }
      }

      switch (status) {
      case 400:
        errorType = 'record not found';
        break;
      case 401:
        errorType = 'authorization'
        break;
      case 403:
        errorType = 'not permitted';
        break;

      case 422:
        errorType = 'validation';
        break;

      default:
        if (!status || status >= 500) {
          errorType = 'server';
        } else {
          errorType = `unknown (status ${status})`;
        }
        break;
      }
    } else {
      errorType = 'unknown';
    }

    if (responseErrors) {
      const plural = responseErrors.length == 1 ?
        ' was' :
        's were';
      const errorList = responseErrors.map((error) => `<li>${error}</li>`);
      message = `The following ${errorType} error${plural} encountered:<ul>${errorList.join('')}</ul>`;
    } else {
      message = `A server error was encountered:<ul><li>${response}</li></ul>`;
    }

    this.toast.error(message, {
      sticky: true
    })
  }

  saveModel(model, successMessage, routeOrCallback) {

    this.toast.clear();

    const isCallback = typeof (routeOrCallback) == 'function';

    /*
    if (!model.get('isDirty') && !model.get('isNew')) {
      this.toast.success(successMessage);
      if (isCallback) {
        routeOrCallback(model);
      } else if (routeOrCallback){
        this.transitionToRoute(routeOrCallback);
      }
      return;
    }*/

    return model.save().then((result) => {
      this.toast.success(successMessage);
      if (isCallback) {
        routeOrCallback(model, result);
      } else if (routeOrCallback) {
        this.transitionToRoute(routeOrCallback);
      }
    }).catch((response) => {
      this.handleErrorResponse(response);
    });
  }

  roleCheck(roles) {
    if (this.session.user.hasRole(roles)) {
      return true;
    }

    this.toast.error('You are not authorized for that action');
    this.router.transitionTo('me.overview');
    return false;
  }

  /*
   * Download an array as a CSV file.
   */

  downloadCsv(filename, columns, data) {
    let contents = columns.join(',')+"\n";

     data.forEach((line) => {
       let fields = [];
       columns.forEach((column) => {
           fields.push(line[column]);
       });
       contents += fields.join(',')+"\n";
     });

     this.downloadFile(filename, contents, 'text/csv');
  }

  /*
   * Download a file
   */

  downloadFile(filename, contents, type) {
    let { document, URL } = window;
    let anchor = document.createElement('a');

    anchor.download = filename;
    anchor.href = URL.createObjectURL(new Blob([contents], {
      type
    }));

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}
