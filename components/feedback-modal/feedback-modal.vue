<template>
	<view class="feedback-mask" v-if="visible" @tap="closeFeedback">
		<view class="feedback-sheet" :class="{ 'feedback-sheet-show': visible }" @tap.stop>
			<view class="fb-header">
				<text class="fb-title">意见反馈</text>
				<view class="fb-close" @tap="closeFeedback">
					<u-icon name="close" size="16" color="#999"></u-icon>
				</view>
			</view>
			<view class="fb-body">
				<sensitive-textarea
					ref="feedbackInput"
					:value="feedbackContent"
					@input="feedbackContent = $event"
					:maxlength="200"
					placeholder="请输入您的意见或建,让我们做得更好"
					placeholder-class="fb-placeholder"
					input-class="form-textarea-gray fb-textarea-box"
					:auto-height="false"
					:show-count="false"
				/>
			</view>
			<view class="fb-footer">
				<view class="fb-submit" :class="{ disabled: !canSubmitFeedback || submittingFeedback }" @tap="submitFeedback">
					<text class="fb-submit-text">{{ submittingFeedback ? '提交中...' : '提交反馈' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import { feedbackApi } from '@/utils/request.js'

	export default {
		name: 'feedback-modal',
		components: {
			uIcon
		},
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				feedbackContent: '',
				submittingFeedback: false
			}
		},
		computed: {
			canSubmitFeedback() {
				const s = (this.feedbackContent || '').trim()
				return s.length >= 5 && s.length <= 200
			}
		},
		watch: {
			visible(val) {
				if (val) {
					this.feedbackContent = ''
					this.submittingFeedback = false
				}
			}
		},
		methods: {
			closeFeedback() {
				if (this.submittingFeedback) return
				this.$emit('close')
			},
			async submitFeedback() {
				if (!this.canSubmitFeedback) {
					uni.showToast({ title: '请输入至少5个字的反馈内容', icon: 'none' })
					return
				}
				if (this.submittingFeedback) return

				const feedbackInput = this.$refs.feedbackInput
				if (feedbackInput && feedbackInput.validate) {
					const valid = await feedbackInput.validate()
					if (!valid) {
						uni.showToast({ title: '反馈内容含敏感词汇', icon: 'none' })
						return
					}
				}

				this.submittingFeedback = true
				uni.showLoading({ title: '提交中...', mask: true })
				try {
					await feedbackApi.submit({ content: this.feedbackContent.trim() })
					uni.hideLoading()
					uni.showToast({ title: '感谢您的反馈！', icon: 'success' })
					this.feedbackContent = ''
					this.$emit('close')
				} catch (e) {
					uni.hideLoading()
					const msg = (e && (e.msg || e.message)) || '提交失败，请稍后重试'
					uni.showToast({ title: msg, icon: 'none' })
				} finally {
					this.submittingFeedback = false
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/common/form.scss';

	.feedback-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 99;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.feedback-sheet {
		position: relative;
		width: 620rpx;
		background-color: #fff;
		border-radius: 24rpx;
		z-index: 100;
		opacity: 0;
		transform: scale(0.9);
		transition: all 0.25s ease;
		overflow: hidden;
	}

	.feedback-sheet-show {
		opacity: 1;
		transform: scale(1);
	}

	.fb-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.fb-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.fb-close {
		padding: 8rpx;
	}

	.fb-body {
		padding: 28rpx 32rpx 8rpx;
	}

	.fb-body .form-textarea-gray {
		height: 460rpx;
	}

	.fb-body .fb-textarea-box textarea {
		height: 460rpx !important;
		min-height: 460rpx !important;
	}

	.fb-placeholder {
		color: #c0c4cc;
	}

	.fb-footer {
		padding: 20rpx 32rpx 32rpx;
	}

	.fb-submit {
		background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
		border-radius: 44rpx;
		padding: 26rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 18rpx rgba(60, 156, 255, 0.35);
	}

	.fb-submit.disabled {
		background: #b7c4d8;
		box-shadow: none;
	}

	.fb-submit-text {
		font-size: 30rpx;
		font-weight: 500;
		color: #fff;
	}
</style>