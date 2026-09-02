<template>
	<view class="page">
		<view class="factory-bar">
			<text class="factory-name">{{ factoryName }}</text>
		</view>

		<view class="form-section">
			<view class="form-card">
				<view class="form-item form-item-row">
					<text class="form-label">通知</text>
					<view class="notice-wrap">
						<sensitive-textarea
							ref="noticeInput"
							:value="factoryNotice"
							@input="factoryNotice = $event"
							:maxlength="200"
							placeholder="请输入通知内容，如：即日起至8月31日，小麦收购价格上调5%"
							placeholder-class="input-placeholder"
							input-class="form-textarea"
							:show-count="true"
						/>
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
				<view class="category-list">
					<view class="category-item" v-for="(cat, idx) in categories" :key="idx">
						<view class="cat-header">
							<view class="cat-name-wrap">
								<text class="cat-name">{{ cat.name }}</text>
								<text class="cat-status-tag" :class="cat.status">{{ cat.status === 'active' ? '收购中' : '暂停收购' }}</text>
							</view>
							<view class="cat-price">
								<text class="cat-price-num" v-if="cat.price != null && cat.price !== ''">{{ formatPrice(cat.price) }}</text>
								<text class="cat-price-unit" v-if="cat.price != null && cat.price !== ''">元/{{ cat.unit }}</text>
								<text class="cat-price-num price-negotiable" v-else>面议</text>
							</view>
						</view>
						<view class="cat-remark" v-if="cat.remark">
							<text class="cat-remark-label">备注：</text>
							<text class="cat-remark-text">{{ cat.remark }}</text>
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
				<view class="empty" v-if="categories.length === 0">
					<text class="empty-text">暂无品类，点击右上角新增</text>
				</view>
			</view>
			<safe-bottom :height="260"></safe-bottom>
		</view>

		<view class="bottom-bar">
			<view class="publish-tip">
				<u-icon name="error-circle" size="14" color="#d48806" class="publish-tip-icon"></u-icon>
				<text class="publish-tip-text">新增或修改品类后，请点击下方「发布」按钮完成更新</text>
			</view>
			<view class="publish-btn" :class="{ 'publishing': publishing }" @tap="onPublish">
				<text class="publish-text">{{ publishing ? '发布中...' : '发布' }}</text>
			</view>
		</view>

		<view class="modal-mask" v-if="showModal" @tap="closeModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-title">
					<text>{{ editingIndex >= 0 ? '编辑品类' : '新增品类' }}</text>
				</view>
				<view class="modal-form">
					<view class="form-row">
						<text class="form-label">品类名称</text>
						<view class="form-input-gray modal-cat-name-wrap">
							<sensitive-input
								ref="catNameInput"
								:value="form.name"
								@input="form.name = $event"
								:maxlength="10"
								placeholder="请输入品类名称"
								placeholder-class="form-placeholder"
							/>
						</view>
					</view>
					<view class="form-row">
						<text class="form-label">价格</text>
						<view class="price-row">
							<input class="form-input-gray price-input" v-model="form.price" type="digit" maxlength="10" placeholder="请输入价格" placeholder-class="form-placeholder" @input="onPriceInput" @blur="onPriceBlur" />
							<text class="price-unit-label">元</text>
							<picker class="unit-picker" :value="unitIndex" :range="unitOptions" @change="onUnitChange">
								<view class="unit-select">
									<text class="unit-text">{{ form.unit }}</text>
									<text class="unit-arrow">▼</text>
								</view>
							</picker>
						</view>
					</view>
					<view class="form-row">
						<text class="form-label">状态</text>
						<view class="status-tabs">
							<view class="status-tab" :class="{ active: form.status === 'active' }" @tap="form.status = 'active'">
								<text>收购中</text>
							</view>
							<view class="status-tab" :class="{ active: form.status === 'paused' }" @tap="form.status = 'paused'">
								<text>暂停收购</text>
							</view>
						</view>
					</view>
					<view class="form-row">
						<text class="form-label">备注</text>
						<sensitive-textarea
							ref="catRemarkInput"
							:value="form.remark"
							@input="form.remark = $event"
							:maxlength="50"
							:auto-height="true"
							placeholder="选填，如：要求水分≤14%"
							placeholder-class="form-placeholder"
							input-class="form-textarea-gray"
							:show-count="true"
						/>
					</view>
				</view>
				<view class="modal-actions">
					<view class="modal-btn btn-cancel" @tap="closeModal">
						<text>取消</text>
					</view>
					<view class="modal-btn btn-confirm" :class="{ disabled: saving }" @tap="saveCategory">
						<text>{{ saving ? '校验中...' : '确定' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { factoryApi } from '@/utils/request.js'
	import uIcon from 'uview-plus/components/u-icon/u-icon.vue'

	export default {
		components: {
			uIcon
		},
		data() {
			return {
				factoryId: null,
				factoryName: '',
				factoryNotice: '',
				categories: [],
				showModal: false,
				editingIndex: -1,
				saving: false,
				publishing: false,
				unitOptions: ['公斤', '吨'],
				form: {
					name: '',
					price: '',
					unit: '公斤',
					status: 'active',
					remark: ''
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.factoryId = parseInt(options.id)
			}
			if (options.name) {
				this.factoryName = decodeURIComponent(options.name)
				uni.setNavigationBarTitle({
					title: this.factoryName + ' - 发布信息'
				})
			}
			this.loadFactoryInfo()
		},
		computed: {
			unitIndex() {
				return this.unitOptions.indexOf(this.form.unit)
			}
		},
		methods: {
			onUnitChange(e) {
				this.form.unit = this.unitOptions[e.detail.value]
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
				this.form.price = val
			},
			onPriceBlur() {
				const val = parseFloat(this.form.price)
				if (!isNaN(val)) {
					this.form.price = val.toFixed(2)
				}
			},
			async loadFactoryInfo() {
				if (!this.factoryId) return
				try {
					const data = await factoryApi.getDetail(this.factoryId)
					if (data) {
						if (!this.factoryName && data.name) {
							this.factoryName = data.name
							uni.setNavigationBarTitle({
								title: this.factoryName + ' - 发布信息'
							})
						}
						this.factoryNotice = data.notice || data.announcement || ''

						let categoryData = null
						const candidates = ['categories', 'category_list', 'list', 'goods', 'items', 'purchase_list', 'category', 'data']
						for (const key of candidates) {
							if (data[key] && (Array.isArray(data[key]) || typeof data[key] === 'string')) {
								categoryData = data[key]
								break
							}
						}
						if (!categoryData && data.info) {
							for (const key of candidates) {
								if (data.info[key]) {
									categoryData = data.info[key]
									break
								}
							}
						}
						if (!categoryData && data.factory) {
							for (const key of candidates) {
								if (data.factory[key]) {
									categoryData = data.factory[key]
									break
								}
							}
						}
						if (categoryData) {
							this.categories = this.parseCategories(categoryData)
						}
					}
				} catch (e) {
					console.error('loadFactoryInfo错误:', e)
				}
			},
			parseCategories(data) {
				if (!data) return []
				if (Array.isArray(data)) {
					return data.map(item => {
						if (typeof item === 'string') {
							return { name: item, price: '', unit: '公斤', status: 'active', remark: '' }
						}
						const rawPrice = item.price != null ? String(item.price) : ''
						let remark = item.remark || item.notes || ''
						if (remark.length > 50) remark = remark.substring(0, 50)
						const priceVal = (rawPrice && rawPrice.trim() !== '') ? this.formatPrice(rawPrice) : ''
						return {
							name: item.name || item.category || '',
							price: priceVal,
							unit: item.unit || '公斤',
							status: item.status === 1 || item.status === '1' ? 'active' : 'paused',
							remark: remark
						}
					})
				}
				if (typeof data === 'string') {
					return data.split(',').filter(Boolean).map(name => ({
						name, price: '', unit: '公斤', status: 'active', remark: ''
					}))
				}
				return []
			},
			formatPrice(price) {
				if (price === null || price === undefined || price === '') {
					return ''
				}
				const val = parseFloat(price)
				return isNaN(val) ? '' : val.toFixed(2)
			},
			formatPriceForBackend(price) {
				if (price === null || price === undefined) return null
				const str = String(price).trim()
				if (str === '') return null
				const val = parseFloat(str)
				if (isNaN(val)) return null
				return val.toFixed(2)
			},
			onAddCategory() {
				if (this.categories.length >= 6) {
					uni.showToast({ title: '最多只能添加6个品类', icon: 'none' })
					return
				}
				this.editingIndex = -1
				this.form = { name: '', price: '', unit: '公斤', status: 'active', remark: '' }
				this.showModal = true
			},
			onEditCategory(idx) {
				const cat = this.categories[idx]
				this.editingIndex = idx
				this.form = {
					name: cat.name,
					price: cat.price,
					unit: cat.unit,
					status: cat.status,
					remark: cat.remark || ''
				}
				this.showModal = true
			},
			onDeleteCategory(idx) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除品类「' + this.categories[idx].name + '」吗？',
					confirmColor: '#ff4d4f',
					success: (res) => {
						if (res.confirm) {
							this.categories.splice(idx, 1)
							uni.showToast({ title: '已删除', icon: 'success' })
						}
					}
				})
			},
			closeModal() {
				this.showModal = false
			},
			async saveCategory() {
				if (this.saving) return
				if (!this.form.name.trim()) {
					uni.showToast({ title: '请输入品类名称', icon: 'none' })
					return
				}
				const validations = [
					{ ref: this.$refs.catNameInput, label: '品类名称' },
					{ ref: this.$refs.catRemarkInput, label: '备注' }
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

				const rawPrice = this.form.price == null ? '' : String(this.form.price)
				const price = rawPrice.trim() === '' ? '' : this.formatPrice(rawPrice)
				let remark = this.form.remark == null ? '' : String(this.form.remark)
				if (remark.length > 50) remark = remark.substring(0, 50)

				const catData = {
					name: this.form.name.trim(),
					price: price,
					unit: this.form.unit,
					status: this.form.status,
					remark: remark
				}
				console.log('保存品类数据:', catData)

				if (this.editingIndex >= 0) {
					this.$set(this.categories, this.editingIndex, {
						...this.categories[this.editingIndex],
						name: catData.name,
						price: catData.price,
						unit: catData.unit,
						status: catData.status,
						remark: catData.remark
					})
				} else {
					this.categories.push({
						name: catData.name,
						price: catData.price,
						unit: catData.unit,
						status: catData.status,
						remark: catData.remark
					})
				}
				console.log('当前categories列表:', JSON.stringify(this.categories))
				this.showModal = false
				uni.showToast({ title: '保存成功', icon: 'success' })
			},
			async onPublish() {
				if (this.publishing) return
				if (!this.factoryId) {
					uni.showToast({ title: '加工厂信息缺失', icon: 'none' })
					return
				}

				const noticeInput = this.$refs.noticeInput
				if (noticeInput && noticeInput.validate) {
					const valid = await noticeInput.validate()
					if (!valid) {
						uni.showToast({ title: '通知含敏感词汇', icon: 'none' })
						return
					}
				}

				this.publishing = true
				uni.showLoading({ title: '发布中...', mask: true })
				try {
					let notice = this.factoryNotice == null ? '' : String(this.factoryNotice)
					if (notice.length > 200) {
						notice = notice.substring(0, 200)
					}
					const categoriesPayload = this.categories.map(cat => {
						let remark = cat.remark == null ? '' : String(cat.remark)
						if (remark.length > 50) remark = remark.substring(0, 50)
						return {
							name: cat.name,
							price: this.formatPriceForBackend(cat.price),
							unit: cat.unit,
							status: cat.status === 'active' ? 1 : 0,
							remark: remark
						}
					})
					const payload = {
						id: this.factoryId,
						notice: notice,
						categories: categoriesPayload
					}
					console.log('发布payload:', JSON.stringify(payload))
					await factoryApi.publishFactory(payload)
					uni.hideLoading()
					uni.showToast({ title: '发布成功', icon: 'success' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				} catch (e) {
					console.error('发布失败:', e)
					uni.hideLoading()
				} finally {
					this.publishing = false
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/common/form.scss';

	.page {
		height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 180rpx;
		box-sizing: border-box;
	}

	.factory-bar {
		background-color: #fff;
		padding: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.factory-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.form-section {
		margin: 20rpx 24rpx 0;
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

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.form-item-row {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
	}

	.form-item-row .form-label {
		flex: none;
		width: 80rpx;
		margin-bottom: 0;
		line-height: 60rpx;
	}

	.form-item-row .form-textarea {
		flex: 1;
	}

	.notice-wrap {
		flex: 1;
		position: relative;
	}

	.input-placeholder {
		color: #bbb;
		font-size: 28rpx;
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
		margin-bottom: 12rpx;
	}

	.cat-name-wrap {
		display: flex;
		align-items: center;
	}

	.cat-status-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}

	.cat-status-tag.active {
		background-color: #e8f5e9;
		color: #4caf50;
	}

	.cat-status-tag.paused {
		background-color: #ffebee;
		color: #f44336;
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

	.price-negotiable {
		font-size: 28rpx;
		color: #999;
		font-weight: 500;
	}

	.cat-remark {
		margin-bottom: 16rpx;
		padding-top: 12rpx;
		border-top: 1rpx dashed #eee;
	}

	.cat-remark-label {
		font-size: 24rpx;
		color: #999;
	}

	.cat-remark-text {
		font-size: 24rpx;
		color: #666;
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

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 32rpx 24rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.publish-tip {
		display: flex;
		align-items: center;
		gap: 12rpx;
		background-color: #fff8e1;
		border-radius: 10rpx;
		padding: 14rpx 18rpx;
		margin-bottom: 18rpx;
	}

	.publish-tip-icon {
		flex-shrink: 0;
		line-height: 1;
		height: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.publish-tip-text {
		font-size: 24rpx;
		color: #b8860b;
		line-height: 1.4;
		flex: 1;
		padding: 2rpx 0;
	}

	.publish-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		border-radius: 16rpx;
		padding: 30rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(60, 156, 255, 0.35);
	}

	.publish-btn.publishing {
		opacity: 0.6;
		pointer-events: none;
	}

	.publish-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
		letter-spacing: 4rpx;
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
		position: relative;
		z-index: 1;
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

	.form-input-gray {
		background-color: #f5f7fa;
	}

	.cat-name-wrap {
		height: 72rpx;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.modal-cat-name-wrap {
		width: 100%;
		height: 72rpx;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.form-textarea-gray {
		background-color: #f5f7fa;
		min-height: 120rpx;
		max-height: 200rpx;
		padding: 16rpx 20rpx;
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

	.status-tabs {
		display: flex;
		gap: 20rpx;
	}

	.status-tab {
		flex: 1;
		padding: 18rpx 0;
		background-color: #f5f7fa;
		border-radius: 8rpx;
		text-align: center;
		font-size: 26rpx;
		color: #666;
		border: 2rpx solid transparent;
	}

	.status-tab.active {
		background-color: rgba(60, 156, 255, 0.1);
		color: #3c9cff;
		border-color: #3c9cff;
	}

	.modal-actions {
		display: flex;
		gap: 24rpx;
		position: relative;
		z-index: 2;
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

	.modal-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
	}
</style>