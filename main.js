import App from './App'
import './utils/loading.js'
import submitPlugin from './utils/submit.js'
import locationPlugin from './utils/location.js'

// #ifndef VUE3
import Vue from 'vue'
import uviewPlus from 'uview-plus'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.use(uviewPlus)
Vue.use(submitPlugin)
Vue.use(locationPlugin)
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import uviewPlus from 'uview-plus'
import 'uview-plus/index.scss'
export function createApp() {
	const app = createSSRApp(App)
	app.use(uviewPlus)
	app.use(submitPlugin)
	app.use(locationPlugin)
	return {
		app
	}
}
// #endif