import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query
} from 'firebase/firestore'

const COLLECTION_NAME = 'lostDocuments'

export async function addLostDocument(document, location = null) {
  try {
    const docData = {
      docType: document.docType,
      ownerName: document.ownerName,
      ownerCpf: document.ownerCpf || '',
      description: document.description || '',
      lostDate: document.lostDate || '',
      contactEmail: document.contactEmail || '',
      contactPhone: document.contactPhone || '',
      status: 'lost',
      createdAt: new Date().toISOString()
    }
    
    if (location) {
      docData.geolocation = {
        lat: location.lat,
        lng: location.lng,
        address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      }
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData)
    return { id: docRef.id, ...docData }
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}

export async function getLostDocuments() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    return documents
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}

export async function updateLostDocument(id, updatedData) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, { ...updatedData, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}

export async function updateDocumentLocation(id, location) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      geolocation: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}

export async function markAsFound(id, foundInfo = '') {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      status: 'found',
      foundAt: new Date().toISOString(),
      foundInfo: foundInfo
    })
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}

export async function deleteLostDocument(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}