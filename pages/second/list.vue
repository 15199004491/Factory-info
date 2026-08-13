<template>
	<view class="page">
		<view class="search-bar">
			<view class="region-wrap" @tap="openRegionPicker">
				<text class="region-text">{{ currentRegion }}</text>
				<u-icon name="arrow-down" size="14" color="#666"></u-icon>
			</view>
			<view class="search-input-wrap">
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索小区或商圈"
					placeholder-class="search-placeholder"
					confirm-type="search"
					@confirm="onSearch"
				/>
			</view>
			<view class="search-btn" @tap="onSearch">
				<text class="search-btn-text">搜索</text>
			</view>
		</view>

		<view class="result-count" v-if="houseList.length > 0">
			<text class="result-count-text">共找到 {{ houseList.length }} 套二手房</text>
		</view>

		<view class="house-grid">
			<view
				class="house-card"
				v-for="(item, index) in houseList"
				:key="index"
				@tap="onHouseTap(item)"
			>
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
			<text class="empty-text">暂无符合条件的二手房源</text>
		</view>

		<region-picker
			:visible="showRegionPicker"
			@confirm="onRegionConfirm"
			@cancel="onRegionCancel"
		/>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'
	import { secondHouseApi } from '@/utils/request.js'

	export default {
		components: {
			uIcon,
			regionPicker
		},
		data() {
			return {
				keyword: '',
				showRegionPicker: false,
				currentRegion: '全部',
				houseList: []
			}
		},
		onLoad() {
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					const data = await secondHouseApi.getList({
						keyword: this.keyword,
						region: this.currentRegion === '全部' ? '' : this.currentRegion
					})
					this.houseList = (data || []).map(item => ({
						id: item.id,
						title: item.title,
						desc: `${item.area || ''}㎡ · ${item.house_type || ''}`,
						price: item.price + '万',
						image: Array.isArray(item.images) && item.images.length ? item.images[0] : ''
					}))
				} catch (e) {
					this.houseList = []
				}
			},
			openRegionPicker() {
				this.showRegionPicker = true
			},
			onRegionConfirm(label) {
				this.currentRegion = label
				this.showRegionPicker = false
				this.loadList()
			},
			onRegionCancel() {
				this.showRegionPicker = false
			},
			onSearch() {
				this.loadList()
			},
			onHouseTap(item) {
				uni.navigateTo({
					url: '/pages/second/detail?id=' + item.id
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background-color: #fff;
		gap: 16rpx;
		position: relative;
	}

	.region-wrap {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding: 8rpx 0;
	}

	.region-text {
		font-size: 28rpx;
		color: #333;
		margin-right: 6rpx;
	}

	.search-input-wrap {
		flex: 1;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
	}

	.search-input {
		flex: 1;
		height: 72rpx;
		font-size: 28rpx;
		color: #333;
	}

	.search-placeholder {
		color: #999;
	}

	.search-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 14rpx 28rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.search-btn-text {
		font-size: 28rpx;
		color: #fff;
	}

	.result-count {
		padding: 20rpx 30rpx 10rpx;
	}

	.result-count-text {
		font-size: 24rpx;
		color: #999;
	}

	.house-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 10rpx 24rpx 0;
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
		padding: 120rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>