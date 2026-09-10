import { houseLimitApi } from './request.js'
import { auth } from './auth.js'

function isAllowed(data) {
	if (data === true || data === 'true' || data === 1 || data === '1') return true
	if (data === false || data === 'false' || data === 0 || data === '0' || data === null || data === undefined) return false
	if (typeof data === 'object') {
		if (data.allowed === false) return false
		if (data.allowed === true) return true
		if (data.status === 0) return false
		if (data.status === 1) return true
		if (data.pass === false) return false
		if (data.pass === true) return true
	}
	return false
}

function formatDate(d) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}/${m}/${day}`
}

export function checkHouseLimit() {
	return new Promise((resolve) => {
		houseLimitApi.check().then((data) => {
			console.log('[houseLimit] check response:', JSON.stringify(data))
			if (isAllowed(data)) {
				resolve(true)
			} else {
				resolve(showPayModal())
			}
		}).catch((e) => {
			console.log('[houseLimit] check failed:', JSON.stringify(e))
			resolve(showPayModal())
		})
	})
}

function requestWxPay(payParams) {
	return new Promise((resolve, reject) => {
		uni.requestPayment({
			provider: 'wxpay',
			timeStamp: payParams.timeStamp || payParams.timestamp,
			nonceStr: payParams.nonceStr,
			package: payParams.package || payParams.prepay_id,
			signType: payParams.signType || 'MD5',
			paySign: payParams.paySign,
			success: resolve,
			fail: reject
		})
	})
}

function showPayModal() {
	return new Promise((resolve) => {
		const userInfo = uni.getStorageSync('user_info') || {}
		const hasPurchased = !!userInfo.house_vip_expire_at
		const now = new Date()
		const end = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
		const startStr = formatDate(now)
		const endStr = formatDate(end)

		uni.$emit('showVipPayModal', {
			title: hasPurchased ? '会员已过期，请续费' : '已达发布上限',
			subtitle: hasPurchased ? '续费房产会员即可继续发布' : '开通房产会员即可继续发布',
			startDate: startStr,
			endDate: endStr,
			onConfirm: async () => {
				try {
					const payParams = await houseLimitApi.pay({
						product_name: '房产会员（季度）',
						money: 100000
					})
					await requestWxPay(payParams)
					await houseLimitApi.confirmVip(payParams.out_trade_no || payParams.outTradeNo)
					await auth.login({ silent: true })
					uni.$emit('hideVipPayModal')
					uni.showToast({ title: '会员开通成功', icon: 'success' })
					resolve(true)
				} catch (e) {
					if (e && e.errMsg && e.errMsg.indexOf('cancel') !== -1) {
						resolve(false)
						return
					}
					uni.showModal({
						title: '支付失败',
						content: (e && e.msg) || '请稍后重试',
						showCancel: false
					})
					resolve(false)
				}
			},
			onCancel: () => {
				resolve(false)
			}
		})
	})
}