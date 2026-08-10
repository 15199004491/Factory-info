<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// #ifdef MP-WEIXIN
			uni.loadFontFace({
				global: true,
				family: 'uicon-iconfont',
				source: 'url("https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf")',
				success() {
					console.log('uview-plus 字体加载成功')
				},
				fail(err) {
					console.log('uview-plus 字体加载失败', err)
				}
			})
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
</style>