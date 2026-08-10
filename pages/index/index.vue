<template>
	<view class="content">
		<view class="header">
			<text class="title">首页</text>
		</view>
		<view class="section">
			<u-button type="primary">欢迎使用</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		}
	}
</script>

<style>
	.content {
		padding: 40rpx;
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	.header {
		margin-bottom: 40rpx;
	}

	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
	}

	.section {
		margin-top: 20rpx;
	}
</style>