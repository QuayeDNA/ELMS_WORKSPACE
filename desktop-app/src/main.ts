import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import path from 'path';
import { isDev } from './utils/environment';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Initialize secure store
const store = new Store({
  name: 'elms-config',
  encryptionKey: 'elms-secure-key',
});

class ElmsDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private isQuitting = false;

  constructor() {
    this.setupApp();
    this.setupAutoUpdater();
    this.setupIpcHandlers();
  }

  private setupApp(): void {
    // Security: Prevent new window creation
    app.on('web-contents-created', (_, webContents) => {
      webContents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });

    // App event handlers
    app.on('ready', this.createMainWindow.bind(this));
    app.on('window-all-closed', this.onWindowAllClosed.bind(this));
    app.on('activate', this.onActivate.bind(this));
    app.on('before-quit', () => { this.isQuitting = true; });

    // Security: Prevent navigation to external URLs
    app.on('web-contents-created', (_, webContents) => {
      webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
          event.preventDefault();
        }
      });
    });
  }

  private createMainWindow(): void {
    // Main window configuration
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      icon: path.join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !isDev,
      },
      titleBarStyle: 'default',
      show: false, // Don't show until ready
    });

    // Load the application
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Minimize to tray on close (if not quitting)
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    // Set up menu
    this.createMenu();
  }

  private createMenu(): void {
    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Exam Session',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'new-exam');
            },
          },
          {
            label: 'Import Data',
            accelerator: 'CmdOrCtrl+I',
            click: this.handleImportData.bind(this),
          },
          {
            label: 'Export Report',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'export-report');
            },
          },
          { type: 'separator' },
          {
            label: 'Settings',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'settings');
            },
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            },
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.mainWindow?.webContents.send('navigate', '/dashboard');
            },
          },
          {
            label: 'Exam Management',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.mainWindow?.webContents.send('navigate', '/exams');
            },
          },
          {
            label: 'Script Tracking',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.mainWindow?.webContents.send('navigate', '/scripts');
            },
          },
          {
            label: 'Incidents',
            accelerator: 'CmdOrCtrl+4',
            click: () => {
              this.mainWindow?.webContents.send('navigate', '/incidents');
            },
          },
          { type: 'separator' },
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow?.reload();
            },
          },
          {
            label: 'Force Reload',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              this.mainWindow?.webContents.reloadIgnoringCache();
            },
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: () => {
              this.mainWindow?.webContents.toggleDevTools();
            },
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://docs.elms-system.com');
            },
          },
          {
            label: 'Keyboard Shortcuts',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'shortcuts');
            },
          },
          { type: 'separator' },
          {
            label: 'About ELMS',
            click: () => {
              this.showAboutDialog();
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  }

  private setupAutoUpdater(): void {
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
    });

    autoUpdater.on('update-available', () => {
      log.info('Update available.');
      this.mainWindow?.webContents.send('update-available');
    });

    autoUpdater.on('update-not-available', () => {
      log.info('Update not available.');
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater. ' + err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.mainWindow?.webContents.send('download-progress', progressObj.percent);
    });

    autoUpdater.on('update-downloaded', () => {
      log.info('Update downloaded');
      this.mainWindow?.webContents.send('update-downloaded');
    });
  }

  private setupIpcHandlers(): void {
    // Store operations
    ipcMain.handle('store-get', (_, key: string) => {
      return store.get(key);
    });

    ipcMain.handle('store-set', (_, key: string, value: any) => {
      store.set(key, value);
    });

    ipcMain.handle('store-delete', (_, key: string) => {
      store.delete(key);
    });

    // File operations
    ipcMain.handle('show-save-dialog', async (_, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    ipcMain.handle('show-open-dialog', async (_, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options);
      return result;
    });

    // System operations
    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('quit-and-install', () => {
      autoUpdater.quitAndInstall();
    });

    // Notification operations
    ipcMain.handle('show-notification', (_, title: string, body: string) => {
      new Notification(title, { body }).show();
    });

    // Window operations
    ipcMain.handle('minimize-window', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('maximize-window', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('close-window', () => {
      this.mainWindow?.close();
    });
  }

  private async handleImportData(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.mainWindow?.webContents.send('import-file', result.filePaths[0]);
    }
  }

  private showAboutDialog(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About ELMS',
      message: 'Exams Logistics Management System',
      detail: `Version: ${app.getVersion()}\n\nA comprehensive examination management platform for educational institutions.\n\n© 2024 ELMS Team`,
      buttons: ['OK'],
    });
  }

  private onWindowAllClosed(): void {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate(): void {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow();
    }
  }
}

// Create and initialize the application
new ElmsDesktopApp();
