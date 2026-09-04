<template>
	<view class="page">

		<view class="header-card">
			<view class="header-top">
				<view class="factory-title-row">
					<text class="factory-name">{{ factory.name }}</text>
					<text class="verified-tag tag-success" v-if="factory.identification === 1">已认证</text>
					<text class="verified-tag tag-unauth" v-else>未认证</text>
				</view>
				<view class="address-row" @tap="openLocation">
					<u-icon name="map" size="14" color="rgba(255,255,255,0.85)"></u-icon>
					<text class="address-text">{{ factory.location.address }}</text>
					<text class="address-arrow">›</text>
				</view>
			</view>
			<view class="header-stats">
				<view class="stat-item">
					<text class="stat-value">{{ formatVisitorCount(factory.today_count) }}</text>
					<text class="stat-label">今日访客</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-value">{{ formatVisitorCount(factory.count) }}</text>
					<text class="stat-label">历史访客</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item">
					<text class="stat-value">{{ factory.update_time ? formatDate(factory.update_time) : '--' }}</text>
					<text class="stat-label">更新时间</text>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-area" :show-scrollbar="false">
			<view class="scroll-inner">

				<view class="module-card">
					<view class="section-header">
						<view class="section-title-bar"></view>
						<text class="section-title">通知</text>
					</view>
					<view class="notice-body" v-if="factory.notice">
						<text class="notice-text">{{ factory.notice }}</text>
					</view>
					<view class="empty-tip" v-else>
						<text class="empty-tip-text">暂无通知</text>
					</view>
				</view>

				<view class="module-card">
					<view class="section-header">
						<view class="section-title-bar"></view>
						<text class="section-title">品类价格</text>
					</view>
					<view class="category-list" v-if="categories.length > 0">
						<view class="category-item" v-for="(cat, idx) in categories" :key="idx">
							<view class="cat-main">
								<view class="cat-info">
									<text class="cat-name">{{ cat.name }}</text>
									<text class="cat-status-tag" :class="{ active: cat.status === '收购中', paused: cat.status === '暂停收购' }">{{ cat.status }}</text>
								</view>
								<view class="cat-price-wrap">
									<template v-if="cat.price != null && cat.price !== ''">
										<text class="cat-price-num">{{ getPriceNum(cat.price) }}</text>
										<text class="cat-price-unit">/{{ getPriceUnit(cat.price) }}</text>
									</template>
									<text class="cat-price-negotiable" v-else>暂无报价</text>
								</view>
							</view>
							<view class="cat-remark" v-if="cat.remark">
								<text class="cat-remark-text">{{ cat.remark }}</text>
							</view>
						</view>
					</view>
					<view class="empty-tip" v-else>
						<text class="empty-tip-text">暂无品类信息</text>
					</view>
				</view>
				<safe-bottom :height="130"></safe-bottom>
			</view>
		</scroll-view>

		<view class="bottom-bar">
			<view class="action-btn poster-btn" @tap="onShowPoster">
				<text class="btn-label">海报</text>
			</view>
			<button class="action-btn share-btn" open-type="share">
				<text class="btn-label">分享</text>
			</button>
			<view class="action-btn home-btn" v-if="showHomeBtn" @tap="onGoHome">
				<text class="btn-label">更多收购商</text>
			</view>
		</view>

		<view class="poster-modal" v-if="showPoster" @tap="showPoster = false">
			<view class="poster-wrap">
				<view class="poster-inner">
					<view class="poster-card"  @tap.stop>
						<view class="poster-header">
							<view class="poster-factory-name">{{ factory.name }}</view>
							<view class="poster-address-text poster-header-address">{{ factory.location.address }}</view>
						</view>
						<view class="poster-categories">
							<view class="poster-cat-title">收购品类</view>
							<view class="poster-cat-list">
								<view class="poster-cat-item" v-for="(cat, idx) in categories" :key="idx">
									<text class="poster-cat-name">{{ cat.name }}</text>
								</view>
							</view>
						</view>
						<view class="poster-bottom">
							<view class="poster-qrcode">
								<image v-if="factoryQrcodeUrl" :src="factoryQrcodeUrl" mode="aspectFit" class="poster-qr-canvas" :style="{ width: qrCanvasSize + 'px', height: qrCanvasSize + 'px' }"></image>
								<canvas v-else type="2d" id="qrCanvas" class="poster-qr-canvas" :style="{ width: qrCanvasSize + 'px', height: qrCanvasSize + 'px' }"></canvas>
							</view>
							<view class="poster-slogan">
								<text class="poster-slogan-main">微信扫一扫 查看最新报价</text>
							</view>
						</view>
					</view>
					<text class="poster-tip-text" @tap.stop>扫码后直接进入当前页，让更多农户看到收购价</text>
					<view class="poster-actions" @tap.stop>
						<view class="poster-save-btn" :class="{ disabled: isSavingPoster }" @tap="onSavePoster">
							<text class="poster-save-text">{{ isSavingPoster ? '保存中...' : '保存海报' }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<canvas type="2d" id="posterCanvas" class="poster-canvas-hidden"></canvas>
	</view>
</template>

<script>
	import { factoryApi } from '@/utils/request.js'
	import { formatVisitorCount, formatDate, isShareEnterFirstTimeThenConsume } from '@/utils/date.js'
	import { generateQRData } from '@/utils/qrcode.js'
	import { formatCosUrl } from '@/utils/config.js'

	export default {
		data() {
			return {
				showPoster: false,
				showHomeBtn: false,
				loading: true,
				factoryId: null,
				qrCanvasSize: 100,
				isSavingPoster: false,
				factoryQrcodeUrl: '',
				loadingQrcode: false,
				factory: {
					name: '',
					verified: false,
					identification: -1,
					address: '',
					notice: '',
					latitude: 0,
					longitude: 0,
					update_time: ''
				},
				categories: []
			}
		},
		onLoad(options) {
			if (options && options.Id) {
				this.factoryId = options.Id
			}
			if (options && options.name) {
				this.factory.name = decodeURIComponent(options.name)
				uni.setNavigationBarTitle({
					title: this.factory.name
				})
			}
			if (options.scene) {
				const scene = decodeURIComponent(options.scene)
				this.factoryId = scene.replace('f', '')
			}
			if (isShareEnterFirstTimeThenConsume()) {
				this.showHomeBtn = true
			}
			this.loadDetail()
		},
		onShareAppMessage() {
			return {
				title: this.factory.name + ' - 收购信息',
				path: '/pages/factory/detail?Id=' + this.factoryId
			}
		},
		onShareTimeline() {
			return {
				title: this.factory.name + ' - 收购信息',
				query: 'Id=' + this.factoryId
			}
		},
		methods: {
			async loadDetail() {
				if (!this.factoryId) {
					this.loading = false
					return
				}
				this.loading = true
				try {
					const data = await factoryApi.getDetail(this.factoryId)
					const idVal = data.identification
					const idNum = (idVal === null || idVal === undefined || idVal === '') ? -1 : Number(idVal)
					this.factory = {
						...data,
						identification: idNum,
						verified: idNum === 1
					}
					this.categories = this.parseCategories(this.factory.category)
				} catch (e) {
					console.error('loadDetail错误:', e)
					uni.showToast({ title: '加载失败，请重试', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			parseCategories(data) {
				if (!data) return []
				if (Array.isArray(data)) {
					return data.map(item => {
						if (typeof item === 'string') {
							return { name: item, price: '', remark: '' }
						}
						const priceVal = item.price ? String(item.price) : ''
						const unitVal = item.unit || item.price_unit || ''
						return {
							name: item.name || item.category || '',
							price: priceVal ? priceVal + (unitVal || '') : '',
							status: item.status == 1 ? '收购中' : '暂停收购',
							remark: item.remark || item.notes || ''
						}
					})
				}
				if (typeof data === 'string') {
					return data.split(',').filter(Boolean).map(name => ({ name, price: '', remark: '' }))
				}
				return []
			},
			formatVisitorCount,
			getPriceNum(priceStr) {
				const match = priceStr.match(/[\d.]+/)
				return match ? match[0] : priceStr
			},
			getPriceUnit(priceStr) {
				const match = priceStr.match(/[^\d.]+/)
				return match ? match[0] : ''
			},
			formatDate,
			openLocation() {
				const loc = this.factory.location || {}
				const latitude = Number(loc.latitude)
				const longitude = Number(loc.longitude)
				const address = loc.address || this.factory.address || ''
				if (!latitude || !longitude || latitude === 0 || longitude === 0) {
					uni.showToast({ title: '位置信息无效，请联系管理员', icon: 'none' })
					return
				}
				uni.openLocation({
					latitude,
					longitude,
					name: this.factory.name,
					address,
					scale: 16
				})
			},
			onGoHome() {
				uni.switchTab({
					url: '/pages/hall/hall'
				})
			},
			async onShowPoster() {
				const sysInfo = uni.getSystemInfoSync()
				const size = Math.floor(340 * sysInfo.windowWidth / 750)
				this.qrCanvasSize = size
				if (!this.factoryQrcodeUrl) {
					uni.showLoading({ title: '生成中...', mask: true })
					try {
						const qrcodeData = await factoryApi.generateFactoryQrcode(this.factoryId, this.factory.name)
						if (qrcodeData) {
							let url = ''
							if (typeof qrcodeData === 'string') {
								url = qrcodeData
							} else {
								url = qrcodeData.url || qrcodeData.qrcode || qrcodeData.qrcode_url || qrcodeData.qrCode || qrcodeData.qr_url || qrcodeData.path || qrcodeData.img || qrcodeData.image || qrcodeData.file || qrcodeData.src || qrcodeData.base64 || ''
								if (!url && qrcodeData.data) {
									const inner = qrcodeData.data
									if (typeof inner === 'string') {
										url = inner
									} else {
										url = inner.url || inner.qrcode || inner.qrcode_url || inner.qrCode || inner.path || inner.img || inner.image || inner.file || inner.src || inner.base64 || ''
									}
								}
							}
							if (url) {
								if (/^iVBOR|^\/9j\//i.test(url)) {
									const prefix = /^iVBOR/i.test(url) ? 'data:image/png;base64,' : 'data:image/jpeg;base64,'
									url = prefix + url
								} else if (!/^(wxfile:|file:|blob:|wxLocalResource:|data:|https?:)/i.test(url)) {
									url = formatCosUrl(url)
								}
							}
							this.factoryQrcodeUrl = url
						}
					} catch (e) {
						console.error('获取小程序码失败:', e)
						uni.showToast({ title: '小程序码获取失败，将使用普通二维码', icon: 'none' })
					} finally {
						uni.hideLoading()
					}
				}
				this.showPoster = true
				this.$nextTick(() => {
					if (!this.factoryQrcodeUrl) {
						this.renderQRCode()
					}
				})
			},
			renderQRCode() {
				const sysInfo = uni.getSystemInfoSync()
				const size = this.qrCanvasSize
				const qrText = this.getQRUrl()
				try {
					const data = generateQRData(qrText, 2)
					const qrSize = data.size
					const margin = 0
					const moduleCount = qrSize + margin * 2
					const cellSize = Math.max(1, Math.floor(size / moduleCount))
					const actualSize = cellSize * moduleCount
					const offsetX = (size - actualSize) / 2
					const offsetY = (size - actualSize) / 2
					const query = uni.createSelectorQuery().in(this)
					query.select('#qrCanvas').fields({ node: true, size: true }).exec((res) => {
						if (!res || !res[0]) return
						const canvas = res[0].node
						const ctx = canvas.getContext('2d')
						const dpr = sysInfo.pixelRatio || 2
						canvas.width = size * dpr
						canvas.height = size * dpr
						ctx.scale(dpr, dpr)
						ctx.fillStyle = '#ffffff'
						ctx.fillRect(0, 0, size, size)
						ctx.fillStyle = '#000000'
						for (let row = 0; row < qrSize; row++) {
							for (let col = 0; col < qrSize; col++) {
								if (data.modules[row][col]) {
									const x = offsetX + (col + margin) * cellSize
									const y = offsetY + (row + margin) * cellSize
									ctx.fillRect(x, y, cellSize, cellSize)
								}
							}
						}
					})
				} catch (e) {
					console.error('QR code generation failed:', e)
				}
			},
			getQRUrl() {
				return 'https://housefactory.cn/pages/factory/detail?Id=' + this.factoryId
			},
			async onSavePoster() {
				if (this.isSavingPoster) return
				this.isSavingPoster = true
				try {
					uni.showLoading({ title: '生成海报中...', mask: true })
					const tempFilePath = await this.renderPosterToImage()
					uni.hideLoading()
					await this.savePosterToAlbum(tempFilePath)
					uni.showToast({ title: '已保存到相册', icon: 'success' })
				} catch (e) {
					uni.hideLoading()
					console.error('保存海报失败:', e)
					if (e && (e.errMsg || '').indexOf('auth deny') > -1) {
						uni.showModal({
							title: '提示',
							content: '需要您授权保存相册权限，是否去开启？',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting()
								}
							}
						})
					} else {
						uni.showToast({ title: (e && e.msg) ? e.msg : '保存失败，请重试', icon: 'none' })
					}
				} finally {
					this.isSavingPoster = false
				}
			},
			downloadImage(url) {
				return new Promise((resolve, reject) => {
					if (!url) {
						reject(new Error('图片地址为空'))
						return
					}
					if (/^(wxfile:|file:|data:|blob:)/i.test(url)) {
						resolve(url)
						return
					}
					let finalUrl = url
					if (!/^https?:/i.test(finalUrl)) {
						finalUrl = formatCosUrl(finalUrl)
					}
					uni.downloadFile({
						url: finalUrl,
						success: (res) => {
							if (res.statusCode === 200) {
								resolve(res.tempFilePath)
							} else {
								reject(new Error('下载图片失败, statusCode=' + res.statusCode))
							}
						},
						fail: reject
					})
				})
			},
			renderPosterToImage() {
				return new Promise((resolve, reject) => {
					const sysInfo = uni.getSystemInfoSync()
					const dpr = sysInfo.pixelRatio || 2
					const posterW = 375

					const drawPoster = (qrcodeImgPath) => {
						const query = uni.createSelectorQuery().in(this)
						query.select('#posterCanvas').fields({ node: true, size: true }).exec(async (res) => {
							try {
								if (!res || !res[0] || !res[0].node) {
									reject(new Error('获取海报画布失败'))
									return
								}
								const canvas = res[0].node
								const ctx = canvas.getContext('2d')

								const padding = 28
								const maxTextW = posterW - padding * 2

								ctx.font = 'bold 22px sans-serif'
								const factoryName = this.factory.name || ''
								const nameLines = this.wrapText(ctx, factoryName, maxTextW)
								const nameLineH = 30

								ctx.font = '13px sans-serif'
								const address = (this.factory.location && this.factory.location.address) || this.factory.address || ''
								const addrLines = this.wrapText(ctx, address, maxTextW)
								const addrLineH = 20

								let tagX = padding
								let tagY = 0
								const tagH = 28
								const tagGap = 10
								const tagPaddingLR = 14
								const tagLines = []
								ctx.font = '13px sans-serif'
								this.categories.forEach((cat) => {
									const catName = cat.name || String(cat)
									const textW = ctx.measureText(catName).width
									const tagW = textW + tagPaddingLR * 2
									if (tagX + tagW > posterW - padding) {
										tagX = padding
										tagY += tagH + tagGap
									}
									tagLines.push({ name: catName, x: tagX, y: tagY, w: tagW })
									tagX += tagW + tagGap
								})
								const tagBlockH = tagY + tagH

								const qrSize = 180
								const qrGapTop = 24
								const qrGapBottom = 16

								const posterH = padding
									+ nameLines.length * nameLineH + 10
									+ addrLines.length * addrLineH + 14
									+ 14 + 14 + 28
									+ tagBlockH + 28
									+ qrGapTop + qrSize + qrGapBottom + 24

								canvas.width = posterW * dpr
								canvas.height = posterH * dpr
								ctx.scale(dpr, dpr)

								const radius = 16
								const gradient = ctx.createLinearGradient(0, 0, 0, posterH)
								gradient.addColorStop(0, '#ffffff')
								gradient.addColorStop(1, '#f5f9ff')
								this.roundRect(ctx, 0, 0, posterW, posterH, radius)
								ctx.fillStyle = gradient
								ctx.fill()

								let y = padding

								ctx.fillStyle = '#333333'
								ctx.font = 'bold 22px sans-serif'
								nameLines.forEach((line) => {
									ctx.fillText(line, padding, y + 22)
									y += nameLineH
								})
								y += 10

								ctx.fillStyle = '#666666'
								ctx.font = '13px sans-serif'
								addrLines.forEach((line) => {
									ctx.fillText(line, padding, y + 14)
									y += addrLineH
								})
								y += 14

								ctx.strokeStyle = '#eeeeee'
								ctx.lineWidth = 0.5
								ctx.beginPath()
								ctx.moveTo(padding, y)
								ctx.lineTo(posterW - padding, y)
								ctx.stroke()
								y += 14

								ctx.fillStyle = '#333333'
								ctx.font = 'bold 14px sans-serif'
								ctx.fillText('收购品类', padding, y + 16)
								y += 28

								ctx.font = '13px sans-serif'
								tagLines.forEach((tag) => {
									this.roundRect(ctx, tag.x, y + tag.y, tag.w, tagH, 6)
									ctx.fillStyle = '#f0f7ff'
									ctx.fill()
									ctx.fillStyle = '#333333'
									ctx.fillText(tag.name, tag.x + tagPaddingLR, y + tag.y + 19)
								})
								y += tagBlockH + 28

								ctx.strokeStyle = '#eeeeee'
								ctx.lineWidth = 0.5
								ctx.beginPath()
								ctx.moveTo(padding, y)
								ctx.lineTo(posterW - padding, y)
								ctx.stroke()
								y += qrGapTop

								const qrX = (posterW - qrSize) / 2

								if (qrcodeImgPath) {
									const img = canvas.createImage()
									await new Promise((imgResolve, imgReject) => {
										img.onload = imgResolve
										img.onerror = imgReject
										img.src = qrcodeImgPath
									})
									ctx.drawImage(img, qrX, y, qrSize, qrSize)
								} else {
									const qrText = this.getQRUrl()
									const qrData = generateQRData(qrText, 2)
									this.drawQRCodeToCtx(ctx, qrData, qrX, y, qrSize)
								}
								y += qrSize + qrGapBottom

								ctx.fillStyle = '#333333'
								ctx.font = '13px sans-serif'
								const slogan = '微信扫一扫 查看最新报价'
								const sloganW = ctx.measureText(slogan).width
								ctx.fillText(slogan, (posterW - sloganW) / 2, y + 16)

								setTimeout(() => {
									uni.canvasToTempFilePath({
										canvas: canvas,
										success: (r) => resolve(r.tempFilePath),
										fail: (err) => reject(err)
									}, this)
								}, 50)
							} catch (e) {
								reject(e)
							}
						})
					}

					if (this.factoryQrcodeUrl) {
						this.downloadImage(this.factoryQrcodeUrl)
							.then((localPath) => drawPoster(localPath))
							.catch((e) => {
								console.warn('下载小程序码失败，使用普通二维码:', e)
								drawPoster('')
							})
					} else {
						drawPoster('')
					}
				})
			},
			drawQRCodeToCtx(ctx, data, x, y, size) {
				const qrSize = data.size
				const margin = 0
				const moduleCount = qrSize + margin * 2
				const cellSize = Math.max(1, Math.floor(size / moduleCount))
				const actualSize = cellSize * moduleCount
				const offsetX = x + (size - actualSize) / 2
				const offsetY = y + (size - actualSize) / 2
				ctx.fillStyle = '#ffffff'
				ctx.fillRect(x, y, size, size)
				ctx.fillStyle = '#000000'
				for (let row = 0; row < qrSize; row++) {
					for (let col = 0; col < qrSize; col++) {
						if (data.modules[row][col]) {
							const px = offsetX + (col + margin) * cellSize
							const py = offsetY + (row + margin) * cellSize
							ctx.fillRect(px, py, cellSize, cellSize)
						}
					}
				}
			},
			roundRect(ctx, x, y, w, h, r) {
				ctx.beginPath()
				ctx.moveTo(x + r, y)
				ctx.lineTo(x + w - r, y)
				ctx.quadraticCurveTo(x + w, y, x + w, y + r)
				ctx.lineTo(x + w, y + h - r)
				ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
				ctx.lineTo(x + r, y + h)
				ctx.quadraticCurveTo(x, y + h, x, y + h - r)
				ctx.lineTo(x, y + r)
				ctx.quadraticCurveTo(x, y, x + r, y)
				ctx.closePath()
			},
			wrapText(ctx, text, maxWidth) {
				if (!text) return []
				const lines = []
				let currentLine = ''
				for (let i = 0; i < text.length; i++) {
					const testLine = currentLine + text[i]
					if (currentLine && ctx.measureText(testLine).width > maxWidth) {
						lines.push(currentLine)
						currentLine = text[i]
					} else {
						currentLine = testLine
					}
				}
				if (currentLine) lines.push(currentLine)
				return lines
			},
			savePosterToAlbum(tempFilePath) {
				return new Promise((resolve, reject) => {
					uni.saveImageToPhotosAlbum({
						filePath: tempFilePath,
						success: resolve,
						fail: (err) => {
							if (err && err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
								uni.authorize({
									scope: 'scope.writePhotosAlbum',
									success: () => {
										uni.saveImageToPhotosAlbum({
											filePath: tempFilePath,
											success: resolve,
											fail: reject
										})
									},
									fail: reject
								})
							} else {
								reject(err)
							}
						}
					})
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
		overflow: hidden;
	}

	.header-card {
		background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
		padding: 40rpx 32rpx 120rpx;
		position: relative;
		flex-shrink: 0;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.header-top {
		position: relative;
		z-index: 1;
	}

	.factory-title-row {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.factory-name {
		font-size: 40rpx;
		font-weight: 700;
		color: #fff;
	}

	.verified-tag {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		margin-left: 16rpx;
		flex-shrink: 0;
		font-weight: 600;
	}

	.verified-tag.tag-success,
	.verified-tag.tag-unauth {
		color: #fff;
		background: transparent;
		border: 1rpx solid rgba(255, 255, 255, 0.8);
		box-shadow: none;
	}

	.address-row {
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 12rpx;
		padding: 18rpx 20rpx;
	}

	.address-row .u-icon {
		margin-right: 10rpx;
		flex-shrink: 0;
	}

	.address-text {
		flex: 1;
		font-size: 28rpx;
		color: #fff;
		line-height: 1.5;
	}

	.address-arrow {
		font-size: 36rpx;
		color: rgba(255, 255, 255, 0.8);
		flex-shrink: 0;
	}

	.header-stats {
		position: absolute;
		left: 24rpx;
		right: 24rpx;
		bottom: -60rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 32rpx 24rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #3c9cff;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-size: 24rpx;
		color: #999;
	}

	.stat-divider {
		width: 1rpx;
		height: 48rpx;
		background-color: #eee;
	}

	.scroll-area {
		flex: 1;
		overflow: hidden;
	}

	.scroll-inner {
		padding: 80rpx 24rpx 0;
	}

	.module-card {
		background-color: #fff;
		margin-bottom: 24rpx;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.module-card:last-child {
		margin-bottom: 0;
	}

	.empty-tip {
		padding: 48rpx 24rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.empty-tip-text {
		font-size: 26rpx;
		color: #bbb;
	}

	.section-header {
		display: flex;
		align-items: center;
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.section-title-bar {
		width: 6rpx;
		height: 28rpx;
		background: linear-gradient(180deg, #3c9cff, #5ac8fa);
		border-radius: 3rpx;
		margin-right: 12rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.notice-body {
		padding: 24rpx;
	}

	.notice-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	.category-list {
		padding: 0 24rpx 16rpx;
	}

	.category-item {
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.category-item:last-child {
		border-bottom: none;
	}

	.cat-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cat-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.cat-status-tag {
		font-size: 20rpx;
		color: #ff4d4f;
		background-color: #fff1f0;
		border-color: #ffa39e;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-weight: 400;
	}

	.cat-status-tag.active {
		color: #52c41a;
		background-color: #f6ffed;
		border: 1rpx solid #b7eb8f;
	}

	.cat-price-wrap {
		display: flex;
		align-items: baseline;
	}

	.cat-price-num {
		font-size: 38rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.cat-price-unit {
		font-size: 24rpx;
		font-weight: 600;
		color: #ff5722;
		margin-left: 4rpx;
	}

	.cat-price-negotiable {
		font-size: 28rpx;
		font-weight: 500;
		color: #bbb;
	}

	.cat-remark {
		margin-top: 16rpx;
	}

	.cat-remark-text {
		font-size: 26rpx;
		color: #999;
		line-height: 1.5;
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		background-color: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx 0;
		margin: 0 12rpx;
		border-radius: 16rpx;
		border: none;
		line-height: 1;
	}

	.action-btn::after {
		border: none;
	}

	.home-btn {
		background: #fff;
		border: 2rpx solid #3c9cff;
	}

	.home-btn .btn-label {
		color: #3c9cff;
		font-size: 28rpx;
	}

	.poster-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.share-btn {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.btn-label {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}

	.poster-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.poster-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx;
	}

	.poster-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.poster-card {
		width: 500rpx;
		background: linear-gradient(180deg, #fff 0%, #f5f9ff 100%);
		border-radius: 24rpx;
		padding: 48rpx 40rpx 40rpx;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
	}

	.poster-header {
		display: flex;
		flex-direction: column;
		margin-bottom: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.poster-factory-name {
		font-size: 36rpx;
		font-weight: 700;
		color: #333;
		margin-bottom: 10rpx;
	}

	.poster-verified-badge {
		font-size: 20rpx;
		color: #8b4513;
		background: linear-gradient(135deg, #ffd700, #ffb347);
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
		margin-left: 12rpx;
		flex-shrink: 0;
		font-weight: 600;
		box-shadow: 0 2rpx 6rpx rgba(255, 179, 71, 0.4);
	}

	.poster-address {
		display: flex;
		align-items: flex-start;
		margin-bottom: 28rpx;
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid #eee;
	}

	.poster-address-icon {
		font-size: 24rpx;
		margin-right: 8rpx;
		flex-shrink: 0;
	}

	.poster-address-text {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		flex: 1;
	}

	.poster-categories {
		margin-bottom: 28rpx;
	}

	.poster-cat-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.poster-cat-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.poster-cat-item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f7ff;
		padding: 12rpx 24rpx;
		border-radius: 10rpx;
		box-sizing: border-box;
	}

	.poster-cat-name {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}

	.poster-bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 32rpx;
		border-top: 1rpx solid #eee;
	}

	.poster-qrcode {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.poster-qr-canvas {
		background-color: #fff;
		border-radius: 12rpx;
		width: 260rpx;
		height: 260rpx;
	}

	.poster-qr-tip {
		font-size: 22rpx;
		color: #666;
		margin-top: 12rpx;
	}

	.poster-slogan {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.poster-slogan-main {
		font-size: 24rpx;
		font-weight: 400;
		color: #333;
		margin-bottom: 8rpx;
	}

	.poster-slogan-sub {
		font-size: 24rpx;
		color: #999;
	}

	.poster-actions {
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.poster-save-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 24rpx 80rpx;
		border-radius: 999rpx;
	}

	.poster-save-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}

	.poster-tip-text {
		margin: 32rpx 0 24rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.6;
		text-align: center;
	}

	.poster-canvas-hidden {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 375px;
		height: 560px;
		z-index: -1;
	}

	.poster-save-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
	}
</style>