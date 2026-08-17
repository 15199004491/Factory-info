const COS_BUCKET = 'house-factory-1468042561'
const COS_REGION = 'ap-shanghai'
const COS_BASE_URL = 'https://' + COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'

const COS_SECRET_ID = 'AKIDayqVzFG4f1A4mMhx0oNhlaAWyDDyXrxp'
const COS_SECRET_KEY = 'YsxrSq01y7FNSSRJ5kLqHfu2zkRyVpwq'

import { BASE_URL } from './config.js'
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
		wx.uploadFile({
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
							resolve(false)
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
				uni.showToast({ title: '图片包含违规内容', icon: 'none' })
			}
			return false
		}
		return true
	} catch (e) {
		console.error('图片校验失败:', e)
		if (showToast) {
			uni.showToast({ title: '校验异常:' + (e.message || '失败'), icon: 'none' })
		}
		return true
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

function safeAdd(x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF)
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
	return (msw << 16) | (lsw & 0xFFFF)
}

function bitRol(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt))
}

function sha1Core(block, len) {
	block[len >> 5] |= 0x80 << (24 - len % 32)
	block[((len + 64 >> 9) << 4) + 15] = len

	var w = new Array(80)
	var a = 1732584193
	var b = -271733879
	var c = -1732584194
	var d = 271733878
	var e = -1009589776

	for (var i = 0; i < block.length; i += 16) {
		var olda = a
		var oldb = b
		var oldc = c
		var oldd = d
		var olde = e

		for (var j = 0; j < 80; j++) {
			if (j < 16) w[j] = block[i + j]
			else w[j] = bitRol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1)

			var t = safeAdd(safeAdd(bitRol(a, 5),
				(j < 20 ? (b & c | (~b) & d) :
				 j < 40 ? (b ^ c ^ d) :
				 j < 60 ? (b & c | b & d | c & d) :
				 (b ^ c ^ d))),
				safeAdd(safeAdd(e, w[j]),
					j < 20 ? 1518500249 :
					j < 40 ? 1859775393 :
					j < 60 ? -1894007588 :
					-899497514))

			e = d
			d = c
			c = bitRol(b, 30)
			b = a
			a = t
		}

		a = safeAdd(a, olda)
		b = safeAdd(b, oldb)
		c = safeAdd(c, oldc)
		d = safeAdd(d, oldd)
		e = safeAdd(e, olde)
	}
	return [a, b, c, d, e]
}

function strToBlks(str) {
	var nblk = ((str.length + 8) >> 6) + 1
	var blks = new Array(nblk * 16)
	for (var i = 0; i < nblk * 16; i++) blks[i] = 0
	for (var i = 0; i < str.length; i++) {
		blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8)
	}
	blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8)
	blks[nblk * 16 - 1] = str.length * 8
	return blks
}

function bytesToBlks(bytes) {
	var len = bytes.length
	var nblk = ((len + 8) >> 6) + 1
	var blks = new Array(nblk * 16)
	for (var i = 0; i < nblk * 16; i++) blks[i] = 0
	for (var i = 0; i < len; i++) {
		blks[i >> 2] |= bytes[i] << (24 - (i % 4) * 8)
	}
	blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8)
	blks[nblk * 16 - 1] = len * 8
	return blks
}

function sha1Bytes(bytes) {
	return sha1Core(bytesToBlks(bytes), bytes.length * 8)
}

function sha1(s) {
	return hexArr(sha1Core(strToBlks(s), s.length * 8))
}

function hexArr(binarray) {
	var str = ''
	for (var i = 0; i < binarray.length * 4; i++) {
		str += ((binarray[i >> 2] >> (24 - i % 4 * 8)) & 0xFF).toString(16).padStart(2, '0')
	}
	return str
}

function strToBytes(str) {
	var bytes = []
	for (var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i)
		if (c < 0x80) {
			bytes.push(c)
		} else if (c < 0x800) {
			bytes.push(0xC0 | (c >> 6))
			bytes.push(0x80 | (c & 0x3F))
		} else {
			bytes.push(0xE0 | (c >> 12))
			bytes.push(0x80 | ((c >> 6) & 0x3F))
			bytes.push(0x80 | (c & 0x3F))
		}
	}
	return bytes
}

function hmacSha1(keyStr, dataStr) {
	var key = strToBytes(keyStr)
	var data = strToBytes(dataStr)

	if (key.length > 64) {
		var kh = sha1Core(bytesToBlks(key), key.length * 8)
		key = new Array(20)
		for (var i = 0; i < 5; i++) {
			key[i*4] = (kh[i] >> 24) & 0xFF
			key[i*4+1] = (kh[i] >> 16) & 0xFF
			key[i*4+2] = (kh[i] >> 8) & 0xFF
			key[i*4+3] = kh[i] & 0xFF
		}
	}
	while (key.length < 64) key.push(0)

	var o_key_pad = new Array(64)
	var i_key_pad = new Array(64)
	for (var i = 0; i < 64; i++) {
		o_key_pad[i] = key[i] ^ 0x5c
		i_key_pad[i] = key[i] ^ 0x36
	}

	var innerData = i_key_pad.concat(data)
	var inner = sha1Bytes(innerData)
	var innerBytes = new Array(20)
	for (var i = 0; i < 5; i++) {
		innerBytes[i*4] = (inner[i] >> 24) & 0xFF
		innerBytes[i*4+1] = (inner[i] >> 16) & 0xFF
		innerBytes[i*4+2] = (inner[i] >> 8) & 0xFF
		innerBytes[i*4+3] = inner[i] & 0xFF
	}

	var outerData = o_key_pad.concat(innerBytes)
	var outer = sha1Bytes(outerData)
	return hexArr(outer)
}

function getCosSignature(key, method) {
	var now = Math.floor(Date.now() / 1000)
	var expireSeconds = 300
	var signTime = now + ';' + (now + expireSeconds)
	var keyTime = signTime

	var httpString = method.toLowerCase() + '\n/' + key + '\n\nhost=' + COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com\n'
	var httpStringSha1 = sha1(httpString)

	var stringToSign = 'sha1\n' + signTime + '\n' + httpStringSha1 + '\n'

	var signKeyHex = hmacSha1(COS_SECRET_KEY, keyTime)
	var signature = hmacSha1(signKeyHex, stringToSign)

	return 'q-sign-algorithm=sha1'
		+ '&q-ak=' + COS_SECRET_ID
		+ '&q-sign-time=' + signTime
		+ '&q-key-time=' + keyTime
		+ '&q-header-list=host'
		+ '&q-url-param-list='
		+ '&q-signature=' + signature
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

function uploadToCOS(filePath, dir) {
	return new Promise((resolve, reject) => {
		var filename = Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg'
		var key = dir + '/' + filename
		var url = COS_BASE_URL + '/' + key
		var signature = getCosSignature(key, 'put')
		var host = COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'

		var fs = wx.getFileSystemManager()
		fs.readFile({
			filePath: filePath,
			success: function(res) {
				uni.request({
					url: url + '?' + signature,
					method: 'PUT',
					data: res.data,
					header: {
						'Content-Type': 'image/jpeg',
						'Host': host
					},
					timeout: 60000,
					success: function(res) {
						if (res.statusCode === 200 || res.statusCode === 204) {
							var fileUrl = COS_BASE_URL + '/' + key
							resolve({ url: fileUrl, key: key })
						} else {
							console.error('COS upload failed:', res.statusCode, res.data)
							reject(new Error('上传失败，HTTP状态码: ' + res.statusCode))
						}
					},
					fail: function(err) {
						console.error('COS upload failed:', err)
						reject(err)
					}
				})
			},
			fail: function(err) {
				console.error('Read file failed:', err)
				reject(err)
			}
		})
	})
}

export async function uploadImages(images, options = {}) {
	const maxSizeBytes = options.maxSize || MAX_SIZE_SECOND
	const dir = options.dir || 'second-house'
	console.log('上传图片到目录:', dir)
	const results = []

	for (let i = 0; i < images.length; i++) {
		const tempPath = images[i]
		try {
			const compressedPath = await compressImage(tempPath, maxSizeBytes)
			const uploadResult = await uploadToCOS(compressedPath, dir)
			results.push(uploadResult.url)
		} catch (e) {
			console.error('图片上传失败:', e)
			throw e
		}
	}
	return results
}

export async function uploadFactoryLicense(tempPath) {
	const result = await compressImage(tempPath, MAX_SIZE_FACTORY)
	const uploadResult = await uploadToCOS(result, 'factory')
	return uploadResult.url
}

export async function uploadSecondImages(images) {
	return uploadImages(images, { maxSize: MAX_SIZE_SECOND, dir: 'second-house' })
}

export { compressImage, uploadToCOS, MAX_SIZE_FACTORY, MAX_SIZE_SECOND }

uni.checkImageSafe = checkImageSafe
uni.checkTextSafe = checkTextSafe
uni.uploadFactoryLicense = uploadFactoryLicense
uni.uploadSecondImages = uploadSecondImages
uni.uploadImages = uploadImages