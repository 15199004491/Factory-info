<template>
	<view class="safe-bottom" :style="{ height: height + 'rpx' }"></view>
</template>

<script>
	export default {
		props: {
			height: {
				type: Number,
				default: 180
			}
		}
	}
</script>

<style lang="scss">
	.safe-bottom {
		width: 100%;
		flex-shrink: 0;
	}
</style>