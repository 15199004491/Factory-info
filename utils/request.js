// utils/api.js 或你现有的请求封装
const BASE_URL = 'http://localhost/public/admin.php';

function request(url, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
        const header = {}
        if (method !== 'GET') {
            const token = uni.getStorageSync('user_token')
            if (token) {
                header['Token'] = token
            }
        }
        uni.request({
            url: BASE_URL + url,
            data,
            method,
            header,
            success: (res) => {
                if (res.data.code === 200) {
                    resolve(res.data.data);
                } else {
                    uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
                    reject(res.data);
                }
            },
            fail: reject
        });
    });
}

export const secondHouseApi = {
    // 列表
    getList: (params) => request('/farm/Secondhouse/houseList', params),
    // 详情
    getDetail: (Id) => request('/farm/Secondhouse/houseDetail', { Id }),
    // 新增
    add: (data) => request('/farm/Secondhouse/addHouse', data, 'POST'),
    // 编辑
    edit: (data) => request('/farm/Secondhouse/addHouse', data, 'POST'),
};

export const factoryApi = {
    // 加工厂
    getList:    (p) => request('/farm/Factory/factoryList', p),
    getSelf:    (publisher) => request('/farm/Factory/factorySelf', { publisher }),
    getDetail:  (Id) => request('/farm/Factory/factoryDetail', { Id }),
    add:        (d) => request('/farm/Factory/addFactory', d, 'POST'),
    remove:     (Id) => request('/farm/Factory/deleteFactory', { Id }, 'POST'),
    verify:     (Id, verified, remark) => request('/farm/Factory/verifyFactory', { Id, verified, remark }, 'POST'),
	publishFactory: (Id) => request('/farm/Factory/publishFactory', { Id }, 'POST'),
};

export const userApi = {
    login:    (d) => request('/farm/Wxuser/login', d, 'POST'),
    logout:   (token) => request('/farm/Wxuser/logout', { token }, 'POST'),
    refresh:  (token) => request('/farm/Wxuser/refreshToken', { token }, 'POST'),
    getInfo:  (token) => request('/farm/Wxuser/getUserInfo', { token }),
    update:   (d) => request('/farm/Wxuser/ringUp', d, 'POST'),
    getPhone: (code) => request('/farm/Wxuser/getuserphonenumber', { code }, 'POST'),
    msgCheck: (msg) => request('/farm/Wxuser/msgSecCheck', { msg }, 'POST'),
};