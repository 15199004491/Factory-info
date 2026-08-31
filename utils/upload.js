import { BASE_URL, COS_BUCKET, COS_REGION, COS_BASE_URL, COS_SECRET_ID, COS_SECRET_KEY, getCosSignature } from './config.js'
import { userApi } from './request.js'

const MAX_SIZE_LICENSE = 100 * 1024
const MAX_SIZE_IDCARD = 80 * 1024
const MAX_SIZE_SECOND = 80 * 1024



function checkImage(filePath) {
	return new Promise((resolve) => {
		const token = uni.getStorageSync('user_token')
		const header = {
			'Content-Type': 'application/octet-stream'
		}
		if (token) {
			header['Token'] = token
		}
		var finished = false
		var safeDone = function(pass, msg) {
			if (!finished) {
				finished = true
				resolve({ pass: !!pass, msg: msg || '' })
			}
		}
		var timer = setTimeout(function() {
			safeDone(true, '校验超时，跳过')
		}, 15000)
		try {
			uni.uploadFile({
				url: BASE_URL + '/farm/Wxuser/imgSecCheck',
				method: 'POST',
				filePath: filePath,
				name: 'file',
				header: header,
				formData: {
					media: filePath
				},
				timeout: 15000,
				success: (res) => {
					try {
						clearTimeout(timer)
						const json = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
						if (json && json.code === 200) {
							const result = json.data || {}
							if (result.errcode === 0 || result.errcode === undefined) {
								safeDone(true)
							} else {
								safeDone(false, json.msg || '图片内容违规')
							}
						} else {
							safeDone(true, (json && json.msg) ? json.msg : '校验接口异常，跳过')
						}
					} catch (e) {
						safeDone(true, '接口返回异常，跳过')
					}
				},
				fail: (err) => {
					clearTimeout(timer)
					safeDone(true, ((err && err.errMsg) || '网络异常') + '，跳过')
				}
			})
		} catch (e) {
			clearTimeout(timer)
			safeDone(true, '校验异常，跳过')
		}
	})
}

export async function checkImageSafe(filePath, { showToast = true } = {}) {
	try {
		const result = await checkImage(filePath)
		if (result && !result.pass) {
			if (showToast) {
				uni.showToast({ title: result.msg || '图片违规不可用', icon: 'none' })
			}
			return false
		}
		return true
	} catch (e) {
		console.error('图片校验异常:', e)
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
		var resolved = false
		var safeResolve = function(p) {
			if (!resolved) {
				resolved = true
				resolve(p)
			}
		}
		setTimeout(function() { safeResolve(filePath) }, 45000)
		try {
			uni.getFileInfo({
				filePath: filePath,
				success: (fileInfo) => {
					if (fileInfo.size <= maxSizeBytes) {
						safeResolve(filePath)
						return
					}
					doCompress(filePath, maxSizeBytes, safeResolve)
				},
				fail: () => {
					safeResolve(filePath)
				}
			})
		} catch (e) {
			safeResolve(filePath)
		}
	})
}

function doCompress(filePath, maxSizeBytes, safeResolve) {
	var quality = 80
	var currentPath = filePath
	var smallestPath = filePath
	var smallestSize = Infinity
	var tryCompress = function() {
		try {
			uni.compressImage({
				src: currentPath,
				quality: quality,
				success: function(res) {
					try {
						uni.getFileInfo({
							filePath: res.tempFilePath,
							success: function(info) {
								if (info.size < smallestSize) {
									smallestSize = info.size
									smallestPath = res.tempFilePath
								}
								if (info.size <= maxSizeBytes) {
									safeResolve(res.tempFilePath)
									return
								}
								if (quality >= 50) {
									quality -= 20
									currentPath = res.tempFilePath
									tryCompress()
								} else if (quality >= 20) {
									quality -= 10
									currentPath = res.tempFilePath
									tryCompress()
								} else if (quality >= 5) {
									quality -= 3
									currentPath = res.tempFilePath
									tryCompress()
								} else if (quality >= 2) {
									quality -= 1
									currentPath = res.tempFilePath
									tryCompress()
								} else {
									canvasCompress(smallestPath, maxSizeBytes).then(function(p) {
										safeResolve(p)
									}).catch(function() {
										safeResolve(smallestPath)
									})
								}
							},
							fail: function() {
								safeResolve(res.tempFilePath || smallestPath)
							}
						})
					} catch (e) {
						safeResolve(res.tempFilePath || smallestPath)
					}
				},
				fail: function() {
					canvasCompress(currentPath, maxSizeBytes).then(function(p) {
						safeResolve(p)
					}).catch(function() {
						safeResolve(smallestPath)
					})
				}
			})
		} catch (e) {
			safeResolve(smallestPath)
		}
	}
	tryCompress()
}

function canvasCompress(filePath, maxSizeBytes) {
	return new Promise((resolve, reject) => {
		var resolved = false
		var safeResolve = function(p) {
			if (!resolved) {
				resolved = true
				resolve(p)
			}
		}
		setTimeout(function() { safeResolve(filePath) }, 30000)
		var doCanvas = function(currentPath, tryCount) {
			tryCount = tryCount || 0
			if (tryCount >= 6) { safeResolve(currentPath); return }
			try {
				getImageInfo(currentPath).then(function(info) {
					try {
						var width = info.width
						var height = info.height
						var ratio = 0.65
						if (tryCount === 0) {
							var rawPixel = width * height
							var approxTargetPixel = (maxSizeBytes / 300) * 10000
							if (rawPixel > 0 && approxTargetPixel > 0) {
								ratio = Math.sqrt(approxTargetPixel / rawPixel)
								if (ratio > 0.8) ratio = 0.8
								if (ratio < 0.2) ratio = 0.2
							}
						}
						var targetWidth = Math.max(60, Math.floor(width * ratio))
						var targetHeight = Math.max(60, Math.floor(height * ratio))
						var ctx = uni.createCanvasContext('compressCanvas')
						if (!ctx) { safeResolve(currentPath); return }
						ctx.setFillStyle && ctx.setFillStyle('#ffffff')
						ctx.fillRect && ctx.fillRect(0, 0, targetWidth, targetHeight)
						ctx.clearRect(0, 0, targetWidth, targetHeight)
						ctx.drawImage(currentPath, 0, 0, targetWidth, targetHeight)
						ctx.draw(false, function() {
							setTimeout(function() {
								try {
									uni.canvasToTempFilePath({
										canvasId: 'compressCanvas',
										x: 0,
										y: 0,
										width: targetWidth,
										height: targetHeight,
										destWidth: targetWidth,
										destHeight: targetHeight,
										quality: 0.55,
										fileType: 'jpg',
										success: function(res) {
											try {
												uni.getFileInfo({
													filePath: res.tempFilePath,
													success: function(fileInfo) {
														if (fileInfo.size <= maxSizeBytes || targetWidth <= 120) {
															safeResolve(res.tempFilePath)
														} else {
															doCanvas(res.tempFilePath, tryCount + 1)
														}
													},
													fail: function() {
														safeResolve(res.tempFilePath)
													}
												})
											} catch (e) {
												safeResolve(res.tempFilePath)
											}
										},
										fail: function() {
											safeResolve(currentPath)
										}
									})
								} catch (e) {
									safeResolve(currentPath)
								}
							}, 350)
						})
					} catch (e) {
						safeResolve(currentPath)
					}
				}).catch(function() {
					safeResolve(currentPath)
				})
			} catch (e) {
				safeResolve(currentPath)
			}
		}
		doCanvas(filePath, 0)
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
		var done = false
		var timer = setTimeout(function() {
			if (!done) {
				done = true
				reject(new Error('上传COS超时，请重试'))
			}
		}, 80000)
		var safeResolve = function(r) {
			if (!done) {
				done = true
				clearTimeout(timer)
				resolve(r)
			}
		}
		var safeReject = function(err) {
			if (!done) {
				done = true
				clearTimeout(timer)
				reject(err)
			}
		}
		try {
			var filename = Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg'
			var key = dir + '/' + filename
			var url = COS_BASE_URL + '/' + key
			var signature = getCosSignature(key, 'put')
			var host = COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'

			var fs = getFileSystemManager()
			if (!fs || !fs.readFile) {
				safeReject(new Error('当前环境不支持读取文件，无法上传到COS'))
				return
			}
			fs.readFile({
				filePath: filePath,
				encoding: 'base64',
				success: function(res) {
					try {
						var base64Str = res.data
						if (!base64Str || typeof base64Str !== 'string' || base64Str.length < 4) {
							safeReject(new Error('读取图片文件为空，请重新选择图片'))
							return
						}
						var binaryData
						try {
							binaryData = base64ToArrayBuffer(base64Str)
						} catch (e) {
							safeReject(e)
							return
						}
						if (!binaryData || (binaryData.byteLength != null && binaryData.byteLength === 0)) {
							safeReject(new Error('读取图片文件为空，请重新选择图片'))
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
									safeResolve({ url: url, key: key })
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
									safeReject(new Error(errMsg))
								}
							},
							fail: function(err) {
								console.error('COS upload failed:', err)
								safeReject(new Error(((err && err.errMsg) || '上传网络请求失败')))
							}
						})
					} catch (e) {
						safeReject(e)
					}
				},
				fail: function(err) {
					console.error('Read file failed:', err)
					safeReject(new Error('读取图片失败:' + ((err && err.errMsg) || '文件无法访问')))
				}
			})
		} catch (e) {
			safeReject(e)
		}
	})
}

export function isLocalTempPath(p) {
	if (!p || typeof p !== 'string') return false
	if (/^(wxfile:|file:|blob:|wxLocalResource:|data:|base64:)/i.test(p)) return true
	if (/^https?:\/\/tmp\//i.test(p)) return true
	if (/^https?:\/\//i.test(p)) return false
	if (/^[a-z0-9_\-]+\/[a-z0-9_\-]+\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(p)) return false
	return true
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
	const result = await compressImage(tempPath, MAX_SIZE_LICENSE)
	const uploadResult = await uploadToCOS(result, dir)
	return uploadResult.key || uploadResult.url
}

export async function uploadFactoryIdCard(tempPath) {
	if (!isLocalTempPath(tempPath)) return tempPath
	const result = await compressImage(tempPath, MAX_SIZE_IDCARD)
	const uploadResult = await uploadToCOS(result, 'id_card')
	return uploadResult.key || uploadResult.url
}

export async function uploadSecondImages(images) {
	return uploadImages(images, { maxSize: MAX_SIZE_SECOND, dir: 'second-house' })
}

export { compressImage, uploadToCOS, MAX_SIZE_LICENSE, MAX_SIZE_IDCARD, MAX_SIZE_SECOND }

uni.checkImageSafe = checkImageSafe
uni.checkTextSafe = checkTextSafe
uni.uploadFactoryLicense = uploadFactoryLicense
uni.uploadFactoryIdCard = uploadFactoryIdCard
uni.uploadSecondImages = uploadSecondImages
uni.uploadImages = uploadImages