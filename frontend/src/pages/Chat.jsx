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
    const [message, setMessage] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const messagesEndRef = useRef(null)

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    })

    const scrollBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior:'smooth'})
    }

    useEffect( () => {
        scrollBottom()
    },[message,loading])

    const sendMessage = async (text) => {
        const messageText = text || input.trim()
        if(!messageText) return
        if(loading) return

        setError('')
        setInput('')

        const userMessage = {
            role: 'user',
            content:messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) //locale,options
        }

        setMessage(prev => [...prev,userMessage])
        setLoading(true)

        try{
            const token = localStorage.getItem('token')
            if(!token){
                setError('you\'re not logged in')
                setLoading(false)
                return
            }

            const res = await fetch(`${API}/ai/chat`,{
                method:'POST',
                headers:getHeaders(),
                body:JSON.stringify({
                    message:messageText,
                    history:message.slice(-6).map(m => ({
                        role: m.role,
                        content:m.content
                    }))
                })

            })
        }catch (err){
            
        }

    }


}