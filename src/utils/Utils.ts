// 3. Lógica para usar o Emulador (Ambiente de Desenvolvimento)
// O Vite expõe o modo de ambiente em import.meta.env.MODE.
// No desenvolvimento local (ex: 'npm run dev'), o MODE geralmente é 'development'.

const isDevelopment = import.meta.env.MODE === 'development'

export { isDevelopment }

export const getMoedaFormatada = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
