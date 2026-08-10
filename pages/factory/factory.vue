<template>
	<view class="content">
		<view class="header">
			<text class="title">加工厂</text>
		</view>
		<view class="factory-list">
			<view class="factory-item" v-for="(item, index) in factoryList" :key="index">
				<text class="factory-name">{{ item.name }}</text>
				<text class="factory-desc">{{ item.desc }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				factoryList: [
					{ name: '加工厂A', desc: '金属加工、零部件生产' },
					{ name: '加工厂B', desc: '塑料制品、注塑成型' },
					{ name: '加工厂C', desc: '精密机械、数控加工' }
				]
			}
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

	.factory-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.factory-item {
		padding: 30rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.factory-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.factory-desc {
		font-size: 26rpx;
		color: #888;
	}
</style>