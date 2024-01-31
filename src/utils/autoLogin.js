// 定义sleep函数
const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const autoInput = async ({ platform, account, pwd, org }) => {
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
        $('.send-btn').click();
        const obs = new MutationObserver(async mutationsList => {
            if (mutationsList[0].target.style.display === 'none') {
                await sleep(300);
                $('.login-btn').click();
                obs.disconnect();
            }
        });
        obs.observe(document.querySelector('.mask'), { attributes: true });
        // await sleep(500);
        // await handleSimulateSliding();
        // await sleep(1000);
        // $('.login-btn').click();
    }
};

chrome.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 20) {
        autoInput(data);
    }
});

const mostFrequentNumber = arr => {
    let countMap = new Map();

    // 统计数字出现次数
    for (let num of arr) {
        countMap.set(num, (countMap.get(num) || 0) + 1);
    }

    let mostFrequentNum;
    let maxCount = 0;

    // 找到出现次数最多的数字
    for (let [num, count] of countMap) {
        if (count > maxCount) {
            mostFrequentNum = num;
            maxCount = count;
        }
    }

    return mostFrequentNum;
};

const getScrollX = img => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 330;
    canvas.height = 155;
    ctx.drawImage(img, 0, 0, 330, 155);
    const imageData = ctx.getImageData(0, 0, 330, 155);
    const data = imageData.data;
    let x = [];
    for (let i = 0; i < 330; i++) {
        for (let j = 0; j < 155; j++) {
            const r = data[(j * 330 + i) * 4];
            const g = data[(j * 330 + i) * 4 + 1];
            const b = data[(j * 330 + i) * 4 + 2];
            if (r > 244 && g > 244 && b > 244) {
                x.push(i);
                // 改为红色
                // data[(j * 330 + i) * 4] = 255;
                // data[(j * 330 + i) * 4 + 1] = 0;
                // data[(j * 330 + i) * 4 + 2] = 0;
            }
        }
    }
    // ctx.putImageData(imageData, 0, 0);
    // const img2 = document.createElement('img');
    // img2.src = canvas.toDataURL();
    // document.body.appendChild(img2);
    return mostFrequentNumber(x);
};

const handleSimulateSliding = () => {
    let times = 1; // 重试次数
    return new Promise(async resolve => {
        const _simulateSliding = async () => {
            if (times > 5) {
                resolve();
                return;
            }
            times++;
            const x = getScrollX($('.verify-img-panel img')[0]);
            // 模拟点击并滑动x距离
            const block = document.querySelector('.verify-move-block');
            const areaClientLeft = document.querySelector('.verify-bar-area').getBoundingClientRect().left;
            block.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: areaClientLeft }));
            block.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: areaClientLeft + x }));
            block.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: areaClientLeft + x }));
            await sleep(1500);
            if ($('.mask') && $('.mask').css('display') === 'none') {
                resolve();
            } else {
                await sleep(1100);
                _simulateSliding();
            }
        };
        _simulateSliding();
    });
};
