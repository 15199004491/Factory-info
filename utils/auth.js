import { userApi } from '@/utils/request.js'

export const auth = {
	async login(options = {}) {
		const { silent = false } = options
		if (!silent) uni.showLoading({ title: '登录中' })
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

			if (!silent) uni.showToast({ title: '登录成功', icon: 'success' })
			return userData
		} catch (e) {
			if (!silent) console.error(e)
			throw e
		} finally {
			if (!silent) uni.hideLoading()
		}
	},

	async logout() {
		const token = uni.getStorageSync('user_token')
		try {
			if (token) {
				await userApi.logout(token)
			}
		} catch (e) {
			// ignore network error
		}

		uni.removeStorageSync('user_info')
		uni.removeStorageSync('user_token')
		uni.showToast({ title: '已退出登录', icon: 'success' })
	},

	getUserInfo() {
		const token = uni.getStorageSync('user_token')
		if (!token) return Promise.resolve(null)
		const userData = uni.getStorageSync('user_info')
		return Promise.resolve(userData || null)
	},

	isLoggedIn() {
		const token = uni.getStorageSync('user_token')
		return !!token
	},

	getToken() {
		return uni.getStorageSync('user_token') || ''
	},

	async requireAuth(callback) {
		if (this.isLoggedIn()) {
			if (callback) callback()
			return true
		}
		uni.showModal({
			title: '提示',
			content: '请先登录',
			confirmText: '去登录',
			success: async (res) => {
				if (res.confirm) {
					try {
						await this.login()
						if (callback) callback()
					} catch (e) {
						console.error('登录失败', e)
					}
				}
			}
		})
		return false
	}
}