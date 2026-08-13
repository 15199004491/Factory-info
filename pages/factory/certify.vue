<template>
	<view class="page">
		<view class="factory-bar">
			<text class="factory-name">{{ factoryName }}</text>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">提交认证资料</text>
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
				<text class="title-text">认证费用</text>
			</view>
			<view class="form-card">
				<view class="fee-row">
					<view class="fee-info">
						<text class="fee-title">年度认证费</text>
						<text class="fee-desc">认证有效期为一年，到期需重新认证</text>
					</view>
					<view class="fee-amount">
						<text class="fee-price">¥1000</text>
						<text class="fee-unit">/年</text>
					</view>
				</view>
				<view class="fee-row">
					<view class="fee-info">
						<text class="fee-title">认证服务</text>
						<text class="fee-desc">审核资质、专属标识、优先展示</text>
					</view>
					<view class="fee-tag">
						<text class="fee-tag-text">已开通</text>
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
			<view class="pay-btn" :class="{ disabled: isPaying }" @tap="onPay">
				<text class="pay-text">{{ isPaying ? '支付中...' : '确认支付 ¥1000' }}</text>
			</view>
		</view>

		<view class="pay-modal-mask" v-if="showPayModal" @tap="closePayModal">
			<view class="pay-modal" @tap.stop>
				<view class="pay-modal-title">
					<text>选择支付方式</text>
				</view>
				<view class="pay-methods">
					<view class="pay-method" @tap="onPayMethod('wechat')">
						<view class="pay-method-icon wechat-icon">
							<text class="iconfont">微</text>
						</view>
						<view class="pay-method-info">
							<text class="pay-method-name">微信支付</text>
							<text class="pay-method-desc">推荐使用</text>
						</view>
						<view class="pay-method-check">
							<text class="check-circle">✓</text>
						</view>
					</view>
				</view>
				<view class="pay-amount-row">
					<text class="pay-amount-label">支付金额</text>
					<text class="pay-amount-value">¥1000.00</text>
				</view>
				<view class="pay-modal-actions">
					<view class="pay-modal-btn btn-cancel" @tap="closePayModal">
						<text>取消</text>
					</view>
					<view class="pay-modal-btn btn-confirm" @tap="confirmPay">
						<text>确认支付</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				factoryName: '',
				licenseImage: '',
				agreed: false,
				showPayModal: false,
				isPaying: false,
				payMethod: 'wechat'
			}
		},
		onLoad(options) {
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
					success: (res) => {
						this.licenseImage = res.tempFilePaths[0]
						uni.showToast({ title: '上传成功', icon: 'success' })
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
			onViewAgreement() {
				uni.showModal({
					title: '加工厂认证服务协议',
					content: '1. 用户同意支付每年1000元的认证费用。\n2. 认证有效期为一年，到期需重新认证。\n3. 认证审核通过后，加工厂将获得认证标识。\n4. 认证费用不予退还。\n5. 平台保留最终解释权。',
					showCancel: false,
					confirmText: '我知道了'
				})
			},
			onPay() {
				if (!this.licenseImage) {
					uni.showToast({ title: '请先上传营业执照', icon: 'none' })
					return
				}
				if (!this.agreed) {
					uni.showToast({ title: '请先同意认证服务协议', icon: 'none' })
					return
				}
				this.showPayModal = true
			},
			closePayModal() {
				this.showPayModal = false
			},
			onPayMethod(method) {
				this.payMethod = method
			},
			confirmPay() {
				this.showPayModal = false
				this.isPaying = true

				uni.showLoading({ title: '支付中...', mask: true })

				setTimeout(() => {
					uni.hideLoading()
					this.isPaying = false

					uni.showModal({
						title: '支付成功',
						content: '您的加工厂认证已提交，审核结果将在1-3个工作日内通知您',
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

	.fee-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.fee-row:last-child {
		border-bottom: none;
	}

	.fee-info {
		flex: 1;
	}

	.fee-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 8rpx;
	}

	.fee-desc {
		font-size: 24rpx;
		color: #999;
	}

	.fee-amount {
		display: flex;
		align-items: baseline;
		flex-shrink: 0;
	}

	.fee-price {
		font-size: 36rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.fee-unit {
		font-size: 24rpx;
		color: #999;
		margin-left: 6rpx;
	}

	.fee-tag {
		flex-shrink: 0;
		padding: 8rpx 20rpx;
		background-color: rgba(82, 196, 26, 0.1);
		border-radius: 8rpx;
	}

	.fee-tag-text {
		font-size: 24rpx;
		color: #52c41a;
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

	.pay-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.pay-modal {
		width: 640rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
	}

	.pay-modal-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 32rpx;
	}

	.pay-methods {
		margin-bottom: 24rpx;
	}

	.pay-method {
		display: flex;
		align-items: center;
		padding: 28rpx 24rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
	}

	.pay-method-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.wechat-icon {
		background-color: #07c160;
	}

	.wechat-icon .iconfont {
		font-size: 36rpx;
		color: #fff;
		font-weight: bold;
	}

	.pay-method-info {
		flex: 1;
	}

	.pay-method-name {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		display: block;
	}

	.pay-method-desc {
		font-size: 24rpx;
		color: #999;
	}

	.pay-method-check {
		flex-shrink: 0;
	}

	.check-circle {
		font-size: 32rpx;
		color: #3c9cff;
		font-weight: bold;
	}

	.pay-amount-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-top: 1rpx solid #f0f0f0;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 32rpx;
	}

	.pay-amount-label {
		font-size: 26rpx;
		color: #666;
	}

	.pay-amount-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.pay-modal-actions {
		display: flex;
		gap: 24rpx;
	}

	.pay-modal-btn {
		flex: 1;
		padding: 24rpx 0;
		border-radius: 12rpx;
		text-align: center;
		font-size: 28rpx;
	}

	.btn-cancel {
		background-color: #f5f7fa;
		color: #666;
	}

	.btn-confirm {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		color: #fff;
	}
</style>