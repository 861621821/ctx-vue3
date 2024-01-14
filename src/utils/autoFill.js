function autoInput({ platform, account, pwd, org }) {
    if (window.location.pathname === '/login') {
        if (platform === 'lt') {
            const inputs = $('.login-item input.ant-input');
            inputs.eq(0).val(account);
            inputs.eq(1).val(pwd);
            inputs.eq(2).val('888888');
            document.querySelectorAll('.login-item input.ant-input').forEach(e => {
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
            document.querySelectorAll('.login-form-item input').forEach(e => {
                e.dispatchEvent(new Event('input'));
            });
        }
    }
}

chrome.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 20) {
        autoInput(data);
    }
});
