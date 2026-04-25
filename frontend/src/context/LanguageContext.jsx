import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const translations = {
  "en-US": {
    // Header
    appTitle: "Automaton AI",
    appSubtitle: "AI-Powered Voice Order System",
    userMode: "User Mode",
    adminMode: "Admin Mode",
    logout: "Logout",
    
    // Login
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",
    signupSubtitle: "Sign up to start ordering",
    loginSubtitle: "Login to continue",
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number (with country code)",
    deliveryAddress: "Delivery Address",
    signUp: "Sign Up",
    login: "Login",
    processing: "Processing...",
    alreadyHaveAccount: "Already have an account? Login",
    dontHaveAccount: "Don't have an account? Sign up",
    
    // Tabs
    products: "Products",
    cart: "Cart",
    myOrders: "My Orders",
    
    // Products
    availableProducts: "Available Products",
    addToCart: "Add to Cart",
    adding: "Adding...",
    
    // Cart
    yourCart: "Your Cart",
    items: "items",
    cartEmpty: "Your cart is empty",
    cartEmptyMsg: "Add some delicious items to get started!",
    orderSummary: "Order Summary",
    deliveryDate: "Delivery Date",
    deliveryTime: "Delivery Time",
    subtotal: "Subtotal",
    delivery: "Delivery",
    free: "FREE",
    total: "Total",
    placeOrder: "Place Order",
    placingOrder: "Placing Order...",
    orderPlacedMsg: "Order placed! You'll receive a call in 5 seconds to confirm.",
    callNote: "You'll receive an AI call in 5 seconds to confirm your order",
    remove: "Remove",
    quantity: "Quantity",
    
    // My Orders
    noOrders: "No orders yet",
    noOrdersMsg: "Place your first order to see it here!",
    orderNumber: "Order #",
    placedOn: "Placed on",
    deliveryLabel: "Delivery",
    totalAmount: "Total Amount",
    at: "at",
    
    // Status
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    modified: "Modified",
    
    // Admin Dashboard
    adminDashboard: "Admin Dashboard",
    adminSubtitle: "Monitor all orders and AI call interactions",
    totalOrders: "Total Orders",
    allOrders: "All Orders",
    orderDetails: "Order Details",
    orderInformation: "Order Information",
    customer: "Customer",
    phone: "Phone",
    address: "Address",
    callLogs: "Call Logs",
    attempts: "attempts",
    attempt: "Attempt",
    aiConversation: "AI Conversation",
    turns: "turns",
    user: "User",
    ai: "AI",
    aiModifications: "AI Modifications",
    loadingDetails: "Loading details...",
    failedToLoad: "Failed to load details"
  },
  
  "hi-IN": {
    // Header
    appTitle: "ऑटोमेटन AI",
    appSubtitle: "AI-संचालित वॉयस ऑर्डर सिस्टम",
    userMode: "यूजर मोड",
    adminMode: "एडमिन मोड",
    logout: "लॉगआउट",
    
    // Login
    createAccount: "खाता बनाएं",
    welcomeBack: "वापसी पर स्वागत है",
    signupSubtitle: "ऑर्डर करना शुरू करने के लिए साइन अप करें",
    loginSubtitle: "जारी रखने के लिए लॉगिन करें",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    phoneNumber: "फोन नंबर (देश कोड के साथ)",
    deliveryAddress: "डिलीवरी का पता",
    signUp: "साइन अप करें",
    login: "लॉगिन",
    processing: "प्रोसेस हो रहा है...",
    alreadyHaveAccount: "पहले से खाता है? लॉगिन करें",
    dontHaveAccount: "खाता नहीं है? साइन अप करें",
    
    // Tabs
    products: "उत्पाद",
    cart: "कार्ट",
    myOrders: "मेरे ऑर्डर",
    
    // Products
    availableProducts: "उपलब्ध उत्पाद",
    addToCart: "कार्ट में जोड़ें",
    adding: "जोड़ा जा रहा है...",
    
    // Cart
    yourCart: "आपका कार्ट",
    items: "आइटम",
    cartEmpty: "आपका कार्ट खाली है",
    cartEmptyMsg: "शुरू करने के लिए कुछ स्वादिष्ट आइटम जोड़ें!",
    orderSummary: "ऑर्डर सारांश",
    deliveryDate: "डिलीवरी की तारीख",
    deliveryTime: "डिलीवरी का समय",
    subtotal: "उप-योग",
    delivery: "डिलीवरी",
    free: "मुफ्त",
    total: "कुल",
    placeOrder: "ऑर्डर करें",
    placingOrder: "ऑर्डर हो रहा है...",
    orderPlacedMsg: "ऑर्डर हो गया! आपको 5 सेकंड में कॉल आएगी।",
    callNote: "आपको अपने ऑर्डर की पुष्टि के लिए 5 सेकंड में AI कॉल आएगी",
    remove: "हटाएं",
    quantity: "मात्रा",
    
    // My Orders
    noOrders: "अभी तक कोई ऑर्डर नहीं",
    noOrdersMsg: "इसे यहां देखने के लिए अपना पहला ऑर्डर करें!",
    orderNumber: "ऑर्डर #",
    placedOn: "तारीख",
    deliveryLabel: "डिलीवरी",
    totalAmount: "कुल राशि",
    at: "पर",
    
    // Status
    pending: "लंबित",
    confirmed: "पुष्टि की गई",
    cancelled: "रद्द",
    modified: "संशोधित",
    
    // Admin Dashboard
    adminDashboard: "एडमिन डैशबोर्ड",
    adminSubtitle: "सभी ऑर्डर और AI कॉल इंटरैक्शन की निगरानी करें",
    totalOrders: "कुल ऑर्डर",
    allOrders: "सभी ऑर्डर",
    orderDetails: "ऑर्डर विवरण",
    orderInformation: "ऑर्डर जानकारी",
    customer: "ग्राहक",
    phone: "फोन",
    address: "पता",
    callLogs: "कॉल लॉग",
    attempts: "प्रयास",
    attempt: "प्रयास",
    aiConversation: "AI बातचीत",
    turns: "बारी",
    user: "यूजर",
    ai: "AI",
    aiModifications: "AI संशोधन",
    loadingDetails: "विवरण लोड हो रहा है...",
    failedToLoad: "विवरण लोड करने में विफल"
  },
  
  "kn-IN": {
    // Header
    appTitle: "ಆಟೋಮೇಟನ್ AI",
    appSubtitle: "AI-ಚಾಲಿತ ವಾಯ್ಸ್ ಆರ್ಡರ್ ಸಿಸ್ಟಮ್",
    userMode: "ಯೂಸರ್ ಮೋಡ್",
    adminMode: "ಅಡ್ಮಿನ್ ಮೋಡ್",
    logout: "ಲಾಗ್ಔಟ್",
    
    // Login
    createAccount: "ಖಾತೆ ರಚಿಸಿ",
    welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ",
    signupSubtitle: "ಆರ್ಡರ್ ಮಾಡಲು ಸೈನ್ ಅಪ್ ಮಾಡಿ",
    loginSubtitle: "ಮುಂದುವರಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ",
    firstName: "ಮೊದಲ ಹೆಸರು",
    lastName: "ಕೊನೆಯ ಹೆಸರು",
    phoneNumber: "ಫೋನ್ ಸಂಖ್ಯೆ (ದೇಶ ಕೋಡ್ ಸಹಿತ)",
    deliveryAddress: "ಡೆಲಿವರಿ ವಿಳಾಸ",
    signUp: "ಸೈನ್ ಅಪ್",
    login: "ಲಾಗಿನ್",
    processing: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
    alreadyHaveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್",
    dontHaveAccount: "ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್",
    
    // Tabs
    products: "ಉತ್ಪನ್ನಗಳು",
    cart: "ಕಾರ್ಟ್",
    myOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
    
    // Products
    availableProducts: "ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳು",
    addToCart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    adding: "ಸೇರಿಸಲಾಗುತ್ತಿದೆ...",
    
    // Cart
    yourCart: "ನಿಮ್ಮ ಕಾರ್ಟ್",
    items: "ಐಟಂಗಳು",
    cartEmpty: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
    cartEmptyMsg: "ಪ್ರಾರಂಭಿಸಲು ಕೆಲವು ರುಚಿಕರ ಐಟಂಗಳನ್ನು ಸೇರಿಸಿ!",
    orderSummary: "ಆರ್ಡರ್ ಸಾರಾಂಶ",
    deliveryDate: "ಡೆಲಿವರಿ ದಿನಾಂಕ",
    deliveryTime: "ಡೆಲಿವರಿ ಸಮಯ",
    subtotal: "ಉಪಮೊತ್ತ",
    delivery: "ಡೆಲಿವರಿ",
    free: "ಉಚಿತ",
    total: "ಒಟ್ಟು",
    placeOrder: "ಆರ್ಡರ್ ಮಾಡಿ",
    placingOrder: "ಆರ್ಡರ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    orderPlacedMsg: "ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ! 5 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ಕರೆ ಬರುತ್ತದೆ.",
    callNote: "ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲು 5 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ AI ಕರೆ ಬರುತ್ತದೆ",
    remove: "ತೆಗೆದುಹಾಕಿ",
    quantity: "ಪ್ರಮಾಣ",
    
    // My Orders
    noOrders: "ಇನ್ನೂ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ",
    noOrdersMsg: "ಇಲ್ಲಿ ನೋಡಲು ನಿಮ್ಮ ಮೊದಲ ಆರ್ಡರ್ ಮಾಡಿ!",
    orderNumber: "ಆರ್ಡರ್ #",
    placedOn: "ದಿನಾಂಕ",
    deliveryLabel: "ಡೆಲಿವರಿ",
    totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
    at: "ಗೆ",
    
    // Status
    pending: "ಬಾಕಿ ಉಳಿದಿದೆ",
    confirmed: "ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    modified: "ಮಾರ್ಪಡಿಸಲಾಗಿದೆ",
    
    // Admin Dashboard
    adminDashboard: "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    adminSubtitle: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು AI ಕರೆ ಸಂವಹನಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
    totalOrders: "ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು",
    allOrders: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು",
    orderDetails: "ಆರ್ಡರ್ ವಿವರಗಳು",
    orderInformation: "ಆರ್ಡರ್ ಮಾಹಿತಿ",
    customer: "ಗ್ರಾಹಕ",
    phone: "ಫೋನ್",
    address: "ವಿಳಾಸ",
    callLogs: "ಕರೆ ಲಾಗ್‌ಗಳು",
    attempts: "ಪ್ರಯತ್ನಗಳು",
    attempt: "ಪ್ರಯತ್ನ",
    aiConversation: "AI ಸಂಭಾಷಣೆ",
    turns: "ಸರದಿಗಳು",
    user: "ಯೂಸರ್",
    ai: "AI",
    aiModifications: "AI ಮಾರ್ಪಾಡುಗಳು",
    loadingDetails: "ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    failedToLoad: "ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ"
  },
  
  "mr-IN": {
    // Header
    appTitle: "ऑटोमेटन AI",
    appSubtitle: "AI-चालित व्हॉइस ऑर्डर सिस्टम",
    userMode: "यूजर मोड",
    adminMode: "अॅडमिन मोड",
    logout: "लॉगआउट",
    
    // Login
    createAccount: "खाते तयार करा",
    welcomeBack: "परत स्वागत आहे",
    signupSubtitle: "ऑर्डर करण्यासाठी साइन अप करा",
    loginSubtitle: "सुरू ठेवण्यासाठी लॉगिन करा",
    firstName: "पहिले नाव",
    lastName: "आडनाव",
    phoneNumber: "फोन नंबर (देश कोडसह)",
    deliveryAddress: "डिलिव्हरी पत्ता",
    signUp: "साइन अप",
    login: "लॉगिन",
    processing: "प्रक्रिया सुरू आहे...",
    alreadyHaveAccount: "आधीच खाते आहे? लॉगिन करा",
    dontHaveAccount: "खाते नाही? साइन अप करा",
    
    // Tabs
    products: "उत्पादने",
    cart: "कार्ट",
    myOrders: "माझे ऑर्डर",
    
    // Products
    availableProducts: "उपलब्ध उत्पादने",
    addToCart: "कार्टमध्ये जोडा",
    adding: "जोडत आहे...",
    
    // Cart
    yourCart: "तुमची कार्ट",
    items: "वस्तू",
    cartEmpty: "तुमची कार्ट रिकामी आहे",
    cartEmptyMsg: "सुरुवात करण्यासाठी काही चवदार वस्तू जोडा!",
    orderSummary: "ऑर्डर सारांश",
    deliveryDate: "डिलिव्हरी तारीख",
    deliveryTime: "डिलिव्हरी वेळ",
    subtotal: "उप-एकूण",
    delivery: "डिलिव्हरी",
    free: "मोफत",
    total: "एकूण",
    placeOrder: "ऑर्डर द्या",
    placingOrder: "ऑर्डर देत आहे...",
    orderPlacedMsg: "ऑर्डर दिली! 5 सेकंदात कॉल येईल.",
    callNote: "तुमच्या ऑर्डरची पुष्टी करण्यासाठी 5 सेकंदात AI कॉल येईल",
    remove: "काढा",
    quantity: "प्रमाण",
    
    // My Orders
    noOrders: "अद्याप ऑर्डर नाहीत",
    noOrdersMsg: "येथे पाहण्यासाठी तुमची पहिली ऑर्डर द्या!",
    orderNumber: "ऑर्डर #",
    placedOn: "तारीख",
    deliveryLabel: "डिलिव्हरी",
    totalAmount: "एकूण रक्कम",
    at: "वाजता",
    
    // Status
    pending: "प्रलंबित",
    confirmed: "पुष्टी केली",
    cancelled: "रद्द केली",
    modified: "सुधारित",
    
    // Admin Dashboard
    adminDashboard: "अॅडमिन डॅशबोर्ड",
    adminSubtitle: "सर्व ऑर्डर आणि AI कॉल परस्परसंवादांचे निरीक्षण करा",
    totalOrders: "एकूण ऑर्डर",
    allOrders: "सर्व ऑर्डर",
    orderDetails: "ऑर्डर तपशील",
    orderInformation: "ऑर्डर माहिती",
    customer: "ग्राहक",
    phone: "फोन",
    address: "पत्ता",
    callLogs: "कॉल लॉग",
    attempts: "प्रयत्न",
    attempt: "प्रयत्न",
    aiConversation: "AI संभाषण",
    turns: "वळणे",
    user: "यूजर",
    ai: "AI",
    aiModifications: "AI बदल",
    loadingDetails: "तपशील लोड करत आहे...",
    failedToLoad: "तपशील लोड करण्यात अयशस्वी"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en-US";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["en-US"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
