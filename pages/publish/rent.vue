<template>
	<view class="page">
		<view class="form-list">
			<view class="form-item">
				<text class="form-label">标题</text>
				<input class="form-input" v-model="form.title" placeholder="例：阳光花园 3室2厅整租" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">小区</text>
				<input class="form-input" v-model="form.community" placeholder="请输入小区名称" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item form-item-link" @tap="openRegionPicker">
				<text class="form-label">地点</text>
				<view class="form-input-wrap">
					<text class="form-value" :class="{ 'form-placeholder-text': !form.region }">{{ form.region || '请选择地区' }}</text>
					<u-icon name="arrow-down" size="14" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">户型</text>
				<input class="form-input" v-model="form.houseType" placeholder="例：3室2厅1卫" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">面积</text>
				<input class="form-input" v-model="form.area" placeholder="例：120㎡" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">楼层</text>
				<input class="form-input" v-model="form.floor" placeholder="例：中层/6层" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">朝向</text>
				<input class="form-input" v-model="form.orientation" placeholder="例：南北" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">装修</text>
				<input class="form-input" v-model="form.decoration" placeholder="例：精装修" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">付款方式</text>
				<input class="form-input" v-model="form.payment" placeholder="例：押一付三" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">月租(元)</text>
				<input class="form-input" v-model="form.price" type="digit" placeholder="例：2800" placeholder-class="form-placeholder" />
			</view>

			<view class="form-item">
				<text class="form-label">租赁方式</text>
				<view class="tag-select">
					<view class="tag-option" :class="{ active: form.tagType === 'entire' }" @tap="form.tagType = 'entire'">
						<text class="tag-text">整租</text>
					</view>
					<view class="tag-option" :class="{ active: form.tagType === 'shared' }" @tap="form.tagType = 'shared'">
						<text class="tag-text">合租</text>
					</view>
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
	import { userApi } from '@/utils/request.js'

	export default {
		components: {
			uIcon,
			regionPicker
		},
		data() {
			return {
				showRegionPicker: false,
				editingId: null,
				form: {
					title: '',
					community: '',
					region: '',
					houseType: '',
					area: '',
					floor: '',
					orientation: '',
					decoration: '',
					payment: '',
					price: '',
					tagType: 'entire',
					description: ''
				}
			}
		},
		onLoad(options) {
			if (options && options.action === 'edit') {
				var id = parseInt(options.id)
				this.editingId = id
				var list = uni.getStorageSync('published_rent') || []
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
						houseType: item.houseType || '',
						area: item.area || '',
						floor: item.floor || '',
						orientation: item.orientation || '',
						decoration: item.decoration || '',
						payment: item.payment || '',
						price: item.price || '',
						tagType: item.tagType || 'entire',
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
			async onSubmit() {
				if (!this.form.title) {
					uni.showToast({ title: '请填写标题', icon: 'none' })
					return
				}
				if (!this.form.community) {
					uni.showToast({ title: '请填写小区', icon: 'none' })
					return
				}
				if (!this.form.price) {
					uni.showToast({ title: '请填写月租', icon: 'none' })
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

				var key = 'published_rent'
				var list = uni.getStorageSync(key) || []
				var item = {
					id: Date.now(),
					type: 'rent',
					title: this.form.title,
					community: this.form.community,
					region: this.form.region,
					houseType: this.form.houseType,
					area: this.form.area,
					floor: this.form.floor,
					orientation: this.form.orientation,
					decoration: this.form.decoration,
					payment: this.form.payment,
					price: this.form.price,
					tagType: this.form.tagType,
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

	.form-textarea {
		width: 100%;
		min-height: 180rpx;
		font-size: 28rpx;
		color: #333;
		padding: 16rpx 0;
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