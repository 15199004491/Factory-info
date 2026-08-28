import { userApi } from './request.js'

const pendingChecks = {}
let checkId = 0

const SENSITIVE_MSG = '内容包含违规信息，请修改'

export function debounceCheck(text, callback, delay = 1000) {
	const id = ++checkId
	pendingChecks[id] = true

	setTimeout(async () => {
		if (!pendingChecks[id]) return
		try {
			const result = await userApi.msgCheck(text)
			if (!pendingChecks[id]) return
			delete pendingChecks[id]
			if (result && result.errcode === 0) {
				callback(true, '')
			} else {
				callback(false, SENSITIVE_MSG)
			}
		} catch (e) {
			if (!pendingChecks[id]) return
			delete pendingChecks[id]
			callback(false, SENSITIVE_MSG)
		}
	}, delay)
}

export async function checkText(text) {
	try {
		const result = await userApi.msgCheck(text)
		return result && result.errcode === 0
	} catch (e) {
		return false
	}
}

export function cancelAllChecks() {
	for (const id in pendingChecks) {
		delete pendingChecks[id]
	}
}