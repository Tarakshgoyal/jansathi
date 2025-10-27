/**
 * Translation configuration for Jansarthi App
 * Contains all text translations in English and Hindi
 */

export type Language = "en" | "hi";

export interface Translation {
  en: string;
  hi: string;
}

export interface Translations {
  // Common
  appName: Translation;

  // Menu Screen
  menu: {
    welcome: Translation;
    subtitle: Translation;
    createReport: Translation;
    createReportDesc: Translation;
    viewReports: Translation;
    viewReportsDesc: Translation;
    viewMap: Translation;
    viewMapDesc: Translation;
    quickActions: Translation;
    selectIssueType: Translation;
    selectIssueTypeDesc: Translation;
  };

  // Quick Actions
  quickActions: {
    viewReports: Translation;
    viewMap: Translation;
    jalSamasya: Translation;
    bijliSamasya: Translation;
    sadakSamasya: Translation;
    kachraSamasya: Translation;
  };

  // Issue Types
  issueTypes: {
    jalSamasya: Translation;
    bijliSamasya: Translation;
    sadakSamasya: Translation;
    kachraSamasya: Translation;
    severageSamasya: Translation;
  };

  // Language
  language: {
    english: Translation;
    hindi: Translation;
    selectLanguage: Translation;
  };

  // Common Actions
  actions: {
    submit: Translation;
    cancel: Translation;
    edit: Translation;
    delete: Translation;
    view: Translation;
    back: Translation;
    next: Translation;
    save: Translation;
  };
}

export const translations: Translations = {
  // Common
  appName: {
    en: "Jansarthi",
    hi: "जनसारथी",
  },

  // Menu Screen
  menu: {
    welcome: {
      en: "Welcome to Jansarthi",
      hi: "जनसारथी में आपका स्वागत है",
    },
    subtitle: {
      en: "Report and track issues in your area",
      hi: "अपने क्षेत्र में समस्याओं की रिपोर्ट करें और ट्रैक करें",
    },
    createReport: {
      en: "Create New Report",
      hi: "नई रिपोर्ट बनाएं",
    },
    createReportDesc: {
      en: "Report an issue in your area",
      hi: "अपने क्षेत्र में समस्या की रिपोर्ट करें",
    },
    viewReports: {
      en: "My Reports",
      hi: "मेरी रिपोर्ट्स",
    },
    viewReportsDesc: {
      en: "View and track your submitted reports",
      hi: "अपनी सबमिट की गई रिपोर्ट देखें और ट्रैक करें",
    },
    viewMap: {
      en: "View Map",
      hi: "मानचित्र देखें",
    },
    viewMapDesc: {
      en: "See all reports in your city on map",
      hi: "मानचित्र पर अपने शहर की सभी रिपोर्ट देखें",
    },
    quickActions: {
      en: "Quick Actions",
      hi: "त्वरित कार्य",
    },
    selectIssueType: {
      en: "Select Issue Type",
      hi: "समस्या का प्रकार चुनें",
    },
    selectIssueTypeDesc: {
      en: "Choose the type of issue you want to report",
      hi: "जिस प्रकार की समस्या आप रिपोर्ट करना चाहते हैं उसे चुनें",
    },
  },

  // Quick Actions
  quickActions: {
    viewReports: {
      en: "My Reports",
      hi: "मेरी रिपोर्ट्स",
    },
    viewMap: {
      en: "View Map",
      hi: "मानचित्र देखें",
    },
    jalSamasya: {
      en: "Water Issue",
      hi: "जल समस्या",
    },
    bijliSamasya: {
      en: "Electricity Issue",
      hi: "बिजली समस्या",
    },
    sadakSamasya: {
      en: "Road Issue",
      hi: "सड़क समस्या",
    },
    kachraSamasya: {
      en: "Garbage Issue",
      hi: "कचरा समस्या",
    },
  },

  // Issue Types
  issueTypes: {
    jalSamasya: {
      en: "Water Issue",
      hi: "जल समस्या",
    },
    bijliSamasya: {
      en: "Electricity Issue",
      hi: "बिजली समस्या",
    },
    sadakSamasya: {
      en: "Road Issue",
      hi: "सड़क समस्या",
    },
    kachraSamasya: {
      en: "Garbage Issue",
      hi: "कचरा समस्या",
    },
    severageSamasya: {
      en: "Sewerage Issue",
      hi: "सीवरेज समस्या",
    },
  },

  // Language
  language: {
    english: {
      en: "English",
      hi: "अंग्रेज़ी",
    },
    hindi: {
      en: "Hindi",
      hi: "हिंदी",
    },
    selectLanguage: {
      en: "Select Language",
      hi: "भाषा चुनें",
    },
  },

  // Common Actions
  actions: {
    submit: {
      en: "Submit",
      hi: "सबमिट करें",
    },
    cancel: {
      en: "Cancel",
      hi: "रद्द करें",
    },
    edit: {
      en: "Edit",
      hi: "संपादित करें",
    },
    delete: {
      en: "Delete",
      hi: "हटाएं",
    },
    view: {
      en: "View",
      hi: "देखें",
    },
    back: {
      en: "Back",
      hi: "वापस",
    },
    next: {
      en: "Next",
      hi: "अगला",
    },
    save: {
      en: "Save",
      hi: "सहेजें",
    },
  },
};
