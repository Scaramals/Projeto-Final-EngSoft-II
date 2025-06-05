
/**
 * Serviço de logging seguro que não expõe dados sensíveis no console
 */
export class SecureLogger {
  private static isDevelopment = import.meta.env.DEV;
  
  /**
   * Serializa dados removendo informações sensíveis
   */
  private static sanitizeData(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // Não logar dados que parecem ser IDs ou tokens
      if (data.length > 20 && (data.includes('-') || data.match(/^[a-f0-9]+$/i))) {
        return '[SANITIZED_ID]';
      }
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Campos sensíveis que devem ser mascarados
        const sensitiveFields = ['id', 'user_id', 'email', 'phone', 'password', 'token', 'key'];
        
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '[SANITIZED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
  
  static info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data ? this.sanitizeData(data) : '');
    }
  }
  
  static error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error?.message || error);
    }
  }
  
  static warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data ? this.sanitizeData(data) : '');
    }
  }
}
