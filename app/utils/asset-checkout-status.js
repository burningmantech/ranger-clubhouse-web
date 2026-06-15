// Named constants for the asset/checkout endpoint's `status` contract.
// Centralizing them documents the API contract in one place and guards
// the switch in asset-checkout-form.js against silent typos.
export const CHECKOUT_SUCCESS = 'success';
export const CHECKOUT_NOT_FOUND = 'not-found';
export const CHECKOUT_CHECKED_OUT = 'checked-out';
export const CHECKOUT_EXPIRED = 'expired';
export const CHECKOUT_ENTITY_ASSIGNED = 'entity-assigned';

// Long user-facing copy, hoisted out of component control flow.
export const ENTITY_ASSIGNED_MESSAGE = (barcode, entity) =>
  `Asset #${barcode} cannot be checked out because it has been assigned to ${entity}. ` +
  `Asset assignments differ from asset checkouts because assignments are for situations ` +
  `where the person does not have a Clubhouse account, such as Burn Perimeter Support or ` +
  `High Rock Security members, or where the asset is used by a team or service rather than ` +
  `an individual.`;

export const UNKNOWN_STATUS_MESSAGE = (status) =>
  `A bug was tripped over. The status ${status} is not known.`;

export const NAVIGATE_AWAY_WARNING =
  'A barcode was entered, yet was not checked out. Either complete the check out process, ' +
  'or blank the barcode field before clicking on another tab.';
