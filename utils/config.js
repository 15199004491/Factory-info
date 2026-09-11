// 'http://124.221.110.37/public/admin.php' http://localhost/public/admin.php 
// https://housefactory.cn/public/admin.php
const BASE_URL = 'https://housefactory.cn/public/admin.php'

const COS_BUCKET = 'house-factory-1468042561'
const COS_REGION = 'ap-shanghai'
const COS_BASE_URL = 'https://' + COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'
const COS_SECRET_ID = 'AKIDayqVzFG4f1A4mMhx0oNhlaAWyDDyXrxp'
const COS_SECRET_KEY = 'YsxrSq01y7FNSSRJ5kLqHfu2zkRyVpwq'

function utf8Encode(str) {
	var out = [], p = 0
	for (var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i)
		if (c < 0x80) {
			out[p++] = c
		} else if (c < 0x800) {
			out[p++] = 0xc0 | (c >> 6)
			out[p++] = 0x80 | (c & 0x3f)
		} else if (c < 0xd800 || c >= 0xe000) {
			out[p++] = 0xe0 | (c >> 12)
			out[p++] = 0x80 | ((c >> 6) & 0x3f)
			out[p++] = 0x80 | (c & 0x3f)
		} else {
			i++
			var c2 = str.charCodeAt(i)
			var cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff))
			out[p++] = 0xf0 | (cp >> 18)
			out[p++] = 0x80 | ((cp >> 12) & 0x3f)
			out[p++] = 0x80 | ((cp >> 6) & 0x3f)
			out[p++] = 0x80 | (cp & 0x3f)
		}
	}
	return out
}

function toHex32(num) {
	var hex = ''
	for (var s = 28; s >= 0; s -= 4) {
		hex += ((num >>> s) & 0x0f).toString(16)
	}
	return hex
}

function sha1Bytes(bytes) {
	var len = bytes.length
	var bitLenHi = Math.floor(len / 0x20000000)
	var bitLenLo = (len * 8) | 0
	var blkLen = Math.ceil((len + 9) / 64) * 16
	var blks = new Array(blkLen)
	for (var i = 0; i < blkLen; i++) blks[i] = 0
	for (i = 0; i < len; i++) {
		blks[i >> 2] |= (bytes[i] & 0xff) << (24 - ((i & 3) << 3))
	}
	blks[i >> 2] |= 0x80 << (24 - ((i & 3) << 3))
	blks[blkLen - 2] = bitLenHi
	blks[blkLen - 1] = bitLenLo

	var h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0
	var w = new Array(80)

	for (var blkStart = 0; blkStart < blkLen; blkStart += 16) {
		for (var t = 0; t < 16; t++) w[t] = blks[blkStart + t] | 0
		for (t = 16; t < 80; t++) {
			var xw = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]
			w[t] = ((xw << 1) | (xw >>> 31)) | 0
		}
		var a = h0, b = h1, c = h2, d = h3, e = h4
		var f, k, tmp
		for (t = 0; t < 20; t++) {
			f = (b & c) | ((~b) & d)
			k = 0x5a827999
			tmp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0
			e = d; d = c; c = ((b << 30) | (b >>> 2)) | 0; b = a; a = tmp
		}
		for (t = 20; t < 40; t++) {
			f = b ^ c ^ d
			k = 0x6ed9eba1
			tmp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0
			e = d; d = c; c = ((b << 30) | (b >>> 2)) | 0; b = a; a = tmp
		}
		for (t = 40; t < 60; t++) {
			f = (b & c) | (b & d) | (c & d)
			k = 0x8f1bbcdc
			tmp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0
			e = d; d = c; c = ((b << 30) | (b >>> 2)) | 0; b = a; a = tmp
		}
		for (t = 60; t < 80; t++) {
			f = b ^ c ^ d
			k = 0xca62c1d6
			tmp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0
			e = d; d = c; c = ((b << 30) | (b >>> 2)) | 0; b = a; a = tmp
		}
		h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0
	}
	return toHex32(h0) + toHex32(h1) + toHex32(h2) + toHex32(h3) + toHex32(h4)
}

function sha1(str) {
	return sha1Bytes(utf8Encode(str))
}

function hexToBytes(hexStr) {
	var out = []
	for (var i = 0; i < hexStr.length; i += 2) {
		out.push(parseInt(hexStr.substr(i, 2), 16))
	}
	return out
}

function hmacSha1(keyStr, dataStr) {
	var keyBytes = utf8Encode(keyStr)
	if (keyBytes.length > 64) {
		keyBytes = hexToBytes(sha1Bytes(keyBytes))
	}
	while (keyBytes.length < 64) keyBytes.push(0)
	var iKeyPad = new Array(64)
	var oKeyPad = new Array(64)
	for (var i = 0; i < 64; i++) {
		iKeyPad[i] = keyBytes[i] ^ 0x36
		oKeyPad[i] = keyBytes[i] ^ 0x5c
	}
	var dataBytes = utf8Encode(dataStr)
	var innerMsg = iKeyPad.concat(dataBytes)
	var innerDigest = sha1Bytes(innerMsg)
	var innerBytes = hexToBytes(innerDigest)
	var outerMsg = oKeyPad.concat(innerBytes)
	return sha1Bytes(outerMsg)
}

function getCosSignature(key, method, expireSeconds) {
	method = (method || 'get').toLowerCase()
	var expire = expireSeconds || (7 * 24 * 3600)
	var now = Math.floor(Date.now() / 1000)
	var keyTime = now + ';' + (now + expire)
	var uriPath = '/' + String(key || '').replace(/^\/+/, '')
	var hostHeader = COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'

	var httpString = method + '\n' + uriPath + '\n\n' + 'host=' + hostHeader + '\n'
	var httpStringSha1 = sha1(httpString)
	var stringToSign = 'sha1\n' + keyTime + '\n' + httpStringSha1 + '\n'

	var signKey = hmacSha1(COS_SECRET_KEY, keyTime)
	var signature = hmacSha1(signKey, stringToSign)

	return 'q-sign-algorithm=sha1'
		+ '&q-ak=' + COS_SECRET_ID
		+ '&q-sign-time=' + keyTime
		+ '&q-key-time=' + keyTime
		+ '&q-header-list=host'
		+ '&q-url-param-list='
		+ '&q-signature=' + signature
}

function cosKeyFromUrl(url) {
	if (!url || typeof url !== 'string') return ''
	if (/^https?:\/\//i.test(url)) {
		var match = url.replace(/^https?:\/\/[^/]+\/?/, '')
		return match
	}
	return url.replace(/^\/+/, '')
}

const USE_COS_SIGNED_URL = true

function formatCosUrl(src, opts) {
	if (!src) return ''
	if (typeof src !== 'string') return ''
	var s = src
	if (/^(wxfile:|file:|blob:|wxLocalResource:|data:)/i.test(s)) return s
	if (/^https?:\/\//i.test(s)) return s
	var signed = (opts && opts.signed != null) ? opts.signed : USE_COS_SIGNED_URL
	var key = cosKeyFromUrl(src)
	if (!key) return ''
	var base = COS_BASE_URL + '/' + key
	if (signed) {
		var expire = (opts && opts.expire) || (7 * 24 * 3600)
		var sig = getCosSignature(key, 'get', expire)
		return base + (base.indexOf('?') >= 0 ? '&' : '?') + sig
	}
	return base
}

export {
	BASE_URL,
	COS_BUCKET,
	COS_REGION,
	COS_BASE_URL,
	COS_SECRET_ID,
	COS_SECRET_KEY,
	getCosSignature,
	formatCosUrl
}

export default {
	BASE_URL,
	COS_BUCKET,
	COS_REGION,
	COS_BASE_URL,
	COS_SECRET_ID,
	COS_SECRET_KEY,
	getCosSignature,
	formatCosUrl
}