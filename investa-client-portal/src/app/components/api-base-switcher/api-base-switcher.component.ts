import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const PRESETS = ['http://DESKTOP-DIH7CQH:5235', 'http://DESKTOP-DIH7CQH:5000', 'http://localhost:5235'];
const STORAGE_KEY = 'apiBase';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-api-base-switcher',
  template: `
    <div class="fixed bottom-4 end-4 z-50">
      <div class="bg-slate-900 text-white rounded-xl shadow p-3 flex items-center gap-3">
        <div class="text-xs">API:</div>
        <div class="text-xs font-mono truncate w-48">{{ current() }}</div>
        <button class="text-xs bg-slate-700 px-2 py-1 rounded" (click)="open.set(!open())">Change</button>
      </div>
      <div *ngIf="open()" class="mt-2 bg-white rounded-lg shadow p-3 w-96 text-sm text-black">
        <div *ngFor="let p of presets" class="flex items-center justify-between py-1">
          <div class="truncate">{{p}}</div>
          <button (click)="apply(p)" class="text-blue-600">Use</button>
        </div>
        <div class="border-t mt-2 pt-2">
          <input [(ngModel)]="custom" placeholder="Custom URL" class="w-full rounded border px-2 py-1" />
          <div class="flex justify-end mt-2">
            <button (click)="apply(custom)" class="px-3 py-1 bg-blue-600 text-white rounded">Apply</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ApiBaseSwitcherComponent {
  presets = PRESETS;
  open = signal(false);
  current = signal<string>(localStorage.getItem(STORAGE_KEY) || 'http://DESKTOP-DIH7CQH:5235');
  custom = '';

  constructor() { }

  apply(url: string | null | undefined) {
    if (!url) return;
    const v = url.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY, v);
    this.current.set(v);
    try {
      (window as any).__INVESTA_API_BASE = v;
      let m = document.querySelector('meta[name="investa-api-base"]');
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute('name', 'investa-api-base');
        document.head.appendChild(m);
      }
      m.setAttribute('content', v);
    } catch (e) {
      // Silently fail - API base switching is optional
    }
    this.open.set(false);
  }
}
