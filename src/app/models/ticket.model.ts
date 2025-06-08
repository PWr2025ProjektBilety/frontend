export enum TicketType {
  SINGLE_RIDE_TICKET = 'SINGLE_RIDE_TICKET',
  TIME_BASED_TICKET = 'TIME_BASED_TICKET',
  PERIODIC_TICKET = 'PERIODIC_TICKET',
}

export interface Ticket {
  id: number;
  price: number;
  discountAvailable: boolean;
  active: boolean;
  type: TicketType;
  validityPeriod?: number;
}

export interface BuyTicketRequest {
  ticketType: TicketType;
  ticketId: number;
  reduced: boolean;
  startTime: string | null;
}

export interface PurchasedTicketDTO {
  code: string;
  finalPrice: number;
  reduced: boolean;
  purchaseDate: string;
}

export interface PurchasedTicketSingleBasedDTO extends PurchasedTicketDTO {
  vehicleId: string;
  validated: boolean;
}

export interface PurchasedTicketTimeBasedDTO extends PurchasedTicketDTO {
  validated: boolean;
  validationDate: string;
  expirationDate: string;
}

export interface PurchasedTicketPeriodicDTO extends PurchasedTicketDTO {
  validFrom: string;
  validTo: string;
}

export interface TicketValidationRequest {
  ticketId: string;
  vehicleId: string;
}



