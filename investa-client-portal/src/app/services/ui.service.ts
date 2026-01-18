import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  isRoleSelectOpen = signal(false);

  openRoleSelectModal() {
    this.isRoleSelectOpen.set(true);
  }

  closeRoleSelectModal() {
    this.isRoleSelectOpen.set(false);
  }
}
