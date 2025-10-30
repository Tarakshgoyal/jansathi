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

  // Location
  location: {
    loading: Translation;
    denied: Translation;
    error: Translation;
    unavailable: Translation;
    change: Translation;
  };

  // Map
  map: {
    loadingLocation: Translation;
    permissionDenied: Translation;
    locationError: Translation;
    enableLocationInstructions: Translation;
    yourLocation: Translation;
    unsupportedPlatform: Translation;
  };

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

  // Camera/Photo
  camera: {
    cameraPermission: Translation;
    cameraPermissionDenied: Translation;
    cameraPermissionInstructions: Translation;
    grantPermission: Translation;
    takePhoto: Translation;
    retakePhoto: Translation;
    removePhoto: Translation;
    addPhoto: Translation;
    photoAttached: Translation;
    flipCamera: Translation;
    capturePhoto: Translation;
    photos: Translation;
    attachPhotos: Translation;
    attachPhotosDesc: Translation;
    maxPhotosReached: Translation;
  };

  // Form Fields
  form: {
    title: Translation;
    titlePlaceholder: Translation;
    description: Translation;
    descriptionPlaceholder: Translation;
    required: Translation;
    optional: Translation;
    issueDetails: Translation;
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

  // Location
  location: {
    loading: {
      en: "Getting location...",
      hi: "स्थान प्राप्त हो रहा है...",
    },
    denied: {
      en: "Location access denied",
      hi: "स्थान अभिगम अस्वीकृत",
    },
    error: {
      en: "Unable to get location",
      hi: "स्थान प्राप्त नहीं हो सका",
    },
    unavailable: {
      en: "Location unavailable",
      hi: "स्थान अनुपलब्ध",
    },
    change: {
      en: "Change",
      hi: "बदलें",
    },
  },

  // Map
  map: {
    loadingLocation: {
      en: "Loading your location...",
      hi: "आपका स्थान लोड हो रहा है...",
    },
    permissionDenied: {
      en: "Location permission denied",
      hi: "स्थान अनुमति अस्वीकृत",
    },
    locationError: {
      en: "Unable to get your location",
      hi: "आपका स्थान प्राप्त नहीं हो सका",
    },
    enableLocationInstructions: {
      en: "Please enable location services in your device settings",
      hi: "कृपया अपने डिवाइस सेटिंग्स में स्थान सेवाएं सक्षम करें",
    },
    yourLocation: {
      en: "Your Location",
      hi: "आपका स्थान",
    },
    unsupportedPlatform: {
      en: "Maps are only available on Android and iOS",
      hi: "मानचित्र केवल Android और iOS पर उपलब्ध हैं",
    },
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
    // TODO: Make Hindi Samsaya ko
    createReportDesc: {
      en: "Report an issue",
      hi: "समस्या की रिपोर्ट करें",
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

  // Camera/Photo
  camera: {
    cameraPermission: {
      en: "We need your permission to use the camera",
      hi: "हमें कैमरा उपयोग करने के लिए आपकी अनुमति चाहिए",
    },
    cameraPermissionDenied: {
      en: "Camera permission denied",
      hi: "कैमरा अनुमति अस्वीकृत",
    },
    cameraPermissionInstructions: {
      en: "Please enable camera access in your device settings",
      hi: "कृपया अपने डिवाइस सेटिंग्स में कैमरा एक्सेस सक्षम करें",
    },
    grantPermission: {
      en: "Grant Permission",
      hi: "अनुमति दें",
    },
    takePhoto: {
      en: "Take Photo",
      hi: "फोटो लें",
    },
    retakePhoto: {
      en: "Retake Photo",
      hi: "फिर से फोटो लें",
    },
    removePhoto: {
      en: "Remove Photo",
      hi: "फोटो हटाएं",
    },
    addPhoto: {
      en: "Add Photo",
      hi: "फोटो जोड़ें",
    },
    photoAttached: {
      en: "Photo Attached",
      hi: "फोटो संलग्न है",
    },
    flipCamera: {
      en: "Flip Camera",
      hi: "कैमरा पलटें",
    },
    capturePhoto: {
      en: "Capture Photo",
      hi: "फोटो कैप्चर करें",
    },
    photos: {
      en: "Photos",
      hi: "फोटो",
    },
    attachPhotos: {
      en: "Attach Photos",
      hi: "फोटो संलग्न करें",
    },
    attachPhotosDesc: {
      en: "Add photos of the issue (up to 3)",
      hi: "समस्या की फोटो जोड़ें (अधिकतम 3)",
    },
    maxPhotosReached: {
      en: "Maximum 3 photos allowed",
      hi: "अधिकतम 3 फोटो की अनुमति है",
    },
  },

  // Form Fields
  form: {
    title: {
      en: "Title",
      hi: "शीर्षक",
    },
    titlePlaceholder: {
      en: "Enter a brief title for the issue",
      hi: "समस्या के लिए संक्षिप्त शीर्षक दर्ज करें",
    },
    description: {
      en: "Description",
      hi: "विवरण",
    },
    descriptionPlaceholder: {
      en: "Describe the issue in detail",
      hi: "समस्या का विस्तार से वर्णन करें",
    },
    required: {
      en: "Required",
      hi: "आवश्यक",
    },
    optional: {
      en: "Optional",
      hi: "वैकल्पिक",
    },
    issueDetails: {
      en: "Issue Details",
      hi: "समस्या विवरण",
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
