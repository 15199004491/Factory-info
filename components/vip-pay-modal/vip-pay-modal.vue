<template>
	<view>
		<view class="pay-mask" v-if="visible" @click="handleCancel"></view>
		<view class="pay-card" v-if="visible" @click="noop">
			<view class="pay-header">
				<view class="pay-title">{{ title }}</view>
				<view class="pay-subtitle">{{ subtitle }}</view>
			</view>

			<view class="pay-info">
				<view class="pay-info-row">
					<text class="pay-info-label">价格</text>
					<text class="pay-info-value">¥{{ price }} <text class="pay-unit">/ {{ unit }}</text></text>
				</view>
				<view class="pay-info-row">
					<text class="pay-info-label">有效期</text>
					<text class="pay-info-value">{{ startDate }} - {{ endDate }}</text>
				</view>
			</view>

			<view class="pay-actions">
				<view class="pay-btn cancel" @click="handleCancel">
					<text>暂不升级</text>
				</view>
				<view class="pay-btn confirm" :class="{ loading }" @click="handleConfirm">
					<text v-if="!loading">立即支付</text>
					<text v-else>支付中...</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { VIP_CONFIG } from '@/utils/houseLimit.js'

	export default {
		name: 'vip-pay-modal',
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			loading: {
				type: Boolean,
				default: false
			},
			startDate: {
				type: String,
				default: ''
			},
			endDate: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: '已达发布上限'
			},
			subtitle: {
				type: String,
				default: '开通二手房和租房会员即可继续发布'
			}
		},
		computed: {
			price() {
				return VIP_CONFIG.price
			},
			unit() {
				return VIP_CONFIG.unit
			}
		},
		methods: {
			noop() {},
			handleCancel() {
				this.$emit('cancel')
			},
			handleConfirm() {
				this.$emit('confirm')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pay-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9998;
	}

	.pay-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 620rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 48rpx 40rpx 36rpx;
		box-sizing: border-box;
		z-index: 9999;
		overflow: hidden;
	}

	.pay-header {
		text-align: center;
		margin-bottom: 40rpx;
	}

	.pay-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #222;
		margin-bottom: 12rpx;
	}

	.pay-subtitle {
		font-size: 26rpx;
		color: #888;
	}

	.pay-info {
		background-color: #f8f9fb;
		border-radius: 16rpx;
		padding: 8rpx 32rpx;
		margin-bottom: 40rpx;
	}

	.pay-info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #eee;
	}

	.pay-info-row:last-child {
		border-bottom: none;
	}

	.pay-info-label {
		font-size: 26rpx;
		color: #999;
		min-width: 100rpx;
		white-space: nowrap;
	}

	.pay-info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.pay-info-value.price {
		color: #ff4d4f;
		font-size: 28rpx;
		font-weight: 500;
	}

	.pay-unit {
		font-size: 26rpx;
		font-weight: 400;
		color: #999;
		margin-left: 4rpx;
	}

	.pay-actions {
		display: flex;
		gap: 24rpx;
	}

	.pay-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		border-radius: 44rpx;
		font-size: 30rpx;
		font-weight: 500;
	}

	.pay-btn.cancel {
		background-color: #f5f7fa;
		color: #666;
		border: 1rpx solid #e5e7eb;
	}

	.pay-btn.confirm {
		background: linear-gradient(135deg, #3c9cff, #56ccf2);
		color: #fff;
		box-shadow: 0 6rpx 16rpx rgba(60, 156, 255, 0.35);
	}

	.pay-btn.confirm.loading {
		opacity: 0.7;
	}
</style>