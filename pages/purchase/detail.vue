<template>
	<view class="page">
		<view class="detail-header">
			<view class="header-top">
				<text class="detail-title">{{ detail.title }}</text>
				<text class="header-time">{{ detail.time }}</text>
			</view>
			<view class="header-region">
				<u-icon name="map" size="14" color="rgba(255,255,255,0.8)"></u-icon>
				<text class="region-text">{{ detail.region }}</text>
			</view>
			</view>

		<view class="visitor-bar">
			<text class="visitor-text">今日访客：{{ detail.todayVisitors }}人 | 历史访客：{{ detail.totalVisitors }}人</text>
		</view>

		<view class="detail-section info-section">
			<view class="info-header">
				<view class="info-title-bar"></view>
				<text class="info-title">收购品类</text>
			</view>
			<view class="category-grid" v-if="detail.items.length > 0">
				<view class="category-card" v-for="(item, idx) in detail.items" :key="idx" :class="{ 'no-border': idx === detail.items.length - 1 }">
					<text class="cat-name">{{ item.name }}</text>
					<view class="cat-price-value">
						<text class="cat-price-num">{{ item.price }}</text>
						<text class="cat-price-unit">元/{{ item.unit }}</text>
					</view>
				</view>
			</view>
			<view class="empty-tip" v-else>
				<text class="empty-tip-text">暂无品类信息</text>
			</view>
		</view>

		<view class="detail-section">
			<view class="info-header">
				<view class="info-title-bar"></view>
				<text class="info-title">详细说明</text>
			</view>
			<text class="detail-content" v-if="detail.description">{{ detail.description }}</text>
			<view class="empty-tip" v-else>
				<text class="empty-tip-text">暂无详细说明</text>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="action-btn contact-btn" @tap="onContact">
				<text class="btn-label">电话联系</text>
			</view>
			<view class="action-btn share-btn" @tap="onShare">
				<text class="btn-label">分享</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { formatUpdateTime } from '@/utils/date.js'
	import { purchaseApi } from '@/utils/request.js'

	export default {
		data() {
			return {
				id: 0,
				detail: {
					title: '',
					category: '',
					items: [],
					region: '',
					time: '',
					description: '',
					contactName: '',
					mobile: '',
					todayVisitors: 0,
					totalVisitors: 0
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.id = parseInt(options.id)
				this.loadDetail()
			}
		},
		methods: {
			async loadDetail() {
				try {
					const data = await purchaseApi.purchaseDetail({ Id: this.id })
					const rawList = data.categories || data.items || []
					const items = rawList.map(item => ({
						name: item.name || '',
						price: item.price || '',
						unit: item.unit || ''
					}))
					this.detail = {
						title: data.title || '',
						category: data.category || '',
						items,
						region: data.region || data.area || '',
						time: formatUpdateTime(data.update_time || data.create_time || 0),
						description: data.description || data.explain || '',
						contactName: data.contact_name || '',
						mobile: data.mobile || '',
						todayVisitors: data.today_count || 0,
						totalVisitors: data.count || 0
					}
				} catch (e) {}
			},
			onContact() {
				if (this.detail.mobile) {
					uni.makePhoneCall({
						phoneNumber: this.detail.mobile
					})
				} else {
					uni.showToast({
						title: '暂无联系电话',
						icon: 'none'
					})
				}
			},
			onShareAppMessage() {
				return {
					title: this.detail.title + ' - 收购信息',
					path: '/pages/purchase/detail?id=' + this.id
				}
			},
			onShare() {
				// #ifdef MP-WEIXIN
				uni.showShareMenu({
					withShareTicket: true
				})
				uni.showToast({
					title: '请点击右上角分享给好友',
					icon: 'none',
					duration: 2000
				})
				// #endif
				// #ifndef MP-WEIXIN
				uni.showToast({
					title: '请在微信中打开分享',
					icon: 'none'
				})
				// #endif
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 140rpx;
	}

	.detail-header {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 40rpx 30rpx;
		color: #fff;
	}

	.visitor-bar {
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		text-align: right;
	}

	.visitor-text {
		font-size: 24rpx;
		color: #999;
	}

	.header-top {
		display: flex;
		align-items: center;
	}

	.header-region {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
	}

	.region-text {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
		margin-left: 8rpx;
	}

	.detail-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
		flex: 1;
	}

	.header-time {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		flex-shrink: 0;
	}

	.info-section {
		padding: 30rpx;
	}

	.info-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.info-title-bar {
		width: 6rpx;
		height: 28rpx;
		background: linear-gradient(180deg, #3c9cff, #5ac8fa);
		border-radius: 3rpx;
		margin-right: 12rpx;
	}

	.info-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.empty-tip {
		padding: 48rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.empty-tip-text {
		font-size: 26rpx;
		color: #bbb;
	}

	.category-grid {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		align-items: flex-start;
	}

	.category-card {
		display: inline-flex;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		width: 100%;
	}

	.category-card.no-border {
		border-bottom: none;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		margin-right: 24rpx;
	}

	.cat-price-value {
		display: flex;
		align-items: baseline;
	}

	.cat-price-num {
		font-size: 34rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.cat-price-unit {
		font-size: 22rpx;
		font-weight: 600;
		color: #ff5722;
		margin-left: 6rpx;
	}

	.detail-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.detail-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
	}

	.contact-section {
		padding-bottom: 20rpx;
	}

	.contact-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.contact-row:last-child {
		border-bottom: none;
	}

	.contact-label {
		font-size: 26rpx;
		color: #999;
	}

	.contact-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		background-color: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.action-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		margin: 0 12rpx;
		border-radius: 12rpx;
	}

	.contact-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.share-btn {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.btn-label {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}
</style>