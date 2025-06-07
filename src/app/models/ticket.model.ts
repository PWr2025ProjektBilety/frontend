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
  purchaseDate: string;
  reduced: boolean;
  finalPrice: number;
}

