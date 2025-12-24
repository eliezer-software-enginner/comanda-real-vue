
//tudo que vc precisa de categoria está tipado aqui
export interface CategoriaModel {
  id: string
  lojistaId: string
  nome: string
  dtCriacao: Date
  status: CategoriaStatus
}

export type CategoriaStatus = 'ativo' | 'arquivado' | 'excluido' | 'suspenso'
