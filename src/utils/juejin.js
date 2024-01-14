$(document).ready(() => {
    $('button.signin').click();
    setTimeout(() => {
        chrome.runtime.sendMessage({ type: 8 });
    }, 2000);
});
