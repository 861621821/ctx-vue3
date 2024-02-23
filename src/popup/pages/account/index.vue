<template>
    <div class="account-container" v-loading="loading">
        <el-scrollbar>
            <div class="platform" v-for="(envs, platform) in data" :key="platform">
                <div class="platform-title">{{ platform }}</div>
                <div v-for="(list, env) in envs" :key="env">
                    <div class="vibe-title">{{ env }}<i @click.stop="handleAdd(list, platform, env)" class="iconfont icon-tianjiachengyuan"></i></div>
                    <div class="vibe-data">
                        <el-table stripe :data="list" @row-dblclick="handleLogin">
                            <el-table-column>
                                <template #default="{ row }">
                                    <el-input size="small" :class="{ readonly: !row.isEdit }" :readonly="!row.isEdit" v-model="row.account"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column>
                                <template #default="{ row }">
                                    <el-input size="small" :class="{ readonly: !row.isEdit }" :readonly="!row.isEdit" v-model="row.pwd"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column show-overflow-tooltip>
                                <template #default="{ row }">
                                    <el-input size="small" :class="{ readonly: !row.isEdit }" :readonly="!row.isEdit" v-model="row.desc"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column width="80">
                                <template #default="{ row }">
                                    <div class="action">
                                        <i v-if="row.isEdit" class="iconfont icon-baocun" @click.stop="handleSubmit(row)"></i>
                                        <i v-else class="iconfont icon-bianji" @click.stop="handleEdit(row)"></i>
                                        <el-popconfirm width="180" title="确认删除该账号吗?" @confirm="handleRemove(row, list)" confirm-button-text="确认" cancel-button-text="取消">
                                            <template #reference>
                                                <i class="iconfont icon-shanchu" @click.stop></i>
                                            </template>
                                        </el-popconfirm>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllAccounts, updateAccount, insertAccount, deleteAccount } from '@/utils/supabase.js';

const data = ref({});
const loading = ref(false);
const queryAccounts = async () => {
    loading.value = true;
    const res = await getAllAccounts();
    loading.value = false;
    data.value = {};
    res.forEach(item => {
        if (data.value[item.platform]) {
            if (data.value[item.platform][item.env]) {
                data.value[item.platform][item.env].push(item);
            } else {
                data.value[item.platform][item.env] = [item];
            }
        } else {
            data.value[item.platform] = {
                [item.env]: [item],
            };
        }
    });
    chrome.storage.local.set({ account: data.value }); // 更新、缓存账号数据
};

const handleAdd = (list, platform, env) => {
    list.push({ platform, env, account: '', pwd: '', desc: '', isEdit: true });
};

const handleEdit = row => {
    row.isEdit = true;
};

const handleRemove = async ({ id }, list) => {
    if (id) {
        await deleteAccount(id);
        await queryAccounts();
    } else {
        list.splice(list.length - 1, 1);
    }
};

const handleSubmit = async row => {
    row.isEdit = false;
    if (row.id) {
        await updateAccount(row);
        await queryAccounts();
    } else {
        if (row.account && row.pwd) {
            await insertAccount(row);
            await queryAccounts();
        }
    }
};

const handleLogin = data => {
    // 获取当前激活的标签页ID
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        // 发送消息到当前标签页的content.js
        chrome.tabs.sendMessage(tabs[0].id, { type: 'autoLogin', data });
    });
    window.close();
};

onMounted(async () => {
    chrome.storage.local.get('account', res => {
        const account = res.account ? JSON.parse(JSON.stringify(res.account)) : undefined;
        if (account) {
            for (const platform in account) {
                for (const env in account[platform]) {
                    account[platform][env] = Object.values(account[platform][env]);
                }
            }
            data.value = account;
        } else {
            queryAccounts();
        }
    });
    setTimeout(() => {
        queryAccounts();
    }, 500);
});
</script>

<style lang="scss" scoped>
.account-container {
    position: relative;
    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99;
        i {
            display: inline-block;
            font-size: 28px;
            animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    }
    .platform-title {
        margin-bottom: 10px;
        padding: 10px;
        background: #e4e7ed;
        border-radius: 4px;
        font-weight: 600;
        font-size: 14px;
        position: sticky;
        top: 0;
        z-index: 99;
    }
    .platform:not(:first-of-type) {
        .platform-title {
            margin-top: 10px;
        }
    }
    .vibe-title {
        padding: 10px 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        i {
            cursor: pointer;
            font-size: 20px;
            margin-left: auto;
        }
    }
    :deep(.el-table) {
        font-size: 12px;
        .el-table__header-wrapper .el-table__cell {
            padding: 0;
        }
        .el-table__body-wrapper .el-table__cell {
            .el-input.readonly {
                --el-input-border-color: transparent;
                --el-input-border: 1px solid transparent;
                --el-input-bg-color: transparent;
                --el-input-hover-border-color: transparent;
                --el-input-focus-border-color: transparent;
            }
            .action {
                display: flex;
                justify-content: space-around;
                i {
                    cursor: pointer;
                }
                .icon-baocun,
                .icon-bianji {
                    color: var(--el-color-primary);
                }
                .icon-shanchu {
                    color: var(--el-color-danger);
                }
            }
        }
        .el-icon {
            margin: 0 5px;
            cursor: pointer;
            &:hover {
                color: var(--el-color-primary);
            }
        }
    }
    .iconfont {
        opacity: 0.8;
        &:hover {
            opacity: 1;
        }
    }
}
</style>
