<template>
	<view class="content">
		<view class="user-info">
			<view class="avatar">
				<u-icon name="account" size="60" color="#fff"></u-icon>
			</view>
			<text class="username">未登录</text>
		</view>
		<view class="menu-list">
			<view class="menu-item" v-for="(item, index) in menuList" :key="index">
				<text class="menu-text">{{ item }}</text>
				<u-icon name="arrow-right" size="14" color="#999"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menuList: ['我的订单', '收藏夹', '设置', '关于我们']
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

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}

	.username {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.menu-list {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-text {
		font-size: 30rpx;
		color: #333;
	}
</style>