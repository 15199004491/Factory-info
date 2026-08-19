<template>
	<view class="page">
		<view class="factory-bar">
			<text class="factory-name">{{ factoryName }}</text>
		</view>

		<view class="status-banner status-pending" v-if="identification === 0">
			<text class="status-icon">⏳</text>
			<text class="status-text">您的认证资料已提交，将在1-7个工作日内审核完毕</text>
		</view>
		<view class="status-banner status-failed" v-if="identification === 2">
			<text class="status-icon">✕</text>
			<text class="status-text">认证未通过，请重新提交或联系客服</text>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">提交营业执照</text>
			</view>
			<view class="form-card">
				<view class="form-item upload-item">
					<text class="form-label">营业执照</text>
					<view class="upload-wrap">
						<view class="license-preview" v-if="licenseImage" @tap="onPreviewLicense">
							<image class="license-image" :src="licenseImage" mode="aspectFill" />
							<view class="license-remove" @tap.stop="onRemoveLicense">
								<text class="remove-icon">×</text>
							</view>
						</view>
						<view class="license-add" v-else @tap="onChooseLicense">
							<text class="add-icon">+</text>
							<text class="add-text">上传营业执照</text>
						</view>
					</view>
					<text class="upload-tip">请上传清晰完整的营业执照原件照片</text>
				</view>
			</view>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">法人身份信息</text>
			</view>
			<view class="form-card">
				<view class="form-item upload-item">
					<text class="form-label">企业法人身份证照片</text>
					<view class="upload-wrap">
						<view class="license-preview" v-if="idCardImage" @tap="onPreviewIdCard">
							<image class="license-image" :src="idCardImage" mode="aspectFill" />
							<view class="license-remove" @tap.stop="onRemoveIdCard">
								<text class="remove-icon">×</text>
							</view>
						</view>
						<view class="license-add" v-else @tap="onChooseIdCard">
							<text class="add-icon">+</text>
							<text class="add-text">上传法人身份证</text>
						</view>
					</view>
					<text class="upload-tip">请上传清晰完整的身份证原件照片</text>
				</view>
			</view>
		</view>

		<view class="agreement-row">
			<view class="checkbox-wrap" @tap="agreed = !agreed">
				<view class="checkbox" :class="{ checked: agreed }">
					<text v-if="agreed" class="check-icon">✓</text>
				</view>
				<text class="agreement-text">我已阅读并同意</text>
			</view>
			<text class="agreement-link" @tap="onViewAgreement(false)">《加工厂认证服务协议》</text>
		</view>

		<view class="bottom-bar">
			<view class="pay-btn" :class="{ disabled: isBtnDisabled }" @tap="onSubmit">
				<text class="pay-text">{{ submitBtnText }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { factoryApi } from '@/utils/request.js'
	import '@/utils/upload.js'
	export default {
		data() {
			return {
				factoryId: null,
				factoryName: '',
				licenseImage: '',
				idCardImage: '',
				agreed: false,
				isSubmitting: false,
				identification: null
			}
		},
		computed: {
			submitBtnText() {
				if (this.isSubmitting) return '提交中...'
				if (this.identification === 0) return '认证中...'
				if (this.identification === 2) return '重新提交'
				return '立即认证'
			},
			isBtnDisabled() {
				return this.isSubmitting || this.identification === 0
			}
		},
		onLoad(options) {
			if (options.id) {
				this.factoryId = options.id
				this.loadFactoryInfo()
			}
			if (options.name) {
				this.factoryName = decodeURIComponent(options.name)
				uni.setNavigationBarTitle({
					title: '加工厂认证'
				})
			}
		},
		methods: {
			async loadFactoryInfo() {
				try {
					const data = await factoryApi.getDetail(this.factoryId)
					if (data.license) {
						this.licenseImage = data.license
					}
					if (data.id_card) {
						this.idCardImage = data.id_card
					}
					if (data.identification !== undefined && data.identification !== null && data.identification !== '') {
						this.identification = Number(data.identification)
						if (this.identification === 1) {
							uni.showModal({
								title: '认证成功',
								content: '恭喜您，加工厂认证已通过！',
								showCancel: false,
								confirmText: '返回',
								success: () => {
									uni.navigateBack()
								}
							})
						}
					}
				} catch (e) {}
			},
			onChooseLicense() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const tempPath = res.tempFilePaths[0]
						uni.showLoading({ title: '校验中...' })
						const ok = await uni.checkImageSafe(tempPath)
						uni.hideLoading()
						if (ok) {
							this.licenseImage = tempPath
							uni.showToast({ title: '上传成功', icon: 'success' })
						}
					}
				})
			},
			onPreviewLicense() {
				if (!this.licenseImage) return
				uni.previewImage({
					urls: [this.licenseImage],
					current: this.licenseImage
				})
			},
			onChooseIdCard() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const tempPath = res.tempFilePaths[0]
						uni.showLoading({ title: '校验中...' })
						const ok = await uni.checkImageSafe(tempPath)
						uni.hideLoading()
						if (ok) {
							this.idCardImage = tempPath
							uni.showToast({ title: '上传成功', icon: 'success' })
						}
					}
				})
			},
			onPreviewIdCard() {
				if (!this.idCardImage) return
				uni.previewImage({
					urls: [this.idCardImage],
					current: this.idCardImage
				})
			},
			onRemoveLicense() {
				uni.showModal({
					title: '提示',
					content: '确定要删除营业执照吗？',
					success: (res) => {
						if (res.confirm) {
							this.licenseImage = ''
						}
					}
				})
			},
			onRemoveIdCard() {
				uni.showModal({
					title: '提示',
					content: '确定要删除身份证照片吗？',
					success: (res) => {
						if (res.confirm) {
							this.idCardImage = ''
						}
					}
				})
			},
			onViewAgreement(autoAgree = false) {
				uni.showModal({
					title: '加工厂认证服务协议',
					content: '1. 用户同意提交真实有效的营业执照及法人身份信息。\n2. 认证审核通过后，加工厂将获得认证标识和优先展示权益。\n3. 平台有权对提交的资料进行审核，资料不实将取消认证资格。\n4. 平台保留最终解释权。',
					showCancel: !autoAgree,
					confirmText: autoAgree ? '同意并认证' : '我知道了',
					cancelText: '不同意',
					success: (res) => {
						if (res.confirm) {
							this.agreed = true
							if (autoAgree) {
								this.onSubmit()
							}
						}
					}
				})
			},
			onSubmit() {
				if (this.isSubmitting) return
				if (!this.licenseImage) {
					uni.showToast({ title: '请先上传营业执照', icon: 'none' })
					return
				}
				if (!this.idCardImage) {
					uni.showToast({ title: '请先上传法人身份证照片', icon: 'none' })
					return
				}
				if (!this.agreed) {
					this.onViewAgreement(true)
					return
				}
				this.isSubmitting = true
				uni.showLoading({ title: '提交中...', mask: true })
				this.doSubmit()
			},
			async doSubmit() {
				try {
					let licenseUrl = this.licenseImage
					if (licenseUrl && !licenseUrl.startsWith('http')) {
						licenseUrl = await uni.uploadFactoryLicense(licenseUrl)
					}

					let idCardUrl = this.idCardImage
					if (idCardUrl && !idCardUrl.startsWith('http')) {
						idCardUrl = await uni.uploadFactoryIdCard(idCardUrl)
					}

					await factoryApi.verifyFactory(this.factoryId, licenseUrl, idCardUrl)
					uni.hideLoading()
					this.isSubmitting = false

					this.identification = 0

					uni.showModal({
						title: '提交成功',
						content: '您的加工厂认证资料已提交，将在1-7个工作日内审核完毕',
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
				} catch (e) {
					uni.hideLoading()
					this.isSubmitting = false
					uni.showToast({ title: '提交失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 180rpx;
	}

	.factory-bar {
		background-color: #fff;
		padding: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.factory-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.status-banner {
		margin: 20rpx 24rpx 0;
		padding: 24rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
	}

	.status-pending {
		background-color: #fff8e6;
	}

	.status-pending .status-icon {
		color: #fa8c16;
	}

	.status-failed {
		background-color: #fff1f0;
	}

	.status-failed .status-icon {
		color: #ff4d4f;
	}

	.status-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
	}

	.status-text {
		font-size: 26rpx;
		color: #666;
		flex: 1;
	}

	.form-section {
		margin: 20rpx 24rpx 0;
	}

	.section-title {
		padding: 24rpx 0;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.form-item {
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.form-label {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 12rpx;
		display: block;
	}

	.upload-item {
		border-bottom: none;
	}

	.upload-wrap {
		margin-top: 16rpx;
	}

	.license-preview {
		position: relative;
		width: 240rpx;
		height: 160rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.license-image {
		width: 100%;
		height: 100%;
	}

	.license-remove {
		position: absolute;
		top: 0;
		right: 0;
		width: 56rpx;
		height: 56rpx;
		background-color: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 12rpx;
	}

	.remove-icon {
		color: #fff;
		font-size: 36rpx;
		line-height: 1;
	}

	.license-add {
		width: 240rpx;
		height: 160rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.add-icon {
		font-size: 48rpx;
		color: #ccc;
		line-height: 1;
	}

	.add-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 12rpx;
		display: block;
	}

	.agreement-row {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32rpx 48rpx 0;
	}

	.checkbox-wrap {
		display: flex;
		align-items: center;
	}

	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #ddd;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12rpx;
		background-color: #fff;
	}

	.checkbox.checked {
		background-color: #3c9cff;
		border-color: #3c9cff;
	}

	.check-icon {
		font-size: 22rpx;
		color: #fff;
		font-weight: bold;
	}

	.agreement-text {
		font-size: 24rpx;
		color: #666;
	}

	.agreement-link {
		font-size: 24rpx;
		color: #3c9cff;
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24rpx 48rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
	}

	.pay-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		border-radius: 12rpx;
		padding: 28rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.35);
	}

	.pay-btn.disabled {
		background: linear-gradient(135deg, #b3d9ff, #c4e6ff);
		box-shadow: none;
		pointer-events: none;
	}

	.pay-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
	}
</style>