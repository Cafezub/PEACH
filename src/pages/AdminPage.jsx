import React, { useState, useEffect } from 'react'
import {
  addLostDocument,
  getLostDocuments,
  updateLostDocument,
  deleteLostDocument,
  markAsFound,
  updateDocumentLocation
} from '../firebaseService'
import LocationPicker from '../components/LocationPicker'
import '../styles/Admin.css'


function AdminPage() {
  const [documents, setDocuments] = useState([])
  const [editingDoc, setEditingDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [documentLocation, setDocumentLocation] = useState(null)
  const [formData, setFormData] = useState({
    docType: '',
    ownerName: '',
    ownerCpf: '',
    description: '',
    lostDate: '',
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const docs = await getLostDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Erro ao carregar:', error)
      alert('Erro ao carregar documentos!')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setFormData({
      docType: '',
      ownerName: '',
      ownerCpf: '',
      description: '',
      lostDate: '',
      contactEmail: '',
      contactPhone: ''
    })
    setEditingDoc(null)
    setDocumentLocation(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.docType || !formData.ownerName) {
      alert('Tipo de documento e nome do proprietário são obrigatórios!')
      return
    }

    if (!documentLocation) {
      alert('📍 Clique em "Capturar localização" antes de registrar o documento!')
      return
    }

    setLoading(true)

    try {
      if (editingDoc) {
        await updateLostDocument(editingDoc.id, formData)
        if (documentLocation) {
          await updateDocumentLocation(editingDoc.id, documentLocation)
        }
        alert('✅ Documento atualizado com sucesso!')
      } else {
        await addLostDocument(formData, documentLocation)
        alert('✅ Documento registrado como perdido!')
      }
      
      await loadDocuments()
      resetForm()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar!')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsFound = async (id) => {
    if (window.confirm('Marcar este documento como encontrado?')) {
      setLoading(true)
      try {
        await markAsFound(id, '')
        await loadDocuments()
        alert('🎉 Documento marcado como encontrado!')
      } catch (error) {
        alert('Erro ao marcar como encontrado!')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDelete = async (id, ownerName) => {
    if (window.confirm(`Tem certeza que deseja excluir o documento de "${ownerName}"?`)) {
      setLoading(true)
      try {
        await deleteLostDocument(id)
        await loadDocuments()
        alert('✅ Registro excluído com sucesso!')
      } catch (error) {
        alert('Erro ao excluir!')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEdit = (doc) => {
    setEditingDoc(doc)
    setFormData({
      docType: doc.docType,
      ownerName: doc.ownerName,
      ownerCpf: doc.ownerCpf || '',
      description: doc.description || '',
      lostDate: doc.lostDate || '',
      contactEmail: doc.contactEmail || '',
      contactPhone: doc.contactPhone || ''
    })
    if (doc.geolocation) {
      setDocumentLocation(doc.geolocation)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLocationSelect = (location) => {
    setDocumentLocation(location)
  }

  const handleLocationReady = (location) => {
    setDocumentLocation(location)
  }

  const formatCpf = (cpf) => {
    if (!cpf) return ''
    const numeric = cpf.replace(/\D/g, '')
    if (numeric.length !== 11) return cpf
    return numeric.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const filteredDocuments = documents.filter(doc => {
    if (filterType === 'lost' && doc.status !== 'lost') return false
    if (filterType === 'found' && doc.status !== 'found') return false
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        doc.ownerName.toLowerCase().includes(searchLower) ||
        doc.docType.toLowerCase().includes(searchLower) ||
        (doc.ownerCpf && doc.ownerCpf.includes(searchTerm))
      )
    }
    return true
  })

  const stats = {
    total: documents.length,
    lost: documents.filter(d => d.status === 'lost').length,
    found: documents.filter(d => d.status === 'found').length
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📝 Área Administrativa</h1>
        <p>Registre, edite e gerencie documentos perdidos</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card lost">
          <span className="stat-number">{stats.lost}</span>
          <span className="stat-label">Perdidos</span>
        </div>
        <div className="stat-card found">
          <span className="stat-number">{stats.found}</span>
          <span className="stat-label">Encontrados</span>
        </div>
      </div>

      {/* Formulário de Registro */}
      <div className="form-section">
        <h2>{editingDoc ? '✏️ Editar Registro' : '➕ Registrar Documento Perdido'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Documento *</label>
              <select 
                name="docType" 
                value={formData.docType} 
                onChange={handleChange} 
                className="form-select"
                required
              >
                <option value="">Selecione...</option>
                <option value="RG">RG - Registro Geral</option>
                <option value="CNH">CNH - Carteira de Motorista</option>
                <option value="CPF">CPF - Cadastro de Pessoa Física</option>
                <option value="Passaporte">Passaporte</option>
                <option value="Carteira de Trabalho">Carteira de Trabalho</option>
                <option value="Título de Eleitor">Título de Eleitor</option>
                <option value="Certidão de Nascimento">Certidão de Nascimento</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nome do Proprietário *</label>
              <input
                type="text"
                name="ownerName"
                placeholder="Nome completo"
                value={formData.ownerName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                name="ownerCpf"
                placeholder="000.000.000-00"
                value={formData.ownerCpf}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Data que perdeu</label>
              <input
                type="date"
                name="lostDate"
                value={formData.lostDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>📍 Localização do registro (GPS) *</label>
            <LocationPicker 
              onLocationChange={handleLocationSelect}
              onLocationReady={handleLocationReady}
              autoCapture={true}
            />
            <small className="form-hint">
              ⚠️ A localização GPS é obrigatória
            </small>
          </div>

          <div className="form-group">
            <label>Descrição adicional</label>
            <textarea
              name="description"
              placeholder="Detalhes importantes sobre o documento..."
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email para contato</label>
              <input
                type="email"
                name="contactEmail"
                placeholder="email@exemplo.com"
                value={formData.contactEmail}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Telefone para contato</label>
              <input
                type="tel"
                name="contactPhone"
                placeholder="(00) 00000-0000"
                value={formData.contactPhone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="button-group">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? '🔄 Salvando...' : (editingDoc ? '✏️ Atualizar' : '📝 Registrar Perda')}
            </button>
            
            {editingDoc && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                ❌ Cancelar
              </button>
            )}
          </div>
          
          {!documentLocation && !editingDoc && (
            <div className="location-warning">
              ⚠️ Atenção: Você precisa capturar a localização GPS antes de registrar o documento!
            </div>
          )}
        </form>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar por nome, documento ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filterType === 'lost' ? 'active' : ''}`}
            onClick={() => setFilterType('lost')}
          >
            🟡 Perdidos ({stats.lost})
          </button>
          <button 
            className={`filter-btn ${filterType === 'found' ? 'active' : ''}`}
            onClick={() => setFilterType('found')}
          >
            ✅ Encontrados ({stats.found})
          </button>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="list-section">
        <h2>📄 Documentos Registrados ({filteredDocuments.length})</h2>
        
        {loading ? (
          <div className="loading">🔄 Carregando...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <p>📭 Nenhum documento registrado</p>
            <p>Clique em "Registrar Perda" para adicionar o primeiro documento!</p>
          </div>
        ) : (
          <div className="documents-grid">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className={`doc-card ${doc.status === 'found' ? 'found' : ''}`}>
                <div className="doc-header">
                  <span className={`status-badge ${doc.status}`}>
                    {doc.status === 'lost' ? '🟡 Perdido' : '✅ Encontrado'}
                  </span>
                  <span className="doc-type-badge">{doc.docType}</span>
                </div>
                
                <div className="doc-details">
                  <p className="doc-name">{doc.ownerName}</p>

                  {doc.ownerCpf && (
                    <p className="doc-line">
                      <span className="doc-label">📌 CPF:</span>
                      <span className="doc-value">{formatCpf(doc.ownerCpf)}</span>
                    </p>
                  )}
                  
                  {doc.geolocation && (
                    <div className="doc-location-group">
                      <p className="doc-line">
                        <span className="doc-label">📍 Local:</span>
                        <a 
                          href={`https://www.google.com/maps?q=${doc.geolocation.lat},${doc.geolocation.lng}&hl=pt-BR`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-link"
                        >
                          {doc.geolocation.address || `${doc.geolocation.lat.toFixed(4)}, ${doc.geolocation.lng.toFixed(4)}`}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {doc.lostDate && (
                    <p className="doc-line">
                      <span className="doc-label">📅 Data:</span>
                      <span className="doc-value">{new Date(doc.lostDate).toLocaleDateString('pt-BR')}</span>
                    </p>
                  )}
                  
                  {doc.description && (
                    <p className="doc-description">
                      <span className="doc-label">📝 Descrição:</span>
                      <span className="doc-value">{doc.description}</span>
                    </p>
                  )}
                  
                  {(doc.contactEmail || doc.contactPhone) && (
                    <div className="doc-contact">
                      <span className="doc-label">📞 Contato:</span>
                      <div className="contact-values">
                        {doc.contactEmail && <span>✉️ {doc.contactEmail}</span>}
                        {doc.contactPhone && <span>📱 {doc.contactPhone}</span>}
                      </div>
                    </div>
                  )}
                  
                  <p className="doc-date">
                    Registrado em: {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  
                  {doc.foundAt && (
                    <p className="doc-found-date">
                      ✅ Encontrado em: {new Date(doc.foundAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <div className="card-actions">
                  {doc.status === 'lost' && (
                    <button onClick={() => handleMarkAsFound(doc.id)} className="btn-found">
                      ✅ Marcar como Encontrado
                    </button>
                  )}
                  <button onClick={() => handleEdit(doc)} className="btn-edit">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(doc.id, doc.ownerName)} className="btn-delete">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage