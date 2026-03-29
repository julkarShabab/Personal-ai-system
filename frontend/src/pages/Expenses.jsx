import { useState,useEffect } from "react";
import '../styles/expenses.css'

const API = 'http://localhost:8000'

const CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Health',
  'Education', 'Entertainment', 'Bills', 'Other'
]

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ total: 0, by_category: {}, count: 0 })
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const getHeaders = () => ({
    'Conternt-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  })

  const fetchExpenses = async () => {
    const res = await fetch(`${API}/expenses/`,{headers:getHeaders()})
    const data = await res.json()
    if (res.ok) setExpenses(Array.isArray(data) ? data: [])
  }

  const fetchSummary = async () => {
    const res = await fetch(`${API}/expenses/summary`,{headers:getHeaders()})
    const data = await res.json()
    if (res.ok) setSummary(data)
  }

  useEffect( ()=>{
    fetchExpenses()
    fetchSummary
  },[])

  const handleAdd = async () => {
    if(!amount || !category) return
    setLoading(true)
    try{
        const res = await fetch(`${API}/expenses`,{
            method:'POST',
            headers:getHeaders(),
            body: JSON.stringify({
                amount:parseFloat(amount),
                category,
                description,
                date:date || null
            })
        })
        if(res.ok){
            setAmount('')
            setCategory('Food')
            setDescription('')
            setDate('')
            fetchExpenses()
            fetchSummary()
        }
    }catch (err){
        alert('failed to add expense')
    }
    setLoading(false)
  }

  const handleDelete = async(id) => {
    await fetch(`${API}/expenses/${id}`,{
        method:'DELETE',
        headers:getHeaders()
    })
    fetchExpenses()
    fetchSummary()
  }

  const handleEditClick = (expense) =>{
    setEditingExpense(expense.id)
    setEditAmount(expense.amount)
    setEditCategory(expense.category)
    setEditDescription(expense.description || '')
  }

  const handleEditSave = async (id) => {
    await fetch(`${API}/expenses/${id}`,{
        method:'PUT',headers:getHeaders(),
        body:JSON.stringify({
            amount: parseFloat(editAmount),
            category:editCategory,
            description:editDescription
        })
    })
    setEditingExpense(null)
    fetchExpenses()
    fetchSummary()
  }

  return(
    <div className="expenses-container">
      <div className="expenses-header">
        <h1>My Expenses</h1>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p>{summary.total.toFixed(2)} BDT</p>
        </div>
        <div className="summary-card">
          <h3>Transactions</h3>
          <p>{summary.count}</p>
        </div>
        <div className="summary-card">
          <h3>Top Category</h3>
          <p>
            {Object.keys(summary.by_category).length > 0
              ? Object.entries(summary.by_category).sort((a, b) => b[1] - a[1])[0][0]
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="add-expense-form">
        <h2>Add New Expense</h2>
        <div className="form-row">
          <input
            type="number"
            placeholder="Amount (BDT)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAdd} disabled={loading}>
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>

      <div className="expense-list">
        {expenses.length === 0 && <p>No expenses yet. Add one above!</p>}
        {expenses.map(expense => (
          <div key={expense.id} className="expense-card">
            {editingExpense === expense.id ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" onClick={() => handleEditSave(expense.id)}>Save</button>
                  <button className="btn-delete" onClick={() => setEditingExpense(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="expense-info">
                  <h3>{expense.category}</h3>
                  {expense.description && <p>{expense.description}</p>}
                  <p>{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">{expense.amount} BDT</span>
                  <div className="expense-actions">
                    <button className="btn-edit" onClick={() => handleEditClick(expense)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(expense.id)}>Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Expenses

