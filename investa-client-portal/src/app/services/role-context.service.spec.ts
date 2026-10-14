import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { RoleContextService } from './role-context.service';

describe('RoleContextService', () => {
  const profile = signal<{ coreMetrics?: { clientType?: string } } | null>(null);
  const userRole = signal<string | null>(null);

  const setup = (storedContext: string | null, clientType?: string) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        RoleContextService,
        { provide: AuthService, useValue: { userRole, isAuthenticated: () => true } },
        { provide: ProfileService, useValue: { profile, loadMyProfile: async () => null } },
      ],
    });
    localStorage.removeItem('activeClientContext');
    if (storedContext) localStorage.setItem('activeClientContext', storedContext);
    profile.set(clientType ? { coreMetrics: { clientType } } : null);
    userRole.set(storedContext);
    const service = TestBed.inject(RoleContextService);
    TestBed.flushEffects();
    return service;
  };

  afterEach(() => {
    localStorage.removeItem('activeClientContext');
    profile.set(null);
    userRole.set(null);
  });

  it('keeps an investor-only account out of the founder context', () => {
    const service = setup('founder', 'Investor');

    expect(service.activeContext()).toBe('investor');
    expect(service.isActiveFounderContext()).toBeFalse();
    expect(localStorage.getItem('activeClientContext')).toBe('investor');
  });

  it('clamps an explicit founder context request for an investor-only account', () => {
    const service = setup(null, 'Investor');

    expect(service.setActiveContext('founder')).toBe('investor');
    expect(service.canCreateOpportunity()).toBeFalse();
  });

  it('lets a founder account keep the founder context', () => {
    const service = setup('founder', 'Founder');

    expect(service.activeContext()).toBe('founder');
    expect(service.canCreateOpportunity()).toBeTrue();
    expect(localStorage.getItem('activeClientContext')).toBe('founder');
  });

  it('lets a dual-capability account choose either context', () => {
    const service = setup('investor', 'Both');

    expect(service.activeContext()).toBe('investor');
    expect(service.setActiveContext('founder')).toBe('founder');
  });

  it('falls back to the requested context while the profile is unknown', () => {
    const service = setup('founder');

    expect(service.activeContext()).toBe('founder');
  });
});
