import { BASE_URL, COS_BUCKET, COS_REGION, COS_BASE_URL, COS_SECRET_ID, COS_SECRET_KEY, getCosSignature } from './config.js'
import { userApi } from './request.js'

const MAX_SIZE_FACTORY = 1 * 1024 * 1024
const MAX_SIZE_SECOND = 500 * 1024



function checkImage(filePath) {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('user_token')
		const header = {
			'Content-Type': 'application/octet-stream'
		}
		if (token) {
			header['Token'] = token
		}
		uni.uploadFile({
			url: BASE_URL + '/farm/Wxuser/imgSecCheck',
			method: 'POST',
			filePath: filePath,
			name: 'file',
			header: header,
			formData: {
				media: filePath
			},
			success: (res) => {
				try {
					const json = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
					if (json.code === 200) {
						const result = json.data || {}
						if (result.errcode === 0 || result.errcode === undefined) {
							resolve(true)
						} else {
							reject(new Error(json.msg || '校验失败(code:' + json.code + ')'))
						}
					} else {
						reject(new Error(json.msg || '校验失败(code:' + json.code + ')'))
					}
				} catch (e) {
					reject(new Error('接口返回非JSON:' + (res.data || '').substring(0, 150)))
				}
			},
			fail: (err) => {
				reject(new Error((err && err.errMsg) || '网络请求失败'))
			}
		})
	})
}

export async function checkImageSafe(filePath, { showToast = true } = {}) {
	try {
		const ok = await checkImage(filePath)
		if (!ok) {
			if (showToast) {
				uni.showToast({ title: '图片违规不可用', icon: 'none' })
			}
			return false
		}
		return true
	} catch (e) {
		console.error('图片校验失败:', e)
		if (showToast) {
			uni.showToast({ title: '图片校验失败，请重试', icon: 'none' })
		}
		return false
	}
}

function checkText(msg) {
	return new Promise((resolve, reject) => {
		userApi.msgCheck(msg).then((result) => {
			const r = result || {}
			if (r.errcode === 0 || r.errcode === undefined) {
				resolve(true)
			} else {
				resolve(false)
			}
		}).catch((err) => {
			reject(new Error((err && err.msg) || '文字校验失败'))
		})
	})
}

export async function checkTextSafe(msg, { showToast = true } = {}) {
	try {
		const ok = await checkText(msg)
		if (!ok) {
			if (showToast) {
				uni.showToast({ title: '内容包含敏感信息', icon: 'none' })
			}
			return false
		}
		return true
	} catch (e) {
		console.error('文字校验失败:', e)
		if (showToast) {
			uni.showToast({ title: '校验异常:' + (e.message || '失败'), icon: 'none' })
		}
		return true
	}
}

function getImageInfo(filePath) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: filePath,
			success: resolve,
			fail: reject
		})
	})
}

function compressImage(filePath, maxSizeBytes) {
	return new Promise((resolve) => {
		uni.getFileInfo({
			filePath: filePath,
			success: (fileInfo) => {
				if (fileInfo.size <= maxSizeBytes) {
					resolve(filePath)
					return
				}
				doCompress(filePath, maxSizeBytes, resolve)
			},
			fail: () => {
				resolve(filePath)
			}
		})
	})
}

function doCompress(filePath, maxSizeBytes, resolve) {
	var quality = 80
	var tryCompress = function() {
		uni.compressImage({
			src: filePath,
			quality: quality,
			success: function(res) {
				uni.getFileInfo({
					filePath: res.tempFilePath,
					success: function(info) {
						if (info.size <= maxSizeBytes || quality <= 10) {
							resolve(res.tempFilePath)
						} else {
							quality -= 20
							tryCompress()
						}
					},
					fail: function() {
						resolve(res.tempFilePath)
					}
				})
			},
			fail: function() {
				canvasCompress(filePath, maxSizeBytes).then(resolve).catch(function() {
					resolve(filePath)
				})
			}
		})
	}
	tryCompress()
}

function canvasCompress(filePath, maxSizeBytes) {
	return new Promise((resolve, reject) => {
		getImageInfo(filePath).then(function(info) {
			var width = info.width
			var height = info.height
			var ratio = Math.sqrt(maxSizeBytes / (width * height * 4))
			var targetWidth = Math.floor(width * ratio)
			var targetHeight = Math.floor(height * ratio)
			if (targetWidth < 1) targetWidth = 1
			if (targetHeight < 1) targetHeight = 1
			var ctx = uni.createCanvasContext('compressCanvas')
			ctx.clearRect(0, 0, targetWidth, targetHeight)
			ctx.drawImage(filePath, 0, 0, targetWidth, targetHeight)
			ctx.draw(false, function() {
				setTimeout(function() {
					uni.canvasToTempFilePath({
						canvasId: 'compressCanvas',
						success: function(res) {
							resolve(res.tempFilePath)
						},
						fail: reject
					})
				}, 300)
			})
		}).catch(reject)
	})
}

function base64ToArrayBuffer(base64) {
	var binaryString
	try {
		if (typeof atob === 'function') {
			binaryString = atob(base64)
		} else {
			binaryString = base64DecodePolyfill(base64)
		}
	} catch (e) {
		throw new Error('base64解码失败:' + (e.message || '数据格式错误'))
	}
	var len = binaryString.length
	var bytes = new Uint8Array(len)
	for (var i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i)
	}
	var buf = bytes.buffer
	buf._uint8view = bytes
	return buf
}

function base64DecodePolyfill(base64) {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	var result = ''
	var i = 0
	while (i < base64.length) {
		var c1 = chars.indexOf(base64.charAt(i++))
		var c2 = chars.indexOf(base64.charAt(i++))
		var c3 = chars.indexOf(base64.charAt(i++))
		var c4 = chars.indexOf(base64.charAt(i++))
		var b1 = (c1 << 2) | (c2 >> 4)
		var b2 = ((c2 & 0x0F) << 4) | (c3 >> 2)
		var b3 = ((c3 & 0x03) << 6) | c4
		result += String.fromCharCode(b1)
		if (c3 !== -1 && base64.charAt(i - 2) !== '=') result += String.fromCharCode(b2)
		if (c4 !== -1 && base64.charAt(i - 1) !== '=') result += String.fromCharCode(b3)
	}
	return result
}

function getFileSystemManager() {
	// #ifdef MP-WEIXIN
	return wx.getFileSystemManager()
	// #endif
	// #ifdef H5
	return null
	// #endif
	// #ifndef MP-WEIXIN
	return uni.getFileSystemManager ? uni.getFileSystemManager() : null
	// #endif
}

function uploadToCOS(filePath, dir) {
	return new Promise((resolve, reject) => {
		var filename = Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg'
		var key = dir + '/' + filename
		var url = COS_BASE_URL + '/' + key
		var signature = getCosSignature(key, 'put')
		var host = COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'

		var fs = getFileSystemManager()
		if (!fs || !fs.readFile) {
			reject(new Error('当前环境不支持读取文件，无法上传到COS'))
			return
		}
		fs.readFile({
			filePath: filePath,
			encoding: 'base64',
			success: function(res) {
				var base64Str = res.data
				if (!base64Str || typeof base64Str !== 'string' || base64Str.length < 4) {
					reject(new Error('读取图片文件为空，请重新选择图片'))
					return
				}
				var binaryData
				try {
					binaryData = base64ToArrayBuffer(base64Str)
				} catch (e) {
					reject(e)
					return
				}
				if (!binaryData || (binaryData.byteLength != null && binaryData.byteLength === 0)) {
					reject(new Error('读取图片文件为空，请重新选择图片'))
					return
				}
				uni.request({
					url: url + '?' + signature,
					method: 'PUT',
					data: binaryData,
					header: {
						'Content-Type': 'image/jpeg',
						'Host': host
					},
					timeout: 60000,
					success: function(putRes) {
						if (putRes.statusCode === 200 || putRes.statusCode === 204) {
							uni.request({
								url: url,
								method: 'HEAD',
								timeout: 15000,
								success: function(headRes) {
									if (headRes.statusCode !== 404) {
										resolve({ url: url, key: key })
									} else {
										reject(new Error('上传未生效，请检查存储桶配置后重试'))
									}
								},
								fail: function(headErr) {
									reject(new Error('上传校验失败:' + ((headErr && headErr.errMsg) || '网络错误')))
								}
							})
						} else {
							console.error('COS upload failed:', putRes.statusCode, putRes.data)
							var errMsg = '上传失败(HTTP:' + putRes.statusCode + ')'
							if (putRes.data && typeof putRes.data === 'string') {
								try {
									var errJson = JSON.parse(putRes.data)
									if (errJson.Message || errJson.message) errMsg += ': ' + (errJson.Message || errJson.message)
								} catch (e) {
									if (putRes.data.length < 200) errMsg += ' ' + putRes.data
								}
							}
							reject(new Error(errMsg))
						}
					},
					fail: function(err) {
						console.error('COS upload failed:', err)
						reject(new Error(((err && err.errMsg) || '上传网络请求失败')))
					}
				})
			},
			fail: function(err) {
				console.error('Read file failed:', err)
				reject(new Error('读取图片失败:' + ((err && err.errMsg) || '文件无法访问')))
			}
		})
	})
}

export function isLocalTempPath(p) {
	if (!p || typeof p !== 'string') return false
	if (/^(wxfile:|file:|blob:|wxLocalResource:|data:)/i.test(p)) return true
	if (/^http:\/\/tmp\//i.test(p)) return true
	return false
}

export async function uploadImages(images, options = {}) {
	const maxSizeBytes = options.maxSize || MAX_SIZE_SECOND
	const dir = options.dir || 'second-house'
	const results = []

	for (let i = 0; i < images.length; i++) {
		const tempPath = images[i]
		try {
			if (!isLocalTempPath(tempPath)) {
				results.push(tempPath)
				continue
			}
			const compressedPath = await compressImage(tempPath, maxSizeBytes)
			const uploadResult = await uploadToCOS(compressedPath, dir)
			results.push(uploadResult.key || tempPath)
		} catch (e) {
			console.error('uploadImages 第', i + 1, '张处理失败:', e)
			throw e
		}
	}
	return results
}

export async function uploadFactoryLicense(tempPath, dir = 'license') {
	if (!isLocalTempPath(tempPath)) return tempPath
	const result = await compressImage(tempPath, MAX_SIZE_FACTORY)
	const uploadResult = await uploadToCOS(result, dir)
	return uploadResult.key || uploadResult.url
}

export async function uploadFactoryIdCard(tempPath) {
	if (!isLocalTempPath(tempPath)) return tempPath
	const result = await compressImage(tempPath, MAX_SIZE_FACTORY)
	const uploadResult = await uploadToCOS(result, 'id_card')
	return uploadResult.key || uploadResult.url
}

export async function uploadSecondImages(images) {
	return uploadImages(images, { maxSize: MAX_SIZE_SECOND, dir: 'second-house' })
}

export { compressImage, uploadToCOS, MAX_SIZE_FACTORY, MAX_SIZE_SECOND }

uni.checkImageSafe = checkImageSafe
uni.checkTextSafe = checkTextSafe
uni.uploadFactoryLicense = uploadFactoryLicense
uni.uploadFactoryIdCard = uploadFactoryIdCard
uni.uploadSecondImages = uploadSecondImages
uni.uploadImages = uploadImages