<template>
	<view class="img-wrap">
		<image
			v-if="src"
			class="img-preview"
			:src="src"
			:mode="mode"
			@tap="onTap"
		/>
		<view v-else class="img-placeholder">
			<text class="img-placeholder-text">暂无图片</text>
		</view>
	</view>
</template>

<script>
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
		methods: {
			onTap(e) {
				if (!this.src) return
				if (!this.previewable) return
				e && e.stopPropagation && e.stopPropagation()
				const urls = this.previewList.length > 0 ? this.previewList : [this.src]
				const current = this.src
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