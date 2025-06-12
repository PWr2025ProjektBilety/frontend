import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Injectable} from '@angular/core';
import {TicketService} from '../services/ticket.service';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketHistoryResolver implements Resolve<any> {
  constructor(private ticketService: TicketService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const page = route.queryParamMap.get('page') || 0;
    const size = route.queryParamMap.get('size') || 5;
    return this.ticketService.getTicketHistory(+page, +size);
  }
}
