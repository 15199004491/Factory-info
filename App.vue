<script>
	import { isFromChatShareScene } from '@/utils/date.js'
	export default {
		globalData: {
			shareEnterFirstTime: false
		},
		onLaunch: function() {
			try {
				if (isFromChatShareScene()) {
					this.globalData.shareEnterFirstTime = true
				}
			} catch (e) {}
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
			try {
				if (isFromChatShareScene()) {
					this.globalData.shareEnterFirstTime = true
				}
			} catch (e) {}
		},
		onHide: function() {}
	}
</script>

<style>
</style>