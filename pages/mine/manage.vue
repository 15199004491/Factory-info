<template>
	<view class="page">
		<view class="tab-bar">
			<view class="tab-item" :class="{ active: activeTab === 'second' }" @tap="activeTab = 'second'">
				<text>二手房</text>
				<text class="tab-count" v-if="secondCount > 0">({{ secondCount }})</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'rent' }" @tap="activeTab = 'rent'">
				<text>租房</text>
				<text class="tab-count" v-if="rentCount > 0">({{ rentCount }})</text>
			</view>
		</view>

		<scroll-view class="scroll-area" scroll-y>
			<view class="list-container">
				<view class="empty" v-if="filteredList.length === 0 && isTabLoaded(activeTab)">
					<text class="empty-icon">📭</text>
					<text class="empty-text">暂无发布的信息</text>
					<view class="empty-add-btn" @tap="onAdd">
						<text class="empty-add-text">立即发布</text>
					</view>
				</view>

				<view class="list-item" v-for="(item, index) in filteredList" :key="item.id" @tap="onViewDetail(item)">
					<view class="item-main">
						<view class="item-header">
							<text class="item-title">{{ item.title }}</text>
							<text class="item-type-tag" :class="getTypeClass(item.type)">{{ getTypeLabel(item.type) }}</text>
						</view>

						<view class="item-tags" v-if="item.type === 'rent'">
							<text class="item-sub-tag" :class="item.tagType === 'shared' ? 'tag-shared' : 'tag-entire'">{{ item.tagType === 'shared' ? '合租' : '整租' }}</text>
						</view>

						<text class="item-desc">{{ item.community }} · {{ item.houseType }} · {{ item.area }}</text>
						<text class="item-region" v-if="item.region">地点：{{ item.region }}</text>

						<view class="item-footer">
							<text class="item-price">{{ getPriceText(item) }}</text>
							<text class="item-time">{{ item.createTime }}</text>
						</view>
					</view>
					<view class="item-actions">
						<view class="action-btn" @tap.stop="onEdit(item)">
							<text class="action-text">编辑</text>
						</view>
						<view class="action-btn btn-delete" @tap.stop="onDelete(item, index)">
							<text class="action-text">删除</text>
						</view>
					</view>
				</view>

				<view class="no-more" v-if="filteredList.length > 0 && isTabLoaded(activeTab)">
					<text class="no-more-text">没有更多消息了</text>
				</view>
			</view>

			<safe-bottom :height="120"></safe-bottom>
		</scroll-view>

		<view class="publish-fab" @tap="onAdd">
			<u-icon name="plus" size="28" color="#fff"></u-icon>
		</view>
	</view>
</template>

<script>
	import { secondHouseApi, rentApi, getOpenid, FULL_LIST_LIMIT } from '@/utils/request.js'
	import { formatDate } from '@/utils/date.js'
	import { checkHouseLimit } from '@/utils/houseLimit.js'
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'

	export default {
		components: {
			uIcon
		},
		data() {
			return {
				activeTab: 'second',
				allList: [],
				loadedTabs: { second: false, rent: false }
			}
		},
		computed: {
			secondList() {
				return this.allList.filter(i => i.type === 'second')
			},
			rentList() {
				return this.allList.filter(i => i.type === 'rent')
			},
			secondCount() {
				return this.secondList.length
			},
			rentCount() {
				return this.rentList.length
			},
			filteredList() {
				return this.allList.filter(i => i.type === this.activeTab)
			}
		},
		watch: {
			activeTab(val) {
				this.loadTab(val)
			}
		},
		onShow() {
			this.loadedTabs = { second: false, rent: false }
			this.loadTab('second')
			this.loadTab('rent')
		},
		methods: {
			isTabLoaded(tab) {
				return !!this.loadedTabs[tab]
			},
			async onAdd() {
				const allowed = await checkHouseLimit()
				if (!allowed) return
				if (this.activeTab === 'second') {
					uni.navigateTo({ url: '/pages/publish/second' })
				} else if (this.activeTab === 'rent') {
					uni.navigateTo({ url: '/pages/publish/rent' })
				}
			},
			async loadTab(tab) {
				if (!tab) return
				if (this.loadedTabs[tab]) return
				try {
					var data = null
					if (tab === 'second') {
						data = await secondHouseApi.houseListByOpenid(getOpenid(), { page: 1, limit: FULL_LIST_LIMIT })
						var list = this.formatSecondList(data)
						this.appendList(list, 'second')
					} else if (tab === 'rent') {
						data = await rentApi.rentListByOpenid(getOpenid(), { page: 1, limit: FULL_LIST_LIMIT })
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
					createTime: formatDate(item.update_time || item.create_time || item.createTime || 0)
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
					createTime: formatDate(item.update_time || item.create_time || item.createTime || 0)
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
				uni.navigateTo({ url: url })
			},
			onEdit(item) {
				var url = '/pages/publish/second'
				if (item.type === 'rent') url = '/pages/publish/rent'
				uni.navigateTo({ url: url + '?action=edit&id=' + item.id })
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
								} else if (item.type === 'second') {
									await secondHouseApi.deleteHouse({ Id: item.id })
								}
								uni.showToast({ title: '删除成功', icon: 'success' })
								self.loadedTabs[item.type] = false
								self.loadTab(item.type)
							} catch (e) {
								uni.showToast({ title: '删除成功', icon: 'success' })
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
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.scroll-area {
		flex: 1;
		height: 0;
	}

	.tab-bar {
		display: flex;
		background-color: #fff;
		padding: 0 24rpx;
		margin: 24rpx 24rpx 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		flex-shrink: 0;
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

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
	}

	.tab-item text {
		font-size: 28rpx;
		color: #999;
		transition: all 0.2s;
	}

	.tab-item.active text:first-child {
		color: #333;
		font-weight: 600;
		font-size: 30rpx;
	}

	.tab-count {
		font-size: 24rpx !important;
		color: #bbb !important;
		font-weight: normal !important;
	}

	.tab-item.active .tab-count {
		color: #3c9cff !important;
	}

	.tab-item.active::after {
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
		margin-bottom: 32rpx;
	}

	.empty-add-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 20rpx 60rpx;
		border-radius: 40rpx;
	}

	.empty-add-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
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

	.action-btn {
		flex: none;
		padding: 12rpx 28rpx;
		background-color: #fff;
		border: 1rpx solid #ddd;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		margin: 0;
	}

	.action-btn::after {
		border: none;
	}

	.action-text {
		font-size: 24rpx;
		color: #333;
		font-weight: normal;
	}

	.btn-delete .action-text {
		color: #ff4d4f;
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

	.publish-fab {
		position: fixed;
		right: 30rpx;
		bottom: calc(60rpx + env(safe-area-inset-bottom));
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.4);
		z-index: 998;
	}
</style>