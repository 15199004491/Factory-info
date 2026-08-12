<template>
	<view class="content">
		<view class="menu-list">
			<view class="menu-item" v-for="(item, index) in menuList" :key="index" @tap="onMenuTap(index)">
				<text class="menu-text">{{ item }}</text>
				<text class="menu-arrow">›</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menuList: ['加工厂', '去发布', '已发布', '联系我们']
			}
		},
		methods: {
			onMenuTap(index) {
				const item = this.menuList[index]
				if (item === '加工厂') {
					uni.navigateTo({
						url: '/pages/factory/manage'
					})
				} else {
					uni.showToast({
						title: item + ' 即将上线',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style>
	.content {
		padding: 24rpx;
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	.menu-list {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-top: 24rpx;
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

	.menu-arrow {
		font-size: 40rpx;
		color: #ccc;
		font-weight: 300;
	}
</style>