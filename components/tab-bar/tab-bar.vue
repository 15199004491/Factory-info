<template>
	<view class="tab-bar">
		<view
			class="tab-item"
			v-for="(item, index) in tabs"
			:key="index"
			@tap="switchTab(index)"
		>
			<u-icon
				:name="currentIndex === index ? item.selectedIcon : item.icon"
				:size="22"
				:color="currentIndex === index ? selectedColor : color"
			></u-icon>
			<text
				class="tab-text"
				:style="{ color: currentIndex === index ? selectedColor : color }"
			>{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'

	export default {
		props: {
			currentIndex: {
				type: Number,
				default: 0
			}
		},
		components: {
			uIcon
		},
		data() {
			return {
				color: '#999999',
				selectedColor: '#3c9cff',
				tabs: [
					{
						text: '首页',
						icon: 'home',
						selectedIcon: 'home-fill',
						pagePath: '/pages/index/index'
					},
					{
						text: '加工厂',
						icon: 'list',
						selectedIcon: 'grid',
						pagePath: '/pages/factory/factory'
					},
					{
						text: '我的',
						icon: 'account',
						selectedIcon: 'account-fill',
						pagePath: '/pages/mine/mine'
					}
				]
			}
		},
		methods: {
			switchTab(index) {
				if (this.currentIndex === index) return
				uni.switchTab({
					url: this.tabs[index].pagePath
				})
			}
		}
	}
</script>

<style lang="scss">
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #ffffff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		padding: 10rpx 0;
	}

	.tab-text {
		font-size: 22rpx;
		margin-top: 4rpx;
	}
</style>