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
			<view class="submit-btn" @tap="onSubmit">
				<text class="submit-text">{{ isEdit ? '保存修改' : '提交入驻申请' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isEdit: false,
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
			if (options.edit === '1' && options.name) {
				this.isEdit = true
				uni.setNavigationBarTitle({ title: '编辑加工厂' })
				this.loadFactoryData(decodeURIComponent(options.name))
			}
		},
		methods: {
			loadFactoryData(name) {
				const mockData = {
					'红旗粮食综合加工厂': {
						name: '红旗粮食综合加工厂',
						phone: '13888888888',
						address: '山东省济南市历城区农业产业园88号',
						latitude: 36.6512,
						longitude: 117.1201
					},
					'丰收粮油加工厂': {
						name: '丰收粮油加工厂',
						phone: '13999999999',
						address: '山东省济南市章丘区工业大道66号',
						latitude: 36.7200,
						longitude: 117.1800
					}
				}
				const data = mockData[name]
				if (data) {
					this.form = { ...this.form, ...data }
				}
			},
			onGetPhone(e) {
				if (e.detail.errMsg === 'getPhoneNumber:ok') {
					const code = e.detail.code
					this.mockExchangePhone(code)
				} else {
					uni.showToast({ title: '获取手机号失败', icon: 'none' })
				}
			},
			mockExchangePhone(code) {
				uni.showLoading({ title: '获取中...' })
				setTimeout(() => {
					uni.hideLoading()
					const mockPhone = '13888888888'
					this.form.phone = mockPhone
					uni.showToast({ title: '已获取手机号', icon: 'success' })
				}, 600)
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
			onChooseLicense() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.form.license = res.tempFilePaths[0]
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
			onSubmit() {
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
				if (!this.form.license) {
					uni.showToast({ title: '请上传营业执照', icon: 'none' })
					return
				}
				if (this.isEdit) {
					uni.showModal({
						title: '保存成功',
						content: '加工厂信息已更新',
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
				} else {
					uni.showModal({
						title: '提交成功',
						content: '您的入驻申请已提交，审核结果将通过电话通知您',
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
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
		padding: 40rpx 48rpx 20rpx;
	}

	.submit-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 28rpx 0;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
	}
</style>