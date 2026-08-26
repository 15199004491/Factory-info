<template>
	<view class="page">
		<view class="form-section">
			<view class="section-title">
				<text class="title-text">基本信息</text>
			</view>
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">加工厂名称</text>
					<input class="form-input" v-model="form.name" maxlength="20" placeholder="请输入加工厂名称" placeholder-class="input-placeholder" />
				</view>
				<view class="form-item">
					<text class="form-label">联系电话</text>
					<button class="phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhone">
						<text v-if="form.mobile" class="phone-value">{{ form.mobile }}</text>
						<text v-else class="phone-placeholder">获取手机号</text>
					</button>
				</view>
				<view class="form-item" @tap="onChooseLocation">
					<text class="form-label">加工厂地址</text>
					<text v-if="form.location.address" class="location-value">{{ form.location.address }}</text>
					<text v-else class="location-placeholder">获取地址</text>
				</view>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="action-btn submit-btn" :class="{ disabled: submitting }" @tap="onNextStep">
				<text class="btn-label">{{ submitting ? '提交中...' : (isEdit ? '立即提交' : '下一步') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { factoryApi, userApi } from '@/utils/request.js'

	export default {
		data() {
			return {
				isEdit: false,
				factoryId: null,
				submitting: false,
				form: {
					name: '',
					mobile: 15199004491,
					showMobile: true,
					location: {
						address: '',
						latitude: 39.908823,
						longitude: 116.397470
					}
				}
			}
		},
		onLoad(options) {
			if (options.edit === '1' && options.id) {
				this.isEdit = true
				this.factoryId = parseInt(options.id)
				uni.setNavigationBarTitle({ title: '编辑加工厂' })
				this.loadFactoryData()
			}
		},
		methods: {
			fixCoord(val, defaultVal) {
				const num = Number(val)
				if (isNaN(num) || num < -180 || num > 180) return defaultVal
				return num
			},
			async loadFactoryData() {
				try {
					const data = await factoryApi.getDetail(this.factoryId)
					let locationObj = null
					if (data.location) {
						if (typeof data.location === 'string') {
							try {
								locationObj = JSON.parse(data.location)
							} catch (e) {
								locationObj = null
							}
						} else {
							locationObj = data.location
						}
					}
					this.form = {
						name: data.name || '',
						mobile: data.mobile || '',
						showMobile: data.showMobile !== undefined ? !!data.showMobile : true,
						location: {
							address: locationObj ? locationObj.address : (data.address || ''),
							latitude: this.fixCoord(parseFloat(locationObj ? locationObj.latitude : (data.latitude || 39.908823)), 39.908823),
							longitude: this.fixCoord(parseFloat(locationObj ? locationObj.longitude : (data.longitude || 116.397470)), 116.397470)
						}
					}
				} catch (e) {}
			},
			async onGetPhone(e) {
				if (e.detail.errMsg === 'getPhoneNumber:ok') {
					try {
						const data = await userApi.getPhone(e.detail.code)
						this.form.mobile = data.phoneNumber
					} catch (err) {
						uni.showToast({ title: '获取手机号失败', icon: 'none' })
					}
				} else {
					uni.showToast({ title: '获取手机号失败', icon: 'none' })
				}
			},
			onChooseLocation() {
				const latitude = Number(this.form.location.latitude)
				const longitude = Number(this.form.location.longitude)
				const address = this.form.location.address || ''
				const hasLocation = address && latitude && longitude && latitude !== 0 && longitude !== 0

				const doChoose = () => {
					const opts = {
						success: (res) => {
							this.form.location.address = res.address
							this.form.location.latitude = res.latitude
							this.form.location.longitude = res.longitude
						},
						fail: () => {
							uni.showToast({ title: '选择位置失败', icon: 'none' })
						}
					}
					if (latitude && longitude && latitude !== 0 && longitude !== 0) {
						opts.latitude = latitude
						opts.longitude = longitude
					}
					uni.chooseLocation(opts)
				}

				if (hasLocation) {
					uni.showActionSheet({
						itemList: ['在地图中查看', '重新选择地址'],
						success: (res) => {
							if (res.tapIndex === 0) {
								this.$location.open(latitude, longitude, {
									name: this.form.name || '加工厂地址',
									address
								})
							} else if (res.tapIndex === 1) {
								doChoose()
							}
						}
					})
				} else {
					doChoose()
				}
			},
			goCertify() {
				this.onNextStep()
			},
			async onSubmit() {
				this.onNextStep()
			},
			validateForm() {
				if (!this.form.name.trim()) {
					uni.showToast({ title: '请输入加工厂名称', icon: 'none' })
					return false
				}
				if (this.form.name.trim().length > 20) {
					uni.showToast({ title: '加工厂名称不能超过20字', icon: 'none' })
					return false
				}
				if (!this.form.mobile) {
					uni.showToast({ title: '请获取联系电话', icon: 'none' })
					return false
				}
				if (!this.form.location.address) {
					uni.showToast({ title: '请选择加工厂地址', icon: 'none' })
					return false
				}
				return true
			},
			async onNextStep() {
				if (this.submitting) return
				if (!this.validateForm()) return

				const lat = this.form.location.latitude
				const lng = this.form.location.longitude
				if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
					uni.showToast({ title: '位置信息异常，请重新选择', icon: 'none' })
					return
				}

				this.submitting = true
				uni.showLoading({ title: '校验中...', mask: true, timeout: 6000 })

				const msg = [
					this.form.name,
					this.form.mobile,
					this.form.location.address
				].filter(Boolean).join(' ')

				try {
					const result = await userApi.msgCheck(msg)
					if (result.errcode !== 0) {
						uni.hideLoading()
						this.submitting = false
						uni.showToast({ title: '内容包含敏感信息', icon: 'none' })
						return
					}
				} catch (e) {}

				try {
					const postData = {
						name: this.form.name.trim(),
						mobile: this.form.mobile,
						showMobile: this.form.showMobile,
						location: this.form.location
					}

					let res
					if (this.isEdit) {
						postData.id = this.factoryId
						res = await factoryApi.addFactory(postData)
					} else {
						res = await factoryApi.addFactory(postData)
					}
					uni.hideLoading()

					if (this.isEdit) {
						uni.showToast({ title: '保存成功', icon: 'success' })
						setTimeout(() => {
							uni.navigateBack()
						}, 1000)
					} else {
						const newId = (res && (res.id || res.data && res.data.id)) || this.factoryId
						uni.showToast({ title: '创建成功', icon: 'success' })
						setTimeout(() => {
							const params = []
							if (newId) params.push('id=' + newId)
							if (this.form.name) params.push('name=' + encodeURIComponent(this.form.name.trim()))
							params.push('from=register')
							uni.navigateTo({
								url: '/pages/factory/certify' + (params.length ? '?' + params.join('&') : '')
							})
						}, 1000)
					}
				} catch (e) {
					uni.hideLoading()
					uni.showToast({ title: '提交失败', icon: 'none' })
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss">
	.page {
		height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 180rpx;
		box-sizing: border-box;
	}

	.form-section {
		margin: 20rpx 24rpx 0;
	}

	.section-title {
		padding: 24rpx 0;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.form-item {
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.form-label {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 12rpx;
		display: block;
	}

	.form-input {
		font-size: 28rpx;
		color: #333;
		width: 100%;
	}

	.input-placeholder {
		color: #bbb;
		font-size: 28rpx;
	}

	.phone-btn {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		text-align: left;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		width: 100%;
		min-height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;

		&::after {
			border: none;
		}
	}

	.phone-value {
		font-size: 28rpx;
		color: #333;
	}

	.phone-placeholder {
		font-size: 28rpx;
		color: #bbb;
	}

	.location-value {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.location-placeholder {
		font-size: 28rpx;
		color: #bbb;
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		background-color: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 28rpx 0;
		margin: 0;
		border-radius: 16rpx;
		border: none;
		line-height: 1;
	}

	.action-btn::after {
		border: none;
	}

	.submit-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.35);
	}

	.btn-label {
		font-size: 30rpx;
		color: #fff;
		font-weight: 600;
	}

	.action-btn.disabled {
		background: #b7c7da;
		pointer-events: none;
		box-shadow: none;
	}
</style>