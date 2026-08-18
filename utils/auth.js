import { userApi } from '@/utils/request.js'

export const auth = {
	async login() {
		uni.showLoading({ title: '登录中' })
		try {
			const loginRes = await new Promise((resolve, reject) => {
				uni.login({
					success: resolve,
					fail: reject
				})
			})

			if (!loginRes.code) {
				throw new Error('获取微信登录凭证失败')
			}

			let mobile = ''
			try {
				const phoneRes = await new Promise((resolve, reject) => {
					uni.getPhoneNumber({
						success: resolve,
						fail: reject
					})
				})
				const phoneData = await userApi.getPhone(phoneRes.code)
				mobile = phoneData.phoneNumber
			} catch (e) {
				console.warn('未授权获取手机号', e)
			}

			const userData = await userApi.login({
				code: loginRes.code,
				login_mobile: mobile
			})

			uni.setStorageSync('user_info', userData)
			uni.setStorageSync('user_token', userData.session_token)

			console.log('登录成功，用户信息：', userData)

			uni.showToast({ title: '登录成功', icon: 'success' })
			return userData
		} catch (e) {
			console.error(e)
			throw e
		} finally {
			uni.hideLoading()
		}
	},

	async logout() {
		const token = uni.getStorageSync('user_token')
		try {
			if (token) {
				await userApi.logout(token)
			}
		} catch (e) {
			// 忽略网络错误
		}

		uni.removeStorageSync('user_info')
		uni.removeStorageSync('user_token')
		uni.showToast({ title: '已退出登录', icon: 'success' })
	},

	async getUserInfo() {
		const token = uni.getStorageSync('user_token')
		if (!token) return null
		try {
			const userData = await userApi.getInfo(token)
			uni.setStorageSync('user_info', userData)
			console.log('获取用户信息：', userData)
			return userData
		} catch (e) {
			uni.removeStorageSync('user_info')
			uni.removeStorageSync('user_token')
			return null
		}
	},

	isLoggedIn() {
		const token = uni.getStorageSync('user_token')
		return !!token
	},

	getToken() {
		return uni.getStorageSync('user_token') || ''
	},

	requireAuth() {
		if (!this.isLoggedIn()) {
			uni.showModal({
				title: '提示',
				content: '请先登录',
				confirmText: '去登录',
				success: async (res) => {
					if (res.confirm) {
						await this.login()
					}
				}
			})
			return false
		}
		return true
	}
}