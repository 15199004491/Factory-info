<template>
	<view class="page">
		<view class="filter-bar">
			<view class="filter-item" :class="{ active: filterState === 'all' }" @tap="filterState = 'all'">
				<text>全部</text>
				<text class="filter-count" v-if="allCount > 0">({{ allCount }})</text>
			</view>
			<view class="filter-item" :class="{ active: filterState === 'unview' }" @tap="filterState = 'unview'">
				<text>未查看</text>
				<text class="filter-count" v-if="unviewCount > 0">({{ unviewCount }})</text>
			</view>
			<view class="filter-item" :class="{ active: filterState === 'viewed' }" @tap="filterState = 'viewed'">
				<text>已查看</text>
				<text class="filter-count" v-if="viewedCount > 0">({{ viewedCount }})</text>
			</view>
		</view>

		<scroll-view class="scroll-area" scroll-y>
			<view class="list-container">
				<view class="empty" v-if="filteredList.length === 0 && loaded">
					<text class="empty-icon">📋</text>
					<text class="empty-text">{{ emptyText }}</text>
				</view>

				<view class="list-item" :class="{ 'item-unview': item.sourceState === 0 }" v-for="(item, index) in filteredList" :key="item.id" @tap="onViewDetail(item)">
					<view class="item-main">
						<view class="item-header">
							<text class="item-title">{{ item.title }}</text>
							<text class="item-type-tag" :class="getTypeClass(item.type)">{{ getTypeLabel(item.type) }}</text>
						</view>

						<view class="item-tags" v-if="item.type === 'rent'">
							<text class="item-sub-tag" :class="item.tagType === 'shared' ? 'tag-shared' : 'tag-entire'">{{ item.tagType === 'shared' ? '合租' : '整租' }}</text>
						</view>

						<text class="item-desc" v-if="item.community || item.region">{{ item.community }} {{ item.region }}</text>
						<text class="item-region" v-if="item.houseType || item.area">{{ item.houseType }} {{ item.area }}</text>

						<view class="item-footer">
							<text class="item-price">{{ getPriceText(item) }}</text>
							<text class="item-time">{{ item.createTime }}</text>
						</view>
					</view>
					<view class="item-actions">
						<text class="status-tag" :class="item.sourceState === 0 ? 'status-unview' : 'status-viewed'">
							{{ item.sourceState === 0 ? '未查看' : '已查看' }}
						</text>
					</view>
				</view>

				<view class="no-more" v-if="filteredList.length > 0 && loaded">
					<text class="no-more-text">没有更多了</text>
				</view>
			</view>

			<safe-bottom :height="120"></safe-bottom>
		</scroll-view>
	</view>
</template>

<script>
	import { secondHouseApi, getOpenid, FULL_LIST_LIMIT } from '@/utils/request.js'
	import { formatDate } from '@/utils/date.js'

	export default {
		components: {
		},
		data() {
			return {
				list: [],
				loaded: false,
				filterState: 'all'
			}
		},
		computed: {
			allCount() {
				return this.list.length
			},
			unviewCount() {
				return this.list.filter(i => i.sourceState === 0).length
			},
			viewedCount() {
				return this.list.filter(i => i.sourceState === 1).length
			},
			filteredList() {
				if (this.filterState === 'unview') return this.list.filter(i => i.sourceState === 0)
				if (this.filterState === 'viewed') return this.list.filter(i => i.sourceState === 1)
				return this.list
			},
			emptyText() {
				if (this.filterState === 'unview') return '暂无未查看的房源'
				if (this.filterState === 'viewed') return '暂无已查看的房源'
				return '还没有用户登记房源'
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			async loadList() {
				var openId = getOpenid()
				try {
					var data = await secondHouseApi.exclusiveList(openId, { page: 1, limit: FULL_LIST_LIMIT }).catch(() => null)
					var secondList = (data && data.second_house) ? data.second_house : []
					var rentList = (data && data.rent) ? data.rent : []
					this.list = this.formatSecondList(secondList).concat(this.formatRentList(rentList))
				} catch (e) {}
				this.loaded = true
			},
			formatSecondList(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(item => ({
					id: item.Id || item.id,
					type: 'second',
					title: item.title,
					community: item.name || item.community || '',
					region: item.region || item.area || '',
					houseType: item.shape || item.houseType || '',
					area: (item.acreage || item.area || '') + '㎡',
					floor: item.floor || '',
					orientation: item.orientation || '',
					decoration: item.decoration || '',
					price: item.price,
					description: item.explain || item.description || '',
					createTime: formatDate(item.update_time || item.create_time || item.createTime || 0),
					sourceState: parseInt(item.source_state || 0),
					sourceOpenId: item.source_open_id || ''
				}))
			},
			formatRentList(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(item => ({
					id: item.Id || item.id,
					type: 'rent',
					title: item.title,
					community: item.community || item.name || '',
					region: item.region || item.area || '',
					houseType: item.pay_type || '',
					area: (item.acreage || '') + '㎡',
					floor: item.floor || '',
					payment: item.payment || '',
					price: item.price,
					tagType: item.tag_type || item.tagType || 'entire',
					description: item.description || item.explain || '',
					createTime: formatDate(item.update_time || item.create_time || item.createTime || 0),
					sourceState: parseInt(item.source_state || 0),
					sourceOpenId: item.source_open_id || ''
				}))
			},
			getTypeLabel(type) {
				if (type === 'rent') return '租房'
				return '二手房'
			},
			getTypeClass(type) {
				if (type === 'rent') return 'type-rent'
				return 'type-second'
			},
			getPriceText(item) {
				if (item.type === 'second') return (item.price || '') + '万'
				if (item.type === 'rent') return (item.price || '') + '元/月'
				return ''
			},
			onViewDetail(item) {
				var url = '/pages/second/detail?id=' + item.id
				if (item.type === 'rent') url = '/pages/rent/detail?id=' + item.id
				if (item.sourceOpenId && item.sourceState === 0) {
					var houseTab = item.type === 'rent' ? 2 : 1
					secondHouseApi.processExclusive(item.sourceOpenId, houseTab).then(() => {
						item.sourceState = 1
					}).catch(() => {})
				}
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

	.scroll-area {
		flex: 1;
		height: 0;
	}

	.list-container {
		padding: 0 24rpx;
	}

	.list-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.list-item.item-unview {
		border: 2rpx solid #52c41a;
		box-shadow: 0 2rpx 12rpx rgba(82, 196, 26, 0.12);
	}

	.item-main {
		margin-bottom: 20rpx;
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 10rpx;
	}

	.item-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-type-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.type-second {
		color: #56ccf2;
		background-color: rgba(86, 204, 242, 0.15);
	}

	.type-rent {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.15);
	}

	.item-tags {
		margin-bottom: 8rpx;
	}

	.item-sub-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
	}

	.tag-entire {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.1);
	}

	.tag-shared {
		color: #ff9a56;
		background-color: rgba(255, 154, 86, 0.1);
	}

	.item-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 8rpx;
	}

	.item-region {
		font-size: 24rpx;
		color: #999;
		display: block;
		margin-bottom: 12rpx;
	}

	.item-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-price {
		font-size: 34rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.item-time {
		font-size: 22rpx;
		color: #bbb;
	}

	.item-actions {
		display: flex;
		gap: 16rpx;
		justify-content: flex-end;
		padding-top: 20rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.status-tag {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}

	.status-unview {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.status-viewed {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 160rpx 0;
	}

	.empty-icon {
		font-size: 80rpx;
		margin-bottom: 24rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.no-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0 20rpx;
	}

	.no-more-text {
		font-size: 24rpx;
		color: #bbb;
	}

	.filter-bar {
		display: flex;
		background-color: #fff;
		padding: 0 24rpx;
		margin: 24rpx 24rpx 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		flex-shrink: 0;
	}

	.filter-item {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
	}

	.filter-item text {
		font-size: 28rpx;
		color: #999;
		transition: all 0.2s;
	}

	.filter-item.active text:first-child {
		color: #333;
		font-weight: 600;
		font-size: 30rpx;
	}

	.filter-count {
		font-size: 24rpx !important;
		color: #bbb !important;
		font-weight: normal !important;
	}

	.filter-item.active .filter-count {
		color: #3c9cff !important;
	}

	.filter-item.active::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 8rpx;
		transform: translateX(-50%);
		width: 48rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background: linear-gradient(90deg, #3c9cff, #5ac8fa);
	}
</style>