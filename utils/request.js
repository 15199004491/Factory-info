import { BASE_URL } from './config.js'



export function getOpenid() {
	const info = uni.getStorageSync('user_info') || {}
	return info.open_id || ''
}

export function request(url, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
        const header = {}
        if (method !== 'GET') {
            const token = uni.getStorageSync('user_token')
            if (token) {
                header['Token'] = token
            }
        }
        try {
            uni.request({
                url: BASE_URL + url,
                data,
                method,
                header,
                timeout: 10000,
                success: (res) => {
                    try {
                        if (res && res.data && res.data.code === 200) {
                            resolve(res.data.data);
                        } else {
                            const msg = (res && res.data && res.data.msg) || '请求失败'
                            uni.showToast({ title: msg, icon: 'none' });
                            reject((res && res.data) || {});
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                fail: (err) => {
                    reject(err || {});
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

export const secondHouseApi = {
    getList: (params) => request('/farm/Secondhouse/houseList', params),
    getDetail: (Id) => request('/farm/Secondhouse/houseDetail', { Id }),
    addHouse: (data) => request('/farm/Secondhouse/addHouse', { ...data, open_id: getOpenid() }, 'POST'),
    houseSelf: () => request('/farm/Secondhouse/houseSelf', { open_id: getOpenid() }),
    deleteHouse: (params) => request('/farm/Secondhouse/deleteHouse', params, 'POST'),
};

export const factoryApi = {
    getList: (p) => request('/farm/Factory/factoryList', p),
    getSelf: () => request('/farm/Factory/factorySelf', { open_id: getOpenid() }),
    getDetail: (Id) => request('/farm/Factory/factoryDetail', { Id }),
    addFactory: (d) => request('/farm/Factory/addFactory', { ...d, open_id: getOpenid() }, 'POST'),
    deleteFactory: (Id) => request('/farm/Factory/deleteFactory', { Id, open_id: getOpenid() }, 'POST'),
    verifyFactory: (Id, license, id_card) => request('/farm/Factory/verifyFactory', { Id, license, id_card,open_id: getOpenid() }, 'POST'),
    publishFactory: (d) => request('/farm/Factory/publishFactoryInfo', { ...d, open_id: getOpenid() }, 'POST'),
};

export const rentApi = {
    addRent: (params) => request('/farm/Rent/addRent', { ...params, open_id: getOpenid() }, 'POST'),
    rentDetail: (params) => request('/farm/Rent/rentDetail', params),
    topRent: (params) => request('/farm/Rent/topRent', params, 'POST'),
    rentList: (params) => request('/farm/Rent/rentList', params),
    rentSelf: () => request('/farm/Rent/rentSelf', { open_id: getOpenid() }),
    deleteRent: (params) => request('/farm/Rent/deleteRent', params, 'POST'),
};

export const purchaseApi = {
    addPurchase: (params) => request('/farm/Purchase/addPurchase', { ...params, open_id: getOpenid() }, 'POST'),
    purchaseDetail: (params) => request('/farm/Purchase/purchaseDetail', params),
    purchaseList: (params) => request('/farm/Purchase/purchaseList', params),
    purchaseSelf: () => request('/farm/Purchase/purchaseSelf', { open_id: getOpenid() }),
    deletePurchase: (params) => request('/farm/Purchase/deletePurchase', params, 'POST'),
};

export const userApi = {
    login: (d) => request('/farm/Wxuser/login', d, 'POST'),
    logout: (token) => request('/farm/Wxuser/logout', { token }, 'POST'),
    refresh: (token) => request('/farm/Wxuser/refreshToken', { token }, 'POST'),
    getInfo: (token) => request('/farm/Wxuser/getUserInfo', { token }),
    update: (d) => request('/farm/Wxuser/ringUp', d, 'POST'),
    getPhone: (code) => request('/farm/Wxuser/getuserphonenumber', { code }, 'POST'),
    msgCheck: (msg) => request('/farm/Wxuser/msgSecCheck', { msg }, 'POST'),
    imgSecCheck: (media) => request('/farm/Wxuser/imgSecCheck', media, 'POST'),
};