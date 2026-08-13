<template>
	<view class="content">
		<view class="user-card">
			<block v-if="isLogin && userInfo">
				<image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill" :lazy-load="true" @tap="onPreviewAvatar"></image>
				<view class="user-info">
					<text class="user-nickname">{{ userInfo.nickName }}</text>
					<text class="user-desc">欢迎回来，祝您使用愉快</text>
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

		<view class="menu-list">
			<view class="menu-item" v-for="(item, index) in menuList" :key="index" @tap="onMenuTap(index)">
				<text class="menu-text">{{ item }}</text>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<tab-bar :currentIndex="2"></tab-bar>
	</view>
</template>

<script>
	import tabBar from '@/components/tab-bar/tab-bar.vue'
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import { auth } from '@/utils/auth.js'

	export default {
		components: {
			tabBar,
			uIcon
		},
		data() {
			return {
				menuList: ['加工厂', '去发布', '已发布', '联系我们'],
				isLogin: false,
				userInfo: null
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
						nickName: userData.nickname || userData.nickName || '用户',
						avatarUrl: userData.avatar || userData.avatarUrl || '',
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
						nickName: userData.nickname || userData.nickName || '用户',
						avatarUrl: userData.avatar || userData.avatarUrl || '',
						...userData
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
			onMenuTap(index) {
				const item = this.menuList[index]
				if (item === '加工厂') {
					if (!this.isLogin) {
						uni.showModal({
							title: '提示',
							content: '请先登录后再进入加工厂管理',
							confirmText: '去登录',
							success: (res) => {
								if (res.confirm) {
									this.onWechatLogin()
								}
							}
						})
						return
					}
					uni.navigateTo({
						url: '/pages/factory/manage'
					})
				} else if (item === '去发布') {
					if (!this.isLogin) {
						uni.showModal({
							title: '提示',
							content: '请先登录后再进行发布',
							confirmText: '去登录',
							success: (res) => {
								if (res.confirm) {
									this.onWechatLogin()
								}
							}
						})
						return
					}
					uni.showActionSheet({
						itemList: ['二手房', '租房', '新房'],
						success: function(res) {
							if (res.tapIndex === 0) {
								uni.navigateTo({
									url: '/pages/publish/second'
								})
							} else if (res.tapIndex === 1) {
								uni.navigateTo({
									url: '/pages/publish/rent'
								})
							} else if (res.tapIndex === 2) {
								uni.showToast({
									title: '暂未开通',
									icon: 'none'
								})
							}
						}
					})
				} else if (item === '已发布') {
					if (!this.isLogin) {
						uni.showModal({
							title: '提示',
							content: '请先登录后查看',
							confirmText: '去登录',
							success: (res) => {
								if (res.confirm) {
									this.onWechatLogin()
								}
							}
						})
						return
					}
					uni.navigateTo({
						url: '/pages/mine/published'
					})
				} else {
					uni.showToast({
						title: item + ' 即将上线',
						icon: 'none'
					})
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