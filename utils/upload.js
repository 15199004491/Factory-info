const MAX_IMAGE_SIZE = 1 * 1024 * 1024

function getImageInfo(filePath) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: filePath,
			success: resolve,
			fail: reject
		})
	})
}

function compressImage(filePath, maxSizeMB = 1) {
	const maxSizeBytes = maxSizeMB * 1024 * 1024
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.compressImage({
			src: filePath,
			quality: 80,
			success: (res) => {
				getImageInfo(res.tempFilePath).then(info => {
					if (info.size <= maxSizeBytes) {
						resolve(res.tempFilePath)
					} else {
						canvasCompress(res.tempFilePath, maxSizeBytes).then(resolve).catch(reject)
					}
				}).catch(() => {
					resolve(res.tempFilePath)
				})
			},
			fail: () => {
				canvasCompress(filePath, maxSizeBytes).then(resolve).catch(reject)
			}
		})
		// #endif
		// #ifndef MP-WEIXIN
		canvasCompress(filePath, maxSizeBytes).then(resolve).catch(reject)
		// #endif
	})
}

function canvasCompress(filePath, maxSizeBytes) {
	return new Promise((resolve, reject) => {
		getImageInfo(filePath).then(info => {
			const { width, height, path } = info
			const ratio = Math.sqrt(maxSizeBytes / (width * height * 4))
			const targetWidth = Math.floor(width * ratio)
			const targetHeight = Math.floor(height * ratio)

			const canvasId = 'compressCanvas'
			// #ifdef MP-WEIXIN
			const ctx = wx.createCanvasContext(canvasId)
			// #endif
			// #ifndef MP-WEIXIN
			const ctx = uni.createCanvasContext(canvasId)
			// #endif
			ctx.clearRect(0, 0, targetWidth, targetHeight)
			ctx.drawImage(path, 0, 0, targetWidth, targetHeight)
			ctx.draw(false, () => {
				// #ifdef MP-WEIXIN
				wx.canvasToTempFilePath({
					canvasId,
					success: (res) => {
						resolve(res.tempFilePath)
					},
					fail: reject
				})
				// #endif
				// #ifndef MP-WEIXIN
				uni.canvasToTempFilePath({
					canvasId,
					success: (res) => {
						resolve(res.tempFilePath)
					},
					fail: reject
				})
				// #endif
			})
		}).catch(reject)
	})
}

function uploadImage(filePath) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const mockUrl = `https://mock-storage.example.com/uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
			resolve({
				url: mockUrl,
				path: filePath,
				mock: true
			})
		}, 800)
	})
}

export function chooseAndUpload(maxSizeMB = 1) {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				try {
					const tempPath = res.tempFilePaths[0]
					uni.showLoading({ title: '处理中...' })
					const compressedPath = await compressImage(tempPath, maxSizeMB)
					const result = await uploadImage(compressedPath)
					uni.hideLoading()
					resolve(result)
				} catch (err) {
					uni.hideLoading()
					uni.showToast({ title: '图片处理失败', icon: 'none' })
					reject(err)
				}
			},
			fail: reject
		})
	})
}

export { compressImage, uploadImage, MAX_IMAGE_SIZE }