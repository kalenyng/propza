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
    'settings.profile': {
      en: 'Profile',
      af: 'Profiel',
      zu: 'Iphrofayela',
      xh: 'Iprofayile'
    },
    'settings.changePassword': {
      en: 'Change Password',
      af: 'Verander Wagwoord',
      zu: 'Shintsha Iphasiwedi',
      xh: 'Tshintsha Igama lokugqitha'
    },
    'settings.deleteAccount': {
      en: 'Delete Account',
      af: 'Verwyder Rekening',
      zu: 'Susa I-akhawunti',
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
    'settings.notifications': {
      en: 'Notifications',
      af: 'Kennisgewings',
      zu: 'Izaziso',
      xh: 'Izaziso'
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
    'tenants.addTenant': {
      en: 'Add Tenant',
      af: 'Voeg Huurder By',
      zu: 'Engeza Umqashi',
      xh: 'Yongeza Umqeshi'
    },
    
    // Property Details
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

