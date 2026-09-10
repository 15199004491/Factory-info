import vipPayModal from '@/components/vip-pay-modal/vip-pay-modal.vue'

export default {
	components: { vipPayModal },
	data() {
		return {
			showPayModal: false,
			payLoading: false,
			payStartDate: '',
			payEndDate: '',
			payTitle: '已达发布上限',
			paySubtitle: '开通二手房和租房会员即可继续发布',
			payConfirmFn: null,
			payCancelFn: null
		}
	},
	mounted() {
		uni.$on('showVipPayModal', this.onShowPayModal)
		uni.$on('hideVipPayModal', this.onHidePayModal)
	},
	beforeDestroy() {
		uni.$off('showVipPayModal', this.onShowPayModal)
		uni.$off('hideVipPayModal', this.onHidePayModal)
	},
	methods: {
		onShowPayModal(data) {
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			if (currentPage && currentPage.$vm !== this) return
			this.payStartDate = data.startDate
			this.payEndDate = data.endDate
			this.payTitle = data.title || '已达发布上限'
			this.paySubtitle = data.subtitle || '开通二手房和租房会员即可继续发布'
			this.payConfirmFn = data.onConfirm
			this.payCancelFn = data.onCancel
			this.showPayModal = true
		},
		onHidePayModal() {
			this.showPayModal = false
			this.payLoading = false
		},
		onPayConfirm() {
			if (this.payLoading) return
			this.payLoading = true
			if (this.payConfirmFn) {
				const result = this.payConfirmFn()
				if (result && typeof result.then === 'function') {
					result.finally(() => {
						this.payLoading = false
					})
				} else {
					this.payLoading = false
				}
			}
		},
		onPayCancel() {
			this.showPayModal = false
			this.payLoading = false
			if (this.payCancelFn) this.payCancelFn()
		}
	}
}