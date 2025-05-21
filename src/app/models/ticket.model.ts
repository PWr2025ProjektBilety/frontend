export interface Ticket {
  id: string;
  code: string;
  type: 'jednorazowy' | 'czasowy' | 'okresowy';
  validFrom?: Date;
  validTo?: Date;
  isActive: boolean;
}
