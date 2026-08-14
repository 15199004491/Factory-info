let _loadingTimer = null
let _showLoading = uni.showLoading

uni.showLoading = function(options = {}) {
	if (_loadingTimer) {
		clearTimeout(_loadingTimer)
		_loadingTimer = null
	}
	const timeout = options.timeout || 3000
	_loadingTimer = setTimeout(() => {
		uni.hideLoading()
	}, timeout)
	return _showLoading.call(uni, options)
}

let _hideLoading = uni.hideLoading
uni.hideLoading = function() {
	if (_loadingTimer) {
		clearTimeout(_loadingTimer)
		_loadingTimer = null
	}
	return _hideLoading.call(uni)
}