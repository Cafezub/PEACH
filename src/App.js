import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PublicSearch from './pages/PublicSearch'
import AdminPage from './pages/AdminPage'

console.log('AdminPage importado:', AdminPage)  // ← Para debug

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicSearch />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}

export default App