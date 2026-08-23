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

		<view class="form-section">
			<view class="section-title">
				<text class="title-text">营业资质</text>
			</view>
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">营业执照</text>
					<uploader-single
						ref="uploaderLicense"
						v-model="form.license"
						shape="license"
						add-text="上传营业执照"
						tip="请上传清晰的营业执照照片"
						remove-confirm="确定要删除营业执照吗？"
						@change="onLicenseChange"
					/>
				</view>
			</view>
		</view>

		<view class="submit-area">
			<view class="submit-row">
				<view class="submit-btn btn-free" :class="{ disabled: submitting }" @tap="onSubmit">
					<text class="submit-btn-label">{{ submitting ? '提交中...' : (isEdit ? '立即提交' : '立即入驻') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { factoryApi, userApi } from '@/utils/request.js'
	import uploaderSingle from '@/components/uploader-single/uploader-single.vue'
	import { isLocalTempPath } from '@/utils/upload.js'

	export default {
		components: {
			uploaderSingle
		},
		data() {
			return {
				isEdit: false,
				factoryId: null,
				submitting: false,
				form: {
					name: '',
					mobile: '',
					location: {
						address: '',
						latitude: 0,
						longitude: 0
					},
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
						location: {
							address: locationObj ? locationObj.address : (data.address || ''),
							latitude: locationObj ? locationObj.latitude : (data.latitude || 0),
							longitude: locationObj ? locationObj.longitude : (data.longitude || 0)
						},
						license: data.license || ''
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
				uni.chooseLocation({
					success: (res) => {
						this.form.location = {
							address: res.address || res.name,
							latitude: res.latitude,
							longitude: res.longitude
						}
					},
					fail: (err) => {
						console.error('chooseLocation fail:', err)
					}
				})
			},
			onLicenseChange(val) {
				this.form.license = val || ''
			},
			async onSubmit() {
				if (this.submitting) return
				if (!this.form.name.trim()) {
					uni.showToast({ title: '请输入加工厂名称', icon: 'none' })
					return
				}
				if (this.form.name.trim().length > 20) {
					uni.showToast({ title: '加工厂名称不能超过20字', icon: 'none' })
					return
				}
				if (!this.form.mobile) {
					uni.showToast({ title: '请获取联系电话', icon: 'none' })
					return
				}
				if (!this.form.location.address) {
					uni.showToast({ title: '请选择加工厂地址', icon: 'none' })
					return
				}
				const refLicense = (this.$refs.uploaderLicense && this.$refs.uploaderLicense.currentSrc) || ''
				if (refLicense && !this.form.license) {
					this.form.license = refLicense
				}
				if (!this.isEdit && !this.form.license) {
					uni.showToast({ title: '请上传营业执照', icon: 'none' })
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
					let licenseUrl = this.form.license
					if (licenseUrl && isLocalTempPath(licenseUrl)) {
						licenseUrl = await uni.uploadFactoryLicense(licenseUrl)
					}

					const postData = {
						id: this.factoryId || undefined,
						name: this.form.name.trim(),
						mobile: this.form.mobile,
						location: this.form.location,
						license: licenseUrl
					}

					postData.id = this.factoryId || undefined
					await factoryApi.addFactory(postData)
					uni.hideLoading()
					uni.showToast({ title: this.isEdit ? '保存成功' : '入驻成功', icon: 'success' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
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
		width: 56rpx;
		height: 56rpx;
		background-color: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 12rpx;
	}

	.remove-icon {
		color: #fff;
		font-size: 36rpx;
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
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24rpx 48rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
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
		padding: 28rpx 0;
		margin: 0 12rpx;
		border-radius: 12rpx;
	}

	.submit-btn-label {
		font-size: 30rpx;
		font-weight: 600;
		color: #fff;
	}

	.btn-free {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.35);
	}

	.submit-btn.disabled {
		background: #b7c7da;
		pointer-events: none;
		box-shadow: none;
	}
</style>