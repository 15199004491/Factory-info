<template>
	<view class="page">
		<view class="tab-bar" v-if="!filterType">
			<view class="tab-item" :class="{ active: activeTab === 'second' }" @tap="activeTab = 'second'">
				<text>二手房</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'rent' }" @tap="activeTab = 'rent'">
				<text>租房</text>
			</view>
		</view>

		<scroll-view class="scroll-area" scroll-y>
			<view class="list-container">
				<view class="empty" v-if="filteredList.length === 0 && loadedTabs[activeTab]">
					<text class="empty-text">暂无发布的信息</text>
				</view>

				<view class="list-item" v-for="(item, index) in filteredList" :key="item.id" @tap="onViewDetail(item)">
					<view class="item-main">
						<view class="item-header">
							<text class="item-title">{{ item.title }}</text>
							<text class="item-type-tag" :class="getTypeClass(item.type)">{{ getTypeLabel(item.type) }}</text>
						</view>

						<view class="item-tags" v-if="item.type === 'rent'">
							<text class="item-sub-tag" :class="item.tagType === 'shared' ? 'tag-shared' : 'tag-entire'">{{ item.tagType === 'shared' ? '合租' : '整租' }}</text>
						</view>

						<text class="item-desc">{{ item.community }} · {{ item.houseType }} · {{ item.area }}</text>
						<text class="item-region" v-if="item.region">地点：{{ item.region }}</text>

						<view class="item-footer">
							<text class="item-price">{{ getPriceText(item) }}</text>
							<text class="item-time">{{ item.createTime }}</text>
						</view>
					</view>
					<view class="item-actions">
						<view class="action-btn" @tap.stop="onEdit(item)">
							<text class="action-text">编辑</text>
						</view>
						<view class="action-btn btn-delete" @tap.stop="onDelete(item, index)">
							<text class="action-text">删除</text>
						</view>
					</view>
				</view>

				<view class="no-more" v-if="filteredList.length > 0 && loadedTabs[activeTab]">
					<text class="no-more-text">没有更多消息了</text>
				</view>
			</view>

			<view class="scroll-bottom-space"></view>
		</scroll-view>

		<view class="action-bar">
			<view class="bar-btn bar-btn-qrcode" @tap="onQrcode">
				<text class="bar-btn-text">专属小程序码</text>
			</view>
			<view class="bar-btn bar-btn-add" @tap="onAdd">
				<text class="bar-btn-text">新增</text>
			</view>
		</view>

		<view class="modal-mask" v-if="qrcodeModal.show" @tap="qrcodeModal.show = false">
			<view class="modal-box" @tap.stop>
				<text class="modal-title">自定义名称</text>
				<input
					class="modal-input"
					type="text"
					maxlength="10"
					v-model="qrcodeModal.name"
					placeholder="请输入码的名称（10字以内）"
					placeholder-class="modal-placeholder"
				/>
				<text class="modal-error" v-if="qrcodeModal.error">{{ qrcodeModal.error }}</text>
				<view class="modal-btns">
					<view class="modal-btn modal-btn-cancel" @tap="qrcodeModal.show = false">
						<text>取消</text>
					</view>
					<view class="modal-btn modal-btn-confirm" :class="{ disabled: qrcodeModal.submitting }" @tap="onConfirmQrcode">
						<text>{{ qrcodeModal.submitting ? '校验中...' : '确定' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { secondHouseApi, rentApi, userApi } from '@/utils/request.js'
	import { formatDate } from '@/utils/date.js'
	import { checkHouseLimit } from '@/utils/houseLimit.js'

	export default {
		data() {
			return {
				filterType: '',
				activeTab: 'second',
				allList: [],
				loadedTabs: { second: false, rent: false },
				qrcodeModal: {
					show: false,
					name: '房源专属小程序',
					error: '',
					submitting: false
				}
			}
		},
		computed: {
			filteredList() {
				return this.allList.filter(i => i.type === this.activeTab)
			}
		},
		watch: {
			activeTab(val) {
				this.loadTab(val)
			}
		},
		onLoad(options) {
			if (options && options.type) {
				this.filterType = options.type
				this.activeTab = options.type
			}
		},
		onShow() {
			this.loadedTabs[this.activeTab] = false
			this.loadTab(this.activeTab)
		},
		methods: {
			onQrcode() {
				this.qrcodeModal.show = true
				this.qrcodeModal.name = '房源专属小程序'
				this.qrcodeModal.error = ''
			},
			async onConfirmQrcode() {
				if (this.qrcodeModal.submitting) return
				var name = (this.qrcodeModal.name || '').trim() || '房源专属小程序'
				if (name.length > 10) {
					name = name.substring(0, 10)
					this.qrcodeModal.name = name
				}
				this.qrcodeModal.error = ''
				this.qrcodeModal.submitting = true
				try {
					var result = await userApi.msgCheck(name)
					if (!result || result.errcode !== 0) {
						this.qrcodeModal.error = '内容包含敏感词，请重新输入'
						this.qrcodeModal.submitting = false
						return
					}
				} catch (e) {
					this.qrcodeModal.error = '内容包含敏感词，请换个名称输入'
					this.qrcodeModal.submitting = false
					return
				}
				this.qrcodeModal.submitting = false
				this.qrcodeModal.show = false
				uni.navigateTo({
					url: '/pages/mine/qrcode?name=' + encodeURIComponent(name)
				})
			},
			async onAdd() {
				const allowed = await checkHouseLimit()
				if (!allowed) return
				if (this.activeTab === 'second') {
					uni.navigateTo({ url: '/pages/publish/second' })
				} else if (this.activeTab === 'rent') {
					uni.navigateTo({ url: '/pages/publish/rent' })
				}
			},
			async loadTab(tab) {
				if (!tab || this.loadedTabs[tab]) return
				try {
					var data = null
					if (tab === 'second') {
						data = await secondHouseApi.houseSelf()
						var list = this.formatSecondList(data)
						this.appendList(list, 'second')
					} else if (tab === 'rent') {
						data = await rentApi.rentSelf()
						var list = this.formatRentList(data)
						this.appendList(list, 'rent')
					}
					this.loadedTabs[tab] = true
				} catch (e) {}
			},
			appendList(list, type) {
				var others = this.allList.filter(i => i.type !== type)
				this.allList = others.concat(list)
			},
			formatSecondList(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(item => ({
					id: item.Id || item.id,
					type: 'second',
					title: item.title,
					community: item.name || item.community || '',
					region: item.region || item.area || '',
					houseType: item.shape || item.houseType || '',
					area: (item.acreage || item.area || '') + '㎡',
					floor: item.floor || '',
					orientation: item.orientation || '',
					decoration: item.decoration || '',
					price: item.price,
					description: item.explain || item.description || '',
					createTime: formatDate(item.update_time || item.create_time || item.createTime || 0)
				}))
			},
			formatRentList(data) {
				var list = Array.isArray(data) ? data : (data && data.list ? data.list : [])
				return (list || []).map(item => ({
					id: item.Id || item.id,
					type: 'rent',
					title: item.title,
					community: item.community || item.name || '',
					region: item.region || item.area || '',
					houseType: item.pay_type || '',
					area: (item.acreage || '') + '㎡',
					floor: item.floor || '',
					payment: item.payment || '',
					price: item.price,
					tagType: item.tag_type || item.tagType || 'entire',
					description: item.description || item.explain || '',
					createTime: formatDate(item.update_time || item.create_time || item.createTime || 0)
				}))
			},
			getTypeLabel(type) {
				if (type === 'rent') return '租房'
				return '二手房'
			},
			getTypeClass(type) {
				if (type === 'rent') return 'type-rent'
				return 'type-second'
			},
			getPriceText(item) {
				if (item.type === 'second') return (item.price || '') + '万'
				if (item.type === 'rent') return (item.price || '') + '元/月'
				return ''
			},
			onViewDetail(item) {
				var url = '/pages/second/detail?id=' + item.id
				if (item.type === 'rent') url = '/pages/rent/detail?id=' + item.id
				uni.navigateTo({ url: url })
			},
			onEdit(item) {
				var url = '/pages/publish/second'
				if (item.type === 'rent') url = '/pages/publish/rent'
				uni.navigateTo({ url: url + '?action=edit&id=' + item.id })
			},
			onDelete(item, index) {
				var self = this
				uni.showModal({
					title: '提示',
					content: '确定删除"' + item.title + '"吗？',
					success: async function(res) {
						if (res.confirm) {
							try {
								if (item.type === 'rent') {
									await rentApi.deleteRent({ Id: item.id })
								} else if (item.type === 'second') {
									await secondHouseApi.deleteHouse({ Id: item.id })
								}
								self.loadedTabs[item.type] = false
								self.loadTab(item.type)
								uni.showToast({ title: '删除成功', icon: 'success' })
							} catch (e) {
								uni.showToast({ title: '删除成功', icon: 'success' })
								self.allList.splice(index, 1)
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.tab-bar {
		display: flex;
		background-color: #fff;
		padding: 0 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.scroll-area {
		flex: 1;
		height: 0;
	}

	.scroll-bottom-space {
		height: 180rpx;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 28rpx 0;
		position: relative;
	}

	.tab-item text {
		font-size: 28rpx;
		color: #999;
		transition: all 0.2s;
	}

	.tab-item.active text {
		color: #333;
		font-weight: 600;
		font-size: 30rpx;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 8rpx;
		transform: translateX(-50%);
		width: 48rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background: linear-gradient(90deg, #3c9cff, #5ac8fa);
	}

	.action-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		gap: 16rpx;
		background-color: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.bar-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		border-radius: 12rpx;
	}

	.bar-btn-qrcode {
		background: #fff;
		border: 2rpx solid #3c9cff;
	}

	.bar-btn-qrcode .bar-btn-text {
		color: #3c9cff;
	}

	.bar-btn-add {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.bar-btn-add .bar-btn-text {
		color: #fff;
	}

	.bar-btn-text {
		font-size: 28rpx;
		font-weight: 500;
	}

	.list-container {
		padding: 20rpx 24rpx;
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 200rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.list-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.item-main {
		margin-bottom: 20rpx;
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 10rpx;
	}

	.item-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-type-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.type-second {
		color: #56ccf2;
		background-color: rgba(86, 204, 242, 0.15);
	}

	.type-rent {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.15);
	}

	.item-tags {
		margin-bottom: 8rpx;
	}

	.item-sub-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
	}

	.tag-entire {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.1);
	}

	.tag-shared {
		color: #ff9a56;
		background-color: rgba(255, 154, 86, 0.1);
	}

	.item-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 8rpx;
	}

	.item-region {
		font-size: 24rpx;
		color: #999;
		display: block;
		margin-bottom: 12rpx;
	}

	.item-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-price {
		font-size: 34rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.item-time {
		font-size: 22rpx;
		color: #bbb;
	}

	.item-actions {
		display: flex;
		gap: 16rpx;
		justify-content: flex-end;
		padding-top: 20rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.action-btn {
		flex: none;
		padding: 12rpx 28rpx;
		background-color: #fff;
		border: 1rpx solid #ddd;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-text {
		font-size: 24rpx;
		color: #333;
		font-weight: normal;
	}

	.btn-delete .action-text {
		color: #ff4d4f;
	}

	.no-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0 20rpx;
	}

	.no-more-text {
		font-size: 24rpx;
		color: #bbb;
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-box {
		width: 580rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx 32rpx 32rpx;
	}

	.modal-title {
		display: block;
		text-align: center;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 28rpx;
	}

	.modal-input {
		width: 100%;
		height: 80rpx;
		border: 2rpx solid #eee;
		border-radius: 12rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
	}

	.modal-placeholder {
		color: #bbb;
		font-size: 26rpx;
	}

	.modal-error {
		display: block;
		font-size: 24rpx;
		color: #ff4d4f;
		margin-top: 16rpx;
		min-height: 32rpx;
	}

	.modal-btns {
		display: flex;
		gap: 20rpx;
		margin-top: 28rpx;
	}

	.modal-btn {
		flex: 1;
		height: 76rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		font-size: 28rpx;
	}

	.modal-btn-cancel {
		background: #f5f5f5;
		color: #666;
	}

	.modal-btn-confirm {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		color: #fff;
	}

	.modal-btn-confirm.disabled {
		opacity: 0.6;
	}
</style>