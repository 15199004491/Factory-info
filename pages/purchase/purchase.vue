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
					placeholder="搜索收购信息"
					placeholder-class="search-placeholder"
					confirm-type="search"
					@confirm="onSearch"
				/>
			</view>
			<view class="search-btn" @tap="onSearch">
				<text class="search-btn-text">搜索</text>
			</view>
		</view>

		<view class="result-count" v-if="total > 0">
			<text class="result-count-text">共找到 {{ total }} 条收购信息</text>
		</view>

		<view class="purchase-list">
			<view
				class="purchase-card"
				v-for="(item, index) in purchaseList"
				:key="item.id || index"
				@tap="onPurchaseTap(item)"
			>
				<view class="card-header">
					<text class="card-title">{{ item.title }}</text>
					<text class="card-time">{{ item.time }}</text>
				</view>
				<view class="card-tags">
					<text class="cat-tag" v-for="(cat, catIdx) in item.categories" :key="catIdx">{{ cat }}</text>
				</view>
				<view class="card-footer">
					<view class="region-item">
						<u-icon name="map" size="12" color="#999"></u-icon>
						<text class="region-value">{{ item.region }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="load-more" v-if="purchaseList.length > 0">
			<text v-if="loading" class="load-more-text">加载中...</text>
			<text v-else-if="noMore" class="load-more-text">没有更多数据了</text>
			<text v-else class="load-more-text" @tap="loadMore">加载更多</text>
		</view>

		<view class="empty" v-if="!loading && purchaseList.length === 0">
			<text class="empty-text">暂无收购信息</text>
		</view>

		<view class="fab-btn" @tap="onPublish">
			<u-icon name="plus" size="24" color="#fff"></u-icon>
		</view>

		<region-picker
			:visible="showRegionPicker"
			@confirm="onRegionConfirm"
			@cancel="onRegionCancel"
		/>

		<tab-bar :currentIndex="1"></tab-bar>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import tabBar from '@/components/tab-bar/tab-bar.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'
	import { purchaseApi } from '@/utils/request.js'
	import { formatDate } from '@/utils/date.js'

	export default {
		components: {
			uIcon,
			tabBar,
			regionPicker
		},
		data() {
			return {
				keyword: '',
				currentRegion: '全部',
				currentCategory: '',
				showRegionPicker: false,
				categoryOptions: ['粮食', '蔬菜', '水果', '牲畜', '水产', '油料', '棉花', '茶叶', '其他'],
				purchaseList: [],
				page: 1,
				limit: 20,
				total: 0,
				loading: false,
				noMore: false
			}
		},
		onLoad() {
			this.loadList()
		},
		onShow() {
			this.loadList()
		},
		onReachBottom() {
			if (!this.noMore && !this.loading && this.purchaseList.length > 0) {
				this.loadMore()
			}
		},
		methods: {
			async loadList() {
				this.loading = true
				this.noMore = false
				this.page = 1
				try {
					const mockList = this.getMockList()
					const filtered = mockList.filter(item => {
						if (this.keyword && item.title.indexOf(this.keyword) === -1 && item.region.indexOf(this.keyword) === -1) return false
						if (this.currentCategory && item.category !== this.currentCategory) return false
						if (this.currentRegion !== '全部' && item.region !== this.currentRegion) return false
						return true
					})
					this.total = filtered.length
					this.purchaseList = this.formatList(filtered.slice(0, this.limit))
					this.checkNoMore()
				} catch (e) {
					this.purchaseList = []
					this.total = 0
					this.noMore = true
				} finally {
					this.loading = false
				}
			},
			async loadMore() {
				if (this.loading || this.noMore) return
				this.loading = true
				try {
					this.page++
					const mockList = this.getMockList()
					const filtered = mockList.filter(item => {
						if (this.keyword && item.title.indexOf(this.keyword) === -1 && item.region.indexOf(this.keyword) === -1) return false
						if (this.currentCategory && item.category !== this.currentCategory) return false
						if (this.currentRegion !== '全部' && item.region !== this.currentRegion) return false
						return true
					})
					this.total = filtered.length
					const start = (this.page - 1) * this.limit
					this.purchaseList = this.purchaseList.concat(this.formatList(filtered.slice(start, start + this.limit)))
					this.checkNoMore()
				} catch (e) {
					this.page--
				} finally {
					this.loading = false
				}
			},
			getMockList() {
				return [
					{ id: 1, title: '大量收购玉米 小麦', category: '粮食', categories: ['玉米', '小麦'], quantity: '5000斤', expected_price: '1.25元/斤', region: '兵团 塔城地区 133团', create_time: 1755360000 },
					{ id: 2, title: '收购西红柿 黄瓜', category: '蔬菜', categories: ['西红柿', '黄瓜'], quantity: '2000斤', expected_price: '2.80元/斤', region: '兵团 石河子市 143团', create_time: 1755446400 },
					{ id: 3, title: '收购苹果 梨 水果', category: '水果', categories: ['苹果', '梨'], quantity: '3000斤', expected_price: '3.50元/斤', region: '兵团 阿克苏地区 16团', create_time: 1755273600 },
					{ id: 4, title: '生猪收购 活猪', category: '牲畜', categories: ['生猪'], quantity: '100头', expected_price: '15.00元/斤', region: '兵团 塔城地区 133团', create_time: 1755532800 },
					{ id: 5, title: '淡水鱼 河虾收购', category: '水产', categories: ['淡水鱼', '河虾'], quantity: '1000斤', expected_price: '8.00元/斤', region: '兵团 博尔塔拉蒙古自治州 精河', create_time: 1755187200 },
					{ id: 6, title: '大豆 花生 油料', category: '油料', categories: ['大豆', '花生'], quantity: '3000斤', expected_price: '4.20元/斤', region: '兵团 奎屯市 123团', create_time: 1755100800 },
					{ id: 7, title: '棉花收购 籽棉', category: '棉花', categories: ['棉花', '籽棉'], quantity: '8000斤', expected_price: '6.50元/斤', region: '兵团 阿克苏地区 13团', create_time: 1755446400 },
					{ id: 8, title: '毛尖茶 绿茶收购', category: '茶叶', categories: ['毛尖茶', '绿茶'], quantity: '500斤', expected_price: '80.00元/斤', region: '兵团 伊犁地区 64团', create_time: 1755360000 },
					{ id: 9, title: '鸡蛋 鸭蛋 收购', category: '其他', categories: ['鸡蛋', '鸭蛋'], quantity: '2000斤', expected_price: '5.50元/斤', region: '兵团 喀什地区 41团', create_time: 1755532800 },
					{ id: 10, title: '土豆 红薯 收购', category: '粮食', categories: ['土豆', '红薯'], quantity: '4000斤', expected_price: '1.80元/斤', region: '兵团 塔城地区 133团', create_time: 1755014400 },
					{ id: 11, title: '白菜 萝卜 收购', category: '蔬菜', categories: ['白菜', '萝卜'], quantity: '3500斤', expected_price: '0.90元/斤', region: '兵团 石河子市 147团', create_time: 1754928000 },
					{ id: 12, title: '橙子 橘子 收购', category: '水果', categories: ['橙子', '橘子'], quantity: '2500斤', expected_price: '2.20元/斤', region: '兵团 阿拉尔市 1团', create_time: 1755446400 }
				]
			},
			formatList(list) {
				return (list || []).map(item => ({
					id: item.Id || item.id,
					title: item.title,
					category: item.category || '其他',
					categories: item.categories || [item.category || '其他'],
					quantity: item.quantity || '',
					expectedPrice: item.expected_price || item.price || '',
					region: item.region || item.area || '',
					time: formatDate(item.create_time || item.createTime || item.createtime || 0)
				}))
			},
			checkNoMore() {
				if (this.purchaseList.length >= this.total || this.purchaseList.length < this.limit) {
					this.noMore = true
				}
			},
			selectCategory(cat) {
				this.currentCategory = cat
				this.loadList()
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
			onPurchaseTap(item) {
				uni.navigateTo({
					url: '/pages/purchase/detail?id=' + item.id
				})
			},
			onPublish() {
				uni.navigateTo({
					url: '/pages/publish/purchase'
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
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

	.filter-bar {
		background-color: #fff;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.filter-scroll {
		white-space: nowrap;
		padding: 0 24rpx;
	}

	.filter-item {
		display: inline-block;
		padding: 10rpx 24rpx;
		margin-right: 16rpx;
		background-color: #f5f5f5;
		border-radius: 30rpx;
	}

	.filter-item.active {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.filter-text {
		font-size: 26rpx;
		color: #666;
	}

	.filter-item.active .filter-text {
		color: #fff;
	}

	.result-count {
		padding: 20rpx 30rpx 10rpx;
	}

	.result-count-text {
		font-size: 24rpx;
		color: #999;
	}

	.purchase-list {
		padding: 10rpx 24rpx 0;
	}

	.purchase-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-time {
		font-size: 22rpx;
		color: #999;
		flex-shrink: 0;
		margin-left: 16rpx;
	}

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.cat-tag {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		background: linear-gradient(135deg, #52c41a, #389e0d);
		color: #fff;
		border-radius: 6rpx;
	}

	.card-footer {
		padding-top: 16rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.region-item {
		display: flex;
		align-items: center;
	}

	.region-value {
		font-size: 24rpx;
		color: #999;
		margin-left: 6rpx;
	}

	.load-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24rpx 0 40rpx;
	}

	.load-more-text {
		font-size: 26rpx;
		color: #999;
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

	.fab-btn {
		position: fixed;
		right: 40rpx;
		bottom: calc(160rpx + env(safe-area-inset-bottom));
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.4);
		z-index: 100;
	}
</style>