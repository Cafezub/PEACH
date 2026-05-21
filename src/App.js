import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import PublicSearch from './pages/PublicSearch'

function Home() {
  return <h1>Página Inicial</h1>
}

function Admin() {
  return <h1>Área Administrativa</h1>
}

function Navigation() {
  return (
    <nav style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Buscar</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<PublicSearch />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App