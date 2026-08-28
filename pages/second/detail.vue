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
			<view class="location-row">
				<view class="location-left">
					<text class="location-label">地区</text>
					<text class="location-value">{{ house.region }}{{ house.address ? ' ' + house.address : '' }}</text>
				</view>
			</view>
			<view class="location-row">
				<view class="location-left">
					<text class="location-label">小区</text>
					<text class="location-value">{{ house.name }}</text>
				</view>
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
				<text class="btn-label">联系房东</text>
			</view>
			<button class="action-btn share-btn" open-type="share">
				<text class="btn-label">分享</text>
			</button>
			<view class="action-btn more-btn" @tap="onGoMore">
				<text class="btn-label">更多房源</text>
			</view>
		</view>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
	import { secondHouseApi } from '@/utils/request.js'
	import { formatCosUrl } from '@/utils/config.js'

	export default {
		components: {
			uIcon,
			imagePlaceholder
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
					second_image: '',
					houseType: '',
					area: '',
					floor: '',
					phone: '',
					name: '',
					region: '',
					address: '',
					latitude: 0,
					longitude: 0,
					description: ''
				}
			}
		},
		computed: {
			mapMarkers() {
				if (this.house.latitude && this.house.longitude) {
					return [{
						id: 1,
						latitude: this.house.latitude,
						longitude: this.house.longitude,
						title: this.house.name,
						width: 32,
						height: 32
					}]
				}
				return []
			}
		},
		onLoad(options) {
			if (options.id) {
				this.houseId = parseInt(options.id)
				this.loadHouseDetail()
			}
			if (options && options.from === 'share') {
				this.showMoreBtn = true
			}
		},
		methods: {
			async loadHouseDetail() {
				try {
					const data = await secondHouseApi.getDetail(this.houseId)
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
						region: data.region || '',
						address: data.area || data.location_name || data.location || '',
						latitude: data.latitude || 0,
						longitude: data.longitude || 0,
						description: data.explain || data.description || ''
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
			onOpenMap() {
				uni.navigateTo({
					url: '/pages/second/map?latitude=' + this.house.latitude + '&longitude=' + this.house.longitude + '&title=' + encodeURIComponent(this.house.name)
				})
			},
			onShareAppMessage() {
				const imgUrl = formatCosUrl(this.house.second_image)
				const share = {
					title: this.house.name || this.house.title || '二手房房源',
					path: '/pages/second/detail?id=' + this.houseId + '&from=share'
				}
				if (imgUrl) share.imageUrl = imgUrl
				return share
			},
			onShareTimeline() {
				return {
					title: this.house.name || this.house.title || '二手房房源',
					query: 'id=' + this.houseId + '&from=share'
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

	.location-row-link {
		cursor: pointer;
	}

	.map-wrap {
		margin-top: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.detail-map {
		width: 100%;
		height: 360rpx;
	}

	.location-left {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.location-label {
		font-size: 26rpx;
		color: #999;
	}

	.location-value {
		font-size: 26rpx;
		color: #333;
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