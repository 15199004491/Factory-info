<template>
	<view class="content">
		<view class="user-card">
			<block v-if="isLogin && userInfo">
				<image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill" :lazy-load="true" @tap="onPreviewAvatar"></image>
				<view class="user-info">
					<text class="user-nickname">{{ userInfo.nickName }}</text>
					<text class="user-desc">{{ vipDesc }}</text>
				</view>
				<view class="logout-btn" @tap="onLogout">
					<text class="logout-text">退出</text>
				</view>
			</block>
			<block v-else>
				<view class="user-avatar default-avatar">
					<u-icon name="account" :size="50" color="#fff"></u-icon>
				</view>
				<view class="user-info">
					<text class="user-nickname">未登录</text>
					<text class="user-desc">欢迎登录生活信息平台</text>
				</view>
				<view class="login-btn" @tap="onWechatLogin">
					<text class="login-btn-text">微信登录</text>
				</view>
			</block>
		</view>

		<view class="menu-list" v-for="(group, gi) in menuGroups" :key="gi">
			<view class="menu-item" v-for="(item, ii) in group" :key="item" @tap="onMenuTap(item)">
				<view class="menu-left">
					<text class="menu-text">{{ item }}</text>
					<text class="menu-badge" v-if="item === '房源管理'">专属小程序码</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<contact-modal :visible="showContact" @close="showContact = false"></contact-modal>

		<vip-pay-modal
			:visible="showPayModal"
			:loading="payLoading"
			:start-date="payStartDate"
			:end-date="payEndDate"
			:title="payTitle"
			:subtitle="paySubtitle"
			@confirm="onPayConfirm"
			@cancel="onPayCancel"
		/>

		<tab-bar :currentIndex="2"></tab-bar>
	</view>
</template>

<script>
	import tabBar from '@/components/tab-bar/tab-bar.vue'
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import contactModal from '@/components/contact-modal/contact-modal.vue'
	import vipPayMixin from '@/mixins/vipPayModal.js'
	import { auth } from '@/utils/auth.js'

	export default {
		mixins: [vipPayMixin],
		components: {
			tabBar,
			uIcon,
			contactModal
		},
		data() {
			return {
				menuGroups: [
					['加工厂', '个人收购'],
					['房源管理'],
					['联系客服']
				],
				isLogin: false,
				userInfo: null,
				showContact: false
			}
		},
		computed: {
			vipRemainingDays() {
				const expireAt = Number(this.userInfo && this.userInfo.house_vip_expire_at)
				if (!expireAt) return 0
				const now = Math.floor(Date.now() / 1000)
				if (expireAt <= now) return 0
				return Math.ceil((expireAt - now) / 86400)
			},
			isHouseVip() {
				const expireAt = Number(this.userInfo && this.userInfo.house_vip_expire_at)
				if (!expireAt) return false
				return expireAt > Math.floor(Date.now() / 1000)
			},
			vipDesc() {
				if (!this.isLogin || !this.isHouseVip) return '欢迎回来，祝您使用愉快'
				return `二手房+租房会员有效期剩余${this.vipRemainingDays}天`
			}
		},
		onShow() {
			this.checkLoginStatus()
		},
		methods: {
			async checkLoginStatus() {
				const userData = await auth.getUserInfo()
				if (userData) {
					this.isLogin = true
					this.userInfo = {
						nickName: userData.nick_name || '用户',
						avatarUrl: userData.avatar_url || '',
						...userData
					}
				} else {
					this.isLogin = false
					this.userInfo = null
				}
			},
			async onWechatLogin() {
				try {
					const userData = await auth.login()
					this.isLogin = true
					this.userInfo = {
						...userData,
						nickName: userData.nickname || userData.nickName || userData.nick_name || '用户',
						avatarUrl: userData.avatar_url || userData.avatar || userData.avatarUrl || ''
					}
				} catch (e) {
					console.error('登录失败', e)
				}
			},
			async onLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: async (res) => {
						if (res.confirm) {
							await auth.logout()
							this.isLogin = false
							this.userInfo = null
						}
					}
				})
			},
			onPreviewAvatar() {
				if (this.userInfo && this.userInfo.avatarUrl) {
					uni.previewImage({
						urls: [this.userInfo.avatarUrl],
						current: this.userInfo.avatarUrl
					})
				}
			},
			onMenuTap(item) {
				if (item === '加工厂') {
					auth.requireAuth(() => {
						this.checkLoginStatus()
						uni.navigateTo({ url: '/pages/factory/manage' })
					})
				} else if (item === '个人收购') {
					auth.requireAuth(() => {
						this.checkLoginStatus()
						uni.navigateTo({ url: '/pages/mine/purchase' })
					})
				} else if (item === '房源管理') {
					auth.requireAuth(() => {
						this.checkLoginStatus()
						uni.navigateTo({ url: '/pages/mine/published' })
					})
				} else if (item === '联系客服') {
					this.showContact = true
				} else {
					uni.showToast({ title: item + ' 即将上线', icon: 'none' })
				}
			}
		}
	}
</script>

<style>
	.content {
		padding: 24rpx;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	.menu-list {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-top: 24rpx;
	}

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-text {
		font-size: 30rpx;
		color: #333;
	}

	.menu-left {
		display: flex;
		align-items: center;
	}

	.menu-badge {
		font-size: 20rpx;
		color: #3c9cff;
		background: rgba(60, 156, 255, 0.12);
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
		margin-left: 8rpx;
		flex-shrink: 0;
	}

	.menu-arrow {
		font-size: 40rpx;
		color: #ccc;
		font-weight: 300;
	}

	.user-card {
		background: linear-gradient(135deg, #3c9cff 0%, #56ccf2 100%);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.25);
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.6);
		flex-shrink: 0;
		background-color: rgba(255, 255, 255, 0.3);
	}

	.default-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-info {
		flex: 1;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.user-nickname {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	.login-btn {
		flex-shrink: 0;
		padding: 12rpx 24rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 999rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.4);
		display: flex;
		align-items: center;
	}

	.login-btn-text {
		font-size: 24rpx;
		color: #fff;
		margin-left: 8rpx;
	}

	.logout-btn {
		flex-shrink: 0;
		padding: 12rpx 24rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 999rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.4);
	}

	.logout-text {
		font-size: 24rpx;
		color: #fff;
	}
</style>