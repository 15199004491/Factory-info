<template>
	<view class="page">
		<view class="form-section">
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">标题</text>
					<input class="form-input" v-model="form.title" maxlength="30" placeholder="例：大量收购玉米小麦" placeholder-class="form-placeholder" />
				</view>
				<view class="form-item form-item-link" @tap="openRegionPicker">
					<text class="form-label">所在地区</text>
					<view class="form-input-wrap">
						<text class="form-value" :class="{ 'form-placeholder-text': !form.region }">{{ form.region || '请选择地区' }}</text>
						<u-icon name="arrow-down" size="14" color="#999"></u-icon>
					</view>
				</view>
			</view>
		</view>

		<view class="form-section">
			<view class="form-card">
				<view class="section-title">
					<text class="title-text">收购品类</text>
					<view class="add-category-btn" @tap="onAddCategory">
						<text class="add-category-text">+ 新增品类</text>
					</view>
				</view>
				<view class="category-list" v-if="form.categories.length > 0">
					<view class="category-item" v-for="(cat, idx) in form.categories" :key="idx">
						<view class="cat-header">
							<text class="cat-name">{{ cat.name }}</text>
							<view class="cat-price">
								<text class="cat-price-num">{{ cat.price }}</text>
								<text class="cat-price-unit">元/{{ cat.unit }}</text>
							</view>
						</view>
						<view class="cat-actions">
							<view class="cat-action-btn" @tap="onEditCategory(idx)">
								<text class="cat-action-text">编辑</text>
							</view>
							<view class="cat-action-btn" @tap="onDeleteCategory(idx)">
								<text class="cat-action-text">删除</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty" v-else>
					<text class="empty-text">暂无品类，点击右上角新增</text>
				</view>
			</view>
		</view>

		<view class="form-section">
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">联系电话</text>
					<input class="form-input" v-model="form.mobile" type="number" maxlength="11" placeholder="请输入联系电话" placeholder-class="form-placeholder" />
				</view>
				<view class="form-item form-item-textarea">
					<text class="form-label">详细说明</text>
					<textarea class="form-textarea" v-model="form.description" maxlength="200" placeholder="请详细说明收购要求、品质标准等" placeholder-class="form-placeholder"></textarea>
				</view>
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

		<view class="modal-mask" v-if="showModal" @tap="closeModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-title">
					<text>{{ editingIndex >= 0 ? '编辑品类' : '新增品类' }}</text>
				</view>
				<view class="modal-form">
					<view class="form-row">
						<text class="form-label">品类名称</text>
						<input class="form-input" v-model="formData.name" placeholder="请输入品类名称" placeholder-class="form-placeholder" />
					</view>
					<view class="form-row">
						<text class="form-label">收购价格</text>
						<view class="price-row">
							<input class="form-input price-input" v-model="formData.price" type="digit" placeholder="请输入价格" placeholder-class="form-placeholder" @input="onPriceInput" @blur="onPriceBlur" />
							<text class="price-unit-label">元</text>
							<picker class="unit-picker" :value="unitIndex" :range="unitOptions" @change="onUnitChange">
								<view class="unit-select">
									<text class="unit-text">{{ formData.unit }}</text>
									<text class="unit-arrow">▼</text>
								</view>
							</picker>
						</view>
					</view>
				</view>
				<view class="modal-actions">
					<view class="modal-btn btn-cancel" @tap="closeModal">
						<text>取消</text>
					</view>
					<view class="modal-btn btn-confirm" @tap="saveCategory">
						<text>确定</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'
	import regionPicker from '@/components/region-picker/region-picker.vue'
	import { purchaseApi } from '@/utils/request.js'

	export default {
		components: {
			uIcon,
			regionPicker
		},
		data() {
			return {
				showRegionPicker: false,
				showModal: false,
				editingIndex: -1,
				unitOptions: ['斤', '公斤', '吨'],
				editingId: null,
				form: {
					title: '',
					region: '',
					mobile: '',
					description: '',
					categories: []
				},
				formData: {
					name: '',
					price: '',
					unit: '斤'
				}
			}
		},
		computed: {
			unitIndex() {
				return this.unitOptions.indexOf(this.formData.unit)
			}
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
					const data = await purchaseApi.purchaseDetail({ Id: this.editingId })
					this.form = {
						title: data.title || '',
						region: data.region || data.area || '',
						mobile: data.mobile || '',
						description: data.description || data.explain || '',
						categories: data.items ? data.items.map(item => ({
							name: item.name || '',
							price: item.price || '',
							unit: item.unit || '斤'
						})) : []
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
			onAddCategory() {
				this.editingIndex = -1
				this.formData = { name: '', price: '', unit: '斤' }
				this.showModal = true
			},
			onEditCategory(idx) {
				const cat = this.form.categories[idx]
				this.editingIndex = idx
				this.formData = {
					name: cat.name,
					price: cat.price,
					unit: cat.unit
				}
				this.showModal = true
			},
			onDeleteCategory(idx) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除品类「' + this.form.categories[idx].name + '」吗？',
					confirmColor: '#ff4d4f',
					success: (res) => {
						if (res.confirm) {
							this.form.categories.splice(idx, 1)
							uni.showToast({ title: '已删除', icon: 'success' })
						}
					}
				})
			},
			closeModal() {
				this.showModal = false
				this.editingIndex = -1
			},
			onUnitChange(e) {
				this.formData.unit = this.unitOptions[e.detail.value]
			},
			onPriceInput(e) {
				let val = e.detail.value
				val = val.replace(/[^\d.]/g, '')
				const parts = val.split('.')
				if (parts.length > 2) {
					val = parts[0] + '.' + parts.slice(1).join('')
				}
				if (parts[1] && parts[1].length > 2) {
					val = parts[0] + '.' + parts[1].substring(0, 2)
				}
				this.formData.price = val
			},
			onPriceBlur() {
				const val = parseFloat(this.formData.price)
				if (!isNaN(val)) {
					this.formData.price = val.toFixed(2)
				}
			},
			saveCategory() {
				if (!this.formData.name.trim()) {
					uni.showToast({ title: '请输入品类名称', icon: 'none' })
					return
				}
				if (!this.formData.price.trim()) {
					uni.showToast({ title: '请输入收购价格', icon: 'none' })
					return
				}
				const price = this.formatPrice(this.formData.price)

				if (this.editingIndex >= 0) {
					this.form.categories.splice(this.editingIndex, 1, {
						name: this.formData.name.trim(),
						price,
						unit: this.formData.unit
					})
				} else {
					this.form.categories.push({
						name: this.formData.name.trim(),
						price,
						unit: this.formData.unit
					})
				}
				this.showModal = false
				this.editingIndex = -1
				uni.showToast({ title: '保存成功', icon: 'success' })
			},
			formatPrice(price) {
				const val = parseFloat(price)
				return isNaN(val) ? price : val.toFixed(2)
			},
			async onSubmit() {
				if (!this.form.title) {
					uni.showToast({ title: '请填写标题', icon: 'none' })
					return
				}
				if (this.form.categories.length === 0) {
					uni.showToast({ title: '请至少添加一个品类', icon: 'none' })
					return
				}
				if (!this.form.region) {
					uni.showToast({ title: '请选择所在地区', icon: 'none' })
					return
				}
				if (!this.form.mobile) {
					uni.showToast({ title: '请填写联系电话', icon: 'none' })
					return
				}

				uni.showLoading({ title: '提交中...' })

				const msg = [
					this.form.title,
					this.form.region,
					this.form.categories.map(c => c.name).join(' '),
					this.form.description
				].filter(Boolean).join(' ')

				const textOk = await uni.checkTextSafe(msg)
				if (!textOk) {
					uni.hideLoading()
					return
				}

				try {
					const postData = {
						id: this.editingId || undefined,
						title: this.form.title,
						region: this.form.region,
						mobile: this.form.mobile,
						description: this.form.description,
						items: this.form.categories.map(c => ({
							name: c.name,
							price: c.price,
							unit: c.unit
						}))
					}
					await purchaseApi.addPurchase(postData)
					uni.hideLoading()
					uni.showToast({ title: this.editingId ? '修改成功' : '发布成功', icon: 'success' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				} catch (e) {
					uni.hideLoading()
					uni.showToast({ title: '提交失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	}

	.form-section {
		margin: 20rpx 24rpx 0;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.section-title {
		padding: 28rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.title-text {
		font-size: 26rpx;
		color: #666;
		font-weight: normal;
	}

	.add-category-btn {
		flex: none;
		padding: 0;
	}

	.add-category-text {
		font-size: 26rpx;
		color: #3c9cff;
		font-weight: 500;
	}

	.category-list {
		padding: 0 24rpx;
	}

	.category-item {
		background-color: transparent;
		border-radius: 0;
		padding: 24rpx 0;
		margin-bottom: 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.category-item:last-child {
		border-bottom: none;
	}

	.cat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.cat-price {
		display: flex;
		align-items: baseline;
	}

	.cat-price-num {
		font-size: 38rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.cat-price-unit {
		font-size: 18rpx;
		font-weight: 700;
		color: #ff5722;
		margin-left: 4rpx;
	}

	.cat-actions {
		display: flex;
		gap: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
		justify-content: flex-end;
	}

	.cat-action-btn {
		flex: none;
		padding: 12rpx 28rpx;
		background-color: #fff;
		border: 1rpx solid #ddd;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cat-action-text {
		font-size: 24rpx;
		color: #333;
		font-weight: normal;
	}

	.empty {
		display: flex;
		justify-content: center;
		padding: 60rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.form-item {
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.form-item-textarea {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
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

	.form-item-link {
		cursor: pointer;
	}

	.form-textarea {
		width: 100%;
		min-height: 180rpx;
		font-size: 28rpx;
		color: #333;
		padding: 16rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
	}

	.form-placeholder {
		color: #999;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 32rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
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

	.submit-btn-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 500;
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.modal-content {
		width: 620rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
	}

	.modal-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 32rpx;
	}

	.modal-form {
		margin-bottom: 32rpx;
	}

	.form-row {
		margin-bottom: 24rpx;
	}

	.form-row:last-child {
		margin-bottom: 0;
	}

	.form-label {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 12rpx;
		display: block;
	}

	.form-input {
		width: 100%;
		height: 72rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #f5f7fa;
		border-radius: 8rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.price-row {
		display: flex;
		gap: 16rpx;
		align-items: center;
	}

	.price-input {
		flex: 1;
	}

	.price-unit-label {
		font-size: 28rpx;
		color: #333;
		flex: none;
	}

	.unit-picker {
		flex: none;
	}

	.unit-select {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 0 20rpx;
		height: 72rpx;
		background-color: #f5f7fa;
		border-radius: 8rpx;
	}

	.unit-text {
		font-size: 28rpx;
		color: #333;
	}

	.unit-arrow {
		font-size: 18rpx;
		color: #999;
	}

	.modal-actions {
		display: flex;
		gap: 24rpx;
	}

	.modal-btn {
		flex: 1;
		padding: 24rpx 0;
		border-radius: 12rpx;
		text-align: center;
		font-size: 28rpx;
	}

	.btn-cancel {
		background-color: #f5f7fa;
		color: #666;
	}

	.btn-confirm {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		color: #fff;
	}
</style>