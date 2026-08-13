<template>
	<view class="page">
		<view class="list-container">
			<view class="list-item" v-for="(item, index) in factoryList" :key="index" @tap="goDetail(item)">
				<view class="item-top">
					<view class="item-header">
						<text class="item-status" :class="item.status === 'approved' ? 'status-approved' : 'status-pending'">{{ item.status === 'approved' ? '已入驻' : '待审核' }}</text>
						<text class="item-name">{{ item.name }}</text>
					</view>
					<text class="item-time">{{ formatDate(item.createdAt) }}</text>
				</view>
				<view class="item-info">
					<text class="info-address">{{ item.address }}</text>
				</view>
				<view class="item-actions">
					<view class="action-btn btn-certify" @tap.stop="onCertify(item)">
						<text class="action-text">认证</text>
					</view>
					<view class="action-btn btn-price" @tap.stop="onPublishPrice(item)">
						<text class="action-text">发布信息</text>
					</view>
					<view class="action-btn btn-delete" @tap.stop="onDelete(item, index)">
						<text class="action-text">删除</text>
					</view>
				</view>
			</view>

			<view class="empty" v-if="factoryList.length === 0">
				<text class="empty-text">暂无加工厂，点击下方新增</text>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="add-btn" @tap="onAdd">
				<text class="add-text">新增加工厂</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				factoryList: [
					{
						name: '红旗粮食综合加工厂',
						address: '山东省济南市历城区农业产业园88号',
						phone: '13888888888',
						status: 'approved',
						licenseImage: '',
						latitude: 36.6512,
						longitude: 117.1201,
						createdAt: '2026-08-10 14:30'
					},
					{
						name: '丰收粮油加工厂',
						address: '山东省济南市章丘区工业大道66号',
						phone: '13999999999',
						status: 'pending',
						licenseImage: '',
						latitude: 36.7200,
						longitude: 117.1800,
						createdAt: '2026-08-11 09:15'
					}
				]
			}
		},
		methods: {
			formatDate(dateStr) {
				const date = new Date(dateStr.replace(/-/g, '/'))
				const now = new Date()
				const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
				const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
				const diffDays = Math.floor((todayStart - dateStart) / (24 * 60 * 60 * 1000))
				const hh = String(date.getHours()).padStart(2, '0')
				const mm = String(date.getMinutes()).padStart(2, '0')
				const time = `${hh}:${mm}`

				if (diffDays === 0) {
					return `今天 ${time}`
				} else if (diffDays === 1) {
					return `昨天 ${time}`
				} else if (diffDays < 7) {
					const weekDays = ['日', '一', '二', '三', '四', '五', '六']
					return `周${weekDays[date.getDay()]} ${time}`
				} else {
					const y = date.getFullYear()
					const m = String(date.getMonth() + 1).padStart(2, '0')
					const d = String(date.getDate()).padStart(2, '0')
					return `${y}-${m}-${d}`
				}
			},
			onAdd() {
				uni.navigateTo({
					url: '/pages/factory/register'
				})
			},
			onCertify(item) {
				uni.navigateTo({
					url: '/pages/factory/certify?name=' + encodeURIComponent(item.name)
				})
			},
			onPublishPrice(item) {
				uni.navigateTo({
					url: '/pages/factory/price?name=' + encodeURIComponent(item.name)
				})
			},
			onDelete(item, index) {
				uni.showModal({
					title: '确认删除',
					content: '删除以后对应的品类都将删除，确定要删除「' + item.name + '」吗？',
					confirmColor: '#ff4d4f',
					success: (res) => {
						if (res.confirm) {
							this.factoryList.splice(index, 1)
							uni.showToast({ title: '已删除', icon: 'success' })
						}
					}
				})
			},
			goDetail(item) {
				uni.navigateTo({
					url: '/pages/factory/detail?name=' + encodeURIComponent(item.name)
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 180rpx;
	}

	.list-container {
		padding: 20rpx 24rpx;
	}

	.list-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
	}

	.item-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}

	.item-header {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.item-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-status {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		margin-right: 12rpx;
	}

	.status-approved {
		color: #52c41a;
		background-color: rgba(82, 196, 26, 0.1);
	}

	.status-pending {
		color: #fa8c16;
		background-color: rgba(250, 140, 22, 0.1);
	}

	.item-time {
		font-size: 24rpx;
		color: #bbb;
		flex-shrink: 0;
		margin-left: 16rpx;
	}

	.item-info {
		margin-bottom: 32rpx;
	}

	.info-address {
		font-size: 26rpx;
		color: #666;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.item-actions {
		display: flex;
		gap: 16rpx;
		justify-content: flex-end;
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

	.empty {
		display: flex;
		justify-content: center;
		padding: 160rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24rpx 48rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.add-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		border-radius: 12rpx;
		padding: 28rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-icon {
		font-size: 36rpx;
		color: #fff;
		margin-right: 8rpx;
		font-weight: 300;
	}

	.add-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
	}
</style>