<template>
	<view class="page">
		<view class="search-bar">
			<view class="distance-wrap" @tap="toggleMenu">
				<text class="distance-text">{{ distanceRange }}</text>
				<u-icon :name="showMenu ? 'arrow-up' : 'arrow-down'" size="14" color="#666"></u-icon>
			</view>
			<view class="search-input-wrap">
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索加工厂或品类"
					placeholder-class="search-placeholder"
					confirm-type="search"
					@confirm="onSearch"
				/>
			</view>
			<view class="search-btn" @tap="onSearch">
				<text class="search-btn-text">搜索</text>
			</view>
		</view>

		<view class="filter-mask" v-if="showMenu" @tap="toggleMenu"></view>
		<view class="filter-sheet" :class="{ 'filter-sheet-show': showMenu }">
			<view class="sheet-header">
				<text class="sheet-title">选择地区</text>
				<view class="sheet-confirm" @tap="confirmFilter">
					<text class="sheet-confirm-text">确定</text>
				</view>
			</view>
			<picker-view class="filter-picker" :value="pickerValue" @change="onPickerChange" indicator-style="height: 80rpx; border-top: 1rpx solid #eee; border-bottom: 1rpx solid #eee;">
				<picker-view-column>
					<view class="picker-item" v-for="(opt, i) in distanceOptions[0]" :key="i">
						{{ opt.label }}
					</view>
				</picker-view-column>
			</picker-view>
		</view>

		<view class="tip-bar">
			<text class="tip-text">如果没有你关注的加工厂，请</text>
			<text class="tip-link" @tap="onInvite">邀请入驻</text>
		</view>

		<view class="factory-list">
			<view class="factory-item" v-for="(item, index) in factoryList" :key="index" @tap="goDetail(item)">
				<view class="item-top">
					<view class="name-wrap">
						<text class="verified-tag" v-if="item.identification === 1">已认证</text>
						<text class="factory-name">{{ item.name }}</text>
					</view>
				</view>
				<view class="item-bottom">
					<view class="category-text">{{ item.categories.join(' / ') }}</view>
					<text class="date">{{ formatDateTime(item.createTime) }}</text>
				</view>
			</view>
		</view>

		<view class="empty" v-if="factoryList.length === 0">
			<text class="empty-text">暂无数据</text>
		</view>

		<tab-bar :currentIndex="1"></tab-bar>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import uInput from 'uview-plus/components/u-input/u-input.vue'
	import tabBar from '@/components/tab-bar/tab-bar.vue'
	import { factoryApi } from '@/utils/request.js'
	import { formatDateTime } from '../../utils/date.js'

	export default {
		components: {
			uIcon,
			uInput,
			tabBar
		},
		onShareAppMessage() {
			return {
				title: '加工厂信息 - 优质农产品收购平台',
				path: '/pages/factory/factory'
			}
		},
		data() {
			return {
				keyword: '',
				showMenu: false,
				pickerValue: [0],
				distanceRange: '全部',
				distanceOptions: [
					[
						{ label: '5公里内', value: '5' },
						{ label: '10公里内', value: '10' },
						{ label: '20公里内', value: '20' },
						{ label: '50公里内', value: '50' },
						{ label: '全部', value: 'all' }
					]
				],
				userLat: 0,
				userLng: 0,
				firstLoaded: false,
				factoryList: []
			}
		},
		onLoad() {
			this.getLocation()
		},
		onShow() {
			if (this.firstLoaded) {
				this.loadList()
			}
		},
		methods: {
			getLocation() {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.userLat = res.latitude
						this.userLng = res.longitude
					},
					fail: () => {},
					complete: () => {
						this.firstLoaded = true
						this.loadList()
					}
				})
			},
			async loadList() {
				const distanceVal = this.distanceOptions[0][this.pickerValue[0]].value
				const params = {
					keyword: this.keyword,
					distance: distanceVal === 'all' ? '' : distanceVal,
					lat: this.userLat,
					lng: this.userLng,
					page: 1,
					limit: 1000
				}
				try {
					const res = await factoryApi.getList(params)
					const list = (res && res.list) ? res.list : (Array.isArray(res) ? res : [])
					this.factoryList = list.map(item => ({
						id: item.id,
						name: item.name,
						identification: item.identification,
						createTime: item.update_time || item.create_time || item.createtime || 0,
						categories: Array.isArray(item.categories) ? item.categories : (item.categories || '').split(',').filter(Boolean)
					}))
				} catch (e) {
					this.factoryList = []
				}
			},
			formatDateTime,
			toggleMenu() {
				this.showMenu = !this.showMenu
			},
			onPickerChange(e) {
				this.pickerValue = e.detail.value
			},
			confirmFilter() {
				const idx = this.pickerValue[0]
				const opt = this.distanceOptions[0][idx]
				if (opt) {
					this.distanceRange = opt.label
				}
				this.showMenu = false
				this.loadList()
			},
			onSearch() {
				this.loadList()
			},
			onInvite() {
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
			goDetail(item) {
				uni.navigateTo({
					url: '/pages/factory/detail?id=' + item.id
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
	}

	.search-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background-color: #fff;
		gap: 16rpx;
		position: relative;
	}

	.distance-wrap {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding: 8rpx 0;
	}

	.distance-text {
		font-size: 28rpx;
		color: #333;
		margin-right: 6rpx;
	}

	.tip-bar {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 20rpx 24rpx;
		background-color: #fff;
		border-top: 1rpx solid #f0f0f0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.tip-text {
		font-size: 26rpx;
		color: #999;
	}

	.tip-link {
		font-size: 26rpx;
		color: #3c9cff;
		margin-left: 8rpx;
		font-weight: 500;
	}

	.filter-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 99;
	}

	.filter-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 100;
		transform: translateY(100%);
		transition: transform 0.3s ease;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.filter-sheet-show {
		transform: translateY(0);
	}

	.sheet-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.sheet-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.sheet-confirm {
	}

	.sheet-confirm-text {
		font-size: 32rpx;
		font-weight: 500;
		color: #3c9cff;
	}

	.filter-picker {
		width: 100%;
		height: 500rpx;
	}

	.picker-item {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #333;
		line-height: 80rpx;
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

	.factory-list {
		background-color: #fff;
	}

	.factory-item {
		display: flex;
		flex-direction: column;
		padding: 28rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.factory-item:last-child {
		border-bottom: none;
	}

	.item-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.name-wrap {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.verified-tag {
		font-size: 20rpx;
		color: #fff;
		background: linear-gradient(135deg, #3c9cff, #1890ff);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
		margin-right: 8rpx;
	}

	.certifying-tag {
		font-size: 20rpx;
		color: #ff8c00;
		background-color: rgba(255, 140, 0, 0.1);
		border: 1rpx solid rgba(255, 140, 0, 0.3);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
		margin-right: 8rpx;
	}

	.failed-tag {
		font-size: 20rpx;
		color: #ff4d4f;
		background-color: rgba(255, 77, 79, 0.1);
		border: 1rpx solid rgba(255, 77, 79, 0.3);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
		margin-right: 8rpx;
	}

	.unverified-tag {
		font-size: 20rpx;
		color: #ff8c00;
		background-color: rgba(255, 140, 0, 0.1);
		border: 1rpx solid rgba(255, 140, 0, 0.3);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
		margin-right: 8rpx;
	}

	.factory-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.item-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.category-text {
		font-size: 22rpx;
		color: #bbb;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.date {
		font-size: 24rpx;
		color: #bbb;
		flex-shrink: 0;
		margin-left: 20rpx;
	}

	.empty {
		display: flex;
		justify-content: center;
		padding: 120rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>