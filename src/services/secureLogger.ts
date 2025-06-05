
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
      // Mascarar emails
      if (data.includes('@')) {
        return '[SANITIZED_EMAIL]';
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
        const sensitiveFields = [
          'id', 'user_id', 'email', 'phone', 'password', 'token', 'key', 
          'full_name', 'fullName', 'role', 'created_at', 'updated_at',
          'createdAt', 'updatedAt', 'profile', 'user'
        ];
        
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
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
      if (data) {
        console.log(`[INFO] ${message}`, this.sanitizeData(data));
      } else {
        console.log(`[INFO] ${message}`);
      }
    }
  }
  
  static error(message: string, error?: any): void {
    if (this.isDevelopment) {
      if (error?.message) {
        console.error(`[ERROR] ${message}`, error.message);
      } else if (error) {
        console.error(`[ERROR] ${message}`, this.sanitizeData(error));
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }
  
  static warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.warn(`[WARN] ${message}`, this.sanitizeData(data));
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }
  
  static success(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.log(`[SUCCESS] ${message}`, this.sanitizeData(data));
      } else {
        console.log(`[SUCCESS] ${message}`);
      }
    }
  }
  
  static debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.debug(`[DEBUG] ${message}`, this.sanitizeData(data));
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }
}
