<template>
	<view class="page">
		<view class="form-list">
			<view class="form-item">
				<text class="form-label">标题</text>
				<view class="form-input">
					<sensitive-input
						:key="'title-' + formLoadKey"
						ref="titleInput"
						:value="form.title"
						@input="form.title = $event"
						:maxlength="20"
						placeholder="例：阳光花园 3室2厅整租"
						placeholder-class="form-placeholder"
					/>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">小区</text>
				<view class="form-input">
					<sensitive-input
						:key="'name-' + formLoadKey"
						ref="nameInput"
						:value="form.name"
						@input="form.name = $event"
						:maxlength="20"
						placeholder="请输入小区名称"
						placeholder-class="form-placeholder"
					/>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="openRegionPicker">
				<text class="form-label">地区</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.area }">{{ form.area || '请选择地区' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="onChooseLocation">
				<text class="form-label">位置</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.location.address }">
						{{ form.location.address || '获取地址' }}
					</text>
					<u-icon name="map" size="16" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">面积</text>
				<view class="input-with-unit form-input">
					<input v-model="form.acreage" type="number" maxlength="10" placeholder="请输入面积" placeholder-class="form-placeholder" />
					<text class="input-unit">㎡</text>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="openPicker">
				<text class="form-label">楼层</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.floor }">{{ form.floor || '请选择楼层' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="openPicker('pay_type')">
				<text class="form-label">付款方式</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.pay_type }">{{ form.pay_type || '请选择付款方式' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">月租(元)</text>
				<input class="form-input" v-model="form.price" type="number" maxlength="6" placeholder="例：2800" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">联系电话</text>
				<input class="form-input" v-model="form.mobile" type="number" maxlength="15" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">租赁方式</text>
				<view class="tag-select">
					<view class="tag-option" :class="{ active: form.tag_type === 'entire' }" @tap="form.tag_type = 'entire'">
						<text class="tag-text">整租</text>
					</view>
					<view class="tag-option" :class="{ active: form.tag_type === 'shared' }" @tap="form.tag_type = 'shared'">
						<text class="tag-text">合租</text>
					</view>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">房源图片</text>
				<uploader-single
					ref="uploaderRent"
					v-model="form.rent_image"
					tip="选填，上传后能提高浏览量"
					@change="onImageChanged"
				/>
			</view>

			<view class="form-item form-item-textarea">
				<text class="form-label">房源描述</text>
				<sensitive-textarea
					:key="'explain-' + formLoadKey"
					ref="explainInput"
					:value="form.explain"
					@input="form.explain = $event"
					:maxlength="200"
					placeholder="请详细描述房源信息"
					placeholder-class="form-placeholder"
					input-class="form-textarea"
				/>
			</view>
		</view>

		<view class="submit-bar">
			<view class="submit-btn" :class="{ disabled: submitting }" @tap="onSubmit">
				<text class="submit-btn-text">{{ submitting ? '提交中...' : (editingId ? '保存修改' : '立即发布') }}</text>
			</view>
		</view>

		<region-picker
			:visible="showRegionPicker"
			@confirm="onRegionConfirm"
			@cancel="onRegionCancel"
		/>

		<view class="filter-mask" v-if="showPicker" @tap="closePicker"></view>
		<view class="filter-sheet" :class="{ 'filter-sheet-show': showPicker }">
			<view class="sheet-header">
				<text class="sheet-title">{{ pickerTitle }}</text>
				<view class="sheet-confirm" @tap="confirmPicker">
					<text class="sheet-confirm-text">确定</text>
				</view>
			</view>
			<picker-view class="filter-picker" :value="pickerValue" @change="onPickerChange" indicator-style="height: 80rpx; border-top: 1rpx solid #eee; border-bottom: 1rpx solid #eee;">
				<picker-view-column>
					<view class="picker-item" v-for="(opt, i) in pickerOptions" :key="i">
						{{ opt }}
					</view>
				</picker-view-column>
			</picker-view>
		</view>
		<canvas canvas-id="compressCanvas" class="compress-canvas"></canvas>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'
	import uploaderSingle from '@/components/uploader-single/uploader-single.vue'
	import { rentApi } from '@/utils/request.js'
	import { uploadImages, isLocalTempPath } from '@/utils/upload.js'

	export default {
		components: {
			uIcon,
			regionPicker,
			uploaderSingle
		},
		data() {
			return {
				showRegionPicker: false,
				showPicker: false,
				pickerType: '',
				pickerTitle: '',
				pickerValue: [0],
				pickerTempIndex: 0,
				floorOptions: [],
				pay_typeOptions: ['押0付一', '押一付一', '押一付三', '季付', '半年付', '年付'],
				pickerOptions: [],
				editingId: null,
				sourceOpenId: '',
				imageChanged: false,
				submitting: false,
				formLoadKey: 0,
				form: {
					title: '',
					name: '',
					area: '',
					acreage: '',
					floor: '',
					pay_type: '',
					price: '',
					mobile: '',
					tag_type: 'entire',
					rent_image: '',
					explain: '',
					location: {
						address: '',
						latitude: 39.908823,
						longitude: 116.397470
					}
				}
			}
		},
		created() {
			var floors = []
			floors.push('地下1层')
			for (var i = 1; i <= 32; i++) {
				floors.push(i + '层')
			}
			this.floorOptions = floors
		},
		onLoad(options) {
			if (options && options.action === 'edit') {
				this.editingId = parseInt(options.id)
				this.loadDetail()
			}
			if (options && options.source_open_id) {
				this.sourceOpenId = decodeURIComponent(options.source_open_id)
			}
		},
		methods: {
			fixCoord(val, defaultVal) {
				const num = Number(val)
				if (isNaN(num) || num < -180 || num > 180) return defaultVal
				return num
			},
			async loadDetail() {
				try {
					const data = await rentApi.rentDetail({ Id: this.editingId })
					let locationObj = null
					if (data.location) {
						if (typeof data.location === 'string') {
							try { locationObj = JSON.parse(data.location) } catch (e) { locationObj = null }
						} else { locationObj = data.location }
					}
					this.form = {
						title: data.title || '',
						name: data.name || '',
						area: data.area_name || data.area || '',
						acreage: data.acreage || '',
						floor: data.floor || '',
						pay_type: data.pay_type || '',
						price: data.price || '',
						mobile: data.mobile || '',
						tag_type: data.tag_type || 'entire',
						rent_image: data.rent_image || '',
						explain: data.explain || '',
						location: {
							address: locationObj ? locationObj.address : (data.location_name || data.address || data.location || ''),
							latitude: this.fixCoord(parseFloat(locationObj ? locationObj.latitude : (data.latitude || 39.908823)), 39.908823),
							longitude: this.fixCoord(parseFloat(locationObj ? locationObj.longitude : (data.longitude || 116.397470)), 116.397470)
						}
					}
					this.imageChanged = false
					this.$nextTick(() => {
						if (this.$refs.uploaderRent) {
							this.$refs.uploaderRent.currentSrc = data.rent_image
						}
						this.formLoadKey++
					})
				} catch (e) {}
			},
			onImageChanged(val) {
				this.form.rent_image = val || ''
				this.imageChanged = true
			},
			openRegionPicker() {
				this.showRegionPicker = true
			},
			onRegionConfirm(label) {
				this.form.area = label
				this.showRegionPicker = false
			},
			onRegionCancel() {
				this.showRegionPicker = false
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
								uni.openLocation({
									latitude,
									longitude,
									name: this.form.name || '房源位置',
									address,
									scale: 16
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
			openPicker(type) {
				this.pickerType = type
				if (type === 'pay_type') {
					this.pickerTitle = '选择付款方式'
					this.pickerOptions = this.pay_typeOptions
					const idx = Math.max(0, this.pay_typeOptions.indexOf(this.form.pay_type))
					this.pickerValue = [idx]
					this.pickerTempIndex = idx
				} else {
					this.pickerTitle = '选择楼层'
					this.pickerOptions = this.floorOptions
					const idx = Math.max(0, this.floorOptions.indexOf(this.form.floor))
					this.pickerValue = [idx]
					this.pickerTempIndex = idx
				}
				this.showPicker = true
			},
			closePicker() {
				this.showPicker = false
			},
			onPickerChange(e) {
				const idx = e.detail.value[0]
				this.pickerTempIndex = idx
				this.pickerValue = [idx]
			},
			confirmPicker() {
				const idx = this.pickerTempIndex
				const value = this.pickerOptions[idx]
				if (this.pickerType === 'pay_type') {
					this.form.pay_type = value
				} else {
					this.form.floor = value
				}
				this.pickerValue = [idx]
				this.showPicker = false
			},
			async onSubmit() {
				if (this.submitting) return
				this.submitting = true
				uni.showLoading({ title: '校验中...', mask: true })
				try {
					if (!this.form.title) {
						uni.showToast({ title: '请填写标题', icon: 'none' })
						return
					}
					if (!this.form.name) {
						uni.showToast({ title: '请填写小区名称', icon: 'none' })
						return
					}
					if (!this.form.area) {
						uni.showToast({ title: '请选择地区', icon: 'none' })
						return
					}
					if (!this.form.acreage) {
						uni.showToast({ title: '请填写面积', icon: 'none' })
						return
					}
					if (!this.form.floor) {
						uni.showToast({ title: '请选择楼层', icon: 'none' })
						return
					}
					if (!this.form.pay_type) {
						uni.showToast({ title: '请选择付款方式', icon: 'none' })
						return
					}
					if (!this.form.price) {
						uni.showToast({ title: '请填写月租', icon: 'none' })
						return
					}
					const refImage = (this.$refs.uploaderRent && this.$refs.uploaderRent.currentSrc) || ''
					if (refImage && !this.form.rent_image) {
						this.form.rent_image = refImage
					}

					const validations = [
						{ ref: this.$refs.titleInput, label: '标题' },
						{ ref: this.$refs.nameInput, label: '小区名称' },
						{ ref: this.$refs.explainInput, label: '房源描述' }
					]
					const results = await Promise.all(validations.map(v => {
						if (!v.ref || !v.ref.validate) return Promise.resolve({ valid: true, label: v.label })
						return v.ref.validate().then(valid => ({ valid, label: v.label }))
					}))
					const failed = results.filter(r => !r.valid)
					if (failed.length > 0) {
						uni.showToast({ title: failed.map(f => f.label).join('、') + ' 含敏感词汇', icon: 'none' })
						return
					}

					uni.showLoading({ title: '提交中...', mask: true })

					let rentImage = this.form.rent_image || ''
					if (rentImage && this.imageChanged) {
						const uploaded = await uploadImages([rentImage], { dir: 'rent-house' })
						rentImage = uploaded[0] || ''
					}

					const postData = {
						id: this.editingId || undefined,
						title: this.form.title,
						name: this.form.name,
						area: this.form.area,
						acreage: this.form.acreage,
						floor: this.form.floor,
						pay_type: this.form.pay_type,
						price: this.form.price,
						mobile: this.form.mobile,
						tag_type: this.form.tag_type,
						rent_image: rentImage,
						explain: this.form.explain,
						location: this.form.location,
						source_open_id: this.sourceOpenId || undefined
					}
					await rentApi.addRent(postData)
					uni.hideLoading()
					if (this.sourceOpenId && !this.editingId) {
						uni.showModal({
							title: '提示',
							content: '房源已提交成功，后台审核通过后将展示在列表中，请勿重复提交',
							showCancel: false,
							confirmText: '我知道了',
							success: () => {
								uni.navigateBack()
							}
						})
					} else {
						uni.showToast({ title: this.editingId ? '修改成功' : '发布成功', icon: 'success' })
						setTimeout(() => {
							uni.navigateBack()
						}, 1000)
					}
				} catch (e) {
					console.error('租房提交失败:', e)
				} finally {
					uni.hideLoading()
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/common/form.scss';

	.compress-canvas {
		position: fixed;
		left: -9999rpx;
		top: -9999rpx;
		width: 2000rpx;
		height: 2000rpx;
		z-index: -1;
		opacity: 0;
		pointer-events: none;
	}

	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	}

	.filter-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1098;
	}

	.filter-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 1099;
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

	.tag-select {
		display: flex;
		gap: 20rpx;
	}

	.tag-option {
		padding: 12rpx 40rpx;
		background-color: #f5f5f5;
		border-radius: 30rpx;
	}

	.tag-option.active {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.tag-option .tag-text {
		font-size: 26rpx;
		color: #666;
	}

	.tag-option.active .tag-text {
		color: #fff;
	}

	.image-upload {
		margin-top: 10rpx;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.image-item {
		width: 180rpx;
		height: 180rpx;
		position: relative;
	}

	.upload-image {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
	}

	.image-delete {
		position: absolute;
		top: -12rpx;
		right: -12rpx;
		width: 36rpx;
		height: 36rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-icon {
		font-size: 28rpx;
		color: #fff;
		line-height: 1;
	}

	.image-add {
		width: 180rpx;
		height: 180rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.add-icon {
		font-size: 60rpx;
		color: #ccc;
		font-weight: 300;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 16rpx;
		display: block;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
		z-index: 999;
	}

	.submit-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn.disabled {
		background: #b7c7da;
		pointer-events: none;
	}

	.submit-btn-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}
</style>