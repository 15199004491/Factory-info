<template>
	<view v-if="visible">
		<view class="feedback-mask" @click="handleClose"></view>
		<view class="feedback-card" @click="noop">
			<view class="feedback-title">
				<text>意见箱</text>
			</view>

			<view class="feedback-item">
				<text class="feedback-label">反馈内容</text>
				<view class="feedback-textarea-box">
					<sensitive-textarea
						ref="contentRef"
						v-model="content"
						:maxlength="200"
						placeholder="请描述您遇到的问题或建议，我们会认真对待每一条反馈"
						:auto-height="true"
						:fixed="true"
					></sensitive-textarea>
				</view>
			</view>

			<view class="feedback-item">
				<text class="feedback-label">联系方式（选填）</text>
				<view class="feedback-input-box">
					<sensitive-input
						v-model="contact"
						:maxlength="50"
						placeholder="手机号 / 微信号，方便我们联系您"
					></sensitive-input>
				</view>
			</view>

			<view class="feedback-actions">
				<view class="feedback-btn btn-cancel" @click="handleClose">
					<text class="feedback-btn-text">取消</text>
				</view>
				<view class="feedback-btn btn-submit" :class="{ disabled: submitting }" @click="handleSubmit">
					<text class="feedback-btn-text">{{ submitting ? '提交中...' : '提交' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { feedbackApi as fbApi } from '@/utils/request.js'

	export default {
		name: 'feedback-modal',
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				content: '',
				contact: '',
				submitting: false
			}
		},
		watch: {
			visible(val) {
				if (!val) {
					this.content = ''
					this.contact = ''
					this.submitting = false
				}
			}
		},
		methods: {
			noop() {},
			handleClose() {
				this.$emit('close')
			},
			async handleSubmit() {
				if (this.submitting) return
				const content = (this.content || '').trim()
				if (!content) {
					uni.showToast({ title: '请输入反馈内容', icon: 'none' })
					return
				}
				const contentRef = this.$refs.contentRef
				if (contentRef && typeof contentRef.validate === 'function') {
					const valid = await contentRef.validate()
					if (!valid) return
				}
				this.submitting = true
				try {
					await fbApi.submit({
						content: content,
						contact: (this.contact || '').trim()
					})
					uni.showToast({ title: '提交成功，感谢您的反馈', icon: 'success' })
					this.$emit('close')
				} catch (e) {
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.feedback-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9998;
	}

	.feedback-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 640rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx 32rpx;
		box-sizing: border-box;
		z-index: 9999;
	}

	.feedback-title {
		text-align: center;
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 36rpx;
	}

	.feedback-item {
		margin-bottom: 28rpx;
	}

	.feedback-label {
		display: block;
		font-size: 26rpx;
		color: #666;
		margin-bottom: 14rpx;
		font-weight: 500;
	}

	.feedback-textarea-box {
		min-height: 200rpx;
		box-sizing: border-box;
	}

	.feedback-input-box {
		height: 76rpx;
		box-sizing: border-box;
	}

	.feedback-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 36rpx;
	}

	.feedback-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-cancel {
		background-color: #f5f7fa;
		border: 2rpx solid #e5e5e5;
	}

	.btn-cancel .feedback-btn-text {
		color: #666;
	}

	.btn-submit {
		background: linear-gradient(135deg, #3c9cff, #56ccf2);
		box-shadow: 0 4rpx 12rpx rgba(60, 156, 255, 0.3);
	}

	.btn-submit .feedback-btn-text {
		color: #fff;
	}

	.btn-submit.disabled {
		opacity: 0.6;
	}

	.feedback-btn-text {
		font-size: 28rpx;
		font-weight: 500;
	}
</style>