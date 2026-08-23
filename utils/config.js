const BASE_URL = 'http://localhost/public/admin.php'

const COS_BUCKET = 'house-factory-1468042561'
const COS_REGION = 'ap-shanghai'
const COS_BASE_URL = 'https://' + COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com'
const COS_SECRET_ID = 'AKIDayqVzFG4f1A4mMhx0oNhlaAWyDDyXrxp'
const COS_SECRET_KEY = 'YsxrSq01y7FNSSRJ5kLqHfu2zkRyVpwq'

function sha1Core(block, len) {
	var w = []
	var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776
	for (var i = 0; i < block.length; i++) {
		w[i] = block[i]
	}
	for (; i < 80; i++) {
		var n = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]
		w[i] = (n << 1) | (n >>> 31)
	}
	for (var j = 0; j < 80; j += 5) {
		var t = (((a << 5) | (a >>> 27)) + e + w[j] + 1518500249 + ((b & c) | ((~b) & d))) << 0
		e = d; d = c; c = ((b << 30) | (b >>> 2)) << 0; b = a; a = t
		t = (((a << 5) | (a >>> 27)) + e + w[j + 1] + 1859775393 + (b ^ c ^ d)) << 0
		e = d; d = c; c = ((b << 30) | (b >>> 2)) << 0; b = a; a = t
		t = (((a << 5) | (a >>> 27)) + e + w[j + 2] + -1894007588 + ((b & c) | (b & d) | (c & d))) << 0
		e = d; d = c; c = ((b << 30) | (b >>> 2)) << 0; b = a; a = t
		t = (((a << 5) | (a >>> 27)) + e + w[j + 3] + -899497514 + (b ^ c ^ d)) << 0
		e = d; d = c; c = ((b << 30) | (b >>> 2)) << 0; b = a; a = t
		t = (((a << 5) | (a >>> 27)) + e + w[j + 4] + 660828471 + ((b & c) | ((~b) & d))) << 0
		e = d; d = c; c = ((b << 30) | (b >>> 2)) << 0; b = a; a = t
	}
	a += 1732584193; b += -271733879; c += -1732584194; d += 271733878; e += -1009589776
	var blks = [len, 0, a, b, c, d, e]
	return blks
}
function bytesToBlks(bytes) {
	var len = bytes.length
	var blkLen = Math.ceil((len + 9) / 64) * 16
	var blks = new Array(blkLen)
	for (var i = 0; i < blkLen; i++) blks[i] = 0
	for (i = 0; i < len; i++) {
		blks[i >> 2] |= (bytes[i] & 0xff) << (24 - (i % 4) * 8)
	}
	blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8)
	blks[blkLen - 2] = len * 8 >>> 32
	blks[blkLen - 1] = (len * 8) | 0
	return blks
}
function strToBlks(s) {
	var bytes = []
	for (var i = 0; i < s.length; i++) {
		var c = s.charCodeAt(i)
		if (c < 0x80) { bytes.push(c) }
		else if (c < 0x800) { bytes.push(0xc0 | (c >> 6)); bytes.push(0x80 | (c & 0x3f)) }
		else if (c < 0xd800 || c >= 0xe000) { bytes.push(0xe0 | (c >> 12)); bytes.push(0x80 | ((c >> 6) & 0x3f)); bytes.push(0x80 | (c & 0x3f)) }
		else { i++; var c2 = s.charCodeAt(i); bytes.push(0xf0 | (((c & 0x3ff) >> 18) + 1)); bytes.push(0x80 | (((c >> 12) & 0x3f) | ((c2 & 0x3ff) >> 18) & 0x3f)); bytes.push(0x80 | (((c2 >> 12) & 0x3f) | ((c & 0x3f) >> 6))); bytes.push(0x80 | (c2 & 0x3f)) }
	}
	return bytesToBlks(bytes)
}
function sha1(s) {
	var blks = sha1Core(strToBlks(s), 0)
	var hexTbl = '0123456789abcdef'
	var s2 = ''
	for (var i = 2; i < blks.length; i++) {
		for (var j = 7; j >= 0; j--) { s2 += hexTbl.charAt((blks[i] >> (j * 4)) & 0x0f) }
	}
	return s2
}
function hexToBytes(hex) {
	var bytes = []
	for (var i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16))
	return bytes
}
function hmacSha1(keyStr, dataStr) {
	var keyBytes = []
	for (var i = 0; i < keyStr.length; i++) {
		var c = keyStr.charCodeAt(i)
		if (c < 0x80) { keyBytes.push(c) }
		else if (c < 0x800) { keyBytes.push(0xc0 | (c >> 6)); keyBytes.push(0x80 | (c & 0x3f)) }
		else { keyBytes.push(0xe0 | (c >> 12)); keyBytes.push(0x80 | ((c >> 6) & 0x3f)); keyBytes.push(0x80 | (c & 0x3f)) }
	}
	if (keyBytes.length > 64) {
		var hx = sha1(keyStr)
		keyBytes = hexToBytes(hx)
	}
	while (keyBytes.length < 64) keyBytes.push(0)
	var inner = []
	var outer = []
	for (var k = 0; k < 64; k++) {
		inner.push(keyBytes[k] ^ 0x36)
		outer.push(keyBytes[k] ^ 0x5c)
	}
	var innerStr = ''
	for (var i2 = 0; i2 < inner.length; i2++) innerStr += String.fromCharCode(inner[i2])
	var innerHash = sha1Core(strToBlks(innerStr + dataStr), 0)
	var hexTbl2 = '0123456789abcdef'
	var innerHex = ''
	for (var i3 = 2; i3 < innerHash.length; i3++) {
		for (var j2 = 7; j2 >= 0; j2--) innerHex += hexTbl2.charAt((innerHash[i3] >> (j2 * 4)) & 0x0f)
	}
	var innerBytes = hexToBytes(innerHex)
	var outerStr2 = ''
	for (var i4 = 0; i4 < outer.length; i4++) outerStr2 += String.fromCharCode(outer[i4])
	var mid = new Array(innerBytes.length + 64)
	var oi = 0
	for (var i5 = 0; i5 < outer.length; i5++) mid[oi++] = outer[i5]
	for (var i6 = 0; i6 < innerBytes.length; i6++) mid[oi++] = innerBytes[i6]
	var blks = bytesToBlks(mid.slice(0, oi))
	var finalHash = sha1Core(blks, (outerStr2.length + innerBytes.length) * 8)
	var finalHex = ''
	for (var i7 = 2; i7 < finalHash.length; i7++) {
		for (var j3 = 7; j3 >= 0; j3--) finalHex += hexTbl2.charAt((finalHash[i7] >> (j3 * 4)) & 0x0f)
	}
	return finalHex
}

function getCosSignature(key, method, expireSeconds) {
	method = (method || 'get').toLowerCase()
	var expire = expireSeconds || (7 * 24 * 3600)
	var now = Math.floor(Date.now() / 1000)
	var signTime = now + ';' + (now + expire)
	var keyTime = signTime
	var httpString = method + '\n/' + key.replace(/^\/+/, '') + '\n\nhost=' + COS_BUCKET + '.cos.' + COS_REGION + '.myqcloud.com\n'
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

function cosKeyFromUrl(url) {
	if (!url || typeof url !== 'string') return ''
	if (/^https?:\/\//i.test(url)) {
		var match = url.replace(/^https?:\/\/[^/]+\/?/, '')
		return match
	}
	return url.replace(/^\/+/, '')
}

const USE_COS_SIGNED_URL = false  // 公有读私有写桶 = 关；只有桶是私有读写才临时开

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