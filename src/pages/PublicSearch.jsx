import React, { useState, useEffect } from 'react'
import { getLostDocuments } from '../firebaseService'

function PublicSearch() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('name')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const normalizeText = (text) => {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
  }

  const cleanCpf = (cpf) => {
    if (!cpf) return ''
    return cpf.replace(/\D/g, '')
  }

  const formatCpf = (cpf) => {
    if (!cpf) return ''
    const numeric = cpf.replace(/\D/g, '')
    if (numeric.length !== 11) return cpf
    return numeric.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      alert(`⚠️ Digite o ${searchType === 'name' ? 'nome completo' : 'CPF'} para buscar!`)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      let filtered = []
      const term = searchTerm.trim()

      if (searchType === 'name') {
        const normalizedTerm = normalizeText(term)
        filtered = documents.filter(doc => {
          const normalizedDocName = normalizeText(doc.ownerName)
          return normalizedDocName === normalizedTerm
        })

        if (filtered.length === 0) {
          alert(`❌ Nenhum documento encontrado para o nome "${term}".\n\nVerifique se o nome foi digitado corretamente.`)
        }
      } else {
        const cleanTerm = cleanCpf(term)
        
        if (cleanTerm.length !== 11) {
          alert(`⚠️ CPF inválido! Digite um CPF com 11 dígitos.\n\nExemplo: 12345678900`)
          setLoading(false)
          setHasSearched(false)
          return
        }

        filtered = documents.filter(doc => {
          if (!doc.ownerCpf) return false
          const cleanDocCpf = cleanCpf(doc.ownerCpf)
          return cleanDocCpf === cleanTerm
        })

        if (filtered.length === 0) {
          alert(`❌ Nenhum documento encontrado para o CPF "${formatCpf(cleanTerm)}".`)
        }
      }

      setResults(filtered)
    } catch (error) {
      console.error('Erro na busca:', error)
      alert('Erro ao buscar documentos! Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setResults([])
    setHasSearched(false)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🔍 Buscar Documentos Perdidos</h1>
        <p style={{ color: '#666' }}>Digite o <strong>nome completo</strong> ou <strong>CPF</strong> exato do proprietário para localizar documentos</p>
      </div>

      <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '8px', marginBottom: '30px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => {
                setSearchType('name')
                clearSearch()
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: searchType === 'name' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                color: searchType === 'name' ? 'white' : '#555',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              👤 Buscar por Nome Completo
            </button>
            <button 
              type="button"
              onClick={() => {
                setSearchType('cpf')
                clearSearch()
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: searchType === 'cpf' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                color: searchType === 'cpf' ? 'white' : '#555',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📌 Buscar por CPF
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={searchType === 'name' 
                ? "Digite o NOME COMPLETO do proprietário (ex: João Silva Santos)" 
                : "Digite o CPF EXATO (11 dígitos, ex: 12345678900)"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 3,
                padding: '14px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                outline: 'none'
              }}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🔍 Buscando...' : '🔍 Buscar'}
            </button>
            {hasSearched && (
              <button 
                type="button" 
                onClick={clearSearch}
                style={{
                  padding: '14px 24px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✖️ Limpar
              </button>
            )}
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
          <p style={{ marginBottom: '8px', fontWeight: '500', color: '#1565c0' }}>💡 <strong>Dicas de busca:</strong></p>
          <ul style={{ marginLeft: '20px', color: '#555' }}>
            {searchType === 'name' ? (
              <>
                <li>Digite o <strong>nome completo</strong> como está registrado no documento</li>
                <li>Exemplo: "Maria Aparecida Silva" ou "José Santos Lima"</li>
                <li>⚠️ A busca é <strong>exata</strong> - digite o nome corretamente</li>
                <li>Não diferencia maiúsculas de minúsculas</li>
              </>
            ) : (
              <>
                <li>Digite o <strong>CPF com 11 dígitos</strong> (apenas números)</li>
                <li>Exemplo: <strong>12345678900</strong></li>
                <li>⚠️ Aceita CPF com formatação (123.456.789-00)</li>
                <li>A busca é <strong>exata</strong> - precisa ser o CPF correto</li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {hasSearched && (
          <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#555', fontSize: '1.2rem' }}>
              📄 Resultado da busca
              {results.length > 0 && <span style={{ color: '#667eea', fontWeight: 'normal' }}> ({results.length} documento encontrado)</span>}
            </h2>
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#667eea' }}>🔄 Carregando...</div>
        ) : hasSearched && results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fa', borderRadius: '8px', color: '#999' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>📭 Nenhum documento encontrado</p>
            <p>Verifique se o {searchType === 'name' ? 'nome completo' : 'CPF'} está correto e tente novamente.</p>
            <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'left' }}>
              <p><strong>Possíveis motivos:</strong></p>
              <ul style={{ marginLeft: '20px' }}>
                <li>✓ O documento não foi registrado em nosso sistema</li>
                <li>✓ O {searchType === 'name' ? 'nome' : 'CPF'} foi digitado com erro</li>
                <li>✓ O documento já foi encontrado e removido do sistema</li>
              </ul>
            </div>
          </div>
        ) : hasSearched && results.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {results.map(doc => (
              <div key={doc.id} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '20px', transition: 'all 0.3s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: doc.status === 'lost' ? '#fff3e0' : '#e8f5e9', color: doc.status === 'lost' ? '#ff9800' : '#4caf50' }}>
                    {doc.status === 'lost' ? '🟡 Perdido' : '✅ Encontrado'}
                  </span>
                  <span style={{ background: '#667eea', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                    {doc.docType}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{doc.ownerName}</h3>

                {doc.ownerCpf && (
                  <p style={{ margin: '8px 0', display: 'flex', gap: '5px' }}>
                    <span style={{ fontWeight: '600', color: '#555', minWidth: '70px' }}>📌 CPF:</span>
                    <span>{formatCpf(doc.ownerCpf)}</span>
                  </p>
                )}
                
                {doc.geolocation && (
                  <p style={{ margin: '8px 0', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', color: '#555', minWidth: '70px' }}>📍 Local:</span>
                    <a 
                      href={`https://www.google.com/maps?q=${doc.geolocation.lat},${doc.geolocation.lng}&hl=pt-BR`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2196f3', textDecoration: 'none' }}
                    >
                      {doc.geolocation.address || `${doc.geolocation.lat.toFixed(4)}, ${doc.geolocation.lng.toFixed(4)}`}
                    </a>
                  </p>
                )}
                
                {doc.lostDate && (
                  <p style={{ margin: '8px 0', display: 'flex', gap: '5px' }}>
                    <span style={{ fontWeight: '600', color: '#555', minWidth: '70px' }}>📅 Data:</span>
                    <span>{new Date(doc.lostDate).toLocaleDateString('pt-BR')}</span>
                  </p>
                )}
                
                {doc.description && (
                  <p style={{ margin: '10px 0', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>📝 Descrição:</span>
                    <span>{doc.description}</span>
                  </p>
                )}
                
                {(doc.contactEmail || doc.contactPhone) && doc.status === 'lost' && (
                  <div style={{ margin: '10px 0', padding: '10px', background: '#e3f2fd', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1565c0' }}>📞 Este documento foi perdido. Caso tenha informações, entre em contato:</p>
                    {doc.contactEmail && <p>✉️ {doc.contactEmail}</p>}
                    {doc.contactPhone && <p>📱 {doc.contactPhone}</p>}
                  </div>
                )}
                
                <p style={{ fontSize: '11px', color: '#999', marginTop: '10px', textAlign: 'right' }}>
                  Registrado em: {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                </p>
                
                {doc.foundAt && (
                  <p style={{ fontSize: '12px', color: '#4caf50', marginTop: '5px', textAlign: 'right', fontWeight: '500' }}>
                    ✅ Documento encontrado em: {new Date(doc.foundAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : !hasSearched && (
          <div style={{ textAlign: 'center', padding: '60px 40px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#555', marginBottom: '15px', fontSize: '1.4rem' }}>Sistema de Busca de Documentos</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Digite o <strong>nome completo</strong> ou o <strong>CPF</strong> do proprietário para consultar.</p>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <p style={{ marginBottom: '10px', color: '#333' }}><strong>📝 Exemplos de busca:</strong></p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                <span style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', color: '#667eea' }}>👤 Nome: "Ana Carolina Ferreira"</span>
                <span style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', color: '#667eea' }}>📌 CPF: "12345678900"</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#ff9800', marginTop: '20px', background: '#fff3e0', padding: '10px', borderRadius: '5px' }}>
              ⚠️ <strong>Atenção:</strong> A busca só retorna resultados se o nome completo ou CPF corresponderem exatamente aos registros do sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicSearch