const path = require('path');
const { app, BrowserWindow, Tray, Menu, clipboard, ipcMain } = require('electron');
const Config = require('electron-config');

const { ClipboardWatcher } = require('./common/clipboard-watcher');
const { ClipboardQueue } = require('./common/clipboard-queue');
const { EventSwarm } = require('event-swarm');

const CLIPBOARD_STORE_KEY = 'queue';

const store = new Config();
const iconPath = path.join('img', 'tray.png');
let mainWindow;
let tray;

let swarmMgr;
let cbQueue;
let cbWatcher;


app.on('ready', e => {   
    configureApp();
    setupTray();
    setupEvents();
    openWindow();
});

function configureApp() {
    // Keep the app running after the windows are closed...
    app.on('window-all-closed', () => { });

    let queue = store.get(CLIPBOARD_STORE_KEY);
    cbQueue = new ClipboardQueue(queue);
    cbWatcher = new ClipboardWatcher();
}

function setupTray() {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open',
            click: () => openWindow()
        },
        {
            type: 'separator'
        },
        {
            label: 'Exit',
            click: () => quit()
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip(`Copy Pasta`);
    tray.on('click', () => openWindow());
}

function setupEvents() {
    
    swarmMgr = new EventSwarm({ channel: 'copy-pasta' });

    cbWatcher.bind(text => {
        console.log(`[WATCHER]: changed (${text})`)
        cbQueue.push(text);
        store.set(CLIPBOARD_STORE_KEY, cbQueue);
        mainWindow.webContents.send('clipboard.update', cbQueue);
        swarmMgr.emit('update', cbQueue);
    });

    ipcMain.on('clipboard.select', (e, text) => {
        console.log(`[WINDOW]: changed (${text})`)
        clipboard.writeText(text);
    });

    swarmMgr.on('update', (text) => {
        console.log(`[SWARM]: changed (${text})`)
        clipboard.writeText(text);
    });

    cbWatcher.start();
}

function openWindow() {
    if (mainWindow) {
        return;
    }

    mainWindow = new BrowserWindow({
        height: 400,
        width: 400,
        maximizable: false,
        show: false,
        icon: iconPath,
        alwaysOnTop: true
    });

    mainWindow.webContents.openDevTools("undocked");

    mainWindow.setMenu(null);

    mainWindow.loadURL(`file://${__dirname}/window/index.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.webContents.send('clipboard.update', cbQueue);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function quit() {
    cbWatcher.stop();
    app.quit();
}