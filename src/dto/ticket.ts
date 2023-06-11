export type TicketStatus = 'pending' | 'done' | 'cancel';

export interface Seller {
  name: string;
  phoneNumber: string;
  address: string;
}

export interface Car {
  brand: string;
  model: string;
  type: string;
  year: number;
  transmission: string;
  licensePlate: string;
}

export interface Inspection {
  inspector: string;
  schedule: Date;
}

export interface Ticket {
  id: string;
  seller: Seller;
  gmapLink?: string;
  car: Car;
  inspection: Inspection;
  ticketStatus: TicketStatus;
}
