// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyATj6g3Pj9NbZMKB8v0cc9s6iw0zkSDV0o",
  authDomain: "lof-database.firebaseapp.com",
  databaseURL: "https://lof-database-default-rtdb.firebaseio.com",
  projectId: "lof-database",
  storageBucket: "lof-database.firebasestorage.app",
  messagingSenderId: "503553049603",
  appId: "1:503553049603:web:340ccbe1f929e7e34cfa36",
  measurementId: "G-8TPK6CNSZD"
}

// Inicializar o Firebase
const app = initializeApp(firebaseConfig)

// Inicializar o Firestore
const db = getFirestore(app)

// Exportar db corretamente
export { db }