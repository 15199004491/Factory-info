<template>
	<view class="page">
		<view class="form-list">
			<view class="form-item">
				<text class="form-label">标题</text>
				<input class="form-input" v-model="form.title" maxlength="30" placeholder="例：阳光花园 3室2厅 精装修" placeholder-class="form-placeholder" />
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
				<text class="form-label">朝向</text>
				<picker class="form-picker" :range="orientationOptions" @change="onOrientationChange">
					<view class="picker-value" :class="{ 'form-placeholder-text': !form.orientation }">
						{{ form.orientation || '请选择朝向' }}
						<u-icon name="arrow-down" size="14" color="#999"></u-icon>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">装修</text>
				<picker class="form-picker" :range="decorationOptions" @change="onDecorationChange">
					<view class="picker-value" :class="{ 'form-placeholder-text': !form.decoration }">
						{{ form.decoration || '请选择装修' }}
						<u-icon name="arrow-down" size="14" color="#999"></u-icon>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">年代</text>
				<picker class="form-picker" :range="yearOptions" @change="onYearChange">
					<view class="picker-value" :class="{ 'form-placeholder-text': !form.year }">
						{{ form.year || '请选择年代' }}
						<u-icon name="arrow-down" size="14" color="#999"></u-icon>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">售价(万)</text>
				<input class="form-input" v-model="form.price" type="number" maxlength="10" placeholder="例：128" placeholder-class="form-placeholder" />
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
				orientationOptions: ['东', '南', '西', '北', '东南', '西南', '东北', '西北', '南北', '东西'],
				decorationOptions: ['毛坯', '简装', '精装', '豪装'],
				yearOptions: [],
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
					orientation: '',
					decoration: '',
					year: '',
					price: '',
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
			var years = []
			var currentYear = new Date().getFullYear()
			for (var y = currentYear; y >= 1990; y--) {
				years.push(y + '年')
			}
			this.yearOptions = years
		},
		onLoad(options) {
			if (options && options.action === 'edit') {
				var id = parseInt(options.id)
				this.editingId = id
				var list = uni.getStorageSync('published_second') || []
				var item = null
				for (var i = 0; i < list.length; i++) {
					if (list[i].id === id) {
						item = list[i]
						break
					}
				}
				if (item) {
					this.form = {
						title: item.title || '',
						community: item.community || '',
						region: item.region || '',
						locationName: item.locationName || '',
						latitude: item.latitude || null,
						longitude: item.longitude || null,
						houseType: item.houseType || '',
						area: item.area || '',
						floor: item.floor || '',
						orientation: item.orientation || '',
						decoration: item.decoration || '',
						year: item.year || '',
						price: item.price || '',
						images: item.images || [],
						description: item.description || ''
					}
				}
			}
		},
		methods: {
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
			onOrientationChange(e) {
				this.form.orientation = this.orientationOptions[e.detail.value]
			},
			onYearChange(e) {
				this.form.year = this.yearOptions[e.detail.value]
			},
			onDecorationChange(e) {
				this.form.decoration = this.decorationOptions[e.detail.value]
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
			onSubmit() {
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
				if (!this.form.locationName) {
					uni.showToast({ title: '请选择地点', icon: 'none' })
					return
				}
				if (!this.form.area) {
					uni.showToast({ title: '请填写面积', icon: 'none' })
					return
				}
				if (!this.form.price) {
					uni.showToast({ title: '请填写售价', icon: 'none' })
					return
				}
				var key = 'published_second'
				var list = uni.getStorageSync(key) || []
				var item = {
					id: Date.now(),
					type: 'second',
					title: this.form.title,
					community: this.form.community,
					region: this.form.region,
					locationName: this.form.locationName,
					latitude: this.form.latitude,
					longitude: this.form.longitude,
					houseType: this.form.houseType,
					area: this.form.area,
					floor: this.form.floor,
					orientation: this.form.orientation,
					decoration: this.form.decoration,
					year: this.form.year,
					price: this.form.price,
					images: this.form.images,
					description: this.form.description,
					createTime: new Date().toLocaleString()
				}
				if (this.editingId) {
					var idx = -1
					for (var i = 0; i < list.length; i++) {
						if (list[i].id === this.editingId) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						item.id = this.editingId
						item.createTime = list[idx].createTime
						list.splice(idx, 1, item)
					}
					this.editingId = null
					uni.showToast({ title: '修改成功', icon: 'success' })
				} else {
					list.unshift(item)
					uni.showToast({ title: '发布成功', icon: 'success' })
				}
				uni.setStorageSync(key, list)
				setTimeout(() => {
					uni.navigateBack()
				}, 1000)
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