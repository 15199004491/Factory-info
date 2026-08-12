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
				<view class="form-item upload-item">
					<text class="form-label">营业执照</text>
					<view class="upload-area" @tap="onChooseLicense">
						<image v-if="form.licenseImage" class="upload-preview" :src="form.licenseImage" mode="aspectFill" @click.stop="onPreviewLicense" />
						<view v-else class="upload-placeholder">
							<text class="upload-icon">+</text>
							<text class="upload-text">点击上传营业执照</text>
							<text class="upload-tip">请上传清晰完整的营业执照原件照片</text>
						</view>
					</view>
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
	import { chooseAndUpload } from '@/utils/upload.js'

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
					licenseImage: ''
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
						longitude: 117.1201,
						licenseImage: ''
					},
					'丰收粮油加工厂': {
						name: '丰收粮油加工厂',
						phone: '13999999999',
						address: '山东省济南市章丘区工业大道66号',
						latitude: 36.7200,
						longitude: 117.1800,
						licenseImage: ''
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
			async onChooseLicense() {
				try {
					const result = await chooseAndUpload(1)
					this.form.licenseImage = result.url
					uni.showToast({ title: '上传成功', icon: 'success' })
				} catch (err) {
					console.error('Upload failed:', err)
				}
			},
			onPreviewLicense() {
				if (!this.form.licenseImage) return
				uni.previewImage({
					urls: [this.form.licenseImage],
					current: this.form.licenseImage
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
				if (!this.form.licenseImage) {
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

	.upload-item {
		border-bottom: none;
	}

	.upload-area {
		width: 100%;
		min-height: 360rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.upload-preview {
		width: 100%;
		height: 400rpx;
		display: block;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48rpx;
	}

	.upload-icon {
		font-size: 80rpx;
		color: #ccc;
		line-height: 1;
	}

	.upload-text {
		font-size: 28rpx;
		color: #333;
		margin-top: 16rpx;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 12rpx;
		text-align: center;
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