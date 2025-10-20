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
      en: 'January 1, 2024',
      af: '1 Januarie 2024',
      zu: '1 Januwari 2024',
      xh: '1 Januwari 2024'
    },
    'privacy.dataCollection': {
      en: 'Data Collection',
      af: 'Data Versameling',
      zu: 'Ukuqoqwa Kwedatha',
      xh: 'Ukuqoqwa Kwedatha'
    },
    'privacy.dataCollectionDescription': {
      en: 'We collect information necessary to provide our property management services, including property details, tenant information, and payment records.',
      af: 'Ons versamel inligting wat nodig is om ons eiendom bestuur dienste te lewer, insluitend eiendom besonderhede, huurder inligting en betaling rekords.',
      zu: 'Siqoqa imininingwane edingekayo ukunikeza izinsiza zethu zokuphatha izakhiwo, kufaka phakathi imininingwane yezakhiwo, imininingwane yabaqashi kanye namarekhodi ezinkokhelo.',
      xh: 'Siqoqa imininingwane edingekayo ukunikeza izinsiza zethu zokuphatha izakhiwo, kufaka phakathi imininingwane yezakhiwo, imininingwane yabaqashi kanye namarekhodi ezinkokhelo.'
    },
    'privacy.dataUsage': {
      en: 'Data Usage',
      af: 'Data Gebruik',
      zu: 'Ukusetshenziswa Kwedatha',
      xh: 'Ukusetshenziswa Kwedatha'
    },
    'privacy.dataUsageDescription': {
      en: 'Your data is used solely to provide and improve our services. We do not sell or share your personal information with third parties.',
      af: 'Jou data word slegs gebruik om ons dienste te lewer en te verbeter. Ons verkoop of deel nie jou persoonlike inligting met derde partye nie.',
      zu: 'Idatha yakho isetshenziswa kuphela ukunikeza nokuthuthukisa izinsiza zethu. Asithengisi noma sabelane ngemininingwane yakho yomuntu siqu nabanye abantu.',
      xh: 'Idatha yakho isetshenziswa kuphela ukunikeza nokuthuthukisa izinsiza zethu. Asithengisi noma sabelane ngemininingwane yakho yomuntu siqu nabanye abantu.'
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
    'privacy.dataSecurity': {
      en: 'Data Security',
      af: 'Data Sekuriteit',
      zu: 'Ukuvikeleka Kwedatha',
      xh: 'Ukuvikeleka Kwedatha'
    },
    'privacy.dataSecurityDescription': {
      en: 'We implement industry-standard security measures to protect your data, including encryption and secure data storage.',
      af: 'Ons implementeer bedryf-standaard sekuriteit maatreëls om jou data te beskerm, insluitend enkripsie en veilige data stoor.',
      zu: 'Sisebenzisa izinyathelo zokuvikela ezijwayelekile emkhakheni ukuvikela idatha yakho, kufaka phakathi ukubethela nokugcina idatha ngokuphephile.',
      xh: 'Sisebenzisa izinyathelo zokuvikela ezijwayelekile emkhakheni ukuvikela idatha yakho, kufaka phakathi ukubethela nokugcina idatha ngokuphephile.'
    },
    'privacy.userRights': {
      en: 'Your Rights',
      af: 'Jou Regte',
      zu: 'Amalungelo Akho',
      xh: 'Amalungelo Akho'
    },
    'privacy.userRightsDescription': {
      en: 'You have the right to access, update, or delete your personal data at any time. Contact us to exercise these rights.',
      af: 'Jy het die reg om jou persoonlike data op enige tyd te bekyk, op te dateer of te skrap. Kontak ons om hierdie regte uit te oefen.',
      zu: 'Unelungelo lokufinyelela, ukubuyekeza, noma ukususa idatha yakho yomuntu siqu noma nini. Sithintane nathi ukusebenzisa le malungelo.',
      xh: 'Unelungelo lokufinyelela, ukubuyekeza, noma ukususa idatha yakho yomuntu siqu noma nini. Sithintane nathi ukusebenzisa le malungelo.'
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
      en: 'January 1, 2024',
      af: '1 Januarie 2024',
      zu: '1 Januwari 2024',
      xh: '1 Januwari 2024'
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
    'terms.liability': {
      en: 'Limitation of Liability',
      af: 'Beperking van Aanspreeklikheid',
      zu: 'Ukulinganiselwa Kwesibopho',
      xh: 'Ukulinganiselwa Kwesibopho'
    },
    'terms.liabilityDescription': {
      en: 'Propza is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.',
      af: 'Propza word "soos dit is" verskaf sonder waarborge. Ons is nie aanspreeklik vir enige skade wat voortspruit uit jou gebruik van die diens nie.',
      zu: 'I-Propza inikezwa "njengoba injalo" ngaphandle kweziqinisekiso. Asibophi muntu noma yiziphi izonakaliso ezivela ekusebenziseni kwakho insiza.',
      xh: 'I-Propza inikezwa "njengoba injalo" ngaphandle kweziqinisekiso. Asibophi muntu noma yiziphi izonakaliso ezivela ekusebenziseni kwakho insiza.'
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

