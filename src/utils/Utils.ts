// 3. Lógica para usar o Emulador (Ambiente de Desenvolvimento)
// O Vite expõe o modo de ambiente em import.meta.env.MODE.
// No desenvolvimento local (ex: 'npm run dev'), o MODE geralmente é 'development'.

import logger from '@/plugins/logs'
import { v4 as uuidv4 } from 'uuid'

const isDevelopment = import.meta.env.MODE === 'development'

export { isDevelopment }

export const Utils = {
  getMoedaFormatada: (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  },

  gerarUUID: () => uuidv4(),

  getIniciaisDoNome: (nome: string | null) => {
    if (nome == null) {
      return 'LD'
    }
    const arr = nome.split(' ')
    logger.info('obtendo iniciais do nome', {
      label: 'Utils',
      method: 'getIniciaisDoNome',
      dado: { nome: nome, split: arr },
    })

    return (arr[0]?.charAt(0) ?? '') + (arr[1]?.charAt(0) ?? '')
  },

  clone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
  },
}

/**@deprecated */
export const getMoedaFormatada = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
