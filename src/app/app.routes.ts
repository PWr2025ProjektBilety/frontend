import { Routes } from '@angular/router';
import {RegisterComponent} from './components/auth/register/register.component';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/auth/login/login.component';
import {TicketsComponent} from './components/passenger/tickets/tickets.component';
import {CheckTicketComponent} from './components/ticket-validator/check-ticket/check-ticket.component';
import {TicketOfferComponent} from './components/passenger/ticket-offer/ticket-offer.component';
import {TicketResolver} from './resolvers/tickets.resolver';
import {BuyTicketComponent} from './components/passenger/buy-ticket/buy-ticket.component';
import {AuthGuard} from './guards/auth.guard';
import {NoAuthGuard} from './guards/noAuth.guard';
import {TicketHistoryResolver} from './resolvers/ticket.history.resolver';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  {
    path: 'tickets',
    component: TicketsComponent,
    resolve: { ticketData: TicketHistoryResolver },
    canActivate: [AuthGuard],
    data: { role: 'ROLE_USER' }
  },
  {
    path: 'offer',
    component: TicketOfferComponent,
    resolve: { ticketData: TicketResolver },
    canActivate: [AuthGuard],
    data: { role: 'ROLE_USER'}
  },
  {
    path: 'buy-ticket',
    component: BuyTicketComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_USER'}
  },
  {
    path: 'check-ticket',
    component: CheckTicketComponent,
    canActivate: [AuthGuard],
    data: {role: 'ROLE_INSPECTOR'}
  }
];
