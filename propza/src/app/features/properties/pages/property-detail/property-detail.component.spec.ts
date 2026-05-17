/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PropertyDetailComponent } from './property-detail.component';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { PropertyService } from '../../../../core/services/property.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { RentDueService } from '../../../../core/services/rent-due.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { ConfirmationModalService } from '../../../../core/services/confirmation-modal.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { PropzaModalOptionsService } from '../../../../core/services/propza-modal-options.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MobileShellTitleService } from '../../../../core/services/mobile-shell-title.service';

describe('PropertyDetailComponent', () => {
  let component: PropertyDetailComponent;
  let fixture: ComponentFixture<PropertyDetailComponent>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockPropertyService: jasmine.SpyObj<PropertyService>;
  let mockTenantService: jasmine.SpyObj<TenantService>;
  let mockRentHelperService: jasmine.SpyObj<RentHelperService>;
  let mockRentDueService: jasmine.SpyObj<RentDueService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationModalService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockModalOptions: jasmine.SpyObj<PropzaModalOptionsService>;

  const mockProperties$ = new BehaviorSubject<any[]>([]);
  const mockPayments$ = new BehaviorSubject<any[]>([]);

  beforeEach(async () => {
    // Create spies for all services
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'getCurrentNavigation']);
    mockRouter.getCurrentNavigation.and.returnValue(null);
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', [], {
      supabase: {
        from: jasmine.createSpy('from').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              single: jasmine.createSpy('single').and.returnValue(Promise.resolve({ data: null, error: null })),
              order: jasmine.createSpy('order').and.returnValue({
                limit: jasmine.createSpy('limit').and.returnValue(Promise.resolve({ data: [], error: null }))
              })
            }),
            update: jasmine.createSpy('update').and.returnValue({
              eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ data: null, error: null }))
            }),
            delete: jasmine.createSpy('delete').and.returnValue({
              eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ data: null, error: null }))
            })
          })
        }),
        auth: {
          getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }))
        }
      }
    });
    mockPropertyService = jasmine.createSpyObj('PropertyService', [
      'getPropertyById',
      'getPayments',
      'refreshAll',
      'loadProperties',
      'updateProperty',
      'deleteProperty',
      'addPayment',
      'updatePayment',
      'deletePayment'
    ], {
      properties$: mockProperties$.asObservable(),
      payments$: mockPayments$.asObservable()
    });
    mockPropertyService.getPropertyById.and.returnValue(undefined);
    mockPropertyService.getPayments.and.returnValue([]);
    mockPropertyService.refreshAll.and.returnValue(Promise.resolve());
    mockPropertyService.loadProperties.and.returnValue(Promise.resolve());
    mockPropertyService.updateProperty.and.returnValue(Promise.resolve());
    mockPropertyService.deleteProperty.and.returnValue(Promise.resolve());
    mockPropertyService.addPayment.and.returnValue(Promise.resolve());
    mockPropertyService.updatePayment.and.returnValue(Promise.resolve());
    mockPropertyService.deletePayment.and.returnValue(Promise.resolve());

    mockTenantService = jasmine.createSpyObj('TenantService', [
      'getTenantById',
      'getTenants',
      'addTenant',
      'updateTenant',
      'deleteTenant'
    ]);
    mockTenantService.getTenantById.and.returnValue(undefined);
    mockTenantService.getTenants.and.returnValue([]);
    mockTenantService.addTenant.and.returnValue(Promise.resolve());
    mockTenantService.updateTenant.and.returnValue(Promise.resolve());
    mockTenantService.deleteTenant.and.returnValue(Promise.resolve());

    mockRentHelperService = jasmine.createSpyObj('RentHelperService', ['isActive', 'nextDueDate']);
    mockRentHelperService.isActive.and.returnValue(true);
    mockRentHelperService.nextDueDate.and.returnValue(new Date());

    mockRentDueService = jasmine.createSpyObj('RentDueService', [
      'getTodayZA',
      'getCurrentPeriod',
      'toDateOnlyZA',
      'safeAddMonths',
      'getStatusForTenant',
      'mapToDatabaseStatus'
    ]);
    mockRentDueService.getTodayZA.and.returnValue(new Date());
    mockRentDueService.getCurrentPeriod.and.returnValue('2024-01');
    mockRentDueService.toDateOnlyZA.and.returnValue(new Date());
    mockRentDueService.safeAddMonths.and.returnValue(new Date());
    mockRentDueService.getStatusForTenant.and.returnValue('upcoming');
    mockRentDueService.mapToDatabaseStatus.and.returnValue('upcoming');

    mockTranslationService = jasmine.createSpyObj('TranslationService', ['t'], {
      t: (key: string) => key
    });

    mockConfirmationService = jasmine.createSpyObj('ConfirmationModalService', ['confirm']);
    mockConfirmationService.confirm.and.returnValue(Promise.resolve(false));

    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockModalService.open.and.returnValue({
      componentInstance: {
        vacantProperties: [],
        form: {
          patchValue: jasmine.createSpy('patchValue')
        }
      },
      result: Promise.resolve()
    } as any);

    mockToastService = jasmine.createSpyObj('ToastService', ['error', 'warning', 'info', 'success', 'show']);
    mockModalOptions = jasmine.createSpyObj('PropzaModalOptionsService', ['createEntityFlow']);
    mockModalOptions.createEntityFlow.and.returnValue({ size: 'lg', centered: true, backdrop: 'static' });

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-property-id')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PropertyDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: RentHelperService, useValue: mockRentHelperService },
        { provide: RentDueService, useValue: mockRentDueService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ConfirmationModalService, useValue: mockConfirmationService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: ToastService, useValue: mockToastService },
        { provide: PropzaModalOptionsService, useValue: mockModalOptions },
        {
          provide: MobileShellTitleService,
          useValue: jasmine.createSpyObj('MobileShellTitleService', [
            'setMobileTitleOverride',
            'clearMobileTitleOverride'
          ])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with property ID from route', () => {
    expect(component.propertyId).toBe('test-property-id');
  });
});
