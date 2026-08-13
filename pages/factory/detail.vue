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

		<!-- <view class="unverified-tip" v-if="!factory.verified">
			<view class="tip-bar"></view>
			<view class="tip-body">
				<view class="tip-title-row">
					<text class="tip-icon-s">!</text>
					<text class="tip-title">这家加工厂未进行平台认证</text>
				</view>
				<text class="tip-desc">信息由企业自行发布，交易前建议核实确认</text>
			</view>
		</view> -->

		<view class="module-card" :class="{ 'verified-card': factory.verified }">
			<view class="section-title section-title-between">
				<view class="title-left">
					<text class="title-text">基本信息</text>
					<text class="verified-tag" v-if="factory.verified">已认证</text>
					<text class="unverified-tag" v-else>未认证</text>
				</view>
				<view class="visitor-pill">
					<text class="visitor-label">今日访客</text>
					<text class="visitor-num">{{ todayVisitors }}</text>
					<text class="visitor-label">人</text>
				</view>
			</view>
			<view class="section-factory-name">
				<text class="factory-title">{{ factory.name }}</text>
			</view>
			<view class="info-card">
				<view class="address-row" @tap="openLocation">
					<view class="address-info">
						<text class="address-text">{{ factory.address }}</text>
					</view>
					<view class="map-btn">
						<text class="map-icon">📍</text>
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
						<view class="cat-name-wrap">
							<text class="cat-name">{{ cat.name }}</text>
							<text class="cat-status-tag" :class="cat.status">{{ cat.status === 'active' ? '收购中' : '暂停收购' }}</text>
						</view>
						<view class="cat-price">
							<text class="cat-price-num">{{ getPriceNum(cat.price) }}</text>
							<text class="cat-price-unit">{{ getPriceUnit(cat.price) }}</text>
						</view>
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
			<view class="action-btn poster-btn" @tap="onShowPoster">
				<text class="btn-label">海报</text>
			</view>
			<view class="action-btn share-btn" @tap="onShare">
				<text class="btn-label">分享</text>
			</view>
		</view>

		<view class="poster-modal" v-if="showPoster" @tap="showPoster = false">
			<view class="poster-wrap" @tap.stop>
				<view class="poster-card">
					<view class="poster-header">
						<view class="poster-factory-name">{{ factory.name }}</view>
						<view class="poster-verified-badge" v-if="factory.verified">已认证</view>
					</view>
					<view class="poster-address">
						<text class="poster-address-icon">📍</text>
						<text class="poster-address-text">{{ factory.address }}</text>
					</view>
					<view class="poster-categories">
						<view class="poster-cat-title">收购品类</view>
						<view class="poster-cat-list">
							<view class="poster-cat-item" v-for="(cat, idx) in categories" :key="idx">
								<text class="poster-cat-name">{{ cat.name }}</text>
							</view>
						</view>
					</view>
					<view class="poster-bottom">
						<view class="poster-qrcode">
							<view class="poster-qr-box">
								<text class="poster-qr-temp">二维码</text>
							</view>
							<text class="poster-qr-tip">微信扫一扫</text>
						</view>
						<view class="poster-slogan">
							<text class="poster-slogan-main">扫码看最新收购价</text>
							<text class="poster-slogan-sub">足不出户掌握行情</text>
						</view>
					</view>
				</view>
				<view class="poster-actions">
					<view class="poster-save-btn" @tap="onSavePoster">
						<text class="poster-save-text">保存海报</text>
					</view>
					<text class="poster-close" @tap="showPoster = false">关闭</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showPoster: false,
				todayVisitors: 1999,
				factory: {
					name: '红旗粮食综合加工厂',
					verified: true,
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
						remark: '要求水分≤14%，无霉变',
						status: 'active'
					},
					{
						name: '玉米',
						price: '2.60元/斤',
						updateTime: '2026-08-10 14:20',
						remark: '要求颗粒饱满，杂质少',
						status: 'paused'
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
			this.loadTodayVisitors()
		},
		onShareAppMessage() {
			return {
				title: this.factory.name + ' - 收购信息',
				path: '/pages/factory/detail?name=' + encodeURIComponent(this.factory.name)
			}
		},
		methods: {
			loadTodayVisitors() {
				const today = this.getTodayKey()
				const factoryKey = this.factory.name || 'default'
				const storageKey = `visitors_${factoryKey}`
				const record = uni.getStorageSync(storageKey)
				let count = 1999
				if (record && record.date === today) {
					count = record.count + 1
				}
				uni.setStorageSync(storageKey, {
					date: today,
					count: count
				})
				this.todayVisitors = count
			},
			getTodayKey() {
				const now = new Date()
				const y = now.getFullYear()
				const m = String(now.getMonth() + 1).padStart(2, '0')
				const d = String(now.getDate()).padStart(2, '0')
				return `${y}-${m}-${d}`
			},
			getPriceNum(priceStr) {
				const match = priceStr.match(/[\d.]+/)
				return match ? match[0] : priceStr
			},
			getPriceUnit(priceStr) {
				const match = priceStr.match(/[^\d.]+/)
				return match ? match[0] : ''
			},
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
			onShowPoster() {
				this.showPoster = true
			},
			onSavePoster() {
				uni.showToast({
					title: '海报已保存到相册',
					icon: 'success'
				})
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

	.verified-card {
		border: 2rpx solid rgba(60, 156, 255, 0.3);
		background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 40%);
		box-shadow: 0 4rpx 20rpx rgba(60, 156, 255, 0.12);
	}

	.verified-card .title-text {
		color: #1890ff;
	}

	.info-card {
		padding: 0 24rpx 24rpx;
	}

	.unverified-tip {
		display: flex;
		align-items: stretch;
		margin: 20rpx 24rpx;
		background-color: #fdf6ec;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.tip-bar {
		width: 6rpx;
		flex-shrink: 0;
		background: linear-gradient(180deg, #faad14, #d48806);
	}

	.tip-body {
		flex: 1;
		padding: 18rpx 20rpx;
	}

	.tip-title-row {
		display: flex;
		align-items: center;
		margin-bottom: 6rpx;
	}

	.tip-icon-s {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32rpx;
		height: 32rpx;
		background-color: #faad14;
		color: #fff;
		font-size: 22rpx;
		font-weight: 700;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.tip-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #874d00;
		line-height: 1.4;
	}

	.tip-desc {
		display: block;
		font-size: 24rpx;
		color: #a06a1a;
		line-height: 1.5;
	}

	.address-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.address-info {
		flex: 1;
		display: flex;
		align-items: center;
		margin-right: 20rpx;
	}

	.address-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.map-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.map-icon {
		font-size: 36rpx;
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

	.section-title-between {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.visitor-pill {
		display: inline-flex;
		align-items: center;
		background-color: #f5f7fa;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
		flex-shrink: 0;
	}

	.visitor-label {
		font-size: 24rpx;
		color: #999;
	}

	.visitor-num {
		font-size: 26rpx;
		font-weight: 600;
		color: #3c9cff;
		margin-left: 8rpx;
	}

	.visitor-pill .visitor-label:last-child {
		margin-left: 4rpx;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.factory-title-wrap {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.section-factory-name {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		padding: 0 24rpx 16rpx;
	}

	.factory-title {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		word-break: break-all;
	}

	.verified-tag {
		font-size: 20rpx;
		color: #fff;
		background: linear-gradient(135deg, #3c9cff, #1890ff);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
		margin-left: 12rpx;
	}

	.unverified-tag {
		font-size: 20rpx;
		color: #ff8c00;
		background-color: rgba(255, 140, 0, 0.1);
		border: 1rpx solid rgba(255, 140, 0, 0.3);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
		margin-left: 12rpx;
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

	.cat-name-wrap {
		display: flex;
		align-items: center;
	}

	.cat-status-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}

	.cat-status-tag.active {
		background-color: #e8f5e9;
		color: #4caf50;
	}

	.cat-status-tag.paused {
		background-color: #ffebee;
		color: #f44336;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.cat-price {
		display: flex;
		align-items: baseline;
	}

	.cat-price-num {
		font-size: 38rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.cat-price-unit {
		font-size: 18rpx;
		font-weight: 700;
		color: #ff5722;
		margin-left: 4rpx;
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
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.poster-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
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

	.poster-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.poster-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx;
	}

	.poster-card {
		width: 500rpx;
		background: linear-gradient(180deg, #fff 0%, #f5f9ff 100%);
		border-radius: 24rpx;
		padding: 48rpx 40rpx 40rpx;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
	}

	.poster-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.poster-factory-name {
		font-size: 36rpx;
		font-weight: 700;
		color: #333;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.poster-verified-badge {
		font-size: 20rpx;
		color: #fff;
		background: linear-gradient(135deg, #3c9cff, #1890ff);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		margin-left: 12rpx;
		flex-shrink: 0;
	}

	.poster-address {
		display: flex;
		align-items: flex-start;
		margin-bottom: 28rpx;
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid #eee;
	}

	.poster-address-icon {
		font-size: 24rpx;
		margin-right: 8rpx;
		flex-shrink: 0;
	}

	.poster-address-text {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		flex: 1;
	}

	.poster-categories {
		margin-bottom: 28rpx;
	}

	.poster-cat-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.poster-cat-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.poster-cat-item {
		display: flex;
		align-items: center;
		background-color: #f0f7ff;
		padding: 12rpx 20rpx;
		border-radius: 10rpx;
	}

	.poster-cat-name {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}

	.poster-bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 32rpx;
		border-top: 1rpx solid #eee;
	}

	.poster-qrcode {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.poster-qr-box {
		width: 200rpx;
		height: 200rpx;
		background: repeating-linear-gradient(
			45deg,
			#333,
			#333 4rpx,
			#fff 4rpx,
			#fff 8rpx
		);
		border: 2rpx solid #333;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.poster-qr-temp {
		font-size: 24rpx;
		color: #333;
		background-color: #fff;
		padding: 8rpx 16rpx;
		border-radius: 6rpx;
	}

	.poster-qr-tip {
		font-size: 22rpx;
		color: #666;
		margin-top: 12rpx;
	}

	.poster-slogan {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.poster-slogan-main {
		font-size: 32rpx;
		font-weight: 700;
		color: #333;
		margin-bottom: 8rpx;
	}

	.poster-slogan-sub {
		font-size: 24rpx;
		color: #999;
	}

	.poster-actions {
		margin-top: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.poster-save-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 24rpx 80rpx;
		border-radius: 999rpx;
		margin-bottom: 20rpx;
	}

	.poster-save-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}

	.poster-close {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
	}
</style>