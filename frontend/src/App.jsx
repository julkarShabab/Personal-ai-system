import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import Expenses from './pages/Expenses'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Layout from './components/Layout'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout><Dashboard/></Layout>} />
        <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
        <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
        <Route path="/chat" element={<Layout><Chat /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App