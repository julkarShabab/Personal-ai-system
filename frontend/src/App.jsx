import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import Expenses from './pages/Expenses'
import Dashboard from './pages/dashboard'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/tasks" element={<Tasks/>}/>
        <Route path='/expenses' element={<Expenses/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App