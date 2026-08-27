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
					maxlength="10"
				/>
			</view>
			<view class="search-btn" @tap="onSearch">
				<text class="search-btn-text">搜索</text>
			</view>
		</view>

		<view class="filter-mask" v-if="showMenu" @tap="toggleMenu"></view>
		<view class="filter-sheet" :class="{ 'filter-sheet-show': showMenu }">
			<view class="sheet-header">
				<text class="sheet-title">筛选距离</text>
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

		<view class="invite-banner-wrap">
		<button class="invite-banner" open-type="share">
			<view class="invite-left">
				<view class="invite-info">
					<text class="invite-title">没有找到想要的加工厂？</text>
					<text class="invite-desc">邀请加工厂入驻，帮更多农户找到优质收购商</text>
				</view>
			</view>
			<view class="invite-action">
				<text class="invite-btn-text">立即邀请</text>
				<text class="invite-arrow">›</text>
			</view>
		</button>
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
					<view class="card-tags">
						<text class="cat-tag" v-for="(cat, catIdx) in item.categories" :key="catIdx">{{ cat.name || cat }}</text>
					</view>
					<text class="date">{{ formatDateTime(item.createTime) }}</text>
				</view>
			</view>
		</view>

		<view class="empty" v-if="factoryList.length === 0">
			<text class="empty-text">暂无数据</text>
		</view>

		<view class="load-more" v-if="factoryList.length > 0">
			<text class="load-more-text">没有更多数据了</text>
		</view>

		<view class="feedback-float" @tap="openFeedback">
			<view class="fb-float-icon">
				<u-icon name="email" size="22" color="#666"></u-icon>
			</view>
			<text class="feedback-label">意见箱</text>
		</view>

		<view class="feedback-mask" v-if="showFeedback" @tap="closeFeedback">
			<view class="feedback-sheet" :class="{ 'feedback-sheet-show': showFeedback }" @tap.stop>
				<view class="fb-header">
					<text class="fb-title">意见反馈</text>
					<view class="fb-close" @tap="closeFeedback">
						<u-icon name="close" size="16" color="#999"></u-icon>
					</view>
				</view>
				<view class="fb-body">
					<textarea
						class="fb-textarea"
						v-model="feedbackContent"
						maxlength="200"
						placeholder="请输入您的意见或建议，帮助我们做得更好～"
						placeholder-class="fb-placeholder"
						auto-height
						adjust-position="true"
						cursor-spacing="120"
						fixed="false"
					/>
					<view class="fb-count">
						<text class="fb-count-text">{{ feedbackContent.length }}/200</text>
					</view>
				</view>
				<view class="fb-footer">
					<view class="fb-submit" :class="{ disabled: !canSubmitFeedback || submittingFeedback }" @tap="submitFeedback">
						<text class="fb-submit-text">{{ submittingFeedback ? '提交中...' : '提交反馈' }}</text>
					</view>
				</view>
			</view>
		</view>

		<tab-bar :currentIndex="0"></tab-bar>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import uInput from 'uview-plus/components/u-input/u-input.vue'
	import tabBar from '@/components/tab-bar/tab-bar.vue'
	import { factoryApi, feedbackApi } from '@/utils/request.js'
	import { formatDateTime } from '../../utils/date.js'

	export default {
		components: {
			uIcon,
			uInput,
			tabBar
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
				total: 0,
				firstLoaded: false,
				locationDenied: false,
				factoryList: [],
				showFeedback: false,
				feedbackContent: '',
				submittingFeedback: false
			}
		},
		computed: {
			canSubmitFeedback() {
				const s = (this.feedbackContent || '').trim()
				return s.length >= 5 && s.length <= 200
			}
		},
		onShow() {
			console.log('[factory] onShow 触发，开始 loadList')
			this.loadList()
		},
		methods: {
			async ensureLocationForFilter() {
				if (this.userLat && this.userLng) {
					this.showMenu = true
					return
				}
				const saved = this.$location.getSaved()
				if (saved) {
					this.userLat = saved.lat
					this.userLng = saved.lng
					this.showMenu = true
					return
				}
				try {
					const res = await this.$location.ensureAndGet({
						tipText: '需要位置权限才能按距离筛选'
					})
					this.userLat = res.lat
					this.userLng = res.lng
					this.locationDenied = false
					this.showMenu = true
				} catch (e) {
					if (e && e.message === 'location_permission_denied') {
						this.locationDenied = true
					}
				}
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
				console.log('[factory] 调用 factoryApi.getList 参数:', JSON.stringify(params))
				try {
					const res = await factoryApi.getList(params)
					console.log('[factory] factoryApi.getList 返回原始值:', res)
					const list = (res && res.list) ? res.list : (Array.isArray(res) ? res : [])
					this.factoryList = list.map(item => {
						let categoryNames = []
						const raw = item.categories || item.category || item.category_list || ''
						if (Array.isArray(raw)) {
							categoryNames = raw.map(c => {
								if (typeof c === 'string') return c
								return c.name || c.category || ''
							}).filter(Boolean)
						} else if (typeof raw === 'string') {
							categoryNames = raw.split(',').filter(Boolean)
						}
						return {
							id: item.Id,
							name: item.name,
							identification: item.identification,
							createTime: item.update_time || item.create_time || item.createtime || 0,
							categories: categoryNames
						}
					})
					this.total = this.factoryList.length
					console.log('[factory] 解析后 factoryList 数量:', this.factoryList.length)
				} catch (e) {
					console.error('[factory] 加载加工厂列表失败:', e)
					this.factoryList = []
					uni.showToast({
						title: (e && e.msg) ? e.msg : '加载加工厂失败，请稍后重试',
						icon: 'none',
						duration: 2500
					})
				}
			},
			formatDateTime,
			toggleMenu() {
				this.showMenu? this.showMenu = false : this.ensureLocationForFilter()
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
			onShareAppMessage(res) {
				const shareObj = {
					title: '邀请加工厂入驻，帮更多农户找到优质收购商',
					path: '/pages/factory/factory'
				}
				if (res && res.from === 'button') {
					shareObj.title = '邀请加工厂入驻，帮更多农户找到优质收购商'
				}
				return shareObj
			},
			onShareTimeline() {
				return {
					title: '加工厂信息 - 优质农产品收购平台'
				}
			},
			openFeedback() {
				this.feedbackContent = ''
				this.showFeedback = true
			},
			closeFeedback() {
				if (this.submittingFeedback) return
				this.showFeedback = false
			},
			async submitFeedback() {
				if (!this.canSubmitFeedback) {
					uni.showToast({ title: '请输入至少5个字的反馈内容', icon: 'none' })
					return
				}
				if (this.submittingFeedback) return
				this.submittingFeedback = true
				uni.showLoading({ title: '提交中...', mask: true })
				try {
					await feedbackApi.submit({ content: this.feedbackContent.trim() })
					uni.hideLoading()
					uni.showToast({ title: '感谢您的反馈！', icon: 'success' })
					this.showFeedback = false
					this.feedbackContent = ''
				} catch (e) {
					uni.hideLoading()
					const msg = (e && (e.msg || e.message)) || '提交失败，请稍后重试'
					uni.showToast({ title: msg, icon: 'none' })
				} finally {
					this.submittingFeedback = false
				}
			},
			goDetail(item) {
				uni.navigateTo({
					url: '/pages/factory/detail?Id=' + item.id
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

	.invite-banner-wrap {
		width: 100%;
		background-color: #fff;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.invite-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 24rpx;
		margin: 0 24rpx;
		background: linear-gradient(135deg, #fff8e6 0%, #fff3d6 100%);
		border-radius: 16rpx;
		border: 1rpx solid #ffe4a3;
		line-height: 1;
	}

	.invite-banner::after {
		border: none;
	}

	.invite-left {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.invite-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex: 1;
		min-width: 0;
	}

	.invite-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
		margin-bottom: 12rpx;
	}

	.invite-desc {
		font-size: 22rpx;
		color: #999;
		line-height: 1.6;
	}

	.invite-action {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #ff9800, #ffb74d);
		padding: 14rpx 24rpx;
		border-radius: 28rpx;
		flex-shrink: 0;
	}

	.invite-btn-text {
		font-size: 24rpx;
		color: #fff;
		font-weight: 500;
	}

	.invite-arrow {
		font-size: 28rpx;
		color: #fff;
		margin-left: 6rpx;
		font-weight: bold;
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

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		flex: 1;
		min-width: 0;
	}

	.cat-tag {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		background: linear-gradient(135deg, #52c41a, #389e0d);
		color: #fff;
		border-radius: 6rpx;
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

	.feedback-float {
		position: fixed;
		right: 24rpx;
		bottom: calc(170rpx + env(safe-area-inset-bottom));
		width: 120rpx;
		height: 120rpx;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		border: 2rpx solid #e5e7eb;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	}

	.fb-float-icon {
		line-height: 1;
		margin-bottom: 6rpx;
	}

	.feedback-label {
		font-size: 20rpx;
		color: #666;
		font-weight: 500;
		line-height: 1;
	}

	.feedback-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 99;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.feedback-sheet {
		position: relative;
		width: 620rpx;
		background-color: #fff;
		border-radius: 24rpx;
		z-index: 100;
		opacity: 0;
		transform: scale(0.9);
		transition: all 0.25s ease;
		overflow: hidden;
	}

	.feedback-sheet-show {
		opacity: 1;
		transform: scale(1);
	}

	.fb-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.fb-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.fb-close {
		padding: 8rpx;
	}

	.fb-body {
		padding: 28rpx 32rpx 8rpx;
	}

	.fb-textarea {
		width: 100%;
		min-height: 220rpx;
		max-height: 360rpx;
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		background-color: #f7f8fa;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		box-sizing: border-box;
	}

	.fb-placeholder {
		color: #c0c4cc;
	}

	.fb-count {
		display: flex;
		justify-content: flex-end;
		margin-top: 12rpx;
	}

	.fb-count-text {
		font-size: 22rpx;
		color: #bbb;
	}

	.fb-footer {
		padding: 20rpx 32rpx 32rpx;
	}

	.fb-submit {
		background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
		border-radius: 44rpx;
		padding: 26rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 18rpx rgba(60, 156, 255, 0.35);
	}

	.fb-submit.disabled {
		background: #b7c4d8;
		box-shadow: none;
	}

	.fb-submit-text {
		font-size: 30rpx;
		font-weight: 500;
		color: #fff;
	}

	.result-count {
		padding: 20rpx 30rpx 10rpx;
	}

	.result-count-text {
		font-size: 24rpx;
		color: #999;
	}

	.load-more {
		padding: 30rpx 30rpx 40rpx;
		text-align: center;
	}

	.load-more-text {
		font-size: 24rpx;
		color: #999;
	}
</style>