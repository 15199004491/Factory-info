<template>
	<view class="page">
		<view class="module-entry">
			<view class="entry-card" @tap="onEntryTap('new')">
				<view class="entry-icon new-icon">
					<text class="icon-text">新</text>
				</view>
				<text class="entry-label">新房</text>
			</view>

			<view class="entry-card" @tap="onEntryTap('second')">
				<view class="entry-icon second-icon">
					<text class="icon-text">房</text>
				</view>
				<text class="entry-label">二手房</text>
			</view>

			<view class="entry-card" @tap="onEntryTap('rent')">
				<view class="entry-icon rent-icon">
					<text class="icon-text">租</text>
				</view>
				<text class="entry-label">租房</text>
			</view>
		</view>

		<view class="house-section-card">
			<view class="section-title">
				<text class="section-title-text">二手房推荐</text>
			</view>

			<view class="house-grid">
				<view class="house-card" v-for="(item, index) in houseList" :key="index" @tap="onHouseTap(item)">
					<view class="house-image-wrap">
						<image class="house-image" :src="item.image" mode="aspectFill" />
					</view>
					<view class="house-info">
						<text class="house-title">{{ item.title }}</text>
						<text class="house-desc">{{ item.desc }}</text>
						<text class="house-price">{{ item.price }}</text>
					</view>
				</view>
			</view>

			<view class="empty" v-if="houseList.length === 0">
				<text class="empty-text">暂无二手房源</text>
			</view>
		</view>

		<tab-bar :currentIndex="0"></tab-bar>
	</view>
</template>

<script>
	import tabBar from '@/components/tab-bar/tab-bar.vue'

	export default {
		components: {
			tabBar
		},
		data() {
			return {
				houseList: [
					{
						id: 1,
						title: '阳光花园 3室2厅',
						desc: '120㎡ · 南北通透 · 精装修',
						price: '128万',
						image: 'https://img.alicdn.com/imgextra/i3/6000000002334/O1CN01w2M5v81FmR5KjP1z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 2,
						title: '翠湖天地 2室1厅',
						desc: '89㎡ · 湖景房 · 电梯房',
						price: '95万',
						image: 'https://img.alicdn.com/imgextra/i2/6000000002334/O1CN01w2M5v91FmR5KjP2z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 3,
						title: '金色家园 4室2厅',
						desc: '160㎡ · 复式结构 · 带露台',
						price: '186万',
						image: 'https://img.alicdn.com/imgextra/i4/6000000002334/O1CN01w2M5vA1FmR5KjP3z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 4,
						title: '东方明珠 1室1厅',
						desc: '55㎡ · 单身公寓 · 地铁口',
						price: '58万',
						image: 'https://img.alicdn.com/imgextra/i1/6000000002334/O1CN01w2M5vB1FmR5KjP4z_!!600000000472-0-yinhe.jpg'
					}
				]
			}
		},
		methods: {
			onEntryTap(type) {
				if (type === 'new') {
					uni.showToast({
						title: '新房业务即将上线',
						icon: 'none'
					})
					return
				}
				if (type === 'second') {
					uni.navigateTo({
						url: '/pages/second/list'
					})
					return
				}
				if (type === 'rent') {
					uni.navigateTo({
						url: '/pages/rent/list'
					})
				}
			},
			onHouseTap(item) {
				uni.navigateTo({
					url: '/pages/second/detail?id=' + item.id
				})
			}
		}
	}
</script>

<style>
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
	}

	.module-entry {
		display: flex;
		justify-content: space-between;
		padding: 30rpx 30rpx 40rpx;
		background: linear-gradient(180deg, #4a90e2 0%, #357abd 100%);
	}

	.entry-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 200rpx;
		height: 180rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		position: relative;
		transition: transform 0.2s;
	}

	.entry-card:active {
		transform: scale(0.95);
	}

	.entry-icon {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
	}

	.new-icon {
		background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
	}

	.second-icon {
		background: linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%);
	}

	.rent-icon {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
	}

	.icon-text {
		font-size: 40rpx;
		color: #ffffff;
		font-weight: bold;
	}

	.entry-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}


	.house-section-card {
		margin: 20rpx 24rpx 0;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
		overflow: hidden;
	}

	.section-title {
		padding: 30rpx 30rpx 20rpx;
		display: flex;
		align-items: center;
	}

	.section-title-text {
		font-size: 28rpx;
		font-weight: normal;
		color: #333333;
	}

	.house-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 0 24rpx;
		justify-content: space-between;
	}

	.house-card {
		width: calc((100% - 24rpx) / 2);
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.house-image-wrap {
		width: 100%;
		height: 240rpx;
		overflow: hidden;
	}

	.house-image {
		width: 100%;
		height: 100%;
	}

	.house-info {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.house-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.house-desc {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 12rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.house-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}
</style>