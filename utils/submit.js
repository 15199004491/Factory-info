import { reactive, getCurrentInstance } from 'vue'

const STORE_KEY = '__submit_guard__'

function getCtx(instance) {
	if (!instance) return null
	const ctx = instance.proxy || instance.ctx || instance
	return ctx
}

export function submitWith(ctx, options) {
	if (!ctx) return Promise.reject(new Error('no context'))

	const {
		validate = null,
		request,
		loadingText = '提交中...',
		timeoutMs = 6000,
		successTitle = '操作成功',
		successCallback = null,
		failTitle = '提交失败',
		flagName = 'submitting'
	} = options || {}

	if (ctx[flagName]) return Promise.resolve(null)

	if (validate && typeof validate === 'function') {
		const valid = validate()
		if (valid === false) return Promise.resolve(null)
	}

	ctx[flagName] = true
	uni.showLoading({ title: loadingText, mask: true, timeout: Math.max(timeoutMs + 500, 10000) })

	let timer = null
	let finished = false
	const cleanup = () => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
		uni.hideLoading()
		setTimeout(() => {
			ctx[flagName] = false
		}, 300)
	}

	timer = setTimeout(() => {
		if (finished) return
		finished = true
		cleanup()
		uni.showToast({ title: '系统错误，请稍后重试', icon: 'none' })
	}, timeoutMs)

	return Promise.resolve()
		.then(() => typeof request === 'function' ? request() : request)
		.then((res) => {
			if (finished) return res
			finished = true
			cleanup()
			if (successTitle) {
				uni.showToast({ title: successTitle, icon: 'success' })
			}
			if (successCallback && typeof successCallback === 'function') {
				successCallback(res)
			}
			return res
		})
		.catch((err) => {
			if (finished) return
			finished = true
			cleanup()
			if (err && err.cancel) return
			uni.showToast({
				title: (err && (err.msg || err.message)) || failTitle,
				icon: 'none'
			})
			throw err
		})
}

export function useSubmit() {
	const state = reactive({ submitting: false })
	const instance = getCurrentInstance()
	const ctx = getCtx(instance)
	const submit = (options) => {
		if (ctx && ctx[STORE_KEY]) {
			ctx[STORE_KEY].submitting = true
		}
		const merged = Object.assign({ flagName: 'submitting' }, options)
		return submitWith(state, merged).finally(() => {
			if (ctx && ctx[STORE_KEY]) {
				ctx[STORE_KEY].submitting = state.submitting
			}
		})
	}
	if (ctx) {
		ctx[STORE_KEY] = state
	}
	return {
		submitting: state,
		submit
	}
}

export default {
	install(app) {
		const submitGuard = reactive({ submitting: false })
		app.config.globalProperties.$submit = function (options) {
			const merged = Object.assign({}, options)
			return submitWith(this || submitGuard, merged)
		}
		app.mixin({
			data() {
				return { submitting: false }
			}
		})
		app.provide('submitGuard', submitGuard)
	}
}