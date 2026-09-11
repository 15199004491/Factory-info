<template>
	<view class="uploader-single">
		<view class="uploader-inner">
			<view class="preview-box" :class="shape" v-if="currentSrc" @tap="onPreview">
				<view class="preview-image-wrap">
					<image-placeholder class="preview-image" :src="currentSrc" mode="aspectFill" />
				</view>
				<view class="remove-btn" @tap.stop="onRemove">
					<text class="remove-icon">×</text>
				</view>
			</view>
			<view class="add-box" :class="shape" v-else @tap="onChoose">
				<text class="add-icon">+</text>
				<text class="add-text" v-if="addText">{{ addText }}</text>
			</view>
		</view>
		<text class="upload-tip" v-if="tip">{{ tip }}</text>

		<canvas
			v-if="showCanvas"
			:id="canvasId"
			type="2d"
			class="watermark-canvas"
		></canvas>
	</view>
</template>

<script>
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
	import { formatCosUrl } from '@/utils/config.js'
	import { previewWithWatermark } from '@/utils/watermark.js'

	export default {
		name: 'UploaderSingle',
		components: {
			imagePlaceholder
		},
		props: {
			value: { type: String, default: '' },
			tip: { type: String, default: '' },
			addText: { type: String, default: '' },
			shape: { type: String, default: 'square' },
			removeConfirm: { type: String, default: '' },
			checkSafe: { type: Boolean, default: true },
			checkLoadingText: { type: String, default: '校验中...' },
			chooseToast: { type: String, default: '' },
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		data() {
			return {
				currentSrc: this.value || '',
				showCanvas: false,
				canvasId: 'usWmCanvas_' + (this._uid || Math.random().toString(36).slice(2))
			}
		},
		watch: {
			value(val) {
				this.currentSrc = val || ''
			}
		},
		methods: {
			onChoose() {
				const self = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const tempPath = res.tempFilePaths[0]
						if (self.checkSafe) {
							uni.showLoading({ title: self.checkLoadingText, mask: true })
							try {
								const ok = await uni.checkImageSafe(tempPath)
								uni.hideLoading()
								if (!ok) {
									uni.showToast({ title: '图片违规不可用，请重新选择', icon: 'none' })
									return
								}
							} catch (e) {
								uni.hideLoading()
								uni.showToast({ title: '图片校验失败，请重试', icon: 'none' })
								return
							}
						}
						self.currentSrc = tempPath
						self.$emit('input', tempPath)
						self.$emit('update:value', tempPath)
						self.$emit('change', tempPath)
						if (self.chooseToast) {
							uni.showToast({ title: self.chooseToast, icon: 'success' })
						}
					}
				})
			},
			onRemove() {
				const self = this
				if (self.removeConfirm) {
					uni.showModal({
						title: '提示',
						content: self.removeConfirm,
						success: (res) => {
							if (res.confirm) self.doRemove()
						}
					})
				} else {
					self.doRemove()
				}
			},
			doRemove() {
				this.currentSrc = ''
				this.$emit('input', '')
				this.$emit('update:value', '')
				this.$emit('change', '')
			},
			onPreview() {
				if (!this.currentSrc) return
				let previewSrc = this.currentSrc
				const isLocal = /^(wxfile:|file:|blob:|wxLocalResource:|http:\/\/tmp\/|https:\/\/tmp\/)/i.test(this.currentSrc)
					|| this.currentSrc.indexOf('tmp_') === 0
					|| this.currentSrc.indexOf('/tmp/') === 0
					|| this.currentSrc.indexOf('tmp/') === 0
					|| !/^https?:\/\//i.test(this.currentSrc)
				if (!isLocal) {
					previewSrc = formatCosUrl(previewSrc)
				}

				this.showCanvas = true
				uni.showLoading({ title: '加载中...', mask: true })
				this.$nextTick(() => {
					previewWithWatermark(this.canvasId, [previewSrc], previewSrc, this).then(({ urls, current }) => {
						uni.hideLoading()
						this.showCanvas = false
						uni.previewImage({ urls, current })
					}).catch(() => {
						uni.hideLoading()
						this.showCanvas = false
						uni.previewImage({ urls: [previewSrc], current: previewSrc })
					})
				})
			}
		}
	}
</script>

<style lang="scss">
	.uploader-single {
		margin-top: 10rpx;
	}

	.uploader-inner {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.preview-box,
	.add-box {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
	}

	.add-box {
		overflow: hidden;
	}

	.preview-image-wrap {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
		overflow: hidden;
		position: relative;
	}

	.preview-box.square,
	.add-box.square {
		width: 180rpx;
		height: 180rpx;
		background-color: #fafafa;
	}

	.add-box.square {
		border: 2rpx dashed #ccc;
	}

	.preview-box.license,
	.add-box.license {
		width: 100%;
		height: 320rpx;
		background-color: #fafafa;
		border: 2rpx dashed #ccc;
	}

	.preview-box.license,
	.preview-box.square {
		border: none;
		background-color: transparent;
	}

	.preview-image {
		width: 100%;
		height: 100%;
	}

	.remove-btn {
		position: absolute;
		top: -16rpx;
		right: -16rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.55);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	}

	.remove-icon {
		font-size: 30rpx;
		color: #fff;
		line-height: 1;
	}

	.add-icon {
		font-size: 60rpx;
		color: #ccc;
		font-weight: 300;
	}

	.add-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 12rpx;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 16rpx;
		display: block;
	}

	.watermark-canvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 10px;
		height: 10px;
	}
</style>