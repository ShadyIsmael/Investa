import { Injectable, signal } from '@angular/core';
import { InvestmentRequest } from '../models/request.model';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  incoming = signal<InvestmentRequest[]>([
    {
      id: 101,
      type: 'invitation',
      direction: 'incoming',
      projectName: 'GreenEarth Energy Bond',
      projectImageUrl: 'https://picsum.photos/seed/incoming1/100/100',
      counterpartName: 'EcoGlobal',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600 * 1000 * 3)
    },
    {
      id: 102,
      type: 'join',
      direction: 'incoming',
      projectName: 'DeFi ChainLink',
      projectImageUrl: 'https://picsum.photos/seed/incoming2/100/100',
      counterpartName: 'BlockGenius',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600 * 1000 * 12)
    }
  ]);

  outgoing = signal<InvestmentRequest[]>([
    {
      id: 201,
      type: 'join',
      direction: 'outgoing',
      projectName: 'Quantum Leap AI',
      projectImageUrl: 'https://picsum.photos/seed/outgoing1/100/100',
      counterpartName: 'TechVanguard',
      status: 'Negotiating',
      createdAt: new Date(Date.now() - 3600 * 1000 * 30)
    },
    {
      id: 202,
      type: 'invitation',
      direction: 'outgoing',
      projectName: 'MedTech Innovations',
      projectImageUrl: 'https://picsum.photos/seed/outgoing2/100/100',
      counterpartName: 'HealthCorp',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600 * 1000 * 60)
    }
  ]);

  constructor(private notifications: NotificationService) {}

  acceptRequest(request: InvestmentRequest) {
    this.incoming.update(list => list.map(r => r.id === request.id ? { ...r, status: 'Accepted' } : r));
    this.notifications.showToast({ title: 'Request Accepted', message: `${request.projectName} invitation accepted.`, type: 'success' });
  }

  declineRequest(request: InvestmentRequest) {
    this.incoming.update(list => list.map(r => r.id === request.id ? { ...r, status: 'Declined' } : r));
    this.notifications.showToast({ title: 'Request Declined', message: `${request.projectName} invitation declined.`, type: 'warning' });
  }

  withdrawRequest(request: InvestmentRequest) {
    this.outgoing.update(list => list.filter(r => r.id !== request.id));
    this.notifications.showToast({ title: 'Request Withdrawn', message: `${request.projectName} request withdrawn.`, type: 'success' });
  }
}
