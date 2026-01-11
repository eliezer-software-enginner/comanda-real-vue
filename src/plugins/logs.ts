// plugins/logs.ts

// Cores para o console do navegador (CSS)
const colors = {
  info: 'color: #3b82f6; font-weight: bold',
  warn: 'color: #f59e0b; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  timestamp: 'color: #6b7280',
  label: 'color: #10b981; font-weight: bold',
}

class BrowserLogger {
  private formatTimestamp() {
    return new Date().toLocaleString('pt-BR')
  }

  info(message: string, meta?: any) {
    this.print('info', message, meta)
  }

  warn(message: string, meta?: any) {
    this.print('warn', message, meta)
  }

  error(message: string, meta?: any) {
    this.print('error', message, meta)
  }

  private print(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
    const { label, method, ...rest } = meta || {}
    const timestamp = this.formatTimestamp()

    // Monta a string formatada para o console
    const labelPart = label ? `[${label}${method ? '.' + method : ''}]` : '[Sistema]'

    console.log(
      `%c${timestamp} %c${level.toUpperCase()} %c${labelPart}: %c${message}`,
      colors.timestamp,
      colors[level],
      colors.label,
      'color: inherit', // Mensagem volta ao normal
      Object.keys(rest).length > 0 ? rest : '', // Metadata se existir
    )

    // Se for erro, dispara o console.error para aparecer o stack trace no navegador
    if (level === 'error' && rest.error) {
      console.error(rest.error)
    }
  }
}

const logger = new BrowserLogger()

export default logger

// Mantemos o utilitário idêntico para não quebrar seus Services
export const createScopedLogger = (scope: string) => {
  return {
    info: (msg: string, meta?: any) => logger.info(msg, { label: scope, ...meta }),
    error: (msg: string, meta?: any) => logger.error(msg, { label: scope, ...meta }),
    warn: (msg: string, meta?: any) => logger.warn(msg, { label: scope, ...meta }),
  }
}
