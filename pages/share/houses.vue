<template>
	<view class="page">
		<view class="custom-nav">
			<view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-bar" :style="{ height: navBarHeight + 'px' }">
				<text class="nav-title">专属房源</text>
			</view>
		</view>

		<view class="filter-bar">
			<view class="filter-tabs">
				<view class="filter-tab" :class="{ active: filterType === 'second' }" @tap="onFilterType('second')">
					<text>二手房</text>
				</view>
				<view class="filter-tab" :class="{ active: filterType === 'rent' }" @tap="onFilterType('rent')">
					<text>租房</text>
				</view>
			</view>
		</view>

		<view class="list-area">
			<view class="result-count" v-if="displayList.length > 0">
				<text class="result-count-text">共 {{ displayList.length }} 套</text>
			</view>

			<view class="house-grid" v-if="displayList.length > 0">
				<view class="house-card" v-for="(item, index) in displayList" :key="item.id + '-' + index" @tap="onHouseTap(item)">
					<view class="house-image-wrap">
						<image-placeholder :src="item.image" mode="aspectFill" />
						<text class="house-type-badge" :class="item.type === 'second' ? 'badge-second' : 'badge-rent'">{{ item.typeLabel }}</text>
					</view>
					<view class="house-info">
						<text class="house-title">{{ item.title }}</text>
						<text class="house-desc">{{ item.desc }}</text>
						<text class="house-price">{{ item.priceText }}</text>
					</view>
				</view>
			</view>

			<view class="no-more" v-if="displayList.length > 0">
				<text class="no-more-text">没有更多数据了</text>
			</view>

			<view class="empty" v-if="!loading && displayList.length === 0">
				<text class="empty-text">暂无房源</text>
			</view>

			<view class="list-bottom-space"></view>
		</view>
	</view>
</template>

<script>
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
	import { secondHouseApi, rentApi } from '@/utils/request.js'

	export default {
		components: { imagePlaceholder },
		data() {
			return {
				statusBarHeight: 20,
				navBarHeight: 44,
				openId: '',
				allSecond: [],
				allRent: [],
				filterType: 'second',
				loaded: { second: false, rent: false },
				loading: false
			}
		},
		created() {
			var sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight || 20
			this.navBarHeight = sys.platform === 'android' ? 48 : 44
		},
		computed: {
			displayList() {
				var self = this
				var wrap = function(list, type, label) {
					return list.map(function(item) {
						return Object.assign({}, item, { type: type, typeLabel: label })
					})
				}
				if (this.filterType === 'second') return wrap(this.allSecond, 'second', '二手房')
				if (this.filterType === 'rent') return wrap(this.allRent, 'rent', '租房')
				return wrap(this.allSecond, 'second', '二手房').concat(wrap(this.allRent, 'rent', '租房'))
			}
		},
		watch: {
			filterType(val) {
				this.ensureLoad(val)
			}
		},
		onLoad(options) {
			if (options && options.scene) {
				this.openId = decodeURIComponent(options.scene)
			} else if (options && options.open_id) {
				this.openId = decodeURIComponent(options.open_id)
			}
			if (this.openId) {
				this.ensureLoad(this.filterType)
			}
		},
		methods: {
			ensureLoad(type) {
				if (!this.openId || this.loaded[type] || this.loading) return
				this.loadType(type)
			},
			async loadType(type) {
				this.loading = true
				try {
					var data = null
					if (type === 'second') {
						data = await secondHouseApi.houseListByOpenid(this.openId, { page: 1, limit: 100 })
						this.allSecond = this.formatSecond(data)
					} else if (type === 'rent') {
						data = await rentApi.rentListByOpenid(this.openId, { page: 1, limit: 100 })
						this.allRent = this.formatRent(data)
					}
					this.loaded[type] = true
				} catch (e) {
				} finally {
					this.loading = false
				}
			},
			formatSecond(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(function(item) {
					return {
						id: item.Id || item.id,
						title: item.title,
						desc: (item.name || '') + ' · ' + (item.shape || '') + ' · ' + (item.acreage || '') + '㎡',
						priceText: (item.price || '') + '万',
						image: item.second_image || item.image || item.img || ''
					}
				})
			},
			formatRent(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(function(item) {
					return {
						id: item.Id || item.id,
						title: item.title,
						desc: (item.name || item.community || '') + ' · ' + (item.acreage || '') + '㎡ · ' + (item.tag_type === 'shared' ? '合租' : '整租'),
						priceText: (item.price || '') + '元/月',
						image: item.rent_image || item.image || item.img || ''
					}
				})
			},
			onFilterType(type) {
				this.filterType = type
			},
			onHouseTap(item) {
				var url = item.type === 'second'
					? '/pages/second/detail?id=' + item.id
					: '/pages/rent/detail?id=' + item.id
				uni.navigateTo({ url: url })
			}
		}
	}
</script>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.custom-nav {
		position: relative;
		z-index: 10;
		background-color: #fff;
	}

	.nav-status {
		width: 100%;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
	}

	.filter-bar {
		background-color: #fff;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.filter-tabs {
		display: flex;
		padding: 0 24rpx;
		gap: 24rpx;
	}

	.filter-tab {
		padding: 14rpx 28rpx;
		border-radius: 32rpx;
		background-color: #f5f5f5;
	}

	.filter-tab text {
		font-size: 26rpx;
		color: #666;
	}

	.filter-tab.active {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.filter-tab.active text {
		color: #fff;
		font-weight: 500;
	}

	.list-area {
		flex: 1;
		height: 0;
		overflow-y: auto;
	}

	.list-bottom-space {
		height: 40rpx;
	}

	.result-count {
		padding: 20rpx 24rpx 10rpx;
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
		position: relative;
	}

	.house-type-badge {
		position: absolute;
		top: 12rpx;
		left: 12rpx;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		color: #fff;
	}

	.badge-second {
		background-color: rgba(86, 204, 242, 0.9);
	}

	.badge-rent {
		background-color: rgba(67, 233, 123, 0.9);
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
		font-size: 26rpx;
		color: #999;
	}

	.no-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 32rpx 0 16rpx;
	}

	.no-more-text {
		font-size: 24rpx;
		color: #bbb;
	}
</style>