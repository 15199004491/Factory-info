<template>
	<view class="page">
		<scroll-view class="scroll-area" scroll-y>
			<view class="list-container">
				<view class="empty" v-if="list.length === 0 && loaded">
					<text class="empty-text">暂无发布的信息</text>
				</view>

				<view class="list-item" v-for="(item, index) in list" :key="item.id" @tap="onViewDetail(item)">
					<view class="item-main">
						<view class="item-header">
							<text class="item-title">{{ item.title }}</text>
						</view>
						<view class="item-categories" v-if="item.categories && item.categories.length">
							<text class="cat-tag" v-for="(cat, ci) in item.categories" :key="ci">{{ cat }}</text>
						</view>
						<text class="item-region" v-if="item.region">地点：{{ item.region }}</text>
						<view class="item-footer">
							<text class="item-price">{{ item.price }}</text>
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

				<view class="no-more" v-if="list.length > 0 && loaded">
					<text class="no-more-text">没有更多消息了</text>
				</view>
			</view>
			<view class="scroll-bottom-space"></view>
		</scroll-view>

		<view class="action-bar">
			<view class="bar-btn bar-btn-add" @tap="onAdd">
				<text class="bar-btn-text">新增个人收购</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { purchaseApi } from '@/utils/request.js'
	import { formatDate } from '@/utils/date.js'

	export default {
		data() {
			return {
				list: [],
				loaded: false
			}
		},
		onShow() {
			this.loaded = false
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					const data = await purchaseApi.purchaseSelf()
					console.log('purchaseSelf 原始返回:', data)
					const raw = Array.isArray(data) ? data : (data && data.list ? data.list : [])
					console.log('解析后列表长度:', raw.length)
					this.list = (raw || []).map(item => {
						const cats = item.categories || item.items || []
						return {
							id: item.Id || item.id,
							title: item.title,
							region: item.region || item.area || '',
							categories: cats.map(function(c) { return typeof c === 'string' ? c : (c.name || '') }),
							price: cats.length && cats[0].price ? cats[0].price : '',
							createTime: formatDate(item.update_time || item.create_time || item.createTime || 0)
						}
					})
					this.loaded = true
				} catch (e) {
					console.error('purchaseSelf 出错:', e)
				}
			},
			onAdd() {
				uni.navigateTo({ url: '/pages/publish/purchase' })
			},
			onViewDetail(item) {
				uni.navigateTo({ url: '/pages/purchase/detail?id=' + item.id })
			},
			onEdit(item) {
				uni.navigateTo({ url: '/pages/publish/purchase?action=edit&id=' + item.id })
			},
			onDelete(item, index) {
				const self = this
				uni.showModal({
					title: '提示',
					content: '确定删除"' + item.title + '"吗？',
					success: async function(res) {
						if (res.confirm) {
							try {
								await purchaseApi.deletePurchase({ Id: item.id })
								self.loaded = false
								self.loadList()
								uni.showToast({ title: '删除成功', icon: 'success' })
							} catch (e) {
								uni.showToast({ title: '删除成功', icon: 'success' })
								self.list.splice(index, 1)
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

	.scroll-bottom-space {
		height: 160rpx;
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
		margin-bottom: 10rpx;
	}

	.item-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

	.action-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		gap: 16rpx;
		background-color: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.bar-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		border-radius: 12rpx;
	}

	.bar-btn-add {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.bar-btn-add .bar-btn-text {
		color: #fff;
	}

	.bar-btn-text {
		font-size: 28rpx;
		font-weight: 500;
	}
</style>