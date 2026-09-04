<template>
	<view class="guide-page">
		<view class="tab-bar">
			<view
				class="tab-item"
				:class="{ active: currentTab === 0 }"
				@tap="currentTab = 0"
			>
				<view class="tab-icon icon-bg-1" :class="{ active: currentTab === 0 }">
					<text class="tab-icon-text">1</text>
				</view>
				<text class="tab-title">加工厂入驻</text>
				<view class="tab-indicator" v-if="currentTab === 0"></view>
			</view>
			<view
				class="tab-item"
				:class="{ active: currentTab === 1 }"
				@tap="currentTab = 1"
			>
				<view class="tab-icon icon-bg-2" :class="{ active: currentTab === 1 }">
					<text class="tab-icon-text">2</text>
				</view>
				<text class="tab-title">发布/更新</text>
				<view class="tab-indicator ind-2" v-if="currentTab === 1"></view>
			</view>
			<view
				class="tab-item"
				:class="{ active: currentTab === 2 }"
				@tap="currentTab = 2"
			>
				<view class="tab-icon icon-bg-3" :class="{ active: currentTab === 2 }">
					<text class="tab-icon-text">3</text>
				</view>
				<text class="tab-title">查看信息</text>
				<view class="tab-indicator ind-3" v-if="currentTab === 2"></view>
			</view>
		</view>

		<view class="content-wrap">
			<view class="section" v-show="currentTab === 0">
				<view class="section-header">
					<view class="section-icon">
						<text class="icon-text">1</text>
					</view>
					<text class="section-title">加工厂入驻</text>
				</view>
				<view class="section-desc">
					<text class="desc-text">按照以下三步完成加工厂入驻流程</text>
				</view>
				<view class="image-list">
					<view class="image-item" v-for="(item, index) in registerImages" :key="'reg-' + index">
						<view class="step-badge">
							<text class="step-text">第{{ index + 1 }}步</text>
						</view>
						<view class="image-wrap">
							<image class="guide-image" :src="item.url" mode="heightFix" @tap="previewImage(index, 'register')" @error="onImageError($event, 'register', index)"></image>
							<view class="image-placeholder" v-if="item.error">
								<text class="placeholder-num">Step {{ index + 1 }}</text>
								<text class="placeholder-title">{{ item.placeholderTitle }}</text>
							</view>
						</view>
						<view class="image-caption">
							<text v-for="(seg, si) in item.captionSegs" :key="si" :style="'display:inline;' + (seg.color ? 'color:' + seg.color + ';' : '') + (seg.bold ? 'font-weight:700;' : '')">{{ seg.text }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="section" v-show="currentTab === 1">
				<view class="section-header">
					<view class="section-icon icon-2">
						<text class="icon-text">2</text>
					</view>
					<text class="section-title">发布/更新收购信息</text>
				</view>
				<view class="section-desc">
					<text class="desc-text">轻松发布和管理您的收购信息</text>
				</view>
				<view class="image-list">
					<view class="image-item" v-for="(item, index) in priceImages" :key="'price-' + index">
						<view class="step-badge badge-2">
							<text class="step-text">第{{ index + 1 }}步</text>
						</view>
						<view class="image-wrap">
							<image class="guide-image" :src="item.url" mode="heightFix" @tap="previewImage(index, 'price')" @error="onImageError($event, 'price', index)"></image>
							<view class="image-placeholder placeholder-2" v-if="item.error">
								<text class="placeholder-num">Step {{ index + 1 }}</text>
								<text class="placeholder-title">{{ item.placeholderTitle }}</text>
							</view>
						</view>
						<view class="image-caption">
							<text v-for="(seg, si) in item.captionSegs" :key="si" :style="'display:inline;' + (seg.color ? 'color:' + seg.color + ';' : '') + (seg.bold ? 'font-weight:700;' : '')">{{ seg.text }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="section" v-show="currentTab === 2">
				<view class="section-header">
					<view class="section-icon icon-3">
						<text class="icon-text">3</text>
					</view>
					<text class="section-title">查看信息</text>
				</view>
				<view class="section-desc">
					<text class="desc-text">在收购大厅查看您发布的信息</text>
				</view>
				<view class="image-list">
					<view class="image-item" v-for="(item, index) in infoImages" :key="'info-' + index">
						<view class="step-badge badge-3">
							<text class="step-text">第{{ index + 1 }}步</text>
						</view>
						<view class="image-wrap">
							<image class="guide-image" :src="item.url" mode="heightFix" @tap="previewImage(index, 'info')" @error="onImageError($event, 'info', index)"></image>
							<view class="image-placeholder placeholder-3" v-if="item.error">
								<text class="placeholder-num">Step {{ index + 1 }}</text>
								<text class="placeholder-title">{{ item.placeholderTitle }}</text>
							</view>
						</view>
						<view class="image-caption">
							<text v-for="(seg, si) in item.captionSegs" :key="si" :style="'display:inline;' + (seg.color ? 'color:' + seg.color + ';' : '') + (seg.bold ? 'font-weight:700;' : '')">{{ seg.text }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="footer-tip">
				<text class="tip-text">如有疑问，请联系客服</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 0,
				registerImages: [
					{
						url: '/static/factory-guide/register-1.png',
						captionSegs: [{ text: '在加工厂管理页面，点击底部的「新增加工厂」按钮' }],
						placeholderTitle: '点击新增加工厂',
						error: false
					},
					{
						url: '/static/factory-guide/register-2.png',
						captionSegs: [{ text: '填写加工厂基本信息（名称、电话、地址等），点击「下一步」' }],
						placeholderTitle: '填写基本信息',
						error: false
					},
					{
						url: '/static/factory-guide/register-3.png',
						captionSegs: [{ text: '上传营业执照和法人身份证，点击「立即认证」或「跳过，以后再说」' }],
						placeholderTitle: '提交认证资料',
						error: false
					}
				],
				priceImages: [
					{
						url: '/static/factory-guide/price-1.png',
						captionSegs: [
							{ text: '在加工厂卡片上点击「发布信息」按钮，填写收购品类、价格等信息，' },
							{ text: '更新信息也在这里', color: '#e64340' }
						],
						placeholderTitle: '点击发布信息',
						error: false
					},
					{
						url: '/static/factory-guide/price-2.png',
						captionSegs: [{ text: '一定要点击「发布」按钮才能更新成功' }],
						placeholderTitle: '点击发布按钮',
						error: false
					}
				],
				infoImages: [
					{
						url: '/static/factory-guide/info-1.png',
						captionSegs: [{ text: '进入收购大厅，查看你发布的信息' }],
						placeholderTitle: '进入收购大厅',
						error: false
					},
					{
						url: '/static/factory-guide/info-2.png',
						captionSegs: [
							{ text: '详情页可查看访客数据、农户点击「分享」扩散到微信群聊，点击海报生成' },
							{ text: '专属报价码', color: '#e64340', bold: true },
							{ text: '，线下张贴专属报价码，农户一键分享，更多农户找到你' }
						],
						placeholderTitle: '查看详情页',
						error: false
					}
				]
			}
		},
		methods: {
			previewImage(index, type) {
				let list
				if (type === 'register') list = this.registerImages
				else if (type === 'price') list = this.priceImages
				else list = this.infoImages
				const validUrls = list.filter(item => !item.error).map(item => item.url)
				if (validUrls.length === 0) return
				uni.previewImage({
					current: list[index].error ? validUrls[0] : list[index].url,
					urls: validUrls
				})
			},
			onImageError(e, type, index) {
				if (type === 'register') {
					this.registerImages[index].error = true
				} else if (type === 'price') {
					this.priceImages[index].error = true
				} else {
					this.infoImages[index].error = true
				}
			}
		}
	}
</script>

<style>
	.guide-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.tab-bar {
		display: flex;
		background-color: #ffffff;
		padding: 20rpx 12rpx 0;
		border-bottom: 1rpx solid #eeeeee;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16rpx 0 20rpx;
		position: relative;
	}

	.tab-icon {
		width: 52rpx;
		height: 52rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 10rpx;
		background-color: #f0f0f0;
	}

	.icon-bg-1 {
		background-color: #e8f3ff;
	}
	.icon-bg-1.active {
		background-color: #3c9cff;
	}
	.icon-bg-2 {
		background-color: #fff4e6;
	}
	.icon-bg-2.active {
		background-color: #ff9a3c;
	}
	.icon-bg-3 {
		background-color: #e6f9f1;
	}
	.icon-bg-3.active {
		background-color: #29c58a;
	}

	.tab-icon-text {
		font-size: 26rpx;
		font-weight: 700;
		color: #999999;
	}
	.tab-icon.active .tab-icon-text {
		color: #ffffff;
	}

	.tab-title {
		font-size: 24rpx;
		color: #999999;
	}
	.tab-item.active .tab-title {
		color: #333333;
		font-weight: 600;
	}

	.tab-indicator {
		position: absolute;
		bottom: 0;
		left: 50%;
		margin-left: -28rpx;
		width: 56rpx;
		height: 6rpx;
		border-radius: 4rpx;
		background-color: #3c9cff;
	}
	.tab-indicator.ind-2 {
		background-color: #ff9a3c;
	}
	.tab-indicator.ind-3 {
		background-color: #29c58a;
	}

	.content-wrap {
		padding: 4rpx 0;
	}

	.section {
		background-color: #ffffff;
		margin: 24rpx;
		border-radius: 20rpx;
		padding: 32rpx 24rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.section-icon {
		width: 56rpx;
		height: 56rpx;
		background-color: #3c9cff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.icon-2 {
		background-color: #ff9a3c;
	}

	.icon-3 {
		background-color: #29c58a;
	}

	.icon-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 700;
	}

	.section-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #333333;
	}

	.section-desc {
		margin-bottom: 32rpx;
		padding-left: 72rpx;
	}

	.desc-text {
		font-size: 26rpx;
		color: #999999;
	}

	.image-list {
		display: flex;
		flex-direction: column;
	}

	.image-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		margin-bottom: 40rpx;
	}

	.image-item:last-child {
		margin-bottom: 0;
	}

	.step-badge {
		position: absolute;
		top: -16rpx;
		left: 40rpx;
		background-color: #3c9cff;
		padding: 8rpx 20rpx;
		border-radius: 24rpx;
		z-index: 10;
	}

	.badge-2 {
		background-color: #ff9a3c;
	}

	.badge-3 {
		background-color: #29c58a;
	}

	.step-text {
		font-size: 22rpx;
		color: #ffffff;
		font-weight: 600;
	}

	.image-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.guide-image {
		height: 48vh;
		border-radius: 16rpx;
		background-color: #f0f0f0;
		border: 2rpx solid #eeeeee;
		display: block;
	}

	.image-placeholder {
		height: 48vh;
		width: 62%;
		border-radius: 16rpx;
		background-color: #e8f3ff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 2rpx dashed #3c9cff;
	}

	.placeholder-2 {
		background-color: #fff4e6;
		border-color: #ff9a3c;
	}

	.placeholder-3 {
		background-color: #e6f9f1;
		border-color: #29c58a;
	}

	.placeholder-num {
		font-size: 40rpx;
		font-weight: 700;
		color: #3c9cff;
		margin-bottom: 20rpx;
	}

	.placeholder-2 .placeholder-num {
		color: #ff9a3c;
	}

	.placeholder-3 .placeholder-num {
		color: #29c58a;
	}

	.placeholder-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
	}

	.image-caption {
		font-size: 26rpx;
		color: #666666;
		margin-top: 20rpx;
		line-height: 1.6;
		text-align: center;
		padding: 0 20rpx;
	}

	.footer-tip {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0 60rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #bbbbbb;
	}
</style>