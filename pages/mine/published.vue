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
				allList: []
			}
		},
		computed: {
			filteredList() {
				if (this.activeTab === 'all') return this.allList
				return this.allList.filter(i => i.type === this.activeTab)
			}
		},
		onLoad(options) {
			if (options && options.type) {
				this.filterType = options.type
				this.activeTab = options.type
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					const [secondData, rentData, purchaseData] = await Promise.all([
						secondHouseApi.getList({ page: 1, limit: 100 }),
						rentApi.rentSelf(),
						purchaseApi.purchaseSelf()
					])
					const secondList = this.formatSecondList(secondData.list || [])
					const rentList = this.formatRentList(rentData || [])
					const purchaseList = this.formatPurchaseList(purchaseData || [])

					if (secondList.length === 0 && rentList.length === 0 && purchaseList.length === 0) {
						this.allList = this.getMockData()
					} else {
						this.allList = [...purchaseList, ...secondList, ...rentList]
					}
				} catch (e) {
					this.allList = this.getMockData()
				}
			},
			getMockData() {
				return [
					{
						id: 101,
						type: 'purchase',
						title: '大量收购玉米 小麦',
						categories: ['玉米', '小麦'],
						region: '兵团 塔城地区 133团',
						price: '1.25元/斤',
						createTime: '2026-08-15'
					},
					{
						id: 102,
						type: 'purchase',
						title: '收购西红柿 黄瓜',
						categories: ['西红柿', '黄瓜'],
						region: '兵团 石河子市 143团',
						price: '2.80元/斤',
						createTime: '2026-08-14'
					},
					{
						id: 103,
						type: 'purchase',
						title: '生猪收购 活猪',
						categories: ['活猪'],
						region: '兵团 塔城地区 133团',
						price: '15.00元/斤',
						createTime: '2026-08-12'
					},
					{
						id: 201,
						type: 'second',
						title: '阳光花园 3室2厅 精装',
						community: '阳光花园',
						region: '兵团 石河子市',
						houseType: '3室2厅',
						area: '120㎡',
						price: '58',
						createTime: '2026-08-10'
					},
					{
						id: 202,
						type: 'second',
						title: '和谐家园 2室1厅 毛坯',
						community: '和谐家园',
						region: '兵团 奎屯市',
						houseType: '2室1厅',
						area: '88㎡',
						price: '42',
						createTime: '2026-08-08'
					},
					{
						id: 301,
						type: 'rent',
						title: '绿城水郡 精装公寓 拎包入住',
						community: '绿城水郡',
						region: '兵团 阿克苏地区',
						houseType: '1室1厅',
						area: '45㎡',
						price: '1500',
						tagType: 'entire',
						createTime: '2026-08-16'
					},
					{
						id: 302,
						type: 'rent',
						title: '合租单间 带独立卫生间',
						community: '万达广场',
						region: '兵团 乌鲁木齐市',
						houseType: '单间',
						area: '20㎡',
						price: '800',
						tagType: 'shared',
						createTime: '2026-08-13'
					}
				]
			},
			formatSecondList(list) {
				return (list || []).map(item => ({
					id: item.Id || item.id,
					type: 'second',
					title: item.title,
					community: item.name || item.community || '',
					region: item.region || '',
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
					region: item.region || '',
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
				return (list || []).map(item => ({
					id: item.Id || item.id,
					type: 'purchase',
					title: item.title,
					region: item.region || item.area || '',
					categories: (item.items || []).map(i => i.name),
					price: item.items && item.items[0] ? item.items[0].price : '',
					description: item.description || item.explain || '',
					createTime: item.create_time || item.createTime || ''
				}))
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
								}
								self.loadList()
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