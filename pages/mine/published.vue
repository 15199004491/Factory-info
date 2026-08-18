<template>
	<view class="page">
		<view class="tab-bar" v-if="!filterType">
			<view class="tab-item" :class="{ active: activeTab === 'purchase' }" @tap="activeTab = 'purchase'">
				<text>个人收购</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'second' }" @tap="activeTab = 'second'">
				<text>二手房</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'rent' }" @tap="activeTab = 'rent'">
				<text>租房</text>
			</view>
		</view>

		<view class="list-container">
			<view class="empty" v-if="filteredList.length === 0">
				<text class="empty-text">暂无发布的信息</text>
			</view>

			<view class="list-item" v-for="(item, index) in filteredList" :key="item.id">
				<view class="item-main">
					<view class="item-header">
						<text class="item-title">{{ item.title }}</text>
						<text class="item-type-tag" :class="getTypeClass(item.type)">{{ getTypeLabel(item.type) }}</text>
					</view>

					<view class="item-tags" v-if="item.type === 'rent'">
						<text class="item-sub-tag" :class="item.tagType === 'shared' ? 'tag-shared' : 'tag-entire'">{{ item.tagType === 'shared' ? '合租' : '整租' }}</text>
					</view>

					<block v-if="item.type === 'purchase'">
						<view class="item-categories" v-if="item.categories && item.categories.length">
							<text class="cat-tag" v-for="(cat, ci) in item.categories" :key="ci">{{ cat }}</text>
						</view>
						<text class="item-region" v-if="item.region">地点：{{ item.region }}</text>
					</block>

					<block v-else>
						<text class="item-desc">{{ item.community }} · {{ item.houseType }} · {{ item.area }}</text>
						<text class="item-region" v-if="item.region">地点：{{ item.region }}</text>
					</block>

					<view class="item-footer">
						<text class="item-price">{{ getPriceText(item) }}</text>
						<text class="item-time">{{ item.createTime }}</text>
					</view>
				</view>
				<view class="item-actions">
					<view class="action-btn" @tap="onEdit(item)">
						<text class="action-text">编辑</text>
					</view>
					<view class="action-btn btn-delete" @tap="onDelete(item, index)">
						<text class="action-text">删除</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { secondHouseApi, rentApi, purchaseApi } from '@/utils/request.js'

	export default {
		data() {
			return {
				filterType: '',
				activeTab: 'purchase',
				allList: [],
				loadedTabs: { purchase: false, second: false, rent: false }
			}
		},
		computed: {
			filteredList() {
				return this.allList.filter(i => i.type === this.activeTab)
			}
		},
		watch: {
			activeTab(val) {
				this.loadTab(val)
			}
		},
		onLoad(options) {
			if (options && options.type) {
				this.filterType = options.type
				this.activeTab = options.type
			}
		},
		onShow() {
			this.loadTab(this.activeTab)
		},
		methods: {
			async loadTab(tab) {
				if (!tab || this.loadedTabs[tab]) return
				try {
					var data = null
					if (tab === 'purchase') {
						data = await purchaseApi.purchaseSelf()
						var list = this.formatPurchaseList(data)
						this.appendList(list, 'purchase')
					} else if (tab === 'second') {
						data = await secondHouseApi.houseSelf()
						var list = this.formatSecondList(data)
						this.appendList(list, 'second')
					} else if (tab === 'rent') {
						data = await rentApi.rentSelf()
						var list = this.formatRentList(data)
						this.appendList(list, 'rent')
					}
					this.loadedTabs[tab] = true
				} catch (e) {}
			},
			appendList(list, type) {
				var others = this.allList.filter(i => i.type !== type)
				this.allList = others.concat(list)
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
					createTime: item.create_time || item.createTime || ''
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
					houseType: item.shape || item.houseType || '',
					area: (item.area || '') + '㎡',
					floor: item.floor || '',
					payment: item.payment || '',
					price: item.price,
					tagType: item.tagType || 'entire',
					description: item.description || item.explain || '',
					createTime: item.create_time || item.createTime || ''
				}))
			},
			formatPurchaseList(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(item => {
					var cats = item.categories || item.items || []
					return {
						id: item.Id || item.id,
						type: 'purchase',
						title: item.title,
						region: item.region || item.area || '',
						categories: cats.map(function(c) { return typeof c === 'string' ? c : (c.name || '') }),
						price: cats.length && cats[0].price ? cats[0].price : '',
						description: item.description || item.explain || '',
						createTime: item.create_time || item.createTime || ''
					}
				})
			},
			getTypeLabel(type) {
				if (type === 'purchase') return '个人收购'
				if (type === 'rent') return '租房'
				return '二手房'
			},
			getTypeClass(type) {
				if (type === 'purchase') return 'type-purchase'
				if (type === 'rent') return 'type-rent'
				return 'type-second'
			},
			getPriceText(item) {
				if (item.type === 'purchase') return item.price || ''
				if (item.type === 'second') return (item.price || '') + '万'
				if (item.type === 'rent') return (item.price || '') + '元/月'
				return ''
			},
			onEdit(item) {
				var url = '/pages/publish/purchase'
				if (item.type === 'second') url = '/pages/publish/second'
				else if (item.type === 'rent') url = '/pages/publish/rent'
				uni.navigateTo({
					url: url + '?action=edit&id=' + item.id
				})
			},
			onDelete(item, index) {
				var self = this
				uni.showModal({
					title: '提示',
					content: '确定删除"' + item.title + '"吗？',
					success: async function(res) {
						if (res.confirm) {
							try {
								if (item.type === 'rent') {
									await rentApi.deleteRent({ Id: item.id })
								} else if (item.type === 'purchase') {
									await purchaseApi.deletePurchase({ Id: item.id })
								} else if (item.type === 'second') {
									await secondHouseApi.deleteHouse({ Id: item.id })
								}
								self.loadedTabs[item.type] = false
								self.loadTab(item.type)
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
							} catch (e) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								self.allList.splice(index, 1)
							}
						}
					}
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

	.tab-bar {
		display: flex;
		background-color: #fff;
		padding: 16rpx 24rpx;
		gap: 16rpx;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		border-radius: 12rpx;
		background-color: #f5f5f5;
	}

	.tab-item text {
		font-size: 26rpx;
		color: #666;
	}

	.tab-item.active {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.tab-item.active text {
		color: #fff;
		font-weight: 500;
	}

	.list-container {
		padding: 20rpx 24rpx;
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 200rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.list-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
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

	.type-purchase {
		color: #3c9cff;
		background-color: rgba(60, 156, 255, 0.15);
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

	.item-categories {
		display: flex;
		gap: 12rpx;
		margin-bottom: 10rpx;
		flex-wrap: wrap;
	}

	.cat-tag {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		border-radius: 6rpx;
		background-color: #e8f5e9;
		color: #4caf50;
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

	.action-btn {
		flex: none;
		padding: 12rpx 28rpx;
		background-color: #fff;
		border: 1rpx solid #ddd;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-text {
		font-size: 24rpx;
		color: #333;
		font-weight: normal;
	}

	.btn-delete .action-text {
		color: #ff4d4f;
	}
</style>