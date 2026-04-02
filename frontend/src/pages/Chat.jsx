import { useState, useEffect, useRef } from "react";
import '../styles/chat.css'

const API = 'http://localhost:8000'

const SUGGESTIONS = [
    "How much did I spend this week?",
    "What tasks are pending?",
    "What is my most expensive category?",
    "How many tasks have I completed?",
    "Summarize my expenses this month"
]

function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const messagesEndRef = useRef(null)

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    })

    const scrollBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollBottom()
    }, [messages, loading])

    const sendMessage = async (text) => {
        const messageText = text || input.trim()
        if (!messageText) return
        if (loading) return

        setError('')
        setInput('')

        const userMessage = {
            role: 'user',
            content: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) //locale,options
        }

        setMessages(prev => [...prev, userMessage])
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('you\'re not logged in')
                setLoading(false)
                return
            }

            const res = await fetch(`${API}/ai/chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    message: messageText,
                    history: messages.slice(-6).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })

            })

            const data = await res.json()
            if (!res.ok) {
                setError(data.detail || 'failed to get response')
                setLoading(false)
                return

            }

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (err) {
            setError('Network error - is the server running')

        } finally {
            setLoading(false)
        }

    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>🤖 AI Assistant</h1>
                <p>Ask anything about your tasks</p>
            </div>

            {error && <p className="error-msg">{error}</p>}


            {messages.length === 0 && (
                <div className="empty-chat">
                    <div className="big-icon">🧠</div>
                    <p>ask me anything about your tasks</p>
                </div>

            )}

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-bubble">{msg.content}</div>
                        <span className="message-time">{msg.time}</span>
                    </div>
                ))}

                {loading && (
                    <div className="message assistant">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="suggestions">
                {SUGGESTIONS.map((s, i) => (
                    <button
                        key={i}
                        className="suggestion-chip"
                        onClick={() => sendMessage(s)}
                        disabled={loading}>
                        {s}
                    </button>
                ))}

            </div>

            <div className="chat-input-area">
                <textarea
                placeholder="Ask me anything...(Enter to send,Shift + Enter to new line)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}/>

                <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={ loading || !input.trim()}>{loading ? '...':'Send'}</button>

            </div>

        </div>
    )


}

export default Chat