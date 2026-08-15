<template>
	<view class="page">
		<view class="factory-bar">
			<text class="factory-name">{{ factoryName }}</text>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">续费信息</text>
			</view>
			<view class="form-card">
				<view class="info-row">
					<text class="info-label">加工厂</text>
					<text class="info-value">{{ factoryName }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">续费时长</text>
					<text class="duration-text">一年</text>
				</view>
				<view class="info-row validity-row">
					<text class="info-label">有效期</text>
					<view class="validity-values">
						<text class="validity-current">{{ displayCurrentValidity }}</text>
						<text class="validity-to">至</text>
						<text class="validity-new">{{ newValidity }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">续费说明</text>
			</view>
			<view class="form-card">
				<view class="desc-row">
					<text class="desc-text">· 续费成功后，加工厂入驻有效期将自动延长一年</text>
				</view>
				<view class="desc-row">
					<text class="desc-text">· 续费期间可正常使用加工厂发布、推广等全部功能</text>
				</view>
				<view class="desc-row">
					<text class="desc-text">· 如有疑问请联系客服咨询</text>
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
			<text class="agreement-link" @tap="onViewAgreement">《加工厂续费服务协议》</text>
		</view>

		<view class="bottom-bar">
			<view class="submit-btn-wrap" :class="{ disabled: isPaying }" @tap="onSubmit">
				<view class="discount-badge">3.0折</view>
				<view class="price-row">
					<text class="submit-price">¥300</text>
					<text class="submit-unit">/年</text>
					<text class="original-price">原价¥1000</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				factoryId: null,
				factoryName: '',
				currentValidity: '',
				agreed: false,
				isPaying: false
			}
		},
		computed: {
			displayCurrentValidity() {
				if (this.currentValidity) return this.currentValidity
				const d = new Date()
				const y = d.getFullYear()
				const m = String(d.getMonth() + 1).padStart(2, '0')
				const day = String(d.getDate()).padStart(2, '0')
				return `${y}-${m}-${day}`
			},
			newValidity() {
				const d = new Date()
				d.setFullYear(d.getFullYear() + 1)
				const y = d.getFullYear()
				const m = String(d.getMonth() + 1).padStart(2, '0')
				const day = String(d.getDate()).padStart(2, '0')
				return `${y}-${m}-${day}`
			}
		},
		onLoad(options) {
			if (options.id) {
				this.factoryId = options.id
			}
			if (options.name) {
				this.factoryName = decodeURIComponent(options.name)
			}
			if (options.validity) {
				this.currentValidity = decodeURIComponent(options.validity)
			}
			uni.setNavigationBarTitle({
				title: '加工厂续费'
			})
		},
		methods: {
			onViewAgreement() {
				uni.showModal({
					title: '加工厂续费服务协议',
					content: '1. 用户同意支付每年300元的续费用用（原价1000元/年）。\n2. 续费有效期为一年，自当前有效期结束之日起计算。\n3. 续费成功后，加工厂将继续享有平台提供的各项服务权益。\n4. 续费服务一经开通，费用不予退还。\n5. 平台保留最终解释权。',
					showCancel: false,
					confirmText: '我知道了'
				})
			},
			onSubmit() {
				if (!this.agreed) {
					uni.showToast({ title: '请先同意续费服务协议', icon: 'none' })
					return
				}
				this.isPaying = true
				uni.showLoading({ title: '支付中...', mask: true })

				setTimeout(() => {
					uni.hideLoading()
					this.isPaying = false

					uni.showModal({
						title: '续费成功',
						content: '恭喜您，加工厂续费已成功！有效期已延长至' + this.newValidity,
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
		padding-bottom: 220rpx;
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

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 26rpx;
		color: #666;
		flex-shrink: 0;
	}

	.info-value {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		flex: 1;
		text-align: right;
		margin-left: 20rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.info-value.highlight {
		color: #3c9cff;
		font-weight: 600;
	}

	.validity-row {
		align-items: center;
	}

	.validity-values {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
		margin-left: 20rpx;
		gap: 12rpx;
	}

	.validity-current {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		flex-shrink: 0;
	}

	.validity-to {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		flex-shrink: 0;
	}

	.validity-new {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		flex-shrink: 0;
	}

	.duration-text {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
	}

	.desc-row {
		padding: 16rpx 24rpx;
	}

	.desc-row:first-child {
		padding-top: 28rpx;
	}

	.desc-row:last-child {
		padding-bottom: 28rpx;
	}

	.desc-text {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
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

	.submit-btn-wrap {
		position: relative;
		background: linear-gradient(135deg, #ff9800, #ffb74d);
		border-radius: 16rpx;
		padding: 24rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(255, 152, 0, 0.35);
		overflow: visible;
	}

	.submit-btn-wrap.disabled {
		opacity: 0.7;
	}

	.discount-badge {
		position: absolute;
		top: -16rpx;
		right: -8rpx;
		background: linear-gradient(135deg, #ff4d4f, #ff7a45);
		color: #fff;
		font-size: 22rpx;
		font-weight: 700;
		padding: 6rpx 16rpx;
		border-radius: 8rpx 8rpx 2rpx 8rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.4);
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: 8rpx;
	}

	.submit-price {
		font-size: 36rpx;
		font-weight: 700;
		color: #fff;
	}

	.submit-unit {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
	}

	.original-price {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		text-decoration: line-through;
		margin-left: 8rpx;
	}
</style>