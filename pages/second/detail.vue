<template>
	<view class="page">
		<view class="detail-header">
			<image class="detail-image" :src="house.image" mode="aspectFill" />
		</view>

		<view class="detail-section">
			<view class="price-row">
				<text class="detail-price">{{ house.price }}</text>
				<text class="detail-unit">万</text>
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
			<view class="info-item">
				<text class="info-label">朝向</text>
				<text class="info-value">{{ house.orientation }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">装修</text>
				<text class="info-value">{{ house.decoration }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">年代</text>
				<text class="info-value">{{ house.year }}</text>
			</view>
		</view>

		<view class="detail-section">
			<text class="section-title">位置信息</text>
			<view class="location-row">
				<text class="location-label">小区</text>
				<text class="location-value">{{ house.community }}</text>
			</view>
			<view class="location-row location-row-link" @tap="onOpenMap">
				<view class="location-left">
					<text class="location-label">地区</text>
					<text class="location-value">{{ house.region }}</text>
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
			<text class="detail-content">{{ house.description }}</text>
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

	export default {
		components: {
			uIcon
		},
		data() {
			return {
				houseId: 0,
				house: {
					id: 0,
					title: '',
					desc: '',
					price: '',
					image: '',
					houseType: '',
					area: '',
					floor: '',
					orientation: '',
					decoration: '',
					year: '',
					community: '',
					region: '',
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
						title: this.house.community,
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
			loadHouseDetail() {
				var detailMap = {
					1: {
						id: 1,
						title: '阳光花园 3室2厅',
						desc: '120㎡ · 南北通透 · 精装修',
						price: '128',
						image: 'https://img.alicdn.com/imgextra/i3/6000000002334/O1CN01w2M5v81FmR5KjP1z_!!600000000472-0-yinhe.jpg',
						houseType: '3室2厅1卫',
						area: '120㎡',
						floor: '中层/6层',
						orientation: '南北',
						decoration: '精装修',
						year: '2015年',
						community: '阳光花园',
						region: '兵团 农一师',
						latitude: 41.167,
						longitude: 80.261,
						description: '本房源位于阳光花园核心区域，交通便利，周边配套完善。房屋南北通透，采光极佳，精装修拎包入住。小区环境优美，绿化率高，适合居住。'
					},
					2: {
						id: 2,
						title: '翠湖天地 2室1厅',
						desc: '89㎡ · 湖景房 · 电梯房',
						price: '95',
						image: 'https://img.alicdn.com/imgextra/i2/6000000002334/O1CN01w2M5v91FmR5KjP2z_!!600000000472-0-yinhe.jpg',
						houseType: '2室1厅1卫',
						area: '89㎡',
						floor: '高层/18层',
						orientation: '正南',
						decoration: '简装',
						year: '2018年',
						community: '翠湖天地',
						region: '地方 乌鲁木齐市',
						latitude: 43.8256,
						longitude: 87.6168,
						description: '翠湖天地湖景房源，视野开阔，可赏湖景。电梯公寓，出行便利。周边有多个商圈，购物方便。'
					},
					3: {
						id: 3,
						title: '金色家园 4室2厅',
						desc: '160㎡ · 复式结构 · 带露台',
						price: '186',
						image: 'https://img.alicdn.com/imgextra/i4/6000000002334/O1CN01w2M5vA1FmR5KjP3z_!!600000000472-0-yinhe.jpg',
						houseType: '4室2厅2卫',
						area: '160㎡',
						floor: '跃层/12层',
						orientation: '南北',
						decoration: '豪华装修',
						year: '2016年',
						community: '金色家园',
						region: '兵团 农八师',
						latitude: 44.3018,
						longitude: 86.0142,
						description: '金色家园复式豪宅，带私家露台，视野极佳。豪华装修，配置高端。小区配套完善，有健身房、游泳池等设施。'
					},
					4: {
						id: 4,
						title: '东方明珠 1室1厅',
						desc: '55㎡ · 单身公寓 · 地铁口',
						price: '58',
						image: 'https://img.alicdn.com/imgextra/i1/6000000002334/O1CN01w2M5vB1FmR5KjP4z_!!600000000472-0-yinhe.jpg',
						houseType: '1室1厅1卫',
						area: '55㎡',
						floor: '低层/6层',
						orientation: '南',
						decoration: '普装',
						year: '2012年',
						community: '东方明珠',
						region: '地方 乌鲁木齐市',
						latitude: 43.8206,
						longitude: 87.6128,
						description: '东方明珠单身公寓，适合年轻人居住。紧邻地铁口，出行方便。周边生活设施齐全，超市、餐饮应有尽有。'
					},
					5: {
						id: 5,
						title: '绿地世纪城 3室2厅',
						desc: '135㎡ · 精装修 · 学区房',
						price: '156',
						image: 'https://img.alicdn.com/imgextra/i3/6000000002334/O1CN01w2M5v81FmR5KjP1z_!!600000000472-0-yinhe.jpg',
						houseType: '3室2厅2卫',
						area: '135㎡',
						floor: '中层/11层',
						orientation: '南北',
						decoration: '精装修',
						year: '2017年',
						community: '绿地世纪城',
						region: '地方 昌吉州',
						latitude: 44.0194,
						longitude: 87.3164,
						description: '绿地世纪城学区房，对口重点学校，教育资源丰富。房屋精装修，户型方正，南北通透。小区环境好，物业管理规范。'
					},
					6: {
						id: 6,
						title: '海景公寓 2室2厅',
						desc: '98㎡ · 海景房 · 南北通透',
						price: '112',
						image: 'https://img.alicdn.com/imgextra/i2/6000000002334/O1CN01w2M5v91FmR5KjP2z_!!600000000472-0-yinhe.jpg',
						houseType: '2室2厅1卫',
						area: '98㎡',
						floor: '高层/22层',
						orientation: '南北',
						decoration: '精装修',
						year: '2019年',
						community: '海景公寓',
						region: '地方 吐鲁番市',
						latitude: 42.9513,
						longitude: 89.1895,
						description: '海景公寓高层海景房，视野无敌，可俯瞰整个海景。房屋南北通透，采光通风俱佳。周边有多个旅游景点，适合度假居住。'
					}
				}
				if (detailMap[this.houseId]) {
					this.house = detailMap[this.houseId]
				}
			},
			onContact() {
				uni.showToast({
					title: '正在联系房东...',
					icon: 'none'
				})
			},
			onOpenMap() {
				uni.navigateTo({
					url: '/pages/second/map?latitude=' + this.house.latitude + '&longitude=' + this.house.longitude + '&title=' + encodeURIComponent(this.house.community)
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

	.detail-image {
		width: 100%;
		height: 100%;
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