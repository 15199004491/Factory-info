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
					:maxlength="20"
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
					<text class="cat-tag" v-for="(cat, catIdx) in item.categories" :key="catIdx">{{ cat.name || cat }}</text>
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
			:current="currentRegion"
			:showAll="true"
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
	import { auth } from '@/utils/auth.js'

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
					const data = await purchaseApi.purchaseList({
						keyword: this.keyword,
						region: this.currentRegion === '全部' ? '' : this.currentRegion,
						page: this.page,
						limit: this.limit
					})
					this.total = data.total || 0
					this.purchaseList = this.formatList(data.list || [])
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
					const data = await purchaseApi.purchaseList({
						keyword: this.keyword,
						region: this.currentRegion === '全部' ? '' : this.currentRegion,
						page: this.page,
						limit: this.limit
					})
					this.total = data.total || this.total
					this.purchaseList = this.purchaseList.concat(this.formatList(data.list || []))
					this.checkNoMore()
				} catch (e) {
					this.page--
				} finally {
					this.loading = false
				}
			},
			formatList(list) {
				return (list || []).map(item => {
					let categories = item.categories || []
					if (categories.length && typeof categories[0] === 'string') {
						categories = categories.map(name => ({ name }))
					}
					if (!categories.length && item.items) {
						categories = item.items.map(i => ({ name: i.name }))
					}
					return {
						id: item.Id || item.id,
						title: item.title,
						category: item.category || '其他',
						categories,
						quantity: item.quantity || '',
						expectedPrice: item.expected_price || item.price || '',
						region: item.region || item.area || '',
						time: formatDate(item.create_time || item.createTime || item.createtime || 0)
					}
				})
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
				if (!auth.requireAuth()) return
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