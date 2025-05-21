import { Routes } from '@angular/router';
import {RegisterComponent} from './components/auth/register/register.component';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/auth/login/login.component';
import {TicketsComponent} from './components/passenger/tickets/tickets.component';
import {CheckTicketComponent} from './components/ticket-validator/check-ticket/check-ticket.component';
import {TicketOfferComponent} from './components/passenger/ticket-offer/ticket-offer.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'tickets', component: TicketsComponent },
  { path: 'offer', component: TicketOfferComponent},
  { path: 'check-ticket', component: CheckTicketComponent },
];
