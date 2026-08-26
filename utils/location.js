import { reactive } from 'vue'

const SAVE_KEY = 'user_location'

export function getSavedLocation() {
	try {
		const saved = uni.getStorageSync(SAVE_KEY)
		if (saved && saved.lat && saved.lng) {
			return saved
		}
	} catch (e) {}
	return null
}

export function saveLocation(lat, lng, extra = {}) {
	const data = {
		lat,
		lng,
		time: Date.now(),
		...extra
	}
	try {
		uni.setStorageSync(SAVE_KEY, data)
		const userInfo = uni.getStorageSync('user_info') || {}
		userInfo.lat = lat
		userInfo.lng = lng
		uni.setStorageSync('user_info', userInfo)
	} catch (e) {}
	return data
}

function openEnableLocation() {
	uni.showModal({
		title: '开启位置权限',
		content: '需要获取您的位置信息，请在设置中开启位置权限',
		confirmText: '去设置',
		cancelText: '取消',
		success: (res) => {
			if (res.confirm) {
				uni.openSetting()
			}
		}
	})
}

export function ensureLocationPermission(options = {}) {
	const {
		showTipDenied = true,
		tipText = '需要位置权限才能使用该功能'
	} = options

	return new Promise((resolve, reject) => {
		uni.getSetting({
			success: (settingRes) => {
				const setting = settingRes.authSetting || {}
				const hasScope = setting['scope.userLocation']
				if (hasScope === true) {
					resolve(true)
				} else if (hasScope === false) {
					if (showTipDenied) {
						openEnableLocation()
					}
					reject(new Error('location_permission_denied'))
				} else {
					uni.authorize({
						scope: 'scope.userLocation',
						success: () => resolve(true),
						fail: () => {
							uni.showToast({ title: tipText, icon: 'none' })
							reject(new Error('location_permission_denied'))
						}
					})
				}
			},
			fail: () => {
				uni.authorize({
					scope: 'scope.userLocation',
					success: () => resolve(true),
					fail: () => {
						uni.showToast({ title: tipText, icon: 'none' })
						reject(new Error('location_permission_denied'))
					}
				})
			}
		})
	})
}

export function doGetLocation(options = {}) {
	const {
		showLoading = true,
		loadingText = '获取位置中...',
		type = 'gcj02',
		persist = true
	} = options

	return new Promise((resolve, reject) => {
		if (showLoading) {
			uni.showLoading({ title: loadingText, mask: true })
		}
		uni.getLocation({
			type,
			success: (res) => {
				const lat = res.latitude
				const lng = res.longitude
				if (persist) {
					saveLocation(lat, lng)
				}
				resolve({ lat, lng, raw: res })
			},
			fail: (err) => {
				reject(err)
			},
			complete: () => {
				if (showLoading) {
					uni.hideLoading()
				}
			}
		})
	})
}

export function ensureAndGetLocation(options = {}) {
	const {
		useCached = true,
		showTipDenied = true,
		tipText = '需要位置权限才能使用该功能',
		...getLocOpts
	} = options

	return new Promise(async (resolve, reject) => {
		if (useCached) {
			const saved = getSavedLocation()
			if (saved) {
				resolve({ lat: saved.lat, lng: saved.lng, cached: true })
				return
			}
		}
		try {
			await ensureLocationPermission({ showTipDenied, tipText })
			const result = await doGetLocation(getLocOpts)
			resolve({ ...result, cached: false })
		} catch (e) {
			reject(e)
		}
	})
}

export function chooseLocation(options = {}) {
	const {
		showTipDenied = true,
		tipText = '需要位置权限才能选择地址',
		latitude,
		longitude
	} = options

	return new Promise(async (resolve, reject) => {
		try {
			await ensureLocationPermission({ showTipDenied, tipText })
		} catch (e) {
			reject(e)
			return
		}
		const opts = {
			success: (res) => {
				resolve({
					address: res.address,
					name: res.name,
					latitude: res.latitude,
					longitude: res.longitude,
					raw: res
				})
			},
			fail: (err) => {
				uni.showToast({ title: '选择位置失败', icon: 'none' })
				reject(err)
			}
		}
		if (latitude !== undefined && longitude !== undefined) {
			opts.latitude = latitude
			opts.longitude = longitude
		}
		uni.chooseLocation(opts)
	})
}

export function openMapView(latitude, longitude, options = {}) {
	const {
		name = '位置',
		address = '',
		scale = 16
	} = options
	const lat = Number(latitude)
	const lng = Number(longitude)
	if (!lat || !lng || lat === 0 || lng === 0) {
		uni.showToast({ title: '位置信息无效', icon: 'none' })
		return false
	}
	uni.openLocation({
		latitude: lat,
		longitude: lng,
		name,
		address,
		scale
	})
	return true
}

export default {
	install(app) {
		const locGuard = reactive({ lat: 0, lng: 0, denied: false })
		const api = {
			getSaved: getSavedLocation,
			save: saveLocation,
			ensurePermission: ensureLocationPermission,
			get: doGetLocation,
			ensureAndGet: ensureAndGetLocation,
			choose: chooseLocation,
			open: openMapView
		}
		app.config.globalProperties.$location = api
		app.provide('$location', api)
		app.provide('locGuard', locGuard)
	}
}