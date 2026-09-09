<template>
	<view class="img-wrap" :class="{ 'has-image': fullSrc }">
		<image
			v-if="fullSrc"
			class="img-preview"
			:src="fullSrc"
			:mode="mode"
			@tap="onTap"
		/>
		<view v-else class="img-placeholder">
			<text class="img-placeholder-text">暂无图片</text>
		</view>
		<canvas
			v-if="showCanvas"
			:id="canvasId"
			type="2d"
			class="watermark-canvas"
		></canvas>
	</view>
</template>

<script>
	import { formatCosUrl } from '@/utils/config.js'
	import { previewWithWatermark } from '@/utils/watermark.js'

	export default {
		name: 'imagePreview',
		props: {
			src: {
				type: String,
				default: ''
			},
			mode: {
				type: String,
				default: 'aspectFill'
			},
			previewList: {
				type: Array,
				default: () => []
			},
			previewable: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				showCanvas: false,
				canvasId: 'wmCanvas_' + (this._uid || Math.random().toString(36).slice(2))
			}
		},
		computed: {
			fullSrc() {
				return formatCosUrl(this.src)
			}
		},
		methods: {
			onTap(e) {
				if (!this.fullSrc) return
				if (!this.previewable) return
				e && e.stopPropagation && e.stopPropagation()

				const rawList = this.previewList.length > 0
					? this.previewList.map(i => formatCosUrl(i)).filter(Boolean)
					: [this.fullSrc]
				const rawCurrent = this.fullSrc

				this.showCanvas = true
				uni.showLoading({ title: '加载中...', mask: true })
				this._nextTick().then(() => {
					return previewWithWatermark(this.canvasId, rawList, rawCurrent, this)
				}).then(({ urls, current }) => {
					uni.hideLoading()
					this.showCanvas = false
					uni.previewImage({ urls, current })
				}).catch(() => {
					uni.hideLoading()
					this.showCanvas = false
					uni.previewImage({ urls: rawList, current: rawCurrent })
				})
			},
			_nextTick() {
				return new Promise(resolve => this.$nextTick(resolve))
			}
		}
	}
</script>

<style lang="scss" scoped>
	.img-wrap {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}

	.img-wrap.has-image::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 2;
		background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='140'%3E%3Ctext x='50%25' y='50%25' font-size='22' fill='rgba(255,255,255,0.28)' stroke='rgba(0,0,0,0.18)' stroke-width='0.8' text-anchor='middle' dominant-baseline='middle' transform='rotate(-30 100 70)' font-family='sans-serif' font-weight='bold'%3E加蜂%3C/text%3E%3C/svg%3E");
		background-repeat: repeat;
	}

	.img-preview {
		width: 100%;
		height: 100%;
		display: block;
	}

	.img-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f2f2f2;
		border: 1rpx solid #e5e5e5;
		box-sizing: border-box;
	}

	.img-placeholder-text {
		font-size: 26rpx;
		color: #bbbbbb;
	}

	.watermark-canvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 10px;
		height: 10px;
	}
</style>