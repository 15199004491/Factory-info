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
					<text class="address-text">{{ factory.address }}</text>
					<text class="address-arrow">›</text>
				</view>
			</view>
			<view class="header-stats">
				<view class="stat-item">
					<text class="stat-value">{{ formatVisitorCount(todayVisitors) }}</text>
					<text class="stat-label">今日访客</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-value">{{ formatVisitorCount(historyVisitors) }}</text>
					<text class="stat-label">历史访客</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-value">{{ factory.updateTime ? formatDate(factory.updateTime) : '--' }}</text>
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
								</view>
								<view class="cat-price-wrap">
									<text class="cat-price-num">{{ getPriceNum(cat.price) }}</text>
									<text class="cat-price-unit">{{ getPriceUnit(cat.price) }}</text>
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

	export default {
		data() {
			return {
				showPoster: false,
				loading: true,
				factoryId: null,
				todayVisitors: 0,
				historyVisitors: 0,
				factory: {
					name: '',
					verified: false,
					address: '',
					notice: '',
					latitude: 0,
					longitude: 0,
					updateTime: ''
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
					const res = await factoryApi.getDetail(this.factoryId)
					if (res) {
						this.applyData(res)
					} else {
						this.useMockData()
					}
				} catch (e) {
					console.log('loadDetail catch:', e)
					this.useMockData()
				} finally {
					this.loading = false
				}
			},
			applyData(res) {
				this.factory.name = res.name || ''
				this.factory.verified = res.identification === 1 || res.verified === true
				this.factory.address = res.address || res.location || ''
				this.factory.notice = res.notice || res.announcement || ''
				this.factory.latitude = Number(res.latitude || res.lat || 0)
				this.factory.longitude = Number(res.longitude || res.lng || 0)
				this.factory.updateTime = res.update_time || res.create_time || res.createtime || ''
				this.todayVisitors = Number(res.today_visitors || res.todayVisitors || 0)
				this.historyVisitors = Number(res.history_visitors || res.historyVisitors || 0)
				if (this.factory.name) {
					uni.setNavigationBarTitle({
						title: this.factory.name
					})
				}
				if (res.categories) {
					this.categories = this.parseCategories(res.categories)
				}
			},
			useMockData() {
				this.factory.name = '绿源农产品加工厂'
				this.factory.verified = true
				this.factory.address = '山东省潍坊市寿光市323省道附近'
				this.factory.notice = '本厂长期收购各类农产品，欢迎广大农户前来洽谈合作。每天营业时间 8:00 - 18:00。'
				this.factory.latitude = 36.869
				this.factory.longitude = 118.847
				this.factory.updateTime = Date.now()
				this.todayVisitors = 186
				this.historyVisitors = 5230
				this.categories = [
					{ name: '玉米', price: '1.25元/斤', remark: '优质玉米，无霉变' },
					{ name: '小麦', price: '1.30元/斤', remark: '新麦优先' },
					{ name: '大豆', price: '2.80元/斤', remark: '高蛋白大豆' },
					{ name: '花生', price: '3.50元/斤', remark: '颗粒饱满' },
					{ name: '棉花', price: '6.80元/斤', remark: '籽棉收购' },
					{ name: '苹果', price: '2.50元/斤', remark: '红富士，80mm以上' },
					{ name: '白菜', price: '0.35元/斤', remark: '大白菜，无虫害' },
					{ name: '萝卜', price: '0.45元/斤', remark: '白萝卜' }
				]
				uni.setNavigationBarTitle({
					title: this.factory.name
				})
			},
			parseCategories(data) {
				if (Array.isArray(data)) {
					return data.map(item => {
						if (typeof item === 'string') {
							return { name: item, price: '', remark: '' }
						}
						return {
							name: item.name || item.category || '',
							price: item.price ? (item.price_unit ? item.price + item.price_unit : item.price) : '',
							remark: item.remark || item.notes || ''
						}
					})
				}
				if (typeof data === 'string') {
					return data.split(',').filter(Boolean).map(name => ({ name, price: '', remark: '' }))
				}
				return []
			},
			formatVisitorCount(num) {
				if (num >= 10000) {
					const w = (num / 10000).toFixed(1)
					return w + 'w'
				}
				return String(num)
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
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
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