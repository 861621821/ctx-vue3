function notifyJira(data) {
    const newUrl = chrome.runtime.getURL('icons/new.png');
    const as = data.map((e) => `<a data-jira="true" class="jira-item" href="${e.key}" target="_blank" title="${e.value}">${e.value}</a>`);
    const inner = `
        <i class="close"></i>
        <div class="xl-msg">
          <div class="msg-title"><img src="${newUrl}">你有<span> ${data.length} </span>条新的Jira任务</div>
          <div class="msg-content">${as.join('')}</div>
        </div>
      `;
    $('body').append(div);
    $('.xl-jira').html(inner);
}

function notifyLogin() {
    const inner = `
        <i class="close"></i>
        <div class="xl-login">
          <div>Jira未登陆或登陆已过期</div>
          <div class="login-btn"><a href="https://jira.internal.pingxx.com/login.jsp" target="_blank">重新登陆</a></div>
        </div>
      `;
    $('body').append(div);
    $('.xl-jira').html(inner);
}

function clearAllCookies() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf('=');
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
}

function autoInput({ platform, account, pwd, org }) {
    if (window.location.pathname === '/login') {
        if (platform === 'lt') {
            const inputs = $('.login-item input.ant-input');
            inputs.eq(0).val(account);
            inputs.eq(1).val(pwd);
            inputs.eq(2).val('888888');
            document.querySelectorAll('.login-item input.ant-input').forEach((e) => {
                e.dispatchEvent(new Event('input'));
                e.dispatchEvent(new Event('blur'));
            });
            $('.ant-select').click();
            setTimeout(() => {
                $('.ant-select-dropdown-menu-item')
                    .eq(org - 1)
                    .click();
            });
        } else {
            const inputs = $('.login-form-item input');
            inputs.eq(0).val(account);
            inputs.eq(1).val(pwd);
            inputs.eq(2).val('888888');
            document.querySelectorAll('.login-form-item input').forEach((e) => {
                e.dispatchEvent(new Event('input'));
            });
        }
    }
}

const div = $(`<div class="xl-model"><div class="xl-jira"></div></div>`);
chrome.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 3 && data.length) {
        notifyJira(data);
    } else if (type === 6) {
        notifyLogin();
    } else if (type === 20) {
        autoInput(data);
    }
});

// 监听点击后反馈给background
$('body').on('click', '.xl-model .jira-item', () => {
    $('.xl-model').remove();
    chrome.runtime.sendMessage({ type: 4 });
});

$('body').on('click', '.xl-model .close', (e) => {
    $('.xl-model').remove();
    if (e.target.nextElementSibling.className == 'xl-msg') {
        chrome.runtime.sendMessage({ type: 4 });
    } else if (e.target.nextElementSibling.className == 'xl-login') {
        chrome.runtime.sendMessage({ type: 5 });
    }
});

$('body').on('click', '.login-btn', () => {
    $('.xl-model').remove();
});
