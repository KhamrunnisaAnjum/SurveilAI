import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface BotResponse {
  keywords: string[]
  response: string
}

const botResponses: Record<string, BotResponse[]> = {
  en: [
    { keywords: ['symptom', 'fever', 'cough', 'pain', 'sick'], response: "I can help you report symptoms. Go to the Community Pulse page and fill out the symptom report form. Would you like me to guide you through it?" },
    { keywords: ['hospital', 'facility', 'nearby', 'close'], response: "You can find nearby hospitals and health facilities on the Emergency Radar page. It shows real-time bed availability, oxygen supply, and blood units." },
    { keywords: ['alert', 'outbreak', 'danger', 'warning'], response: "Check the Alerts page for active outbreak alerts and health warnings in your district. Stay informed and take precautions." },
    { keywords: ['risk', 'score', 'patient'], response: "Clinical risk scores are calculated using AI analysis of vital signs. Green (<30) is low risk, Amber (30-70) is moderate, and Red (>70) is high risk." },
    { keywords: ['emergency', 'sos', 'help', 'accident'], response: "For emergencies, use the red SOS button in the bottom-right corner. It will contact the nearest hospital after a 5-second countdown. You can also call 108 for ambulance services." },
    { keywords: ['hello', 'hi', 'hey', 'namaste', 'namaskar'], response: "Hello! I'm Surveil's health assistant. How can I help you today? You can ask about symptoms, hospitals, alerts, or emergency services." },
    { keywords: ['thank', 'thanks'], response: "You're welcome! Stay healthy and don't hesitate to reach out if you need anything else." },
    { keywords: ['bed', 'icu', 'oxygen', 'blood'], response: "Real-time resource availability is shown on the Emergency Radar page. You can see ICU beds, oxygen cylinders, and blood units by type at each facility." },
    { keywords: ['asha', 'worker', 'visit', 'home'], response: "ASHA workers can view their home visit schedule and pending symptom reports on their dashboard. The system helps prioritize high-risk community members." },
    { keywords: ['language', 'hindi', 'english'], response: "You can switch between English and Hindi using the language selector in the top-right corner. More languages will be available soon." },
  ],
  hi: [
    { keywords: ['लक्षण', 'बुखार', 'खांसी', 'दर्द', 'बीमार'], response: "मैं आपको लक्षण रिपोर्ट करने में मदद कर सकता हूं। सामुदायिक नाड़ी पेज पर जाएं और लक्षण रिपोर्ट फॉर्म भरें।" },
    { keywords: ['अस्पताल', 'सुविधा', 'निकट', 'पास'], response: "आपातकालीन रडार पेज पर निकटतम अस्पताल और स्वास्थ्य सुविधाएं देखें। यह वास्तविक समय में बेड उपलब्धता दिखाता है।" },
    { keywords: ['अलर्ट', 'प्रकोप', 'खतरा', 'चेतावनी'], response: "अपने जिले में सक्रिय प्रकोप अलर्ट और स्वास्थ्य चेतावनियों के लिए अलर्ट पेज देखें।" },
    { keywords: ['जोखिम', 'स्कोर', 'रोगी'], response: "नैदानिक जोखिम स्कोर हरे (<30), एम्बर (30-70), और लाल (>70) में वर्गीकृत हैं।" },
    { keywords: ['आपातकाल', 'सोस', 'मदद', 'दुर्घटना'], response: "आपातकालीन स्थिति में, नीचे दाईं ओर लाल SOS बटन का उपयोग करें। यह 5 सेकंड की गिनती के बाद निकटतम अस्पताल से संपर्क करेगा।" },
    { keywords: ['नमस्ते', 'नमस्कार', 'हाय', 'हेलो'], response: "नमस्ते! मैं सर्वेल का स्वास्थ्य सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?" },
    { keywords: ['धन्यवाद', 'शुक्रिया'], response: "आपका स्वागत है! स्वस्थ रहें और यदि आपको कुछ भी चाहिए तो संकोच न करें।" },
    { keywords: ['बेड', 'आईसीयू', 'ऑक्सीजन', 'रक्त'], response: "वास्तविक समय संसाधन उपलब्धता आपातकालीन रडार पेज पर दिखाई जाती है।" },
    { keywords: ['भाषा', 'हिंदी', 'अंग्रेजी'], response: "आप ऊपरी दाएं कोने में भाषा चयनकर्ता का उपयोग करके अंग्रेजी और हिंदी के बीच स्विच कर सकते हैं।" },
  ],
}

const defaultResponses = {
  en: "I'm not sure I understand. You can ask me about symptoms, hospitals, alerts, emergency services, or risk scores. How can I help?",
  hi: "मुझे समझ नहीं आया। आप मुझसे लक्षण, अस्पताल, अलर्ट, आपातकालीन सेवाओं या जोखिम स्कोर के बारे में पूछ सकते हैं। मैं आपकी कैसे मदद कर सकता हूं?",
}

export function ChatBot() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: i18n.language === 'hi'
        ? 'नमस्ते! मैं सर्वेल का स्वास्थ्य सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?'
        : "Hello! I'm Surveil's health assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const lang = i18n.language === 'hi' ? 'hi' : 'en'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const findResponse = (text: string): string => {
    const lower = text.toLowerCase()
    const responses = botResponses[lang] || botResponses.en
    for (const r of responses) {
      if (r.keywords.some((k) => lower.includes(k))) {
        return r.response
      }
    }
    return defaultResponses[lang]
  }

  const sendMessage = () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: findResponse(userMsg.text),
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
      setTyping(false)
    }, 800 + Math.random() * 700)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-110 transition-all flex items-center justify-center"
        title="Chat with health assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-110 transition-all flex items-center justify-center"
        title="Chat with health assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <div className="fixed bottom-24 md:bottom-24 left-4 md:left-6 z-50 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-2xl border border-surface-200 shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Surveil Assistant</p>
              <p className="text-xs text-white/70">Online</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-surface-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white text-surface-800 border border-surface-200 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-surface-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-surface-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-surface-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-surface-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'hi' ? 'संदेश लिखें...' : 'Type a message...'}
              className="flex-1 h-10 rounded-xl border border-surface-200 bg-surface-50 px-3 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
