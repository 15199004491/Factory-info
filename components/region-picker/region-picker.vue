<template>
	<view>
		<view class="picker-mask" v-show="visible" @tap="onMaskTap"></view>
		<view class="picker-sheet" :class="{ 'picker-sheet-show': visible }">
			<view class="sheet-header">
				<view class="sheet-header-left">
					<view class="sheet-btn sheet-cancel" @tap="onCancel">取消</view>
				</view>
				<view class="sheet-header-center">
					<text class="sheet-title">选择地区</text>
				</view>
				<view class="sheet-header-right">
					<view class="sheet-btn sheet-all" v-if="showAll" @tap="onAll">重置</view>
					<view class="sheet-btn sheet-confirm" @tap="onConfirm">确定</view>
				</view>
			</view>
			<picker-view
				class="sheet-picker"
				:value="[col1Index, col2Index, col3Index]"
				@change="onPickerChange"
				indicator-style="height: 80rpx; border-top: 1rpx solid #eee; border-bottom: 1rpx solid #eee;"
			>
				<picker-view-column style="width: 20%;">
					<view class="picker-item" v-for="(item, i) in catList" :key="i">
						{{ item.label }}
					</view>
				</picker-view-column>
				<picker-view-column style="width: 30%;">
					<view class="picker-item" v-for="(item, i) in subList" :key="i">
						{{ item.label }}
					</view>
				</picker-view-column>
				<picker-view-column style="width: 50%;">
					<view class="picker-item" v-for="(item, i) in groupList" :key="i">
						{{ item.label }}
					</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			current: {
				type: String,
				default: ''
			},
			showAll: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				col1Index: 0,
				col2Index: 0,
				col3Index: 0,
				regionData: [
					{
						label: '新疆生产建设兵团',
						children: [
							{ label: '第一师', children: ['1团','2团','3团','4团','5团','6团','7团','8团','9团','10团','11团','12团','13团','14团','16团','阿拉尔农场','幸福农场'] },
							{ label: '第二师', children: ['21团','22团','24团','25团','27团','29团','30团','31团','33团','34团','36团','37团','38团','223团'] },
							{ label: '第三师', children: ['41团','42团','44团','45团','46团','48团','49团','50团','51团','53团','54团','伽师总场','红旗农场','托云牧场','叶城二牧场','东风农场'] },
							{ label: '第四师', children: ['61团','62团','63团','64团','65团','66团','67团','68团','69团','70团','71团','72团','73团','74团','75团','76团','77团','78团','79团','拜什墩农场'] },
							{ label: '第五师', children: ['81团','82团','83团','84团','85团','86团','87团','88团','89团','90团','91团'] },
							{ label: '第六师', children: ['101团','102团','103团','105团','106团','107团','108团','109团','110团','111团','芳草湖农场','新湖农场','军户农场','共青团农场','六运湖农场','土墩子农场','红旗农场','奇台农场','北塔山牧场'] },
							{ label: '第七师', children: ['123团','124团','125团','126团','127团','128团','129团','130团','131团','137团','奎东农场'] },
							{ label: '第八师', children: ['121团','133团','134团','136团','141团','142团','143团','144团','石河子总场（北泉镇）','147团','148团','149团','150团','152团'] },
							{ label: '第九师', children: ['161团','162团','163团','164团','165团','166团','167团','168团','170团','团结农场'] },
							{ label: '第十师', children: ['181团','182团','183团','184团','185团','186团','187团','188团'] },
							{ label: '第十二师', children: ['104团','五一农场','三坪农场','头屯河农场','西山农牧场','221团','222团'] },
							{ label: '第十三师', children: ['红星一场','红星二场','红星四场','火箭农场','红山农场','黄田农场','柳树泉农场','淖毛湖农场'] },
							{ label: '第十四师', children: ['47团','皮山农场','一牧场','224团','225团'] }
						]
					},
					{
						label: '新疆维吾尔自治区',
						children: [
							{ label: '乌鲁木齐市', children: ['天山区','沙依巴克区','新市区','水磨沟区','头屯河区','达坂城区','米东区','乌鲁木齐县'] },
							{ label: '克拉玛依市', children: ['克拉玛依区','独山子区','白碱滩区','乌尔禾区'] },
							{ label: '吐鲁番市', children: ['高昌区','鄯善县','托克逊县'] },
							{ label: '哈密市', children: ['伊州区','巴里坤哈萨克自治县','伊吾县'] },
							{ label: '阿克苏地区', children: ['阿克苏市','库车市','温宿县','沙雅县','新和县','拜城县','乌什县','阿瓦提县','柯坪县'] },
							{ label: '喀什地区', children: ['喀什市','疏附县','疏勒县','英吉沙县','泽普县','莎车县','叶城县','麦盖提县','岳普湖县','伽师县','巴楚县','塔什库尔干塔吉克自治县','岑岭县'] },
							{ label: '和田地区', children: ['和田市','和田县','墨玉县','皮山县','洛浦县','策勒县','于田县','民丰县','和安县','和康县'] },
							{ label: '昌吉州', children: ['昌吉市','阜康市','呼图壁县','玛纳斯县','奇台县','吉木萨尔县','木垒哈萨克自治县'] },
							{ label: '博尔塔拉州', children: ['博乐市','阿拉山口市','精河县','温泉县'] },
							{ label: '巴音郭楞州', children: ['库尔勒市','轮台县','尉犁县','若羌县','且末县','和静县','和硕县','博湖县','焉耆回族自治县'] },
							{ label: '克孜勒苏州', children: ['阿图什市','阿克陶县','阿合奇县','乌恰县'] },
							{ label: '伊犁州', children: ['伊宁市','奎屯市','霍尔果斯市','伊宁县','霍城县','巩留县','新源县','昭苏县','特克斯县','尼勒克县','察布查尔锡伯自治县'] },
							{ label: '塔城地区', children: ['塔城市','乌苏市','沙湾市','额敏县','托里县','裕民县','和布克赛尔蒙古自治县'] },
							{ label: '阿勒泰地区', children: ['阿勒泰市','布尔津县','富蕴县','福海县','哈巴河县','青河县','吉木乃县'] },
							{ label: '石河子市', children: ['石河子市'] },
							{ label: '阿拉尔市', children: ['阿拉尔市'] },
							{ label: '图木舒克市', children: ['图木舒克市'] },
							{ label: '五家渠市', children: ['五家渠市'] },
							{ label: '北屯市', children: ['北屯市'] },
							{ label: '铁门关市', children: ['铁门关市'] },
							{ label: '双河市', children: ['双河市'] },
							{ label: '可克达拉市', children: ['可克达拉市'] },
							{ label: '昆玉市', children: ['昆玉市'] },
							{ label: '胡杨河市', children: ['胡杨河市'] },
							{ label: '新星市', children: ['新星市'] },
							{ label: '白杨市', children: ['白杨市'] },
							{ label: '草湖市', children: ['草湖市'] }
						]
					}
				]
			}
		},
		computed: {
			catList() {
				return this.regionData.map(item => ({ label: item.label }))
			},
			subList() {
				var cat = this.regionData[this.col1Index]
				if (!cat || !cat.children || !cat.children.length) return []
				return cat.children.map(c => ({ label: c.label }))
			},
			groupList() {
				var cat = this.regionData[this.col1Index]
				if (!cat || !cat.children || !cat.children.length) return []
				var sub = cat.children[this.col2Index]
				if (!sub || !sub.children || !sub.children.length) return []
				return sub.children.map(c => ({ label: typeof c === 'string' ? c : c.label }))
			}
		},
		methods: {
			onPickerChange(e) {
				var vals = e.detail.value
				this.col1Index = vals[0]
				this.col2Index = vals[1]
				this.col3Index = vals[2]
			},
			onConfirm() {
				var parts = []
				if (this.subList[this.col2Index]) {
					parts.push(this.subList[this.col2Index].label)
				}
				if (this.groupList[this.col3Index]) {
					parts.push(this.groupList[this.col3Index].label)
				}
				var label = parts.length ? parts.join('') : (this.catList[this.col1Index] ? this.catList[this.col1Index].label : '')
				this.$emit('confirm', label)
			},
			onAll() {
				this.$emit('confirm', '全部')
			},
			onCancel() {
				this.$emit('cancel')
			},
			onMaskTap() {
				this.$emit('cancel')
			},
			restoreSelection() {
				var val = this.current
				if (!val) {
					this.col1Index = 0
					this.col2Index = 0
					this.col3Index = 0
					return
				}
				var segments = val.split('-')
				var targetSub = segments[0]
				var targetGroup = segments[1] || null
				for (var i = 0; i < this.regionData.length; i++) {
					var cat = this.regionData[i]
					if (cat.label === val) {
						this.col1Index = i
						this.col2Index = 0
						this.col3Index = 0
						return
					}
					if (cat.children && cat.children.length) {
						for (var j = 0; j < cat.children.length; j++) {
							var sub = cat.children[j]
							if (sub.label === targetSub) {
								this.col1Index = i
								this.col2Index = j
								if (targetGroup && sub.children && sub.children.length) {
									for (var k = 0; k < sub.children.length; k++) {
										var child = typeof sub.children[k] === 'string' ? sub.children[k] : sub.children[k].label
										if (child === targetGroup) {
											this.col3Index = k
											return
										}
									}
								}
								this.col3Index = 0
								return
							}
						}
					}
				}
				this.col1Index = 0
				this.col2Index = 0
				this.col3Index = 0
			}
		},
		watch: {
			visible(val) {
				if (val) {
					this.$nextTick(() => {
						this.restoreSelection()
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1098;
	}

	.picker-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 1099;
		transform: translateY(100%);
		transition: transform 0.3s ease;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.picker-sheet-show {
		transform: translateY(0);
	}

	.sheet-header {
		display: flex;
		align-items: center;
		padding: 30rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.sheet-header-left,
	.sheet-header-center,
	.sheet-header-right {
		width: 33.333%;
		display: flex;
		align-items: center;
	}

	.sheet-header-left {
		justify-content: flex-start;
	}

	.sheet-header-center {
		justify-content: center;
	}

	.sheet-header-right {
		justify-content: flex-end;
	}

	.sheet-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sheet-btn {
		font-size: 32rpx;
		padding: 8rpx 16rpx;
		white-space: nowrap;
	}

	.sheet-cancel {
		color: #999;
	}

	.sheet-all {
		color: #666;
		margin-right: 16rpx;
	}

	.sheet-confirm {
		color: #3c9cff;
		font-weight: 500;
	}

	.sheet-picker {
		width: 100%;
		height: 500rpx;
	}

	.picker-item {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #333;
		line-height: 80rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>