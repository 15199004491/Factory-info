<template>
	<view class="page">
		<view class="form-list">
			<view class="form-item">
				<text class="form-label">标题</text>
				<input class="form-input" v-model="form.title" maxlength="30" placeholder="例：阳光花园 3室2厅" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">小区</text>
				<input class="form-input" v-model="form.community" maxlength="30" placeholder="请输入小区名称" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item form-item-link" @tap="openRegionPicker">
				<text class="form-label">地区</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.region }">{{ form.region || '请选择地区' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item form-item-link" @tap="openMapLocation">
				<text class="form-label">地点</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.locationName }">{{ form.locationName || '选择地点' }}</text>
					<u-icon name="map" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">户型</text>
				<picker class="form-picker" :range="houseTypeOptions" @change="onHouseTypeChange">
					<view class="picker-value" :class="{ 'form-placeholder-text': !form.houseType }">
						{{ form.houseType || '请选择户型' }}
						<u-icon name="arrow-down" size="14" color="#999"></u-icon>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">面积</text>
				<view class="input-with-unit">
					<input class="form-input" v-model="form.area" type="digit" maxlength="10" placeholder="请输入面积" placeholder-class="form-placeholder" />
					<text class="input-unit">㎡</text>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">楼层</text>
				<picker class="form-picker" :range="floorOptions" @change="onFloorChange">
					<view class="picker-value" :class="{ 'form-placeholder-text': !form.floor }">
						{{ form.floor || '请选择楼层' }}
						<u-icon name="arrow-down" size="14" color="#999"></u-icon>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">售价(万)</text>
				<input class="form-input" v-model="form.price" type="number" maxlength="10" placeholder="例：128" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">联系电话</text>
				<input class="form-input" v-model="form.phone" type="number" maxlength="11" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">房源图片</text>
				<view class="image-upload">
					<view class="image-list">
						<view class="image-item" v-for="(img, idx) in form.images" :key="idx">
							<image class="upload-image" :src="img" mode="aspectFill" />
							<view class="image-delete" @tap="removeImage(idx)">
								<text class="delete-icon">×</text>
							</view>
						</view>
						<view class="image-add" @tap="chooseImage" v-if="form.images.length < 1">
							<text class="add-icon">+</text>
						</view>
					</view>
					<text class="upload-tip">最多上传1张图片</text>
				</view>
			</view>

			<view class="form-item form-item-textarea">
				<text class="form-label">房源描述</text>
				<textarea class="form-textarea" v-model="form.description" :maxlength="-1" placeholder="请详细描述房源信息" placeholder-class="form-placeholder"></textarea>
			</view>
		</view>

		<view class="submit-bar">
			<view class="submit-btn" @tap="onSubmit">
				<text class="submit-btn-text">立即发布</text>
			</view>
		</view>

		<region-picker
			:visible="showRegionPicker"
			@confirm="onRegionConfirm"
			@cancel="onRegionCancel"
		/>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'
	import { secondHouseApi, userApi } from '@/utils/request.js'

	export default {
		components: {
			uIcon,
			regionPicker
		},
		data() {
			return {
				showRegionPicker: false,
				editingId: null,
				houseTypeOptions: ['1室1厅', '1室2厅', '2室1厅', '2室2厅', '2室3厅', '3室1厅', '3室2厅', '3室3厅', '4室2厅', '4室3厅', '5室2厅', '5室3厅'],
				floorOptions: [],
				form: {
					title: '',
					community: '',
					region: '',
					locationName: '',
					latitude: null,
					longitude: null,
					houseType: '',
					area: '',
					floor: '',
					price: '',
					phone: '',
					images: [],
					description: ''
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
					this.form = {
						title: data.title || '',
						community: data.community || '',
						region: data.region || '',
						locationName: data.location_name || '',
						latitude: data.latitude || null,
						longitude: data.longitude || null,
						houseType: data.house_type || '',
						area: data.area || '',
						floor: data.floor || '',
						price: data.price || '',
						phone: data.phone || '',
						images: Array.isArray(data.images) ? data.images : [],
						description: data.description || ''
					}
				} catch (e) {}
			},
			openRegionPicker() {
				this.showRegionPicker = true
			},
			onRegionConfirm(label) {
				this.form.region = label
				this.showRegionPicker = false
			},
			onRegionCancel() {
				this.showRegionPicker = false
			},
			openMapLocation() {
				var self = this
				uni.chooseLocation({
					success: function(res) {
						self.form.locationName = res.name || res.address
						self.form.latitude = res.latitude
						self.form.longitude = res.longitude
					},
					fail: function() {
						uni.showToast({
							title: '请在小程序后台开启定位权限',
							icon: 'none'
						})
					}
				})
			},
			onHouseTypeChange(e) {
				this.form.houseType = this.houseTypeOptions[e.detail.value]
			},
			onFloorChange(e) {
				this.form.floor = this.floorOptions[e.detail.value]
			},
			chooseImage() {
				var self = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						self.form.images = res.tempFilePaths
					}
				})
			},
			removeImage(idx) {
				this.form.images.splice(idx, 1)
			},
			async onSubmit() {
				if (!this.form.title) {
					uni.showToast({ title: '请填写标题', icon: 'none' })
					return
				}
				if (!this.form.community) {
					uni.showToast({ title: '请填写小区名称', icon: 'none' })
					return
				}
				if (!this.form.region) {
					uni.showToast({ title: '请选择地区', icon: 'none' })
					return
				}
				if (!this.form.houseType) {
					uni.showToast({ title: '请选择户型', icon: 'none' })
					return
				}
				if (!this.form.area) {
					uni.showToast({ title: '请填写面积', icon: 'none' })
					return
				}
				if (!this.form.floor) {
					uni.showToast({ title: '请选择楼层', icon: 'none' })
					return
				}
				if (!this.form.phone) {
					uni.showToast({ title: '请填写联系电话', icon: 'none' })
					return
				}

				const msg = [
					this.form.title,
					this.form.community,
					this.form.region,
					this.form.houseType,
					this.form.description
				].filter(Boolean).join(' ')

				try {
					const result = await userApi.msgCheck(msg)
					if (result.errcode !== 0) {
						uni.showToast({ title: '内容包含敏感信息', icon: 'none' })
						return
					}
				} catch (e) {}

				const postData = {
					id: this.editingId || undefined,
					title: this.form.title,
					name: this.form.community,
					shape: this.form.houseType,
					acreage: this.form.area,
					floor: this.form.floor,
					price: this.form.price,
					mobile: this.form.phone,
					second_image: this.form.images,
					explain: this.form.description,
					area: this.form.region,
					location: this.form.locationName,
				}

				try {
					await secondHouseApi.addHouse(postData)
					uni.showToast({ title: this.editingId ? '修改成功' : '发布成功', icon: 'success' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				} catch (e) {}
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 160rpx;
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

	.form-textarea {
		width: 100%;
		min-height: 180rpx;
		font-size: 28rpx;
		color: #333;
		padding: 16rpx 0;
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
	}

	.submit-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}
</style>