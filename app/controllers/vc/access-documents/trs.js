import Controller from '@ember/controller';
import {
  action,
  computed
} from '@ember/object';
import moment from 'moment';

export default class VcAccessDocumentsTrsController extends Controller {
  selectedTypes = 'all';

  CSV_HEADER = "First Name,Last Name,Email Address,Notes,External Notes,Street Address,Street Address 2,City,State/Province,Postal Code,Country,Delivery Type,4921824,4921825,4921826,4921827,4921828,4921829,4921830,4921831,4921832,4921833,4921834,4921835,4921836,4921837,4921838,4921839,4921840,4921841,4921842,4921843,4921844,4921845,4921846,4921847,4921848,4921850,4921851,4921852,4921853,4921854,4921855,4921856,4921857,4921858,4921859,4921860,4921861,4921862,4921863,4921864,4921865,4921866,4921867,4921868,4921869,4921870,4921871,4921872,4921873\rMandatory,Mandatory,Mandatory,Any additional comments about the order,Any external notes about the order,,,,,,,WILL_CALL;USPS;UPS;CANADA_POST;CANADA_UPS;PRINT_AT_HOME,$190 Ticket $190.00 WILL_CALL;USPS;UPS;CANADA_POST;CANADA_UPS,$80 Vehicle Pass $80.00 WILL_CALL;USPS;UPS;CANADA_POST;CANADA_UPS,Gift Ticket $0.00 WILL_CALL;USPS;UPS;CANADA_POST;CANADA_UPS,Gift Vehicle Pass $0.00 WILL_CALL;USPS;UPS;CANADA_POST;CANADA_UPS,STAFF - WAP 8/5 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/6 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/7 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/8 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/9 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/10 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/11 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/12 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/13 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/14 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/15 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/16 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/17 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/18 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/19 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/20 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/21 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/22 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/23 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/24 & later $0.00 PRINT_AT_HOME,STAFF - WAP 8/25 & later $0.00 PRINT_AT_HOME,STAFF - WAP Anytime $0.00 PRINT_AT_HOME,STAFF CREDENTIAL pickup 8/4 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/5 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/6 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/7 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/8 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/9 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/10 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/11 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/12 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/13 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/14 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/15 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/16 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/17 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/18 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/19 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/20 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/21 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/22 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/23 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/24 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup 8/25 & after $0.00 WILL_CALL,STAFF CREDENTIAL pickup Anytime $0.00 WILL_CALL\r";

  MAX_BATCH_SIZE = 700;

  filterOptions = [
    ['All', 'all'],
    ['All being mailed', 'allmail'],
    ['WAP only', 'wap'],
    ['SOWAP only', 'sowap'],
    ['VP only (excluding any SC+VP or RPT_VP people)', 'vp'],
    ['SC only (including any associated VPs)', 'sc'],
    ['RPT only (including any associated VPs)', 'rpt'],
    ['GT only (including any associated VPs)', 'gt'],
    ['SC+RPT only (including any associated VPs)', 'sc+rpt']
  ];

  @computed('selectedRecords.@each.selected')
  get selectedCount() {
    return this.selectedRecords.reduce((total, r) => (r.selected ? 1 : 0) + total, 0);
  }

  @computed('selectedTypes', 'people')
  get badRecords() {
    const records = [];

    this.people.forEach((human) => {
      human.documents.forEach((document) => {
        if (document.has_error) {
          records.push({
            person: human.person,
            document
          });
        }
      })
    });

    return records;
  }

  @computed('selectedTypes', 'people')
  get selectedRecords() {
    const selectedTypes = this.selectedTypes;
    const records = [];

    this.people.forEach((human) => {
      const person = human.person;
      const callsign = person.callsign;
      const deliveryMethod = human.delivery_method;

      let numSC = 0,
        numGT = 0,
        numVP = 0;
      const VPids = [];

      // Do a quick summation to build the notes fields
      human.documents.forEach((doc) => {
        doc.selected = false;

        if (doc.has_error) {
          return;
        }

        switch (doc.type) {
        case 'staff_credential':
          numSC++;
          break;

        case 'gift_ticket':
          numGT++;
          break;
        case 'vehicle_pass':
          VPids.push(`RAD-${doc.id}`);
          numVP++;
          break;
        }
      });

      human.documents.forEach((doc) => {
        if (selectedTypes == "allmail") {
          if (deliveryMethod != "mail") {
            return;
          }
          if (doc.type != "reduced_price_ticket"
          && doc.type != "gift_ticket"
          && doc.type != 'vehicle_pass') {
            return;
          }
        }

        if (selectedTypes == "wap" && doc.type != "work_access_pass") {
          return;
        } else if (selectedTypes == "sowap" &&
          doc.type != "work_access_pass_so") {
          return;
        } else if (selectedTypes == "rpt" &&
          doc.type != "reduced_price_ticket") {
          return;
        } else if (selectedTypes == "gt" &&
          doc.type != "gift_ticket") {
          return;
        } else if (selectedTypes == "sc" &&
          doc.type != "staff_credential") {
          return;
        } else if (selectedTypes == "sc+rpt") {
          if (doc.type != "staff_credential" &&
            doc.type != "reduced_price_ticket") {
            return;
          }
        } else if (selectedTypes == "vp") {
          // This is people who have VPs but no SC or RPT!
          if (doc.type != "vehicle_pass") {
            return;
          }
        }

        let shortType = "UNK";
        if (doc.type == "staff_credential") {
          shortType = "SC";
        } else if (doc.type == "reduced_price_ticket") {
          shortType = "RPT";
        } else if (doc.type == "work_access_pass") {
          shortType = "WAP";
        } else if (doc.type == "work_access_pass_so") {
          shortType = "SOWAP";
        } else if (doc.type == "gift_ticket") {
          shortType = "GT";
        } else if (doc.type == "vehicle_pass") {
          shortType = "VP";
        }

        switch (shortType) {
        //case 'RPT': - for 2019 RPT is a paid item, VP not paid
        case 'SC':
        case 'GT':
          if (numVP > 0) {
            shortType = `${shortType}+VP`;
          }
          break;
        }

        // If we have a SC, or GT we will include the VP on
        // that line of the CSV, so there's nothing for us to do here.
        if (shortType == "VP" && (numSC > 0 || numGT > 0)) {
          return;
        }

        let dateInfo = '';
        if (doc.type == "staff_credential" ||
          doc.type == "reduced_price_ticket" ||
          doc.type == "work_access_pass" ||
          doc.type == "work_access_pass_so") {
          if (doc.access_any_time) {
            dateInfo = ' Anytime';
          } else if (doc.access_date) {
            dateInfo = moment(doc.access_date).format(' ddd MM/D');
          }
        }

        // Internal notes gets document numbers
        let internalNote = `Ranger ${callsign} - ${shortType}${dateInfo} - RAD-${doc.id}`;
        if (shortType == "RPT+VP" || shortType == "SC+VP" || shortType == "GT+VP") {
          internalNote += '+' + VPids.join('+');
        }
        if (doc.type == "work_access_pass_so") {
          internalNote += ` - for ${doc.name}`;
        }

        // External notes gets doc type and name
        let externalNote = `Ranger ${callsign} - ${shortType}${dateInfo}`;
        if (doc.type == "work_access_pass_so") {
          externalNote += ` for ${doc.name}`;
        }

        let ticketCol = 99;
        if (doc.type == "work_access_pass" ||
          doc.type == "work_access_pass_so") {
          if (doc.access_any_time) {
            ticketCol = 37;
          } else {
            const day = moment(doc.access_date).date();
            ticketCol = 16 + day - 5;
          }
        } else if (doc.type == "staff_credential") {
          if (doc.access_any_time) {
            ticketCol = 60;
          } else {
            const day = moment(doc.access_date).date();
            ticketCol = 39 + day - 5;
          }
        } else if (doc.type == "reduced_price_ticket") {
          ticketCol = 12;
        } else if (doc.type == "vehicle_pass") {
          ticketCol = 15;
        } else if (doc.type == "gift_ticket") {
          ticketCol = 14;
        }

        const record = {
          person,
          document: doc,
          deliveryMethod,
          internalNote,
          externalNote,
          ticketCol
        };

        if (shortType == "RPT+VP" || shortType == "SC+VP" || shortType == "GT+VP") {
          record.numVP = numVP;
        }

        records.push(record);
      });
    });

    return records;
  }

  @action
  updateSelectTypes(value) {
    this.set('selectedTypes', value);
  }

  @action
  exportSelectedAction() {
    const records = this.selectedRecords.filter((r) => r.selected );

    let data = this.CSV_HEADER;

    records.forEach((rec) => {
      const cols = [];
      const person = rec.person;
      const doc = rec.document;
      const type = doc.type;


      cols[0] = person.first_name;
      cols[1] = person.last_name;
      cols[2] = person.email;
      cols[3] = rec.internalNote;
      cols[4] = rec.externalNote;
      cols[rec.ticketCol] = 1;

      if (type == 'vehicle_pass'
      || type == 'reduced_price_ticket'
      || type == 'gift_ticket') {
        const address = doc.delivery_address;
        cols[5] = address.street;
        cols[6] = '';
        cols[7] = address.city;
        cols[8] = address.state;
        cols[9] = address.postal_code;
        cols[10] = address.country;
      }

      cols[11] = doc.delivery_type;
      if (rec.numVP) {
        cols[15] = rec.numVP;
      }

      const line = [];
      for (let i = 0; i <= 60; i++) {
        if (cols[i]) {
          const str = cols[i].toString();
          line.push(str.replace(',',''));
        } else {
          line.push('');
        }
      }

      data += line.join(',') + "\r";
    });

    const date = moment().format('YYYY-MM-DD-HH:mm');

    this.house.downloadFile(`ranger-trs-${this.selectedTypes}-${date}`, data, 'text/csv');
  }
}
