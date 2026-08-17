<template>
	<view class="page">
		<view class="detail-header">
			<view class="header-top">
				<text class="detail-title">{{ detail.title }}</text>
				<text class="header-time">{{ detail.time }}</text>
			</view>
			<view class="header-region">
				<u-icon name="map" size="14" color="rgba(255,255,255,0.8)"></u-icon>
				<text class="region-text">{{ detail.region }}</text>
			</view>
			</view>

		<view class="visitor-bar">
			<text class="visitor-text">今日访客：{{ detail.todayVisitors }}人 | 历史访客：{{ detail.totalVisitors }}人</text>
		</view>

		<view class="detail-section info-section">
			<view class="info-header">
				<view class="info-title-bar"></view>
				<text class="info-title">收购品类</text>
			</view>
			<view class="category-grid">
				<view class="category-card" v-for="(item, idx) in detail.items" :key="idx">
					<text class="cat-name">{{ item.name }}</text>
					<view class="cat-price-value">
						<text class="cat-price-num">{{ getPriceNum(item.price) }}</text>
						<text class="cat-price-unit">{{ getPriceUnit(item.price) }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="detail-section">
			<view class="info-header">
				<view class="info-title-bar"></view>
				<text class="info-title">详细说明</text>
			</view>
			<text class="detail-content">{{ detail.description }}</text>
		</view>

		<view class="bottom-bar">
			<view class="action-btn contact-btn" @tap="onContact">
				<text class="btn-label">电话联系</text>
			</view>
			<view class="action-btn share-btn" @tap="onShare">
				<text class="btn-label">分享</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { formatUpdateTime } from '@/utils/date.js'

	export default {
		data() {
			return {
				id: 0,
				detail: {
					title: '',
					category: '',
					items: [],
					region: '',
					time: '',
					description: '',
					contactName: '',
					mobile: '',
					todayVisitors: 0,
					totalVisitors: 0
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.id = parseInt(options.id)
				this.loadDetail()
			}
		},
		methods: {
			async loadDetail() {
				try {
					const mockMap = {
						1: { title: '大量收购玉米 小麦', category: '粮食', items: [{ name: '玉米', quantity: '3000斤', price: '1.25元/斤' }, { name: '小麦', quantity: '2000斤', price: '1.32元/斤' }], region: '兵团 塔城地区 133团', create_time: 1755360000, description: '本粮食合作社常年收购玉米、小麦等粮食作物，现金结算，价格公道，交通便利可上门收购，欢迎广大粮农前来洽谈合作。要求粮食无霉变、无杂质，水分含量适中。', contact_name: '张先生', mobile: '13800138001' },
						2: { title: '收购西红柿 黄瓜', category: '蔬菜', items: [{ name: '西红柿', quantity: '1200斤', price: '2.80元/斤' }, { name: '黄瓜', quantity: '800斤', price: '2.50元/斤' }], region: '兵团 石河子市 143团', create_time: 1755446400, description: '蔬菜批发市场长期收购西红柿、黄瓜等新鲜蔬菜，要求品相好、无病虫害、无机械损伤。每天清晨收购，量大价优，可提供上门收货服务。', contact_name: '李经理', mobile: '13800138002' },
						3: { title: '收购苹果 梨 水果', category: '水果', items: [{ name: '苹果', quantity: '2000斤', price: '3.50元/斤' }, { name: '梨', quantity: '1000斤', price: '3.20元/斤' }], region: '兵团 阿克苏地区 16团', create_time: 1755273600, description: '水果经销商大量收购苹果、梨等时令水果，要求果形端正、着色好、甜度高。欢迎果农直接联系，价格面议，量大从优。可长期合作，签订收购合同。', contact_name: '王老板', mobile: '13800138003' },
						4: { title: '生猪收购 活猪', category: '牲畜', items: [{ name: '活猪', quantity: '100头', price: '15.00元/斤' }], region: '兵团 塔城地区 133团', create_time: 1755532800, description: '定点屠宰场长期收购健康活猪，要求体重在100-150公斤之间，无疫病、无残伤。价格随行就市，现金交易，可上门拉猪，提供检疫证明。', contact_name: '赵厂长', mobile: '13800138004' },
						5: { title: '淡水鱼 河虾收购', category: '水产', items: [{ name: '淡水鱼', quantity: '600斤', price: '8.00元/斤' }, { name: '河虾', quantity: '400斤', price: '35.00元/斤' }], region: '兵团 博尔塔拉蒙古自治州 精河', create_time: 1755187200, description: '水产市场收购各类淡水鱼、河虾、螃蟹等水产品，要求鲜活、规格均匀。常年收购，价格公道，可安排上门捕捞，提供冷藏运输服务。', contact_name: '陈老板', mobile: '13800138005' },
						6: { title: '大豆 花生 油料', category: '油料', items: [{ name: '大豆', quantity: '2000斤', price: '4.20元/斤' }, { name: '花生', quantity: '1000斤', price: '5.80元/斤' }], region: '兵团 奎屯市 123团', create_time: 1755100800, description: '油脂加工企业大量收购大豆、花生、油菜籽等油料作物，要求含油量高、无霉变、无杂质。签订长期收购合同，价格稳定，提供技术指导。', contact_name: '刘主任', mobile: '13800138006' },
						7: { title: '棉花收购 籽棉', category: '棉花', items: [{ name: '籽棉', quantity: '8000斤', price: '6.50元/斤' }], region: '兵团 阿克苏地区 13团', create_time: 1755446400, description: '棉花加工厂大量收购籽棉，要求纤维长、强度高、无杂质。提供上门采摘服务，价格按品级定价，现金结算。欢迎棉农踊跃合作。', contact_name: '阿不都', mobile: '13800138007' },
						8: { title: '毛尖茶 绿茶收购', category: '茶叶', items: [{ name: '毛尖', quantity: '300斤', price: '80.00元/斤' }, { name: '绿茶', quantity: '200斤', price: '45.00元/斤' }], region: '兵团 伊犁地区 64团', create_time: 1755360000, description: '茶庄常年收购明前毛尖、特级绿茶，要求条索紧结、色泽翠绿、香气浓郁。提供收购标准检测，价格根据品级评定，现金支付，可长期合作。', contact_name: '林掌柜', mobile: '13800138008' },
						9: { title: '鸡蛋 鸭蛋 收购', category: '禽蛋', items: [{ name: '鸡蛋', quantity: '1200斤', price: '5.50元/斤' }, { name: '鸭蛋', quantity: '800斤', price: '6.80元/斤' }], region: '兵团 喀什地区 41团', create_time: 1755532800, description: '蛋品批发商长期收购鸡蛋、鸭蛋、鹌鹑蛋等禽蛋产品，要求新鲜、蛋壳干净、无破损。每天收购，价格根据市场行情浮动，量大价优，可提供配送服务。', contact_name: '周经理', mobile: '13800138009' },
						10: { title: '土豆 红薯 收购', category: '粮食', items: [{ name: '土豆', quantity: '2500斤', price: '1.80元/斤' }, { name: '红薯', quantity: '1500斤', price: '2.20元/斤' }], region: '兵团 塔城地区 133团', create_time: 1755014400, description: '食品加工厂大量收购土豆、红薯、马铃薯等根茎类作物，要求个头大、淀粉含量高、无发芽、无霉变。价格公道，现金交易，提供上门装车服务。', contact_name: '孙厂长', mobile: '13800138010' },
						11: { title: '白菜 萝卜 收购', category: '蔬菜', items: [{ name: '白菜', quantity: '2000斤', price: '0.90元/斤' }, { name: '萝卜', quantity: '1500斤', price: '1.20元/斤' }], region: '兵团 石河子市 147团', create_time: 1754928000, description: '冬储蔬菜收购商大量收购大白菜、萝卜、土豆等冬储蔬菜，要求新鲜、无冻害、无腐烂。价格随行就市，现金结算，提供冷库存储、包装服务。', contact_name: '马老板', mobile: '13800138011' },
						12: { title: '橙子 橘子 收购', category: '水果', items: [{ name: '脐橙', quantity: '1500斤', price: '2.20元/斤' }, { name: '蜜橘', quantity: '1000斤', price: '1.80元/斤' }], region: '兵团 阿拉尔市 1团', create_time: 1755446400, description: '脐橙经销商长期收购赣南脐橙、蜜橘等柑橘类水果，要求果皮光滑、汁多味甜、含糖量高。签订收购协议，价格稳定，提供分选、包装、物流一条龙服务。', contact_name: '黄总', mobile: '13800138012' }
					}
					const data = mockMap[this.id] || mockMap[1]
					this.detail = {
						title: data.title || '',
						category: data.category || '其他',
						items: data.items || [],
						region: data.region || '',
						time: formatUpdateTime(data.create_time || 0),
						description: data.description || '',
						contactName: data.contact_name || '',
						mobile: data.mobile || '',
						todayVisitors: data.today_visitors || Math.floor(Math.random() * 50) + 10,
						totalVisitors: data.total_visitors || Math.floor(Math.random() * 900) + 100
					}
				} catch (e) {}
			},
			onContact() {
				if (this.detail.mobile) {
					uni.makePhoneCall({
						phoneNumber: this.detail.mobile
					})
				} else {
					uni.showToast({
						title: '暂无联系电话',
						icon: 'none'
					})
				}
			},
			getPriceNum(price) {
				if (!price) return ''
				const match = price.match(/[\d.]+/)
				return match ? match[0] : price
			},
			getPriceUnit(price) {
				if (!price) return ''
				const match = price.match(/元\/.+/)
				return match ? match[0] : ''
			},
			onShare() {
				uni.showToast({
					title: '分享功能开发中',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 140rpx;
	}

	.detail-header {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
		padding: 40rpx 30rpx;
		color: #fff;
	}

	.visitor-bar {
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		text-align: right;
	}

	.visitor-text {
		font-size: 24rpx;
		color: #999;
	}

	.header-top {
		display: flex;
		align-items: center;
	}

	.header-region {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
	}

	.region-text {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
		margin-left: 8rpx;
	}

	.detail-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
		flex: 1;
	}

	.header-time {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		flex-shrink: 0;
	}

	.info-section {
		padding: 30rpx;
	}

	.info-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.info-title-bar {
		width: 6rpx;
		height: 28rpx;
		background: linear-gradient(180deg, #3c9cff, #5ac8fa);
		border-radius: 3rpx;
		margin-right: 12rpx;
	}

	.info-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.category-grid {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		align-items: flex-start;
	}

	.category-card {
		display: inline-flex;
		align-items: center;
		padding: 8rpx 0;
	}

	.cat-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		margin-right: 24rpx;
	}

	.cat-price-value {
		display: flex;
		align-items: baseline;
	}

	.cat-price-num {
		font-size: 34rpx;
		font-weight: 700;
		color: #ff5722;
	}

	.cat-price-unit {
		font-size: 22rpx;
		font-weight: 600;
		color: #ff5722;
		margin-left: 6rpx;
	}

	.detail-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.detail-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
	}

	.contact-section {
		padding-bottom: 20rpx;
	}

	.contact-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.contact-row:last-child {
		border-bottom: none;
	}

	.contact-label {
		font-size: 26rpx;
		color: #999;
	}

	.contact-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
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
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		margin: 0 12rpx;
		border-radius: 12rpx;
	}

	.contact-btn {
		background: linear-gradient(135deg, #3c9cff, #5ac8fa);
	}

	.share-btn {
		background: linear-gradient(135deg, #ff9800, #ffb74d);
	}

	.btn-label {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}
</style>