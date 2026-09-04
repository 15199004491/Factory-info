<template>
	<view class="page">
		<view class="detail-header">
			<image-placeholder class="detail-image" :src="house.image" mode="aspectFill" :previewable="true" />
		</view>

		<view class="detail-section">
			<view class="price-row">
				<view class="price-left">
					<text class="detail-price">{{ house.price }}</text>
					<text class="detail-unit">元/月</text>
				</view>
				<view class="visitor-pill">
					<text class="visitor-num">{{ visitors }}</text>
					<text class="visitor-label">人看过</text>
				</view>
			</view>
			<text class="detail-title">{{ house.title }}</text>
			<text class="detail-desc">{{ house.desc }}</text>
		</view>

		<view class="detail-section info-section">
			<view class="info-item">
				<text class="info-label">面积</text>
				<text class="info-value">{{ house.acreage }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">租赁方式</text>
				<text class="info-value">{{ house.tag }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">楼层</text>
				<text class="info-value">{{ house.floor }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">付款方式</text>
				<text class="info-value">{{ house.payment }}</text>
			</view>
		</view>

		<view class="detail-section">
			<text class="section-title">位置信息</text>
			<view class="location-row" v-if="house.area">
				<text class="location-label">地区</text>
				<text class="location-value">{{ house.area }}</text>
			</view>
			<view class="location-row" v-if="house.name">
				<text class="location-label">小区</text>
				<text class="location-value">{{ house.name }}</text>
			</view>
			<view class="address-row" v-if="house.addressText" @tap="openLocation">
				<text class="location-label">地点</text>
				<text class="address-text">{{ house.addressText }}</text>
				<text class="address-arrow">›</text>
			</view>
		</view>

		<view class="detail-section">
			<text class="section-title">房源描述</text>
			<text v-if="house.explain" class="detail-content">{{ house.explain }}</text>
			<view v-else class="empty-desc">
				<text class="empty-desc-text">暂无信息</text>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="action-btn contact-btn" @tap="onContact">
				<text class="btn-label">联系房东</text>
			</view>
			<button class="action-btn share-btn" open-type="share">
				<text class="btn-label">分享</text>
			</button>
			<view class="action-btn more-btn" @tap="onGoMore" v-if="showMoreBtn">
				<text class="btn-label">更多房源</text>
			</view>
		</view>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import { rentApi } from '@/utils/request.js'
	import { formatCosUrl } from '@/utils/config.js'
	import { isShareEnterFirstTimeThenConsume } from '@/utils/date.js'

	export default {
		components: {
			uIcon,
			imagePlaceholder: () => import('@/components/image-placeholder/image-placeholder.vue')
		},
		data() {
			return {
				houseId: 0,
				showMoreBtn: false,
				visitors: 0,
				house: {
					id: 0,
					title: '',
					desc: '',
					price: '',
					tag: '',
					tagType: '',
					image: '',
					acreage: '',
					shape: '',
					floor: '',
					payment: '',
					name: '',
					area: '',
					explain: '',
					mobile: '',
					latitude: 0,
					longitude: 0,
					addressText: '',
					hasCoord: false
				}
			}
		},
		computed: {},
		onLoad(options) {
			if (options.id) {
				this.houseId = parseInt(options.id)
				this.loadHouseDetail()
			}
			if (isShareEnterFirstTimeThenConsume()) {
				this.showMoreBtn = true
			}
		},
		methods: {
			parseLocation(data) {
				if (!data.location) return null
				if (typeof data.location === 'string') {
					try { return JSON.parse(data.location) } catch (e) { return null }
				}
				return data.location
			},
			async loadHouseDetail() {
				try {
					const data = await rentApi.rentDetail({ Id: this.houseId })
					const loc = this.parseLocation(data)
					const lat = Number(loc ? loc.latitude : (data.latitude || 0))
					const lng = Number(loc ? loc.longitude : (data.longitude || 0))
					const address = loc ? (loc.address || '') : ''
					this.house = {
						id: data.Id || data.id,
						title: data.title,
						desc: `${data.acreage || ''}㎡ · ${data.floor || ''}`,
						price: data.price,
						tag: data.tag_type === 'shared' ? '合租' : '整租',
						tagType: data.tag_type || 'entire',
						image: data.rent_image || data.rentImage || data.image || data.img || '',
						acreage: (data.acreage || '') + '㎡',
						shape: data.shape || '',
						floor: data.floor || '',
						payment: data.pay_type || '',
						name: data.name || data.community || '',
						area: data.area_name || data.area || data.region || '',
						explain: data.explain || data.description || '',
						mobile: data.mobile || '',
						latitude: lat,
						longitude: lng,
						addressText: address,
						hasCoord: !!(lat && lng && lat !== 0 && lng !== 0)
					}
					this.visitors = data.count || data.visitors || 0
				} catch (e) {}
			},
			onContact() {
				if (this.house.mobile) {
					uni.makePhoneCall({
						phoneNumber: this.house.mobile
					}).catch(err => {
						if (err && err.errMsg && /cancel/i.test(err.errMsg)) return
						if (err && err.errMsg) console.warn('拨号失败:', err.errMsg)
					})
				} else {
					uni.showToast({
						title: '暂无联系电话',
						icon: 'none'
					})
				}
			},
			openLocation() {
				if (!this.house.hasCoord) {
					uni.showToast({ title: '该房源暂无位置信息', icon: 'none' })
					return
				}
				uni.openLocation({
					latitude: this.house.latitude,
					longitude: this.house.longitude,
					name: this.house.name || this.house.title || '房源位置',
					address: this.house.addressText,
					scale: 16
				})
			},
			onShareAppMessage() {
				const imgUrl = formatCosUrl(this.house.image)
				const title = this.house.name || this.house.title || '租房房源'
				const path = '/pages/rent/detail?id=' + this.houseId
				const share = {
					title: title,
					path: path
				}
				if (imgUrl) share.imageUrl = imgUrl
				return share
			},
			onShareTimeline() {
				const title = this.house.name || this.house.title || '租房房源'
				return {
					title: title,
					query: 'id=' + this.houseId
				}
			},
			onGoMore() {
				uni.switchTab({
					url: '/pages/index/index'
				})
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
		width: 100%;
		height: 500rpx;
		position: relative;
	}

	.detail-image {
		width: 100%;
		height: 100%;
	}

	.tag-row {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		display: flex;
		gap: 12rpx;
	}

	.tag-item {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
	}

	.tag-entire {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.9);
	}

	.tag-shared {
		color: #ff9a56;
		background-color: rgba(255, 154, 86, 0.9);
	}

	.detail-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.price-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.price-left {
		display: flex;
		align-items: baseline;
	}

	.visitor-pill {
		display: inline-flex;
		align-items: center;
		padding: 6rpx 0;
	}

	.visitor-num {
		font-size: 24rpx;
		color: #999;
	}

	.visitor-label {
		font-size: 24rpx;
		color: #999;
		margin-left: 4rpx;
	}

	.detail-price {
		font-size: 56rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.detail-unit {
		font-size: 26rpx;
		color: #ff6b35;
		margin-left: 8rpx;
	}

	.detail-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.detail-desc {
		font-size: 26rpx;
		color: #999;
	}

	.info-section {
		display: flex;
		flex-wrap: wrap;
	}

	.info-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-label {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 8rpx;
	}

	.info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.location-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.location-label {
		font-size: 26rpx;
		color: #999;
		flex: 1
	}

	.location-value {
		font-size: 26rpx;
		color: #333;
	}

	.address-row {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 16rpx 0;
	}

	.address-text {
		flex: 8;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.address-arrow {
		font-size: 30rpx;
		color: #ccc;
	}

	.detail-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
	}

	.empty-desc {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
	}

	.empty-desc-text {
		font-size: 26rpx;
		color: #999;
		margin-top: 16rpx;
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
		border: none;
		line-height: 1;
	}

	.contact-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.share-btn {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.more-btn {
		background: #fff;
		border: 2rpx solid #3c9cff;
	}

	.more-btn .btn-label {
		color: #3c9cff;
		font-size: 28rpx;
	}

	.share-btn::after {
		border: none;
	}

	.btn-label {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}
</style>