<template>
	<view class="page">
		<view class="form-section">
			<view class="section-title">
				<text class="title-text">基本信息</text>
			</view>
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">加工厂名称</text>
					<input class="form-input" v-model="form.name" placeholder="请输入加工厂名称" placeholder-class="input-placeholder" />
				</view>
				<view class="form-item">
					<text class="form-label">联系电话</text>
					<button class="phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhone">
						<text v-if="form.phone" class="phone-value">{{ form.phone }}</text>
						<text v-else class="phone-placeholder">获取手机号</text>
					</button>
				</view>
				<view class="form-item" @tap="onChooseLocation">
					<text class="form-label">加工厂地址</text>
					<text v-if="form.address" class="location-value">{{ form.address }}</text>
					<text v-else class="location-placeholder">获取地址</text>
				</view>
			</view>
		</view>

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">营业资质</text>
			</view>
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">营业执照</text>
					<view class="license-upload">
						<view class="license-preview" v-if="form.license" @tap="onPreviewLicense">
							<image class="license-image" :src="form.license" mode="aspectFill" />
							<view class="license-remove" @tap="onRemoveLicense">
								<text class="remove-icon">×</text>
							</view>
						</view>
						<view class="license-add" v-else @tap="onChooseLicense">
							<text class="add-icon">+</text>
							<text class="add-text">上传营业执照</text>
						</view>
					</view>
					<text class="upload-tip">请上传清晰的营业执照照片</text>
				</view>
			</view>
		</view>

		<view class="submit-area">
			<view class="submit-row" v-if="isEdit">
				<view class="submit-btn" @tap="onSubmit('edit')">
					<text class="submit-text">保存修改</text>
				</view>
			</view>
			<view class="submit-row" v-else>
				<view class="submit-btn btn-trial" @tap="onSubmit('trial')">
					<text class="submit-btn-label">免费试用</text>
					<text class="submit-btn-sub">30天</text>
				</view>
				<view class="submit-btn btn-yearly" @tap="onSubmit('yearly')">
					<view class="discount-badge">3.0折</view>
					<text class="submit-btn-label">付费入驻</text>
					<view class="yearly-price-row">
						<text class="submit-btn-sub">¥300/年</text>
						<text class="original-price">¥1000/年</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { factoryApi, userApi } from '@/utils/request.js'
	import '@/utils/upload.js'

	export default {
		data() {
			return {
				isEdit: false,
				factoryId: null,
				form: {
					name: '',
					phone: '',
					address: '',
					latitude: 0,
					longitude: 0,
					license: ''
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
			async loadFactoryData() {
				try {
					const data = await factoryApi.getDetail(this.factoryId)
					this.form = {
						name: data.name || '',
						phone: data.phone || '',
						address: data.address || '',
						latitude: data.latitude || 0,
						longitude: data.longitude || 0,
						license: data.license || ''
					}
				} catch (e) {}
			},
			async onGetPhone(e) {
				if (e.detail.errMsg === 'getPhoneNumber:ok') {
					try {
						const data = await userApi.getPhone(e.detail.code)
						this.form.phone = data.phoneNumber
					} catch (err) {
						uni.showToast({ title: '获取手机号失败', icon: 'none' })
					}
				} else {
					uni.showToast({ title: '获取手机号失败', icon: 'none' })
				}
			},
			onChooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						this.form.address = res.address || res.name
						this.form.latitude = res.latitude
						this.form.longitude = res.longitude
					},
					fail: (err) => {
						console.error('chooseLocation fail:', err)
					}
				})
			},
			async onChooseLicense() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const tempPath = res.tempFilePaths[0]
						uni.showLoading({ title: '校验中...' })
						const ok = await uni.checkImageSafe(tempPath)
						uni.hideLoading()
						if (ok) {
							this.form.license = tempPath
						}
					}
				})
			},
			onPreviewLicense() {
				if (this.form.license) {
					uni.previewImage({
						urls: [this.form.license],
						current: this.form.license
					})
				}
			},
			onRemoveLicense() {
				uni.showModal({
					title: '提示',
					content: '确定要删除营业执照吗？',
					success: (res) => {
						if (res.confirm) {
							this.form.license = ''
						}
					}
				})
			},
			async onSubmit(plan) {
				if (!this.form.name.trim()) {
					uni.showToast({ title: '请输入加工厂名称', icon: 'none' })
					return
				}
				if (!this.form.phone) {
					uni.showToast({ title: '请获取联系电话', icon: 'none' })
					return
				}
				if (!this.form.address) {
					uni.showToast({ title: '请选择加工厂地址', icon: 'none' })
					return
				}

				const msg = [
					this.form.name,
					this.form.phone,
					this.form.address
				].filter(Boolean).join(' ')

				try {
					const result = await userApi.msgCheck(msg)
					if (result.errcode !== 0) {
						uni.showToast({ title: '内容包含敏感信息', icon: 'none' })
						return
					}
				} catch (e) {}

				try {
					uni.showLoading({ title: '提交中...' })

					let licenseUrl = this.form.license
					if (licenseUrl && !licenseUrl.startsWith('http')) {
						licenseUrl = await uni.uploadFactoryLicense(licenseUrl)
					}

					const postData = {
						id: this.factoryId || undefined,
						name: this.form.name,
						phone: this.form.phone,
						address: this.form.address,
						latitude: this.form.latitude,
						longitude: this.form.longitude,
						license: licenseUrl,
						plan: plan
					}

					if (this.isEdit) {
						await factoryApi.edit(postData)
						uni.showToast({ title: '保存成功', icon: 'success' })
					} else if (plan === 'trial') {
						await factoryApi.addFactory(postData)
						uni.showToast({ title: '已开通30天免费试用', icon: 'success' })
					} else if (plan === 'yearly') {
						uni.showModal({
							title: '付费入驻',
							content: '请联系客服完成 ¥300/年 的入驻付费后提交申请。是否继续提交？',
							confirmText: '继续提交',
							success: async (res) => {
								if (res.confirm) {
									try {
										await factoryApi.addFactory(postData)
										uni.showToast({ title: '提交成功，请联系客服完成付费', icon: 'none' })
										setTimeout(() => {
											uni.navigateBack()
										}, 1500)
									} catch (e) {
										uni.showToast({ title: '提交失败', icon: 'none' })
									} finally {
										uni.hideLoading()
									}
								} else {
									uni.hideLoading()
								}
							},
							fail: () => {
								uni.hideLoading()
							}
						})
						return
					}
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				} catch (e) {
					uni.showToast({ title: '提交失败', icon: 'none' })
				} finally {
					if (plan !== 'yearly') {
						uni.hideLoading()
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 60rpx;
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

	.license-upload {
		margin-top: 16rpx;
	}

	.license-preview {
		position: relative;
		width: 240rpx;
		height: 160rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.license-image {
		width: 100%;
		height: 100%;
	}

	.license-remove {
		position: absolute;
		top: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 12rpx;
	}

	.remove-icon {
		color: #fff;
		font-size: 28rpx;
		line-height: 1;
	}

	.license-add {
		width: 240rpx;
		height: 160rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.add-icon {
		font-size: 48rpx;
		color: #ccc;
		line-height: 1;
	}

	.add-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 12rpx;
		display: block;
	}

	.submit-area {
		padding: 40rpx 24rpx 20rpx;
	}

	.submit-row {
		display: flex;
	}

	.submit-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		margin: 0 12rpx;
		border-radius: 12rpx;
	}

	.submit-text {
		font-size: 28rpx;
		font-weight: 500;
		color: #fff;
	}

	.submit-btn-label {
		font-size: 28rpx;
		font-weight: 500;
		color: #fff;
	}

	.submit-btn-sub {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-top: 6rpx;
	}

	.yearly-price-row {
		display: flex;
		align-items: baseline;
		margin-top: 6rpx;
	}

	.yearly-price-row .submit-btn-sub {
		margin-top: 0;
	}

	.original-price {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.6);
		text-decoration: line-through;
		margin-left: 12rpx;
	}

	.btn-trial {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.btn-yearly {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
		position: relative;
		overflow: hidden;
	}

	.discount-badge {
		position: absolute;
		top: 0;
		right: 0;
		background: linear-gradient(135deg, #ff4d4f, #ff7875);
		color: #fff;
		font-size: 20rpx;
		font-weight: 700;
		padding: 4rpx 16rpx;
		border-bottom-left-radius: 12rpx;
		line-height: 1.2;
	}
</style>