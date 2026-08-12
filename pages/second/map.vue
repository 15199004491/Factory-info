<template>
	<view class="page">
		<map
			class="map"
			:latitude="latitude"
			:longitude="longitude"
			:markers="markers"
			scale="16"
		></map>

		<view class="info-card">
			<text class="info-title">{{ title }}</text>
			<view class="coordinate-row">
				<text class="coordinate-label">纬度</text>
				<text class="coordinate-value">{{ latitude }}</text>
			</view>
			<view class="coordinate-row">
				<text class="coordinate-label">经度</text>
				<text class="coordinate-value">{{ longitude }}</text>
			</view>
		</view>

		<view class="nav-btn" @tap="openNavigation">
			<text class="nav-btn-text">导航到这里</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				latitude: 0,
				longitude: 0,
				title: '',
				markers: []
			}
		},
		onLoad(options) {
			if (options.latitude && options.longitude) {
				this.latitude = parseFloat(options.latitude)
				this.longitude = parseFloat(options.longitude)
				this.title = decodeURIComponent(options.title || '房源位置')
				this.markers = [{
					id: 1,
					latitude: this.latitude,
					longitude: this.longitude,
					title: this.title,
					width: 32,
					height: 32
				}]
			}
		},
		methods: {
			openNavigation() {
				uni.showToast({
					title: '正在打开导航...',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	.map {
		width: 100%;
		height: calc(100vh - 280rpx);
	}

	.info-card {
		background-color: #fff;
		padding: 30rpx;
		margin: 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.info-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 20rpx;
	}

	.coordinate-row {
		display: flex;
		justify-content: space-between;
		padding: 12rpx 0;
	}

	.coordinate-label {
		font-size: 26rpx;
		color: #999;
	}

	.coordinate-value {
		font-size: 26rpx;
		color: #333;
	}

	.nav-btn {
		margin: 0 20rpx;
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}
</style>