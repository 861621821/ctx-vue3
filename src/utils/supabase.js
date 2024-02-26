import { createClient } from '@supabase/supabase-js';
const { VITE_PROJECT_URL, VITE_PUBLIC_API_KEY } = import.meta.env;

// Create a single supabase client for interacting with your database
const supabase = createClient(VITE_PROJECT_URL, VITE_PUBLIC_API_KEY);

/**
 * @description: 查询所有账号
 * @param {void}
 * @return {Promise} 返回账号列表
 */
export const getAllAccounts = async () => {
    return new Promise(async (resolve, reject) => {
        const { data, error } = await supabase.from('ctx_account').select('*').order('id', { ascending: true });
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
};

/**
 * @description: 更新账号
 * @param {*} row
 * @return {*}
 */
export const updateAccount = async ({ id, account, pwd, desc }) => {
    return new Promise(async (resolve, reject) => {
        const row = { account, pwd, desc };
        const { data, error } = await supabase.from('ctx_account').update(row).eq('id', id);
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
};

/**
 * @description: 添加账号
 * @param {*} row
 * @return {*}
 */
export const insertAccount = async ({ account, pwd, desc, env, platform }) => {
    return new Promise(async (resolve, reject) => {
        const row = { account, pwd, desc, env, platform };
        const { data, error } = await supabase.from('ctx_account').insert(row);
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
};

/**
 * @description: 删除账号
 * @param {*} row
 * @return {*}
 */
export const deleteAccount = async id => {
    return new Promise(async (resolve, reject) => {
        const { data, error } = await supabase.from('ctx_account').delete().eq('id', id);
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
};

/**
 * @description: 添加指纹
 * @param {*} row
 * @return {*}
 */
export const insertFingerprint = async fingerprint => {
    const { data } = await supabase.from('ctx_fingerprint').select('*').eq('fingerprint', fingerprint);
    if (data.length === 0) {
        const row = { fingerprint };
        const { data, error } = await supabase.from('ctx_fingerprint').insert(row);
    }
};
