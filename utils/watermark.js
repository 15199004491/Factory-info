const WATERMARK_TEXT = '加蜂'
const WATERMARK_ANGLE = -30
const WATERMARK_FILL_ALPHA = 0.28
const WATERMARK_STROKE_ALPHA = 0.18
const CSS_TILE_W = 200
const CSS_TILE_H = 140
const CSS_FONT_SIZE = 22

function getImageInfo(src) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({ src, success: resolve, fail: reject })
	})
}

function waitForCanvasNode(canvasId, retryScope) {
	return new Promise((resolve, reject) => {
		let attempts = 0
		const check = () => {
			attempts++
			if (attempts > 40) {
				reject(new Error('canvas节点获取超时'))
				return
			}
			const q = uni.createSelectorQuery()
			if (retryScope && retryScope.$) q.in(retryScope)
			q.select('#' + canvasId)
				.fields({ node: true, size: true })
				.exec((res) => {
					if (res && res[0] && res[0].node) {
						resolve(res[0].node)
					} else {
						setTimeout(check, 50)
					}
				})
		}
		check()
	})
}

export async function drawWatermark(canvasId, src, retryScope) {
	const info = await getImageInfo(src)
	const imgW = info.width
	const imgH = info.height

	const sysInfo = uni.getSystemInfoSync()
	const screenW = sysInfo.windowWidth || sysInfo.screenWidth || 375
	const scale = imgW / screenW
	const tileW = Math.max(60, Math.round(CSS_TILE_W * scale))
	const tileH = Math.max(42, Math.round(CSS_TILE_H * scale))
	const fontSize = Math.max(14, Math.round(CSS_FONT_SIZE * scale))

	const node = await waitForCanvasNode(canvasId, retryScope)

	const dpr = sysInfo.pixelRatio || 1
	node.width = imgW * dpr
	node.height = imgH * dpr

	const ctx = node.getContext('2d')
	ctx.scale(dpr, dpr)

	const img = node.createImage()
	await new Promise((resolve, reject) => {
		img.onload = resolve
		img.onerror = reject
		img.src = src
	})

	ctx.drawImage(img, 0, 0, imgW, imgH)

	ctx.font = `bold ${fontSize}px sans-serif`
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillStyle = `rgba(255,255,255,${WATERMARK_FILL_ALPHA})`
	ctx.strokeStyle = `rgba(0,0,0,${WATERMARK_STROKE_ALPHA})`
	ctx.lineWidth = Math.max(1, fontSize * 0.05)

	const rad = WATERMARK_ANGLE * Math.PI / 180
	const cos = Math.cos(rad)
	const sin = Math.sin(rad)

	const span = Math.abs(imgW * cos) + Math.abs(imgH * sin)
	const span2 = Math.abs(imgW * sin) + Math.abs(imgH * cos)

	ctx.save()
	ctx.translate(imgW / 2, imgH / 2)
	ctx.rotate(rad)
	const startX = -span / 2
	const startY = -span2 / 2
	for (let x = startX; x < span / 2 + tileW; x += tileW) {
		for (let y = startY; y < span2 / 2 + tileH; y += tileH) {
			ctx.strokeText(WATERMARK_TEXT, x, y)
			ctx.fillText(WATERMARK_TEXT, x, y)
		}
	}
	ctx.restore()

	return new Promise((resolve, reject) => {
		setTimeout(() => {
			uni.canvasToTempFilePath({
				canvas: node,
				fileType: 'jpg',
				quality: 0.92,
				success: res => resolve(res.tempFilePath),
				fail: reject
			})
		}, 60)
	})
}

export async function previewWithWatermark(canvasId, urls, current, retryScope) {
	const wmUrls = []
	for (let i = 0; i < urls.length; i++) {
		try {
			const p = await drawWatermark(canvasId, urls[i], retryScope)
			wmUrls.push(p)
		} catch (e) {
			wmUrls.push(urls[i])
		}
	}
	let currentUrl = wmUrls[0]
	const idx = urls.indexOf(current)
	if (idx >= 0 && idx < wmUrls.length) currentUrl = wmUrls[idx]
	return { urls: wmUrls, current: currentUrl }
}