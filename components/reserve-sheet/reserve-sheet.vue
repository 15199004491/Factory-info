<template>
	<view>
		<view class="sheet-mask" v-if="visible" @tap="close"></view>
		<view class="reserve-sheet" :class="{ 'reserve-sheet-show': visible }">
			<view class="sheet-header">
				<text class="sheet-title">预约看房</text>
				<view class="sheet-close" @tap="close">
					<text class="sheet-close-icon">×</text>
				</view>
			</view>
			<view class="sheet-body">
				<view class="form-item">
					<text class="form-label">看房时间</text>
					<picker mode="multiSelector" :range="reserveTimeRange" :value="reserveTimeIndex" @change="onReserveTimeChange">
						<view class="form-value">
							<text :class="{ placeholder: !reserveForm.datetime }">{{ reserveForm.datetime || '请选择看房时间' }}</text>
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="form-label">联系电话</text>
					<button class="phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhone">
						<text v-if="reserveForm.mobile" class="phone-value">{{ reserveForm.mobile }}</text>
						<text v-else class="phone-placeholder">获取手机号</text>
					</button>
				</view>
			</view>
			<view class="sheet-footer">
				<view class="submit-btn" :class="{ disabled: reserving }" @tap="submitReserve">
					<text class="submit-btn-text">{{ reserving ? '提交中...' : '立即预约' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { userApi, reserveApi } from '@/utils/request.js'
	import { auth } from '@/utils/auth.js'

	export default {
		name: 'ReserveSheet',
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			houseId: {
				type: [Number, String],
				default: 0
			},
			houseType: {
				type: String,
				default: 'second'
			}
		},
		data() {
			return {
				reserving: false,
				reserveForm: {
					datetime: '',
					dateStr: '',
					hour: '',
					mobile: ''
				},
				reserveTimeIndex: [0, 0]
			}
		},
		computed: {
			reserveTimeRange() {
				const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				const dates = []
				const now = new Date()
				for (let i = 0; i < 7; i++) {
					const d = new Date(now.getTime() + i * 86400000)
					const m = d.getMonth() + 1
					const day = d.getDate()
					const w = weeks[d.getDay()]
					const label = i === 0 ? `今天(${m}月${day}日 ${w})` : `明天(${m}月${day}日 ${w})`
					dates.push(i <= 1 ? label : `${m}月${day}日 ${w}`)
				}
				const hours = []
				for (let h = 6; h <= 24; h++) {
					hours.push(`${String(h).padStart(2, '0')}:00`)
				}
				return [dates, hours]
			}
		},
		watch: {
			visible(val) {
				if (val) {
					this.prefillUserMobile()
				}
			}
		},
		methods: {
			close() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			prefillUserMobile() {
				const userInfo = uni.getStorageSync('user_info') || {}
				if (userInfo.mobile) {
					this.reserveForm.mobile = userInfo.mobile
				}
			},
			async open() {
				if (!auth.isLoggedIn()) {
					try {
						await auth.login({ silent: true })
					} catch (e) {
						console.warn('登录失败', e)
					}
				}
				this.prefillUserMobile()
				this.$emit('update:visible', true)
			},
			onReserveTimeChange(e) {
				const [di, hi] = e.detail.value
				const now = new Date()
				const d = new Date(now.getTime() + di * 86400000)
				const y = d.getFullYear()
				const m = String(d.getMonth() + 1).padStart(2, '0')
				const day = String(d.getDate()).padStart(2, '0')
				this.reserveTimeIndex = [di, hi]
				const dateLabel = this.reserveTimeRange[0][di]
				const hourLabel = this.reserveTimeRange[1][hi]
				this.reserveForm.dateStr = `${y}-${m}-${day}`
				this.reserveForm.hour = hourLabel
				this.reserveForm.datetime = `${dateLabel} ${hourLabel}`
			},
			async onGetPhone(e) {
				if (e.detail.errMsg === 'getPhoneNumber:ok') {
					try {
						const data = await userApi.getPhone(e.detail.code)
						this.reserveForm.mobile = data.phoneNumber
					} catch (err) {
						uni.showToast({ title: '获取手机号失败', icon: 'none' })
					}
				}
			},
			async submitReserve() {
				if (!this.reserveForm.datetime) {
					uni.showToast({ title: '请选择看房时间', icon: 'none' })
					return
				}
				if (!/^1\d{10}$/.test(this.reserveForm.mobile)) {
					uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
					return
				}
				if (this.reserving) return
				this.reserving = true
				try {
					uni.showLoading({ title: '提交中' })
					const params = {
						house_id: this.houseId,
						house_type: this.houseType,
						reserve_date: this.reserveForm.dateStr,
						reserve_hour: this.reserveForm.hour,
						mobile: this.reserveForm.mobile
					}
					await reserveApi.create(params)
					uni.hideLoading()
					uni.showToast({ title: '预约成功,房东将尽快联系您', icon: 'success', duration: 2000 })
					this.reserveForm = { datetime: '', dateStr: '', hour: '', mobile: '' }
					this.close()
					this.$emit('success', params)
				} catch (e) {
					uni.hideLoading()
					uni.showToast({ title: '预约失败,请稍后重试', icon: 'none' })
				} finally {
					this.reserving = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.sheet-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 99;
	}

	.reserve-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 100;
		transform: translateY(100%);
		transition: transform 0.3s ease;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.reserve-sheet-show {
		transform: translateY(0);
	}

	.sheet-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.sheet-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.sheet-close {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sheet-close-icon {
		font-size: 44rpx;
		color: #999;
		line-height: 1;
	}

	.sheet-body {
		padding: 20rpx 32rpx;
	}

	.form-item {
		display: flex;
		align-items: center;
		padding: 28rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.form-label {
		font-size: 28rpx;
		color: #333;
		width: 160rpx;
		flex-shrink: 0;
	}

	.form-item picker {
		flex: 1;
	}

	.form-value {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		font-size: 28rpx;
		color: #333;
		gap: 8rpx;
	}

	.form-value .placeholder {
		color: #bbb;
	}

	.phone-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		background: transparent;
		border: none;
		padding: 0;
		line-height: 1;
	}

	.phone-btn::after {
		border: none;
	}

	.phone-value {
		font-size: 28rpx;
		color: #333;
	}

	.phone-placeholder {
		font-size: 28rpx;
		color: #3c9cff;
	}

	.sheet-footer {
		padding: 24rpx 32rpx 60rpx;
	}

	.submit-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		border-radius: 48rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn.disabled {
		opacity: 0.6;
	}

	.submit-btn-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}
</style>