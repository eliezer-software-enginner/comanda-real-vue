import type { LojistaDto } from '@/services/lojistaService/LojistaDto'

export const LOJISTA_ID = 'TESTE_DEV_LOJA'

export const INITIAL_LOJISTA_DATA: LojistaDto = {
  nome: 'Lanchonete Dev - Cardápio Local',
  whatsapp: '5511999999999',
  // logoUrl:
  //   'https://imgs.search.brave.com/59qJuS6Ffw4EG9pCztXXKDUcEK8o17HGVgP9ZtYNWks/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNTM1/MzUyNTgxL3B0L3Zl/dG9yaWFsL25vaXRl/LXJldHJvLTUwcy1s/YW5jaG9uZXRlLW1l/bnUtcHJldG8tZS1i/cmFuY28tdmVyaWZp/Y2FyLmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1yUzhfRVI1/LUpBSVY1em15Y1lB/Z1B6Y1JJQ29YeTRB/WEZvOGxyM1I2TVN3/PQ',
  id: LOJISTA_ID,
  horariosFuncionamento: [
    { de: '07:00', ate: '11:00' },
    { de: '14:00', ate: '23:00' },
  ],
  slug: 'lanchonete-dev',
}
