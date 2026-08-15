<template>
	<view class="page">
		<view class="module-entry">
			<view class="entry-card" @tap="onEntryTap('new')">
				<view class="entry-icon new-icon">
					<text class="icon-text">新</text>
				</view>
				<text class="entry-label">新房</text>
			</view>

			<view class="entry-divider"></view>

			<view class="entry-card" @tap="onEntryTap('second')">
				<view class="entry-icon second-icon">
					<text class="icon-text">房</text>
				</view>
				<text class="entry-label">二手房</text>
			</view>

			<view class="entry-divider"></view>

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
				<view class="house-card" v-for="(item, index) in houseList" :key="item.id || index" @tap="onHouseTap(item)">
					<view class="house-image-wrap">
						<image-placeholder :src="item.second_image" mode="aspectFill" />
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
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
	import { secondHouseApi } from '@/utils/request.js'

	export default {
		components: {
			tabBar,
			imagePlaceholder
		},
		data() {
			return {
				houseList: []
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					const data = await secondHouseApi.getList({
						keyword: '',
						region: '',
						page: 1,
						limit: 6
					})
					this.houseList = this.formatList(data.list || [])
				} catch (e) {
					this.houseList = []
				}
			},
			formatList(list) {
				return (list || []).map(item => ({
					id: item.Id,
					title: item.title,
					desc: `${item.name || ''}· ${item.shape || ''}· ${item.acreage || ''}㎡ `,
					price: item.price + '万',
					second_image: item.second_image
				}))
			},
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
		align-items: center;
		margin: 30rpx 30rpx 0;
		padding: 30rpx 0;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	}

	.entry-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		transition: opacity 0.2s ease;
	}

	.entry-card:active {
		opacity: 0.7;
	}

	.entry-divider {
		width: 1rpx;
		height: 60rpx;
		background-color: #f2f2f2;
	}

	.entry-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
	}

	.new-icon {
		background-color: #ffe8e0;
	}

	.second-icon {
		background-color: #e0edff;
	}

	.rent-icon {
		background-color: #dff5ea;
	}

	.icon-text {
		font-size: 38rpx;
		font-weight: bold;
	}

	.new-icon .icon-text {
		color: #ff6b6b;
	}

	.second-icon .icon-text {
		color: #2f80ed;
	}

	.rent-icon .icon-text {
		color: #10b981;
	}

	.entry-label {
		font-size: 26rpx;
		color: #555555;
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