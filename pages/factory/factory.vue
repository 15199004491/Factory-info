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
			<view class="dropdown-menu" v-if="showMenu">
				<view class="dropdown-item" v-for="(opt, i) in distanceOptions[0]" :key="i" @tap="selectDistance(opt)">
					<text>{{ opt.label }}</text>
					<u-icon v-if="distanceRange === opt.label" name="checkmark" size="14" color="#3c9cff"></u-icon>
				</view>
			</view>
		</view>

		<view class="tip-bar">
			<text class="tip-text">如果没有你关注的加工厂，请</text>
			<text class="tip-link" @tap="onInvite">邀请入驻</text>
		</view>

		<view class="factory-list">
			<view class="factory-item" v-for="(item, index) in factoryList" :key="index" @tap="goDetail(item)">
				<view class="item-top">
					<view class="name-wrap">
						<text class="verified-tag" v-if="item.verified">已认证</text>
						<text class="factory-name">{{ item.name }}</text>
					</view>
				</view>
				<view class="item-bottom">
					<view class="category-text">{{ item.categories.join(' / ') }}</view>
					<text class="date">{{ formatDate(item.date) }}</text>
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
				distanceRange: '全部',
				distanceOptions: [
					[
						{ label: '全部', value: 'all' },
						{ label: '5公里内', value: '5' },
						{ label: '10公里内', value: '10' },
						{ label: '20公里内', value: '20' },
						{ label: '50公里内', value: '50' }
					]
				],
				factoryList: [
					{
						name: '红旗粮食综合加工厂',
						verified: true,
						categories: ['辣椒', '棉花', '核桃'],
						date: '2026-08-11 09:30'
					},
					{
						name: '丰收',
						verified: true,
						categories: ['小麦', '玉米'],
						date: '2026-08-10 14:20'
					},
					{
						name: '山东济南金穗粮油加工有限公司',
						verified: false,
						categories: ['水稻'],
						date: '2026-08-11 08:45'
					},
					{
						name: '绿源果蔬收购点',
						verified: true,
						categories: ['苹果', '梨', '桃子', '杏子', '李子'],
						date: '2026-08-10 16:10'
					},
					{
						name: '康达',
						verified: false,
						categories: ['枸杞', '红枣'],
						date: '2026-08-11 11:30'
					},
					{
						name: '聚源棉花',
						verified: true,
						categories: ['棉花', '皮棉', '棉籽'],
						date: '2026-08-10 10:00'
					},
					{
						name: '顺昌辣椒收购站',
						verified: true,
						categories: ['朝天椒'],
						date: '2026-08-11 15:20'
					},
					{
						name: '青林果业农产品购销合作联合社',
						verified: false,
						categories: ['核桃', '薄皮核桃', '核桃仁', '山核桃', '核桃油'],
						date: '2026-08-10 09:15'
					},
					{
						name: '五谷杂粮收购中心',
						verified: true,
						categories: ['小米', '绿豆', '红豆'],
						date: '2026-08-11 13:25'
					},
					{
						name: '恒信',
						verified: true,
						categories: ['菜籽', '花生'],
						date: '2026-08-10 17:00'
					}
				]
			}
		},
		methods: {
			formatDate(dateStr) {
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
			toggleMenu() {
				this.showMenu = !this.showMenu
			},
			selectDistance(opt) {
				this.distanceRange = opt.label
				this.showMenu = false
			},
			onSearch() {
				uni.showToast({
					title: '搜索中...',
					icon: 'none'
				})
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
					url: '/pages/factory/detail?name=' + encodeURIComponent(item.name)
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

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 24rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
		min-width: 200rpx;
		overflow: hidden;
	}

	.dropdown-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 30rpx;
		font-size: 26rpx;
		color: #333;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.dropdown-item:last-child {
		border-bottom: none;
	}

	.dropdown-item:active {
		background-color: #f9f9f9;
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
		background: linear-gradient(135deg, #ffb347, #ff8c00);
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