<template>
	<view class="sensitive-input-wrap" :class="{ 'has-error': hasError }">
		<input
			class="sensitive-input"
			:class="{ 'sensitive-input-error': hasError }"
			:value="innerValue"
			:maxlength="maxlength"
			:type="type"
			:placeholder="placeholder"
			:placeholder-class="placeholderClass"
			@input="onInput"
		/>
		<text v-if="hasError" class="sensitive-error">{{ errorMsg }}</text>
	</view>
</template>

<script>
	import { userApi } from '@/utils/request.js'

	export default {
		name: 'sensitive-input',
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
				default: 100
			},
			type: {
				type: String,
				default: 'text'
			},
			placeholder: {
				type: String,
				default: ''
			},
			placeholderClass: {
				type: String,
				default: 'sensitive-placeholder'
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
	.sensitive-input-wrap {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		border: 2rpx solid #f0f0f0;
		border-radius: 8rpx;
		padding: 0 20rpx;
	}

	.sensitive-input-wrap.has-error {
		border-color: #ff4d4f;
	}

	.sensitive-input {
		width: 100%;
		height: 100%;
		font-size: 28rpx;
		color: #333;
		background: transparent;
		border: none;
		padding: 0;
		box-sizing: border-box;
	}

	.sensitive-input-error {
		color: #ff4d4f;
	}

	.sensitive-error {
		display: block;
		font-size: 22rpx;
		color: #ff4d4f;
		margin-top: 8rpx;
		line-height: 1.4;
	}

	.sensitive-placeholder {
		color: #999;
	}
</style>