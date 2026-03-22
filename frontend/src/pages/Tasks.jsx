import { useState,useEffect } from "react";
import '../styles/tasks.css'

const API = 'http://localhost:8000'

function Tasks(){
    const [tasks,setTasks] = useState([])
    const [title,setTitle] = useState('')
    const [description,setDescription] = useState('')
    const [deadline,setDeadline] = useState('')
    const [priority,setPriority] = useState('medium')
    const [loading,setLoading] = useState(false)

    const token = localStorage.getItem('token')
    const headers = {
        'content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    

}