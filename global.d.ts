interface Window {
    electron: {
      dialog: any;
      executeCommand: (command: string) => Promise<string>;
    };
  }