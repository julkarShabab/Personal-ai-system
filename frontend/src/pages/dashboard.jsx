import { useState,useEffect } from "react";
import {data, Link ,useNavigate} from 'react-router-dom'

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title

}from 'chart.js'
import {Doughnut ,Bar, Line} from 'react-chartjs-2'
import '../styles/dashboard.css'

ChartJS.register(ArcElement,Tooltip,Legend,CategoryScale,LinearScale,BarElement,Title)

const API = 'http://localhost:8000'

const COLORS = ['#6c63ff', '#43a047', '#fb8c00', '#e53935',
  '#1e88e5', '#8e24aa', '#00897b', '#f4511e']

function Dashboard(){
    const [summary,setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,setError] = useState('')
    const navigate = useNavigate()

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${localStorage.getItem('token')}`
    })

    const fetchSummary = async () => {
        try{
            setLoading(true)
            setError('')
            const res = await fetch(`${API}/dashboard/summary`,{
                headers:getHeaders()
            })
            if(res.status ===401){
                navigate('/login')
                return
            }
            if(!res.ok){
                const data = await res.json()
                setError(data.detail || 'failed to load dashboard')
                return
            }
            const data = await res.json()
            setSummary(data)
        }
        catch(err){
            setError('Network error - is the server running??')
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if(!token){
            navigate('/login')
            return
        }
        fetchSummary()
    },[])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }
    if (loading) return <div className="loading">Loading your dashboard</div>

    if (error) return(
        <div className="dashboard-conatainer">
            <div className="error-banner">{error}</div>
            <button onClick={fetchSummary}> Retry</button>
        </div>
    )

    const categoryData = {
        labels : Object.keys(summary.expenses.by_category),
        datasets:[{
            data: Object.values(summary.expenses.by_category),
            backgroundColor: COLORS,
            borderWidth: 0
        }]
    }

    const dailyData = {
        labels: Object.keys(summary.expenses.daily_this_week).reverse(),
        datasets:[{
            label:'Expenses (BDT)',
            data: Object.values(summary.expenses.daily_this_week).reverse(),
            backgroundColor: '#6c63ff',
            borderRadius: 6
        }]
    }

    const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' }
      },
      x: {
        grid: { display: false }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👋 Welcome to your Dashboard</h1>
        <p>Here's an overview of your productivity and spending</p>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '8px',
            padding: '6px 14px',
            background: '#ffe0e0',
            color: '#e53935',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <h3>Total Tasks</h3>
          <p>{summary.tasks.total}</p>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <h3>Completed</h3>
          <p>{summary.tasks.completed}</p>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <h3>Pending</h3>
          <p>{summary.tasks.pending}</p>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">💰</div>
          <h3>Monthly Spend</h3>
          <p>{summary.expenses.monthly_total.toFixed(0)} BDT</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>📊 Daily Expenses — This Week</h2>
          {Object.keys(summary.expenses.daily_this_week).length > 0 ? (
            <Bar data={dailyData} options={barOptions} />
          ) : (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
              No expenses this week
            </p>
          )}
        </div>

        <div className="chart-card">
          <h2>🥧 Expenses by Category</h2>
          {Object.keys(summary.expenses.by_category).length > 0 ? (
            <Doughnut data={categoryData} options={doughnutOptions} />
          ) : (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
              No expense data yet
            </p>
          )}
        </div>
      </div>

      <div className="quick-links">
        <Link to="/tasks" className="quick-link-card">
          <div className="icon">✅</div>
          <h3>Tasks</h3>
          <p>{summary.tasks.pending} pending tasks</p>
        </Link>
        <Link to="/expenses" className="quick-link-card">
          <div className="icon">💰</div>
          <h3>Expenses</h3>
          <p>{summary.expenses.weekly_total.toFixed(0)} BDT this week</p>
        </Link>
        <div className="quick-link-card" style={{ opacity: 0.5 }}>
          <div className="icon">🤖</div>
          <h3>AI Assistant</h3>
          <p>Coming soon</p>
        </div>
      </div>
    </div>
  )

}
export default Dashboard