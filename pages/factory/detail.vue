<template>
	<view class="page">
		<view class="notice-bar">
			<view class="notice-icon">
				<text class="notice-label">通知</text>
			</view>
			<view class="notice-content">
				<view class="marquee">
					<text class="notice-text">{{ factory.notice }}</text>
					<text class="notice-text">{{ factory.notice }}</text>
				</view>
			</view>
		</view>

		<view class="module-card">
			<view class="section-title">
				<text class="title-text">基本信息</text>
			</view>
			<view class="info-card">
				<view class="address-row" @tap="openLocation">
					<view class="address-info">
						<text class="address-text">{{ factory.address }}</text>
					</view>
					<view class="map-btn">
						<text class="map-btn-text">地图</text>
					</view>
				</view>
				<view class="remark-row" v-if="factory.remark">
					<text class="remark-label">备注：</text>
					<text class="remark-text">{{ factory.remark }}</text>
				</view>
			</view>
		</view>

		<view class="module-card">
			<view class="section-title">
				<text class="title-text">收购品类</text>
			</view>
			<view class="category-list">
				<view class="category-item" v-for="(cat, idx) in categories" :key="idx">
					<view class="cat-header">
						<text class="cat-name">{{ cat.name }}</text>
						<text class="cat-price">{{ cat.price }}</text>
					</view>
					<view class="cat-footer">
						<text class="cat-update-time">更新于 {{ formatDate(cat.updateTime) }}</text>
					</view>
					<view class="cat-remark" v-if="cat.remark">
						<text class="cat-remark-label">备注：</text>
						<text class="cat-remark-text">{{ cat.remark }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="action-btn share-btn" @tap="onShare">
				<text class="btn-label">分享</text>
			</view>
			<view class="action-btn qrcode-btn" @tap="onShowQRCode">
				<text class="btn-label">二维码</text>
			</view>
		</view>

		<view class="qrcode-modal" v-if="showQRCode" @tap="showQRCode = false">
			<view class="qrcode-content" @tap.stop>
				<view class="qrcode-box">
					<text class="qrcode-temp">二维码</text>
				</view>
				<text class="qrcode-tip">扫一扫查看详情</text>
				<text class="qrcode-close">点击关闭</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showQRCode: false,
				factory: {
					name: '红旗粮食综合加工厂',
					address: '山东省济南市历城区农业产业园88号',
					remark: '主要收购粮食作物，可上门收购，量大从优',
					notice: '即日起至8月31日，小麦收购价格上调5%，欢迎广大农户前来出售！',
					latitude: 36.6512,
					longitude: 117.1201
				},
				categories: [
					{
						name: '小麦',
						price: '2.85元/斤',
						updateTime: '2026-08-11 09:30',
						remark: '要求水分≤14%，无霉变'
					},
					{
						name: '玉米',
						price: '2.60元/斤',
						updateTime: '2026-08-10 14:20',
						remark: '要求颗粒饱满，杂质少'
					}
				]
			}
		},
		onLoad(options) {
			if (options.name) {
				this.factory.name = decodeURIComponent(options.name)
				uni.setNavigationBarTitle({
					title: this.factory.name
				})
			}
			uni.hideShareMenu()
		},
		onShareAppMessage() {
			return {
				title: this.factory.name + ' - 收购信息',
				path: '/pages/factory/detail?name=' + encodeURIComponent(this.factory.name)
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
			openLocation() {
				uni.openLocation({
					latitude: this.factory.latitude,
					longitude: this.factory.longitude,
					name: this.factory.name,
					address: this.factory.address,
					scale: 16
				})
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
			},
			onShowQRCode() {
				this.showQRCode = true
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 160rpx;
	}

	.notice-bar {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #fff7e6, #fffbe6);
		padding: 20rpx 24rpx;
		border-bottom: 1rpx solid #ffe5b4;
	}

	.notice-icon {
		flex-shrink: 0;
		margin-right: 16rpx;
	}

	.notice-label {
		font-size: 22rpx;
		color: #fff;
		background: linear-gradient(135deg, #ff9800, #ff5722);
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}

	.notice-content {
		flex: 1;
		overflow: hidden;
	}

	.marquee {
		display: flex;
		white-space: nowrap;
		animation: marquee 15s linear infinite;
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	.notice-text {
		font-size: 26rpx;
		color: #d4691a;
		margin-right: 60rpx;
	}

	.module-card {
		background-color: #fff;
		margin: 20rpx 24rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.info-card {
		padding: 0 24rpx 24rpx;
	}

	.address-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.address-info {
		flex: 1;
		margin-right: 20rpx;
	}

	.address-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.map-btn {
		flex-shrink: 0;
		background-color: #3c9cff;
		padding: 12rpx 28rpx;
		border-radius: 24rpx;
	}

	.map-btn-text {
		font-size: 24rpx;
		color: #fff;
	}

	.remark-row {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.remark-label {
		font-size: 26rpx;
		color: #999;
	}

	.remark-text {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	.section-title {
		padding: 24rpx;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.category-list {
		padding: 0 24rpx 24rpx;
	}

	.category-item {
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.category-item:last-child {
		border-bottom: none;
	}

	.cat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.cat-price {
		font-size: 32rpx;
		font-weight: 600;
		color: #ff5722;
	}

	.cat-footer {
		margin-top: 12rpx;
	}

	.cat-update-time {
		font-size: 24rpx;
		color: #999;
	}

	.cat-remark {
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx dashed #eee;
	}

	.cat-remark-label {
		font-size: 24rpx;
		color: #999;
	}

	.cat-remark-text {
		font-size: 24rpx;
		color: #666;
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

	.share-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.qrcode-btn {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.btn-icon-wrap {
		margin-bottom: 6rpx;
	}

	.btn-icon-text {
		font-size: 24rpx;
		color: #fff;
	}

	.btn-label {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}

	.qrcode-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.qrcode-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx;
		background-color: #fff;
		border-radius: 24rpx;
	}

	.qrcode-box {
		width: 400rpx;
		height: 400rpx;
		background: repeating-linear-gradient(
			45deg,
			#000,
			#000 4rpx,
			#fff 4rpx,
			#fff 8rpx
		);
		border: 2rpx solid #333;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qrcode-temp {
		font-size: 32rpx;
		color: #333;
		background-color: #fff;
		padding: 16rpx 32rpx;
		border-radius: 8rpx;
	}

	.qrcode-tip {
		font-size: 28rpx;
		color: #333;
		margin-top: 24rpx;
	}

	.qrcode-close {
		font-size: 24rpx;
		color: #999;
		margin-top: 16rpx;
	}
</style>