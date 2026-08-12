<template>
	<view class="region-picker" v-if="visible" @tap="onMaskTap">
		<view class="picker-content" @tap.stop>
			<view class="picker-header">
				<view class="picker-btn picker-cancel" @tap="onCancel">取消</view>
				<text class="picker-title">选择地区</text>
				<view class="picker-btn picker-confirm" @tap="onConfirm">确定</view>
			</view>
			<view class="picker-columns">
				<picker-view class="picker-view" :value="[col1Index, col2Index, col3Index]" @change="onPickerChange">
					<picker-view-column>
						<view class="column-item" v-for="(item, i) in catList" :key="i">{{ item.label }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="column-item" v-for="(item, i) in subList" :key="i">{{ item.label }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="column-item" v-for="(item, i) in groupList" :key="i">{{ item.label }}</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				col1Index: 0,
				col2Index: 0,
				col3Index: 0,
				regionData: [
					{
						label: '兵团',
						children: [
							{ label: '农一师', children: [{ label: '一团' }, { label: '二团' }, { label: '三团' }] },
							{ label: '农二师', children: [{ label: '一团' }, { label: '二团' }, { label: '三团' }] }
						]
					},
					{
						label: '地方',
						children: [
							{ label: '乌鲁木齐市', children: [{ label: '天山区' }, { label: '沙依巴克区' }] },
							{ label: '克拉玛依市', children: [{ label: '独山子区' }, { label: '克拉玛依区' }] }
						]
					}
				]
			}
		},
		computed: {
			catList() {
				return this.regionData
			},
			subList() {
				var cat = this.regionData[this.col1Index]
				return cat ? cat.children : []
			},
			groupList() {
				var sub = this.subList[this.col2Index]
				return sub ? sub.children : []
			}
		},
		methods: {
			onPickerChange(e) {
				var vals = e.detail.value
				this.col1Index = vals[0]
				this.col2Index = vals[1]
				this.col3Index = vals[2]
			},
			onConfirm() {
				var label = ''
				if (this.groupList[this.col3Index]) {
					label = this.groupList[this.col3Index].label
				} else if (this.subList[this.col2Index]) {
					label = this.subList[this.col2Index].label
				}
				this.$emit('confirm', label)
			},
			onCancel() {
				this.$emit('cancel')
			},
			onMaskTap() {
				this.$emit('cancel')
			}
		},
		watch: {
			visible(val) {
				if (val) {
					this.col1Index = 0
					this.col2Index = 0
					this.col3Index = 0
				}
			}
		}
	}
</script>

<style lang="scss">
	.region-picker {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.picker-content {
		background-color: #ffffff;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		overflow: hidden;
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.picker-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.picker-btn {
		font-size: 28rpx;
		padding: 8rpx 16rpx;
	}

	.picker-cancel {
		color: #999;
	}

	.picker-confirm {
		color: #3c9cff;
		font-weight: 500;
	}

	.picker-columns {
		height: 500rpx;
	}

	.picker-view {
		height: 100%;
	}

	.column-item {
		padding: 24rpx 20rpx;
		font-size: 26rpx;
		color: #666;
		text-align: center;
	}
</style>