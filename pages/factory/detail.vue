<template>
	<view class="page">

		<view class="header-card">
			<view class="header-top">
				<view class="factory-title-row">
					<text class="factory-name">{{ factory.name }}</text>
					<text class="verified-tag" v-if="factory.verified">已认证</text>
				</view>
				<view class="address-row" @tap="openLocation">
					<u-icon name="map" size="14" color="rgba(255,255,255,0.85)"></u-icon>
					<text class="address-text">{{ factory.location.address }}</text>
					<text class="address-arrow">›</text>
				</view>
			</view>
			<view class="header-stats">
				<view class="stat-item">
					<text class="stat-value">{{ formatVisitorCount(factory.today_count) }}</text>
					<text class="stat-label">今日访客</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-value">{{ formatVisitorCount(factory.count) }}</text>
					<text class="stat-label">历史访客</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-value">{{ factory.update_time ? formatDate(factory.update_time) : '--' }}</text>
					<text class="stat-label">更新时间</text>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-area" :show-scrollbar="false">
			<view class="scroll-inner">
				<view class="module-card">
					<view class="section-header">
						<view class="section-title-bar"></view>
						<text class="section-title">通知</text>
					</view>
					<view class="notice-body" v-if="factory.notice">
						<text class="notice-text">{{ factory.notice }}</text>
					</view>
					<view class="empty-tip" v-else>
						<text class="empty-tip-text">暂无通知</text>
					</view>
				</view>

				<view class="module-card">
					<view class="section-header">
						<view class="section-title-bar"></view>
						<text class="section-title">品类价格</text>
					</view>
					<view class="category-list" v-if="categories.length > 0">
						<view class="category-item" v-for="(cat, idx) in categories" :key="idx">
							<view class="cat-main">
								<view class="cat-info">
									<text class="cat-name">{{ cat.name }}</text>
									<text class="cat-status-tag" :class="{ active: cat.status === '收购中', paused: cat.status === '暂停收购' }">{{ cat.status }}</text>
								</view>
								<view class="cat-price-wrap">
									<text class="cat-price-num">{{ getPriceNum(cat.price) }}</text>
									<text class="cat-price-unit">/{{ getPriceUnit(cat.price) }}</text>
								</view>
							</view>
							<view class="cat-remark" v-if="cat.remark">
								<text class="cat-remark-text">{{ cat.remark }}</text>
							</view>
						</view>
					</view>
					<view class="empty-tip" v-else>
						<text class="empty-tip-text">暂无品类信息</text>
					</view>
				</view>
				<safe-bottom :height="130"></safe-bottom>
			</view>
		</scroll-view>

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
	import { factoryApi } from '@/utils/request.js'
	import { formatVisitorCount, formatDate } from '@/utils/date.js'

	export default {
		data() {
			return {
				showPoster: false,
				loading: true,
				factoryId: null,
				factory: {
					name: '',
					verified: false,
					address: '',
					notice: '',
					latitude: 0,
					longitude: 0,
					update_time: ''
				},
				categories: []
			}
		},
		onLoad(options) {
			if (options && options.Id) {
				this.factoryId = options.Id
			}
			if (options && options.name) {
				this.factory.name = decodeURIComponent(options.name)
				uni.setNavigationBarTitle({
					title: this.factory.name
				})
			}
			uni.hideShareMenu()
			this.loadDetail()
		},
		onShareAppMessage() {
			return {
				title: this.factory.name + ' - 收购信息',
				path: '/pages/factory/detail?name=' + encodeURIComponent(this.factory.name)
			}
		},
		methods: {
			async loadDetail() {
				if (!this.factoryId) {
					this.loading = false
					return
				}
				this.loading = true
				try {
					this.factory = await factoryApi.getDetail(this.factoryId)
					this.categories = this.parseCategories(this.factory.category)
				} catch (e) {
					console.error('loadDetail错误:', e)
					uni.showToast({ title: '加载失败，请重试', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			parseCategories(data) {
				if (!data) return []
				if (Array.isArray(data)) {
					return data.map(item => {
						if (typeof item === 'string') {
							return { name: item, price: '', remark: '' }
						}
						const priceVal = item.price ? String(item.price) : ''
						const unitVal = item.unit || item.price_unit || ''
						return {
							name: item.name || item.category || '',
							price: priceVal ? priceVal + (unitVal || '') : '',
							status: item.status == 1 ? '收购中' : '暂停收购',
							remark: item.remark || item.notes || ''
						}
					})
				}
				if (typeof data === 'string') {
					return data.split(',').filter(Boolean).map(name => ({ name, price: '', remark: '' }))
				}
				return []
			},
			formatVisitorCount,
			getPriceNum(priceStr) {
				const match = priceStr.match(/[\d.]+/)
				return match ? match[0] : priceStr
			},
			getPriceUnit(priceStr) {
				const match = priceStr.match(/[^\d.]+/)
				return match ? match[0] : ''
			},
			formatDate,
			openLocation() {
				const {latitude, longitude,address} = this.factory.location
				uni.openLocation({
					latitude,
					longitude,
					name: this.factory.name,
					address,
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
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
		overflow: hidden;
	}

	.header-card {
		background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
		padding: 40rpx 32rpx 120rpx;
		position: relative;
		flex-shrink: 0;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.header-top {
		position: relative;
		z-index: 1;
	}

	.factory-title-row {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.factory-name {
		font-size: 40rpx;
		font-weight: 700;
		color: #fff;
	}

	.verified-tag {
		font-size: 22rpx;
		color: #fff;
		background-color: rgba(255, 255, 255, 0.25);
		border: 1rpx solid rgba(255, 255, 255, 0.5);
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		margin-left: 16rpx;
		flex-shrink: 0;
		font-weight: 500;
	}

	.address-row {
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 12rpx;
		padding: 18rpx 20rpx;
	}

	.address-row .u-icon {
		margin-right: 10rpx;
		flex-shrink: 0;
	}

	.address-text {
		flex: 1;
		font-size: 28rpx;
		color: #fff;
		line-height: 1.5;
	}

	.address-arrow {
		font-size: 36rpx;
		color: rgba(255, 255, 255, 0.8);
		flex-shrink: 0;
	}

	.header-stats {
		position: absolute;
		left: 24rpx;
		right: 24rpx;
		bottom: -60rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 32rpx 24rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #3c9cff;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-size: 24rpx;
		color: #999;
	}

	.stat-divider {
		width: 1rpx;
		height: 48rpx;
		background-color: #eee;
	}

	.scroll-area {
		flex: 1;
		overflow: hidden;
	}

	.scroll-inner {
		padding: 80rpx 24rpx 0;
	}

	.module-card {
		background-color: #fff;
		margin-bottom: 24rpx;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.module-card:last-child {
		margin-bottom: 0;
	}

	.empty-tip {
		padding: 48rpx 24rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.empty-tip-text {
		font-size: 26rpx;
		color: #bbb;
	}

	.section-header {
		display: flex;
		align-items: center;
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.section-title-bar {
		width: 6rpx;
		height: 28rpx;
		background: linear-gradient(180deg, #3c9cff, #5ac8fa);
		border-radius: 3rpx;
		margin-right: 12rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.notice-body {
		padding: 24rpx;
	}

	.notice-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	.category-list {
		padding: 0 24rpx 16rpx;
	}

	.category-item {
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.category-item:last-child {
		border-bottom: none;
	}

	.cat-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cat-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.cat-status-tag {
		font-size: 20rpx;
		color: #ff4d4f;
		background-color: #fff1f0;
		border-color: #ffa39e;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-weight: 400;
	}

	.cat-status-tag.active {
		color: #52c41a;
		background-color: #f6ffed;
		border: 1rpx solid #b7eb8f;
	}

	.cat-price-wrap {
		display: flex;
		align-items: baseline;
	}

	.cat-price-num {
		font-size: 38rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.cat-price-unit {
		font-size: 24rpx;
		font-weight: 600;
		color: #ff5722;
		margin-left: 4rpx;
	}

	.cat-remark {
		margin-top: 16rpx;
	}

	.cat-remark-text {
		font-size: 26rpx;
		color: #999;
		line-height: 1.5;
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
		align-items: center;
		justify-content: center;
		padding: 24rpx 0;
		margin: 0 12rpx;
		border-radius: 16rpx;
	}

	.poster-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.share-btn {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.btn-label {
		font-size: 30rpx;
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
		justify-content: center;
		background-color: #f0f7ff;
		padding: 12rpx 20rpx;
		border-radius: 10rpx;
		width: calc(50% - 8rpx);
		box-sizing: border-box;
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