<template>
	<view class="img-wrap">
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
	</view>
</template>

<script>
	import { formatCosUrl } from '@/utils/config.js'
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
				const urls = this.previewList.length > 0
					? this.previewList.map(i => formatCosUrl(i)).filter(Boolean)
					: [this.fullSrc]
				const current = this.fullSrc
				uni.previewImage({
					urls,
					current
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.img-wrap {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.img-preview {
		width: 100%;
		height: 100%;
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
</style>