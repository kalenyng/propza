import { Injectable, signal } from '@angular/core';
import { LoggerService } from './logger.service';

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
      // 🌅 MORNING (Before 12 PM)
          'greeting.morning.day0': { // Sunday
            en: 'Good morning',
            af: 'Goeie môre',
            zu: 'Sawubona ekuseni',
            xh: 'Molo kusasa'
          },
          'greeting.morning.day1': { // Monday
            en: 'Morning',
            af: 'Môre',
            zu: 'Sawubona',
            xh: 'Molo'
          },
          'greeting.morning.day2': { // Tuesday
            en: 'Rise and shine',
            af: 'Staan op en skyn',
            zu: 'Vuka uvuke kahle',
            xh: 'Vuka ukhazimle'
          },
          'greeting.morning.day3': { // Wednesday
            en: 'Hope your day starts well',
            af: 'Hoop jou dag begin goed',
            zu: 'Ngithemba usuku lwakho luqale kahle',
            xh: 'Ndinqwenela ukuba usuku lwakho luqale kakuhle'
          },
          'greeting.morning.day4': { // Thursday
            en: 'Morning sunshine',
            af: 'Môre sonnestraal',
            zu: 'Sawubona langa',
            xh: 'Molo lilanga'
          },
          'greeting.morning.day5': { // Friday
            en: 'Happy Friday',
            af: 'Gelukkige Vrydag',
            zu: 'Ube noLwesihlanu omuhle',
            xh: 'Ube noLwesihlanu oluhle'
          },
          'greeting.morning.day6': { // Saturday
            en: 'Enjoy your weekend',
            af: 'Geniet jou naweek',
            zu: 'Jabulela impelasonto yakho',
            xh: 'Yonwabela impelaveki yakho'
          },

          // 🌞 AFTERNOON (12 PM – 4:59 PM)
          'greeting.afternoon.day0': { // Sunday
            en: 'Hope you’re having a relaxing day',
            af: 'Hoop jy rus lekker vandag',
            zu: 'Ngithemba uphumula kahle namhlanje',
            xh: 'Ndinethemba ukuba uphumla kakuhle namhlanje'
          },
          'greeting.afternoon.day1': { // Monday
            en: 'Good afternoon',
            af: 'Goeie middag',
            zu: 'Sawubona ntambama',
            xh: 'Molo emini'
          },
          'greeting.afternoon.day2': { // Tuesday
            en: 'Hello there',
            af: 'Hallo daar',
            zu: 'Yebo lapho',
            xh: 'Molo apho'
          },
          'greeting.afternoon.day3': { // Wednesday
            en: 'Hope your afternoon’s going well',
            af: 'Hoop jou middag gaan goed',
            zu: 'Ngithemba ntambama yakho imnandi',
            xh: 'Ndinqwenela ukuba emini yakho imnandi'
          },
          'greeting.afternoon.day4': { // Thursday
            en: 'Howzit',
            af: 'Hoe gaan dit',
            zu: 'Kunjani',
            xh: 'Kunjani'
          },
          'greeting.afternoon.day5': { // Friday
            en: 'Happy Friday',
            af: 'Gelukkige Vrydag',
            zu: 'Ube noLwesihlanu omuhle',
            xh: 'Ube noLwesihlanu oluhle'
          },
          'greeting.afternoon.day6': { // Saturday
            en: 'Enjoy your weekend',
            af: 'Geniet jou naweek',
            zu: 'Jabulela impelasonto yakho',
            xh: 'Yonwabela impelaveki yakho'
          },

          // 🌙 EVENING (5 PM onwards)
          'greeting.evening.day0': { // Sunday
            en: 'Good evening',
            af: 'Goeie naand',
            zu: 'Sawubona kusihlwa',
            xh: 'Molo ngokuhlwa'
          },
          'greeting.evening.day1': { // Monday
            en: 'Hope you had a good day',
            af: 'Hoop jy het ’n goeie dag gehad',
            zu: 'Ngithemba usuku lwakho beluhle',
            xh: 'Ndinethemba ukuba usuku lwakho beluhle'
          },
          'greeting.evening.day2': { // Tuesday
            en: 'Good evening',
            af: 'Goeie naand',
            zu: 'Sawubona kusihlwa',
            xh: 'Molo ngokuhlwa'
          },
          'greeting.evening.day3': { // Wednesday
            en: 'Evening',
            af: 'Naand',
            zu: 'Sekusihlwa',
            xh: 'Lixesha lokuhlwa'
          },
          'greeting.evening.day4': { // Thursday
            en: 'Hope your evening’s easy',
            af: 'Hoop jy ontspan vanaand',
            zu: 'Ngithemba ubusuku bakho buhle',
            xh: 'Ndinqwenela ukuba ubusuku bakho bumnandi'
          },
          'greeting.evening.day5': { // Friday
            en: 'Friday evening vibes',
            af: 'Vrydag-aand vibes',
            zu: 'ULwesihlanu kusihlwa',
            xh: 'ULwesihlanu ngokuhlwa'
          },
          'greeting.evening.day6': { // Saturday
            en: 'Enjoy your weekend evening',
            af: 'Geniet jou naweek-aand',
            zu: 'Jabulela ubusuku bakho beimpelasonto',
            xh: 'Yonwabela ubusuku bakho beempelaveki'
          },



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
    'settings.sectionAccount': {
      en: 'Account',
      af: 'Rekening',
      zu: 'I-akhawunti',
      xh: 'Iakhawunti'
    },
    'settings.sectionProperty': {
      en: 'Property management',
      af: 'Eiendomsbestuur',
      zu: 'Ukuphathwa kwezimpahla',
      xh: 'Ulawulo lweepropati'
    },
    'settings.sectionAppearance': {
      en: 'Appearance',
      af: 'Voorkoms',
      zu: 'Ukubukeka',
      xh: 'Ukubonakala'
    },
    'settings.sectionSupport': {
      en: 'Support',
      af: 'Ondersteuning',
      zu: 'Ukusekela',
      xh: 'Inkxaso'
    },
    'settings.security': {
      en: 'Security',
      af: 'Sekuriteit',
      zu: 'Ukuphepha',
      xh: 'Ukhuseleko'
    },
    'settings.currency': {
      en: 'Currency',
      af: 'Geldeenheid',
      zu: 'Imali',
      xh: 'Imali'
    },
    'settings.rentDefaults': {
      en: 'Rent defaults',
      af: 'Huur verstekke',
      zu: 'Izilungiselelo zokubhukha',
      xh: 'Iindlela zokuhlawula'
    },
    'settings.reminderTiming': {
      en: 'Reminder timing',
      af: 'Herinnering tyding',
      zu: 'Isikhathi sezikhumbuzo',
      xh: 'Ixesha lezikhumbuzo'
    },
    'settings.compactMode': {
      en: 'Compact mode',
      af: 'Kompakte modus',
      zu: 'Imodi encane',
      xh: 'Imowudi encinci'
    },
    'settings.reduceAnimations': {
      en: 'Reduce animations',
      af: 'Verminder animasies',
      zu: 'Nciphisa izinto ezihambayo',
      xh: 'Nciphisa iintlobo ezihambayo'
    },
    'settings.helpCenter': {
      en: 'Help center',
      af: 'Hulp sentrum',
      zu: 'Isikhungo sosizo',
      xh: 'Isikhululo soncedo'
    },
    'settings.reportBug': {
      en: 'Report a bug',
      af: 'Rapporteer \'n fout',
      zu: 'Bika i-bug',
      xh: 'Xela i-bug'
    },
    'settings.about': {
      en: 'About',
      af: 'Oor',
      zu: 'Mayelana',
      xh: 'Malunga'
    },
    'settings.planPro': {
      en: 'Pro',
      af: 'Pro',
      zu: 'Pro',
      xh: 'Pro'
    },
    'settings.pageSubtitle': {
      en: 'Workspace, preferences & help',
      af: 'Werkspasie, voorkeure & hulp',
      zu: 'Indawo yomsebenzi, okuthandwayo nosizo',
      xh: 'Indawo yomsebenzi, iikhethwa kuncedo'
    },
    'settings.stateOn': {
      en: 'On',
      af: 'Aan',
      zu: 'Kuvuliwe',
      xh: 'Ivuliwe'
    },
    'settings.stateOff': {
      en: 'Off',
      af: 'Af',
      zu: 'Valiwe',
      xh: 'Icimile'
    },
    'settings.tapToChange': {
      en: 'Tap to change',
      af: 'Tik om te verander',
      zu: 'Thepha ukuze ushintshe',
      xh: 'Cofa ukuze utshintshe'
    },
    'settings.comingSoonShort': {
      en: 'Soon',
      af: 'Binnekort',
      zu: 'Maduzane',
      xh: 'Kungekudala'
    },
    'settings.exportSummary': {
      en: 'Download your data',
      af: 'Laai jou data af',
      zu: 'Landa idatha yakho',
      xh: 'Khuphela idatha yakho'
    },
    'settings.legal': {
      en: 'Legal',
      af: 'Regs',
      zu: 'Ezomthetho',
      xh: 'Ezomthetho'
    },
    'support.quickStartGuide': {
      en: 'Quick Start Guide',
      af: 'Vinnige Start Gids',
      zu: 'Isikhokelo Sokuqala Ngokushesha',
      xh: 'Isikhokelo Sokuqala Ngokukhawuleza'
    },
    'support.quickStartDescription': {
      en: 'Learn how to get started with Propza in just a few steps',
      af: 'Leer hoe om met Propza te begin in net \'n paar stappe',
      zu: 'Funda ukuthi ungabaqala kanjani nge-Propza ngezinyathelo ezimbalwa',
      xh: 'Funda ukuba ungaqala njani nge-Propza ngezinyathelo ezimbalwa'
    },
    'support.viewGuide': {
      en: 'View Guide',
      af: 'Bekyk Gids',
      zu: 'Buka Isikhokelo',
      xh: 'Jonga Isikhokelo'
    },
    'support.contactSupport': {
      en: 'Contact Support',
      af: 'Kontak Ondersteuning',
      zu: 'Xhumana Nokusekela',
      xh: 'Qhagamshelana Nenkxaso'
    },
    'support.contactDescription': {
      en: 'Get help from our support team via email',
      af: 'Kry hulp van ons ondersteuningspan via e-pos',
      zu: 'Thola usizo oluvela eqenjini lethu lokusekela nge-imeyili',
      xh: 'Fumana uncedo oluvela kwiqela lethu lokuxhasa nge-imeyili'
    },
    'support.emailSupport': {
      en: 'Email Support',
      af: 'E-pos Ondersteuning',
      zu: 'Ukusekela Kwe-imeyili',
      xh: 'Uxhaso Lwe-imeyili'
    },
    'support.openEmailApp': {
      en: 'Open in email app',
      af: 'Maak in e-posprogram oop',
      zu: 'Vula kusofthiwe wama-imeyili',
      xh: 'Vula kwi-app ye-imeyile'
    },
    'support.copyEmail': {
      en: 'Copy email address',
      af: 'Kopieer e-posadres',
      zu: 'Kopisha ikheli le-imeyili',
      xh: 'Khuphela idilesi ye-imeyile'
    },
    'support.emailCopied': {
      en: 'Email address copied',
      af: 'E-posadres gekopieer',
      zu: 'Ikheli le-imeyili likopishwe',
      xh: 'Idilesi ye-imeyile ikhutshelwe'
    },
    'support.emailCopyFailed': {
      en: 'Could not copy — select the address above to copy manually',
      af: 'Kon nie kopieer nie — kies die adres hierbo om handmatig te kopieer',
      zu: 'Ayikwazanga ukukopisha — khetha ikheli ngenhla ukuze ukopishe ngesandla',
      xh: 'Ayikwazanga ukukopisha — khetha idilesi ngasentla uze ukope ngesandla'
    },
    'support.reportIssues': {
      en: 'Report Issues',
      af: 'Rapporteer Kwessies',
      zu: 'Bika Izinkinga',
      xh: 'Xela Iingxaki'
    },
    'support.reportDescription': {
      en: 'Report bugs or request new features',
      af: 'Rapporteer foute of versoek nuwe funksies',
      zu: 'Bika ama-bug noma cela izici ezintsha',
      xh: 'Xela iingxaki okanye cela izinto ezintsha'
    },
    'support.bugReport': {
      en: 'Report a Bug',
      af: 'Rapporteer \'n Fout',
      zu: 'Bika I-Bug',
      xh: 'Xela Iingxaki'
    },
    'support.featureRequest': {
      en: 'Request a Feature',
      af: 'Versoek \'n Funksie',
      zu: 'Cela Isici',
      xh: 'Cela Into'
    },
    'support.accountManagement': {
      en: 'Account Management',
      af: 'Rekening Bestuur',
      zu: 'Ukuphatha I-akhawunti',
      xh: 'Ukuphatha I-akhawunti'
    },
    'support.accountDescription': {
      en: 'Manage your account settings and security',
      af: 'Bestuur jou rekening instellings en sekuriteit',
      zu: 'Phatha izilungiselelo ze-akhawunti yakho nobuqiniso',
      xh: 'Phatha izicwangciso ze-akhawunti yakho nobuqiniso'
    },
    'support.passwordReset': {
      en: 'Reset Password',
      af: 'Herstel Wagwoord',
      zu: 'Buyisela Iphasiwedi',
      xh: 'Buyisela Iphasiwedi'
    },
    'support.legal': {
      en: 'Legal',
      af: 'Wetlik',
      zu: 'Okusemthethweni',
      xh: 'Okusemthethweni'
    },
    'support.legalDescription': {
      en: 'Privacy policy and terms of service',
      af: 'Privaatheid beleid en diensvoorwaardes',
      zu: 'Inqubomgomo yobumfihlo nemigomo yesevisi',
      xh: 'Inqubomgomo yobumfihlo nemigomo yesevisi'
    },
    'support.privacyPolicy': {
      en: 'Privacy Policy',
      af: 'Privaatheid Beleid',
      zu: 'Inqubomgomo Yobumfihlo',
      xh: 'Inqubomgomo Yobumfihlo'
    },
    'support.termsAndConditions': {
      en: 'Terms & Conditions',
      af: 'Bepalings en Voorwaardes',
      zu: 'Imigomo Nezimo',
      xh: 'Imigomo Nezimo'
    },

    // Quick Start Guide
    'quickStart.step1Title': {
      en: 'Add Your Properties',
      af: 'Voeg Jou Eiendomme By',
      zu: 'Faka Izakhiwo Zakho',
      xh: 'Faka Izakhiwo Zakho'
    },
    'quickStart.step1Description': {
      en: 'Start by adding your rental properties with details like address, rent amount, and currency.',
      af: 'Begin deur jou huur eiendomme by te voeg met besonderhede soos adres, huur bedrag en geldeenheid.',
      zu: 'Qala ngokufaka izakhiwo zakho zokuqasha ngemininingwane efana nendawo, imali yokuqasha kanye nemali.',
      xh: 'Qala ngokufaka izakhiwo zakho zokuqasha ngemininingwane efana nendawo, imali yokuqasha kanye nemali.'
    },
    'quickStart.step2Title': {
      en: 'Add Tenants',
      af: 'Voeg Huurders By',
      zu: 'Faka Abaqashi',
      xh: 'Faka Abaqashi'
    },
    'quickStart.step2Description': {
      en: 'Assign tenants to your properties and set up their rent details, lease dates, and contact information.',
      af: 'Ken huurders aan jou eiendomme toe en stel hul huur besonderhede, huurkontrak datums en kontak inligting op.',
      zu: 'Nikeza abaqashi izakhiwo zakho bese ubeka imininingwane yabo yokuqasha, izinsuku zokuqasha kanye nemininingwane yokuxhumana.',
      xh: 'Nikeza abaqashi izakhiwo zakho bese ubeka imininingwane yabo yokuqasha, izinsuku zokuqasha kanye nemininingwane yokuxhumana.'
    },
    'quickStart.step3Title': {
      en: 'Track Payments',
      af: 'Volg Betalings',
      zu: 'Landela Izinkokhelo',
      xh: 'Landela Izinkokhelo'
    },
    'quickStart.step3Description': {
      en: 'Monitor rent payments, track overdue amounts, and manage payment history for each tenant.',
      af: 'Monitor huur betalings, volg agterstallige bedrae, en bestuur betaling geskiedenis vir elke huurder.',
      zu: 'Bheka izinkokhelo zokuqasha, landela imali engakhokhelwanga, bese uphatha umlando wezinkokhelo zomqashi ngamunye.',
      xh: 'Bheka izinkokhelo zokuqasha, landela imali engakhokhelwanga, bese uphatha umlando wezinkokhelo zomqashi ngamunye.'
    },
    'quickStart.step4Title': {
      en: 'Stay Organized',
      af: 'Bly Georganiseer',
      zu: 'Hlala Uhlelekile',
      xh: 'Hlala Uhlelekile'
    },
    'quickStart.step4Description': {
      en: 'Use filters to view properties by status, search for specific tenants, and keep everything organized.',
      af: 'Gebruik filters om eiendomme volgens status te sien, soek vir spesifieke huurders, en hou alles georganiseer.',
      zu: 'Sebenzisa izihlungi ukubona izakhiwo ngokwesimo, funa abaqashi abathile, bese ugcina konke kuhlelekile.',
      xh: 'Sebenzisa izihlungi ukubona izakhiwo ngokwesimo, funa abaqashi abathile, bese ugcina konke kuhlelekile.'
    },

    // Bug Report
    'bugReport.description': {
      en: 'Bug Description',
      af: 'Fout Beskrywing',
      zu: 'Incazelo Yephutha',
      xh: 'Incazelo Yephutha'
    },
    'bugReport.descriptionPlaceholder': {
      en: 'Describe the bug you encountered in detail...',
      af: 'Beskryf die fout wat jy teëgekom het in detail...',
      zu: 'Chaza iphutha olitholile ngokuningiliziwe...',
      xh: 'Chaza iphutha olitholile ngokuningiliziwe...'
    },
    'bugReport.descriptionRequired': {
      en: 'Please describe the bug',
      af: 'Beskryf asseblief die fout',
      zu: 'Sicela uchaze iphutha',
      xh: 'Sicela uchaze iphutha'
    },
    'bugReport.steps': {
      en: 'Steps to Reproduce',
      af: 'Stappe om te Herproduseer',
      zu: 'Izinyathelo Zokubuyisela',
      xh: 'Izinyathelo Zokubuyisela'
    },
    'bugReport.stepsPlaceholder': {
      en: '1. Go to...\n2. Click on...\n3. See error...',
      af: '1. Gaan na...\n2. Klik op...\n3. Sien fout...',
      zu: '1. Iya ku...\n2. Chofoza ku...\n3. Bona iphutha...',
      xh: '1. Iya ku...\n2. Chofoza ku...\n3. Bona iphutha...'
    },
    'bugReport.expected': {
      en: 'Expected Behavior',
      af: 'Verwagte Gedrag',
      zu: 'Ukuziphatha Okulindelwe',
      xh: 'Ukuziphatha Okulindelwe'
    },
    'bugReport.expectedPlaceholder': {
      en: 'What should have happened instead?',
      af: 'Wat moes gebeur het in plaas daarvan?',
      zu: 'Kufanele kwenzeke ini esikhundleni?',
      xh: 'Kufanele kwenzeke ini esikhundleni?'
    },

    // Feature Request
    'featureRequest.title': {
      en: 'Feature Title',
      af: 'Funksie Titel',
      zu: 'Isihloko Sesici',
      xh: 'Isihloko Sesici'
    },
    'featureRequest.titlePlaceholder': {
      en: 'Brief title for your feature request...',
      af: 'Kort titel vir jou funksie versoek...',
      zu: 'Isihloko esifushane sesicelo sakho sesici...',
      xh: 'Isihloko esifushane sesicelo sakho sesici...'
    },
    'featureRequest.titleRequired': {
      en: 'Please enter a title',
      af: 'Voer asseblief \'n titel in',
      zu: 'Sicela ufake isihloko',
      xh: 'Sicela ufake isihloko'
    },
    'featureRequest.description': {
      en: 'Feature Description',
      af: 'Funksie Beskrywing',
      zu: 'Incazelo Yesici',
      xh: 'Incazelo Yesici'
    },
    'featureRequest.descriptionPlaceholder': {
      en: 'Describe the feature you would like to see...',
      af: 'Beskryf die funksie wat jy graag wil sien...',
      zu: 'Chaza isici osifuna ukusibona...',
      xh: 'Chaza isici osifuna ukusibona...'
    },
    'featureRequest.descriptionRequired': {
      en: 'Please describe the feature',
      af: 'Beskryf asseblief die funksie',
      zu: 'Sicela uchaze isici',
      xh: 'Sicela uchaze isici'
    },
    'featureRequest.useCase': {
      en: 'Use Case',
      af: 'Gebruik Geval',
      zu: 'Isimo Sokusebenzisa',
      xh: 'Isimo Sokusebenzisa'
    },
    'featureRequest.useCasePlaceholder': {
      en: 'How would this feature help you?',
      af: 'Hoe sal hierdie funksie jou help?',
      zu: 'Lolu sici luzokusiza kanjani?',
      xh: 'Lolu sici luzokusiza kanjani?'
    },
    'featureRequest.priority': {
      en: 'Priority',
      af: 'Prioriteit',
      zu: 'Okubalulekile',
      xh: 'Okubalulekile'
    },
    'featureRequest.priorityLow': {
      en: 'Low',
      af: 'Laag',
      zu: 'Phansi',
      xh: 'Phantsi'
    },
    'featureRequest.priorityMedium': {
      en: 'Medium',
      af: 'Medium',
      zu: 'Phakathi',
      xh: 'Phakathi'
    },
    'featureRequest.priorityHigh': {
      en: 'High',
      af: 'Hoog',
      zu: 'Phezulu',
      xh: 'Phezulu'
    },

    // Password Reset
    'passwordReset.email': {
      en: 'Email Address',
      af: 'E-pos Adres',
      zu: 'Ikheli Le-imeyili',
      xh: 'Idilesi Ye-imeyili'
    },
    'passwordReset.emailPlaceholder': {
      en: 'Enter your email address',
      af: 'Voer jou e-pos adres in',
      zu: 'Faka ikheli lakho le-imeyili',
      xh: 'Faka idilesi yakho ye-imeyili'
    },
    'passwordReset.emailRequired': {
      en: 'Email is required',
      af: 'E-pos is vereis',
      zu: 'I-imeyili iyadingeka',
      xh: 'I-imeyili iyadingeka'
    },
    'passwordReset.emailInvalid': {
      en: 'Please enter a valid email',
      af: 'Voer asseblief \'n geldige e-pos in',
      zu: 'Sicela ufake i-imeyili evumelekile',
      xh: 'Sicela ufake i-imeyili evumelekile'
    },
    'passwordReset.info': {
      en: 'We\'ll send you a password reset link to this email address.',
      af: 'Ons sal jou \'n wagwoord herstel skakel na hierdie e-pos adres stuur.',
      zu: 'Sizokuthumela isixhumanisi sokubuyisela iphasiwedi kule ikheli le-imeyili.',
      xh: 'Sizokuthumela isixhumanisi sokubuyisela iphasiwedi kule ikheli le-imeyili.'
    },
    'passwordReset.success': {
      en: 'Password reset link sent! Check your email for instructions.',
      af: 'Wagwoord herstel skakel gestuur! Kyk na jou e-pos vir instruksies.',
      zu: 'Isixhumanisi sokubuyisela iphasiwedi sithunyelwe! Bheka i-imeyili yakho iziyalo.',
      xh: 'Isixhumanisi sokubuyisela iphasiwedi sithunyelwe! Bheka i-imeyili yakho iziyalo.'
    },

    // Privacy Policy
    'privacy.lastUpdated': {
      en: 'Last Updated',
      af: 'Laas Opgedateer',
      zu: 'Kugcina Ukubuyekezwa',
      xh: 'Kugcina Ukubuyekezwa'
    },
    'privacy.lastUpdatedDate': {
      en: 'May 15, 2026',
      af: '15 Mei 2026',
      zu: '15 Meyi 2026',
      xh: '15 Meyi 2026'
    },
    'privacy.dataCollection': {
      en: 'Data Collection',
      af: 'Data Versameling',
      zu: 'Ukuqoqwa Kwedatha',
      xh: 'Ukuqoqwa Kwedatha'
    },
    'privacy.dataCollectionDescription': {
      en: 'We collect the following categories of personal information in order to provide our property management services: account information such as name and email address (authentication credentials are securely managed by our authentication provider); property details (addresses, rental amounts, lease dates); tenant information (names, email addresses, phone numbers); payment records and financial history; uploaded documents such as signed lease agreements; and usage data such as login activity and in-app actions.',
      af: 'Ons versamel die volgende kategorieë persoonlike inligting om ons eiendom bestuur dienste te lewer: rekening inligting soos naam en e-posadres (verifikasiebewyse word veilig bestuur deur ons verifikasieverskaffer); eiendom besonderhede (adresse, huurhoeveelhede, huurkontrakdatums); huurder inligting (name, e-posadresse, telefoonnommers); betaling rekords en finansiële geskiedenis; opgelaaide dokumente soos getekende huurkontrakte; en gebruiksdata soos aanteken-aktiwiteit en in-program aksies.',
      zu: 'Siqoqa lezi zikhlobo ezilandelayo zolwazi lomuntu siqu ukuze sinikeze izinsiza zethu zokuphatha izakhiwo: ulwazi lwe-akhawunti njengegama nekheli le-imeyili (izimpawu zokuqinisekisa zigcinwa ngokukhusela yumhlinzeki wethu wokuqinisekisa); imininingwane yezakhiwo (amakheli, imali yokuqasha, izinsuku ze-inkontileka); imininingwane yabaqashi (amagama, amakheli e-imeyili, izinombolo zohlelo); amarekhodi ezinkokhelo nomlando wezezimali; amadokhumenti aphoswe njengeninkontileka zokuqasha ezisayiniwe; nedatha yokusetshenziswa efana nomsebenzi wokungena nendlela ye-app.',
      xh: 'Siqoqa ezi zikhondo zilandelayo zolwazi lomuntu siqu ukuze sinikeze iinkonzo zethu zokuphatha iipropati: ulwazi lweakhawunti olufana negama nedilesi ye-imeyile (iimpawu zokuqinisekiswa zigcinwa ngokukhuseleka ngumnikeli wethu wokuqinisekiswa); iinkcukacha zepropati (iidilesi, imixa yerenti, iimini zenkontileka); ulwazi lwabaqeshi (amagama, iidilesi ze-imeyile, iinombolo zomnxeba); amarekhodi entlawulo nomlando wezezimali; amaxwebhu angenisiweyo anjengezivumelwano zokuqasha ezisayiniweyo; nedatha yokusetyenziswa efana nomsebenzi wokungena nakwizenzo ze-app.'
    },
    'privacy.dataUsage': {
      en: 'Data Usage',
      af: 'Data Gebruik',
      zu: 'Ukusetshenziswa Kwedatha',
      xh: 'Ukusetshenziswa Kwedatha'
    },
    'privacy.dataUsageDescription': {
      en: 'We use your data for the following purposes: providing and operating the Propza platform; managing your properties, tenants, and payment records; sending payment reminders and notifications; generating reports and financial summaries; authenticating your identity and maintaining account security; improving our service through anonymised usage analytics; and communicating with you about your account or service updates.',
      af: 'Ons gebruik jou data vir die volgende doeleindes: verskaffing en bedryf van die Propza-platform; bestuur van jou eiendomme, huurders en betalingsrekords; stuur van betalingsherinneringe en kennisgewings; genereer van verslae en finansiële opsommings; verifikasie van jou identiteit en handhawing van rekeningveiligheid; verbetering van ons diens deur geanonimiseerde gebruiksanalise; en kommunikasie met jou oor jou rekening of diensopdaterings.',
      zu: 'Sisebenzisa idatha yakho ngezinhloso ezilandelayo: ukuhlinzekwa nokuqhuba isikhundla se-Propza; ukuphatha izakhiwo zakho, abaqashi, namarekhodi ezinkokhelo; ukuthumela izikhumbuzo zokukhokha nezaziso; ukukhiqiza imibiko nezibopho zezimali; ukunqinisekisa ubunjalo bakho nokugcina ukuphepha kwe-akhawunti; ukuthuthukisa insiza yethu ngokusebenzisa ukuhlaziywa kokusebenzisa okwenziwe ngaphandle kwegama; nokukhulumisana nawe mayelana ne-akhawunti yakho noma izibuyekezo zensiza.',
      xh: 'Sisebenzisa idatha yakho ngeenjongo ezilandelayo: ukunikezwa nokusebenziswa kweqonga le-Propza; ukuphatha iipropati zakho, abaqeshi, namarekhodi entlawulo; ukuthumela izikhumbuzo zokuhlawula nezaziso; ukukhiqiza iingxelo nezishwankathelo zemali; ukuqinisekisa isazisi sakho nokugcina ukhuseleko lweakhawunti; ukuphucula inkonzo yethu ngokusetyenziswa kwezinto ezihlaziyiweyo ngaphandle kwegama; nokuxhumana nawe malunga neakhawunti yakho okanye izibuyekezo zenkonzo.'
    },
    'privacy.legalBasis': {
      en: 'Legal Basis for Processing',
      af: 'Regsgrondslag vir Verwerking',
      zu: 'Isisekelo Sokomthetho Sokuhlela',
      xh: 'Isiseko Somthetho Sokucutha'
    },
    'privacy.legalBasisDescription': {
      en: 'We process your personal data on the following legal bases: (1) Contract — processing is necessary to provide the services you have signed up for; (2) Legitimate interest — to improve our platform, detect fraud, and maintain security; (3) Legal obligation — where we are required to retain records under applicable South African law, including the Protection of Personal Information Act, 2013 ("POPIA"). Where we rely on legitimate interest, we balance this against your rights and freedoms.',
      af: 'Ons verwerk jou persoonlike data op die volgende regsgrondslae: (1) Kontrak — verwerking is nodig om die dienste te lewer waarvoor jy aangemeld het; (2) Geregverdigde belang — om ons platform te verbeter, bedrog op te spoor en sekuriteit te handhaaf; (3) Regsverbintenis — waar ons verplig is om rekords ingevolge toepaslike Suid-Afrikaanse reg te hou, insluitend die Wet op Beskerming van Persoonlike Inligting, 2013 ("POPIA"). Waar ons staat maak op geregverdigde belang, weeg ons dit teen jou regte en vryhede op.',
      zu: 'Sihlela ulwazi lwakho lomuntu siqu ngezikhalo ezilandelayo zokomthetho: (1) Inkontileka — ukuhlela kudingeka ukunikeza izinsiza ozikhokhelile; (2) Intende efanele — ukuthuthukisa isikhundla sethu, ukuphenywa kobubi, nokugcina ukuphepha; (3) Isibopho sokomthetho — lapho sidingekile ukugcina amarekhodi ngaphansi komthetho waseNingizimu Afrika osebenzayo, kufaka phakathi uMthetho Wokuvikelwa Kolwazi Lomuntu Siqu (POPIA). Lapho sincike entendeni efanele, silinganisa lokhu namalungelo akho nenkululeko.',
      xh: 'Siyicutha idatha yakho yomuntu siqu ngezikhalazo ezilandelayo zemthetho: (1) Inkontileka — ukucuthwa kudingeka ukunikeza iinkonzo owazibhalelayo; (2) Umdla ofanelekileyo — ukuphucula iqonga lethu, ukuphenywa ubuqhophololo, nokugcina ukhuseleko; (3) Isibopho somthetho — apho sifuneka ukugcina amarekhodi phantsi komthetho waseNtshona Afrika osebenzayo, kubandakanya uMthetho Wokukhusela Ulwazi Lomuntu Siqu (POPIA). Apho sixhomekeka kumdla ofanelekileyo, sibeka eli nzima kumalungelo akho nenkululeko.'
    },
    'privacy.dataSharing': {
      en: 'Data Sharing',
      af: 'Data Deling',
      zu: 'Ukwabelana Ngedatha',
      xh: 'Ukwabelana Ngedatha'
    },
    'privacy.dataSharingDescription': {
      en: 'We only share data with trusted service providers who help us deliver our services, and only to the extent necessary.',
      af: 'Ons deel slegs data met vertroude diensverskaffers wat ons help om ons dienste te lewer, en slegs tot die mate wat nodig is.',
      zu: 'Sabelana ngedatha kuphela nabahlinzeki bezinsiza abathembekile abasiza ukuletha izinsiza zethu, futhi kuphela ngezinga elidingekayo.',
      xh: 'Sabelana ngedatha kuphela nabahlinzeki bezinsiza abathembekile abasiza ukuletha izinsiza zethu, futhi kuphela ngezinga elidingekayo.'
    },
    'privacy.internationalTransfers': {
      en: 'International Data Transfers',
      af: 'Internasionale Data-oordragte',
      zu: 'Ukudluliswa Kwedatha Ezweni Laphetsheya',
      xh: 'Ukudluliselwa Kwedatha Kwaphesheya'
    },
    'privacy.internationalTransfersDescription': {
      en: 'Propza uses infrastructure providers — including Supabase and Vercel — that may store and process your data on servers located outside of South Africa, including in the United States and European Union. We take steps to ensure that appropriate safeguards are in place for such transfers, including relying on providers that maintain recognised data protection standards. By using Propza, you acknowledge that your data may be processed internationally.',
      af: 'Propza gebruik infrastruktuurverskaffers — insluitend Supabase en Vercel — wat jou data op bedieners buite Suid-Afrika, insluitend in die Verenigde State en die Europese Unie, kan stoor en verwerk. Ons neem stappe om te verseker dat toepaslike voorsorgmaatreëls in plek is vir sulke oordragte, insluitend die vertroue op verskaffers wat erkende databeskermingstandaarde handhaaf. Deur Propza te gebruik, erken jy dat jou data internasionaal verwerk kan word.',
      zu: 'I-Propza isebenzisa abahlinzeki bezingqalasizinda — kufaka phakathi i-Supabase ne-Vercel — abangathenga bagcine futhi bahlele idatha yakho emaservereni angaphandle kweNingizimu Afrika, kufaka phakathi e-United States ne-European Union. Sithatha izinyathelo zokuqinisekisa ukuthi iziqondiso ezifanele zikhona zokudlulisa okunjalo, kufaka phakathi ukuncika kubahlinzeki abagcina imikhakha eyaziwa yokuvikela idatha. Ngokusebenzisa i-Propza, uyaqonda ukuthi idatha yakho ingahlela emazweni aphetsheya.',
      xh: 'I-Propza isebenzisa abaxhasi bezingqalasizinda — kubandakanya i-Supabase ne-Vercel — abanokungathenga bagcine kwaye bafake idatha yakho kwiiseva ezikude eNtshona Afrika, kubandakanya e-United States naseEuropean Union. Sithatha amanyathelo okuqinisekisa ukuba iziqinisekiso ezifanelekileyo zikhona zokudlulisa okunjalo, kubandakanya ukuxhomekeka kubaxhasi abagcina imigangatho yokukhusela idatha eyaziwayo. Ngokusebenzisa i-Propza, uyavuma ukuba idatha yakho inokucuthwa kwamanye amazwe.'
    },
    'privacy.cookies': {
      en: 'Cookies & Analytics',
      af: 'Koekies en Analise',
      zu: 'Ama-Cookie Nokuhlaziywa',
      xh: 'Iikhuki Nokuhlaziywa'
    },
    'privacy.cookiesDescription': {
      en: 'Propza may use cookies and similar technologies for authentication and to maintain your session. We may also use anonymised analytics tools to understand how users interact with the platform and to improve our service. We do not use advertising cookies or share tracking data with third parties for marketing purposes. You can manage cookie preferences through your browser settings.',
      af: 'Propza kan koekies en soortgelyke tegnologieë gebruik vir verifikasie en om jou sessie te handhaaf. Ons kan ook geanonimiseerde analitiese instrumente gebruik om te verstaan hoe gebruikers met die platform kommunikeer en om ons diens te verbeter. Ons gebruik nie advertensiekoekies nie en deel ook nie naspoordata met derde partye vir bemarkingsdoeleindes nie. Jy kan koekie-voorkeure deur jou blaaierinstellings bestuur.',
      zu: 'I-Propza ingasebenzisa ama-cookie namathuluzi afanayo okuqinisekisa nokugcina useshini wakho. Singasebenzisa namathuluzi e-analytics angaziwa ukuqonda ukuthi abasebenzisi basebenzisana kanjani nesikhundla futhi ukuthuthukisa insiza yethu. Asebenzisi ama-cookie okukhangisa noma sabelane nedatha yokulandelwa nabanye abantu ngezinhloso zokukhangisa. Ungaphatha izintando zama-cookie ngezilungiselelo zebhrawuza yakho.',
      xh: 'I-Propza inokusebenzisa iikhuki nezixhobo ezifanayo zokuqinisekiswa nokugcina iseshini yakho. Sinokusebenzisa nezixhobo ze-analytics ezihlaziyiweyo ukuqonda indlela abasebenzisi abaxabana ngayo neqonga nokuphcula inkonzo yethu. Asisetyenzisi iikhuki zokukhangisa noma sabelane nedatha yokulandela nabanye abantu ngeenjongo zokurhweba. Unaphatha izintando zekhuki ngezilungiselelo zebhrawuza yakho.'
    },
    'privacy.dataRetention': {
      en: 'Data Retention',
      af: 'Data-bewaring',
      zu: 'Ukugcinwa Kwedatha',
      xh: 'Ukugcinwa Kwedatha'
    },
    'privacy.dataRetentionDescription': {
      en: 'We retain your personal data for as long as your account remains active and as necessary to provide our services. If you delete your account, we will delete or anonymise your personal data within a reasonable period, unless we are required to retain it to comply with a legal obligation, resolve a dispute, or enforce our agreements. Uploaded documents may be retained for a short period after deletion to allow for recovery in case of accidental loss.',
      af: 'Ons behou jou persoonlike data solank jou rekening aktief bly en soos nodig om ons dienste te lewer. As jy jou rekening uitwis, sal ons jou persoonlike data binne \'n redelike tydperk uitwis of anonimiseer, tensy ons verplig is om dit te behou om \'n wetlike verpligting na te kom, \'n geskil op te los of ons ooreenkomste af te dwing. Opgelaaide dokumente kan vir \'n kort tydperk na uitwissing behou word om herstel in geval van toevallige verlies te moontlik te maak.',
      zu: 'Sigcina ulwazi lwakho lomuntu siqu inzile i-akhawunti yakho isasebenza nangokudingeka ukunikeza izinsiza zethu. Uma ususa i-akhawunti yakho, sizosula noma sihlele ulwazi lwakho lomuntu siqu ngesikhathi esifanele, ngaphandle uma sidingekile ukusigcina ukuhlangabezana nesibopho sokomthetho, uxazululo lwezingxabano, noma ukuqinisekisa izivumelwano zethu. Amadokhumenti aphoswe angagcinwa isikhathi esifushane ngemuva kokusula ukuvumela ukubuyiselwa uma kukhona ukulahleka okungahlelelwanga.',
      xh: 'Sigcina ulwazi lwakho lomuntu siqu inzile iakhawunti yakho isasebenza nangokufunekayo ukunikeza iinkonzo zethu. Ukuba uyacima iakhawunti yakho, siya cima okanye sihlaziye ulwazi lwakho lomuntu siqu ngexesha elicwangcisiweyo, ngaphandle apho sifuneka ukusigcina ukuhlangabezana nesibopho somthetho, ukuxazulula ingxabano, okanye ukuqinisekisa izivumelwano zethu. Amaxwebhu angenisiweyo angagcinwa ixesha elifutshane emva kokucinywa ukuvumela ukubuyiselwa kwangengozi yokulahleka.'
    },
    'privacy.dataSecurity': {
      en: 'Data Security',
      af: 'Data Sekuriteit',
      zu: 'Ukuvikeleka Kwedatha',
      xh: 'Ukuvikeleka Kwedatha'
    },
    'privacy.dataSecurityDescription': {
      en: 'We take reasonable technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. These measures include encryption in transit and at rest, access controls, and use of reputable infrastructure providers. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
      af: 'Ons neem redelike tegniese en organisatoriese maatreëls om jou persoonlike data te beskerm teen ongemagtigde toegang, verlies of openbaarmaking. Hierdie maatreëls sluit in enkripsie tydens oordrag en in rus, toegangsbeheer en gebruik van betroubare infrastruktuurverskaffers. Geen metode van oordrag oor die internet of elektroniese berging is egter heeltemal veilig nie, en ons kan nie absolute sekuriteit waarborg nie.',
      zu: 'Sithatha izinyathelo zobuchwepheshe nezomhlangano ezifanele ukuvikela ulwazi lwakho lomuntu siqu ngokumelene nokufinyelela okungagunyaziwe, ukulahleka, noma ukwambulwa. Lezi zinyathelo zifaka phakathi ukubethela ngesikhathi sokudluliswa nasekuphumuzeni, ukuphatha ukufinyelela, nokusebenzisa abahlinzeki bezingqalasizinda abathembekile. Nokho, akukho ndlela yokudluliswa nge-inthanethi noma ukugcina ngombane ephephile ngokuphelele, futhi asikwazi ukuqinisekisa ukuphepha okuphelele.',
      xh: 'Sithatha amanyathelo afanelekileyo obuchwepheshe namaziko okukhusela ulwazi lwakho lomuntu siqu ngokumelene nokufikelela okunga gunyaziwa, ukulahleka, okanye ukuchazwa. La manyathelo abandakanya ukubethela ngexesha lodluliso nangokulala, iilawulo zokufikelela, nokusebenzisa abaxhasi bezingqalasizinda abathembekileyo. Noko kunjalo, akukho ndlela yokudluliswa nge-intanethi okanye ukugcinwa nge-elektroniki ekhuselekileyo ngokupheleleyo, kwaye asikwazi ukuqinisekisa ukhuseleko olupheleleyo.'
    },
    'privacy.userRights': {
      en: 'Your Rights',
      af: 'Jou Regte',
      zu: 'Amalungelo Akho',
      xh: 'Amalungelo Akho'
    },
    'privacy.userRightsDescription': {
      en: 'Under the Protection of Personal Information Act, 2013 ("POPIA") and applicable data protection law, you have the following rights: the right to access your personal information held by us; the right to request correction of inaccurate or incomplete information; the right to request deletion of your personal information, subject to our retention obligations; the right to object to the processing of your data in certain circumstances; and the right to lodge a complaint with the Information Regulator of South Africa. To exercise any of these rights, please contact us at support@propza.co.za.',
      af: 'Ingevolge die Wet op Beskerming van Persoonlike Inligting (POPIA) en toepaslike databeskermingsreg, het jy die volgende regte: die reg om toegang te verkry tot jou persoonlike inligting wat deur ons gehou word; die reg om korreksie van onakkurate of onvolledige inligting te versoek; die reg om uitwissing van jou persoonlike inligting te versoek, onderhewig aan ons bewaringsverpligtinge; die reg om beswaar te maak teen die verwerking van jou data in sekere omstandighede; en die reg om \'n klagte by die Inligtingsreguleerder van Suid-Afrika in te dien. Om enige van hierdie regte uit te oefen, kontak ons asseblief by support@propza.co.za.',
      zu: 'Ngaphansi koMthetho Wokuvikelwa Kolwazi Lomuntu Siqu (POPIA) nomthetho osebenzayo wokuvikela idatha, unamalungelo alandelayo: ilungelo lokufinyelela ulwazi lwakho lomuntu siqu olugcinwa yithi; ilungelo lokucela ukulungiswa kolwazi olungeyiqiniso noma olungaphelele; ilungelo lokucela ukususwayo kolwazi lwakho lomuntu siqu, kuphethwe yizibopho zethu zokugcina; ilungelo lokwenqabela ukuhlela idatha yakho ezimweni ezithile; nelungelo lokufaka isikhalo kuMlawuli Wezolwazi waseNingizimu Afrika. Ukusebenzisa noma yiluphi lolu lungelo, sicela usithintane ku-support@propza.co.za.',
      xh: 'Phantsi koMthetho Wokukhusela Ulwazi Lomuntu Siqu (POPIA) nomthetho osebenzayo wokukhusela idatha, unamalungelo alandelayo: ilungelo lokufikelela ulwazi lwakho lomuntu siqu olugcinwa ngathi; ilungelo locelo lolungiso lwulwazi olungachanekanga okanye olungapheleleyo; ilungelo locelo lokucinywa kolwazi lwakho lomuntu siqu, ixhomekeke kwizibopho zethu zokugcina; ilungelo lokuphikisa ukucuthwa kwedatha yakho kwimeko ezithile; nelungelo lokufaka isikhalazo kuMlawuli Wolwazi waseNtshona Afrika. Ukusebenzisa nayiphi na yala malungelo, nceda usithinte ku-support@propza.co.za.'
    },
    'privacy.contact': {
      en: 'Contact Us',
      af: 'Kontak Ons',
      zu: 'Sithintane Nathi',
      xh: 'Sithintane Nathi'
    },
    'privacy.contactDescription': {
      en: 'If you have any questions about this privacy policy, please contact us at support@propza.co.za',
      af: 'As jy enige vrae oor hierdie privaatheid beleid het, kontak ons asseblief by support@propza.co.za',
      zu: 'Uma unemibuzo mayelana nale nqubomgomo yobumfihlo, sicela usithintane ku-support@propza.co.za',
      xh: 'Uma unemibuzo mayelana nale nqubomgomo yobumfihlo, sicela usithintane ku-support@propza.co.za'
    },

    // Terms & Conditions
    'terms.lastUpdated': {
      en: 'Last Updated',
      af: 'Laas Opgedateer',
      zu: 'Kugcina Ukubuyekezwa',
      xh: 'Kugcina Ukubuyekezwa'
    },
    'terms.lastUpdatedDate': {
      en: 'May 15, 2026',
      af: '15 Mei 2026',
      zu: '15 Meyi 2026',
      xh: '15 Meyi 2026'
    },
    'terms.acceptance': {
      en: 'Acceptance of Terms',
      af: 'Aanvaarding van Bepalings',
      zu: 'Ukwamukela Imigomo',
      xh: 'Ukwamukela Imigomo'
    },
    'terms.acceptanceDescription': {
      en: 'By using Propza, you agree to be bound by these terms and conditions. If you do not agree, please do not use our service.',
      af: 'Deur Propza te gebruik, stem jy in om deur hierdie bepalings en voorwaardes gebind te word. As jy nie saamstem nie, gebruik asseblief nie ons diens nie.',
      zu: 'Ngokusebenzisa i-Propza, uyavuma ukubophwa yile migomo nezimo. Uma ungavumelani, sicela ungasebenzisi insiza yethu.',
      xh: 'Ngokusebenzisa i-Propza, uyavuma ukubophwa yile migomo nezimo. Uma ungavumelani, sicela ungasebenzisi insiza yethu.'
    },
    'terms.ageRequirement': {
      en: 'Age Requirement',
      af: 'Ouderdomsvereiste',
      zu: 'Imfuneko Yobudala',
      xh: 'Imfuneko Yobudala'
    },
    'terms.ageRequirementDescription': {
      en: 'You must be at least 18 years old and legally capable of entering into binding contracts to use Propza. By registering, you confirm that you meet this requirement.',
      af: 'Jy moet ten minste 18 jaar oud wees en wetlik in staat wees om bindende kontrakte aan te gaan om Propza te gebruik. Deur te registreer, bevestig jy dat jy aan hierdie vereiste voldoen.',
      zu: 'Kufanele ube neminyaka engu-18 noma ngaphezulu futhi ukwazi ngomthetho ukungena ezivumelwaneni ezibophayo ukuze usebenzise i-Propza. Ngokubhalisa, uqinisekisa ukuthi uhlangabezana nalesi simo.',
      xh: 'Kufuneka ube neminyaka eyi-18 okanye ngaphezulu kwaye ukwazi ngomthetho ukungena kwizivumelwano ezibophayo ukuze usebenzise i-Propza. Ngokubhalisa, uqinisekisa ukuba uhlangabezana nale mfuneko.'
    },
    'terms.serviceDescription': {
      en: 'Service Description',
      af: 'Diens Beskrywing',
      zu: 'Incazelo Yensiza',
      xh: 'Incazelo Yensiza'
    },
    'terms.serviceDescriptionText': {
      en: 'Propza is a property management platform that helps landlords manage their rental properties, tenants, and payments.',
      af: 'Propza is \'n eiendom bestuur platform wat verhuurders help om hul huur eiendomme, huurders en betalings te bestuur.',
      zu: 'I-Propza iyisikhundla sokuphatha izakhiwo esisiza abanikazi bezindlu ukuthi baphathe izakhiwo zabo zokuqasha, abaqashi kanye nezinkokhelo.',
      xh: 'I-Propza iyisikhundla sokuphatha izakhiwo esisiza abanikazi bezindlu ukuthi baphathe izakhiwo zabo zokuqasha, abaqashi kanye nezinkokhelo.'
    },
    'terms.accountResponsibility': {
      en: 'Account Responsibility',
      af: 'Rekeningverantwoordelikheid',
      zu: 'Iqhaza Le-akhawunti',
      xh: 'Uxanduva Lweakhawunti'
    },
    'terms.accountResponsibilityDescription': {
      en: 'You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account. Propza is not liable for any loss resulting from your failure to keep your credentials secure.',
      af: 'Jy is verantwoordelik vir die handhawing van die vertroulikheid van jou wagwoord en vir alle aktiwiteite wat onder jou rekening plaasvind. Jy moet ons onmiddellik in kennis stel van enige ongemagtigde gebruik van jou rekening. Propza is nie aanspreeklik vir enige verlies wat voortspruit uit jou versuim om jou aanmeldbesonderhede veilig te hou nie.',
      zu: 'Unomuzamo wokuqinisekisa ukuba isirri sewagwedi lakho ligcinwa futhi nakuzo zonke izinto ezenzekayo ngaphansi kwe-akhawunti yakho. Kufanele usazise ngokushesha nganoma yisiphi ukusetshenziswa okungagunyaziwe kwe-akhawunti yakho. I-Propza ayibophi nokulahleka okusuka ekuhlulekeni kwakho ukugcina ulwazi lwakho lokungena luvikelekile.',
      xh: 'Unoxanduva lokuqinisekisa ukuba igama lakho lokugqitha ligcinwa ngobumfihlo kwaye nakuzo zonke izinto ezenzekayo phantsi kweakhawunti yakho. Kufuneka usazise ngokukhawuleza nganoma yisiphi ukusetyenziswa okunga gunyaziwa kweakhawunti yakho. I-Propza ayibophi nokulahleka okuvela ekunqeneni kwakho ukugcina ulwazi lwakho lokungena lukhuselewe.'
    },
    'terms.userObligations': {
      en: 'User Obligations',
      af: 'Gebruiker Verpligtinge',
      zu: 'Izibopho Zomsebenzisi',
      xh: 'Izibopho Zomsebenzisi'
    },
    'terms.userObligationsDescription': {
      en: 'Users must provide accurate information, use the service lawfully, and not interfere with other users\' experience.',
      af: 'Gebruikers moet akkurate inligting verskaf, die diens wettig gebruik, en nie inmeng met ander gebruikers se ervaring nie.',
      zu: 'Abasebenzisi kufanele banikeze imininingwane eqiniso, basebenzise insiza ngokomthetho, futhi bangaphazamisi isipiliyoni sabanye abasebenzisi.',
      xh: 'Abasebenzisi kufanele banikeze imininingwane eqiniso, basebenzise insiza ngokomthetho, futhi bangaphazamisi isipiliyoni sabanye abasebenzisi.'
    },
    'terms.documentStorage': {
      en: 'Document Storage',
      af: 'Dokumentberging',
      zu: 'Ukugcinwa Kwamadokhumenti',
      xh: 'Ukugcinwa Kwamaxwebhu'
    },
    'terms.documentStorageDescription': {
      en: 'You may upload documents such as signed lease agreements to Propza. You are solely responsible for ensuring that any documents you upload comply with all applicable laws, including privacy and data protection laws. Do not upload documents containing third-party personal information without appropriate consent.',
      af: 'Jy mag dokumente soos getekende huurkontrakte na Propza oplaai. Jy is uitsluitlik verantwoordelik om te verseker dat enige dokumente wat jy oplaai aan alle toepaslike wette voldoen, insluitend privaatheid en databeskermingswette. Moenie dokumente met derde-party persoonlike inligting oplaai sonder gepaste toestemming nie.',
      zu: 'Ungakwazi ukuphosa amadokhumenti anjenge-inkontileka zokuqasha ezisayiniwe ku-Propza. Wena wedwa unomuzamo wokuqinisekisa ukuthi noma yimaphi amadokhumenti owaphosayo ahambisana nayo yonke imithetho esebenzayo, kufaka phakathi imithetho yokuvikela ubumfihlo nedatha. Ungaphosi amadokhumenti aqinisekisa imininingwane yomuntu ngokomthetho ngaphandle kwemvume efanele.',
      xh: 'Ungangenisa amaxwebhu afana nezivumelwano zokuqasha ezisayiniweyo ku-Propza. Wena wedwa unoxanduva lokuqinisekisa ukuba nayiphi na amaxwebhu oyangenisayo ahambelana nayo yonke imithetho esebenzayo, kubandakanya imithetho yobumfihlo nokhuseleko lwedatha. Musa ukungenisa amaxwebhu aqukethe ulwazi lomuntu wesithathu ngaphandle kwemvume efanelekileyo.'
    },
    'terms.userContent': {
      en: 'User Content Ownership',
      af: 'Gebruiker Inhoud Eienaarskap',
      zu: 'Ukuba Ngumnikazi Wokuqukethwe Komsebenzisi',
      xh: 'Ubunikazi Bokuqukethwe Komsebenzisi'
    },
    'terms.userContentDescription': {
      en: 'You retain full ownership of any documents or content you upload to Propza. By uploading content, you grant us a limited licence to store, process, and display that content solely for the purpose of operating the platform on your behalf. We do not claim any ownership over your uploaded content.',
      af: 'Jy behou volle eienaarskap van enige dokumente of inhoud wat jy na Propza oplaai. Deur inhoud op te laai, gee jy ons \'n beperkte lisensie om daardie inhoud te stoor, te verwerk en te vertoon slegs vir die doel van die bedryf van die platform namens jou. Ons eis geen eienaarskap oor jou opgelaaide inhoud nie.',
      zu: 'Ugcina ukuba ngumnikazi ophelele wamadokhumenti noma okuqukethwe okuwuphosa ku-Propza. Ngokuphosa okuqukethwe, unikezela kithi ilayisense elinganiselwe lokugcina, ukucubungula, nokubonisa leyo nokuqukethwe kuphela ngenhloso yokusebenzisa isikhundla egameni lakho. Asibizi ukuba ngabakho okuqukethwe owakuphosayo.',
      xh: 'Ugcina ubunikazi obupheleleyo bamaxwebhu okanye okuqukethwe okungenisiweyo ku-Propza. Ngokungenisa okuqukethwe, unikezela kuthi ilayisensi elinganiselweyo yokugcina, ukucutha, nokubonisa loo nokuqukethwe kuphela ngenhloso yokusebenza njengenkundla egameni lakho. Asibizi ukuba ngabethu okuqukethwe owakugenisiyo.'
    },
    'terms.dataAccuracy': {
      en: 'Data Accuracy Disclaimer',
      af: 'Vrywaring van Data-akkuraatheid',
      zu: 'Isixwayiso Sokuyiqinisa Kwedatha',
      xh: 'Isixwayiso Sobuqiniso Bedatha'
    },
    'terms.dataAccuracyDescription': {
      en: 'Propza is a management tool designed to assist you in organising your rental portfolio. We do not guarantee the accuracy of rent calculations, payment reminders, financial statements, or any other outputs generated by the platform. You remain responsible for verifying all figures and ensuring compliance with your legal and financial obligations.',
      af: 'Propza is \'n bestuursinstrument wat ontwerp is om jou te help om jou huurportefeulje te organiseer. Ons waarborg nie die akkuraatheid van huurberekenings, betalingsherinneringe, finansiële state of enige ander uitsette wat deur die platform gegenereer word nie. Jy bly verantwoordelik vir die verifikasie van alle syfers en die versekering van voldoening aan jou wetlike en finansiële verpligtinge.',
      zu: 'I-Propza iyithuluzi lokuphatha elikhiqizwe ukukusiza ekuhleleni iportfolio yakho yokuqasha. Asiqinisekisi ubuqiniso bokubalwa kwerenti, izikhumbuzo zokukhokha, izitatimende zezimali, noma noma yiziphi ezinye izimveliso ezikhiqizwa yisikhundla. Usala unomuzamo wokuqinisekisa onke amanani nokulungiseka kwezibopho zakho zokomthetho nezezimali.',
      xh: 'I-Propza sisixhobo sokuphatha esenzelwe ukukunceda ekuhleleleni iqoqo lakho lokuqasha. Asiqinisekisi ubuqiniso bokubalwa kwerenti, izikhumbuzo zokuhlawula, izitatimente zemali, okanye naziphi na ezinye iziphumo eziveliswa yinkundla. Usala unoxanduva lokuqinisekisa zonke izibalo nokulungiseka kwezibopho zakho zemthetho nezezimali.'
    },
    'terms.prohibitedUses': {
      en: 'Prohibited Uses',
      af: 'Verbode Gebruike',
      zu: 'Ukusetshenziswa Okwenqatshiwe',
      xh: 'Ukusetshenziswa Okwenqatshiwe'
    },
    'terms.prohibitedUsesDescription': {
      en: 'You may not use Propza for illegal activities, to harm others, or to violate any applicable laws or regulations.',
      af: 'Jy mag nie Propza gebruik vir onwettige aktiwiteite, om ander te skaad, of om enige toepaslike wette of regulasies te oortree nie.',
      zu: 'Awukwazi ukusebenzisa i-Propza ngezenzo ezingekho emthethweni, ukulimaza abanye, noma ukwephula noma yimiphi imithetho noma imikhawulo esebenzayo.',
      xh: 'Awukwazi ukusebenzisa i-Propza ngezenzo ezingekho emthethweni, ukulimaza abanye, noma ukwephula noma yimiphi imithetho noma imikhawulo esebenzayo.'
    },
    'terms.billing': {
      en: 'Subscription & Billing',
      af: 'Inskrywing en Fakturering',
      zu: 'Ukubhalisa Nokukhokha',
      xh: 'Ukubhalisa Nentlawulo'
    },
    'terms.billingDescription': {
      en: 'Propza is currently available free of charge. We reserve the right to introduce paid plans or modify existing features at any time. Where charges apply, you will be notified in advance and given the opportunity to accept or decline before any payment is processed.',
      af: 'Propza is tans gratis beskikbaar. Ons behou die reg voor om betaalde planne in te stel of bestaande funksies op enige tyd te wysig. Waar koste van toepassing is, sal jy vooraf in kennis gestel word en die geleentheid kry om te aanvaar of te weier voordat enige betaling verwerk word.',
      zu: 'I-Propza iyatholakala mahala okwamanje. Siyagcina ilungelo lokuphakamisa izinhlelo ezikhokhelwayo noma ukushintsha izici ezikhona noma nini. Uma izindleko zisebenza, uzaziswa ngaphambili futhi unikezwe ithuba lokwamukela noma ukwenqaba ngaphambi kokucutshungulwa kwanoma yikuphi ukukhokha.',
      xh: 'I-Propza iyafumaneka mahhala okwangoku. Sigcina ilungelo lokuzipha izicwangciso ezihlawulelwayo okanye ukuguqula izici ezikhona nangaliphi na ixesha. Apho iintlawulo zisebenza khona, uza kwaziswa ngaphambili kwaye unikezwe ithuba lokwamkela okanye ukwenqaba ngaphambi kokucutshungulwa nangeliphi na intlawulo.'
    },
    'terms.thirdPartyServices': {
      en: 'Third-Party Services',
      af: 'Derde-party Dienste',
      zu: 'Izinsiza Zommeli Wesithathu',
      xh: 'Iinkonzo Zesithathu'
    },
    'terms.thirdPartyServicesDescription': {
      en: 'Propza relies on third-party providers to deliver its services, including Supabase (database and authentication), Vercel (hosting and infrastructure), and email delivery services. Your use of Propza is subject to their respective terms and privacy policies. We are not responsible for the practices of these providers beyond our obligations to select reputable partners and implement appropriate contractual safeguards.',
      af: 'Propza maak staat op derde-party verskaffers om sy dienste te lewer, insluitend Supabase (databasis en verifikasie), Vercel (aanbieding en infrastruktuur), en e-posafleweringsdienste. Jou gebruik van Propza is onderhewig aan hul onderskeie bepalings en privaatheidsbeleid. Ons is nie verantwoordelik vir die praktyke van hierdie verskaffers buite ons verpligtinge om gerespekteerde vennote te kies en toepaslike kontraktuele voorsorgmaatreëls te implementeer nie.',
      zu: 'I-Propza incika kubahlinzeki besithathu ukuletha izinsiza zayo, kufaka phakathi i-Supabase (idatabase nokufakazela), i-Vercel (ukusingatha nezingqalasizinda), nezinsiza zokuhlinzeka i-imeyili. Ukusebenzisa kwakho i-Propza kuphethwe yimithetho yabo kanye nenqubomgomo yobumfihlo. Asikunaki ukusebenza kwalapha bahlinzeki ngaphezu kwezibopho zethu zokukhetha izitho eziheshiwe nokusebenzisa iziqondiso zokunqanda ezifanele.',
      xh: 'I-Propza ixhomekeka kubaxhasi besithathu ukunikeza iinkonzo zayo, kubandakanya i-Supabase (idatabase nokuqinisekiswa), i-Vercel (ukusingatha neziseko), neenkonzo zokunikezwa kwe-imeyili. Ukusetyenziswa kwakho kwe-Propza kuxhomekeka kwimigomo yabo nengqeqesho yobumfihlo. Asibophelelekanga kwimikhwa yaba baxhasi ngaphandle kwezibopho zethu zokukhetha abantu abathembekileyo nokunika iziqinisekiso zemvisiswano efanelekileyo.'
    },
    'terms.availability': {
      en: 'Service Availability',
      af: 'Beskikbaarheid van Diens',
      zu: 'Ukutholakala Kwensiza',
      xh: 'Ukufumaneka Kwenkonzo'
    },
    'terms.availabilityDescription': {
      en: 'We aim to keep Propza available at all times, but we do not guarantee uninterrupted access. The service may occasionally be unavailable due to scheduled maintenance, technical issues, or circumstances beyond our control. We will endeavour to provide advance notice of planned downtime where possible.',
      af: 'Ons streef daarna om Propza te alle tye beskikbaar te hou, maar ons waarborg nie ononderbroke toegang nie. Die diens kan soms nie beskikbaar wees weens geskeduleerde onderhoud, tegniese probleme of omstandighede buite ons beheer nie. Ons sal poog om vooraf kennis te gee van beplande stilstandtyd waar moontlik.',
      zu: 'Sihlose ukugcina i-Propza itholakala ngaso sonke isikhathi, kodwa asiqinisekisi ukufinyelela okungaqhekeki. Insiza ingatholakala ngezinye izikhathi ngenxa yenhlela ehlelelwe yokulungisa, izinkinga zobuchwepheshe, noma izimo ezingaphandle kokulawulwa kwethu. Sizozama ukupha isaziso sangaphambili sasikhathi sokunqamuka obekelwe lapho kunokwenzeka.',
      xh: 'Sihlose ukugcina i-Propza ifumaneka ngalo lonke ixesha, kodwa asiqinisekisi ukufikelela okunga phazanyiswayo. Inkonzo ingangatholakali ngezinye izikhathi ngenxa yolondolozo oluhlelweyo, iingxaki zobuchwepheshe, okanye iimeko ezingaphandle kolawulo lwethu. Siya zama ukunika isaziso sangaphambili sexesha ekuhlangabezaneni noko apho kunokwenzeka khona.'
    },
    'terms.betaAccess': {
      en: 'Beta & Early Access',
      af: 'Beta en Vroeë Toegang',
      zu: 'I-Beta Nokufinyelela Kokuqala',
      xh: 'I-Beta Nokufikelela Kwamandulo'
    },
    'terms.betaAccessDescription': {
      en: 'Propza may be released as a beta or early-access product. Features may change, be modified, or be removed without notice. While we strive to maintain a stable experience, beta software is provided without guarantees of completeness or reliability. Your continued use of the platform indicates your acceptance of this condition.',
      af: 'Propza kan as \'n beta- of vroeë-toegangsproduk vrygestel word. Funksies kan verander, gewysig of verwyder word sonder kennisgewing. Terwyl ons streef na \'n stabiele ervaring, word beta-sagteware verskaf sonder waarborge van volledigheid of betroubaarheid. Jou voortgesette gebruik van die platform dui op jou aanvaarding van hierdie toestand.',
      zu: 'I-Propza ingakhululwa njengomkhiqizo we-beta noma owokufinyelela kokuqala. Izici zingatshintsha, zishintshwe, noma zisuswe ngaphandle kwesaziso. Nakuba sizama ukugcina isipiliyoni esizinzile, i-softhiwe ye-beta inikezwa ngaphandle kweziqinisekiso zokuphela noma ukwethembeka. Ukusebenzisa kwakho okuqhubekayo kusikhundla kubonisa ukwamukela kwakho kulesi simo.',
      xh: 'I-Propza inganikwa njengemveliso ye-beta okanye yokufikelela kwamandulo. Izici zingatshintsha, ziguqulwe, okanye zisuswe ngaphandle kwesaziso. Ngelixa sizama ukugcina ulwandlalo oluzinzileyo, isoftware ye-beta inikezwa ngaphandle kweziqinisekiso zokuphelela okanye ukuthembeka. Ukusetyenziswa kwakho okuqhubekayo kwenkundla kubonakalisa ukwamkela kwakho le meko.'
    },
    'terms.intellectualProperty': {
      en: 'Intellectual Property',
      af: 'Intellektuele Eiendom',
      zu: 'Impahla Yobuhlakani',
      xh: 'Impahla Yobuhlakani'
    },
    'terms.intellectualPropertyDescription': {
      en: 'All content, features, and functionality of Propza are owned by us and are protected by copyright and other intellectual property laws.',
      af: 'Alle inhoud, funksies en funksionaliteit van Propza word deur ons besit en word beskerm deur kopiereg en ander intellektuele eiendom wette.',
      zu: 'Konke okuqukethwe, izici kanye nokusebenza kwe-Propza kungokwethu futhi kuvikelwe ngumthetho we-copyright kanye neminye imithetho yempahla yobuhlakani.',
      xh: 'Konke okuqukethwe, izici kanye nokusebenza kwe-Propza kungokwethu futhi kuvikelwe ngumthetho we-copyright kanye neminye imithetho yempahla yobuhlakani.'
    },
    'terms.noAdvice': {
      en: 'No Professional Advice',
      af: 'Geen Professionele Advies',
      zu: 'Akukho Iseluleko Sezobuchwepheshe',
      xh: 'Akukho Icebiso Lobuchwepheshe'
    },
    'terms.noAdviceDescription': {
      en: 'Propza does not provide legal, accounting, tax, financial, or property management advice. Any information or reports generated by the platform are provided for general administrative purposes only and should not be relied upon as professional advice. You should consult qualified professionals for legal, financial, tax, or property-related matters.',
      af: 'Propza verskaf nie regs-, rekenkundige, belasting-, finansiële of eiendomsbestuuradvies nie. Enige inligting of verslae wat deur die platform gegenereer word, word slegs vir algemene administratiewe doeleindes verskaf en moet nie as professionele advies beskou word nie. Jy moet gekwalifiseerde professionele persone raadpleeg vir regs-, finansiële, belasting- of eiendomsverwante sake.',
      zu: 'I-Propza ayinikezi iseluleko sokomthetho, lwe-akhawunti, lwerhafu, lezezimali, noma lokuphatha izakhiwo. Noma yimiphi imininingwane noma imibiko enikezwa yisikhundla inikezwa kuphela ngezinhloso zokuphatha jikelele futhi akufanele kusengelwe phezu kwayo njengecebo lobuchwepheshe. Kufanele ubonisane nabochwepheshe abagogodlha ngezindaba zokomthetho, zezimali, zerhafu, noma ezindlini.',
      xh: 'I-Propza ayiniki icebiso lomthetho, lobugcisa bezimali, irhafu, nezezimali, okanye lokuphatha iipropati. Nayiphi na imininingwane okanye imibiko ekhiqizwe yinkundla inikezwa kuphela ngeenjongo zolawulo jikelele kwaye kufuneka ingaxhomekeki kuyona njengecebiso lobuchwepheshe. Kufuneka ubonisane noochwepheshe abanegunya kwimicimbi yomthetho, yezezimali, irhafu, okanye eyepropati.'
    },
    'terms.liability': {
      en: 'Limitation of Liability',
      af: 'Beperking van Aanspreeklikheid',
      zu: 'Ukulinganiselwa Kwesibopho',
      xh: 'Ukulinganiselwa Kwesibopho'
    },
    'terms.liabilityDescription': {
      en: 'Propza is provided "as is" without warranties of any kind, express or implied. To the maximum extent permitted by law, Propza shall not be liable for any indirect, incidental, consequential, or special damages arising from your use of the platform, including loss of profits, data, tenants, rental income, or business opportunities. Our total liability for any claim shall not exceed the amount paid by you, if any, for access to the platform in the twelve months preceding the claim.',
      af: 'Propza word "soos dit is" verskaf sonder enige waarborge, uitdruklik of geïmpliseer. Tot die maksimum mate wat deur die wet toegelaat word, sal Propza nie aanspreeklik wees vir enige indirekte, toevallige, gevolglike of spesiale skade wat voortspruit uit jou gebruik van die platform nie, insluitend verlies aan winste, data, huurders, huurinkomste of besigheidsgeleenthede nie. Ons totale aanspreeklikheid vir enige eis sal nie die bedrag oorskry wat deur jou betaal is nie, indien enige, vir toegang tot die platform in die twaalf maande voor die eis.',
      zu: 'I-Propza inikezwa "njengoba injalo" ngaphandle kweziqinisekiso zazo zonke izinhlobo, ezicacile noma ezishiwoyo. Ngokwesikele esikhulu esiheheliwe ngumthetho, i-Propza ngeke ibophe noma yiziphi izonakaliso ezingaqondile, ezenzekile, ezilandela, noma ezikhethekile ezivela ekusebenziseni kwakho isikhundla, kufaka phakathi ukulahleka kwenzuzo, idatha, abaqashi, imali yokuqasha, noma amathuba ebhizinisi. Isibopho sethu esiphelele nganoma yisiphi isicelo ngeke sadlule imali ekhokhelwe nguwe, uma ikhona, ngokufinyelela isikhundla ezinyangeni eziyishumi nambili ezandulela isicelo.',
      xh: 'I-Propza inikezwa "njengoba injalo" ngaphandle kweziqinisekiso zazo zonke iintlobo, ezibonakalayo okanye eziambekiweyo. Ukuze kube nzima ngokomthetho, i-Propza ayisoze ibopheleke nganayiphi na izonakaliso ezingaqondanga, ezenzekileyo, ezilandela, okanye ezikhethekileyo ezivela ekusetyenziseni kwakho inkundla, kubandakanya ukulahleka kwenzuzo, idatha, abaqeshi, imali yerenti, okanye amathuba ebhizinisi. Uxanduva lwethu olupheleleyo ngalo naliphi na icala aluyikudlula imali ehlawuliweyo nguwe, ukuba ikhona, ngokufikelela inkundla kwiinyanga ezili-12 ezandulela icala.'
    },
    'terms.termination': {
      en: 'Termination',
      af: 'Beëindiging',
      zu: 'Ukuqedwa',
      xh: 'Ukuqedwa'
    },
    'terms.terminationDescription': {
      en: 'We may terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion.',
      af: 'Ons mag jou rekening op enige tyd beëindig of opskort vir oortredings van hierdie bepalings of vir enige ander rede na ons goeddunke.',
      zu: 'Singakwazi ukuqeda noma ukumisa i-akhawunti yakho noma nini ngokwephula le migomo noma nganoma yisiphi esinye isizathu ngokukhetha kwethu.',
      xh: 'Singakwazi ukuqeda noma ukumisa i-akhawunti yakho noma nini ngokwephula le migomo noma nganoma yisiphi esinye isizathu ngokukhetha kwethu.'
    },
    'terms.governingLaw': {
      en: 'Governing Law',
      af: 'Geldende Reg',
      zu: 'Umtethelo Osebenzayo',
      xh: 'Umtethelo Osebenzayo'
    },
    'terms.governingLawDescription': {
      en: 'These terms are governed by the laws of South Africa. Any disputes will be resolved in South African courts.',
      af: 'Hierdie bepalings word beheer deur die wette van Suid-Afrika. Enige geskille sal in Suid-Afrikaanse howe opgelos word.',
      zu: 'Le migomo ilawulwa yimithetho yaseNingizimu Afrika. Noma yiziphi izingxabano zizoxazululwa emakameleni aseNingizimu Afrika.',
      xh: 'Le migomo ilawulwa yimithetho yaseNingizimu Afrika. Noma yiziphi izingxabano zizoxazululwa emakameleni aseNingizimu Afrika.'
    },
    'terms.contact': {
      en: 'Contact Information',
      af: 'Kontak Inligting',
      zu: 'Imininingwane Yokuxhumana',
      xh: 'Imininingwane Yokuxhumana'
    },
    'terms.contactDescription': {
      en: 'For questions about these terms, contact us at support@propza.co.za',
      af: 'Vir vrae oor hierdie bepalings, kontak ons by support@propza.co.za',
      zu: 'Ngemibuzo mayelana nale migomo, sithintane nathi ku-support@propza.co.za',
      xh: 'Ngemibuzo mayelana nale migomo, sithintane nathi ku-support@propza.co.za'
    },

    // Common buttons and actions
    'button.gotIt': {
      en: 'Got it!',
      af: 'Verstaan!',
      zu: 'Ngiyabona!',
      xh: 'Ngiyabona!'
    },
    'button.submit': {
      en: 'Submit',
      af: 'Stuur',
      zu: 'Thumela',
      xh: 'Thumela'
    },
    'button.sendResetLink': {
      en: 'Send Reset Link',
      af: 'Stuur Herstel Skakel',
      zu: 'Thumela Isixhumanisi Sokubuyisela',
      xh: 'Thumela Isixhumanisi Sokubuyisela'
    },
    'loading.sending': {
      en: 'Sending...',
      af: 'Stuur...',
      zu: 'Ithumela...',
      xh: 'Ithumela...'
    },
    
    // Feedback
    'feedback.message': {
      en: 'Your Feedback',
      af: 'Jou Terugvoer',
      zu: 'Impendulo Yakho',
      xh: 'Ingxelo Yakho'
    },
    'feedback.placeholder': {
      en: 'Share your thoughts, suggestions, or concerns...',
      af: 'Deel jou gedagtes, voorstelle of bekommernisse...',
      zu: 'Yabelana ngemibono yakho, iziphakamiso noma ukukhathazeka...',
      xh: 'Yabelana ngemibono yakho, iziphakamiso noma ukukhathazeka...'
    },
    'feedback.messageRequired': {
      en: 'Please enter your feedback',
      af: 'Voer asseblief jou terugvoer in',
      zu: 'Sicela ufake impendulo yakho',
      xh: 'Sicela ufake ingxelo yakho'
    },
    'feedback.type': {
      en: 'Feedback Type',
      af: 'Terugvoer Tipe',
      zu: 'Uhlobo Lwempendulo',
      xh: 'Uhlobo Lwengxelo'
    },
    'feedback.typeGeneral': {
      en: 'General Feedback',
      af: 'Algemene Terugvoer',
      zu: 'Impendulo Ejwayelekile',
      xh: 'Ingxelo Ejwayelekile'
    },
    'feedback.typeBug': {
      en: 'Bug Report',
      af: 'Fout Verslag',
      zu: 'Umbiko Wephutha',
      xh: 'Umbiko Wephutha'
    },
    'feedback.typeFeature': {
      en: 'Feature Request',
      af: 'Funksie Versoek',
      zu: 'Isicelo Sesici',
      xh: 'Isicelo Sesici'
    },
    'feedback.typeImprovement': {
      en: 'Improvement Suggestion',
      af: 'Verbetering Voorstel',
      zu: 'Isiphakamiso Sokuthuthukisa',
      xh: 'Isiphakamiso Sokuthuthukisa'
    },
    
    // Delete Account
    'deleteAccount.warning': {
      en: 'Warning: Permanent Action',
      af: 'Waarskuwing: Permanente Aksie',
      zu: 'Isexwayiso: Isenzo Esigcinile',
      xh: 'Isexwayiso: Isenzo Esigcinile'
    },
    'deleteAccount.warningDescription': {
      en: 'This action cannot be undone. All your data, including properties, tenants, and payment records will be permanently deleted.',
      af: 'Hierdie aksie kan nie ongedaan gemaak word nie. Al jou data, insluitend eiendomme, huurders en betaling rekords sal permanent verwyder word.',
      zu: 'Lesi senzo asinakubuyiselwa emuva. Yonke idatha yakho, kufaka phakathi izakhiwo, abaqashi namarekhodi ezinkokhelo, izosuswa unomphela.',
      xh: 'Lesi senzo asinakubuyiselwa emuva. Yonke idatha yakho, kufaka phakathi izakhiwo, abaqashi namarekhodi ezinkokhelo, izosuswa unomphela.'
    },
    'deleteAccount.confirmationLabel': {
      en: 'Type "DELETE" to confirm',
      af: 'Tik "DELETE" om te bevestig',
      zu: 'Thayipha "DELETE" ukuqinisekisa',
      xh: 'Thayipha "DELETE" ukuqinisekisa'
    },
    'deleteAccount.confirmationPlaceholder': {
      en: 'Type DELETE',
      af: 'Tik DELETE',
      zu: 'Thayipha DELETE',
      xh: 'Thayipha DELETE'
    },
    'deleteAccount.confirmationRequired': {
      en: 'Confirmation is required',
      af: 'Bevestiging is vereis',
      zu: 'Ukuqinisekisa kuyadingeka',
      xh: 'Ukuqinisekisa kuyadingeka'
    },
    'deleteAccount.understandConsequences': {
      en: 'I understand that this action is permanent and cannot be undone',
      af: 'Ek verstaan dat hierdie aksie permanent is en nie ongedaan gemaak kan word nie',
      zu: 'Ngiyaqonda ukuthi lesi senzo sigcina futhi asinakubuyiselwa emuva',
      xh: 'Ngiyaqonda ukuthi lesi senzo sigcina futhi asinakubuyiselwa emuva'
    },
    'deleteAccount.understandRequired': {
      en: 'You must confirm you understand',
      af: 'Jy moet bevestig dat jy verstaan',
      zu: 'Kufanele uqinisekise ukuthi uyaqonda',
      xh: 'Kufanele uqinisekise ukuthi uyaqonda'
    },
    
    'button.deleteAccount': {
      en: 'Delete Account',
      af: 'Verwyder Rekening',
      zu: 'Susa I-akhawunti',
      xh: 'Susa I-akhawunti'
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
    'properties.searchPlaceholder': {
      en: 'Search properties by address or tenant...',
      af: 'Soek eiendomme volgens adres of huurder...',
      zu: 'Sesha izindawo nge-address noma umqashi...',
      xh: 'Khangela iipropathi nge-address okanye umqeshi...'
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
    'tenants.currentlyPaid': {
      en: 'Currently paid',
      af: 'Tans betaal',
      zu: 'Okwamanje ukhokhile',
      xh: 'Ngoku ikhokhile'
    },
    'tenants.currentlyPaidDescription': {
      en: 'Check this if the tenant is up to date with their rent payments. This will create a payment record for the current period.',
      af: 'Merk dit aan as die huurder op datum is met hul huur betalings. Dit sal \'n betaling rekord vir die huidige tydperk skep.',
      zu: 'Khetha lokhu uma umqashi esesikhathini esifanele ngokukhokha kwakhe. Lokhu kuzodala irekhodi lokukhokha lesikhathi samanje.',
      xh: 'Khetha oku ukuba umqashi usekwxesha lokukhokha kwakhe. Oku kuza kwenza irekhodi lokukhokha lexesha langoku.'
    },
    'tenants.leaseUpload': {
      en: 'Upload lease (PDF or image)',
      af: 'Laai huurkontrak op (PDF of beeld)',
      zu: 'Layisha inkontileka (PDF noma isithombe)',
      xh: 'Layisha inkontileka (PDF okanye umfanekiso)'
    },
    'tenants.leaseUploadDescription': {
      en: 'Optional - upload the signed lease agreement',
      af: 'Opsioneel - laai die getekende huurkontrak op',
      zu: 'Okukhethwayo - layisha isivumelwano se-inkontileka esisayiniwe',
      xh: 'Okukhethwayo - layisha isivumelwano se-inkontileka esisayiniwe'
    },
    'tenants.securityDeposit': {
      en: 'Security Deposit (ZAR)',
      af: 'Sekuriteitsdeposito (ZAR)',
      zu: 'Idiphozithi Yezokuphepha (ZAR)',
      xh: 'Idiphozithi Yezokuphepha (ZAR)'
    },
    'tenants.securityDepositDescription': {
      en: 'Optional - record the security deposit amount',
      af: 'Opsioneel - teken die sekuriteitsdeposito bedrag aan',
      zu: 'Okukhethwayo - rekhoda inani lediphozithi yezokuphepha',
      xh: 'Okukhethwayo - rekhoda inani lediphozithi yezokuphepha'
    },
    'tenants.fullName': {
      en: 'Full Name',
      af: 'Volle Naam',
      zu: 'Igama Eliphelele',
      xh: 'Igama Eliphelele'
    },
    'tenants.emailAddress': {
      en: 'Email Address',
      af: 'E-pos Adres',
      zu: 'Ikheli Le-imeyili',
      xh: 'Ikheli Le-imeyili'
    },
    'tenants.phoneNumber': {
      en: 'Phone Number',
      af: 'Telefoon Nommer',
      zu: 'Inombolo Yocingo',
      xh: 'Inombolo Yocingo'
    },
    'tenants.notes': {
      en: 'Notes (Optional)',
      af: 'Notas (Opsioneel)',
      zu: 'Amanothi (Okukhethwayo)',
      xh: 'Amanothi (Okukhethwayo)'
    },
    'tenant.noEmailProvided': {
      en: 'No email provided',
      af: 'Geen e-pos verskaf',
      zu: 'Ayikho i-imeyili enikeziwe',
      xh: 'Ayikho i-imeyile inikiweyo'
    },
    'tenant.noPhoneProvided': {
      en: 'No phone provided',
      af: 'Geen telefoon verskaf',
      zu: 'Ayikho inombolo yocingo enikeziwe',
      xh: 'Ayikho ifowuni inikiweyo'
    },
    'tenant.noAddressProvided': {
      en: 'No address on file',
      af: 'Geen adres op rekord',
      zu: 'Ayikho ikheli elifayelini',
      xh: 'Ayikho idilesi efayelweni'
    },
    'tenant.vacantMetaDue': {
      en: 'No rent schedule',
      af: 'Geen huur skedule',
      zu: 'Ayikho isheduli yerenti',
      xh: 'Ayikho ishedyuli yerenti'
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
    },
    'property.paidPrefix': {
      en: 'Paid',
      af: 'Betaal',
      zu: 'Ikhokhiwe',
      xh: 'Ihlawuliwe'
    },
    'property.outstanding': {
      en: 'outstanding',
      af: 'uitstaande',
      zu: 'okusalayo',
      xh: 'esisaliweyo'
    },
    'property.noActiveTenant': {
      en: 'No active tenant',
      af: 'Geen aktiewe huurder',
      zu: 'Akukho umqashi osasebenzayo',
      xh: 'Akukho umntu ukodwa usebenzayo'
    },
    'property.availableNow': {
      en: 'Available now',
      af: 'Nou beskikbaar',
      zu: 'Iyatholakala manje',
      xh: 'Iyafumaneka ngoku'
    }
  };

  constructor(private logger: LoggerService) {
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
      this.logger.warn(`Translation missing for key: ${key}`);
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

