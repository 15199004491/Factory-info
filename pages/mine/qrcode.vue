<template>
	<view class="page">
		<view class="bg-decor bg-decor-1"></view>
		<view class="bg-decor bg-decor-2"></view>

		<view class="header">
			<text class="title">{{ qrName }}</text>
			<text class="subtitle">客户扫码直达你发布的房源</text>
		</view>

		<view class="qr-card">
			<view class="qr-corner qr-corner-tl"></view>
			<view class="qr-corner qr-corner-tr"></view>
			<view class="qr-corner qr-corner-bl"></view>
			<view class="qr-corner qr-corner-br"></view>

			<view class="qr-frame">
				<image v-if="qrImage" class="qr-image" :src="qrImage" mode="aspectFit" @tap="onPreview" />
				<view v-else class="loading">
					<text class="loading-text">正在加载...</text>
				</view>
			</view>

			<view class="qr-action-hint" @tap="onPreview">
				<text class="qr-action-hint-text">点击图片可放大预览</text>
			</view>
		</view>

		<view class="tips-row">
			<text class="tip-item">保存打印 ·</text>
			<text class="tip-item">线下张贴 ·</text>
			<text class="tip-item">扫码仅展示你的房源</text>
		</view>

		<view class="action-btns">
			<view class="act-btn save-btn" :class="{ disabled: !qrImage || isSaving }" @tap="onSave">
				<text class="act-btn-text">{{ isSaving ? '保存中...' : '保存到本地' }}</text>
			</view>
			<view class="act-btn share-btn" @tap="onPreviewLocal">
				<text class="act-btn-text">本地预览</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { secondHouseApi, getOpenid } from '@/utils/request.js'
	import { formatCosUrl } from '@/utils/config.js'

	export default {
		data() {
			return {
				qrImage: '',
				qrPath: 'pages/share/houses',
				qrName: '你的专属小程序码',
				isSaving: false
			}
		},
		onLoad(options) {
			if (options && options.path) {
				this.qrPath = decodeURIComponent(options.path)
			}
			if (options && options.name) {
				this.qrName = decodeURIComponent(options.name)
			}
			this.generate()
		},
		methods: {
			async generate() {
				try {
					var data = await secondHouseApi.generateHouseQrcode(this.qrName, this.qrPath, 430)
					if (data) {
						let url = ''
						if (typeof data === 'string') {
							url = data
						} else {
							url = data.qrcode || data.url || data.qrcode_url || data.qrCode || data.path || data.img || data.image || data.file || data.src || data.base64 || ''
							if (!url && data.data) {
								const inner = data.data
								if (typeof inner === 'string') {
									url = inner
								} else {
									url = inner.qrcode || inner.url || inner.path || inner.img || inner.image || inner.file || inner.src || ''
								}
							}
						}
						if (url) {
							if (/^iVBOR|^\/9j\//i.test(url)) {
								const prefix = /^iVBOR/i.test(url) ? 'data:image/png;base64,' : 'data:image/jpeg;base64,'
								url = prefix + url
							} else if (!/^(wxfile:|file:|blob:|wxLocalResource:|data:|https?:)/i.test(url)) {
								url = formatCosUrl(url)
							}
						}
						this.qrImage = url
					}
				} catch (e) {
					uni.showToast({ title: '加载失败，请重试', icon: 'none' })
				}
			},
			onPreview() {
				if (!this.qrImage) return
				uni.previewImage({
					urls: [this.qrImage],
					current: this.qrImage
				})
			},
			downloadImage(url) {
				return new Promise((resolve, reject) => {
					if (!url) {
						reject(new Error('图片地址为空'))
						return
					}
					if (/^(wxfile:|file:|blob:)/i.test(url)) {
						resolve(url)
						return
					}
					if (/^data:/i.test(url)) {
						const commaIdx = url.indexOf(',')
						if (commaIdx < 0) {
							reject(new Error('base64 格式错误'))
							return
						}
						const base64Data = url.substring(commaIdx + 1)
						const mimeMatch = url.match(/^data:(image\/\w+);base64,/)
						const ext = mimeMatch ? mimeMatch[1].split('/')[1] : 'png'
						const fs = uni.getFileSystemManager()
						const filePath = `${wx.env.USER_DATA_PATH}/qr_${Date.now()}.${ext}`
						fs.writeFile({
							filePath,
							data: base64Data,
							encoding: 'base64',
							success: () => resolve(filePath),
							fail: reject
						})
						return
					}
					let finalUrl = url
					if (!/^https?:/i.test(finalUrl)) {
						finalUrl = formatCosUrl(finalUrl)
					}
					uni.downloadFile({
						url: finalUrl,
						success: (res) => {
							if (res.statusCode === 200) {
								resolve(res.tempFilePath)
							} else {
								reject(new Error('下载图片失败, statusCode=' + res.statusCode))
							}
						},
						fail: reject
					})
				})
			},
			saveToAlbum(filePath) {
				return new Promise((resolve, reject) => {
					uni.saveImageToPhotosAlbum({
						filePath,
						success: resolve,
						fail: (err) => {
							if (err && err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
								uni.authorize({
									scope: 'scope.writePhotosAlbum',
									success: () => {
										uni.saveImageToPhotosAlbum({
											filePath,
											success: resolve,
											fail: reject
										})
									},
									fail: reject
								})
							} else {
								reject(err)
							}
						}
					})
				})
			},
			async onSave() {
				if (!this.qrImage || this.isSaving) return
				this.isSaving = true
				try {
					uni.showLoading({ title: '保存中...', mask: true })
					const localPath = await this.downloadImage(this.qrImage)
					uni.hideLoading()
					await this.saveToAlbum(localPath)
					uni.showToast({ title: '已保存到相册', icon: 'success' })
				} catch (e) {
					uni.hideLoading()
					if (e && e.errMsg && e.errMsg.indexOf('auth') > -1) {
						uni.showModal({
							title: '提示',
							content: '需要相册权限才能保存，请在设置中开启',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) uni.openSetting()
							}
						})
					} else {
						uni.showToast({ title: '保存失败', icon: 'none' })
					}
				} finally {
					this.isSaving = false
				}
			},
			onPreviewLocal() {
				var openId = getOpenid()
				var url = '/' + this.qrPath + '?open_id=' + encodeURIComponent(openId)
				uni.navigateTo({ url: url })
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background: linear-gradient(160deg, #6cb4ee 0%, #8ec5ff 25%, #c8e2ff 50%, #f4f7fb 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 72rpx 48rpx 180rpx;
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
	}

	.bg-decor {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
		z-index: 0;
	}

	.bg-decor-1 {
		width: 360rpx;
		height: 360rpx;
		top: -80rpx;
		right: -80rpx;
	}

	.bg-decor-2 {
		width: 240rpx;
		height: 240rpx;
		top: 240rpx;
		left: -60rpx;
		background: rgba(255, 255, 255, 0.12);
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 48rpx;
		position: relative;
		z-index: 1;
	}

	.title {
		font-size: 44rpx;
		font-weight: 700;
		color: #fff;
		margin-bottom: 12rpx;
		letter-spacing: 2rpx;
		text-shadow: 0 2rpx 12rpx rgba(60, 156, 255, 0.3);
	}

	.subtitle {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.92);
	}

	.qr-card {
		width: 540rpx;
		background-color: #fff;
		border-radius: 32rpx;
		padding: 44rpx 32rpx 36rpx;
		box-shadow: 0 20rpx 60rpx rgba(76, 158, 226, 0.22);
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		z-index: 1;
	}

	.qr-corner {
		position: absolute;
		width: 40rpx;
		height: 40rpx;
		border-color: #4facfe;
		border-style: solid;
		z-index: 2;
	}

	.qr-corner-tl {
		top: 12rpx;
		left: 12rpx;
		border-width: 4rpx 0 0 4rpx;
		border-radius: 32rpx 0 0 0;
	}

	.qr-corner-tr {
		top: 12rpx;
		right: 12rpx;
		border-width: 4rpx 4rpx 0 0;
		border-radius: 0 32rpx 0 0;
	}

	.qr-corner-bl {
		bottom: 12rpx;
		left: 12rpx;
		border-width: 0 0 4rpx 4rpx;
		border-radius: 0 0 0 32rpx;
	}

	.qr-corner-br {
		bottom: 12rpx;
		right: 12rpx;
		border-width: 0 4rpx 4rpx 0;
		border-radius: 0 0 32rpx 0;
	}

	.qr-frame {
		width: 460rpx;
		height: 460rpx;
		background-color: #fff;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.qr-image {
		width: 100%;
		height: 100%;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-text {
		font-size: 28rpx;
		color: #bbb;
	}

	.qr-action-hint {
		margin-top: 28rpx;
		padding: 10rpx 0 2rpx;
	}

	.qr-action-hint-text {
		font-size: 22rpx;
		color: #b0b8c4;
	}

	.tips-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		margin-top: 44rpx;
		flex-wrap: wrap;
		position: relative;
		z-index: 1;
	}

	.tip-item {
		font-size: 24rpx;
		color: #6b9bd1;
	}

	.action-btns {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		gap: 24rpx;
		padding: 20rpx 40rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20rpx);
		z-index: 10;
		box-sizing: border-box;
	}

	.act-btn {
		flex: 1;
		padding: 28rpx 0;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		border: none;
	}

	.act-btn::after {
		border: none;
	}

	.save-btn {
		background-color: #fff;
		border: 2rpx solid #d0e4f7;
	}

	.save-btn .act-btn-text {
		color: #4facfe;
	}

	.share-btn {
		background: linear-gradient(135deg, #5ab0f5, #3c9cff);
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.4);
	}

	.share-btn .act-btn-text {
		color: #fff;
	}

	.act-btn-text {
		font-size: 30rpx;
		font-weight: 600;
	}

	.act-btn.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>