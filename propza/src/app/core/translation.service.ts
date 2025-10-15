import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'af' | 'zu' | 'xh';

interface Translations {
  [key: string]: {
    en: string;
    af: string;
    zu: string;
    xh: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  public currentLanguage = signal<Language>('en');
  
  private translations: Translations = {
    // Navigation
    'nav.home': {
      en: 'Home',
      af: 'Tuis',
      zu: 'Ikhaya',
      xh: 'Ikhaya'
    },
    'nav.tenants': {
      en: 'Tenants',
      af: 'Huurders',
      zu: 'Abaqashi',
      xh: 'Abaqeshi'
    },
    'nav.settings': {
      en: 'Settings',
      af: 'Instellings',
      zu: 'Izilungiselelo',
      xh: 'Iisethingi'
    },
    
    // Dashboard
    'dashboard.totalRent': {
      en: 'Total Rent Due',
      af: 'Totale Huur Verskuldig',
      zu: 'Isamba Serenti Esidingekayo',
      xh: 'Irenti Epheleleyo Efunekayo'
    },
    'dashboard.collected': {
      en: 'Collected',
      af: 'Versamel',
      zu: 'Kuqoqiwe',
      xh: 'Iqokelelwe'
    },
    'dashboard.properties': {
      en: 'Properties',
      af: 'Eiendomme',
      zu: 'Izindawo',
      xh: 'Iipropati'
    },
    'dashboard.sortBy': {
      en: 'Sort by:',
      af: 'Sorteer volgens:',
      zu: 'Hlela ngo:',
      xh: 'Hlela ngo:'
    },
    'dashboard.dueDate': {
      en: 'Due Date',
      af: 'Vervaldatum',
      zu: 'Usuku Lokukhokha',
      xh: 'Umhla Wokuhlawula'
    },
    'dashboard.amount': {
      en: 'Amount',
      af: 'Bedrag',
      zu: 'Inani',
      xh: 'Isixa'
    },
    'dashboard.status': {
      en: 'Status',
      af: 'Status',
      zu: 'Isimo',
      xh: 'Isimo'
    },
    
    // Property Status
    'status.paid': {
      en: 'Paid',
      af: 'Betaal',
      zu: 'Kukhokhiwe',
      xh: 'Kuhlawuliwe'
    },
    'status.overdue': {
      en: 'Overdue',
      af: 'Agterstallig',
      zu: 'Kudlulile',
      xh: 'Kudlulile'
    },
    'status.late': {
      en: 'Late',
      af: 'Laat',
      zu: 'Sekwephuzile',
      xh: 'Libaziseke'
    },
    'status.vacant': {
      en: 'Vacant',
      af: 'Vakant',
      zu: 'Kungenalutho',
      xh: 'Akukho mntu'
    },
    'status.upcoming': {
      en: 'Upcoming',
      af: 'Komende',
      zu: 'Ezayo',
      xh: 'Ezayo'
    },
    'status.dueToday': {
      en: 'Due Today',
      af: 'Vandag Verskuldig',
      zu: 'Kufanele Namuhla',
      xh: 'Kufuneka Namhlanje'
    },
    'status.dueSoon': {
      en: 'Due Soon',
      af: 'Binnekort Verskuldig',
      zu: 'Sekuseduze',
      xh: 'Kufuphi'
    },
    'status.partiallyPaid': {
      en: 'Partially Paid',
      af: 'Gedeeltelik Betaal',
      zu: 'Kukhokhwe Ingxenye',
      xh: 'Kuhlawulwe Inxalenye'
    },
    
    // Filters
    'filter.all': {
      en: 'All',
      af: 'Almal',
      zu: 'Konke',
      xh: 'Zonke'
    },
    'filter.unpaid': {
      en: 'Unpaid',
      af: 'Onbetaal',
      zu: 'Akukakhokhwa',
      xh: 'Akhahlawulwa'
    },
    
    // Empty States
    'empty.noProperties': {
      en: 'No properties found',
      af: 'Geen eiendomme gevind nie',
      zu: 'Azikho izindawo ezitholiwe',
      xh: 'Akukho propati zifunyenweyo'
    },
    'empty.getStarted': {
      en: 'Get started by adding your first property',
      af: 'Begin deur jou eerste eiendom by te voeg',
      zu: 'Qala ngokufaka indawo yakho yokuqala',
      xh: 'Qalisa ngokongeza ipropathi yakho yokuqala'
    },
    'empty.noMatches': {
      en: 'No properties match your filter',
      af: 'Geen eiendomme pas by jou filter nie',
      zu: 'Azikho izindawo ezifana nesihlungi sakho',
      xh: 'Akukho propati ezihambelana nesihluzi sakho'
    },
    
    // Buttons
    'button.addProperty': {
      en: 'Add Property',
      af: 'Voeg Eiendom By',
      zu: 'Engeza Indawo',
      xh: 'Yongeza Ipropathi'
    },
    'button.save': {
      en: 'Save',
      af: 'Stoor',
      zu: 'Gcina',
      xh: 'Gcina'
    },
    'button.cancel': {
      en: 'Cancel',
      af: 'Kanselleer',
      zu: 'Khansela',
      xh: 'Rhoxisa'
    },
    'button.delete': {
      en: 'Delete',
      af: 'Verwyder',
      zu: 'Susa',
      xh: 'Cima'
    },
    'button.edit': {
      en: 'Edit',
      af: 'Wysig',
      zu: 'Hlela',
      xh: 'Hlela'
    },
    'button.close': {
      en: 'Close',
      af: 'Sluit',
      zu: 'Vala',
      xh: 'Vala'
    },
    'button.signOut': {
      en: 'Sign Out',
      af: 'Teken Uit',
      zu: 'Phuma',
      xh: 'Phuma'
    },
    'button.saveChanges': {
      en: 'Save Changes',
      af: 'Stoor Veranderinge',
      zu: 'Gcina Izinguquko',
      xh: 'Gcina Utshintsho'
    },
    'button.saveProperty': {
      en: 'Save Property',
      af: 'Stoor Eiendom',
      zu: 'Gcina Indawo',
      xh: 'Gcina Ipropathi'
    },
    'button.addTenant': {
      en: 'Add Tenant',
      af: 'Voeg Huurder By',
      zu: 'Engeza Umqashi',
      xh: 'Yongeza Umqeshi'
    },
    'button.editTenant': {
      en: 'Edit Tenant',
      af: 'Wysig Huurder',
      zu: 'Hlela Umqashi',
      xh: 'Hlela Umqeshi'
    },
    'button.deleteTenant': {
      en: 'Delete Tenant',
      af: 'Verwyder Huurder',
      zu: 'Susa Umqashi',
      xh: 'Cima Umqeshi'
    },
    'button.removeTenant': {
      en: 'Remove Tenant',
      af: 'Verwyder Huurder',
      zu: 'Susa Umqashi',
      xh: 'Susa Umqeshi'
    },
    'button.recordPayment': {
      en: 'Record Payment',
      af: 'Teken Betaling Aan',
      zu: 'Rekhoda Inkokhelo',
      xh: 'Shicilela Intlawulo'
    },
    'button.updatePayment': {
      en: 'Update Payment',
      af: 'Opdateer Betaling',
      zu: 'Vuselela Inkokhelo',
      xh: 'Hlaziya Intlawulo'
    },
    
    // Loading States
    'loading.saving': {
      en: 'Saving...',
      af: 'Stoor...',
      zu: 'Kuyagcinwa...',
      xh: 'Kuyagcinwa...'
    },
    'loading.deleting': {
      en: 'Deleting...',
      af: 'Verwyder...',
      zu: 'Kuyasuswa...',
      xh: 'Kuyacinywa...'
    },
    'loading.loading': {
      en: 'Loading...',
      af: 'Laai...',
      zu: 'Kuyalayisha...',
      xh: 'Kuyalayisha...'
    },
    'loading.recording': {
      en: 'Recording...',
      af: 'Teken aan...',
      zu: 'Kuyarekhoda...',
      xh: 'Kuyashicilela...'
    },
    'loading.updating': {
      en: 'Updating...',
      af: 'Opdateer...',
      zu: 'Kuyavuselela...',
      xh: 'Kuyahlaziya...'
    },
    'loading.removing': {
      en: 'Removing...',
      af: 'Verwyder...',
      zu: 'Kuyasuswa...',
      xh: 'Kuyasuswa...'
    },
    'loading.exporting': {
      en: 'Exporting...',
      af: 'Uitvoer...',
      zu: 'Kuyathumela ngaphandle...',
      xh: 'Kuyathunyelwa ngaphandle...'
    },
    'loading.signingOut': {
      en: 'Signing out...',
      af: 'Teken uit...',
      zu: 'Kuphuma...',
      xh: 'Kuphuma...'
    },
    
    // Settings
    'settings.title': {
      en: 'Settings',
      af: 'Instellings',
      zu: 'Izilungiselelo',
      xh: 'Iisethingi'
    },
    'settings.language': {
      en: 'Language',
      af: 'Taal',
      zu: 'Ulimi',
      xh: 'Ulwimi'
    },
    'settings.languageDescription': {
      en: 'Choose your preferred language',
      af: 'Kies jou voorkeur taal',
      zu: 'Khetha ulimi olukhethile',
      xh: 'Khetha ulwimi oluthandayo'
    },
    'settings.account': {
      en: 'Account',
      af: 'Rekening',
      zu: 'I-akhawunti',
      xh: 'Iakhawunti'
    },
    'settings.accountSettings': {
      en: 'Account Settings',
      af: 'Rekening Instellings',
      zu: 'Izilungiselelo Ze-akhawunti',
      xh: 'Iisethingi Zeakhawunti'
    },
    'settings.profile': {
      en: 'Profile',
      af: 'Profiel',
      zu: 'Iphrofayela',
      xh: 'Iprofayile'
    },
    'settings.name': {
      en: 'Name',
      af: 'Naam',
      zu: 'Igama',
      xh: 'Igama'
    },
    'settings.email': {
      en: 'Email',
      af: 'E-pos',
      zu: 'I-imeyili',
      xh: 'I-imeyili'
    },
    'settings.memberSince': {
      en: 'Member since',
      af: 'Lid sedert',
      zu: 'Ilungu kusukela',
      xh: 'Ulilungu ukususela'
    },
    'settings.editName': {
      en: 'Edit Name',
      af: 'Wysig Naam',
      zu: 'Hlela Igama',
      xh: 'Hlela Igama'
    },
    'settings.changePassword': {
      en: 'Change Password',
      af: 'Verander Wagwoord',
      zu: 'Shintsha Iphasiwedi',
      xh: 'Tshintsha Igama lokugqitha'
    },
    'settings.deleteAccount': {
      en: 'Delete account',
      af: 'Verwyder rekening',
      zu: 'Susa i-akhawunti',
      xh: 'Cima iakhawunti'
    },
    'settings.preferences': {
      en: 'Preferences',
      af: 'Voorkeure',
      zu: 'Okuthandwayo',
      xh: 'Izikhethwa'
    },
    'settings.theme': {
      en: 'Theme',
      af: 'Tema',
      zu: 'Indikimba',
      xh: 'Umxholo'
    },
    'settings.themeLight': {
      en: 'Light',
      af: 'Lig',
      zu: 'Okukhanyayo',
      xh: 'Okukhanyayo'
    },
    'settings.themeDark': {
      en: 'Dark',
      af: 'Donker',
      zu: 'Okumnyama',
      xh: 'Okumnyama'
    },
    'settings.themeSystem': {
      en: 'System',
      af: 'Stelsel',
      zu: 'Isistimu',
      xh: 'Inkqubo'
    },
    'settings.notifications': {
      en: 'Notifications',
      af: 'Kennisgewings',
      zu: 'Izaziso',
      xh: 'Izaziso'
    },
    'settings.emailNotifications': {
      en: 'Email me payment reminders and tenant updates',
      af: 'Stuur my betaling herinneringe en huurder opdaterings',
      zu: 'Ngitheluleleni izikhumbuzo zokukhokha nezibuyekezo zabaqashi',
      xh: 'Ndithumelele izikhumbuzo zokuhlawula nezihlaziya zabaqeshi'
    },
    'settings.comingSoon': {
      en: 'Coming Soon',
      af: 'Kom Binnekort',
      zu: 'Kuyeza Maduze',
      xh: 'Kuyeza Kungekudala'
    },
    'settings.data': {
      en: 'Data',
      af: 'Data',
      zu: 'Idatha',
      xh: 'Idatha'
    },
    'settings.exportData': {
      en: 'Export My Data',
      af: 'Voer My Data Uit',
      zu: 'Thumela Idatha Yami Ngaphandle',
      xh: 'Thumela Idatha Yam Ngaphandle'
    },
    'settings.support': {
      en: 'Support',
      af: 'Ondersteuning',
      zu: 'Ukusekela',
      xh: 'Inkxaso'
    },
    'settings.contactSupport': {
      en: 'Contact Support',
      af: 'Kontak Ondersteuning',
      zu: 'Xhumana Nokusekela',
      xh: 'Qhagamshelana Nenkxaso'
    },
    'settings.sendFeedback': {
      en: 'Send Feedback',
      af: 'Stuur Terugvoer',
      zu: 'Thumela Impendulo',
      xh: 'Thumela Ingxelo'
    },
    
    // Tenants
    'tenants.title': {
      en: 'Tenants',
      af: 'Huurders',
      zu: 'Abaqashi',
      xh: 'Abaqeshi'
    },
    'tenants.allTenants': {
      en: 'All Tenants',
      af: 'Alle Huurders',
      zu: 'Bonke Abaqashi',
      xh: 'Bonke Abaqeshi'
    },
    'tenants.noTenants': {
      en: 'No tenants yet',
      af: 'Nog geen huurders nie',
      zu: 'Akukabikho abaqashi',
      xh: 'Akukabikho baqeshi'
    },
    'tenants.noTenantsFound': {
      en: 'No tenants found',
      af: 'Geen huurders gevind nie',
      zu: 'Akukho baqashi abatholakele',
      xh: 'Akukho baqeshi bafunyenweyo'
    },
    'tenants.getStarted': {
      en: 'Get started by adding your first tenant',
      af: 'Begin deur jou eerste huurder by te voeg',
      zu: 'Qala ngokufaka umqashi wakho wokuqala',
      xh: 'Qalisa ngokongeza umqeshi wakho wokuqala'
    },
    'tenants.noMatches': {
      en: 'No tenants match your filter',
      af: 'Geen huurders pas by jou filter nie',
      zu: 'Akukho baqashi abafana nesihlungi sakho',
      xh: 'Akukho baqeshi bahambelana nesihluzi sakho'
    },
    'tenants.searchPlaceholder': {
      en: 'Search tenants by name or property...',
      af: 'Soek huurders volgens naam of eiendom...',
      zu: 'Sesha abaqashi ngegama noma indawo...',
      xh: 'Khangela abaqeshi ngegama okanye ipropathi...'
    },
    'tenants.addTenant': {
      en: 'Add Tenant',
      af: 'Voeg Huurder By',
      zu: 'Engeza Umqashi',
      xh: 'Yongeza Umqeshi'
    },
    'tenants.addNewTenant': {
      en: 'Add New Tenant',
      af: 'Voeg Nuwe Huurder By',
      zu: 'Engeza Umqashi Omusha',
      xh: 'Yongeza Umqeshi Omtsha'
    },
    'tenants.tenantDetails': {
      en: 'Tenant Details',
      af: 'Huurder Besonderhede',
      zu: 'Imininingwane Yomqashi',
      xh: 'Iinkcukacha Zomqeshi'
    },
    'tenants.loadingTenants': {
      en: 'Loading tenants...',
      af: 'Laai huurders...',
      zu: 'Kulayisha abaqashi...',
      xh: 'Kuyalayisha abaqeshi...'
    },
    
    // Property Details
    'property.addProperty': {
      en: 'Add Property',
      af: 'Voeg Eiendom By',
      zu: 'Engeza Indawo',
      xh: 'Yongeza Ipropathi'
    },
    'property.editName': {
      en: 'Edit Name',
      af: 'Wysig Naam',
      zu: 'Hlela Igama',
      xh: 'Hlela Igama'
    },
    'property.monthlyRent': {
      en: 'Monthly Rent',
      af: 'Maandelikse Huur',
      zu: 'Irenti Yenyanga',
      xh: 'Irenti Yenyanga'
    },
    'property.nextDue': {
      en: 'Next rent due',
      af: 'Volgende huur verskuldig',
      zu: 'Irenti elandelayo kufanele kukhokhwe',
      xh: 'Irenti elandelayo kufuneka ihlawulwe'
    },
    'property.due': {
      en: 'Due',
      af: 'Verskuldig',
      zu: 'Kufanele kukhokhwe',
      xh: 'Kufuneka kuhlawulwe'
    },
    'property.occupied': {
      en: 'Occupied',
      af: 'Beset',
      zu: 'Kuhlalwe',
      xh: 'Kuhlaliwe'
    },
    'property.remaining': {
      en: 'remaining',
      af: 'oor',
      zu: 'esele',
      xh: 'eseleyo'
    }
  };

  constructor() {
    this.initialize();
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    localStorage.setItem('propza_language', lang);
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage()] || translation.en;
  }
  
  // Shorthand method
  t(key: string): string {
    return this.translate(key);
  }

  // Initialize from localStorage
  initialize(): void {
    const savedLang = localStorage.getItem('propza_language') as Language;
    if (savedLang && ['en', 'af', 'zu', 'xh'].includes(savedLang)) {
      this.currentLanguage.set(savedLang);
      return;
    }
    // Auto-detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'af' || browserLang === 'zu' || browserLang === 'xh') {
      this.currentLanguage.set(browserLang as Language);
    }
  }
}

