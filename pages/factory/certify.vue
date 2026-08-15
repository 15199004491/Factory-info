<template>
	<view class="page">
		<view class="factory-bar">
			<text class="factory-name">{{ factoryName }}</text>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">提交营业执照</text>
			</view>
			<view class="form-card">
				<view class="form-item upload-item">
					<text class="form-label">营业执照</text>
					<view class="upload-area" @tap="onChooseLicense">
						<image v-if="licenseImage" class="upload-preview" :src="licenseImage" mode="aspectFill" @click.stop="onPreviewLicense" />
						<view v-else class="upload-placeholder">
							<text class="upload-icon">+</text>
							<text class="upload-text">点击上传营业执照</text>
							<text class="upload-tip">请上传清晰完整的营业执照原件照片</text>
						</view>
					</view>
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
					<view class="upload-area" @tap="onChooseIdCard">
						<image v-if="idCardImage" class="upload-preview" :src="idCardImage" mode="aspectFill" @click.stop="onPreviewIdCard" />
						<view v-else class="upload-placeholder">
							<text class="upload-icon">+</text>
							<text class="upload-text">点击上传法人身份证</text>
							<text class="upload-tip">请上传清晰完整的身份证原件照片</text>
						</view>
					</view>
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
			<text class="agreement-link" @tap="onViewAgreement">《加工厂认证服务协议》</text>
		</view>

		<view class="bottom-bar">
			<view class="pay-btn" :class="{ disabled: isSubmitting }" @tap="onSubmit">
				<text class="pay-text">{{ isSubmitting ? '提交中...' : '立即认证' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import '@/utils/upload.js'
	export default {
		data() {
			return {
				factoryId: null,
				factoryName: '',
				licenseImage: '',
				idCardImage: '',
				agreed: false,
				isSubmitting: false
			}
		},
		onLoad(options) {
			if (options.id) {
				this.factoryId = options.id
			}
			if (options.name) {
				this.factoryName = decodeURIComponent(options.name)
				uni.setNavigationBarTitle({
					title: '加工厂认证'
				})
			}
		},
		methods: {
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
			onViewAgreement() {
				uni.showModal({
					title: '加工厂认证服务协议',
					content: '1. 用户同意提交真实有效的营业执照及法人身份信息。\n2. 认证审核通过后，加工厂将获得认证标识和优先展示权益。\n3. 平台有权对提交的资料进行审核，资料不实将取消认证资格。\n4. 认证有效期与加工厂入驻有效期一致。\n5. 平台保留最终解释权。',
					showCancel: false,
					confirmText: '我知道了'
				})
			},
			onSubmit() {
				if (!this.licenseImage) {
					uni.showToast({ title: '请先上传营业执照', icon: 'none' })
					return
				}
				if (!this.idCardImage) {
					uni.showToast({ title: '请先上传法人身份证照片', icon: 'none' })
					return
				}
				if (!this.agreed) {
					uni.showToast({ title: '请先同意认证服务协议', icon: 'none' })
					return
				}
				this.isSubmitting = true
				uni.showLoading({ title: '提交中...', mask: true })

				setTimeout(() => {
					uni.hideLoading()
					this.isSubmitting = false

					uni.showModal({
						title: '提交成功',
						content: '您的加工厂认证资料已提交，审核结果将在1-3个工作日内通知您',
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
				}, 1500)
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

	.upload-area {
		width: 100%;
		min-height: 360rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.upload-preview {
		width: 100%;
		height: 400rpx;
		display: block;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48rpx;
	}

	.upload-icon {
		font-size: 80rpx;
		color: #ccc;
		line-height: 1;
	}

	.upload-text {
		font-size: 28rpx;
		color: #333;
		margin-top: 16rpx;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 12rpx;
		text-align: center;
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
		opacity: 0.7;
	}

	.pay-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
	}
</style>