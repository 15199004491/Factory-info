export function setupUpdateManager() {
	// #ifdef MP-WEIXIN
	const updateManager = uni.getUpdateManager()

	updateManager.onCheckForUpdate((res) => {
		console.log('是否有新版本：', res.hasUpdate)
	})

	updateManager.onUpdateReady(() => {
		updateManager.applyUpdate()
	})

	updateManager.onUpdateFailed(() => {
		console.log('新版本下载失败，下次打开继续尝试')
	})
	// #endif
}