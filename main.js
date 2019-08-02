 //handle setupevents as quickly as possible
 const setupEvents = require('./installers/setupEvents')
 if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
 }

const electron = require('electron');
const url = require('url');
const path = require('path');
var crypto = require('crypto');
var fs = require('fs');

const {app, BrowserWindow, Menu, protocol, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'dev';

let mainWindow;
let addWindow;




//------------------ EXPERIMENTAL
app.disableHardwareAcceleration()
/*
// change the algo to sha1, sha256 etc according to requirements
var algo = 'sha512';
var shasum = crypto.createHash(algo);

var file = './main.js';
var s = fs.ReadStream(file);
s.on('data', function(d) { shasum.update(d); });
s.on('end', function() {
  var d = shasum.digest('hex');
  console.log(d);
  log.info(d)
});
//------------------
*/



// Generate main window
function createDefaultWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        //frame: false,
        titleBarStyle: 'hiddenInset', // Hidden only top three buttons on macOS from Yosemite(10.10)
        width: 1281,
        height: 800,
        minWidth: 1281,
        minHeight: 800,
        backgroundColor: '#312450', //#36393f
        show: false,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
    });
    //mainWindow.webContents.openDevTools();
    //mainWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'), 
        protocol: 'file:',
        slashes: true
    })); // or simply `file://${__dirname}/mainwindow.html`
    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
    // Hide main window until ready to fill
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        mainWindow.setProgressBar(0) // A value above 1 sets it to intermediate mode.
    })
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    return mainWindow;
}

// [Environment]::SetEnvironmentVariable("GH_TOKEN","<YOUR_TOKEN_HERE>","User")

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = createDefaultWindow();
    mainWindow.setProgressBar(1)
    /* Renders a website
    mainWindow.loadURL('https://github.com/alexlyee/hashes')
    mainWindow.webContents.on('paint', (event, dirty, image) => {
      // updateBitmap(dirty, image.getBitmap())
    })
    mainWindow.webContents.setFrameRate(30)
    */
});

// Handle create add window
function createAddWindow(){
    // Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Hash',
        webPreferences: {
            nodeIntegration: true
        }
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addwindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear', item)
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu bar to the beginning.
if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Deal with OS X...
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// Handle drag & drop functionality
ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
        file: filePath,
        icon: '/assets/icons/png/icosigned.png'
    })
})





/*

Thank you to these people and resources for getting me started! :)

https://www.christianengvall.se/electron-packager-tutorial/
https://www.patreon.com/traversymedia/posts?tag=free%20course

https://materializecss.com/
https://github.com/crilleengvall/electron-tutorial-app/tree/6b27c85c1afbbc09df4c5060b75c0bc24e1d14e9
https://html5up.net/hyperspace



*/