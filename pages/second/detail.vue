<template>
	<view class="page">
		<view class="detail-header">
			<image-placeholder :src="house.second_image" mode="aspectFill" :previewable="true" />
		</view>

		<view class="detail-section">
			<view class="price-row">
				<view class="price-left">
					<text class="detail-price">{{ house.price }}</text>
					<text class="detail-unit">万</text>
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
				<text class="info-label">户型</text>
				<text class="info-value">{{ house.houseType }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">面积</text>
				<text class="info-value">{{ house.area }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">楼层</text>
				<text class="info-value">{{ house.floor }}</text>
			</view>
		</view>

		<view class="detail-section">
			<text class="section-title">位置信息</text>
			<view class="location-row" v-if="house.region">
				<text class="location-label">地区</text>
				<text class="location-value">{{ house.region }}</text>
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
			<text v-if="house.description" class="detail-content">{{ house.description }}</text>
			<view v-else class="empty-desc">
				<text class="empty-desc-text">暂无信息</text>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="action-btn contact-btn" @tap="onContact">
				<text class="btn-label">联系电话</text>
			</view>
			<!-- <view class="action-btn reserve-btn" @tap="onReserve">
				<text class="btn-label">预约看房</text>
			</view> -->
			<button class="action-btn share-btn" open-type="share">
				<text class="btn-label">分享</text>
			</button>
		</view>

		<reserve-sheet ref="reserveSheet" :visible="showReserveSheet" @update:visible="v => showReserveSheet = v" :house-id="houseId" house-type="second" />
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
	import reserveSheet from '@/components/reserve-sheet/reserve-sheet.vue'
	import { secondHouseApi, userApi } from '@/utils/request.js'
	import { formatCosUrl } from '@/utils/config.js'
	import { isShareEnterFirstTimeThenConsume } from '@/utils/date.js'

	export default {
		components: {
			uIcon,
			imagePlaceholder,
			reserveSheet
		},
		data() {
			return {
				houseId: 0,
				showMoreBtn: false,
				visitors: 0,
				showReserveSheet: false,
				house: {
					id: 0,
					title: '',
					desc: '',
					price: '',
					second_image: '',
					houseType: '',
					area: '',
					floor: '',
					mobile: '',
					name: '',
					region: '',
					latitude: 0,
					longitude: 0,
					addressText: '',
					hasCoord: false,
					description: '',
					open_id: ''
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
					const data = await secondHouseApi.getDetail(this.houseId)
					const loc = this.parseLocation(data)
					const lat = Number(loc ? loc.latitude : (data.latitude || 0))
					const lng = Number(loc ? loc.longitude : (data.longitude || 0))
					const address = loc ? (loc.address || '') : ''
					this.house = {
						id: data.id,
						title: data.title,
						desc: `${data.acreage || ''}㎡ · ${data.shape || ''}`,
						price: data.price,
						second_image: data.second_image,
						houseType: data.shape || '',
						area: (data.acreage || '') + '㎡',
						floor: data.floor || '',
						mobile: data.mobile || '',
						name: data.name || '',
						region: data.area || data.region || '',
						latitude: lat,
						longitude: lng,
						addressText: address,
						hasCoord: !!(lat && lng && lat !== 0 && lng !== 0),
						description: data.explain || data.description || '',
						open_id: data.open_id || data.openid || ''
					}
					this.visitors = data.count || data.visitors || 0
				} catch (e) {}
			},
			onContact() {
				if (!this.house.mobile) {
					uni.showToast({ title: '暂无联系电话', icon: 'none' })
					return
				}
				uni.showModal({
					title: '温馨提示',
					content: '拨通后说你来自「加蜂小程序」对方更热情哦~',
					confirmText: '立即拨打',
					cancelText: '再想想',
					success: (res) => {
						if (!res.confirm) return
						if (this.house.open_id) {
							userApi.incCallCount(this.house.open_id).catch(() => {})
						}
						uni.makePhoneCall({
							phoneNumber: this.house.mobile
						}).catch(err => {
							if (err && err.errMsg && /cancel/i.test(err.errMsg)) return
							if (err && err.errMsg) console.warn('拨号失败:', err.errMsg)
						})
					}
				})
			},
			onReserve() {
				this.showReserveSheet = true
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
				const imgUrl = formatCosUrl(this.house.second_image)
				const title = this.house.name || this.house.title || '二手房房源'
				const path = '/pages/second/detail?id=' + this.houseId
				const share = {
					title: title,
					path: path
				}
				if (imgUrl) share.imageUrl = imgUrl
				return share
			},
			onShareTimeline() {
				const title = this.house.name || this.house.title || '二手房房源'
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
		width: 33.33%;
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
		background: #3c9cff;
		border: none;
	}

	.contact-btn .btn-label {
		color: #fff;
	}

	.reserve-btn {
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