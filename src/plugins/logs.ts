import { createLogger, format, transports } from 'winston'

// Definindo o formato customizado para o console (Leitura Humana)
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, label, ...metadata }) => {
    // Aqui montamos a string: [Data] [Nível] [Classe]: Mensagem
    let msg = `${timestamp} [${level}] [${label || 'Sistema'}]: ${message}`

    // Se houver metadados extras (como erro), exibe no final
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`
    }
    return msg
  }),
)

const logger = createLogger({
  level: 'info', // Nível mínimo de log
  format: format.combine(
    format.errors({ stack: true }), // <-- ESSENCIAL para capturar o stack trace
    format.timestamp(),
    format.json(), // Por padrão, salva como JSON (bom para produção)
  ),
  transports: [
    new transports.Console({
      // Se estiver em desenvolvimento, usa o formato bonito
      format: process.env.NODE_ENV === 'development' ? consoleFormat : format.json(),
    }),
    // Exemplo: Salvar erros em um arquivo separado
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

//logger.info('Buscando dados do lojista', { label: 'LojistaService', lojistaId: id })

export default logger

// Utilitário para não repetir o nome da classe
export const createScopedLogger = (scope: string) => {
  return {
    info: (msg: string, meta?: any) => logger.info(msg, { label: scope, ...meta }),
    error: (msg: string, meta?: any) => logger.error(msg, { label: scope, ...meta }),
    warn: (msg: string, meta?: any) => logger.warn(msg, { label: scope, ...meta }),
  }
}

// Uso no Service:
//const log = createScopedLogger('PedidoService')
//log.info('Pedido criado com sucesso')
// Saída: 2023-10-27 10:00:00 [info] [PedidoService]: Pedido criado com sucesso
