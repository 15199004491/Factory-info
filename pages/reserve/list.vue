<template>
	<view class="page">
		<scroll-view class="scroll-area" scroll-y>
			<view class="list-container">
				<view class="empty" v-if="list.length === 0 && loaded">
					<text class="empty-icon">📋</text>
					<text class="empty-text">暂无预约信息</text>
				</view>

				<view class="list-item" v-for="(item, index) in list" :key="item.id" @tap="onViewHouse(item)">
					<view class="item-header">
						<text class="item-title">{{ item.title || '房源' }}</text>
						<text class="item-type-tag" :class="getTypeClass(item.house_type)">{{ getTypeLabel(item.house_type) }}</text>
					</view>

					<view class="item-info">
						<view class="info-row">
							<text class="info-label">看房时间</text>
							<text class="info-value">{{ formatReserveTime(item) }}</text>
						</view>
						<view class="info-row" v-if="item.mobile">
							<text class="info-label">联系电话</text>
							<text class="info-value mobile" @tap.stop="onCall(item.mobile)">{{ item.mobile }}</text>
						</view>
						<view class="info-row" v-if="item.create_time">
							<text class="info-label">预约时间</text>
							<text class="info-value">{{ formatDate(item.create_time) }}</text>
						</view>
					</view>

					<view class="item-status">
						<text class="status-tag" :class="getStatusClass(item.status)">{{ getStatusLabel(item.status) }}</text>
					</view>
				</view>

				<view class="no-more" v-if="list.length > 0 && loaded">
					<text class="no-more-text">没有更多了</text>
				</view>
			</view>

			<safe-bottom :height="120"></safe-bottom>
		</scroll-view>
	</view>
</template>

<script>
	import { reserveApi, FULL_LIST_LIMIT } from '@/utils/request.js'
	import { formatDate } from '@/utils/date.js'

	export default {
		components: {
		},
		data() {
			return {
				list: [],
				loaded: false
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					var data = await reserveApi.list({ page: 1, limit: FULL_LIST_LIMIT })
					var arr = Array.isArray(data) ? data : (data && data.list ? data.list : [])
					this.list = (arr || []).map(item => ({
						id: item.Id || item.id,
						house_id: item.house_id || item.houseId,
						house_type: item.house_type || item.houseType || 'second',
						title: item.title || item.house_title || '',
						reserve_date: item.reserve_date || item.reserveDate || '',
						reserve_hour: item.reserve_hour || item.reserveHour || '',
						mobile: item.mobile || '',
						status: item.status || 0,
						create_time: item.create_time || item.createTime || 0
					}))
				} catch (e) {}
				this.loaded = true
			},
			getTypeLabel(type) {
				if (type === 'rent') return '租房'
				return '二手房'
			},
			getTypeClass(type) {
				if (type === 'rent') return 'type-rent'
				return 'type-second'
			},
			getStatusLabel(status) {
				var s = parseInt(status)
				if (s === 1) return '已确认'
				if (s === 2) return '已完成'
				if (s === 3) return '已取消'
				return '待确认'
			},
			getStatusClass(status) {
				var s = parseInt(status)
				if (s === 1) return 'status-confirmed'
				if (s === 2) return 'status-done'
				if (s === 3) return 'status-cancel'
				return 'status-pending'
			},
			formatReserveTime(item) {
				var date = item.reserve_date || ''
				var hour = item.reserve_hour || ''
				if (date && hour) return date + ' ' + hour
				return date || hour || '未设置'
			},
			onViewHouse(item) {
				if (!item.house_id) return
				var url = '/pages/second/detail?id=' + item.house_id
				if (item.house_type === 'rent') url = '/pages/rent/detail?id=' + item.house_id
				uni.navigateTo({ url: url })
			},
			onCall(mobile) {
				if (!mobile) return
				uni.makePhoneCall({ phoneNumber: mobile })
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
		padding: 24rpx;
	}

	.list-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 20rpx;
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

	.item-info {
		margin-bottom: 16rpx;
	}

	.info-row {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
	}

	.info-label {
		font-size: 26rpx;
		color: #999;
		width: 140rpx;
		flex-shrink: 0;
	}

	.info-value {
		font-size: 26rpx;
		color: #333;
		flex: 1;
	}

	.info-value.mobile {
		color: #3c9cff;
	}

	.item-status {
		display: flex;
		justify-content: flex-end;
	}

	.status-tag {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}

	.status-pending {
		color: #fa8c16;
		background-color: #fff7e6;
	}

	.status-confirmed {
		color: #52c41a;
		background-color: #f6ffed;
	}

	.status-done {
		color: #1890ff;
		background-color: #e6f7ff;
	}

	.status-cancel {
		color: #999;
		background-color: #f5f5f5;
	}

	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 200rpx 0;
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
</style>