import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { capitalizeFirstLetter } from './utils/capitalize';
import { exec } from 'child_process';
import fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // Cria a janela do navegador
  const mainWindow = new BrowserWindow({
    width: 1200,
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
  // mainWindow.webContents.openDevTools();
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
  return new Promise((resolve) => {
    const entityFilePath = path.join(projectPath, 'Domain', 'Entities', `${capitalizeFirstLetter(entityName)}Entity.cs`);
    const exists = fs.existsSync(entityFilePath);
    resolve(exists);
  });
});

ipcMain.handle('scan-existing-entities', async (event, projectPath) => {
  return new Promise((resolve, reject) => {
    try {
      const entitiesPath = path.join(projectPath, 'Domain', 'Entities');
      
      if (!fs.existsSync(entitiesPath)) {
        resolve([]);
        return;
      }

      const files = fs.readdirSync(entitiesPath);
      // Filter to only include files ending with "Entity.cs" (not just any .cs file)
      const entityFiles = files.filter((file: string) => file.endsWith('Entity.cs'));
      
      const entities = [];
      
      for (const file of entityFiles) {
        const filePath = path.join(entitiesPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract entity name (remove 'Entity.cs')
        const entityName = file.replace('Entity.cs', '');
        
        // Parse properties from the C# file
        const properties = parseEntityProperties(content);
        
        entities.push({
          name: entityName,
          properties: properties,
          filePath: filePath,
          isExisting: true
        });
      }
      
      resolve(entities);
    } catch (error) {
      reject(error.message);
    }
  });
});

function parseEntityProperties(content: string) {
  const properties = [];
  
  // Enhanced regex to match C# properties with various patterns, including virtual
  const propertyRegex = /public\s+(?:virtual\s+)?(\w+(?:<[\w,\s]+>)?(?:\[\])?)\s+(\w+)\s*{\s*get;\s*set;\s*}(?:\s*=\s*[^;]+;)?/g;
  
  let match;
  while ((match = propertyRegex.exec(content)) !== null) {
    const [, type, name] = match;
    
    // Skip BaseEntity inherited properties
    if (name === 'Id' || name === 'CreatedAt' || name === 'UpdatedAt') {
      continue;
    }
    
    // Determine collection type and base type
    let collectionType = 'none';
    let baseType = type;
    
    if (type.includes('ICollection<')) {
      collectionType = 'ICollection';
      const collectionMatch = type.match(/ICollection<(\w+)>/);
      baseType = collectionMatch ? collectionMatch[1] : 'string';
    } else if (type.includes('List<')) {
      collectionType = 'List';
      const listMatch = type.match(/List<(\w+)>/);
      baseType = listMatch ? listMatch[1] : 'string';
    } else if (type.includes('IEnumerable<')) {
      collectionType = 'IEnumerable';
      const enumMatch = type.match(/IEnumerable<(\w+)>/);
      baseType = enumMatch ? enumMatch[1] : 'string';
    } else if (type.endsWith('[]')) {
      collectionType = 'Array';
      baseType = type.replace('[]', '');
    }
    
    // Handle navigation properties and foreign keys
    if (baseType.endsWith('Entity')) {
      if (collectionType === 'none') {
        // Check if it's a foreign key (ends with ID) or navigation property
        if (name.endsWith('ID') || name.endsWith('Id')) {
          baseType = 'Guid';
        } else {
          // Navigation property - keep the entity name but remove 'Entity' suffix
          baseType = baseType.replace('Entity', '');
        }
      } else {
        // Collection navigation property
        baseType = baseType.replace('Entity', '');
      }
    }
    
    // Map common C# types
    const typeMapping: { [key: string]: string } = {
      'string': 'string',
      'int': 'int',
      'Guid': 'Guid',
      'DateTime': 'DateTime',
      'decimal': 'decimal',
      'bool': 'bool',
      'double': 'double',
      'float': 'float',
      'long': 'long'
    };
    
    baseType = typeMapping[baseType] || baseType;
    
    properties.push({
      name: name,
      type: baseType,
      collectionType: collectionType
    });
  }
  
  return properties;
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
