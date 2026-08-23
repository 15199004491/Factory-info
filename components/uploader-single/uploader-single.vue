<template>
	<view class="uploader-single">
		<view class="uploader-inner">
			<view class="preview-box" :class="shape" v-if="currentSrc" @tap="onPreview">
				<view class="preview-image-wrap">
					<image v-if="isLocalSrc" class="preview-image" :src="currentSrc" mode="aspectFill" />
					<image-placeholder v-else class="preview-image" :src="currentSrc" mode="aspectFill" />
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
	</view>
</template>

<script>
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
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
				currentSrc: this.value || ''
			}
		},
		computed: {
			isLocalSrc() {
				const s = this.currentSrc || ''
				if (!s) return false
				if (/^(wxfile:|file:|blob:|wxLocalResource:|http:\/\/tmp\/|https:\/\/tmp\/)/i.test(s)) return true
				if (s.indexOf('tmp_') === 0 || s.indexOf('/tmp/') === 0 || s.indexOf('tmp/') === 0) return true
				if (/^https?:\/\//i.test(s)) return false
				return false
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
								if (!ok) return
							} catch (e) {
								uni.hideLoading()
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
				if (!this.isLocalSrc) {
					if (previewSrc.indexOf('http://') !== 0 && previewSrc.indexOf('https://') !== 0) {
						const tmp = previewSrc.charAt(0) === '/' ? previewSrc.substring(1) : previewSrc
						previewSrc = 'https://house-factory-1468042561.cos.ap-shanghai.myqcloud.com/' + tmp
					}
				}
				uni.previewImage({
					urls: [previewSrc],
					current: previewSrc
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
		z-index: 2;
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
</style>