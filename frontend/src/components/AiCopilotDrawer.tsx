import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  HelpCircle,
  Shield,
  ArrowRight,
} from 'lucide-react'
import { api } from '../api'

interface AiCopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  sender: 'user' | 'assistant'
  text: string
  agent?: string
  data?: any
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello, I am the AEGIS Copilot powered by Amazon Bedrock & AgentCore. I have real-time access to the facility digital twin, 5 Ring cameras, active incidents, and PolicyMesh rules. How can I assist?",
      agent: 'AEGIS Orchestrator',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    'Why did you deny this visitor?',
    "Show me today's high-risk incidents.",
    'Who currently has temporary access?',
    'Give Rahul access for 20 minutes.',
    'Which zones have unusual activity?',
    'Investigate incident AE-1042.',
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim()
    if (!q) return

    setMessages((prev) => [...prev, { sender: 'user', text: q }])
    if (!queryText) setInput('')
    setLoading(true)

    try {
      const res = await api.queryCopilot(q)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          agent: res.agent,
          data: res.data,
        },
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error connecting to AEGIS agent runtime: ${err.message}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-cyber-900 border-l border-cyber-border shadow-2xl z-50 flex flex-col justify-between animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-cyber-border flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">AEGIS AI Copilot</h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Bedrock AgentCore • Live Tool Invocation
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500">
              {m.sender === 'user' ? (
                <>
                  <span>Security Operator</span>
                  <User className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-sky-400" />
                  <span>{m.agent || 'AEGIS Agent'}</span>
                </>
              )}
            </div>

            <div
              className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none shadow-glow-blue'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none font-sans'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-sky-400 font-mono animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Agent reasoning across Ring telemetry & policies...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions & Input */}
      <div className="p-4 border-t border-cyber-border bg-slate-950/80 space-y-3">
        {/* Quick Prompts */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
          {quickPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
