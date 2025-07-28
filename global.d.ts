interface Window {
  electron: {
    dialog: any;
    executeCommand: (command: string) => Promise<string>;
    checkEntityExists: (projectPath: string, entityName: string) => Promise<boolean>;
    scanExistingEntities: (projectPath: string) => Promise<any[]>;
  };
}