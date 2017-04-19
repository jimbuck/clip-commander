const $ = require('jquery');
const { ipcRenderer } = require('electron');

const { ClipboardQueue } = require('../common/clipboard-queue');

const $historyList = $('.history-list');

let clip = new ClipboardQueue();

ipcRenderer.on('clipboard.update', (e, queue) => {
    updateClipboardList(queue);
});

updateClipboardList();

function updateClipboardList(val) {
    clip = new ClipboardQueue(val || {});
    
    $historyList.empty();
    clip.forEach(x => {
        $(`<li><pre>${htmlEncode(x)}</pre></li>`)
            .click(() => {
                console.log(`Selected ${x}`);
                ipcRenderer.send('clipboard.select', x);
            })
            .appendTo($historyList);
    });
}

function htmlEncode(val) {
    return $('<div/>').text(val).html();
}