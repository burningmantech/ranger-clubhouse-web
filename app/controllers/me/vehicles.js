import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED} from "clubhouse/models/vehicle";

export default class MeVehiclesController extends ClubhouseController {
  @tracked showAgreementTag;
  @tracked person;
  @tracked vehicleInfo;
  @tracked vehicles;
  @tracked year;
  @tracked isSubmitting;

  @action
  reviewPersonalVehicleAgreement() {
    this.showAgreementTag = this.vehicleInfo.personal_vehicle_agreement_tag;
  }

  @action
  reviewMotorpoolPolicy() {
    this.showAgreementTag = this.vehicleInfo.motorpool_agreement_tag;
  }

  get pendingVehicles() {
    return this.vehicles?.filter((v) => v.status === STATUS_PENDING)?.length;
  }

  get approvedVehicles() {
    return this.vehicles?.filter((v) => v.status === STATUS_APPROVED)?.length;
  }

  get rejectedVehicles() {
    return this.vehicles?.filter((v) => v.status === STATUS_REJECTED)?.length;
  }

  @action
  closeAgreement(signed) {
    if (signed) {
      if (this.showAgreementTag === this.vehicleInfo.motorpool_agreement_tag) {
        this.vehicleInfo = {...this.vehicleInfo, motorpool_agreement_signed: true};
      } else if (this.showAgreementTag === this.vehicleInfo.personal_vehicle_agreement_tag) {
        this.vehicleInfo = {...this.vehicleInfo, personal_vehicle_signed: true};
      } else {
        this.toast.error(`Uh oh, I don't know what the tag [${this.showAgreementTag}] is.`);
      }
    }

    this.showAgreementTag = null;
  }

  @action
  async toggleMute(item) {
    const field = `ignore_${item}`, newValue = !this.vehicleInfo[field];
    try {
      this.isSubmitting = true;
      await this.ajax.patch(`person-event/${this.person.id}-${this.year}/`, {
        data: {
          person_event: { [field]: newValue }
        }
      });
      this.vehicleInfo = {...this.vehicleInfo, [field]: newValue};
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isSubmitting = false;
    }
  }
}
