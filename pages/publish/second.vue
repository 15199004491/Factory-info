<template>
	<view class="page">
		<view class="form-list">
			<view class="form-item">
				<text class="form-label">标题</text>
				<input class="form-input" v-model="form.title" maxlength="20" placeholder="例：阳光花园 3室2厅" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">小区</text>
				<input class="form-input" v-model="form.name" maxlength="10" placeholder="请输入小区名称" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item form-item-link" @tap="openRegionPicker">
				<text class="form-label">地区</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.area }">{{ form.area || '请选择地区' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="openPicker('type')">
				<text class="form-label">户型</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.shape }">{{ form.shape || '请选择户型' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">面积</text>
				<view class="input-with-unit">
					<input class="form-input" v-model="form.acreage" type="digit" maxlength="20" placeholder="请输入面积" placeholder-class="form-placeholder" />
					<text class="input-unit">㎡</text>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="openPicker('floor')">
				<text class="form-label">楼层</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.floor }">{{ form.floor || '请选择楼层' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">售价(万)</text>
				<input class="form-input" v-model="form.price" type="number" maxlength="10" placeholder="例：128" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">联系电话</text>
				<input class="form-input" v-model="form.mobile" type="number" maxlength="15" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">房源图片</text>
				<uploader-single
					ref="uploaderSecond"
					v-model="form.second_image"
					tip="选填，上传后能提高浏览量"
					@change="onImageChanged"
				/>
			</view>

			<view class="form-item form-item-textarea">
				<text class="form-label">房源描述</text>
				<view class="textarea-wrap">
					<textarea class="form-textarea" v-model="form.explain" maxlength="200" placeholder="请详细描述房源信息" placeholder-class="form-placeholder" adjust-position="true" cursor-spacing="120" fixed="false"></textarea>
					<text class="textarea-count">{{ form.explain.length }}/200</text>
				</view>
			</view>
		</view>

		<view class="submit-bar">
			<view class="submit-btn" :class="{ disabled: submitting }" @tap="onSubmit">
				<text class="submit-btn-text">{{ submitting ? '提交中...' : (isEdit ? '保存修改' : '立即发布') }}</text>
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
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'
	import uploaderSingle from '@/components/uploader-single/uploader-single.vue'
	import { secondHouseApi, userApi } from '@/utils/request.js'
	import { uploadImages, isLocalTempPath } from '@/utils/upload.js'

	export default {
		components: {
			uIcon,
			regionPicker,
			uploaderSingle
		},
		data() {
			return {
				submitting: false,
				showRegionPicker: false,
				showPicker: false,
				pickerType: '',
				pickerTitle: '',
				pickerValue: [0],
				pickerOptions: [],
				pickerTempIndex: 0,
				editingId: null,
				typeOptions: ['1室1厅', '1室2厅', '2室1厅', '2室2厅', '2室3厅', '3室1厅', '3室2厅', '3室3厅', '4室2厅', '4室3厅', '5室2厅', '5室3厅'],
				floorOptions: [],
				imageChanged: false,
				form: {
					title: '',
					name: '',
					area: '',
					shape: '',
					acreage: '',
					floor: '',
					price: '',
					mobile: '',
					second_image: '',
					explain: ''
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
		},
		methods: {
			async loadDetail() {
				try {
					const data = await secondHouseApi.getDetail(this.editingId)
					this.form = data
					this.imageChanged = false
					this.$nextTick(() => {
						if (this.$refs.uploaderSecond) {
							this.$refs.uploaderSecond.currentSrc = data.second_image
						}
					})
				} catch (e) {
					console.error('加载二手房详情失败:', e)
				}
			},
			onImageChanged(val) {
				this.form.second_image = val || ''
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
			openPicker(shape) {
				this.pickerType = shape
				if (shape === 'type') {
					this.pickerTitle = '选择户型'
					this.pickerOptions = this.typeOptions
					const idx = Math.max(0, this.typeOptions.indexOf(this.form.shape))
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
				this.pickerTempIndex = e.detail.value[0]
			},
			confirmPicker() {
				const value = this.pickerOptions[this.pickerTempIndex]
				if (this.pickerType === 'type') {
					this.form.shape = value
				} else {
					this.form.floor = value
				}
				this.showPicker = false
			},
			async onSubmit() {
				if (this.submitting) return
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
				if (!this.form.shape) {
					uni.showToast({ title: '请选择户型', icon: 'none' })
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
				if (!this.form.price) {
					uni.showToast({ title: '请填写售价', icon: 'none' })
					return
				}
				if (!this.form.mobile) {
					uni.showToast({ title: '请填写联系电话', icon: 'none' })
					return
				}
				const refImage = (this.$refs.uploaderSecond && this.$refs.uploaderSecond.currentSrc) || ''
				if (refImage && !this.form.second_image) {
					this.form.second_image = refImage
				}

				this.submitting = true
				uni.showLoading({ title: '校验中...', mask: true, timeout: 6000 })

				const msg = [
					this.form.title,
					this.form.name,
					this.form.area,
					this.form.acreage,
					this.form.shape,
					this.form.explain
				].filter(Boolean).join(' ')

				const textOk = await uni.checkTextSafe(msg)
				if (!textOk) {
					uni.hideLoading()
					this.submitting = false
					return
				}

				try {
					let secondImage = this.form.second_image || ''
					if (secondImage && this.imageChanged) {
						console.log('上传二手房图片到COS:', secondImage)
						const uploaded = await uploadImages([secondImage], { dir: 'second-house' })
						secondImage = uploaded[0] || ''
						console.log('二手房图片处理完成: 最终结果=', secondImage)
					}

					const postData = {
						id: this.editingId || undefined,
						title: this.form.title,
						name: this.form.name,
						shape: this.form.shape,
						acreage: this.form.acreage,
						floor: this.form.floor,
						price: this.form.price,
						mobile: this.form.mobile,
						second_image: secondImage,
						explain: this.form.explain,
						area: this.form.area,
					}
					console.log('提交二手房数据:', postData)
					await secondHouseApi.addHouse(postData)
					uni.hideLoading()
					uni.showToast({ title: this.editingId ? '修改成功' : '发布成功', icon: 'success' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				} catch (e) {
					console.error('二手房提交失败:', e)
					uni.hideLoading()
					uni.showToast({ title: (e && e.message) ? '提交失败:' + e.message : '提交失败', icon: 'none' })
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss">
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

	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	}

	.form-list {
		background-color: #fff;
		margin-top: 20rpx;
	}

	.form-item {
		padding: 28rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.form-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 16rpx;
		display: block;
	}

	.form-input {
		width: 100%;
		height: 60rpx;
		font-size: 28rpx;
		color: #333;
	}

	.form-picker {
		width: 100%;
	}

	.picker-value {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 60rpx;
		font-size: 28rpx;
		color: #333;
	}

	.form-input-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 60rpx;
	}

	.form-value {
		font-size: 28rpx;
		color: #333;
	}

	.form-placeholder-text {
		color: #999;
	}

	.form-placeholder {
		color: #999;
	}

	.input-with-unit {
		display: flex;
		align-items: center;
		height: 60rpx;
	}

	.input-with-unit .form-input {
		flex: 1;
	}

	.input-unit {
		font-size: 28rpx;
		color: #666;
		margin-left: 10rpx;
	}

	.textarea-wrap {
		position: relative;
		width: 100%;
	}
	.form-textarea {
		width: 100%;
		min-height: 180rpx;
		font-size: 28rpx;
		color: #333;
		padding: 16rpx 0 48rpx 0;
		background-color: #f9f9f9;
		border-radius: 8rpx;
	}
	.textarea-count {
		position: absolute;
		right: 4rpx;
		bottom: 12rpx;
		font-size: 22rpx;
		color: #999;
		line-height: 1;
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