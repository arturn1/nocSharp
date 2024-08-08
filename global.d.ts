interface Window {
    electron: {
      executeCommand: (command: string) => Promise<string>;
    };
  }