import type { LojistaDto } from '@/services/lojistaService/LojistaDto'

export const LOJISTA_ID = 'TESTE_DEV_LOJA'


export const INITIAL_LOJISTA_DATA:LojistaDto = {
    id: LOJISTA_ID,
  nome: 'Lanchonete Dev - Cardápio Local',
  categoria: 'lanchonete', 
  whatsapp: '5511999999999',
  fotoUrl:
    'https://imgs.search.brave.com/59qJuS6Ffw4EG9pCztXXKDUcEK8o17HGVgP9ZtYNWks/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNTM1/MzUyNTgxL3B0L3Zl/dG9yaWFsL25vaXRl/LXJldHJvLTUwcy1s/YW5jaG9uZXRlLW1l/bnUtcHJldG8tZS1i/cmFuY28tdmVyaWZp/Y2FyLmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1yUzhfRVI1/LUpBSVY1em15Y1lB/Z1B6Y1JJQ29YeTRB/WEZvOGxyM1I2TVN3/PQ',
  endereco: {
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'Brás Pires',
    estado: 'MG',
    cep: '36542000',
    complemento: ''
  },
  //mantendo os dois horarioFuncionamento por enquanto
  //só pra não dar erro
  //mas vamo ter que ver qual deles usar
  //pois lá no lojista eu uso esse primeiro
    horariosFuncionamento: [
    { de: '07:00', ate: '11:00' },
    { de: '14:00', ate: '23:00' },
  ],
  horarioFuncionamento: {
    segunda:  { abertura: '08:00', fechamento: '21:00' },
    terca:    { abertura: '08:00', fechamento: '21:00' },
    quarta:   { abertura: '08:00', fechamento: '21:00' },
    quinta:   { abertura: '08:00', fechamento: '21:00' },
    sexta:    { abertura: '08:00', fechamento: '22:00' },
    sabado:   { abertura: '09:00', fechamento: '22:00' },
    domingo:  null // fechado
  },
  formasPagamento: {
    dinheiro: true,
    pix: true,
    cartaoCredito: true,
    cartaoDebito: true,
    valeRefeicao: false
  },
  aceitaDelivery: true,
  taxaEntrega: 5.0,
  pedidoMinimo: 20.0,
  slug: 'lanchonete-dev',
  cepsAtendidos: [
    '36542000', // Brás Pires - Centro
  ],
};

