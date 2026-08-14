import App from './App'
import './utils/loading.js'

// #ifndef VUE3
import Vue from 'vue'
import uviewPlus from 'uview-plus'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.use(uviewPlus)
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
	return {
		app
	}
}
// #endif