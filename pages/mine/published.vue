
<template>
	<view class="page">
		<view class="list-container">
			<view class="empty" v-if="allList.length === 0">
				<text class="empty-text">暂无发布的信息</text>
			</view>

			<view class="list-item" v-for="(item, index) in allList" :key="item.id">
				<view class="item-main">
					<view class="item-header">
						<text class="item-title">{{ item.title }}</text>
						<text class="item-type-tag" :class="item.type === 'rent' ? 'type-rent' : 'type-second'">{{ item.type === 'rent' ? '租房' : '二手房' }}</text>
					</view>
					<view class="item-tags" v-if="item.type === 'rent'">
						<text class="item-sub-tag" :class="item.tagType === 'shared' ? 'tag-shared' : 'tag-entire'">{{ item.tagType === 'shared' ? '合租' : '整租' }}</text>
					</view>
					<text class="item-desc">{{ item.community }} · {{ item.houseType }} · {{ item.area }}</text>
					<text class="item-region" v-if="item.region">地点：{{ item.region }}</text>
					<view class="item-footer">
						<text class="item-price">{{ item.price }}{{ item.type === 'second' ? '万' : '元/月' }}</text>
						<text class="item-time">{{ item.createTime }}</text>
					</view>
				</view>
				<view class="item-actions">
					<view class="action-btn" @tap="onEdit(item)">
						<text class="action-text">编辑</text>
					</view>
					<view class="action-btn btn-delete" @tap="onDelete(item, index)">
						<text class="action-text">删除</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				allList: []
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			loadList() {
				var secondList = uni.getStorageSync('published_second') || []
				var rentList = uni.getStorageSync('published_rent') || []
				if (secondList.length === 0 && rentList.length === 0) {
					this.allList = [
						{
							id: 1001,
							type: 'second',
							title: '阳光花园 3室2厅 精装修',
							community: '阳光花园',
							region: '天河区/体育西路',
							houseType: '3室2厅1卫',
							area: '120㎡',
							floor: '中层/18层',
							orientation: '南北',
							decoration: '精装修',
							year: '2018年',
							price: '420',
							description: '小区环境优美，交通便利，周边配套齐全',
							createTime: '2026-08-10 14:30'
						},
						{
							id: 1002,
							type: 'rent',
							title: '天河城附近 2室1厅 整租',
							community: '天河城小区',
							region: '天河区/天河路',
							houseType: '2室1厅1卫',
							area: '85㎡',
							floor: '高层/22层',
							orientation: '南',
							decoration: '简装',
							payment: '押二付一',
							price: '3500',
							tagType: 'entire',
							description: '拎包入住，近地铁',
							createTime: '2026-08-11 09:15'
						},
						{
							id: 1003,
							type: 'rent',
							title: '珠江新城 合租主卧 独立卫浴',
							community: '珠江新城花园',
							region: '天河区/珠江新城',
							houseType: '1室0厅1卫',
							area: '25㎡',
							floor: '低层/8层',
							orientation: '东南',
							decoration: '精装',
							payment: '押一付一',
							price: '2200',
							tagType: 'shared',
							description: '合租主卧，带独立卫浴，室友均为白领',
							createTime: '2026-08-12 11:20'
						},
						{
							id: 1004,
							type: 'second',
							title: 'CBD核心 5室3厅 豪华装修',
							community: '中心花园',
							region: '珠江新城/花城大道',
							houseType: '5室3厅2卫',
							area: '260㎡',
							floor: '顶层/32层',
							orientation: '南北',
							decoration: '豪装',
							year: '2020年',
							price: '1280',
							description: '景观大平层，视野开阔',
							createTime: '2026-08-12 16:45'
						}
					]
				} else {
					this.allList = secondList.concat(rentList)
				}
			},
			onEdit(item) {
				var url = item.type === 'second' ? '/pages/publish/second' : '/pages/publish/rent'
				uni.navigateTo({
					url: url + '?action=edit&id=' + item.id
				})
			},
			onDelete(item, index) {
				var self = this
				uni.showModal({
					title: '提示',
					content: '确定删除"' + item.title + '"吗？',
					success: function(res) {
						if (res.confirm) {
							var key = item.type === 'second' ? 'published_second' : 'published_rent'
							var list = uni.getStorageSync(key) || []
							for (var i = 0; i < list.length; i++) {
								if (list[i].id === item.id) {
									list.splice(i, 1)
									break
								}
							}
							uni.setStorageSync(key, list)
							self.loadList()
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.list-container {
		padding: 20rpx 24rpx;
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 200rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.list-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.item-main {
		margin-bottom: 20rpx;
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 10rpx;
	}

	.item-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-type-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}

	.type-second {
		color: #56ccf2;
		background-color: rgba(86, 204, 242, 0.15);
	}

	.type-rent {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.15);
	}

	.item-tags {
		margin-bottom: 8rpx;
	}

	.item-sub-tag {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
	}

	.tag-entire {
		color: #43e97b;
		background-color: rgba(67, 233, 123, 0.1);
	}

	.tag-shared {
		color: #ff9a56;
		background-color: rgba(255, 154, 86, 0.1);
	}

	.item-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 8rpx;
	}

	.item-region {
		font-size: 24rpx;
		color: #999;
		display: block;
		margin-bottom: 12rpx;
	}

	.item-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-price {
		font-size: 34rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.item-time {
		font-size: 22rpx;
		color: #bbb;
	}

	.item-actions {
		display: flex;
		gap: 16rpx;
		justify-content: flex-end;
		padding-top: 20rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.action-btn {
		flex: none;
		padding: 12rpx 28rpx;
		background-color: #fff;
		border: 1rpx solid #ddd;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-text {
		font-size: 24rpx;
		color: #333;
		font-weight: normal;
	}

	.btn-delete .action-text {
		color: #ff4d4f;
	}
</style>