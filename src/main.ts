import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { capitalizeFirstLetter } from './utils/capitalize';
const { exec } = require('child_process');
const fs = require('fs');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // Verifica se o pacote 'nocsharp' está instalado
  const isPackageInstalled = () => {
    try {
      require.resolve('nocsharp');
      return true;
    } catch (e) {
      return false;
    }
  };

  // Instala o pacote 'nocsharp' se não estiver instalado
  if (!isPackageInstalled()) {
    exec('npm install nocsharp', (error: { message: any; }, stdout: any, stderr: any) => {
      if (error) {
        console.error(`Erro ao instalar o pacote: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Erro: ${stderr}`);
        return;
      }
      console.log(`Pacote instalado: ${stdout}`);
    });
  }

  // Cria a janela do navegador
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Carrega o index.html da aplicação
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Abre as DevTools
  mainWindow.webContents.openDevTools();
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error: { message: any; }, stdout: unknown, stderr: any) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle('check-entity-exists', async (event, projectPath, entityName) => {
  return new Promise((resolve, reject) => {
    const entityFilePath = path.join(projectPath, 'Core', 'Entities', `${capitalizeFirstLetter(entityName)}Entity.cs`);
    const exists = fs.existsSync(entityFilePath);
    resolve(exists);
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
