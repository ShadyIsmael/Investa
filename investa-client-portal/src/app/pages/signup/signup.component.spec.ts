import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';
import { TRANSLATION_DICTIONARIES } from '../../i18n/translation-dictionaries';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const validFormValues = {
    mobile: '01234567890',
    firstName: 'John',
    lastName: 'Doe',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signupInit']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TRANSLATION_DICTIONARIES, useValue: { en: {}, ar: {} } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('does nothing when form is invalid', async () => {
      await component.onSubmit();
      expect(authServiceSpy.signupInit).not.toHaveBeenCalled();
    });

    it('does nothing when already submitting', async () => {
      component.isSubmitting.set(true);
      component.signupForm.patchValue(validFormValues);
      await component.onSubmit();
      expect(authServiceSpy.signupInit).not.toHaveBeenCalled();
    });

    it('calls signupInit with correct payload when form is valid', fakeAsync(async () => {
      authServiceSpy.signupInit.and.resolveTo({ verificationSessionId: 'test-session-id' });
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(authServiceSpy.signupInit).toHaveBeenCalledTimes(1);
      expect(authServiceSpy.signupInit).toHaveBeenCalledWith(
        validFormValues.mobile,
        validFormValues.password,
        validFormValues.firstName,
        validFormValues.lastName
      );
    }));

    it('navigates to OTP screen on successful signupInit', fakeAsync(async () => {
      authServiceSpy.signupInit.and.resolveTo({ verificationSessionId: 'session-123' });
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(router.navigate).toHaveBeenCalledWith(['/signup-otp'], { queryParams: { session: 'session-123' } });
    }));

    it('displays error message on API failure', fakeAsync(async () => {
      const errorResponse = new HttpErrorResponse({ error: { message: 'Phone already registered' }, status: 409 });
      authServiceSpy.signupInit.and.rejectWith(errorResponse);
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(component.errorMessage()).toBe('Phone already registered');
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('displays generic error when HttpErrorResponse has no message', fakeAsync(async () => {
      const errorResponse = new HttpErrorResponse({ status: 500 });
      authServiceSpy.signupInit.and.rejectWith(errorResponse);
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(component.errorMessage()).toBe('Signup failed. Please try again.');
    }));

    it('displays error message on non-HTTP exception', fakeAsync(async () => {
      authServiceSpy.signupInit.and.rejectWith(new Error('Network error'));
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(component.errorMessage()).toBe('Network error');
    }));

    it('sets isSubmitting to false after completion', fakeAsync(async () => {
      authServiceSpy.signupInit.and.resolveTo({ verificationSessionId: 'session-123' });
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      expect(component.isSubmitting()).toBeFalse();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(component.isSubmitting()).toBeFalse();
    }));

    it('clears previous error on new submission', fakeAsync(async () => {
      component.errorMessage.set('Previous error');
      authServiceSpy.signupInit.and.resolveTo({ verificationSessionId: 'session-123' });
      component.signupForm.patchValue(validFormValues);
      fixture.detectChanges();

      const promise = component.onSubmit();
      tick();
      await promise;

      expect(component.errorMessage()).toBeNull();
    }));
  });
});
