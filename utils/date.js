export function formatDateTime(timestamp) {
	if (!timestamp) return ''
	const ts = Number(timestamp)
	const date = new Date(ts * 1000)
	const now = new Date()
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const diffDays = Math.floor((todayStart - dateStart) / (24 * 60 * 60 * 1000))
	const hh = String(date.getHours()).padStart(2, '0')
	const mm = String(date.getMinutes()).padStart(2, '0')
	const time = `${hh}:${mm}`

	if (diffDays === 0) {
		return `今天 ${time}`
	} else if (diffDays === 1) {
		return `昨天 ${time}`
	} else if (diffDays < 7) {
		const weekDays = ['日', '一', '二', '三', '四', '五', '六']
		return `周${weekDays[date.getDay()]} ${time}`
	} else {
		const m = date.getMonth() + 1
		const d = date.getDate()
		return `${m}月${d}日 ${time}`
	}
}

export function formatDate(timestamp) {
	if (!timestamp) return ''
	const ts = Number(timestamp)
	const date = new Date(ts * 1000)
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function formatUpdateTime(timestamp) {
	if (!timestamp) return ''
	const ts = Number(timestamp)
	const date = new Date(ts * 1000)
	const now = new Date()
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const diffDays = Math.floor((todayStart - dateStart) / (24 * 60 * 60 * 1000))
	const hh = String(date.getHours()).padStart(2, '0')
	const mm = String(date.getMinutes()).padStart(2, '0')
	const time = `${hh}:${mm}`

	if (diffDays === 0) {
		return `更新于 ${time}`
	} else if (diffDays === 1) {
		return `更新于 昨天 ${time}`
	} else if (diffDays === 2) {
		return `更新于 前天 ${time}`
	} else {
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate()).padStart(2, '0')
		return `更新于 ${y}-${m}-${d}`
	}
}