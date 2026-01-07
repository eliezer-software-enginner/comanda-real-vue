/**
 * Tipos para gestão de horários de funcionamento
 */

export type HorarioDiario = {
  abertura: string // Formato "HH:MM"
  fechamento: string // Formato "HH:MM"
}

export type HorarioSemanal = {
  segunda?: HorarioDiario | null
  terca?: HorarioDiario | null
  quarta?: HorarioDiario | null
  quinta?: HorarioDiario | null
  sexta?: HorarioDiario | null
  sabado?: HorarioDiario | null
  domingo?: HorarioDiario | null
}

export enum DiaSemana {
  DOMINGO = 'domingo',
  SEGUNDA = 'segunda',
  TERCA = 'terca',
  QUARTA = 'quarta',
  QUINTA = 'quinta',
  SEXTA = 'sexta',
  SABADO = 'sabado',
}

export type DiaSemanaLabel = {
  key: DiaSemana
  label: string
  aberto: boolean
  horario?: HorarioDiario
}

export const DIAS_SEMANA: DiaSemanaLabel[] = [
  { key: DiaSemana.DOMINGO, label: 'Domingo', aberto: false },
  { key: DiaSemana.SEGUNDA, label: 'Segunda-feira', aberto: false },
  { key: DiaSemana.TERCA, label: 'Terça-feira', aberto: false },
  { key: DiaSemana.QUARTA, label: 'Quarta-feira', aberto: false },
  { key: DiaSemana.QUINTA, label: 'Quinta-feira', aberto: false },
  { key: DiaSemana.SEXTA, label: 'Sexta-feira', aberto: false },
  { key: DiaSemana.SABADO, label: 'Sábado', aberto: false },
]
