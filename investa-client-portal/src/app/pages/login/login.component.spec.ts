import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent, composeInternationalPhone } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { RoleContextService } from '../../services/role-context.service';
import { TRANSLATION_DICTIONARIES } from '../../i18n/translation-dictionaries';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['login']) },
        { provide: ProfileService, useValue: jasmine.createSpyObj('ProfileService', ['loadMyProfile']) },
        { provide: RoleContextService, useValue: jasmine.createSpyObj('RoleContextService', ['setActiveContext']) },
        { provide: TRANSLATION_DICTIONARIES, useValue: { en: {}, ar: {} } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('composeInternationalPhone', () => {
  it('accepts an Egyptian local number with its trunk zero', () => {
    expect(composeInternationalPhone('+20', '01145599134')).toBe('+201145599134');
  });

  it('accepts an Egyptian national number without its trunk zero', () => {
    expect(composeInternationalPhone('+20', '1145599134')).toBe('+201145599134');
  });

  it('does not duplicate the Egyptian country code', () => {
    expect(composeInternationalPhone('+20', '201145599134')).toBe('+201145599134');
  });
});
