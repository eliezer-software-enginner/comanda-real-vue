import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/services/authService'
import authService from '@/services/authService'
import { useLojistaStore } from './lojista'
import logger from '@/plugins/logs'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)
  const userDisplayName = computed(() => user.value?.displayName || 'Usuário')
  const userEmail = computed(() => user.value?.email || '')
  const userPhoto = computed(() => user.value?.photoURL || '')

  // Ações
  async function loginAsTestador(): Promise<User> {
    try {
      loading.value = true
      error.value = null

      logger.info('Iniciando login como testador', {
        label: 'AuthStore',
        method: 'loginAsTestador',
      })

      // Criar usuário de teste mock
      const testUser: User = {
        uid: 'TESTE_DEV_LOJA',
        email: 'testador@comandareal.dev',
        displayName: 'Testador Dev',
        photoURL: '',
      }

      user.value = testUser

      // Carregar dados do lojista de teste
      const lojistaStore = useLojistaStore()
      try {
        await lojistaStore.fetchLojista('TESTE_DEV_LOJA')

        logger.info('Lojista de teste carregado com sucesso', {
          label: 'AuthStore',
          method: 'loginAsTestador',
          data: { userId: testUser.uid },
        })
      } catch (err) {
        logger.warn('Lojista de teste não encontrado, criando...', {
          label: 'AuthStore',
          method: 'loginAsTestador',
          data: { userId: testUser.uid },
        })

        // Se não existir, criar com dados mock
        try {
          await lojistaStore.criarLojistaBasico({
            id: testUser.uid,
            nome: testUser.displayName || 'Testador Dev',
            email: testUser.email,
          })

          logger.info('Lojista de teste criado com sucesso', {
            label: 'AuthStore',
            method: 'loginAsTestador',
            data: { userId: testUser.uid },
          })
        } catch (createErr) {
          logger.error('Erro ao criar lojista de teste', {
            label: 'AuthStore',
            method: 'loginAsTestador',
            data: { userId: testUser.uid, erro: createErr },
          })
        }
      }

      logger.info('Login como testador realizado com sucesso', {
        label: 'AuthStore',
        method: 'loginAsTestador',
        data: { userId: testUser.uid },
      })

      return testUser
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login como testador'
      error.value = errorMessage

      logger.error('Erro ao fazer login como testador', {
        label: 'AuthStore',
        method: 'loginAsTestador',
        data: { erro: err },
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle(): Promise<User> {
    try {
      loading.value = true
      error.value = null

      logger.info('Iniciando login com Google', {
        label: 'AuthStore',
        method: 'loginWithGoogle',
      })

      const userData = await authService.loginWithGoogle()
      user.value = userData

      // Após login, tentar buscar dados do lojista
      const lojistaStore = useLojistaStore()
      try {
        // Buscar lojista pelo UID do usuário autenticado
        await lojistaStore.fetchLojista(userData.uid)

        logger.info('Lojista encontrado e carregado após login', {
          label: 'AuthStore',
          method: 'loginWithGoogle',
          data: { userId: userData.uid, email: userData.email },
        })
      } catch (err) {
        logger.warn('Lojista não encontrado para o usuário autenticado, criando novo lojista', {
          label: 'AuthStore',
          method: 'loginWithGoogle',
          data: { userId: userData.uid, email: userData.email },
        })

        // Criar lojista básico automaticamente
        try {
          await lojistaStore.criarLojistaBasico({
            id: userData.uid,
            nome: userData.displayName || 'Nova Loja',
            email: userData.email,
          })

          logger.info('Lojista básico criado com sucesso', {
            label: 'AuthStore',
            method: 'loginWithGoogle',
            data: { userId: userData.uid, nome: userData.displayName },
          })
        } catch (createErr) {
          logger.error('Erro ao criar lojista básico', {
            label: 'AuthStore',
            method: 'loginWithGoogle',
            data: { userId: userData.uid, erro: createErr },
          })
        }
      }

      logger.info('Login com Google realizado com sucesso', {
        label: 'AuthStore',
        method: 'loginWithGoogle',
        data: { userId: userData.uid, email: userData.email },
      })

      return userData
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      error.value = errorMessage

      logger.error('Erro ao fazer login com Google', {
        label: 'AuthStore',
        method: 'loginWithGoogle',
        data: { erro: err },
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      logger.info('Iniciando logout', {
        label: 'AuthStore',
        method: 'logout',
      })

      await authService.logout()

      // Limpar dados do usuário e lojista
      user.value = null

      const lojistaStore = useLojistaStore()
      lojistaStore.clearLojista()

      logger.info('Logout realizado com sucesso', {
        label: 'AuthStore',
        method: 'logout',
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer logout'
      error.value = errorMessage

      logger.error('Erro ao fazer logout', {
        label: 'AuthStore',
        method: 'logout',
        data: { erro: err },
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  function initializeAuth(): void {
    try {
      loading.value = true
      error.value = null

      const currentUser = authService.getCurrentUser()
      user.value = currentUser

      if (currentUser) {
        // Se já há um usuário autenticado, carregar dados do lojista
        const lojistaStore = useLojistaStore()
        lojistaStore.fetchLojista(currentUser.uid).catch((err) => {
          logger.warn('Não foi possível carregar dados do lojista ao inicializar auth', {
            label: 'AuthStore',
            method: 'initializeAuth',
            data: { userId: currentUser.uid, erro: err },
          })
        })
      }

      logger.info('Estado de autenticação inicializado', {
        label: 'AuthStore',
        method: 'initializeAuth',
        data: { userId: currentUser?.uid || null },
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar autenticação'
      error.value = errorMessage

      logger.error('Erro ao inicializar estado de autenticação', {
        label: 'AuthStore',
        method: 'initializeAuth',
        data: { erro: err },
      })
    } finally {
      loading.value = false
    }
  }

  function setUser(userData: User | null): void {
    user.value = userData
  }

  function clearAuth(): void {
    user.value = null
    error.value = null
    loading.value = false

    const lojistaStore = useLojistaStore()
    lojistaStore.clearLojista()

    logger.info('Store de autenticação limpo', {
      label: 'AuthStore',
      method: 'clearAuth',
    })
  }

  return {
    // Estado
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhoto,

    // Ações
    loginWithGoogle,
    loginAsTestador,
    logout,
    initializeAuth,
    setUser,
    clearAuth,
  }
})
