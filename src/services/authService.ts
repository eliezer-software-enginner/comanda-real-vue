import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth'
import { app } from '@/services/firebaseConfig'
import logger from '@/plugins/logs'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

class AuthService {
  private auth = getAuth(app)
  private currentUser: User | null = null

  constructor() {
    // Configurar provedor Google
    this.setupAuthListener()
  }

  private setupAuthListener(): void {
    onAuthStateChanged(this.auth, (user: FirebaseUser | null) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }
        logger.info('Usuário autenticado', {
          label: 'AuthService',
          method: 'setupAuthListener',
          data: { uid: user.uid, email: user.email },
        })
      } else {
        this.currentUser = null
        logger.info('Usuário desautenticado', {
          label: 'AuthService',
          method: 'setupAuthListener',
        })
      }
    })
  }

  async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider()
      // Adicionar escopos se necessário
      provider.addScope('email')
      provider.addScope('profile')

      const result = await signInWithPopup(this.auth, provider)
      const user = result.user

      if (!user) {
        throw new Error('Falha ao obter dados do usuário após login')
      }

      const userData: User = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }

      logger.info('Login com Google realizado com sucesso', {
        label: 'AuthService',
        method: 'loginWithGoogle',
        data: { uid: user.uid, email: user.email },
      })

      return userData
    } catch (error) {
      logger.error('Erro ao fazer login com Google', {
        label: 'AuthService',
        method: 'loginWithGoogle',
        data: { error: error instanceof Error ? error.message : String(error) },
      })
      throw new Error('Falha ao realizar login com Google')
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth)
      logger.info('Logout realizado com sucesso', {
        label: 'AuthService',
        method: 'logout',
      })
    } catch (error) {
      logger.error('Erro ao fazer logout', {
        label: 'AuthService',
        method: 'logout',
        data: { error: error instanceof Error ? error.message : String(error) },
      })
      throw new Error('Falha ao realizar logout')
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export default new AuthService()
