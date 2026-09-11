import { BASE_URL } from './config.js'



export function getOpenid() {
	const info = uni.getStorageSync('user_info') || {}
	return info.open_id || ''
}

export function request(url, data = {}, method = 'GET', options = {}) {
    const { silent = false } = options;
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
                            if (!silent) {
                                uni.showToast({ title: msg, icon: 'none' });
                            }
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
    houseListByOpenid: (open_id, params = {}) => request('/farm/Secondhouse/houseList', { ...params, open_id }),
    deleteHouse: (params) => request('/farm/Secondhouse/deleteHouse', params, 'POST'),
    contact: (Id) => request('/farm/Secondhouse/contact', { Id, open_id: getOpenid() }, 'POST', { silent: true }),
    generateHouseQrcode: (name = '房源专属小程序', page = 'pages/share/houses', width = 600) => request('/farm/Secondhouse/generateHouseQrcode', { open_id: getOpenid(), name, page, width }),
};

export const factoryApi = {
    getList: (p) => request('/farm/Factory/factoryList', p),
    getSelf: () => request('/farm/Factory/factorySelf', { open_id: getOpenid() }),
    getDetail: (Id) => request('/farm/Factory/factoryDetail', { Id }),
    addFactory: (d) => request('/farm/Factory/addFactory', { ...d, open_id: getOpenid() }, 'POST'),
    editFactory: (d) => request('/farm/Factory/editFactory', { ...d, open_id: getOpenid() }, 'POST'),
    deleteFactory: (Id) => request('/farm/Factory/deleteFactory', { Id, open_id: getOpenid() }, 'POST'),
    verifyFactory: (Id, license, id_card) => request('/farm/Factory/verifyFactory', { Id, license, id_card,open_id: getOpenid() }, 'POST'),
    publishFactory: (d) => request('/farm/Factory/publishFactoryInfo', { ...d, open_id: getOpenid() }, 'POST'),
    generateFactoryQrcode: (Id, name = '', page = 'pages/factory/detail', width = 430) => request('/farm/Factory/generateFactoryQrcode', { Id, name, page, width }),
};

export const rentApi = {
    addRent: (params) => request('/farm/Rent/addRent', { ...params, open_id: getOpenid() }, 'POST'),
    rentDetail: (params) => request('/farm/Rent/rentDetail', params),
    rentList: (params) => request('/farm/Rent/rentList', params),
    rentSelf: () => request('/farm/Rent/rentSelf', { open_id: getOpenid() }),
    rentListByOpenid: (open_id, params = {}) => request('/farm/Rent/rentList', { ...params, open_id }),
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
    update: (d) => request('/farm/Wxuser/ringUp', d, 'POST'),
    getPhone: (code) => request('/farm/Wxuser/getuserphonenumber', { code }, 'POST'),
    msgCheck: (msg) => request('/farm/Wxuser/msgSecCheck', { msg }, 'POST', { silent: true }),
    imgSecCheck: (media) => request('/farm/Wxuser/imgSecCheck', media, 'POST'),
    incCallCount: (openId) => request('/farm/Wxuser/incCallCount', { open_id: openId }, 'POST', { silent: true }),
};

export const feedbackApi = {
    submit: (params) => request('/farm/Wxuser/addSuggest', { ...params, open_id: getOpenid() }),
};

export const visitorApi = {
    getCount: (isNew = false) => request('/farm/Visitor/getCount', { is_new: isNew ? 1 : 0 }, 'POST', { silent: true }),
};

export const houseLimitApi = {
    check: () => request('/farm/Wxuser/checkPublishLimit', { open_id: getOpenid() }, 'POST'),
    pay: (params) => request('/farm/Wechatprofitsharing/createOrder', { open_id: getOpenid(), ...params }, 'POST'),
    confirmVip: (out_trade_no) => request('/farm/Wechatprofitsharing/confirmVip', { open_id: getOpenid(), out_trade_no }, 'POST'),
};