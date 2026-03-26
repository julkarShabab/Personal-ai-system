import { useState, useEffect } from 'react'
import '../styles/tasks.css'

const API = 'http://localhost:8000'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)

  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editStatus, setEditStatus] = useState('pending')

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  })

  const fetchTasks = async () => {
    const res = await fetch(`${API}/tasks/`, { headers: getHeaders() })
    const data = await res.json()
    if (res.ok) {
      setTasks(Array.isArray(data) ? data : [])
    } else {
      setTasks([])
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleAddTask = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/tasks/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          description,
          deadline: deadline || null,
          priority
        })
      })
      if (res.ok) {
        setTitle('')
        setDescription('')
        setDeadline('')
        setPriority('medium')
        fetchTasks()
      }
    } catch (err) {
      alert('Failed to add task')
    }
    setLoading(false)
  }

  const handleComplete = async (task) => {
    await fetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        status: task.status === 'completed' ? 'pending' : 'completed'
      })
    })
    fetchTasks()
  }

  const handleDelete = async (id) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    fetchTasks()
  }

  const handleEditClick = (task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditDeadline(task.deadline ? task.deadline.slice(0, 16) : '')
    setEditPriority(task.priority)
    setEditStatus(task.status)
  }

  const handleEditSave = async (id) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        deadline: editDeadline || null,
        priority: editPriority,
        status: editStatus
      })
    })
    setEditingTask(null)
    fetchTasks()
  }

  const handleEditCancel = () => {
    setEditingTask(null)
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>My Tasks</h1>
      </div>

      <div className="add-task-form">
        <h2>Add New Task</h2>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className="form-row">
          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <button className="btn-primary" onClick={handleAddTask} disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      <div className="task-list">
        {tasks.length === 0 && <p>No tasks yet. Add one above!</p>}
        {tasks.map(task => (
          <div key={task.id} className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>

            {editingTask === task.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                />
                <div className="form-row">
                  <input
                    type="datetime-local"
                    value={editDeadline}
                    onChange={e => setEditDeadline(e.target.value)}
                  />
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="edit-actions">
                  <button className="btn-primary" onClick={() => handleEditSave(task.id)}>Save</button>
                  <button className="btn-delete" onClick={handleEditCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="task-info">
                  <h3 className={task.status === 'completed' ? 'done' : ''}>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  {task.deadline && <p>Due: {new Date(task.deadline).toLocaleString()}</p>}
                  <div className="task-meta">
                    <span className={`badge ${task.priority}`}>{task.priority}</span>
                    <span className={`badge ${task.status}`}>{task.status}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn-complete" onClick={() => handleComplete(task)}>
                    {task.status === 'completed' ? 'Undo' : 'Complete'}
                  </button>
                  <button className="btn-edit" onClick={() => handleEditClick(task)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks