<template>
	<view class="page">
		<view class="detail-header">
			<image class="detail-image" :src="house.image" mode="aspectFill" />
			<view class="tag-row">
				<text class="tag-item" :class="house.tagType === 'shared' ? 'tag-shared' : 'tag-entire'">{{ house.tag }}</text>
			</view>
		</view>

		<view class="detail-section">
			<view class="price-row">
				<text class="detail-price">{{ house.price }}</text>
				<text class="detail-unit">/月</text>
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
			<view class="location-row">
				<text class="location-label">小区</text>
				<text class="location-value">{{ house.name }}</text>
			</view>
			<view class="location-row location-row-link" @tap="onOpenMap">
				<view class="location-left">
					<text class="location-label">地区</text>
					<text class="location-value">{{ house.area }}</text>
				</view>
				<u-icon name="map" size="20" color="#3c9cff"></u-icon>
			</view>
			<view class="map-wrap" @tap="onOpenMap">
				<map
					class="detail-map"
					:latitude="house.latitude"
					:longitude="house.longitude"
					:markers="mapMarkers"
					scale="16"
					show-location
				></map>
			</view>
		</view>

		<view class="detail-section">
			<text class="section-title">房源描述</text>
			<text class="detail-content">{{ house.explain }}</text>
		</view>

		<view class="bottom-bar">
			<view class="bar-btn bar-contact" @tap="onContact">
				<text class="bar-icon">联系房东</text>
			</view>
		</view>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import { rentApi } from '@/utils/request.js'

	export default {
		components: {
			uIcon
		},
		data() {
			return {
				houseId: 0,
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
					floor: '',
					payment: '',
					name: '',
					area: '',
					latitude: 0,
					longitude: 0,
					explain: '',
					mobile: ''
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
		},
		methods: {
			async loadHouseDetail() {
				try {
					const data = await rentApi.rentDetail({ Id: this.houseId })
					this.house = {
						id: data.Id || data.id,
						title: data.title,
						desc: `${data.acreage || ''}㎡ · ${data.floor || ''}`,
						price: (data.price || '') + '元/月',
						tag: data.tagType === 'shared' ? '合租' : '整租',
						tagType: data.tagType || 'entire',
						image: data.rent_image || data.image || '',
						acreage: (data.acreage || '') + '㎡',
						floor: data.floor || '',
						payment: data.payment || '',
						name: data.name || data.community || '',
						area: data.area || data.region || '',
						latitude: data.latitude || 0,
						longitude: data.longitude || 0,
						explain: data.explain || data.description || '',
						mobile: data.mobile || ''
					}
					this.visitors = data.count || data.visitors || 0
				} catch (e) {}
			},
			onContact() {
				if (this.house.mobile) {
					uni.makePhoneCall({
						phoneNumber: this.house.mobile
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
		align-items: baseline;
		margin-bottom: 16rpx;
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

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 120rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.bar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		border-radius: 40rpx;
	}

	.bar-contact {
		flex: 1;
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.bar-contact .bar-icon {
		color: #fff;
		font-weight: 500;
	}

	.bar-icon {
		font-size: 28rpx;
	}
</style>