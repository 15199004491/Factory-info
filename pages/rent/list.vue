<template>
	<view class="page">
		<view class="search-bar">
			<view class="region-wrap" @tap="openRegionPicker">
				<text class="region-text">{{ currentRegion }}</text>
				<u-icon name="arrow-down" size="14" color="#666"></u-icon>
			</view>
			<view class="search-input-wrap">
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索小区或商圈"
					placeholder-class="search-placeholder"
					confirm-type="search"
					@confirm="onSearch"
				/>
			</view>
			<view class="search-btn" @tap="onSearch">
				<text class="search-btn-text">搜索</text>
			</view>
		</view>

		<view class="result-count" v-if="rentList.length > 0">
			<text class="result-count-text">共找到 {{ rentList.length }} 套租房</text>
		</view>

		<view class="rent-grid">
			<view
				class="rent-card"
				v-for="(item, index) in rentList"
				:key="index"
				@tap="onRentTap(item)"
			>
				<view class="rent-image-wrap">
					<image class="rent-image" :src="item.image" mode="aspectFill" />
				</view>
				<view class="rent-info">
					<text class="rent-title">{{ item.title }}</text>
					<text class="rent-desc">{{ item.desc }}</text>
					<view class="rent-bottom">
						<text class="rent-price">{{ item.price }}</text>
						<text class="rent-tag" :class="item.tagType === 'shared' ? 'rent-tag-shared' : 'rent-tag-entire'">{{ item.tag }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="empty" v-if="rentList.length === 0">
			<text class="empty-text">暂无符合条件的租房源</text>
		</view>

		<region-picker
			:visible="showRegionPicker"
			@confirm="onRegionConfirm"
			@cancel="onRegionCancel"
		/>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'

	export default {
		components: {
			uIcon,
			regionPicker
		},
		data() {
			return {
				keyword: '',
				showRegionPicker: false,
				currentRegion: '全部',
				rentList: [
					{
						id: 1,
						title: '阳光花园 3室2厅',
						desc: '120㎡ · 南北通透 · 精装修',
						price: '2800元/月',
						tag: '整租',
						tagType: 'entire',
						image: 'https://img.alicdn.com/imgextra/i3/6000000002334/O1CN01w2M5v81FmR5KjP1z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 2,
						title: '翠湖天地 2室1厅',
						desc: '89㎡ · 湖景房 · 电梯房',
						price: '2200元/月',
						tag: '整租',
						tagType: 'entire',
						image: 'https://img.alicdn.com/imgextra/i2/6000000002334/O1CN01w2M5v91FmR5KjP2z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 3,
						title: '金色家园 4室2厅',
						desc: '160㎡ · 复式结构 · 带露台',
						price: '4500元/月',
						tag: '整租',
						tagType: 'entire',
						image: 'https://img.alicdn.com/imgextra/i4/6000000002334/O1CN01w2M5vA1FmR5KjP3z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 4,
						title: '东方明珠 1室1厅',
						desc: '55㎡ · 单身公寓 · 地铁口',
						price: '1500元/月',
						tag: '合租',
						tagType: 'shared',
						image: 'https://img.alicdn.com/imgextra/i1/6000000002334/O1CN01w2M5vB1FmR5KjP4z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 5,
						title: '绿地世纪城 3室2厅',
						desc: '135㎡ · 精装修 · 学区房',
						price: '3200元/月',
						tag: '整租',
						tagType: 'entire',
						image: 'https://img.alicdn.com/imgextra/i3/6000000002334/O1CN01w2M5v81FmR5KjP1z_!!600000000472-0-yinhe.jpg'
					},
					{
						id: 6,
						title: '海景公寓 2室2厅',
						desc: '98㎡ · 海景房 · 南北通透',
						price: '2600元/月',
						tag: '整租',
						tagType: 'entire',
						image: 'https://img.alicdn.com/imgextra/i2/6000000002334/O1CN01w2M5v91FmR5KjP2z_!!600000000472-0-yinhe.jpg'
					}
				]
			}
		},
		methods: {
			openRegionPicker() {
				this.showRegionPicker = true
			},
			onRegionConfirm(label) {
				this.currentRegion = label
				this.showRegionPicker = false
				this.onSearch()
			},
			onRegionCancel() {
				this.showRegionPicker = false
			},
			onSearch() {
				uni.showToast({
					title: '搜索中...',
					icon: 'none'
				})
			},
			onRentTap(item) {
				uni.navigateTo({
					url: '/pages/rent/detail?id=' + item.id
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background-color: #fff;
		gap: 16rpx;
		position: relative;
	}

	.region-wrap {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding: 8rpx 0;
	}

	.region-text {
		font-size: 28rpx;
		color: #333;
		margin-right: 6rpx;
	}

	.search-input-wrap {
		flex: 1;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
	}

	.search-input {
		flex: 1;
		height: 72rpx;
		font-size: 28rpx;
		color: #333;
	}

	.search-placeholder {
		color: #999;
	}

	.search-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 14rpx 28rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.search-btn-text {
		font-size: 28rpx;
		color: #fff;
	}

	.result-count {
		padding: 20rpx 30rpx 10rpx;
	}

	.result-count-text {
		font-size: 24rpx;
		color: #999;
	}

	.rent-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 10rpx 24rpx 0;
		justify-content: space-between;
	}

	.rent-card {
		width: calc((100% - 24rpx) / 2);
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.rent-image-wrap {
		width: 100%;
		height: 240rpx;
		overflow: hidden;
	}

	.rent-image {
		width: 100%;
		height: 100%;
	}

	.rent-info {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.rent-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rent-desc {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 12rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rent-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.rent-price {
		font-size: 30rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.rent-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
	}

	.rent-tag-entire {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.1);
	}

	.rent-tag-shared {
		color: #ff9a56;
		background-color: rgba(255, 154, 86, 0.1);
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 120rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>