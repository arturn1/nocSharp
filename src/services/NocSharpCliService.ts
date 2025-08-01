export interface CliCheckResult {
  isAvailable: boolean;
  version?: string;
  error?: string;
}

export class NocSharpCliService {
  private static instance: NocSharpCliService;
  private cacheResult: CliCheckResult | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 segundos

  static getInstance(): NocSharpCliService {
    if (!NocSharpCliService.instance) {
      NocSharpCliService.instance = new NocSharpCliService();
    }
    return NocSharpCliService.instance;
  }

  /**
   * Verifica se o comando nocsharp está disponível no sistema
   * @param useCache Se deve usar cache para evitar verificações frequentes
   */
  async checkCliAvailability(useCache: boolean = true): Promise<CliCheckResult> {
    // Verificar cache se solicitado
    if (useCache && this.cacheResult && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cacheResult;
    }

    try {
      // Tentar executar 'nocsharp --version' para verificar se está disponível
      const versionOutput = await this.executeCommand('nocsharp --version');
      
      const result: CliCheckResult = {
        isAvailable: true,
        version: versionOutput.trim()
      };

      // Atualizar cache
      this.cacheResult = result;
      this.cacheTimestamp = Date.now();

      return result;
    } catch (error) {
      const result: CliCheckResult = {
        isAvailable: false,
        error: this.parseError(error)
      };

      // Atualizar cache
      this.cacheResult = result;
      this.cacheTimestamp = Date.now();

      return result;
    }
  }

  /**
   * Verifica rapidamente se o CLI está disponível (sem versão)
   */
  async isCliAvailable(): Promise<boolean> {
    try {
      await this.executeCommand('nocsharp --help');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Executa um comando e retorna o resultado
   */
  private async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Command timed out: ${command}`));
      }, 5000);

      window.electron.executeCommand(command)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result || 'Command executed successfully');
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Converte erro em mensagem legível
   */
  private parseError(error: any): string {
    if (error.message) {
      if (error.message.includes('not found') || error.message.includes('not recognized')) {
        return 'nocsharp command not found. Please install nocsharp CLI.';
      }
      if (error.message.includes('timed out')) {
        return 'Command timed out. The system may be slow or nocsharp is not responding.';
      }
      if (error.message.includes('ENOENT')) {
        return 'nocsharp command not found in system PATH.';
      }
      return error.message;
    }
    return 'Unknown error occurred while checking nocsharp CLI.';
  }

  /**
   * Limpa o cache forçando uma nova verificação
   */
  clearCache(): void {
    this.cacheResult = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Obtém instruções de instalação
   */
  getInstallationInstructions(): {
    windows: string[];
    linux: string[];
    macos: string[];
    general: string[];
  } {
    return {
      windows: [
        'Download the nocsharp CLI from the official repository',
        'Extract to a folder (e.g., C:\\Tools\\nocsharp)',
        'Add the folder to your system PATH environment variable',
        'Restart command prompt and test with: nocsharp --version'
      ],
      linux: [
        'Download the nocsharp CLI binary',
        'Make it executable: chmod +x nocsharp',
        'Move to a PATH directory: sudo mv nocsharp /usr/local/bin/',
        'Test with: nocsharp --version'
      ],
      macos: [
        'Download the nocsharp CLI binary',
        'Make it executable: chmod +x nocsharp',
        'Move to a PATH directory: sudo mv nocsharp /usr/local/bin/',
        'Test with: nocsharp --version'
      ],
      general: [
        'Ensure nocsharp CLI is installed on your system',
        'Add nocsharp to your system PATH',
        'Restart your terminal/command prompt',
        'Verify installation with: nocsharp --version'
      ]
    };
  }
}

// Export singleton instance
export const nocSharpCli = NocSharpCliService.getInstance();
