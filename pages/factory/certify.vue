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
					<uploader-single
						ref="uploaderLicense"
						v-model="licenseImage"
						shape="license"
						add-text="上传营业执照"
						tip="请上传清晰完整的营业执照原件照片"
						choose-toast="上传成功"
						remove-confirm="确定要删除营业执照吗？"
						@change="onLicenseChange"
					/>
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
					<uploader-single
						ref="uploaderIdCard"
						v-model="idCardImage"
						shape="license"
						add-text="上传法人身份证"
						tip="请上传清晰完整的身份证原件照片"
						choose-toast="上传成功"
						remove-confirm="确定要删除身份证照片吗？"
						@change="onIdCardChange"
					/>
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
			<template v-if="fromRegister">
				<view class="action-btn action-skip" :class="{ disabled: isBtnDisabled }" @tap="onSkip">
					<text class="btn-label">{{ isSubmitting ? '提交中...' : '跳过，以后再说' }}</text>
				</view>
				<view class="action-btn action-submit" :class="{ disabled: isBtnDisabled }" @tap="onSubmit">
					<text class="btn-label">{{ submitBtnText }}</text>
				</view>
			</template>
			<template v-else>
				<view class="action-btn action-submit action-single" :class="{ disabled: isBtnDisabled }" @tap="onSubmit">
					<text class="btn-label">{{ submitBtnText }}</text>
				</view>
			</template>
		</view>

		<view class="agreement-mask" v-if="showAgreementModal" @tap="onAgreementClose">
			<view class="agreement-modal" @tap.stop>
				<view class="agreement-modal-title">
					<text>加工厂认证服务协议</text>
				</view>
				<scroll-view scroll-y class="agreement-modal-content">
					<view class="agreement-line">1. 用户同意提交真实有效的营业执照及法人身份信息。</view>
					<view class="agreement-line">2. 认证审核通过后，加工厂将获得认证标识和优先展示权益。</view>
					<view class="agreement-line">3. 平台有权对提交的资料进行审核，资料不实将取消认证资格。</view>
					<view class="agreement-line">4. 平台保留最终解释权。</view>
				</scroll-view>
				<view class="agreement-modal-footer">
					<view v-if="agreementAutoAgree" class="agreement-modal-btn agreement-modal-btn-cancel" @tap="onAgreementCancel">
						<text>不同意</text>
					</view>
					<view class="agreement-modal-btn agreement-modal-btn-confirm" @tap="onAgreementConfirm">
						<text>{{ agreementAutoAgree ? '同意认证' : '我知道了' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { factoryApi } from '@/utils/request.js'
	import uploaderSingle from '@/components/uploader-single/uploader-single.vue'
	import { isLocalTempPath } from '@/utils/upload.js'
	export default {
		components: {
			uploaderSingle
		},
		data() {
			return {
				factoryId: null,
				factoryName: '',
				fromRegister: false,
				licenseImage: '',
				idCardImage: '',
				agreed: false,
				isSubmitting: false,
				identification: null,
				showAgreementModal: false,
				agreementAutoAgree: false
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
			}
			if (options.from === 'register') {
				this.fromRegister = true
			}
			uni.setNavigationBarTitle({
				title: '加工厂认证'
			})
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
					this.$nextTick(() => {
						if (this.$refs.uploaderLicense && this.licenseImage) {
							this.$refs.uploaderLicense.currentSrc = this.licenseImage
						}
						if (this.$refs.uploaderIdCard && this.idCardImage) {
							this.$refs.uploaderIdCard.currentSrc = this.idCardImage
						}
					})
					if (data.identification !== undefined && data.identification !== null && data.identification !== '') {
						this.identification = Number(data.identification)
						if (this.identification === 1) {
							const delta = this.fromRegister ? 2 : 1
							const pages = getCurrentPages()
							const safeDelta = Math.min(delta, pages.length - 1)
							uni.showModal({
								title: '认证成功',
								content: '恭喜您，加工厂认证已通过！',
								showCancel: false,
								confirmText: '返回',
								success: () => {
									if (safeDelta <= 0) {
										uni.navigateBack()
									} else {
										uni.navigateBack({ delta: safeDelta })
									}
								}
							})
						}
					}
				} catch (e) {}
			},
			onLicenseChange(val) {
				this.licenseImage = val || ''
			},
			onIdCardChange(val) {
				this.idCardImage = val || ''
			},
			onViewAgreement(autoAgree = false) {
				this.agreementAutoAgree = autoAgree
				this.showAgreementModal = true
			},
			onAgreementClose() {
				this.showAgreementModal = false
				this.agreementAutoAgree = false
			},
			onAgreementCancel() {
				this.showAgreementModal = false
				this.agreementAutoAgree = false
			},
			onAgreementConfirm() {
				this.showAgreementModal = false
				this.agreed = true
				if (this.agreementAutoAgree) {
					this.agreementAutoAgree = false
					this.doAuthSubmit()
				} else {
					this.agreementAutoAgree = false
				}
			},
			onSubmit() {
				if (this.isSubmitting) return
				const refLicense = (this.$refs.uploaderLicense && this.$refs.uploaderLicense.currentSrc) || ''
				if (refLicense && !this.licenseImage) {
					this.licenseImage = refLicense
				}
				if (!this.licenseImage) {
					uni.showToast({ title: '请先上传营业执照', icon: 'none' })
					return
				}
				const refIdCard = (this.$refs.uploaderIdCard && this.$refs.uploaderIdCard.currentSrc) || ''
				if (refIdCard && !this.idCardImage) {
					this.idCardImage = refIdCard
				}
				if (!this.idCardImage) {
					uni.showToast({ title: '请先上传法人身份证照片', icon: 'none' })
					return
				}
				if (!this.agreed) {
					this.onViewAgreement(true)
					return
				}
				this.doAuthSubmit()
			},
			doAuthSubmit() {
				if (this.isSubmitting) return
				this.isSubmitting = true
				uni.showLoading({ title: '提交中...', mask: true, timeout: 6000 })
				this.doSubmit()
			},
			onSkip() {
				if (this.isSubmitting) return
				const delta = this.fromRegister ? 2 : 1
				const pages = getCurrentPages()
				const safeDelta = Math.min(delta, pages.length - 1)
				if (safeDelta <= 0) {
					uni.navigateBack()
				} else {
					uni.navigateBack({ delta: safeDelta })
				}
			},
			async doSubmit() {
				try {
					let licenseUrl = this.licenseImage
					if (licenseUrl && isLocalTempPath(licenseUrl)) {
						licenseUrl = await uni.uploadFactoryLicense(licenseUrl)
					}

					let idCardUrl = this.idCardImage
					if (idCardUrl && isLocalTempPath(idCardUrl)) {
						idCardUrl = await uni.uploadFactoryIdCard(idCardUrl)
					}

					await factoryApi.verifyFactory(this.factoryId, licenseUrl, idCardUrl)
					uni.hideLoading()

					this.identification = 0

					const delta = this.fromRegister ? 2 : 1
					const pages = getCurrentPages()
					const safeDelta = Math.min(delta, pages.length - 1)
					uni.showModal({
						title: '提交成功',
						content: '您的加工厂认证资料已提交，将在1-7个工作日内审核完毕',
						showCancel: false,
						success: () => {
							if (safeDelta <= 0) {
								uni.navigateBack()
							} else {
								uni.navigateBack({ delta: safeDelta })
							}
						}
					})
				} catch (e) {
					uni.hideLoading()
					uni.showToast({ title: '提交失败', icon: 'none' })
				} finally {
					this.isSubmitting = false
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
		display: flex;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 28rpx 0;
		margin: 0 12rpx;
		border-radius: 12rpx;
	}

	.action-btn::after {
		border: none;
	}

	.action-submit {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.35);
	}

	.action-skip {
		background: #fff;
		border: 2rpx solid #3c9cff;
	}

	.action-skip .btn-label {
		color: #3c9cff;
		font-size: 28rpx;
	}

	.btn-label {
		font-size: 30rpx;
		font-weight: 600;
		color: #fff;
	}

	.action-btn.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.action-single {
		margin: 0;
	}

	.agreement-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.agreement-modal {
		width: 620rpx;
		height: 70vh;
		max-height: 70vh;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.agreement-modal-title {
		padding: 36rpx 32rpx 24rpx;
		text-align: center;
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.agreement-modal-content {
		flex: 1;
		padding: 24rpx 32rpx;
		min-height: 0;
		box-sizing: border-box;
		overflow-y: auto;
	}

	.agreement-line {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		text-align: left;
		margin-bottom: 12rpx;
	}

	.agreement-modal-footer {
		display: flex;
		border-top: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.agreement-modal-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 28rpx 0;
		font-size: 30rpx;
	}

	.agreement-modal-btn-cancel {
		color: #666;
		border-right: 1rpx solid #f0f0f0;
	}

	.agreement-modal-btn-confirm {
		color: #3c9cff;
		font-weight: 600;
	}
</style>