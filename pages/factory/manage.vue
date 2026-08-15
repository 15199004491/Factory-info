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
				<view class="item-validity">
					<view class="validity-icon-wrap">
						<u-icon name="clock" size="14" :color="getValidityInfo(item).color" />
					</view>
					<text class="validity-label">有效期至</text>
					<text class="validity-date" :style="{ color: getValidityInfo(item).color }">{{ item.validityEnd || '未设置' }}</text>
					<view class="validity-tag" :class="getValidityInfo(item).tagClass">
						<text class="validity-tag-text">{{ getValidityInfo(item).tagText }}</text>
					</view>
				</view>
				<view class="item-actions">
					<view class="action-btn btn-price" @tap.stop="onPublishPrice(item)">
						<text class="action-text">发布信息</text>
					</view>
					<view class="action-btn btn-more" @tap.stop="onMore(item, index)">
						<text class="action-text">更多</text>
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
	import { factoryApi } from '@/utils/request.js'

	export default {
		data() {
			return {
				factoryList: []
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					const data = await factoryApi.getSelf()
					this.factoryList = (data || []).map(item => ({
						id: item.id,
						name: item.name,
						address: item.address,
						phone: item.phone,
						status: item.verified ? 'approved' : 'pending',
						licenseImage: item.license,
						latitude: item.latitude,
						longitude: item.longitude,
						createdAt: item.create_time || item.createdAt || '',
						validityEnd: item.expire_time || item.validity_end || item.validityEnd || ''
					}))
				} catch (e) {
					this.factoryList = []
				}
				if (this.factoryList.length === 0) {
					this.factoryList = this.getMockList()
				}
			},
			getMockList() {
				const now = new Date()
				const fmt = (d) => {
					const y = d.getFullYear()
					const m = String(d.getMonth() + 1).padStart(2, '0')
					const day = String(d.getDate()).padStart(2, '0')
					return `${y}-${m}-${day}`
				}
				const addDays = (date, days) => {
					const d = new Date(date)
					d.setDate(d.getDate() + days)
					return d
				}
				return [
					{
						id: 'mock1',
						name: '兰州新区诚信机械加工厂',
						address: '甘肃省兰州市兰州新区昆仑大道中段 1688 号',
						status: 'approved',
						createdAt: fmt(addDays(now, -60)),
						validityEnd: fmt(addDays(now, 180))
					},
					{
						id: 'mock2',
						name: '七里河区顺达五金制品厂',
						address: '甘肃省兰州市七里河区西津西路 399 号',
						status: 'approved',
						createdAt: fmt(addDays(now, -180)),
						validityEnd: fmt(addDays(now, 15))
					},
					{
						id: 'mock3',
						name: '城关区金鑫钣金加工厂',
						address: '甘肃省兰州市城关区东岗东路 256 号',
						status: 'approved',
						createdAt: fmt(addDays(now, -365)),
						validityEnd: fmt(addDays(now, -10))
					},
					{
						id: 'mock4',
						name: '安宁区宏达精密铸造厂',
						address: '甘肃省兰州市安宁区安宁东路 888 号',
						status: 'pending',
						createdAt: fmt(addDays(now, -3)),
						validityEnd: ''
					}
				]
			},
			getValidityInfo(item) {
				const info = {
					color: '#666',
					tagClass: 'validity-tag-normal',
					tagText: '正常'
				}
				if (!item.validityEnd) {
					info.color = '#999'
					info.tagClass = 'validity-tag-none'
					info.tagText = '未设置'
					return info
				}
				const end = new Date(item.validityEnd.replace(/-/g, '/'))
				const now = new Date()
				const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
				const diffMs = end.getTime() - todayStart.getTime()
				const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
				if (diffDays < 0) {
					info.color = '#ff4d4f'
					info.tagClass = 'validity-tag-expired'
					info.tagText = '已过期'
				} else if (diffDays <= 30) {
					info.color = '#fa8c16'
					info.tagClass = 'validity-tag-warning'
					info.tagText = `剩${diffDays}天`
				} else {
					info.color = '#52c41a'
					info.tagClass = 'validity-tag-normal'
					info.tagText = '正常'
				}
				return info
			},
			formatDate(dateStr) {
				if (!dateStr) return ''
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
			onEdit(item) {
				uni.navigateTo({
					url: '/pages/factory/register?edit=1&id=' + item.id
				})
			},
			onCertify(item) {
				uni.navigateTo({
					url: '/pages/factory/certify?id=' + item.id + '&name=' + encodeURIComponent(item.name)
				})
			},
			onMore(item, index) {
				uni.showActionSheet({
					itemList: ['认证', '续费', '编辑', '删除'],
					success: (res) => {
						if (res.tapIndex === 0) {
							this.onCertify(item)
						} else if (res.tapIndex === 1) {
							this.onRenew(item)
						} else if (res.tapIndex === 2) {
							this.onEdit(item)
						} else if (res.tapIndex === 3) {
							this.onDelete(item, index)
						}
					}
				})
			},
			onRenew(item) {
				uni.navigateTo({
					url: '/pages/factory/renew?id=' + item.id + '&name=' + encodeURIComponent(item.name) + '&validity=' + encodeURIComponent(item.validityEnd || '')
				})
			},
			onPublishPrice(item) {
				uni.navigateTo({
					url: '/pages/factory/price?id=' + item.id
				})
			},
			onDelete(item, index) {
				uni.showModal({
					title: '确认删除',
					content: '删除以后对应的品类都将删除，确定要删除「' + item.name + '」吗？',
					confirmColor: '#ff4d4f',
					success: async (res) => {
						if (res.confirm) {
							try {
								await factoryApi.remove(item.id)
								this.factoryList.splice(index, 1)
								uni.showToast({ title: '已删除', icon: 'success' })
							} catch (e) {}
						}
					}
				})
			},
			goDetail(item) {
				uni.navigateTo({
					url: '/pages/factory/detail?id=' + item.id
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
		margin-bottom: 16rpx;
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

	.item-validity {
		display: flex;
		align-items: center;
		background-color: #fafafa;
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		margin-bottom: 28rpx;
	}

	.validity-icon-wrap {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		margin-right: 10rpx;
	}

	.validity-label {
		font-size: 24rpx;
		color: #888;
		flex-shrink: 0;
		margin-right: 10rpx;
	}

	.validity-date {
		font-size: 24rpx;
		font-weight: 600;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.validity-tag {
		flex-shrink: 0;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}

	.validity-tag-text {
		font-size: 22rpx;
	}

	.validity-tag-normal {
		background-color: rgba(82, 196, 26, 0.1);
		.validity-tag-text {
			color: #52c41a;
		}
	}

	.validity-tag-warning {
		background-color: rgba(250, 140, 22, 0.1);
		.validity-tag-text {
			color: #fa8c16;
		}
	}

	.validity-tag-expired {
		background-color: rgba(255, 77, 79, 0.1);
		.validity-tag-text {
			color: #ff4d4f;
		}
	}

	.validity-tag-none {
		background-color: rgba(153, 153, 153, 0.1);
		.validity-tag-text {
			color: #999;
		}
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