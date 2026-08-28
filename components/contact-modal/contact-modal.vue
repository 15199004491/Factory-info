<template>
	<view>
		<view class="contact-mask" v-if="visible" @click="handleClose"></view>
		<view class="contact-card" v-if="visible" @click="noop">
			<view class="contact-title">
				<text>联系我们</text>
			</view>
			<view class="contact-row">
				<view class="contact-left">
					<text class="contact-label">手机号</text>
					<text class="contact-value">18073057410</text>
				</view>
				<view class="contact-call" @click="onCallPhone">
					<text class="contact-call-text">拨打</text>
				</view>
			</view>
			<view class="contact-row">
				<view class="contact-left">
					<text class="contact-label">微信号</text>
					<text class="contact-value">w18073057410</text>
				</view>
				<view class="contact-copy-btn" @click="onCopyWechat">
					<text class="contact-action-text wechat-text">复制</text>
				</view>
			</view>
			<view class="contact-row">
				<view class="contact-left">
					<text class="contact-label">抖音号</text>
					<text class="contact-value">66241976648（有演示步骤）</text>
				</view>
				<view class="contact-copy-btn" @click="onCopyDouyin">
					<text class="contact-action-text douyin-text">复制</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'contact-modal',
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {}
		},
		methods: {
			noop() {},
			handleClose() {
				this.$emit('close')
			},
			onCallPhone() {
				uni.makePhoneCall({
					phoneNumber: '18073057410',
					fail: () => {}
				})
			},
			onCopyWechat() {
				uni.setClipboardData({
					data: 'w18073057410',
					success: () => {
						uni.showToast({ title: '微信号已复制', icon: 'success' })
					}
				})
			},
			onCopyDouyin() {
				uni.setClipboardData({
					data: '66241976648',
					success: () => {
						uni.showToast({ title: '抖音号已复制', icon: 'success' })
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contact-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9998;
	}

	.contact-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 620rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx 32rpx;
		box-sizing: border-box;
		z-index: 9999;
	}

	.contact-title {
		text-align: center;
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 36rpx;
	}

	.contact-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.contact-row:last-child {
		border-bottom: none;
	}

	.contact-left {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-right: 24rpx;
		min-width: 0;
	}

	.contact-label {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 8rpx;
	}

	.contact-value {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.contact-call {
		background: linear-gradient(135deg, #3c9cff, #56ccf2);
		box-shadow: 0 4rpx 12rpx rgba(60, 156, 255, 0.3);
		padding: 14rpx 30rpx;
		border-radius: 999rpx;
	}

	.contact-call-text {
		font-size: 26rpx;
		color: #fff;
		font-weight: 500;
	}

	.contact-copy-btn {
		background-color: #f5f7fa;
		border: 1rpx solid #e5e7eb;
		padding: 14rpx 30rpx;
		border-radius: 999rpx;
	}

	.contact-action-text {
		font-size: 26rpx;
		font-weight: 500;
	}

	.wechat-text {
		color: #3c9cff;
	}

	.douyin-text {
		color: #722ed1;
	}
</style>