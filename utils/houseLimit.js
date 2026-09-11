import { houseLimitApi } from './request.js'
import { auth } from './auth.js'

export const VIP_CONFIG = {
	price: 600,
	priceFen: 600,
	unit: '季度',
	durationMonths: 3,
	productName: '二手房和租房会员（季度）'
}

function formatDate(d) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}/${m}/${day}`
}

const ENABLE_PAY_LIMIT = true

export function checkHouseLimit() {
	if (!ENABLE_PAY_LIMIT) return Promise.resolve(true)
	return new Promise((resolve) => {
		houseLimitApi.check().then((data) => {
			if (data && data.can_publish) {
				resolve(true)
			} else {
				resolve(showPayModal(data))
			}
		}).catch(() => {
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

function showPayModal(apiData) {
	return new Promise((resolve) => {
		const userInfo = uni.getStorageSync('user_info') || {}
		const hasPurchased = !!(apiData && apiData.has_purchased !== undefined ? apiData.has_purchased : userInfo.house_vip_expire_at)
		const now = new Date()
		const end = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
		const startStr = formatDate(now)
		const endStr = formatDate(end)

		uni.$emit('showVipPayModal', {
			title: hasPurchased ? '会员已过期，请续费' : '已达发布上限',
			subtitle: hasPurchased ? '续费二手房和租房会员即可继续发布' : '开通二手房和租房会员即可继续发布',
			startDate: startStr,
			endDate: endStr,
			onConfirm: async () => {
				try {
					const payParams = await houseLimitApi.pay({
						product_name: VIP_CONFIG.productName,
						money: VIP_CONFIG.priceFen
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