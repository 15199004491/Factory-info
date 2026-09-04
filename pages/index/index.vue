<template>
	<view class="page">
		<view class="module-entry">
			<view class="entry-card" @tap="onEntryTap('new')">
				<view class="entry-icon new-icon">
					<text class="icon-text">新</text>
				</view>
				<text class="entry-label">新房</text>
			</view>

			<view class="entry-divider"></view>

			<view class="entry-card" @tap="onEntryTap('second')">
				<view class="entry-icon second-icon">
					<text class="icon-text">房</text>
				</view>
				<text class="entry-label">二手房</text>
			</view>

			<view class="entry-divider"></view>

			<view class="entry-card" @tap="onEntryTap('rent')">
				<view class="entry-icon rent-icon">
					<text class="icon-text">租</text>
				</view>
				<text class="entry-label">租房</text>
			</view>
		</view>

		<view class="house-section-card">
			<view class="section-title">
				<text class="section-title-text">二手房推荐</text>
			</view>

			<scroll-view
				class="scroll-area"
				scroll-y
			>
				<view class="house-grid">
					<view class="house-card" v-for="(item, index) in houseList" :key="item.id || index" @tap="onHouseTap(item)">
						<view class="house-image-wrap">
							<image-placeholder :src="item.second_image" mode="aspectFill" />
						</view>
						<view class="house-info">
							<text class="house-title">{{ item.title }}</text>
							<text class="house-desc">{{ item.desc }}</text>
							<text class="house-price">{{ item.price }}</text>
						</view>
					</view>
				</view>

				<view class="empty" v-if="houseList.length === 0">
					<text class="empty-text">暂无二手房源</text>
				</view>

				<view class="scroll-bottom-space"></view>
			</scroll-view>
		</view>

		<view class="new-house-mask" v-if="newHouseTipVisible" @click="closeNewHouseTip"></view>
		<view class="new-house-card" v-if="newHouseTipVisible" @click.stop>
			<view class="new-house-icon">
				<text class="new-house-icon-text">🏗️</text>
			</view>
			<view class="new-house-title">
				<text>新房业务开发中</text>
			</view>
			<view class="new-house-desc">
				<text>新房模块正在建设中，如有合作请联系客服</text>
			</view>
			<view class="new-house-actions">
				<view class="new-house-cancel" @click="closeNewHouseTip">
					<text class="new-house-cancel-text">知道了</text>
				</view>
				<view class="new-house-contact" @click="onContactService">
					<text class="new-house-contact-text">联系客服</text>
				</view>
			</view>
		</view>

		<contact-modal :visible="contactVisible" @close="contactVisible = false"></contact-modal>

		<tab-bar :currentIndex="1"></tab-bar>
	</view>
</template>

<script>
	import tabBar from '@/components/tab-bar/tab-bar.vue'
	import imagePlaceholder from '@/components/image-placeholder/image-placeholder.vue'
	import contactModal from '@/components/contact-modal/contact-modal.vue'
	import { secondHouseApi } from '@/utils/request.js'

	export default {
		components: {
			tabBar,
			imagePlaceholder,
			contactModal
		},
		data() {
			return {
				houseList: [],
				newHouseTipVisible: false,
				contactVisible: false
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			async loadList() {
				try {
					const data = await secondHouseApi.getList({
						keyword: '',
						region: '',
						page: 1,
						limit: 6
					})
					this.houseList = this.formatList(data.list || [])
				} catch (e) {
					this.houseList = []
				}
			},
			formatList(list) {
				return (list || []).map(item => ({
					id: item.Id,
					title: item.title,
					desc: `${item.name || ''}· ${item.shape || ''}· ${item.acreage || ''}㎡ `,
					price: item.price + '万',
					second_image: item.second_image
				}))
			},
			onEntryTap(type) {
				if (type === 'new') {
					this.newHouseTipVisible = true
					return
				}
				if (type === 'second') {
					uni.navigateTo({
						url: '/pages/second/list'
					})
					return
				}
				if (type === 'rent') {
					uni.navigateTo({
						url: '/pages/rent/list'
					})
				}
			},
			onHouseTap(item) {
				uni.navigateTo({
					url: '/pages/second/detail?id=' + item.id
				})
			},
			closeNewHouseTip() {
				this.newHouseTipVisible = false
			},
			onContactService() {
				this.newHouseTipVisible = false
				this.$nextTick(() => {
					this.contactVisible = true
				})
			}
		}
	}
</script>

<style>
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.module-entry {
		display: flex;
		align-items: center;
		margin: 30rpx 30rpx 0;
		padding: 30rpx 0;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		flex-shrink: 0;
	}

	.house-section-card {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		margin: 20rpx 24rpx 0;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
		overflow: hidden;
	}

	.section-title {
		padding: 30rpx 30rpx 20rpx;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.section-title-text {
		font-size: 28rpx;
		font-weight: normal;
		color: #333333;
	}

	.scroll-area {
		flex: 1;
		height: 0;
	}

	.scroll-bottom-space {
		height: calc(120rpx + env(safe-area-inset-bottom));
	}

	.entry-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		transition: opacity 0.2s ease;
	}

	.entry-card:active {
		opacity: 0.7;
	}

	.entry-divider {
		width: 1rpx;
		height: 60rpx;
		background-color: #f2f2f2;
	}

	.entry-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
	}

	.new-icon {
		background-color: #ffe8e0;
	}

	.second-icon {
		background-color: #e0edff;
	}

	.rent-icon {
		background-color: #dff5ea;
	}

	.icon-text {
		font-size: 38rpx;
		font-weight: bold;
	}

	.new-icon .icon-text {
		color: #ff6b6b;
	}

	.second-icon .icon-text {
		color: #2f80ed;
	}

	.rent-icon .icon-text {
		color: #10b981;
	}

	.entry-label {
		font-size: 26rpx;
		color: #555555;
		font-weight: 500;
	}


	.house-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 0 24rpx;
		justify-content: space-between;
	}

	.house-card {
		width: calc((100% - 24rpx) / 2);
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.house-image-wrap {
		width: 100%;
		height: 240rpx;
		overflow: hidden;
	}



	.house-info {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.house-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.house-desc {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 12rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.house-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}

	.new-house-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9996;
	}

	.new-house-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 620rpx;
		background-color: #ffffff;
		border-radius: 28rpx;
		padding: 60rpx 40rpx 40rpx;
		box-sizing: border-box;
		z-index: 9997;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.new-house-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #ffe8e0, #ffd9cc);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 28rpx;
	}

	.new-house-icon-text {
		font-size: 64rpx;
	}

	.new-house-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 16rpx;
	}

	.new-house-desc {
		font-size: 26rpx;
		color: #666666;
		text-align: center;
		line-height: 1.6;
		margin-bottom: 40rpx;
		padding: 0 20rpx;
	}

	.new-house-actions {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.new-house-cancel {
		flex: 1;
		height: 84rpx;
		border: 1rpx solid #e5e7eb;
		background-color: #f7f8fa;
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.new-house-cancel-text {
		font-size: 28rpx;
		color: #666666;
		font-weight: 500;
	}

	.new-house-contact {
		flex: 1.3;
		height: 84rpx;
		background: linear-gradient(135deg, #3c9cff, #56ccf2);
		box-shadow: 0 6rpx 16rpx rgba(60, 156, 255, 0.3);
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.new-house-contact-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 500;
	}
</style>