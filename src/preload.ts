// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  executeCommand: (command: any) => ipcRenderer.invoke('execute-command', command),
  dialog: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  },
  checkEntityExists: (options: any, projectPath: string, entityName: string) => ipcRenderer.invoke('check-entity-exists', options, projectPath, entityName)
});

