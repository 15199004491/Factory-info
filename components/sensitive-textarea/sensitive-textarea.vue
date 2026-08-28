<template>
	<view class="sensitive-textarea-wrap">
		<view class="textarea-box" :class="[inputClass, { 'textarea-box-error': hasError }]">
			<textarea
				class="sensitive-textarea"
				:class="{ 'sensitive-textarea-error': hasError }"
				:value="innerValue"
				:maxlength="maxlength"
				:placeholder="placeholder"
				:placeholder-class="placeholderClass"
				:adjust-position="adjustPosition"
				:cursor-spacing="cursorSpacing"
				:fixed="fixed"
				:auto-height="autoHeight"
				:show-confirm-bar="false"
				@input="onInput"
			></textarea>
			<view v-if="showCount" class="textarea-count-wrap">
				<text class="textarea-count">{{ (innerValue || '').length }}/{{ maxlength }}</text>
			</view>
		</view>
		<text v-if="hasError" class="sensitive-error">{{ errorMsg }}</text>
	</view>
</template>

<script>
	import { userApi } from '@/utils/request.js'

	export default {
		name: 'sensitive-textarea',
		model: {
			prop: 'value',
			event: 'input'
		},
		props: {
			value: {
				type: [String, Number],
				default: ''
			},
			maxlength: {
				type: Number,
				default: 200
			},
			placeholder: {
				type: String,
				default: ''
			},
			placeholderClass: {
				type: String,
				default: 'sensitive-placeholder'
			},
			adjustPosition: {
				type: Boolean,
				default: true
			},
			cursorSpacing: {
				type: Number,
				default: 120
			},
			fixed: {
				type: Boolean,
				default: false
			},
			showCount: {
				type: Boolean,
				default: true
			},
			autoHeight: {
				type: Boolean,
				default: false
			},
			inputClass: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				innerValue: '',
				hasError: false,
				errorMsg: '内容包含违规信息，请修改'
			}
		},
		watch: {
			value(newVal) {
				const v = newVal == null ? '' : String(newVal)
				if (v !== this.innerValue) {
					this.innerValue = v
				}
			}
		},
		created() {
			this.innerValue = this.value == null ? '' : String(this.value)
		},
		mounted() {
			this.$nextTick(() => {
				this.innerValue = this.value == null ? '' : String(this.value)
			})
		},
		methods: {
			onInput(e) {
				let val = e.detail.value
				if (this.maxlength && val.length > this.maxlength) {
					val = val.substring(0, this.maxlength)
				}
				this.innerValue = val
				this.$emit('input', val)
				if (this.hasError) {
					this.hasError = false
				}
			},
			async validate() {
				const val = this.innerValue
				if (!val || !val.trim()) {
					this.hasError = false
					this.errorMsg = ''
					return true
				}
				try {
					const result = await userApi.msgCheck(val)
					if (result && result.errcode === 0) {
						this.hasError = false
						this.errorMsg = ''
						return true
					} else {
						this.hasError = true
						this.errorMsg = '内容包含违规信息，请修改'
						return false
					}
				} catch (e) {
					this.hasError = true
					this.errorMsg = '内容包含违规信息，请修改'
					return false
				}
			},
			clearError() {
				this.hasError = false
				this.errorMsg = ''
			}
		}
	}
</script>

<style lang="scss" scoped>
	.sensitive-textarea-wrap {
		width: 100%;
	}

	.textarea-box {
		width: 100%;
		position: relative;
		box-sizing: border-box;
	}

	.textarea-box-error {
		border-color: #ff4d4f !important;
		background-color: #fff5f5 !important;
	}

	.sensitive-textarea {
		width: 100%;
		min-height: 100%;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		background: transparent;
		border: none;
		padding: 0;
		box-sizing: border-box;
	}

	.sensitive-textarea-error {
		color: #ff4d4f;
	}

	.sensitive-error {
		display: block;
		font-size: 22rpx;
		color: #ff4d4f;
		margin-top: 8rpx;
		line-height: 1.4;
		padding: 0 4rpx;
	}

	.textarea-count-wrap {
		position: absolute;
		right: 12rpx;
		bottom: 8rpx;
	}

	.textarea-count {
		font-size: 22rpx;
		color: #999;
		line-height: 1;
	}

	.sensitive-placeholder {
		color: #999;
	}
</style>