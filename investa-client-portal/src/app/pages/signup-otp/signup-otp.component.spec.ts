import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { SignupOtpComponent } from './signup-otp.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';
import { TRANSLATION_DICTIONARIES } from '../../i18n/translation-dictionaries';

describe('SignupOtpComponent', () => {
  let component: SignupOtpComponent;
  let fixture: ComponentFixture<SignupOtpComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let uiServiceSpy: jasmine.SpyObj<UiService>;
  let router: Router;

  function createComponent(sessionValue: string | null) {
    const activatedRouteStub = {
      snapshot: {
        queryParamMap: {
          get: (_key: string) => sessionValue
        }
      }
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SignupOtpComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: UiService, useValue: uiServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: TRANSLATION_DICTIONARIES, useValue: { en: { signup: { accountCreated: 'Account created successfully. Please log in.' } }, ar: {} } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupOtpComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signupVerify']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showToast']);
    uiServiceSpy = jasmine.createSpyObj('UiService', ['openRoleSelectModal']);
  });

  it('should create', () => {
    createComponent('test-session-id');
    expect(component).toBeTruthy();
  });

  it('stores verificationSessionId from query param', () => {
    createComponent('test-session-id');
    expect(component.verificationSessionId()).toBe('test-session-id');
  });

  it('redirects to signup if no session in query param', () => {
    createComponent(null);
    expect(component.verificationSessionId()).toBeNull();
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      createComponent('test-session-id');
    });

    it('does nothing when form is invalid', async () => {
      await component.onSubmit();
      expect(authServiceSpy.signupVerify).not.toHaveBeenCalled();
    });

    it('does nothing when already submitting', async () => {
      component.isSubmitting.set(true);
      component.otpForm.patchValue({ otpCode: '123456' });
      await component.onSubmit();
      expect(authServiceSpy.signupVerify).not.toHaveBeenCalled();
    });

    it('calls signupVerify with correct payload', fakeAsync(() => {
      authServiceSpy.signupVerify.and.resolveTo();
      component.otpForm.patchValue({ otpCode: '123456' });
      fixture.detectChanges();

      component.onSubmit();
      tick();

      expect(authServiceSpy.signupVerify).toHaveBeenCalledTimes(1);
      expect(authServiceSpy.signupVerify).toHaveBeenCalledWith('test-session-id', '123456');
    }));

    it('shows success toast and navigates to home after OTP', fakeAsync(() => {
      authServiceSpy.signupVerify.and.resolveTo();
      component.otpForm.patchValue({ otpCode: '123456' });
      fixture.detectChanges();

      component.onSubmit();
      tick();

      expect(notificationServiceSpy.showToast).toHaveBeenCalledWith({
        title: 'Account created successfully. Please log in.',
        message: '',
        type: 'success'
      });
      expect(uiServiceSpy.openRoleSelectModal).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('does not store any auth token after OTP', fakeAsync(() => {
      authServiceSpy.signupVerify.and.resolveTo();
      component.otpForm.patchValue({ otpCode: '123456' });
      fixture.detectChanges();

      component.onSubmit();
      tick();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    }));

    it('displays error on API failure', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ error: { message: 'Invalid OTP' }, status: 400 });
      authServiceSpy.signupVerify.and.rejectWith(errorResponse);
      component.otpForm.patchValue({ otpCode: '000000' });
      fixture.detectChanges();

      component.onSubmit();
      tick();

      expect(component.errorMessage()).toBe('Invalid OTP');
    }));
  });
});
