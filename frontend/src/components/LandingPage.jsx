import { useLanguage } from "../context/LanguageContext";

export default function LandingPage({ onGetStarted }) {
  const { t } = useLanguage();

  const features = [
    {
      icon: "🤖",
      title: {
        "en-US": "AI-Powered Calls",
        "hi-IN": "AI-संचालित कॉल",
        "kn-IN": "AI-ಚಾಲಿತ ಕರೆಗಳು",
        "mr-IN": "AI-चालित कॉल"
      },
      desc: {
        "en-US": "Automated voice calls in your language",
        "hi-IN": "आपकी भाषा में स्वचालित वॉयस कॉल",
        "kn-IN": "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ವಾಯ್ಸ್ ಕರೆಗಳು",
        "mr-IN": "तुमच्या भाषेत स्वयंचलित व्हॉइस कॉल"
      }
    },
    {
      icon: "🌍",
      title: {
        "en-US": "Multilingual Support",
        "hi-IN": "बहुभाषी समर्थन",
        "kn-IN": "ಬಹುಭಾಷಾ ಬೆಂಬಲ",
        "mr-IN": "बहुभाषिक समर्थन"
      },
      desc: {
        "en-US": "English, Hindi, Kannada, Marathi",
        "hi-IN": "अंग्रेजी, हिंदी, कन्नड़, मराठी",
        "kn-IN": "ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಕನ್ನಡ, ಮರಾಠಿ",
        "mr-IN": "इंग्रजी, हिंदी, कन्नड, मराठी"
      }
    },
    {
      icon: "⚡",
      title: {
        "en-US": "Instant Confirmation",
        "hi-IN": "तत्काल पुष्टि",
        "kn-IN": "ತ್ವರಿತ ದೃಢೀಕರಣ",
        "mr-IN": "त्वरित पुष्टी"
      },
      desc: {
        "en-US": "Get confirmation in 30 seconds",
        "hi-IN": "30 सेकंड में पुष्टि प्राप्त करें",
        "kn-IN": "30 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ದೃಢೀಕರಣ ಪಡೆಯಿರಿ",
        "mr-IN": "30 सेकंदात पुष्टी मिळवा"
      }
    },
    {
      icon: "🔒",
      title: {
        "en-US": "Secure & Reliable",
        "hi-IN": "सुरक्षित और विश्वसनीय",
        "kn-IN": "ಸುರಕ್ಷಿತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ",
        "mr-IN": "सुरक्षित आणि विश्वासार्ह"
      },
      desc: {
        "en-US": "Your data is safe with us",
        "hi-IN": "आपका डेटा हमारे साथ सुरक्षित है",
        "kn-IN": "ನಿಮ್ಮ ಡೇಟಾ ನಮ್ಮೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿದೆ",
        "mr-IN": "तुमचा डेटा आमच्याकडे सुरक्षित आहे"
      }
    }
  ];

  const { language } = useLanguage();

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", background: "#0f172a" }}>
      {/* Hero Section */}
      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "4rem 2rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem",
        alignItems: "center"
      }}>
        {/* Left Content */}
        <div>
          <h1 style={{ 
            fontSize: "3rem", 
            color: "#e2e8f0", 
            marginBottom: "1rem",
            lineHeight: 1.2
          }}>
            {language === "en-US" && "AI-Powered Voice Order Confirmation"}
            {language === "hi-IN" && "AI-संचालित वॉयस ऑर्डर पुष्टि"}
            {language === "kn-IN" && "AI-ಚಾಲಿತ ವಾಯ್ಸ್ ಆರ್ಡರ್ ದೃಢೀಕರಣ"}
            {language === "mr-IN" && "AI-चालित व्हॉइस ऑर्डर पुष्टी"}
          </h1>
          
          <p style={{ 
            fontSize: "1.2rem", 
            color: "#94a3b8", 
            marginBottom: "2rem",
            lineHeight: 1.6
          }}>
            {language === "en-US" && "Experience the future of order management with intelligent voice calls that speak your language."}
            {language === "hi-IN" && "बुद्धिमान वॉयस कॉल के साथ ऑर्डर प्रबंधन के भविष्य का अनुभव करें जो आपकी भाषा बोलती है।"}
            {language === "kn-IN" && "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಮಾತನಾಡುವ ಬುದ್ಧಿವಂತ ವಾಯ್ಸ್ ಕರೆಗಳೊಂದಿಗೆ ಆರ್ಡರ್ ನಿರ್ವಹಣೆಯ ಭವಿಷ್ಯವನ್ನು ಅನುಭವಿಸಿ."}
            {language === "mr-IN" && "तुमची भाषा बोलणाऱ्या बुद्धिमान व्हॉइस कॉलसह ऑर्डर व्यवस्थापनाच्या भविष्याचा अनुभव घ्या."}
          </p>

          <button
            onClick={onGetStarted}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(124, 58, 237, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(124, 58, 237, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(124, 58, 237, 0.4)";
            }}
          >
            {language === "en-US" && "🚀 Get Started"}
            {language === "hi-IN" && "🚀 शुरू करें"}
            {language === "kn-IN" && "🚀 ಪ್ರಾರಂಭಿಸಿ"}
            {language === "mr-IN" && "🚀 सुरू करा"}
          </button>
        </div>

        {/* Right Image */}
        <div style={{ position: "relative" }}>
          <img 
            src="/hero1.png" 
            alt="AI Voice Assistant" 
            style={{ 
              width: "100%", 
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
          />
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        background: "#1e293b", 
        padding: "4rem 2rem",
        borderTop: "2px solid #334155"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ 
            textAlign: "center", 
            fontSize: "2.5rem", 
            color: "#e2e8f0", 
            marginBottom: "3rem" 
          }}>
            {language === "en-US" && "Why Choose AutomatonAI?"}
            {language === "hi-IN" && "AutomatonAI क्यों चुनें?"}
            {language === "kn-IN" && "AutomatonAI ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?"}
            {language === "mr-IN" && "AutomatonAI का निवड करा?"}
          </h2>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "2rem" 
          }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: "#0f172a",
                  padding: "2rem",
                  borderRadius: 16,
                  textAlign: "center",
                  border: "1px solid #334155",
                  transition: "transform 0.2s, border-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "#7c3aed";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#334155";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  color: "#e2e8f0", 
                  fontSize: "1.2rem", 
                  marginBottom: "0.5rem" 
                }}>
                  {feature.title[language]}
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  {feature.desc[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "4rem 2rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem",
        alignItems: "center"
      }}>
        {/* Left Image */}
        <div>
          <img 
            src="/hero2.png" 
            alt="Order Process" 
            style={{ 
              width: "100%", 
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
          />
        </div>

        {/* Right Content */}
        <div>
          <h2 style={{ 
            fontSize: "2.5rem", 
            color: "#e2e8f0", 
            marginBottom: "2rem" 
          }}>
            {language === "en-US" && "How It Works"}
            {language === "hi-IN" && "यह कैसे काम करता है"}
            {language === "kn-IN" && "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ"}
            {language === "mr-IN" && "हे कसे कार्य करते"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              {
                step: "1",
                title: {
                  "en-US": "Place Your Order",
                  "hi-IN": "अपना ऑर्डर दें",
                  "kn-IN": "ನಿಮ್ಮ ಆರ್ಡರ್ ಮಾಡಿ",
                  "mr-IN": "तुमची ऑर्डर द्या"
                },
                desc: {
                  "en-US": "Browse products and add to cart",
                  "hi-IN": "उत्पाद ब्राउज़ करें और कार्ट में जोड़ें",
                  "kn-IN": "ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಮತ್ತು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
                  "mr-IN": "उत्पादने ब्राउझ करा आणि कार्टमध्ये जोडा"
                }
              },
              {
                step: "2",
                title: {
                  "en-US": "Receive AI Call",
                  "hi-IN": "AI कॉल प्राप्त करें",
                  "kn-IN": "AI ಕರೆ ಸ್ವೀಕರಿಸಿ",
                  "mr-IN": "AI कॉल प्राप्त करा"
                },
                desc: {
                  "en-US": "Get a call in 30 seconds",
                  "hi-IN": "30 सेकंड में कॉल प्राप्त करें",
                  "kn-IN": "30 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ಕರೆ ಪಡೆಯಿರಿ",
                  "mr-IN": "30 सेकंदात कॉल मिळवा"
                }
              },
              {
                step: "3",
                title: {
                  "en-US": "Confirm Order",
                  "hi-IN": "ऑर्डर की पुष्टि करें",
                  "kn-IN": "ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ",
                  "mr-IN": "ऑर्डर पुष्टी करा"
                },
                desc: {
                  "en-US": "Speak naturally to confirm",
                  "hi-IN": "पुष्टि करने के लिए स्वाभाविक रूप से बोलें",
                  "kn-IN": "ದೃಢೀಕರಿಸಲು ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ",
                  "mr-IN": "पुष्टी करण्यासाठी नैसर्गिकपणे बोला"
                }
              }
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "flex-start"
                }}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ 
                    color: "#e2e8f0", 
                    fontSize: "1.3rem", 
                    marginBottom: "0.5rem" 
                  }}>
                    {item.title[language]}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
                    {item.desc[language]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
