// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  executeCommand: (command: any) => ipcRenderer.invoke('execute-command', command),
  dialog: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  },
  checkEntityExists: (projectPath: string, entityName: string) => ipcRenderer.invoke('check-entity-exists', projectPath, entityName),
  scanExistingEntities: (projectPath: string) => ipcRenderer.invoke('scan-existing-entities', projectPath),
  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan-directory', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath)
});

