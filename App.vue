<script>
	import { isFromChatShareScene } from '@/utils/date.js'
	import { setupUpdateManager } from '@/utils/updateManager.js'
	import { visitorApi } from '@/utils/request.js'
	import { auth } from '@/utils/auth.js'

	function _getEnterOptions() {
		try {
			if (typeof uni.getEnterOptionsSync === 'function') {
				return uni.getEnterOptionsSync()
			}
		} catch (e) {}
		try {
			return uni.getLaunchOptionsSync()
		} catch (e) {
			return { scene: 0, path: '' }
		}
	}

	export default {
		globalData: {
			shareEnterFirstTime: false
		},
		onLaunch: function() {
			setupUpdateManager()
			auth.login({ silent: true }).catch(() => {})
			// #ifdef MP-WEIXIN
			uni.loadFontFace({
				global: true,
				family: 'uicon-iconfont',
				source: 'url("https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf")',
				success() {},
				fail(err) {}
			})
			// #endif
		},
		onShow: function() {
			visitorApi.getCount()
			try {
				if (isFromChatShareScene()) {
					const opt = _getEnterOptions()
					const path = (opt && opt.path) ? String(opt.path) : ''
					const detailPagePatterns = [
						'pages/second/detail',
						'pages/rent/detail',
						'pages/purchase/detail',
						'pages/factory/detail'
					]
					const isDetailPage = detailPagePatterns.some(p => path.indexOf(p) !== -1)
					if (isDetailPage) {
						this.globalData.shareEnterFirstTime = true
					}
				}
			} catch (e) {}
		}
	}
</script>

<style>
</style>