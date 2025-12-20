import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore' // Importe connectFirestoreEmulator
import { connectStorageEmulator, getStorage } from 'firebase/storage'

// ... sua inicialização do app

// 1. Defina a configuração
const firebaseConfig = {
  // Use import.meta.env e o prefixo VITE_
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// 2. Inicialize o App (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

if (import.meta.env.MODE !== 'production') {
  // Verifique se o Emulador está disponível e conecte-se a ele.
  // A porta padrão para o Firestore Emulator é 8080.
  console.log(
    'Ambiente de desenvolvimento detectado. Conectando-se ao Firestore Emulator na porta 8080.',
  )
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}

export { app, db, storage } // É bom exportar 'app' também, caso precise de outros serviços.
