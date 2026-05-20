import React, { useState, useEffect } from 'react'

function LocationPicker({ onLocationChange, onLocationReady, autoCapture = false }) {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const captureLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Seu navegador não suporta geolocalização.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        }
        setLocation(newLocation)
        if (onLocationChange) onLocationChange(newLocation)
        if (onLocationReady) onLocationReady(newLocation)
        setLoading(false)
      },
      (err) => {
        let errorMsg = 'Não foi possível obter localização.'
        if (err.code === 1) errorMsg = 'Permissão negada. Permita a localização no navegador.'
        setError(errorMsg)
        setLoading(false)
      }
    )
  }

  useEffect(() => {
    if (autoCapture && !location && !loading) {
      captureLocation()
    }
  }, [autoCapture])

  const openGoogleMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      {loading && <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>📍 Capturando localização...</div>}
      
      {error && (
        <div style={{ padding: '15px', background: '#ffebee', borderRadius: '8px' }}>
          <p>⚠️ {error}</p>
          <button onClick={captureLocation} style={{ marginTop: '10px', padding: '8px 16px' }}>Tentar novamente</button>
        </div>
      )}
      
      {location && !loading && (
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
          <p>✅ Local capturado!</p>
          <p><strong>📍 {location.address}</strong></p>
          <button onClick={openGoogleMaps} style={{ marginRight: '10px' }}>🗺️ Ver no Google Maps</button>
          <button onClick={captureLocation}>🔄 Recapturar</button>
        </div>
      )}
      
      {!location && !loading && !error && (
        <button onClick={captureLocation}>📍 Capturar localização</button>
      )}
    </div>
  )
}

export default LocationPicker