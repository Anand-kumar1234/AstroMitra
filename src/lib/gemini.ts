export async function getAstrologyReading(params: {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  zodiacSign?: string;
  type: "personalized" | "horoscope" | "palmistry";
  image?: { data: string; mimeType: string };
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("नक्षत्र वर्तमान में धुंधले हैं - एपीआई कुंजी गायब है। कृपया सेटिंग्स में जाकर GEMINI_API_KEY कॉन्फ़िगर करें।");
  }

  // We use gemini-2.5-flash as the highly modern, fast, and stable model for REST
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are a world-renowned expert Vedic Astrologer, Western Astrologer, and master Palmist. Your tone is deeply empathetic, wise, realistic, and spiritually grounded.

CRITICAL: Provide all responses strictly and beautifully in Hindi (हिंदी). Use high-quality, elegant, and standard Hindi vocabulary but keep it easily readable and comforting. 

Guidelines:
1. FOR ASTROLOGY & KUNDLI (Personalized Astrology):
   - You must act like an elite, experienced astrologer. Since you lack full calculation engines, use the provided birth date, time, and location to estimate the Lagna (Ascendant) and planetary impacts conceptually.
   - Formulate highly accurate-sounding planetary transitions (Gochar) and Nakshatra energies.
   - Divide the customized consultation into:
     * ✨ लग्न और व्यक्तित्व विश्लेषण (Rising Sign & Core Personality)
     * 🪐 ग्रह स्थिति और वर्तमान महादशा (Current Planetary Period & Transits)
     * 💼 करियर, शिक्षा और व्यवसाय (Career, Education & Finance Alignment)
     * 💖 प्रेम, वैवाहिक जीवन और मित्र (Love, Marriage & Relationships)
     * 🩺 ऊर्जा, स्वास्थ्य और जीवनशैली (Health, Medical Astrology & Lifestyle)
     * 💎 विशेष ब्रह्मांडीय उपाय (Customized Remedies - gems, colors, charity, and mantra chants)

2. FOR DAILY HOROSCOPE (दैनिक राशिफल):
   - Make it feel deeply personalized and astrological, avoiding generic sentences. Refer to actual lunar mansions/transits for the given zodiac sign for today.
   - Structurally include:
     * 🌌 आज के आकाशीय संकेत (Cosmic Theme of the Day)
     * 🎨 शुभ विवरण (Daily Auspicious Parameters):
       - 🌟 भाग्यशाली रंग (Lucky Color)
       - 🔢 भाग्यशाली अंक (Lucky Number)
       - ⏳ अनुकूल समय (Auspicious Time Horizon)
     * 💼 करियर, व्यापार और वित्त (Career, Business & Money)
     * ❤️ प्रेम, रोमांस और परिवार (Love, Heart & Family Bonds)
     * 🧘 स्वास्थ्य, मन और योग (Wellness, Stress management & Health)
     * 🔑 आज की अनमोल सलाह (Key Wisdom Key / Guidance)

3. FOR PALMISTRY (हस्तरेखा विश्लेषण):
   - Analyze the provided palm image with extreme expertise.
   - Describe what you locate in the image (or discuss standard markings with extreme professionalism if parts are unclear).
   - Divide the analysis into:
     * ✋ हाथ का प्रकार और तत्व (Hand Shape, Base & Elements: Earth, Air, Fire, Water)
     * ❤️ हृदय रेखा (Heart Line - Emotional capacity, empathy, romance)
     * 🧠 मस्तिष्क रेखा (Head Line - Logic, mental strength, creative expression)
     * 🌱 जीवन रेखा (Life Line - Life span energy, health milestones, major transitions)
     * 🪐 भाग्य रेखा और मुख्य पर्वत (Fate Line & major Mounts of Jupiter, Saturn, Venus, Mercury)
     * 🐚 शुभ चिह्न और उपचार (Auspicious Patterns/Symbols & Remedial palmistry)

4. GENERAL PRESENTATION RULES:
   - Use Markdown heavily: bold headings, thin separating lines (---), bullet points, and tables where appropriate to present parameters elegantly.
   - Include brief, precise Sanskrit shlokas or traditional astrological wisdom phrases somewhere in the text where relevant (transliterated into Devanagari).
   - Always conclude with the mandatory friendly astrological disclaimer about free will vs planetary trends.

5. RESPONSE SPEED OPTIMIZATION (CRITICAL):
   - Keep all explanations snappy, direct, and tightly focused.
   - Avoid verbose preambles, introductory filler text, or repetitive sentences.
   - Maintain the highest quality of analysis but communicate main points very clearly and concisely so that generation speed is exceptionally fast.`;

  let prompt = "";
  let contents: any[] = [];

  if (params.type === "palmistry" && params.image) {
    prompt = `कृपया दी गई हथेली की छवि का अत्यंत सूक्ष्म, वैज्ञानिक और व्यावहारिक हस्तरेखा विश्लेषण करें। 
    हार्ट लाइन, हेड लाइन, लाइफ लाइन, फेट लाइन और शुक्र, गुरु, शनि आदि पर्वतों की स्थिति का गहराई से हिंदी में वर्णन करें। 
    व्यक्ति के स्वभाव, करियर की संभावनाओं, प्रेम जीवन और जीवन की ऊर्जा शक्ति के बारे में सटीक मार्गदर्शन दें।`;
    
    contents = [
      {
        parts: [
          {
            inlineData: {
              mimeType: params.image.mimeType || "image/jpeg",
              data: params.image.data
            }
          },
          {
            text: prompt
          }
        ]
      }
    ];
  } else if (params.type === "personalized") {
    prompt = `कृपया निम्नलिखित जन्म विवरण के आधार पर एक विस्तृत और अत्यंत व्यावहारिक वैदिक ज्योतिषीय परामर्श (Personalized Astrology Consultation) तैयार करें:
    - जन्म तिथि (Birth Date): ${params.birthDate}
    - जन्म समय (Birth Time): ${params.birthTime}
    - जन्म स्थान (Birth Place): ${params.birthPlace}
    
    जन्म समय और तिथि के प्रभाव से संभावित लग्न और ग्रहों का अनुमान लगाते हुए करियर, वित्तीय स्थिति, दांपत्य व प्रेम जीवन तथा स्वास्थ्य के आगामी समय का विवेचन करें।`;
    
    contents = [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ];
  } else {
    prompt = `कृपया ${params.zodiacSign} (राशि) के लिए आज का अत्यंत सटीक और प्रेरक दैनिक राशिफल प्रदान करें। 
    इसमें आज का विशिष्ट आकाशीय प्रभाव बताते हुए करियर, प्रेम/संबंध, स्वास्थ्य और शुभ रंग/अंक/समय की विस्तृत जानकारी दें।`;
    
    contents = [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ];
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "aistudio-build"
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.9,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API HTTP Error Status: ${response.status}`, errorText);
      throw new Error(`Google API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const readingText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!readingText) {
      console.warn("Unexpected Gemini response body:", JSON.stringify(data));
      throw new Error("No reading text found in Cosmic response.");
    }

    return readingText;
  } catch (error: any) {
    console.error("Detailed Gemini API Error (Fetch fallback):", error);
    
    if (error?.message?.includes("Rpc failed") || error?.message?.includes("status 500") || error?.message?.includes("status 503")) {
      throw new Error("ब्रह्मांडीय ऊर्जा का प्रवाह अस्थायी रूप से बाधित है। कृपया कुछ क्षणों में पुनः प्रयास करें। (Cosmic connection interrupted. Please try again in 30 seconds.)");
    }
    
    throw error;
  }
}
