import { describe, expect, it } from 'vitest'

import { Utils } from '../Utils'

describe('testes em utils', () => {
  it('deve retornar as duas iniciais do nome', () => {
    const nome = 'Teste Silva'

    const iniciais = Utils.getIniciaisDoNome(nome)
    console.log(iniciais)
    expect(iniciais).toBeDefined()
    expect(iniciais).toBe('TS')
  })
})
