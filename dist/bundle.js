/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate, global) {;(function() {
"use strict"
function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
	return node
}
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i])
	}
	return children
}
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty
function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}
function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}
function execSelector(state, attrs, children) {
	var hasAttrs = false, childList, text
	var className = attrs.className || attrs.class
	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}
		for(var key in attrs) {
			if (hasOwn.call(attrs, key)) {
				newAttrs[key] = attrs[key]
			}
		}
		attrs = newAttrs
	}
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key)) {
			attrs[key] = state.attrs[key]
		}
	}
	if (className !== undefined) {
		if (attrs.class !== undefined) {
			attrs.class = undefined
			attrs.className = className
		}
		if (state.attrs.className != null) {
			attrs.className = state.attrs.className + " " + className
		}
	}
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			hasAttrs = true
			break
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		text = children[0].children
	} else {
		childList = children
	}
	return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
}
function hyperscript(selector) {
	// Because sloppy mode sucks
	var attrs = arguments[1], start = 2, children
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string") {
		var cached = selectorCache[selector] || compileSelector(selector)
	}
	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = 1
	}
	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}
	var normalized = Vnode.normalizeChildren(children)
	if (typeof selector === "string") {
		return execSelector(cached, attrs, normalized)
	} else {
		return Vnode(selector, attrs.key, attrs, normalized)
	}
}
hyperscript.trust = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
}
var m = hyperscript
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}
	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") window.Promise = PromisePolyfill
	var PromisePolyfill = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") global.Promise = PromisePolyfill
	var PromisePolyfill = global.Promise
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""
	var args = []
	for (var key0 in object) {
		destructure(key0, object[key0])
	}
	return args.join("&")
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}
var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")
var _8 = function($window, Promise) {
	var callbackCount = 0
	var oncompletion
	function setCompletionCallback(callback) {oncompletion = callback}
	function finalizer() {
		var count = 0
		function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion()}
		return function finalize(promise0) {
			var then0 = promise0.then
			promise0.then = function() {
				count++
				var next = then0.apply(promise0, arguments)
				next.then(complete, function(e) {
					complete()
					if (count === 0) throw e
				})
				return finalize(next)
			}
			return promise0
		}
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			var url = args
			args = extra || {}
			if (args.url == null) args.url = url
		}
		return args
	}
	function request(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			if (args.method == null) args.method = "GET"
			args.method = args.method.toUpperCase()
			var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)
			if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify
			if (typeof args.deserialize !== "function") args.deserialize = deserialize
			if (typeof args.extract !== "function") args.extract = extract
			args.url = interpolate(args.url, args.data)
			if (useBody) args.data = args.serialize(args.data)
			else args.url = assemble(args.url, args.data)
			var xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort
			xhr.abort = function abort() {
				aborted = true
				_abort.call(xhr)
			}
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
			if (args.serialize === JSON.stringify && useBody && !(args.headers && args.headers.hasOwnProperty("Content-Type"))) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (args.deserialize === deserialize && !(args.headers && args.headers.hasOwnProperty("Accept"))) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key])
			}
			if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) return
				if (xhr.readyState === 4) {
					try {
						var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
							resolve(cast(args.type, response))
						}
						else {
							var error = new Error(xhr.responseText)
							for (var key in response) error[key] = response[key]
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}
			if (useBody && (args.data != null)) xhr.send(args.data)
			else xhr.send()
		})
		return args.background === true ? promise0 : finalize(promise0)
	}
	function jsonp(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script)
				resolve(cast(args.type, data))
				delete $window[callbackName]
			}
			script.onerror = function() {
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
				delete $window[callbackName]
			}
			if (args.data == null) args.data = {}
			args.url = interpolate(args.url, args.data)
			args.data[args.callbackKey || "callback"] = callbackName
			script.src = assemble(args.url, args.data)
			$window.document.documentElement.appendChild(script)
		})
		return args.background === true? promise0 : finalize(promise0)
	}
	function interpolate(url, data) {
		if (data == null) return url
		var tokens = url.match(/:[^\/]+/gi) || []
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1)
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key])
			}
		}
		return url
	}
	function assemble(url, data) {
		var querystring = buildQueryString(data)
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&"
			url += prefix + querystring
		}
		return url
	}
	function deserialize(data) {
		try {return data !== "" ? JSON.parse(data) : null}
		catch (e) {throw new Error(data)}
	}
	function extract(xhr) {return xhr.responseText}
	function cast(type0, data) {
		if (typeof type0 === "function") {
			if (Array.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type0(data[i])
				}
			}
			else return new type0(data)
		}
		return data
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
}
var requestService = _8(window, PromisePolyfill)
var coreRenderer = function($window) {
	var $doc = $window.document
	var $emptyFragment = $doc.createDocumentFragment()
	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}
	var onevent
	function setEventCallback(callback) {return onevent = callback}
	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": return createText(parent, vnode, nextSibling)
				case "<": return createHTML(parent, vnode, nextSibling)
				case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
				default: return createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else return createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
		return vnode.dom
	}
	function createHTML(parent, vnode, nextSibling) {
		var match1 = vnode.children.match(/^\s*?<(\w+)/im) || []
		var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div"
		var temp = $doc.createElement(parent1)
		temp.innerHTML = vnode.children
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs2 = vnode.attrs
		var is = attrs2 && attrs2.is
		ns = getNameSpace(vnode) || ns
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns)
		}
		insertNode(parent, element, nextSibling)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				setLateAttrs(vnode)
			}
		}
		return element
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		vnode._state = vnode.state
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		initLifecycle(vnode._state, vnode, hooks)
		vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			var element = createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
			insertNode(parent, element, nextSibling)
			return element
		}
		else {
			vnode.domSize = 0
			return $emptyFragment
		}
	}
	//update
	function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null) removeNodes(old, 0, old.length, vnodes)
		else {
			if (old.length === vnodes.length) {
				var isUnkeyed = false
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null
						break
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) continue
						else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling))
						else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes)
						else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns)
					}
					return
				}
			}
			recycling = recycling || isRecyclable(old, vnodes)
			if (recycling) {
				var pool = old.pool
				old = old.concat(old.pool)
			}
			var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], v = vnodes[start]
				if (o === v && !recycling) oldStart++, start++
				else if (o == null) oldStart++
				else if (v == null) start++
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling)
					oldStart++, start++
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
				}
				else {
					var o = old[oldEnd]
					if (o === v && !recycling) oldEnd--, start++
					else if (o == null) oldEnd--
					else if (v == null) start++
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
						if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling))
						oldEnd--, start++
					}
					else break
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], v = vnodes[end]
				if (o === v && !recycling) oldEnd--, end--
				else if (o == null) oldEnd--
				else if (v == null) end--
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
					if (o.dom != null) nextSibling = o.dom
					oldEnd--, end--
				}
				else {
					if (!map) map = getKeyMap(old, oldEnd)
					if (v != null) {
						var oldIndex = map[v.key]
						if (oldIndex != null) {
							var movable = old[oldIndex]
							var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling)
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns)
							insertNode(parent, toFragment(movable), nextSibling)
							old[oldIndex].skip = true
							if (movable.dom != null) nextSibling = movable.dom
						}
						else {
							var dom = createNode(parent, v, hooks, ns, nextSibling)
							nextSibling = dom
						}
					}
					end--
				}
				if (end < start) break
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
			removeNodes(old, oldStart, oldEnd + 1, vnodes)
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode._state = old._state
			vnode.events = old.events
			if (!recycling && shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					if (recycling) {
						vnode.state = {}
						initLifecycle(vnode.attrs, vnode, hooks)
					}
					else updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, nextSibling); break
					case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, recycling, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns)
		}
		else {
			removeNode(old, null)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old)
			createHTML(parent, vnode, nextSibling)
		}
		else vnode.dom = old.dom, vnode.domSize = old.domSize
	}
	function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, recycling, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle0 multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
		}
		else {
			if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
			if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		if (recycling) {
			initComponent(vnode, hooks)
		} else {
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
			if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
			updateLifecycle(vnode._state, vnode, hooks)
		}
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(old.instance, null)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0
		for (var i = 0; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				var key2 = vnode.key
				if (key2 != null) map[key2] = i
			}
		}
		return map
	}
	function toFragment(vnode) {
		var count0 = vnode.domSize
		if (count0 != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment()
			if (count0 > 0) {
				var dom = vnode.dom
				while (--count0) fragment.appendChild(dom.nextSibling)
				fragment.insertBefore(dom, fragment.firstChild)
			}
			return fragment
		}
		else return vnode.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}
	function setContentEditable(vnode) {
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				if (vnode.skip) vnode.skip = false
				else removeNode(vnode, context)
			}
		}
	}
	function removeNode(vnode, context) {
		var expected = 1, called = 0
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
			var result = vnode._state.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		continuation()
		function continuation() {
			if (++called === expected) {
				onremove(vnode)
				if (vnode.dom) {
					var count0 = vnode.domSize || 1
					if (count0 > 1) {
						var dom = vnode.dom
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling)
						}
					}
					removeNodeFromDOM(vnode.dom)
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) context.pool = [vnode]
						else context.pool.push(vnode)
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		var parent = node.parentNode
		if (parent != null) parent.removeChild(node)
	}
	function onremove(vnode) {
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode)
		if (typeof vnode.tag !== "string") {
			if (typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode)
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (var key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns)
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		var element = vnode.dom
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) return
		var nsLastIndex = key2.indexOf(":")
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value)
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") updateEvent(vnode, key2, value)
		else if (key2 === "style") updateStyle(element, old, value)
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			if (key2 === "value") {
				var normalized0 = "" + value // eslint-disable-line no-implicit-coercion
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select") {
					if (value === null) {
						if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) return
					} else {
						if (old !== null && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
					}
				}
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old != null && vnode.dom.value === normalized0) return
			}
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
			if (vnode.tag === "input" && key2 === "type") {
				element.setAttribute(key2, value)
				return
			}
			element[key2] = value
		}
		else {
			if (typeof value === "boolean") {
				if (value) element.setAttribute(key2, "")
				else element.removeAttribute(key2)
			}
			else element.setAttribute(key2 === "className" ? "class" : key2, value)
		}
	}
	function setLateAttrs(vnode) {
		var attrs2 = vnode.attrs
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) setAttr(vnode, "value", null, attrs2.value, undefined)
			if ("selectedIndex" in attrs2) setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined)
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns)
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") key2 = "class"
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) updateEvent(vnode, key2, undefined)
					else if (key2 !== "key") vnode.dom.removeAttribute(key2)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
	}
	function isCustomElement(vnode){
		return vnode.attrs.is || vnode.tag.indexOf("-") > -1
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
	}
	//style
	function updateStyle(element, old, style) {
		if (old === style) element.style.cssText = "", old = null
		if (style == null) element.style.cssText = ""
		else if (typeof style === "string") element.style.cssText = style
		else {
			if (typeof old === "string") element.style.cssText = ""
			for (var key2 in style) {
				element.style[key2] = style[key2]
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) element.style[key2] = ""
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		var element = vnode.dom
		var callback = typeof onevent !== "function" ? value : function(e) {
			var result = value.call(element, e)
			onevent.call(element, e)
			return result
		}
		if (key2 in element) element[key2] = typeof value === "function" ? callback : null
		else {
			var eventName = key2.slice(2)
			if (vnode.events === undefined) vnode.events = {}
			if (vnode.events[key2] === callback) return
			if (vnode.events[key2] != null) element.removeEventListener(eventName, vnode.events[key2], false)
			if (typeof value === "function") {
				vnode.events[key2] = callback
				element.addEventListener(eventName, vnode.events[key2], false)
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode)
		if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		var forceVnodeUpdate, forceComponentUpdate
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old)
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old)
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
			return true
		}
		return false
	}
	function render(dom, vnodes) {
		if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = $doc.activeElement
		var namespace = dom.namespaceURI
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""
		if (!Array.isArray(vnodes)) vnodes = [vnodes]
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		dom.vnodes = vnodes
		// document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
		if (active != null && $doc.activeElement !== active) active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
	return {render: render, setEventCallback: setEventCallback}
}
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16
	var last = 0, pending = null
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
	return function() {
		var now = Date.now()
		if (last === 0 || now - last >= time) {
			last = now
			callback()
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null
				callback()
				last = Date.now()
			}, time - (now - last))
		}
	}
}
var _11 = function($window) {
	var renderService = coreRenderer($window)
	renderService.setEventCallback(function(e) {
		if (e.redraw === false) e.redraw = undefined
		else redraw()
	})
	var callbacks = []
	function subscribe(key1, callback) {
		unsubscribe(key1)
		callbacks.push(key1, throttle(callback))
	}
	function unsubscribe(key1) {
		var index = callbacks.indexOf(key1)
		if (index > -1) callbacks.splice(index, 2)
	}
	function redraw() {
		for (var i = 1; i < callbacks.length; i += 2) {
			callbacks[i]()
		}
	}
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
}
var redrawService = _11(window)
requestService.setCompletionCallback(redrawService.redraw)
var _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, [])
			redrawService0.unsubscribe(root)
			return
		}
		
		if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component))
		}
		redrawService0.subscribe(root, run0)
		redrawService0.redraw()
	}
}
m.mount = _16(redrawService)
var Promise = PromisePolyfill
var parseQueryString = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)
	var entries = string.split("&"), data0 = {}, counters = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key5 = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
		if (value === "true") value = true
		else if (value === "false") value = false
		var levels = key5.split(/\]\[?|\[/)
		var cursor = data0
		if (key5.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			var isValue = j === levels.length - 1
			if (level === "") {
				var key5 = levels.slice(0, j).join()
				if (counters[key5] == null) counters[key5] = 0
				level = counters[key5]++
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {}
			}
			cursor = cursor[level]
		}
	}
	return data0
}
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function"
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
	function normalize1(fragment0) {
		var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
		if (fragment0 === "pathname" && data[0] !== "/") data = "/" + data
		return data
	}
	var asyncId
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) return
			asyncId = callAsync0(function() {
				asyncId = null
				callback0()
			})
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?")
		var hashIndex = path.indexOf("#")
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
			for (var key4 in queryParams) queryData[key4] = queryParams[key4]
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1))
			for (var key4 in hashParams) hashData[key4] = hashParams[key4]
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"}
	router.getPath = function() {
		var type2 = router.prefix.charAt(0)
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length)
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
		}
	}
	router.setPath = function(path, data, options) {
		var queryData = {}, hashData = {}
		path = parsePath(path, queryData, hashData)
		if (data != null) {
			for (var key4 in data) queryData[key4] = data[key4]
			path = path.replace(/:([^\/]+)/g, function(match2, token) {
				delete queryData[token]
				return data[token]
			})
		}
		var query = buildQueryString(queryData)
		if (query) path += "?" + query
		var hash = buildQueryString(hashData)
		if (hash) path += "#" + hash
		if (supportsPushState) {
			var state = options ? options.state : null
			var title = options ? options.title : null
			$window.onpopstate()
			if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path)
			else $window.history.pushState(state, title, router.prefix + path)
		}
		else $window.location.href = router.prefix + path
	}
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath()
			var params = {}
			var pathname = parsePath(path, params, params)
			var state = $window.history.state
			if (state != null) {
				for (var k in state) params[k] = state[k]
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || []
						var values = [].slice.call(arguments, 1, -2)
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						}
						resolve(routes[route0], params, path, route0)
					})
					return
				}
			}
			reject(path, params)
		}
		if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute)
		else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute
		resolveRoute()
	}
	return router
}
var _20 = function($window, redrawService0) {
	var routeService = coreRouter($window)
	var identity = function(v) {return v}
	var render1, component, attrs3, currentPath, lastUpdate
	var route = function(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		var run1 = function() {
			if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)))
		}
		var bail = function(path) {
			if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true})
			else throw new Error("Could not resolve default route " + defaultRoute)
		}
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) return
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
				attrs3 = params, currentPath = path, lastUpdate = null
				render1 = (routeResolver.render || identity).bind(routeResolver)
				run1()
			}
			if (payload.view || typeof payload === "function") update({}, payload)
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved)
					}, bail)
				}
				else update(payload, "div")
			}
		}, bail)
		redrawService0.subscribe(root, run1)
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		routeService.setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = function(prefix0) {routeService.prefix = prefix0}
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href)
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
			e.preventDefault()
			e.redraw = false
			var href = this.getAttribute("href")
			if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length)
			route.set(href, undefined, undefined)
		}
	}
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") return attrs3[key3]
		return attrs3
	}
	return route
}
m.route = _20(window, redrawService)
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
	}
}
var _28 = coreRenderer(window)
m.render = _28.render
m.redraw = redrawService.redraw
m.request = requestService.request
m.jsonp = requestService.jsonp
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.version = "1.1.6"
m.vnode = Vnode
if (true) module["exports"] = m
else window.m = m
}());
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).setImmediate, __webpack_require__(3)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.smaller_than = exports.sleep = exports.collect_boolean = exports.bulmify = exports.get_classes = exports.SIZES = exports.STATES = exports.COLORS = void 0;
var COLORS = ['white', 'light', 'dark', 'black', 'link'];
exports.COLORS = COLORS;
var STATES = ['primary', 'info', 'success', 'warning', 'danger'];
exports.STATES = STATES;
var SIZES = ['small', '', 'medium', 'large'];
exports.SIZES = SIZES;

var get_classes = function get_classes(state) {
  var classes = [];
  if (state.color) classes.push('is-' + state.color);
  if (state.state) classes.push('is-' + state.state);
  if (state.size) classes.push('is-' + state.size);
  if (state.loading) classes.push('is-loading');
  if (state.hovered) classes.push('is-hovered');
  if (state.focused) classes.push('is-focused');
  return classes.join(' ');
};

exports.get_classes = get_classes;

var bulmify = function bulmify(state) {
  var classes = get_classes(state);
  var new_state = {};
  if (classes) new_state.class = classes;
  Object.keys(state).forEach(function (key) {
    if (['color', 'state', 'size', 'loading', 'icon', 'content', 'hovered', 'focused'].indexOf(key) === -1) new_state[key] = state[key];
  });
  return new_state;
};

exports.bulmify = bulmify;

var collect_boolean = function collect_boolean(state, names) {
  var styles = [];
  names.forEach(function (name) {
    if (name in state && state[name] === true) styles.push('is-' + name);
  });
};

exports.collect_boolean = collect_boolean;

var sleep = function sleep(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

exports.sleep = sleep;

var smaller_than = function smaller_than(sz) {
  return sz ? SIZES[SIZES.indexOf(sz) - 1] : 'small';
};

exports.smaller_than = smaller_than;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Icon = {
  view: function view(_ref) {
    var attrs = _ref.attrs;
    return (0, _mithril.default)('span.icon', {
      class: attrs.size ? 'is-' + attrs.size : ''
    }, (0, _mithril.default)('i.fa', {
      class: 'fa-' + attrs.icon
    }));
  }
};
exports.Icon = Icon;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pagination = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onclick = function onclick(vnode, val) {
  return function () {
    reset(vnode, val);
    if (vnode.attrs.onclick) vnode.attrs.onclick(val);
  };
};

var reset = function reset(vnode, val) {
  vnode.state.current = val;
  var max_buttons = vnode.attrs.max_buttons || 10;
  var nb = vnode.attrs.nb;

  if (nb > max_buttons) {
    var mid = nb / 2;
    if ([1, 2].includes(val)) vnode.state.buttons = [1, 2, 3, null, mid, null, nb];else if ([nb - 1, nb].includes(val)) vnode.state.buttons = [1, null, mid, null, nb - 2, nb - 1, nb];else vnode.state.buttons = [1, null, val - 1, val, val + 1, null, nb];
  } else {
    vnode.state.buttons = [];

    for (var i = 1; i <= nb; i++) {
      vnode.state.buttons.push(i);
    }
  }
};

var Pagination = {
  oninit: function oninit(vnode) {
    return reset(vnode, vnode.attrs.current || 1);
  },
  view: function view(vnode) {
    return (0, _mithril.default)('nav.pagination', (0, _mithril.default)('a.pagination-previous', {
      onclick: onclick(vnode, vnode.state.current - 1),
      disabled: vnode.state.current === 1
    }, vnode.attrs.previous_text || 'Previous'), (0, _mithril.default)('a.pagination-next', {
      onclick: onclick(vnode, vnode.state.current + 1),
      disabled: vnode.state.current === vnode.state.buttons.length
    }, vnode.attrs.next_text || 'Next'), (0, _mithril.default)('ul.pagination-list', vnode.state.buttons.map(function (val) {
      return val === null ? (0, _mithril.default)('li', (0, _mithril.default)('span.pagination-ellipsis', _mithril.default.trust('&hellip;'))) : (0, _mithril.default)('li', (0, _mithril.default)('a.pagination-link', {
        class: vnode.state.current === val ? 'is-current' : null,
        onclick: onclick(vnode, val)
      }, val));
    })));
  }
};
exports.Pagination = Pagination;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Box: true,
  Button: true,
  Icon: true,
  Label: true,
  Input: true,
  Select: true,
  TextArea: true,
  CheckBox: true,
  Radio: true,
  Image: true,
  Notification: true,
  Progress: true,
  Table: true,
  Tag: true,
  Title: true,
  SubTitle: true,
  Content: true,
  Level: true,
  LevelItem: true,
  Media: true,
  Menu: true,
  Message: true,
  Modal: true,
  Nav: true,
  Card: true,
  CardHeader: true,
  CardContent: true,
  CardFooter: true,
  CardFooterItem: true,
  Pagination: true,
  Tabs: true,
  Panel: true,
  PanelHeading: true,
  PanelTabs: true,
  PanelBlocks: true
};
Object.defineProperty(exports, "Box", {
  enumerable: true,
  get: function get() {
    return _box.Box;
  }
});
Object.defineProperty(exports, "Button", {
  enumerable: true,
  get: function get() {
    return _button.Button;
  }
});
Object.defineProperty(exports, "Icon", {
  enumerable: true,
  get: function get() {
    return _icon.Icon;
  }
});
Object.defineProperty(exports, "Label", {
  enumerable: true,
  get: function get() {
    return _form.Label;
  }
});
Object.defineProperty(exports, "Input", {
  enumerable: true,
  get: function get() {
    return _form.Input;
  }
});
Object.defineProperty(exports, "Select", {
  enumerable: true,
  get: function get() {
    return _form.Select;
  }
});
Object.defineProperty(exports, "TextArea", {
  enumerable: true,
  get: function get() {
    return _form.TextArea;
  }
});
Object.defineProperty(exports, "CheckBox", {
  enumerable: true,
  get: function get() {
    return _form.CheckBox;
  }
});
Object.defineProperty(exports, "Radio", {
  enumerable: true,
  get: function get() {
    return _form.Radio;
  }
});
Object.defineProperty(exports, "Image", {
  enumerable: true,
  get: function get() {
    return _image.Image;
  }
});
Object.defineProperty(exports, "Notification", {
  enumerable: true,
  get: function get() {
    return _notification.Notification;
  }
});
Object.defineProperty(exports, "Progress", {
  enumerable: true,
  get: function get() {
    return _progress.Progress;
  }
});
Object.defineProperty(exports, "Table", {
  enumerable: true,
  get: function get() {
    return _table.Table;
  }
});
Object.defineProperty(exports, "Tag", {
  enumerable: true,
  get: function get() {
    return _tag.Tag;
  }
});
Object.defineProperty(exports, "Title", {
  enumerable: true,
  get: function get() {
    return _title.Title;
  }
});
Object.defineProperty(exports, "SubTitle", {
  enumerable: true,
  get: function get() {
    return _title.SubTitle;
  }
});
Object.defineProperty(exports, "Content", {
  enumerable: true,
  get: function get() {
    return _content.Content;
  }
});
Object.defineProperty(exports, "Level", {
  enumerable: true,
  get: function get() {
    return _level.Level;
  }
});
Object.defineProperty(exports, "LevelItem", {
  enumerable: true,
  get: function get() {
    return _level.LevelItem;
  }
});
Object.defineProperty(exports, "Media", {
  enumerable: true,
  get: function get() {
    return _media.Media;
  }
});
Object.defineProperty(exports, "Menu", {
  enumerable: true,
  get: function get() {
    return _menu.Menu;
  }
});
Object.defineProperty(exports, "Message", {
  enumerable: true,
  get: function get() {
    return _message.Message;
  }
});
Object.defineProperty(exports, "Modal", {
  enumerable: true,
  get: function get() {
    return _modal.Modal;
  }
});
Object.defineProperty(exports, "Nav", {
  enumerable: true,
  get: function get() {
    return _nav.Nav;
  }
});
Object.defineProperty(exports, "Card", {
  enumerable: true,
  get: function get() {
    return _card.Card;
  }
});
Object.defineProperty(exports, "CardHeader", {
  enumerable: true,
  get: function get() {
    return _card.CardHeader;
  }
});
Object.defineProperty(exports, "CardContent", {
  enumerable: true,
  get: function get() {
    return _card.CardContent;
  }
});
Object.defineProperty(exports, "CardFooter", {
  enumerable: true,
  get: function get() {
    return _card.CardFooter;
  }
});
Object.defineProperty(exports, "CardFooterItem", {
  enumerable: true,
  get: function get() {
    return _card.CardFooterItem;
  }
});
Object.defineProperty(exports, "Pagination", {
  enumerable: true,
  get: function get() {
    return _pagination.Pagination;
  }
});
Object.defineProperty(exports, "Tabs", {
  enumerable: true,
  get: function get() {
    return _tabs.Tabs;
  }
});
Object.defineProperty(exports, "Panel", {
  enumerable: true,
  get: function get() {
    return _panel.Panel;
  }
});
Object.defineProperty(exports, "PanelHeading", {
  enumerable: true,
  get: function get() {
    return _panel.PanelHeading;
  }
});
Object.defineProperty(exports, "PanelTabs", {
  enumerable: true,
  get: function get() {
    return _panel.PanelTabs;
  }
});
Object.defineProperty(exports, "PanelBlocks", {
  enumerable: true,
  get: function get() {
    return _panel.PanelBlocks;
  }
});

var _box = __webpack_require__(6);

var _button = __webpack_require__(10);

var _icon = __webpack_require__(2);

var _form = __webpack_require__(11);

var _image = __webpack_require__(12);

var _notification = __webpack_require__(13);

var _progress = __webpack_require__(14);

var _table = __webpack_require__(15);

var _tag = __webpack_require__(16);

var _title = __webpack_require__(17);

var _content = __webpack_require__(18);

var _level = __webpack_require__(19);

var _media = __webpack_require__(20);

var _menu = __webpack_require__(21);

var _message = __webpack_require__(22);

var _modal = __webpack_require__(23);

var _nav = __webpack_require__(24);

var _card = __webpack_require__(25);

var _pagination = __webpack_require__(4);

var _tabs = __webpack_require__(26);

var _panel = __webpack_require__(27);

var _common = __webpack_require__(1);

Object.keys(_common).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _common[key];
    }
  });
});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Box = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Box = {
  view: function view(vnode) {
    return (0, _mithril.default)('.box', vnode.children);
  }
};
exports.Box = Box;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(8);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(9)))

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Button = exports.icon_button = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _common = __webpack_require__(1);

var _icon = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var icon_button = function icon_button(vnode) {
  return [!vnode.attrs.icon_right ? (0, _mithril.default)(_icon.Icon, {
    icon: vnode.attrs.icon,
    size: (0, _common.smaller_than)(vnode.attrs.size)
  }) : '', (0, _mithril.default)('span', vnode.attrs.content), vnode.attrs.icon_right ? (0, _mithril.default)(_icon.Icon, {
    icon: vnode.attrs.icon,
    size: (0, _common.smaller_than)(vnode.attrs.size)
  }) : ''];
};

exports.icon_button = icon_button;
var Button = {
  view: function view(vnode) {
    return (0, _mithril.default)('a.button', (0, _common.bulmify)(vnode.attrs), vnode.attrs.icon ? icon_button(vnode) : vnode.attrs.content);
  }
};
exports.Button = Button;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Radio = exports.CheckBox = exports.TextArea = exports.Select = exports.Input = exports.Label = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _icon = __webpack_require__(2);

var _common = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Label = {
  view: function view(vnode) {
    return (0, _mithril.default)('label.label', vnode.children);
  }
};
exports.Label = Label;
var Input = {
  view: function view(vnode) {
    return (0, _mithril.default)('p.control', {
      class: vnode.attrs.icon ? 'has-icon has-icon-right' : ''
    }, [(0, _mithril.default)('input.input[type=text]', (0, _common.bulmify)(vnode.attrs)), vnode.attrs.icon ? (0, _mithril.default)(_icon.Icon, {
      size: 'small',
      icon: vnode.attrs.icon
    }) : '']);
  }
};
exports.Input = Input;
var Select = {
  view: function view(vnode) {
    return (0, _mithril.default)('p.control', (0, _mithril.default)('span.select', (0, _common.bulmify)(vnode.attrs), (0, _mithril.default)('select', vnode.attrs.choices.map(function (k) {
      return (0, _mithril.default)('option', {
        value: k[0]
      }, k[1]);
    }))));
  }
};
exports.Select = Select;
var TextArea = {
  view: function view(vnode) {
    return (0, _mithril.default)("p.control", (0, _mithril.default)("textarea.textarea", (0, _common.bulmify)(vnode.attrs)));
  }
};
exports.TextArea = TextArea;
var CheckBox = {
  view: function view(vnode) {
    return (0, _mithril.default)("p.control", (0, _mithril.default)("label.checkbox", (0, _mithril.default)("input[type='checkbox']", (0, _common.bulmify)(vnode.attrs)), vnode.attrs.content));
  }
};
exports.CheckBox = CheckBox;
var Radio = {
  view: function view(vnode) {
    return (0, _mithril.default)("p.control", vnode.attrs.choices.map(function (k) {
      return (0, _mithril.default)("label.radio", (0, _mithril.default)("input[type='radio']", {
        value: k[0],
        name: vnode.attrs.name
      }), k[1]);
    }));
  }
};
exports.Radio = Radio;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Image = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Image = {
  view: function view(vnode) {
    return (0, _mithril.default)('figure.image', {
      class: vnode.attrs.size ? 'is-' + vnode.attrs.size + 'x' + vnode.attrs.size : 'is-' + vnode.attrs.ratio
    }, (0, _mithril.default)('img', {
      src: vnode.attrs.src
    }));
  }
};
exports.Image = Image;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Notification = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _common = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Notification = {
  view: function view(vnode) {
    return (0, _mithril.default)(".notification", (0, _common.bulmify)(vnode.attrs), vnode.attrs.delete ? (0, _mithril.default)("button.delete", {
      onclick: vnode.attrs.onclick
    }) : '', vnode.children);
  }
};
exports.Notification = Notification;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Progress = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _common = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Progress = {
  view: function view(vnode) {
    return (0, _mithril.default)("progress.progress", (0, _common.bulmify)(vnode.attrs), vnode.children);
  }
};
exports.Progress = Progress;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _common = __webpack_require__(1);

var _pagination = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STYLES = ['bordered', 'striped', 'narrow'];

var header_col = function header_col(vnode, item, idx) {
  var way = idx === vnode.state.sort_by ? vnode.state.sort_asc ? ' U' : ' D' : '';
  return item.name + way;
};

var th_tf = function th_tf(vnode, tag) {
  return (0, _mithril.default)(tag === 'header' ? 'thead' : 'tfoot', (0, _mithril.default)('tr', vnode.attrs[tag].map(function (item, idx) {
    return (0, _mithril.default)('th', {
      onclick: item.sortable ? sorthandler(vnode, idx) : null
    }, item.title ? (0, _mithril.default)('abbr', {
      title: item.title
    }, header_col(vnode, item, idx)) : header_col(vnode, item, idx));
  })));
};

var comparator = function comparator(idx) {
  return function (a, b) {
    if (a[idx] < b[idx]) return -1;
    if (a[idx] > b[idx]) return 1;
    return 0;
  };
};

var sorthandler = function sorthandler(vnode, idx) {
  return function () {
    if (vnode.state.sort_by === idx) vnode.state.sort_asc = !vnode.state.sort_asc;else vnode.state.sort_asc = true;
    vnode.state.sort_by = idx;
    vnode.state.rows.sort(comparator(idx));
    if (!vnode.state.sort_asc) vnode.state.rows.reverse();
  };
};

var Table = {
  oninit: function oninit(vnode) {
    vnode.state.sort_by = null;
    vnode.state.sort_asc = true;
    vnode.state.rows = vnode.attrs.rows;

    if (vnode.attrs.paginate_by) {
      vnode.state.page = 1;
      vnode.state.start_at = 0;
    } else vnode.state.display_rows = vnode.attrs.rows;
  },
  view: function view(vnode) {
    return [(0, _mithril.default)('table.table', {
      class: (0, _common.collect_boolean)(vnode.attrs, STYLES)
    }, vnode.attrs.header ? th_tf(vnode, 'header') : null, vnode.attrs.footer ? th_tf(vnode, 'footer') : null, (0, _mithril.default)('tbody', vnode.state.rows.slice(vnode.state.start_at, vnode.state.start_at + vnode.attrs.paginate_by).map(function (row) {
      return (0, _mithril.default)('tr', row.map(function (col) {
        return (0, _mithril.default)('td', col);
      }));
    }))), vnode.attrs.paginate_by ? (0, _mithril.default)(_pagination.Pagination, {
      nb: Math.ceil(vnode.state.rows.length / vnode.attrs.paginate_by),
      onclick: function onclick(nb) {
        vnode.state.page = nb;
        vnode.state.start_at = nb === 1 ? 0 : (nb - 1) * vnode.attrs.paginate_by;
      }
    }) : null];
  }
};
exports.Table = Table;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tag = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _common = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tag = {
  view: function view(vnode) {
    return (0, _mithril.default)('span.tag', (0, _common.bulmify)(vnode.attrs), vnode.children);
  }
};
exports.Tag = Tag;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubTitle = exports.Title = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Title = {
  view: function view(vnode) {
    return (0, _mithril.default)('h' + vnode.attrs.size + '.title' + '.is-' + vnode.attrs.size, vnode.children);
  }
};
exports.Title = Title;
var SubTitle = {
  view: function view(vnode) {
    return (0, _mithril.default)('h' + vnode.attrs.size + '.subtitle' + '.is-' + vnode.attrs.size, vnode.children);
  }
};
exports.SubTitle = SubTitle;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Content = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Content = {
  view: function view(vnode) {
    return (0, _mithril.default)('content', {
      class: vnode.attrs.size ? 'is-' + vnode.attrs.size : ''
    }, vnode.children);
  }
};
exports.Content = Content;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LevelItem = exports.LevelRight = exports.LevelLeft = exports.Level = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Level = {
  view: function view(vnode) {
    return (0, _mithril.default)('nav.level', {
      'is-mobile': vnode.attrs.mobile
    }, vnode.children);
  }
};
exports.Level = Level;
var LevelLeft = {
  view: function view(vnode) {
    return (0, _mithril.default)('div.level-left', vnode.children);
  }
};
exports.LevelLeft = LevelLeft;
var LevelRight = {
  view: function view(vnode) {
    return (0, _mithril.default)('div.level-right', vnode.children);
  }
};
exports.LevelRight = LevelRight;
var LevelItem = {
  view: function view(vnode) {
    return (0, _mithril.default)('p.level-item', {
      class: vnode.attrs.centered ? 'has-text-centered' : ''
    }, vnode.children);
  }
};
exports.LevelItem = LevelItem;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Media = exports.MediaRight = exports.MediaContent = exports.MediaLeft = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MediaLeft = {
  view: function view(vnode) {
    return (0, _mithril.default)('figure.media-left', vnode.children);
  }
};
exports.MediaLeft = MediaLeft;
var MediaContent = {
  view: function view(vnode) {
    return (0, _mithril.default)('div.media-content', vnode.children);
  }
};
exports.MediaContent = MediaContent;
var MediaRight = {
  view: function view(vnode) {
    return (0, _mithril.default)('div.media-right', vnode.children);
  }
};
exports.MediaRight = MediaRight;
var Media = {
  view: function view(vnode) {
    return (0, _mithril.default)('article.media', [vnode.attrs.image ? (0, _mithril.default)(MediaLeft, (0, _mithril.default)('p.image', {
      class: 'is-' + vnode.attrs.image.ratio
    }, (0, _mithril.default)('img', {
      'src': vnode.attrs.image.src
    }))) : '', (0, _mithril.default)(MediaContent, vnode.children), vnode.attrs.button ? (0, _mithril.default)(MediaRight, vnode.attrs.button) : '']);
  }
};
exports.Media = Media;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Menu = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _icon = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clickhandler = function clickhandler(global_state, item, state) {
  return function () {
    global_state.selected = item.key;
    if (global_state.collapsable && state) state.collapsed = !state.collapsed;
    if (item.onclick) item.onclick(item.key);
  };
};

var MenuItem = {
  oninit: function oninit(vnode) {
    vnode.state.collapsed = vnode.attrs.root.collapsed || false;
  },
  view: function view(vnode) {
    return [(0, _mithril.default)('a', {
      onclick: clickhandler(vnode.attrs.state, vnode.attrs.root, vnode.state),
      class: vnode.attrs.state.selected === vnode.attrs.root.key ? "is-active" : null
    }, vnode.attrs.root.label, vnode.attrs.state.collapsable ? vnode.state.collapsed ? (0, _mithril.default)(_icon.Icon, {
      icon: 'caret-up',
      size: 'small'
    }) : (0, _mithril.default)(_icon.Icon, {
      icon: 'caret-down',
      size: 'small'
    }) : null), (!vnode.attrs.state.collapsable || !vnode.state.collapsed) && vnode.attrs.root.items ? (0, _mithril.default)('ul', vnode.attrs.root.items.map(function (item) {
      return (0, _mithril.default)('li', (0, _mithril.default)('a', {
        class: vnode.attrs.state.selected === item.key ? "is-active" : null,
        onclick: clickhandler(vnode.attrs.state, item, null)
      }, item.label));
    })) : null];
  }
};
var Menu = {
  oninit: function oninit(vnode) {
    vnode.state = vnode.attrs;
    vnode.state.collapsable = vnode.attrs.collapsable || false;
    vnode.state.collapsed = vnode.attrs.collapsed || false;
  },
  view: function view(vnode) {
    return (0, _mithril.default)('aside.menu', vnode.state.items.map(function (menu) {
      return [(0, _mithril.default)('p.menu-label', {
        onclick: vnode.attrs.collapsable ? function () {
          return vnode.state.collapsed = !vnode.state.collapsed;
        } : null
      }, menu.label, vnode.state.collapsable ? vnode.state.collapsed ? (0, _mithril.default)(_icon.Icon, {
        icon: 'caret-up',
        size: 'small'
      }) : (0, _mithril.default)(_icon.Icon, {
        icon: 'caret-down',
        size: 'small'
      }) : null), !vnode.state.collapsable || !vnode.state.collapsed ? (0, _mithril.default)('ul.menu-list', menu.items.map(function (item) {
        return (0, _mithril.default)('li', (0, _mithril.default)(MenuItem, {
          state: vnode.state,
          root: item
        }));
      })) : null];
    }));
  }
};
exports.Menu = Menu;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Message = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Message = {
  view: function view(vnode) {
    return (0, _mithril.default)('article.message', {
      class: vnode.attrs.color ? 'is-' + vnode.attrs.color : ''
    }, [vnode.attrs.header ? (0, _mithril.default)('.message-header', (0, _mithril.default)('p', vnode.attrs.header), vnode.attrs.onclose ? (0, _mithril.default)('button', {
      class: 'delete',
      onclick: vnode.attrs.onclose
    }) : '') : '', (0, _mithril.default)('.message-body', vnode.children)]);
  }
};
exports.Message = Message;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modal = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modal = {
  view: function view(vnode) {
    return (0, _mithril.default)('.modal', {
      class: vnode.attrs.active ? 'is-active' : ''
    }, [(0, _mithril.default)('.modal-background'), (0, _mithril.default)('.modal-content', vnode.children), vnode.attrs.onclose ? (0, _mithril.default)('.button.modal-close', {
      onclick: vnode.attrs.onclose
    }) : '']);
  }
};
exports.Modal = Modal;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nav = exports.NavItems = exports.NavToggle = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var get_class = function get_class(vnode, item) {
  var classes = vnode.attrs.tab ? 'is-tab' : '';
  if (item.hidden) classes += ' is-hidden' + item.hidden;
  if (vnode.state.active === item.key) classes += ' is-active';
  return classes;
};

var clickhandler = function clickhandler(vnode, item) {
  return function () {
    vnode.state.active = item.key;
    if (vnode.attrs.onclick) vnode.attrs.onclick(item);
    if (item.onclick) item.onclick(item);
  };
};

var NavToggle = {
  view: function view() {
    return (0, _mithril.default)('span.nav-toggle', (0, _mithril.default)('span'), (0, _mithril.default)('span'), (0, _mithril.default)('span'));
  }
};
exports.NavToggle = NavToggle;
var NavItems = {
  oninit: function oninit(vnode) {
    return vnode.state.active = vnode.attrs.active;
  },
  view: function view(vnode) {
    return vnode.attrs.items.map(function (item) {
      return (0, _mithril.default)('a.nav-item', {
        class: get_class(vnode, item),
        onclick: clickhandler(item)
      }, item.content);
    });
  }
};
exports.NavItems = NavItems;
var Nav = {
  view: function view(vnode) {
    return (0, _mithril.default)('nav.nav', {
      class: vnode.attrs.shadow ? 'has-shadow' : null
    }, [vnode.attrs.left ? (0, _mithril.default)('.nav-left', vnode.attrs.left.map(function (item) {
      return (0, _mithril.default)('a.nav-item', item);
    })) : null, vnode.attrs.center ? (0, _mithril.default)('.nav-center', vnode.attrs.center.map(function (item) {
      return (0, _mithril.default)('a.nav-item', item);
    })) : null, vnode.attrs.right ? (0, _mithril.default)('.nav-right', vnode.attrs.right.map(function (item) {
      return (0, _mithril.default)('a.nav-item', item);
    })) : null]);
  }
};
exports.Nav = Nav;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Card = exports.CardContent = exports.CardFooterItem = exports.CardFooter = exports.CardHeader = exports.CardImage = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _icon = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CardImage = {
  view: function view(vnode) {
    return (0, _mithril.default)('card-image', (0, _mithril.default)('figure.image', {
      class: 'is-' + vnode.attrs.ratio
    }, (0, _mithril.default)('img', {
      src: vnode.attrs.src
    })));
  }
};
exports.CardImage = CardImage;
var CardHeader = {
  view: function view(vnode) {
    return (0, _mithril.default)('header.card-header', [(0, _mithril.default)('p.card-header-title', vnode.attrs.title), (0, _mithril.default)('a.card-header-icon', vnode.attrs.icon)]);
  }
};
exports.CardHeader = CardHeader;
var CardFooter = {
  view: function view(vnode) {
    return (0, _mithril.default)('footer.card-footer', vnode.children);
  }
};
exports.CardFooter = CardFooter;
var CardFooterItem = {
  view: function view(vnode) {
    return (0, _mithril.default)('a.card-footer-item', vnode.attrs);
  }
};
exports.CardFooterItem = CardFooterItem;
var CardContent = {
  view: function view(vnode) {
    return (0, _mithril.default)('.card-content', vnode.children);
  }
};
exports.CardContent = CardContent;
var Card = {
  view: function view(vnode) {
    return (0, _mithril.default)('.card', vnode.children);
  }
};
exports.Card = Card;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tabs = exports.TabsMenu = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _icon = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onclick = function onclick(vnode, item, idx) {
  return function () {
    vnode.state.active = idx;
    if (vnode.attrs.onclick) vnode.attrs.onclick(item);
  };
};

var TabsMenu = {
  oninit: function oninit(vnode) {
    return vnode.state.active = vnode.attrs.active || 0;
  },
  view: function view(vnode) {
    return (0, _mithril.default)('.tabs', (0, _mithril.default)('ul', vnode.attrs.items.map(function (item, idx) {
      return (0, _mithril.default)('li', {
        class: idx === vnode.state.active ? 'is-active' : null,
        onclick: onclick(vnode, item, idx)
      }, (0, _mithril.default)('a', item.icon ? [(0, _mithril.default)('span.icon.is-small', (0, _mithril.default)('i.fa', {
        class: 'fa-' + item.icon
      })), (0, _mithril.default)('span', item.label)] : item.label));
    })));
  }
};
exports.TabsMenu = TabsMenu;

var clickhandler = function clickhandler(vnode) {
  return function (item) {
    return vnode.state.active = item.key;
  };
};

var Tabs = {
  oninit: function oninit(vnode) {
    vnode.state.active = vnode.attrs.active || 0;
    vnode.state.items = vnode.attrs.items.map(function (item, idx) {
      item.key = idx;
      return item;
    });
  },
  view: function view(vnode) {
    return (0, _mithril.default)('div', {
      style: {
        display: 'flex',
        flex: '1',
        width: '100%',
        'flex-direction': 'column'
      }
    }, [(0, _mithril.default)(TabsMenu, {
      active: vnode.state.active,
      onclick: clickhandler(vnode),
      items: vnode.state.items
    }), vnode.state.items.map(function (item) {
      return (0, _mithril.default)('div', {
        style: {
          display: item.key === vnode.state.active ? 'block' : 'none',
          'margin-left': '10px'
        }
      }, item.content);
    })]);
  }
};
exports.Tabs = Tabs;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelBlocks = exports.PanelBlock = exports.PanelTabs = exports.PanelHeading = exports.Panel = void 0;

var _mithril = _interopRequireDefault(__webpack_require__(0));

var _icon = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onclick = function onclick(vnode, item, idx) {
  return function () {
    if (vnode.state.active === idx) vnode.state.active = null;else vnode.state.active = idx;
    if (vnode.attrs.onclick) vnode.attrs.onclick(item);
  };
};

var Panel = {
  view: function view(vnode) {
    return (0, _mithril.default)('nav.panel', vnode.children);
  }
};
exports.Panel = Panel;
var PanelHeading = {
  view: function view(vnode) {
    return (0, _mithril.default)('p.panel-heading', vnode.children);
  }
};
exports.PanelHeading = PanelHeading;
var PanelTabs = {
  oninit: function oninit(vnode) {
    return vnode.state.active = vnode.attrs.active || null;
  },
  view: function view(vnode) {
    return (0, _mithril.default)('.panel-tabs', vnode.attrs.items.map(function (item, idx) {
      return (0, _mithril.default)('a', {
        class: idx === vnode.state.active ? 'is-active' : null,
        onclick: onclick(vnode, item, idx)
      }, item.label);
    }));
  }
};
exports.PanelTabs = PanelTabs;
var PanelBlock = {
  view: function view(vnode) {
    return (0, _mithril.default)('.panel-block', vnode.children);
  }
};
exports.PanelBlock = PanelBlock;
var PanelBlocks = {
  oninit: function oninit(vnode) {
    return vnode.state.active = vnode.attrs.active || null;
  },
  view: function view(vnode) {
    return vnode.attrs.items.map(function (item, idx) {
      return (0, _mithril.default)('a.panel-block', {
        class: idx === vnode.state.active ? 'is-active' : null,
        onclick: onclick(vnode, item, idx)
      }, [(0, _mithril.default)('span.panel-icon', (0, _mithril.default)('i.fa', {
        class: 'fa-' + item.icon
      })), item.label]);
    });
  }
};
exports.PanelBlocks = PanelBlocks;

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODc2OWE3NTA3M2Y0ZmExM2QxZDIiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21pdGhyaWwvbWl0aHJpbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9lbGVtZW50cy9pY29uLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvcGFnaW5hdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2VsZW1lbnRzL2JveC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc2V0aW1tZWRpYXRlL3NldEltbWVkaWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uL3NyYy9lbGVtZW50cy9idXR0b24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2VsZW1lbnRzL2Zvcm0uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2VsZW1lbnRzL2ltYWdlLmpzIiwid2VicGFjazovLy8uL3NyYy9lbGVtZW50cy9ub3RpZmljYXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2VsZW1lbnRzL3Byb2dyZXNzLmpzIiwid2VicGFjazovLy8uL3NyYy9lbGVtZW50cy90YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZWxlbWVudHMvdGFnLmpzIiwid2VicGFjazovLy8uL3NyYy9lbGVtZW50cy90aXRsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZWxlbWVudHMvY29udGVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9sZXZlbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tZWRpYS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9tZW51LmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL21lc3NhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbW9kYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvbmF2LmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL2NhcmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvdGFicy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9wYW5lbC5qcyJdLCJuYW1lcyI6WyJDT0xPUlMiLCJTVEFURVMiLCJTSVpFUyIsImdldF9jbGFzc2VzIiwic3RhdGUiLCJjbGFzc2VzIiwiY29sb3IiLCJwdXNoIiwic2l6ZSIsImxvYWRpbmciLCJob3ZlcmVkIiwiZm9jdXNlZCIsImpvaW4iLCJidWxtaWZ5IiwibmV3X3N0YXRlIiwiY2xhc3MiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImluZGV4T2YiLCJrZXkiLCJjb2xsZWN0X2Jvb2xlYW4iLCJuYW1lcyIsInN0eWxlcyIsIm5hbWUiLCJzbGVlcCIsInRpbWUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJzbWFsbGVyX3RoYW4iLCJzeiIsIkljb24iLCJ2aWV3IiwiYXR0cnMiLCJpY29uIiwib25jbGljayIsInZub2RlIiwidmFsIiwicmVzZXQiLCJjdXJyZW50IiwibWF4X2J1dHRvbnMiLCJuYiIsIm1pZCIsImluY2x1ZGVzIiwiYnV0dG9ucyIsImkiLCJQYWdpbmF0aW9uIiwib25pbml0IiwiZGlzYWJsZWQiLCJwcmV2aW91c190ZXh0IiwibGVuZ3RoIiwibmV4dF90ZXh0IiwibWFwIiwidHJ1c3QiLCJCb3giLCJjaGlsZHJlbiIsImljb25fYnV0dG9uIiwiaWNvbl9yaWdodCIsImNvbnRlbnQiLCJCdXR0b24iLCJMYWJlbCIsIklucHV0IiwiU2VsZWN0IiwiY2hvaWNlcyIsInZhbHVlIiwiayIsIlRleHRBcmVhIiwiQ2hlY2tCb3giLCJSYWRpbyIsIkltYWdlIiwicmF0aW8iLCJzcmMiLCJOb3RpZmljYXRpb24iLCJkZWxldGUiLCJQcm9ncmVzcyIsIlNUWUxFUyIsImhlYWRlcl9jb2wiLCJpdGVtIiwiaWR4Iiwid2F5Iiwic29ydF9ieSIsInNvcnRfYXNjIiwidGhfdGYiLCJ0YWciLCJzb3J0YWJsZSIsInNvcnRoYW5kbGVyIiwidGl0bGUiLCJjb21wYXJhdG9yIiwiYSIsImIiLCJyb3dzIiwic29ydCIsInJldmVyc2UiLCJUYWJsZSIsInBhZ2luYXRlX2J5IiwicGFnZSIsInN0YXJ0X2F0IiwiZGlzcGxheV9yb3dzIiwiaGVhZGVyIiwiZm9vdGVyIiwic2xpY2UiLCJyb3ciLCJjb2wiLCJNYXRoIiwiY2VpbCIsIlRhZyIsIlRpdGxlIiwiU3ViVGl0bGUiLCJDb250ZW50IiwiTGV2ZWwiLCJtb2JpbGUiLCJMZXZlbExlZnQiLCJMZXZlbFJpZ2h0IiwiTGV2ZWxJdGVtIiwiY2VudGVyZWQiLCJNZWRpYUxlZnQiLCJNZWRpYUNvbnRlbnQiLCJNZWRpYVJpZ2h0IiwiTWVkaWEiLCJpbWFnZSIsImJ1dHRvbiIsImNsaWNraGFuZGxlciIsImdsb2JhbF9zdGF0ZSIsInNlbGVjdGVkIiwiY29sbGFwc2FibGUiLCJjb2xsYXBzZWQiLCJNZW51SXRlbSIsInJvb3QiLCJsYWJlbCIsIml0ZW1zIiwiTWVudSIsIm1lbnUiLCJNZXNzYWdlIiwib25jbG9zZSIsIk1vZGFsIiwiYWN0aXZlIiwiZ2V0X2NsYXNzIiwidGFiIiwiaGlkZGVuIiwiTmF2VG9nZ2xlIiwiTmF2SXRlbXMiLCJOYXYiLCJzaGFkb3ciLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJDYXJkSW1hZ2UiLCJDYXJkSGVhZGVyIiwiQ2FyZEZvb3RlciIsIkNhcmRGb290ZXJJdGVtIiwiQ2FyZENvbnRlbnQiLCJDYXJkIiwiVGFic01lbnUiLCJUYWJzIiwic3R5bGUiLCJkaXNwbGF5IiwiZmxleCIsIndpZHRoIiwiUGFu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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEMsMkRBQTJEO0FBQzNELHFGQUFxRjtBQUNyRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixxQkFBcUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsaUJBQWlCLFNBQVM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLG1CQUFtQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0SEFBNEg7QUFDNUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLG1CQUFtQixxQkFBcUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixzQkFBc0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQ0FBMEMsc0JBQXNCLEVBQUU7QUFDbEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFVBQVU7QUFDVjtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7O0FDekxEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFVBQVU7Ozs7Ozs7Ozs7Ozs7OztBQ3ZMdEM7O0FBQ0E7O0FBQ0E7Ozs7QUFFTyxJQUFNQyxjQUFjLFNBQWRBLFdBQWMsQ0FBQ3BCLEtBQUQ7QUFBQSxTQUFXLENBQ2xDLENBQUNBLE1BQU1ILEtBQU4sQ0FBWXdCLFVBQWIs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c0JBQUUsR0FBRixFQUNJO0FBQ0loRSxlQUFPZ0UsUUFBUTFDLE1BQU1qQyxLQUFOLENBQVlvSSxNQUFwQixHQUE2QixXQUE3QixHQUEyQyxJQUR0RDtBQUVJcEcsaUJBQVNBLFFBQVFDLEtBQVIsRUFBZXlDLElBQWYsRUFBcUJDLEdBQXJCO0FBRmIsT0FESixFQUlPRCxLQUFLbUQsS0FKWixDQURrQjtBQUFBLEtBQXRCLENBRFcsQ0FBVDtBQUFBO0FBSGUsQ0FBbEI7O0FBZUEsSUFBTWlDLGFBQWE7QUFDdEJqSSxRQUFNO0FBQUEsV0FBUyxzQkFBRSxjQUFGLEVBQWtCSSxNQUFNbUIsUUFBeEIsQ0FBVDtBQUFBO0FBRGdCLENBQW5COztBQUlBLElBQU0yRyxjQUFjO0FBQ3ZCbkgsVUFBUTtBQUFBLFdBQVNYLE1BQU1qQyxLQUFOLENBQVlvSSxNQUFaLEdBQXFCbkcsTUFBTUgsS0FBTixDQUFZc0csTUFBWixJQUFzQixJQUFwRDtBQUFBLEdBRGU7QUFHdkJ2RyxRQUFNO0FBQUEsV0FBU0ksTUFBTUgsS0FBTixDQUFZZ0csS0FBWixDQUFrQjdFLEdBQWxCLENBQXNCLFVBQUN5QixJQUFELEVBQU9DLEdBQVA7QUFBQSxhQUNqQyxzQkFBRSxlQUFGLEVBQW1CO0FBQ1hoRSxlQUFPZ0UsUUFBUTFDLE1BQU1qQyxLQUFOLENBQVlvSSxNQUFwQixHQUE2QixXQUE3QixHQUEyQyxJQUR2QztBQUVYcEcsaUJBQVNBLFFBQVFDLEtBQVIsRUFBZXlDLElBQWYsRUFBcUJDLEdBQXJCO0FBRkUsT0FBbkIsRUFHTyxDQUNILHNCQUFFLGlCQUFGLEVBQXFCLHNCQUFFLE1BQUYsRUFBVTtBQUFDaEUsZUFBTyxRQUFRK0QsS0FBSzNDO0FBQXJCLE9BQVYsQ0FBckIsQ0FERyxFQUVIMkMsS0FBS21ELEtBRkYsQ0FIUCxDQURpQztBQUFBLEtBQXRCLENBQVQ7QUFBQTtBQUhpQixDQUFwQiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA4NzY5YTc1MDczZjRmYTEzZDFkMiIsIjsoZnVuY3Rpb24oKSB7XG5cInVzZSBzdHJpY3RcIlxuZnVuY3Rpb24gVm5vZGUodGFnLCBrZXksIGF0dHJzMCwgY2hpbGRyZW4sIHRleHQsIGRvbSkge1xuXHRyZXR1cm4ge3RhZzogdGFnLCBrZXk6IGtleSwgYXR0cnM6IGF0dHJzMCwgY2hpbGRyZW46IGNoaWxkcmVuLCB0ZXh0OiB0ZXh0LCBkb206IGRvbSwgZG9tU2l6ZTogdW5kZWZpbmVkLCBzdGF0ZTogdW5kZWZpbmVkLCBfc3RhdGU6IHVuZGVmaW5lZCwgZXZlbnRzOiB1bmRlZmluZWQsIGluc3RhbmNlOiB1bmRlZmluZWQsIHNraXA6IGZhbHNlfVxufVxuVm5vZGUubm9ybWFsaXplID0gZnVuY3Rpb24obm9kZSkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShub2RlKSkgcmV0dXJuIFZub2RlKFwiW1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4obm9kZSksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxuXHRpZiAobm9kZSAhPSBudWxsICYmIHR5cGVvZiBub2RlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBub2RlID09PSBmYWxzZSA/IFwiXCIgOiBub2RlLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0cmV0dXJuIG5vZGVcbn1cblZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuID0gZnVuY3Rpb24gbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdGNoaWxkcmVuW2ldID0gVm5vZGUubm9ybWFsaXplKGNoaWxkcmVuW2ldKVxuXHR9XG5cdHJldHVybiBjaGlsZHJlblxufVxudmFyIHNlbGVjdG9yUGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsoLis/KSg/Olxccyo9XFxzKihcInwnfCkoKD86XFxcXFtcIidcXF1dfC4pKj8pXFw1KT9cXF0pL2dcbnZhciBzZWxlY3RvckNhY2hlID0ge31cbnZhciBoYXNPd24gPSB7fS5oYXNPd25Qcm9wZXJ0eVxuZnVuY3Rpb24gaXNFbXB0eShvYmplY3QpIHtcblx0Zm9yICh2YXIga2V5IGluIG9iamVjdCkgaWYgKGhhc093bi5jYWxsKG9iamVjdCwga2V5KSkgcmV0dXJuIGZhbHNlXG5cdHJldHVybiB0cnVlXG59XG5mdW5jdGlvbiBjb21waWxlU2VsZWN0b3Ioc2VsZWN0b3IpIHtcblx0dmFyIG1hdGNoLCB0YWcgPSBcImRpdlwiLCBjbGFzc2VzID0gW10sIGF0dHJzID0ge31cblx0d2hpbGUgKG1hdGNoID0gc2VsZWN0b3JQYXJzZXIuZXhlYyhzZWxlY3RvcikpIHtcblx0XHR2YXIgdHlwZSA9IG1hdGNoWzFdLCB2YWx1ZSA9IG1hdGNoWzJdXG5cdFx0aWYgKHR5cGUgPT09IFwiXCIgJiYgdmFsdWUgIT09IFwiXCIpIHRhZyA9IHZhbHVlXG5cdFx0ZWxzZSBpZiAodHlwZSA9PT0gXCIjXCIpIGF0dHJzLmlkID0gdmFsdWVcblx0XHRlbHNlIGlmICh0eXBlID09PSBcIi5cIikgY2xhc3Nlcy5wdXNoKHZhbHVlKVxuXHRcdGVsc2UgaWYgKG1hdGNoWzNdWzBdID09PSBcIltcIikge1xuXHRcdFx0dmFyIGF0dHJWYWx1ZSA9IG1hdGNoWzZdXG5cdFx0XHRpZiAoYXR0clZhbHVlKSBhdHRyVmFsdWUgPSBhdHRyVmFsdWUucmVwbGFjZSgvXFxcXChbXCInXSkvZywgXCIkMVwiKS5yZXBsYWNlKC9cXFxcXFxcXC9nLCBcIlxcXFxcIilcblx0XHRcdGlmIChtYXRjaFs0XSA9PT0gXCJjbGFzc1wiKSBjbGFzc2VzLnB1c2goYXR0clZhbHVlKVxuXHRcdFx0ZWxzZSBhdHRyc1ttYXRjaFs0XV0gPSBhdHRyVmFsdWUgPT09IFwiXCIgPyBhdHRyVmFsdWUgOiBhdHRyVmFsdWUgfHwgdHJ1ZVxuXHRcdH1cblx0fVxuXHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBhdHRycy5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdHJldHVybiBzZWxlY3RvckNhY2hlW3NlbGVjdG9yXSA9IHt0YWc6IHRhZywgYXR0cnM6IGF0dHJzfVxufVxuZnVuY3Rpb24gZXhlY1NlbGVjdG9yKHN0YXRlLCBhdHRycywgY2hpbGRyZW4pIHtcblx0dmFyIGhhc0F0dHJzID0gZmFsc2UsIGNoaWxkTGlzdCwgdGV4dFxuXHR2YXIgY2xhc3NOYW1lID0gYXR0cnMuY2xhc3NOYW1lIHx8IGF0dHJzLmNsYXNzXG5cdGlmICghaXNFbXB0eShzdGF0ZS5hdHRycykgJiYgIWlzRW1wdHkoYXR0cnMpKSB7XG5cdFx0dmFyIG5ld0F0dHJzID0ge31cblx0XHRmb3IodmFyIGtleSBpbiBhdHRycykge1xuXHRcdFx0aWYgKGhhc093bi5jYWxsKGF0dHJzLCBrZXkpKSB7XG5cdFx0XHRcdG5ld0F0dHJzW2tleV0gPSBhdHRyc1trZXldXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGF0dHJzID0gbmV3QXR0cnNcblx0fVxuXHRmb3IgKHZhciBrZXkgaW4gc3RhdGUuYXR0cnMpIHtcblx0XHRpZiAoaGFzT3duLmNhbGwoc3RhdGUuYXR0cnMsIGtleSkpIHtcblx0XHRcdGF0dHJzW2tleV0gPSBzdGF0ZS5hdHRyc1trZXldXG5cdFx0fVxuXHR9XG5cdGlmIChjbGFzc05hbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChhdHRycy5jbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRhdHRycy5jbGFzcyA9IHVuZGVmaW5lZFxuXHRcdFx0YXR0cnMuY2xhc3NOYW1lID0gY2xhc3NOYW1lXG5cdFx0fVxuXHRcdGlmIChzdGF0ZS5hdHRycy5jbGFzc05hbWUgIT0gbnVsbCkge1xuXHRcdFx0YXR0cnMuY2xhc3NOYW1lID0gc3RhdGUuYXR0cnMuY2xhc3NOYW1lICsgXCIgXCIgKyBjbGFzc05hbWVcblx0XHR9XG5cdH1cblx0Zm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG5cdFx0aWYgKGhhc093bi5jYWxsKGF0dHJzLCBrZXkpICYmIGtleSAhPT0gXCJrZXlcIikge1xuXHRcdFx0aGFzQXR0cnMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdICE9IG51bGwgJiYgY2hpbGRyZW5bMF0udGFnID09PSBcIiNcIikge1xuXHRcdHRleHQgPSBjaGlsZHJlblswXS5jaGlsZHJlblxuXHR9IGVsc2Uge1xuXHRcdGNoaWxkTGlzdCA9IGNoaWxkcmVuXG5cdH1cblx0cmV0dXJuIFZub2RlKHN0YXRlLnRhZywgYXR0cnMua2V5LCBoYXNBdHRycyA/IGF0dHJzIDogdW5kZWZpbmVkLCBjaGlsZExpc3QsIHRleHQpXG59XG5mdW5jdGlvbiBoeXBlcnNjcmlwdChzZWxlY3Rvcikge1xuXHQvLyBCZWNhdXNlIHNsb3BweSBtb2RlIHN1Y2tzXG5cdHZhciBhdHRycyA9IGFyZ3VtZW50c1sxXSwgc3RhcnQgPSAyLCBjaGlsZHJlblxuXHRpZiAoc2VsZWN0b3IgPT0gbnVsbCB8fCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHNlbGVjdG9yICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHNlbGVjdG9yLnZpZXcgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHRocm93IEVycm9yKFwiVGhlIHNlbGVjdG9yIG11c3QgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGEgY29tcG9uZW50LlwiKTtcblx0fVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG5cdFx0dmFyIGNhY2hlZCA9IHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdIHx8IGNvbXBpbGVTZWxlY3RvcihzZWxlY3Rvcilcblx0fVxuXHRpZiAoYXR0cnMgPT0gbnVsbCkge1xuXHRcdGF0dHJzID0ge31cblx0fSBlbHNlIGlmICh0eXBlb2YgYXR0cnMgIT09IFwib2JqZWN0XCIgfHwgYXR0cnMudGFnICE9IG51bGwgfHwgQXJyYXkuaXNBcnJheShhdHRycykpIHtcblx0XHRhdHRycyA9IHt9XG5cdFx0c3RhcnQgPSAxXG5cdH1cblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IHN0YXJ0ICsgMSkge1xuXHRcdGNoaWxkcmVuID0gYXJndW1lbnRzW3N0YXJ0XVxuXHRcdGlmICghQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIGNoaWxkcmVuID0gW2NoaWxkcmVuXVxuXHR9IGVsc2Uge1xuXHRcdGNoaWxkcmVuID0gW11cblx0XHR3aGlsZSAoc3RhcnQgPCBhcmd1bWVudHMubGVuZ3RoKSBjaGlsZHJlbi5wdXNoKGFyZ3VtZW50c1tzdGFydCsrXSlcblx0fVxuXHR2YXIgbm9ybWFsaXplZCA9IFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIGV4ZWNTZWxlY3RvcihjYWNoZWQsIGF0dHJzLCBub3JtYWxpemVkKVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBWbm9kZShzZWxlY3RvciwgYXR0cnMua2V5LCBhdHRycywgbm9ybWFsaXplZClcblx0fVxufVxuaHlwZXJzY3JpcHQudHJ1c3QgPSBmdW5jdGlvbihodG1sKSB7XG5cdGlmIChodG1sID09IG51bGwpIGh0bWwgPSBcIlwiXG5cdHJldHVybiBWbm9kZShcIjxcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGh0bWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuaHlwZXJzY3JpcHQuZnJhZ21lbnQgPSBmdW5jdGlvbihhdHRyczEsIGNoaWxkcmVuKSB7XG5cdHJldHVybiBWbm9kZShcIltcIiwgYXR0cnMxLmtleSwgYXR0cnMxLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbiksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxudmFyIG0gPSBoeXBlcnNjcmlwdFxuLyoqIEBjb25zdHJ1Y3RvciAqL1xudmFyIFByb21pc2VQb2x5ZmlsbCA9IGZ1bmN0aW9uKGV4ZWN1dG9yKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpKSB0aHJvdyBuZXcgRXJyb3IoXCJQcm9taXNlIG11c3QgYmUgY2FsbGVkIHdpdGggYG5ld2BcIilcblx0aWYgKHR5cGVvZiBleGVjdXRvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpXG5cdHZhciBzZWxmID0gdGhpcywgcmVzb2x2ZXJzID0gW10sIHJlamVjdG9ycyA9IFtdLCByZXNvbHZlQ3VycmVudCA9IGhhbmRsZXIocmVzb2x2ZXJzLCB0cnVlKSwgcmVqZWN0Q3VycmVudCA9IGhhbmRsZXIocmVqZWN0b3JzLCBmYWxzZSlcblx0dmFyIGluc3RhbmNlID0gc2VsZi5faW5zdGFuY2UgPSB7cmVzb2x2ZXJzOiByZXNvbHZlcnMsIHJlamVjdG9yczogcmVqZWN0b3JzfVxuXHR2YXIgY2FsbEFzeW5jID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogc2V0VGltZW91dFxuXHRmdW5jdGlvbiBoYW5kbGVyKGxpc3QsIHNob3VsZEFic29yYikge1xuXHRcdHJldHVybiBmdW5jdGlvbiBleGVjdXRlKHZhbHVlKSB7XG5cdFx0XHR2YXIgdGhlblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKHNob3VsZEFic29yYiAmJiB2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpICYmIHR5cGVvZiAodGhlbiA9IHZhbHVlLnRoZW4pID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlIGNhbid0IGJlIHJlc29sdmVkIHcvIGl0c2VsZlwiKVxuXHRcdFx0XHRcdGV4ZWN1dGVPbmNlKHRoZW4uYmluZCh2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2FsbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFzaG91bGRBYnNvcmIgJiYgbGlzdC5sZW5ndGggPT09IDApIGNvbnNvbGUuZXJyb3IoXCJQb3NzaWJsZSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246XCIsIHZhbHVlKVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSBsaXN0W2ldKHZhbHVlKVxuXHRcdFx0XHRcdFx0cmVzb2x2ZXJzLmxlbmd0aCA9IDAsIHJlamVjdG9ycy5sZW5ndGggPSAwXG5cdFx0XHRcdFx0XHRpbnN0YW5jZS5zdGF0ZSA9IHNob3VsZEFic29yYlxuXHRcdFx0XHRcdFx0aW5zdGFuY2UucmV0cnkgPSBmdW5jdGlvbigpIHtleGVjdXRlKHZhbHVlKX1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3RDdXJyZW50KGUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGV4ZWN1dGVPbmNlKHRoZW4pIHtcblx0XHR2YXIgcnVucyA9IDBcblx0XHRmdW5jdGlvbiBydW4oZm4pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZiAocnVucysrID4gMCkgcmV0dXJuXG5cdFx0XHRcdGZuKHZhbHVlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgb25lcnJvciA9IHJ1bihyZWplY3RDdXJyZW50KVxuXHRcdHRyeSB7dGhlbihydW4ocmVzb2x2ZUN1cnJlbnQpLCBvbmVycm9yKX0gY2F0Y2ggKGUpIHtvbmVycm9yKGUpfVxuXHR9XG5cdGV4ZWN1dGVPbmNlKGV4ZWN1dG9yKVxufVxuUHJvbWlzZVBvbHlmaWxsLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0aW9uKSB7XG5cdHZhciBzZWxmID0gdGhpcywgaW5zdGFuY2UgPSBzZWxmLl9pbnN0YW5jZVxuXHRmdW5jdGlvbiBoYW5kbGUoY2FsbGJhY2ssIGxpc3QsIG5leHQsIHN0YXRlKSB7XG5cdFx0bGlzdC5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIG5leHQodmFsdWUpXG5cdFx0XHRlbHNlIHRyeSB7cmVzb2x2ZU5leHQoY2FsbGJhY2sodmFsdWUpKX0gY2F0Y2ggKGUpIHtpZiAocmVqZWN0TmV4dCkgcmVqZWN0TmV4dChlKX1cblx0XHR9KVxuXHRcdGlmICh0eXBlb2YgaW5zdGFuY2UucmV0cnkgPT09IFwiZnVuY3Rpb25cIiAmJiBzdGF0ZSA9PT0gaW5zdGFuY2Uuc3RhdGUpIGluc3RhbmNlLnJldHJ5KClcblx0fVxuXHR2YXIgcmVzb2x2ZU5leHQsIHJlamVjdE5leHRcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3Jlc29sdmVOZXh0ID0gcmVzb2x2ZSwgcmVqZWN0TmV4dCA9IHJlamVjdH0pXG5cdGhhbmRsZShvbkZ1bGZpbGxlZCwgaW5zdGFuY2UucmVzb2x2ZXJzLCByZXNvbHZlTmV4dCwgdHJ1ZSksIGhhbmRsZShvblJlamVjdGlvbiwgaW5zdGFuY2UucmVqZWN0b3JzLCByZWplY3ROZXh0LCBmYWxzZSlcblx0cmV0dXJuIHByb21pc2Vcbn1cblByb21pc2VQb2x5ZmlsbC5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbihvblJlamVjdGlvbikge1xuXHRyZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpIHJldHVybiB2YWx1ZVxuXHRyZXR1cm4gbmV3IFByb21pc2VQb2x5ZmlsbChmdW5jdGlvbihyZXNvbHZlKSB7cmVzb2x2ZSh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3JlamVjdCh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLmFsbCA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0dmFyIHRvdGFsID0gbGlzdC5sZW5ndGgsIGNvdW50ID0gMCwgdmFsdWVzID0gW11cblx0XHRpZiAobGlzdC5sZW5ndGggPT09IDApIHJlc29sdmUoW10pXG5cdFx0ZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdChmdW5jdGlvbihpKSB7XG5cdFx0XHRcdGZ1bmN0aW9uIGNvbnN1bWUodmFsdWUpIHtcblx0XHRcdFx0XHRjb3VudCsrXG5cdFx0XHRcdFx0dmFsdWVzW2ldID0gdmFsdWVcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IHRvdGFsKSByZXNvbHZlKHZhbHVlcylcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobGlzdFtpXSAhPSBudWxsICYmICh0eXBlb2YgbGlzdFtpXSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgbGlzdFtpXSA9PT0gXCJmdW5jdGlvblwiKSAmJiB0eXBlb2YgbGlzdFtpXS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRsaXN0W2ldLnRoZW4oY29uc3VtZSwgcmVqZWN0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgY29uc3VtZShsaXN0W2ldKVxuXHRcdFx0fSkoaSlcblx0XHR9XG5cdH0pXG59XG5Qcm9taXNlUG9seWZpbGwucmFjZSA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaXN0W2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuXHRcdH1cblx0fSlcbn1cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93LlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSB3aW5kb3cuUHJvbWlzZVxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsLlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIGdsb2JhbC5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSBnbG9iYWwuUHJvbWlzZVxufSBlbHNlIHtcbn1cbnZhciBidWlsZFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIFwiXCJcblx0dmFyIGFyZ3MgPSBbXVxuXHRmb3IgKHZhciBrZXkwIGluIG9iamVjdCkge1xuXHRcdGRlc3RydWN0dXJlKGtleTAsIG9iamVjdFtrZXkwXSlcblx0fVxuXHRyZXR1cm4gYXJncy5qb2luKFwiJlwiKVxuXHRmdW5jdGlvbiBkZXN0cnVjdHVyZShrZXkwLCB2YWx1ZSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkwICsgXCJbXCIgKyBpICsgXCJdXCIsIHZhbHVlW2ldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIHZhbHVlKSB7XG5cdFx0XHRcdGRlc3RydWN0dXJlKGtleTAgKyBcIltcIiArIGkgKyBcIl1cIiwgdmFsdWVbaV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgYXJncy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkwKSArICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBcIlwiID8gXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpIDogXCJcIikpXG5cdH1cbn1cbnZhciBGSUxFX1BST1RPQ09MX1JFR0VYID0gbmV3IFJlZ0V4cChcIl5maWxlOi8vXCIsIFwiaVwiKVxudmFyIF84ID0gZnVuY3Rpb24oJHdpbmRvdywgUHJvbWlzZSkge1xuXHR2YXIgY2FsbGJhY2tDb3VudCA9IDBcblx0dmFyIG9uY29tcGxldGlvblxuXHRmdW5jdGlvbiBzZXRDb21wbGV0aW9uQ2FsbGJhY2soY2FsbGJhY2spIHtvbmNvbXBsZXRpb24gPSBjYWxsYmFja31cblx0ZnVuY3Rpb24gZmluYWxpemVyKCkge1xuXHRcdHZhciBjb3VudCA9IDBcblx0XHRmdW5jdGlvbiBjb21wbGV0ZSgpIHtpZiAoLS1jb3VudCA9PT0gMCAmJiB0eXBlb2Ygb25jb21wbGV0aW9uID09PSBcImZ1bmN0aW9uXCIpIG9uY29tcGxldGlvbigpfVxuXHRcdHJldHVybiBmdW5jdGlvbiBmaW5hbGl6ZShwcm9taXNlMCkge1xuXHRcdFx0dmFyIHRoZW4wID0gcHJvbWlzZTAudGhlblxuXHRcdFx0cHJvbWlzZTAudGhlbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb3VudCsrXG5cdFx0XHRcdHZhciBuZXh0ID0gdGhlbjAuYXBwbHkocHJvbWlzZTAsIGFyZ3VtZW50cylcblx0XHRcdFx0bmV4dC50aGVuKGNvbXBsZXRlLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0Y29tcGxldGUoKVxuXHRcdFx0XHRcdGlmIChjb3VudCA9PT0gMCkgdGhyb3cgZVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm4gZmluYWxpemUobmV4dClcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9taXNlMFxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBub3JtYWxpemUoYXJncywgZXh0cmEpIHtcblx0XHRpZiAodHlwZW9mIGFyZ3MgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHZhciB1cmwgPSBhcmdzXG5cdFx0XHRhcmdzID0gZXh0cmEgfHwge31cblx0XHRcdGlmIChhcmdzLnVybCA9PSBudWxsKSBhcmdzLnVybCA9IHVybFxuXHRcdH1cblx0XHRyZXR1cm4gYXJnc1xuXHR9XG5cdGZ1bmN0aW9uIHJlcXVlc3QoYXJncywgZXh0cmEpIHtcblx0XHR2YXIgZmluYWxpemUgPSBmaW5hbGl6ZXIoKVxuXHRcdGFyZ3MgPSBub3JtYWxpemUoYXJncywgZXh0cmEpXG5cdFx0dmFyIHByb21pc2UwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRpZiAoYXJncy5tZXRob2QgPT0gbnVsbCkgYXJncy5tZXRob2QgPSBcIkdFVFwiXG5cdFx0XHRhcmdzLm1ldGhvZCA9IGFyZ3MubWV0aG9kLnRvVXBwZXJDYXNlKClcblx0XHRcdHZhciB1c2VCb2R5ID0gKGFyZ3MubWV0aG9kID09PSBcIkdFVFwiIHx8IGFyZ3MubWV0aG9kID09PSBcIlRSQUNFXCIpID8gZmFsc2UgOiAodHlwZW9mIGFyZ3MudXNlQm9keSA9PT0gXCJib29sZWFuXCIgPyBhcmdzLnVzZUJvZHkgOiB0cnVlKVxuXHRcdFx0aWYgKHR5cGVvZiBhcmdzLnNlcmlhbGl6ZSAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLnNlcmlhbGl6ZSA9IHR5cGVvZiBGb3JtRGF0YSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhcmdzLmRhdGEgaW5zdGFuY2VvZiBGb3JtRGF0YSA/IGZ1bmN0aW9uKHZhbHVlKSB7cmV0dXJuIHZhbHVlfSA6IEpTT04uc3RyaW5naWZ5XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZGVzZXJpYWxpemUgIT09IFwiZnVuY3Rpb25cIikgYXJncy5kZXNlcmlhbGl6ZSA9IGRlc2VyaWFsaXplXG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZXh0cmFjdCAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLmV4dHJhY3QgPSBleHRyYWN0XG5cdFx0XHRhcmdzLnVybCA9IGludGVycG9sYXRlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHRpZiAodXNlQm9keSkgYXJncy5kYXRhID0gYXJncy5zZXJpYWxpemUoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSBhcmdzLnVybCA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHR2YXIgeGhyID0gbmV3ICR3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKSxcblx0XHRcdFx0YWJvcnRlZCA9IGZhbHNlLFxuXHRcdFx0XHRfYWJvcnQgPSB4aHIuYWJvcnRcblx0XHRcdHhoci5hYm9ydCA9IGZ1bmN0aW9uIGFib3J0KCkge1xuXHRcdFx0XHRhYm9ydGVkID0gdHJ1ZVxuXHRcdFx0XHRfYWJvcnQuY2FsbCh4aHIpXG5cdFx0XHR9XG5cdFx0XHR4aHIub3BlbihhcmdzLm1ldGhvZCwgYXJncy51cmwsIHR5cGVvZiBhcmdzLmFzeW5jID09PSBcImJvb2xlYW5cIiA/IGFyZ3MuYXN5bmMgOiB0cnVlLCB0eXBlb2YgYXJncy51c2VyID09PSBcInN0cmluZ1wiID8gYXJncy51c2VyIDogdW5kZWZpbmVkLCB0eXBlb2YgYXJncy5wYXNzd29yZCA9PT0gXCJzdHJpbmdcIiA/IGFyZ3MucGFzc3dvcmQgOiB1bmRlZmluZWQpXG5cdFx0XHRpZiAoYXJncy5zZXJpYWxpemUgPT09IEpTT04uc3RyaW5naWZ5ICYmIHVzZUJvZHkgJiYgIShhcmdzLmhlYWRlcnMgJiYgYXJncy5oZWFkZXJzLmhhc093blByb3BlcnR5KFwiQ29udGVudC1UeXBlXCIpKSkge1xuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIilcblx0XHRcdH1cblx0XHRcdGlmIChhcmdzLmRlc2VyaWFsaXplID09PSBkZXNlcmlhbGl6ZSAmJiAhKGFyZ3MuaGVhZGVycyAmJiBhcmdzLmhlYWRlcnMuaGFzT3duUHJvcGVydHkoXCJBY2NlcHRcIikpKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy53aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSBhcmdzLndpdGhDcmVkZW50aWFsc1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZ3MuaGVhZGVycykgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwoYXJncy5oZWFkZXJzLCBrZXkpKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgYXJncy5oZWFkZXJzW2tleV0pXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuY29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHhociA9IGFyZ3MuY29uZmlnKHhociwgYXJncykgfHwgeGhyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIERvbid0IHRocm93IGVycm9ycyBvbiB4aHIuYWJvcnQoKS5cblx0XHRcdFx0aWYoYWJvcnRlZCkgcmV0dXJuXG5cdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVzcG9uc2UgPSAoYXJncy5leHRyYWN0ICE9PSBleHRyYWN0KSA/IGFyZ3MuZXh0cmFjdCh4aHIsIGFyZ3MpIDogYXJncy5kZXNlcmlhbGl6ZShhcmdzLmV4dHJhY3QoeGhyLCBhcmdzKSlcblx0XHRcdFx0XHRcdGlmICgoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgfHwgeGhyLnN0YXR1cyA9PT0gMzA0IHx8IEZJTEVfUFJPVE9DT0xfUkVHRVgudGVzdChhcmdzLnVybCkpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShjYXN0KGFyZ3MudHlwZSwgcmVzcG9uc2UpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IG5ldyBFcnJvcih4aHIucmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVzcG9uc2UpIGVycm9yW2tleV0gPSByZXNwb25zZVtrZXldXG5cdFx0XHRcdFx0XHRcdHJlamVjdChlcnJvcilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHJlamVjdChlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHVzZUJvZHkgJiYgKGFyZ3MuZGF0YSAhPSBudWxsKSkgeGhyLnNlbmQoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSB4aHIuc2VuZCgpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlID8gcHJvbWlzZTAgOiBmaW5hbGl6ZShwcm9taXNlMClcblx0fVxuXHRmdW5jdGlvbiBqc29ucChhcmdzLCBleHRyYSkge1xuXHRcdHZhciBmaW5hbGl6ZSA9IGZpbmFsaXplcigpXG5cdFx0YXJncyA9IG5vcm1hbGl6ZShhcmdzLCBleHRyYSlcblx0XHR2YXIgcHJvbWlzZTAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdHZhciBjYWxsYmFja05hbWUgPSBhcmdzLmNhbGxiYWNrTmFtZSB8fCBcIl9taXRocmlsX1wiICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikgKyBcIl9cIiArIGNhbGxiYWNrQ291bnQrK1xuXHRcdFx0dmFyIHNjcmlwdCA9ICR3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKVxuXHRcdFx0JHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlc29sdmUoY2FzdChhcmdzLnR5cGUsIGRhdGEpKVxuXHRcdFx0XHRkZWxldGUgJHdpbmRvd1tjYWxsYmFja05hbWVdXG5cdFx0XHR9XG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoXCJKU09OUCByZXF1ZXN0IGZhaWxlZFwiKSlcblx0XHRcdFx0ZGVsZXRlICR3aW5kb3dbY2FsbGJhY2tOYW1lXVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGF0YSA9PSBudWxsKSBhcmdzLmRhdGEgPSB7fVxuXHRcdFx0YXJncy51cmwgPSBpbnRlcnBvbGF0ZShhcmdzLnVybCwgYXJncy5kYXRhKVxuXHRcdFx0YXJncy5kYXRhW2FyZ3MuY2FsbGJhY2tLZXkgfHwgXCJjYWxsYmFja1wiXSA9IGNhbGxiYWNrTmFtZVxuXHRcdFx0c2NyaXB0LnNyYyA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHQkd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChzY3JpcHQpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlPyBwcm9taXNlMCA6IGZpbmFsaXplKHByb21pc2UwKVxuXHR9XG5cdGZ1bmN0aW9uIGludGVycG9sYXRlKHVybCwgZGF0YSkge1xuXHRcdGlmIChkYXRhID09IG51bGwpIHJldHVybiB1cmxcblx0XHR2YXIgdG9rZW5zID0gdXJsLm1hdGNoKC86W15cXC9dKy9naSkgfHwgW11cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IHRva2Vuc1tpXS5zbGljZSgxKVxuXHRcdFx0aWYgKGRhdGFba2V5XSAhPSBudWxsKSB7XG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2Vuc1tpXSwgZGF0YVtrZXldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdXJsXG5cdH1cblx0ZnVuY3Rpb24gYXNzZW1ibGUodXJsLCBkYXRhKSB7XG5cdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKVxuXHRcdGlmIChxdWVyeXN0cmluZyAhPT0gXCJcIikge1xuXHRcdFx0dmFyIHByZWZpeCA9IHVybC5pbmRleE9mKFwiP1wiKSA8IDAgPyBcIj9cIiA6IFwiJlwiXG5cdFx0XHR1cmwgKz0gcHJlZml4ICsgcXVlcnlzdHJpbmdcblx0XHR9XG5cdFx0cmV0dXJuIHVybFxuXHR9XG5cdGZ1bmN0aW9uIGRlc2VyaWFsaXplKGRhdGEpIHtcblx0XHR0cnkge3JldHVybiBkYXRhICE9PSBcIlwiID8gSlNPTi5wYXJzZShkYXRhKSA6IG51bGx9XG5cdFx0Y2F0Y2ggKGUpIHt0aHJvdyBuZXcgRXJyb3IoZGF0YSl9XG5cdH1cblx0ZnVuY3Rpb24gZXh0cmFjdCh4aHIpIHtyZXR1cm4geGhyLnJlc3BvbnNlVGV4dH1cblx0ZnVuY3Rpb24gY2FzdCh0eXBlMCwgZGF0YSkge1xuXHRcdGlmICh0eXBlb2YgdHlwZTAgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZGF0YVtpXSA9IG5ldyB0eXBlMChkYXRhW2ldKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHJldHVybiBuZXcgdHlwZTAoZGF0YSlcblx0XHR9XG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXHRyZXR1cm4ge3JlcXVlc3Q6IHJlcXVlc3QsIGpzb25wOiBqc29ucCwgc2V0Q29tcGxldGlvbkNhbGxiYWNrOiBzZXRDb21wbGV0aW9uQ2FsbGJhY2t9XG59XG52YXIgcmVxdWVzdFNlcnZpY2UgPSBfOCh3aW5kb3csIFByb21pc2VQb2x5ZmlsbClcbnZhciBjb3JlUmVuZGVyZXIgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciAkZG9jID0gJHdpbmRvdy5kb2N1bWVudFxuXHR2YXIgJGVtcHR5RnJhZ21lbnQgPSAkZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHR2YXIgbmFtZVNwYWNlID0ge1xuXHRcdHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuXHRcdG1hdGg6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTFwiXG5cdH1cblx0dmFyIG9uZXZlbnRcblx0ZnVuY3Rpb24gc2V0RXZlbnRDYWxsYmFjayhjYWxsYmFjaykge3JldHVybiBvbmV2ZW50ID0gY2FsbGJhY2t9XG5cdGZ1bmN0aW9uIGdldE5hbWVTcGFjZSh2bm9kZSkge1xuXHRcdHJldHVybiB2bm9kZS5hdHRycyAmJiB2bm9kZS5hdHRycy54bWxucyB8fCBuYW1lU3BhY2Vbdm5vZGUudGFnXVxuXHR9XG5cdC8vY3JlYXRlXG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKSB7XG5cdFx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpIHtcblx0XHR2YXIgdGFnID0gdm5vZGUudGFnXG5cdFx0aWYgKHR5cGVvZiB0YWcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHZub2RlLnN0YXRlID0ge31cblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSBpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0XHRzd2l0Y2ggKHRhZykge1xuXHRcdFx0XHRjYXNlIFwiI1wiOiByZXR1cm4gY3JlYXRlVGV4dChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHRcdFx0Y2FzZSBcIjxcIjogcmV0dXJuIGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdGNhc2UgXCJbXCI6IHJldHVybiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRkZWZhdWx0OiByZXR1cm4gY3JlYXRlRWxlbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHJldHVybiBjcmVhdGVDb21wb25lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVUZXh0KHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0dm5vZGUuZG9tID0gJGRvYy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS5jaGlsZHJlbilcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgdm5vZGUuZG9tLCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZykge1xuXHRcdHZhciBtYXRjaDEgPSB2bm9kZS5jaGlsZHJlbi5tYXRjaCgvXlxccyo/PChcXHcrKS9pbSkgfHwgW11cblx0XHR2YXIgcGFyZW50MSA9IHtjYXB0aW9uOiBcInRhYmxlXCIsIHRoZWFkOiBcInRhYmxlXCIsIHRib2R5OiBcInRhYmxlXCIsIHRmb290OiBcInRhYmxlXCIsIHRyOiBcInRib2R5XCIsIHRoOiBcInRyXCIsIHRkOiBcInRyXCIsIGNvbGdyb3VwOiBcInRhYmxlXCIsIGNvbDogXCJjb2xncm91cFwifVttYXRjaDFbMV1dIHx8IFwiZGl2XCJcblx0XHR2YXIgdGVtcCA9ICRkb2MuY3JlYXRlRWxlbWVudChwYXJlbnQxKVxuXHRcdHRlbXAuaW5uZXJIVE1MID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSB0ZW1wLmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gdGVtcC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdHZhciBmcmFnbWVudCA9ICRkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0dmFyIGNoaWxkXG5cdFx0d2hpbGUgKGNoaWxkID0gdGVtcC5maXJzdENoaWxkKSB7XG5cdFx0XHRmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0XHR9XG5cdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGZyYWdtZW50LCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gZnJhZ21lbnRcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRpZiAodm5vZGUuY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGNyZWF0ZU5vZGVzKGZyYWdtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGZyYWdtZW50LmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGhcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHRcdHJldHVybiBmcmFnbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHR2YXIgYXR0cnMyID0gdm5vZGUuYXR0cnNcblx0XHR2YXIgaXMgPSBhdHRyczIgJiYgYXR0cnMyLmlzXG5cdFx0bnMgPSBnZXROYW1lU3BhY2Uodm5vZGUpIHx8IG5zXG5cdFx0dmFyIGVsZW1lbnQgPSBucyA/XG5cdFx0XHRpcyA/ICRkb2MuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcsIHtpczogaXN9KSA6ICRkb2MuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcpIDpcblx0XHRcdGlzID8gJGRvYy5jcmVhdGVFbGVtZW50KHRhZywge2lzOiBpc30pIDogJGRvYy5jcmVhdGVFbGVtZW50KHRhZylcblx0XHR2bm9kZS5kb20gPSBlbGVtZW50XG5cdFx0aWYgKGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRzZXRBdHRycyh2bm9kZSwgYXR0cnMyLCBucylcblx0XHR9XG5cdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGVsZW1lbnQsIG5leHRTaWJsaW5nKVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsICYmIHZub2RlLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSAhPSBudWxsKSB7XG5cdFx0XHRzZXRDb250ZW50RWRpdGFibGUodm5vZGUpXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodm5vZGUudGV4dCAhPT0gXCJcIikgZWxlbWVudC50ZXh0Q29udGVudCA9IHZub2RlLnRleHRcblx0XHRcdFx0ZWxzZSB2bm9kZS5jaGlsZHJlbiA9IFtWbm9kZShcIiNcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZub2RlLnRleHQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKV1cblx0XHRcdH1cblx0XHRcdGlmICh2bm9kZS5jaGlsZHJlbiAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0XHRcdGNyZWF0ZU5vZGVzKGVsZW1lbnQsIGNoaWxkcmVuLCAwLCBjaGlsZHJlbi5sZW5ndGgsIGhvb2tzLCBudWxsLCBucylcblx0XHRcdFx0c2V0TGF0ZUF0dHJzKHZub2RlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZWxlbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGluaXRDb21wb25lbnQodm5vZGUsIGhvb2tzKSB7XG5cdFx0dmFyIHNlbnRpbmVsXG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcudmlldyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IE9iamVjdC5jcmVhdGUodm5vZGUudGFnKVxuXHRcdFx0c2VudGluZWwgPSB2bm9kZS5zdGF0ZS52aWV3XG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuICRlbXB0eUZyYWdtZW50XG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0dm5vZGUuc3RhdGUgPSB2b2lkIDBcblx0XHRcdHNlbnRpbmVsID0gdm5vZGUudGFnXG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuICRlbXB0eUZyYWdtZW50XG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHRcdHZub2RlLnN0YXRlID0gKHZub2RlLnRhZy5wcm90b3R5cGUgIT0gbnVsbCAmJiB0eXBlb2Ygdm5vZGUudGFnLnByb3RvdHlwZS52aWV3ID09PSBcImZ1bmN0aW9uXCIpID8gbmV3IHZub2RlLnRhZyh2bm9kZSkgOiB2bm9kZS50YWcodm5vZGUpXG5cdFx0fVxuXHRcdHZub2RlLl9zdGF0ZSA9IHZub2RlLnN0YXRlXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIGluaXRMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLl9zdGF0ZSwgdm5vZGUsIGhvb2tzKVxuXHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKHZub2RlLl9zdGF0ZS52aWV3LmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKSlcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgPT09IHZub2RlKSB0aHJvdyBFcnJvcihcIkEgdmlldyBjYW5ub3QgcmV0dXJuIHRoZSB2bm9kZSBpdCByZWNlaXZlZCBhcyBhcmd1bWVudFwiKVxuXHRcdHNlbnRpbmVsLiQkcmVlbnRyYW50TG9jayQkID0gbnVsbFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0aW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MpXG5cdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdHZhciBlbGVtZW50ID0gY3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLmluc3RhbmNlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0dm5vZGUuZG9tID0gdm5vZGUuaW5zdGFuY2UuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gdm5vZGUuZG9tICE9IG51bGwgPyB2bm9kZS5pbnN0YW5jZS5kb21TaXplIDogMFxuXHRcdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGVsZW1lbnQsIG5leHRTaWJsaW5nKVxuXHRcdFx0cmV0dXJuIGVsZW1lbnRcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdFx0cmV0dXJuICRlbXB0eUZyYWdtZW50XG5cdFx0fVxuXHR9XG5cdC8vdXBkYXRlXG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGVzKHBhcmVudCwgb2xkLCB2bm9kZXMsIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucykge1xuXHRcdGlmIChvbGQgPT09IHZub2RlcyB8fCBvbGQgPT0gbnVsbCAmJiB2bm9kZXMgPT0gbnVsbCkgcmV0dXJuXG5cdFx0ZWxzZSBpZiAob2xkID09IG51bGwpIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCAwLCB2bm9kZXMubGVuZ3RoLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKVxuXHRcdGVsc2UgaWYgKHZub2RlcyA9PSBudWxsKSByZW1vdmVOb2RlcyhvbGQsIDAsIG9sZC5sZW5ndGgsIHZub2Rlcylcblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQubGVuZ3RoID09PSB2bm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHZhciBpc1Vua2V5ZWQgPSBmYWxzZVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZub2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmICh2bm9kZXNbaV0gIT0gbnVsbCAmJiBvbGRbaV0gIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0aXNVbmtleWVkID0gdm5vZGVzW2ldLmtleSA9PSBudWxsICYmIG9sZFtpXS5rZXkgPT0gbnVsbFxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGlzVW5rZXllZCkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2xkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAob2xkW2ldID09PSB2bm9kZXNbaV0pIGNvbnRpbnVlXG5cdFx0XHRcdFx0XHRlbHNlIGlmIChvbGRbaV0gPT0gbnVsbCAmJiB2bm9kZXNbaV0gIT0gbnVsbCkgY3JlYXRlTm9kZShwYXJlbnQsIHZub2Rlc1tpXSwgaG9va3MsIG5zLCBnZXROZXh0U2libGluZyhvbGQsIGkgKyAxLCBuZXh0U2libGluZykpXG5cdFx0XHRcdFx0XHRlbHNlIGlmICh2bm9kZXNbaV0gPT0gbnVsbCkgcmVtb3ZlTm9kZXMob2xkLCBpLCBpICsgMSwgdm5vZGVzKVxuXHRcdFx0XHRcdFx0ZWxzZSB1cGRhdGVOb2RlKHBhcmVudCwgb2xkW2ldLCB2bm9kZXNbaV0sIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIGkgKyAxLCBuZXh0U2libGluZyksIHJlY3ljbGluZywgbnMpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZWN5Y2xpbmcgPSByZWN5Y2xpbmcgfHwgaXNSZWN5Y2xhYmxlKG9sZCwgdm5vZGVzKVxuXHRcdFx0aWYgKHJlY3ljbGluZykge1xuXHRcdFx0XHR2YXIgcG9vbCA9IG9sZC5wb29sXG5cdFx0XHRcdG9sZCA9IG9sZC5jb25jYXQob2xkLnBvb2wpXG5cdFx0XHR9XG5cdFx0XHR2YXIgb2xkU3RhcnQgPSAwLCBzdGFydCA9IDAsIG9sZEVuZCA9IG9sZC5sZW5ndGggLSAxLCBlbmQgPSB2bm9kZXMubGVuZ3RoIC0gMSwgbWFwXG5cdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRTdGFydF0sIHYgPSB2bm9kZXNbc3RhcnRdXG5cdFx0XHRcdGlmIChvID09PSB2ICYmICFyZWN5Y2xpbmcpIG9sZFN0YXJ0KyssIHN0YXJ0Kytcblx0XHRcdFx0ZWxzZSBpZiAobyA9PSBudWxsKSBvbGRTdGFydCsrXG5cdFx0XHRcdGVsc2UgaWYgKHYgPT0gbnVsbCkgc3RhcnQrK1xuXHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHR2YXIgc2hvdWxkUmVjeWNsZSA9IChwb29sICE9IG51bGwgJiYgb2xkU3RhcnQgPj0gb2xkLmxlbmd0aCAtIHBvb2wubGVuZ3RoKSB8fCAoKHBvb2wgPT0gbnVsbCkgJiYgcmVjeWNsaW5nKVxuXHRcdFx0XHRcdG9sZFN0YXJ0KyssIHN0YXJ0Kytcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG5leHRTaWJsaW5nKSwgc2hvdWxkUmVjeWNsZSwgbnMpXG5cdFx0XHRcdFx0aWYgKHJlY3ljbGluZyAmJiBvLnRhZyA9PT0gdi50YWcpIGluc2VydE5vZGUocGFyZW50LCB0b0ZyYWdtZW50KG8pLCBuZXh0U2libGluZylcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRFbmRdXG5cdFx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkRW5kLS0sIHN0YXJ0Kytcblx0XHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZEVuZC0tXG5cdFx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdFx0ZWxzZSBpZiAoby5rZXkgPT09IHYua2V5KSB7XG5cdFx0XHRcdFx0XHR2YXIgc2hvdWxkUmVjeWNsZSA9IChwb29sICE9IG51bGwgJiYgb2xkRW5kID49IG9sZC5sZW5ndGggLSBwb29sLmxlbmd0aCkgfHwgKChwb29sID09IG51bGwpICYmIHJlY3ljbGluZylcblx0XHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRFbmQgKyAxLCBuZXh0U2libGluZyksIHNob3VsZFJlY3ljbGUsIG5zKVxuXHRcdFx0XHRcdFx0aWYgKHJlY3ljbGluZyB8fCBzdGFydCA8IGVuZCkgaW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobyksIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG5leHRTaWJsaW5nKSlcblx0XHRcdFx0XHRcdG9sZEVuZC0tLCBzdGFydCsrXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgYnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKG9sZEVuZCA+PSBvbGRTdGFydCAmJiBlbmQgPj0gc3RhcnQpIHtcblx0XHRcdFx0dmFyIG8gPSBvbGRbb2xkRW5kXSwgdiA9IHZub2Rlc1tlbmRdXG5cdFx0XHRcdGlmIChvID09PSB2ICYmICFyZWN5Y2xpbmcpIG9sZEVuZC0tLCBlbmQtLVxuXHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZEVuZC0tXG5cdFx0XHRcdGVsc2UgaWYgKHYgPT0gbnVsbCkgZW5kLS1cblx0XHRcdFx0ZWxzZSBpZiAoby5rZXkgPT09IHYua2V5KSB7XG5cdFx0XHRcdFx0dmFyIHNob3VsZFJlY3ljbGUgPSAocG9vbCAhPSBudWxsICYmIG9sZEVuZCA+PSBvbGQubGVuZ3RoIC0gcG9vbC5sZW5ndGgpIHx8ICgocG9vbCA9PSBudWxsKSAmJiByZWN5Y2xpbmcpXG5cdFx0XHRcdFx0dXBkYXRlTm9kZShwYXJlbnQsIG8sIHYsIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIG9sZEVuZCArIDEsIG5leHRTaWJsaW5nKSwgc2hvdWxkUmVjeWNsZSwgbnMpXG5cdFx0XHRcdFx0aWYgKHJlY3ljbGluZyAmJiBvLnRhZyA9PT0gdi50YWcpIGluc2VydE5vZGUocGFyZW50LCB0b0ZyYWdtZW50KG8pLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRpZiAoby5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSBvLmRvbVxuXHRcdFx0XHRcdG9sZEVuZC0tLCBlbmQtLVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmICghbWFwKSBtYXAgPSBnZXRLZXlNYXAob2xkLCBvbGRFbmQpXG5cdFx0XHRcdFx0aWYgKHYgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dmFyIG9sZEluZGV4ID0gbWFwW3Yua2V5XVxuXHRcdFx0XHRcdFx0aWYgKG9sZEluZGV4ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0dmFyIG1vdmFibGUgPSBvbGRbb2xkSW5kZXhdXG5cdFx0XHRcdFx0XHRcdHZhciBzaG91bGRSZWN5Y2xlID0gKHBvb2wgIT0gbnVsbCAmJiBvbGRJbmRleCA+PSBvbGQubGVuZ3RoIC0gcG9vbC5sZW5ndGgpIHx8ICgocG9vbCA9PSBudWxsKSAmJiByZWN5Y2xpbmcpXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBtb3ZhYmxlLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRFbmQgKyAxLCBuZXh0U2libGluZyksIHJlY3ljbGluZywgbnMpXG5cdFx0XHRcdFx0XHRcdGluc2VydE5vZGUocGFyZW50LCB0b0ZyYWdtZW50KG1vdmFibGUpLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRcdFx0b2xkW29sZEluZGV4XS5za2lwID0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRpZiAobW92YWJsZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSBtb3ZhYmxlLmRvbVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBkb20gPSBjcmVhdGVOb2RlKHBhcmVudCwgdiwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRcdFx0bmV4dFNpYmxpbmcgPSBkb21cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZW5kLS1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZW5kIDwgc3RhcnQpIGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjcmVhdGVOb2RlcyhwYXJlbnQsIHZub2Rlcywgc3RhcnQsIGVuZCArIDEsIGhvb2tzLCBuZXh0U2libGluZywgbnMpXG5cdFx0XHRyZW1vdmVOb2RlcyhvbGQsIG9sZFN0YXJ0LCBvbGRFbmQgKyAxLCB2bm9kZXMpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGUocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIHJlY3ljbGluZywgbnMpIHtcblx0XHR2YXIgb2xkVGFnID0gb2xkLnRhZywgdGFnID0gdm5vZGUudGFnXG5cdFx0aWYgKG9sZFRhZyA9PT0gdGFnKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IG9sZC5zdGF0ZVxuXHRcdFx0dm5vZGUuX3N0YXRlID0gb2xkLl9zdGF0ZVxuXHRcdFx0dm5vZGUuZXZlbnRzID0gb2xkLmV2ZW50c1xuXHRcdFx0aWYgKCFyZWN5Y2xpbmcgJiYgc2hvdWxkTm90VXBkYXRlKHZub2RlLCBvbGQpKSByZXR1cm5cblx0XHRcdGlmICh0eXBlb2Ygb2xkVGFnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKHJlY3ljbGluZykge1xuXHRcdFx0XHRcdFx0dm5vZGUuc3RhdGUgPSB7fVxuXHRcdFx0XHRcdFx0aW5pdExpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHN3aXRjaCAob2xkVGFnKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIiNcIjogdXBkYXRlVGV4dChvbGQsIHZub2RlKTsgYnJlYWtcblx0XHRcdFx0XHRjYXNlIFwiPFwiOiB1cGRhdGVIVE1MKHBhcmVudCwgb2xkLCB2bm9kZSwgbmV4dFNpYmxpbmcpOyBicmVha1xuXHRcdFx0XHRcdGNhc2UgXCJbXCI6IHVwZGF0ZUZyYWdtZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKTsgYnJlYWtcblx0XHRcdFx0XHRkZWZhdWx0OiB1cGRhdGVFbGVtZW50KG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5zKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHVwZGF0ZUNvbXBvbmVudChwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucylcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZW1vdmVOb2RlKG9sZCwgbnVsbClcblx0XHRcdGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlVGV4dChvbGQsIHZub2RlKSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbi50b1N0cmluZygpICE9PSB2bm9kZS5jaGlsZHJlbi50b1N0cmluZygpKSB7XG5cdFx0XHRvbGQuZG9tLm5vZGVWYWx1ZSA9IHZub2RlLmNoaWxkcmVuXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVIVE1MKHBhcmVudCwgb2xkLCB2bm9kZSwgbmV4dFNpYmxpbmcpIHtcblx0XHRpZiAob2xkLmNoaWxkcmVuICE9PSB2bm9kZS5jaGlsZHJlbikge1xuXHRcdFx0dG9GcmFnbWVudChvbGQpXG5cdFx0XHRjcmVhdGVIVE1MKHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHRlbHNlIHZub2RlLmRvbSA9IG9sZC5kb20sIHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUZyYWdtZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKSB7XG5cdFx0dXBkYXRlTm9kZXMocGFyZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCByZWN5Y2xpbmcsIGhvb2tzLCBuZXh0U2libGluZywgbnMpXG5cdFx0dmFyIGRvbVNpemUgPSAwLCBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0dm5vZGUuZG9tID0gbnVsbFxuXHRcdGlmIChjaGlsZHJlbiAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsICYmIGNoaWxkLmRvbSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKHZub2RlLmRvbSA9PSBudWxsKSB2bm9kZS5kb20gPSBjaGlsZC5kb21cblx0XHRcdFx0XHRkb21TaXplICs9IGNoaWxkLmRvbVNpemUgfHwgMVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZG9tU2l6ZSAhPT0gMSkgdm5vZGUuZG9tU2l6ZSA9IGRvbVNpemVcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlRWxlbWVudChvbGQsIHZub2RlLCByZWN5Y2xpbmcsIGhvb2tzLCBucykge1xuXHRcdHZhciBlbGVtZW50ID0gdm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdG5zID0gZ2V0TmFtZVNwYWNlKHZub2RlKSB8fCBuc1xuXHRcdGlmICh2bm9kZS50YWcgPT09IFwidGV4dGFyZWFcIikge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0XHRcdGlmICh2bm9kZS50ZXh0ICE9IG51bGwpIHtcblx0XHRcdFx0dm5vZGUuYXR0cnMudmFsdWUgPSB2bm9kZS50ZXh0IC8vRklYTUUgaGFuZGxlMCBtdWx0aXBsZSBjaGlsZHJlblxuXHRcdFx0XHR2bm9kZS50ZXh0ID0gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHVwZGF0ZUF0dHJzKHZub2RlLCBvbGQuYXR0cnMsIHZub2RlLmF0dHJzLCBucylcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCAmJiB2bm9kZS5hdHRycy5jb250ZW50ZWRpdGFibGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q29udGVudEVkaXRhYmxlKHZub2RlKVxuXHRcdH1cblx0XHRlbHNlIGlmIChvbGQudGV4dCAhPSBudWxsICYmIHZub2RlLnRleHQgIT0gbnVsbCAmJiB2bm9kZS50ZXh0ICE9PSBcIlwiKSB7XG5cdFx0XHRpZiAob2xkLnRleHQudG9TdHJpbmcoKSAhPT0gdm5vZGUudGV4dC50b1N0cmluZygpKSBvbGQuZG9tLmZpcnN0Q2hpbGQubm9kZVZhbHVlID0gdm5vZGUudGV4dFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQudGV4dCAhPSBudWxsKSBvbGQuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvbGQudGV4dCwgdW5kZWZpbmVkLCBvbGQuZG9tLmZpcnN0Q2hpbGQpXVxuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkgdm5vZGUuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB2bm9kZS50ZXh0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCldXG5cdFx0XHR1cGRhdGVOb2RlcyhlbGVtZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCByZWN5Y2xpbmcsIGhvb2tzLCBudWxsLCBucylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlQ29tcG9uZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgaG9va3MsIG5leHRTaWJsaW5nLCByZWN5Y2xpbmcsIG5zKSB7XG5cdFx0aWYgKHJlY3ljbGluZykge1xuXHRcdFx0aW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKHZub2RlLl9zdGF0ZS52aWV3LmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKSlcblx0XHRcdGlmICh2bm9kZS5pbnN0YW5jZSA9PT0gdm5vZGUpIHRocm93IEVycm9yKFwiQSB2aWV3IGNhbm5vdCByZXR1cm4gdGhlIHZub2RlIGl0IHJlY2VpdmVkIGFzIGFyZ3VtZW50XCIpXG5cdFx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgdXBkYXRlTGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0XHR1cGRhdGVMaWZlY3ljbGUodm5vZGUuX3N0YXRlLCB2bm9kZSwgaG9va3MpXG5cdFx0fVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAob2xkLmluc3RhbmNlID09IG51bGwpIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmluc3RhbmNlLmRvbVNpemVcblx0XHR9XG5cdFx0ZWxzZSBpZiAob2xkLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdHJlbW92ZU5vZGUob2xkLmluc3RhbmNlLCBudWxsKVxuXHRcdFx0dm5vZGUuZG9tID0gdW5kZWZpbmVkXG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBpc1JlY3ljbGFibGUob2xkLCB2bm9kZXMpIHtcblx0XHRpZiAob2xkLnBvb2wgIT0gbnVsbCAmJiBNYXRoLmFicyhvbGQucG9vbC5sZW5ndGggLSB2bm9kZXMubGVuZ3RoKSA8PSBNYXRoLmFicyhvbGQubGVuZ3RoIC0gdm5vZGVzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBvbGRDaGlsZHJlbkxlbmd0aCA9IG9sZFswXSAmJiBvbGRbMF0uY2hpbGRyZW4gJiYgb2xkWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHR2YXIgcG9vbENoaWxkcmVuTGVuZ3RoID0gb2xkLnBvb2xbMF0gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4ubGVuZ3RoIHx8IDBcblx0XHRcdHZhciB2bm9kZXNDaGlsZHJlbkxlbmd0aCA9IHZub2Rlc1swXSAmJiB2bm9kZXNbMF0uY2hpbGRyZW4gJiYgdm5vZGVzWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHRpZiAoTWF0aC5hYnMocG9vbENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpIDw9IE1hdGguYWJzKG9sZENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cdGZ1bmN0aW9uIGdldEtleU1hcCh2bm9kZXMsIGVuZCkge1xuXHRcdHZhciBtYXAgPSB7fSwgaSA9IDBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHR2YXIgdm5vZGUgPSB2bm9kZXNbaV1cblx0XHRcdGlmICh2bm9kZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBrZXkyID0gdm5vZGUua2V5XG5cdFx0XHRcdGlmIChrZXkyICE9IG51bGwpIG1hcFtrZXkyXSA9IGlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1hcFxuXHR9XG5cdGZ1bmN0aW9uIHRvRnJhZ21lbnQodm5vZGUpIHtcblx0XHR2YXIgY291bnQwID0gdm5vZGUuZG9tU2l6ZVxuXHRcdGlmIChjb3VudDAgIT0gbnVsbCB8fCB2bm9kZS5kb20gPT0gbnVsbCkge1xuXHRcdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRcdGlmIChjb3VudDAgPiAwKSB7XG5cdFx0XHRcdHZhciBkb20gPSB2bm9kZS5kb21cblx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSBmcmFnbWVudC5hcHBlbmRDaGlsZChkb20ubmV4dFNpYmxpbmcpXG5cdFx0XHRcdGZyYWdtZW50Lmluc2VydEJlZm9yZShkb20sIGZyYWdtZW50LmZpcnN0Q2hpbGQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZnJhZ21lbnRcblx0XHR9XG5cdFx0ZWxzZSByZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gZ2V0TmV4dFNpYmxpbmcodm5vZGVzLCBpLCBuZXh0U2libGluZykge1xuXHRcdGZvciAoOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwgJiYgdm5vZGVzW2ldLmRvbSAhPSBudWxsKSByZXR1cm4gdm5vZGVzW2ldLmRvbVxuXHRcdH1cblx0XHRyZXR1cm4gbmV4dFNpYmxpbmdcblx0fVxuXHRmdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudCwgZG9tLCBuZXh0U2libGluZykge1xuXHRcdGlmIChuZXh0U2libGluZyAmJiBuZXh0U2libGluZy5wYXJlbnROb2RlKSBwYXJlbnQuaW5zZXJ0QmVmb3JlKGRvbSwgbmV4dFNpYmxpbmcpXG5cdFx0ZWxzZSBwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tKVxuXHR9XG5cdGZ1bmN0aW9uIHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSkge1xuXHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdLnRhZyA9PT0gXCI8XCIpIHtcblx0XHRcdHZhciBjb250ZW50ID0gY2hpbGRyZW5bMF0uY2hpbGRyZW5cblx0XHRcdGlmICh2bm9kZS5kb20uaW5uZXJIVE1MICE9PSBjb250ZW50KSB2bm9kZS5kb20uaW5uZXJIVE1MID0gY29udGVudFxuXHRcdH1cblx0XHRlbHNlIGlmICh2bm9kZS50ZXh0ICE9IG51bGwgfHwgY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggIT09IDApIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIG5vZGUgb2YgYSBjb250ZW50ZWRpdGFibGUgbXVzdCBiZSB0cnVzdGVkXCIpXG5cdH1cblx0Ly9yZW1vdmVcblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZXModm5vZGVzLCBzdGFydCwgZW5kLCBjb250ZXh0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0aWYgKHZub2RlLnNraXApIHZub2RlLnNraXAgPSBmYWxzZVxuXHRcdFx0XHRlbHNlIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpIHtcblx0XHR2YXIgZXhwZWN0ZWQgPSAxLCBjYWxsZWQgPSAwXG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbmJlZm9yZXJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUuYXR0cnMub25iZWZvcmVyZW1vdmUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0ZXhwZWN0ZWQrK1xuXHRcdFx0XHRyZXN1bHQudGhlbihjb250aW51YXRpb24sIGNvbnRpbnVhdGlvbilcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHZub2RlLl9zdGF0ZS5vbmJlZm9yZXJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUuX3N0YXRlLm9uYmVmb3JlcmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdGV4cGVjdGVkKytcblx0XHRcdFx0cmVzdWx0LnRoZW4oY29udGludWF0aW9uLCBjb250aW51YXRpb24pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnRpbnVhdGlvbigpXG5cdFx0ZnVuY3Rpb24gY29udGludWF0aW9uKCkge1xuXHRcdFx0aWYgKCsrY2FsbGVkID09PSBleHBlY3RlZCkge1xuXHRcdFx0XHRvbnJlbW92ZSh2bm9kZSlcblx0XHRcdFx0aWYgKHZub2RlLmRvbSkge1xuXHRcdFx0XHRcdHZhciBjb3VudDAgPSB2bm9kZS5kb21TaXplIHx8IDFcblx0XHRcdFx0XHRpZiAoY291bnQwID4gMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRvbSA9IHZub2RlLmRvbVxuXHRcdFx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSB7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZU5vZGVGcm9tRE9NKGRvbS5uZXh0U2libGluZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVtb3ZlTm9kZUZyb21ET00odm5vZGUuZG9tKVxuXHRcdFx0XHRcdGlmIChjb250ZXh0ICE9IG51bGwgJiYgdm5vZGUuZG9tU2l6ZSA9PSBudWxsICYmICFoYXNJbnRlZ3JhdGlvbk1ldGhvZHModm5vZGUuYXR0cnMpICYmIHR5cGVvZiB2bm9kZS50YWcgPT09IFwic3RyaW5nXCIpIHsgLy9UT0RPIHRlc3QgY3VzdG9tIGVsZW1lbnRzXG5cdFx0XHRcdFx0XHRpZiAoIWNvbnRleHQucG9vbCkgY29udGV4dC5wb29sID0gW3Zub2RlXVxuXHRcdFx0XHRcdFx0ZWxzZSBjb250ZXh0LnBvb2wucHVzaCh2bm9kZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZUZyb21ET00obm9kZSkge1xuXHRcdHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGVcblx0XHRpZiAocGFyZW50ICE9IG51bGwpIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKVxuXHR9XG5cdGZ1bmN0aW9uIG9ucmVtb3ZlKHZub2RlKSB7XG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbnJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB2bm9kZS5hdHRycy5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHR5cGVvZiB2bm9kZS5fc3RhdGUub25yZW1vdmUgPT09IFwiZnVuY3Rpb25cIikgdm5vZGUuX3N0YXRlLm9ucmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIG9ucmVtb3ZlKHZub2RlLmluc3RhbmNlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsKSBvbnJlbW92ZShjaGlsZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL2F0dHJzMlxuXHRmdW5jdGlvbiBzZXRBdHRycyh2bm9kZSwgYXR0cnMyLCBucykge1xuXHRcdGZvciAodmFyIGtleTIgaW4gYXR0cnMyKSB7XG5cdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBudWxsLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQsIHZhbHVlLCBucykge1xuXHRcdHZhciBlbGVtZW50ID0gdm5vZGUuZG9tXG5cdFx0aWYgKGtleTIgPT09IFwia2V5XCIgfHwga2V5MiA9PT0gXCJpc1wiIHx8IChvbGQgPT09IHZhbHVlICYmICFpc0Zvcm1BdHRyaWJ1dGUodm5vZGUsIGtleTIpKSAmJiB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleTIpKSByZXR1cm5cblx0XHR2YXIgbnNMYXN0SW5kZXggPSBrZXkyLmluZGV4T2YoXCI6XCIpXG5cdFx0aWYgKG5zTGFzdEluZGV4ID4gLTEgJiYga2V5Mi5zdWJzdHIoMCwgbnNMYXN0SW5kZXgpID09PSBcInhsaW5rXCIpIHtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIGtleTIuc2xpY2UobnNMYXN0SW5kZXggKyAxKSwgdmFsdWUpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoa2V5MiA9PT0gXCJzdHlsZVwiKSB1cGRhdGVTdHlsZShlbGVtZW50LCBvbGQsIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGtleTIgaW4gZWxlbWVudCAmJiAhaXNBdHRyaWJ1dGUoa2V5MikgJiYgbnMgPT09IHVuZGVmaW5lZCAmJiAhaXNDdXN0b21FbGVtZW50KHZub2RlKSkge1xuXHRcdFx0aWYgKGtleTIgPT09IFwidmFsdWVcIikge1xuXHRcdFx0XHR2YXIgbm9ybWFsaXplZDAgPSBcIlwiICsgdmFsdWUgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1pbXBsaWNpdC1jb2VyY2lvblxuXHRcdFx0XHQvL3NldHRpbmcgaW5wdXRbdmFsdWVdIHRvIHNhbWUgdmFsdWUgYnkgdHlwaW5nIG9uIGZvY3VzZWQgZWxlbWVudCBtb3ZlcyBjdXJzb3IgdG8gZW5kIGluIENocm9tZVxuXHRcdFx0XHRpZiAoKHZub2RlLnRhZyA9PT0gXCJpbnB1dFwiIHx8IHZub2RlLnRhZyA9PT0gXCJ0ZXh0YXJlYVwiKSAmJiB2bm9kZS5kb20udmFsdWUgPT09IG5vcm1hbGl6ZWQwICYmIHZub2RlLmRvbSA9PT0gJGRvYy5hY3RpdmVFbGVtZW50KSByZXR1cm5cblx0XHRcdFx0Ly9zZXR0aW5nIHNlbGVjdFt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSB3aGlsZSBoYXZpbmcgc2VsZWN0IG9wZW4gYmxpbmtzIHNlbGVjdCBkcm9wZG93biBpbiBDaHJvbWVcblx0XHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJzZWxlY3RcIikge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0aWYgKHZub2RlLmRvbS5zZWxlY3RlZEluZGV4ID09PSAtMSAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChvbGQgIT09IG51bGwgJiYgdm5vZGUuZG9tLnZhbHVlID09PSBub3JtYWxpemVkMCAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vc2V0dGluZyBvcHRpb25bdmFsdWVdIHRvIHNhbWUgdmFsdWUgd2hpbGUgaGF2aW5nIHNlbGVjdCBvcGVuIGJsaW5rcyBzZWxlY3QgZHJvcGRvd24gaW4gQ2hyb21lXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09IFwib3B0aW9uXCIgJiYgb2xkICE9IG51bGwgJiYgdm5vZGUuZG9tLnZhbHVlID09PSBub3JtYWxpemVkMCkgcmV0dXJuXG5cdFx0XHR9XG5cdFx0XHQvLyBJZiB5b3UgYXNzaWduIGFuIGlucHV0IHR5cGUxIHRoYXQgaXMgbm90IHN1cHBvcnRlZCBieSBJRSAxMSB3aXRoIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbiwgYW4gZXJyb3IwIHdpbGwgb2NjdXIuXG5cdFx0XHRpZiAodm5vZGUudGFnID09PSBcImlucHV0XCIgJiYga2V5MiA9PT0gXCJ0eXBlXCIpIHtcblx0XHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5MiwgdmFsdWUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0ZWxlbWVudFtrZXkyXSA9IHZhbHVlXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0aWYgKHZhbHVlKSBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXkyLCBcIlwiKVxuXHRcdFx0XHRlbHNlIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleTIpXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleTIgPT09IFwiY2xhc3NOYW1lXCIgPyBcImNsYXNzXCIgOiBrZXkyLCB2YWx1ZSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gc2V0TGF0ZUF0dHJzKHZub2RlKSB7XG5cdFx0dmFyIGF0dHJzMiA9IHZub2RlLmF0dHJzXG5cdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJzZWxlY3RcIiAmJiBhdHRyczIgIT0gbnVsbCkge1xuXHRcdFx0aWYgKFwidmFsdWVcIiBpbiBhdHRyczIpIHNldEF0dHIodm5vZGUsIFwidmFsdWVcIiwgbnVsbCwgYXR0cnMyLnZhbHVlLCB1bmRlZmluZWQpXG5cdFx0XHRpZiAoXCJzZWxlY3RlZEluZGV4XCIgaW4gYXR0cnMyKSBzZXRBdHRyKHZub2RlLCBcInNlbGVjdGVkSW5kZXhcIiwgbnVsbCwgYXR0cnMyLnNlbGVjdGVkSW5kZXgsIHVuZGVmaW5lZClcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlQXR0cnModm5vZGUsIG9sZCwgYXR0cnMyLCBucykge1xuXHRcdGlmIChhdHRyczIgIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIga2V5MiBpbiBhdHRyczIpIHtcblx0XHRcdFx0c2V0QXR0cih2bm9kZSwga2V5Miwgb2xkICYmIG9sZFtrZXkyXSwgYXR0cnMyW2tleTJdLCBucylcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9sZCAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkyIGluIG9sZCkge1xuXHRcdFx0XHRpZiAoYXR0cnMyID09IG51bGwgfHwgIShrZXkyIGluIGF0dHJzMikpIHtcblx0XHRcdFx0XHRpZiAoa2V5MiA9PT0gXCJjbGFzc05hbWVcIikga2V5MiA9IFwiY2xhc3NcIlxuXHRcdFx0XHRcdGlmIChrZXkyWzBdID09PSBcIm9cIiAmJiBrZXkyWzFdID09PSBcIm5cIiAmJiAhaXNMaWZlY3ljbGVNZXRob2Qoa2V5MikpIHVwZGF0ZUV2ZW50KHZub2RlLCBrZXkyLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0ZWxzZSBpZiAoa2V5MiAhPT0gXCJrZXlcIikgdm5vZGUuZG9tLnJlbW92ZUF0dHJpYnV0ZShrZXkyKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGlzRm9ybUF0dHJpYnV0ZSh2bm9kZSwgYXR0cikge1xuXHRcdHJldHVybiBhdHRyID09PSBcInZhbHVlXCIgfHwgYXR0ciA9PT0gXCJjaGVja2VkXCIgfHwgYXR0ciA9PT0gXCJzZWxlY3RlZEluZGV4XCIgfHwgYXR0ciA9PT0gXCJzZWxlY3RlZFwiICYmIHZub2RlLmRvbSA9PT0gJGRvYy5hY3RpdmVFbGVtZW50XG5cdH1cblx0ZnVuY3Rpb24gaXNMaWZlY3ljbGVNZXRob2QoYXR0cikge1xuXHRcdHJldHVybiBhdHRyID09PSBcIm9uaW5pdFwiIHx8IGF0dHIgPT09IFwib25jcmVhdGVcIiB8fCBhdHRyID09PSBcIm9udXBkYXRlXCIgfHwgYXR0ciA9PT0gXCJvbnJlbW92ZVwiIHx8IGF0dHIgPT09IFwib25iZWZvcmVyZW1vdmVcIiB8fCBhdHRyID09PSBcIm9uYmVmb3JldXBkYXRlXCJcblx0fVxuXHRmdW5jdGlvbiBpc0F0dHJpYnV0ZShhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwiaHJlZlwiIHx8IGF0dHIgPT09IFwibGlzdFwiIHx8IGF0dHIgPT09IFwiZm9ybVwiIHx8IGF0dHIgPT09IFwid2lkdGhcIiB8fCBhdHRyID09PSBcImhlaWdodFwiLy8gfHwgYXR0ciA9PT0gXCJ0eXBlXCJcblx0fVxuXHRmdW5jdGlvbiBpc0N1c3RvbUVsZW1lbnQodm5vZGUpe1xuXHRcdHJldHVybiB2bm9kZS5hdHRycy5pcyB8fCB2bm9kZS50YWcuaW5kZXhPZihcIi1cIikgPiAtMVxuXHR9XG5cdGZ1bmN0aW9uIGhhc0ludGVncmF0aW9uTWV0aG9kcyhzb3VyY2UpIHtcblx0XHRyZXR1cm4gc291cmNlICE9IG51bGwgJiYgKHNvdXJjZS5vbmNyZWF0ZSB8fCBzb3VyY2Uub251cGRhdGUgfHwgc291cmNlLm9uYmVmb3JlcmVtb3ZlIHx8IHNvdXJjZS5vbnJlbW92ZSlcblx0fVxuXHQvL3N0eWxlXG5cdGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGVsZW1lbnQsIG9sZCwgc3R5bGUpIHtcblx0XHRpZiAob2xkID09PSBzdHlsZSkgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gXCJcIiwgb2xkID0gbnVsbFxuXHRcdGlmIChzdHlsZSA9PSBudWxsKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBcIlwiXG5cdFx0ZWxzZSBpZiAodHlwZW9mIHN0eWxlID09PSBcInN0cmluZ1wiKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBzdHlsZVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBvbGQgPT09IFwic3RyaW5nXCIpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IFwiXCJcblx0XHRcdGZvciAodmFyIGtleTIgaW4gc3R5bGUpIHtcblx0XHRcdFx0ZWxlbWVudC5zdHlsZVtrZXkyXSA9IHN0eWxlW2tleTJdXG5cdFx0XHR9XG5cdFx0XHRpZiAob2xkICE9IG51bGwgJiYgdHlwZW9mIG9sZCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkyIGluIG9sZCkge1xuXHRcdFx0XHRcdGlmICghKGtleTIgaW4gc3R5bGUpKSBlbGVtZW50LnN0eWxlW2tleTJdID0gXCJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdC8vZXZlbnRcblx0ZnVuY3Rpb24gdXBkYXRlRXZlbnQodm5vZGUsIGtleTIsIHZhbHVlKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSB2bm9kZS5kb21cblx0XHR2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygb25ldmVudCAhPT0gXCJmdW5jdGlvblwiID8gdmFsdWUgOiBmdW5jdGlvbihlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdmFsdWUuY2FsbChlbGVtZW50LCBlKVxuXHRcdFx0b25ldmVudC5jYWxsKGVsZW1lbnQsIGUpXG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fVxuXHRcdGlmIChrZXkyIGluIGVsZW1lbnQpIGVsZW1lbnRba2V5Ml0gPSB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGNhbGxiYWNrIDogbnVsbFxuXHRcdGVsc2Uge1xuXHRcdFx0dmFyIGV2ZW50TmFtZSA9IGtleTIuc2xpY2UoMilcblx0XHRcdGlmICh2bm9kZS5ldmVudHMgPT09IHVuZGVmaW5lZCkgdm5vZGUuZXZlbnRzID0ge31cblx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5Ml0gPT09IGNhbGxiYWNrKSByZXR1cm5cblx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5Ml0gIT0gbnVsbCkgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdm5vZGUuZXZlbnRzW2tleTJdLCBmYWxzZSlcblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR2bm9kZS5ldmVudHNba2V5Ml0gPSBjYWxsYmFja1xuXHRcdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB2bm9kZS5ldmVudHNba2V5Ml0sIGZhbHNlKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL2xpZmVjeWNsZVxuXHRmdW5jdGlvbiBpbml0TGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzKSB7XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25pbml0ID09PSBcImZ1bmN0aW9uXCIpIHNvdXJjZS5vbmluaXQuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25jcmVhdGUgPT09IFwiZnVuY3Rpb25cIikgaG9va3MucHVzaChzb3VyY2Uub25jcmVhdGUuYmluZCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUxpZmVjeWNsZShzb3VyY2UsIHZub2RlLCBob29rcykge1xuXHRcdGlmICh0eXBlb2Ygc291cmNlLm9udXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGhvb2tzLnB1c2goc291cmNlLm9udXBkYXRlLmJpbmQodm5vZGUuc3RhdGUsIHZub2RlKSlcblx0fVxuXHRmdW5jdGlvbiBzaG91bGROb3RVcGRhdGUodm5vZGUsIG9sZCkge1xuXHRcdHZhciBmb3JjZVZub2RlVXBkYXRlLCBmb3JjZUNvbXBvbmVudFVwZGF0ZVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSBmb3JjZVZub2RlVXBkYXRlID0gdm5vZGUuYXR0cnMub25iZWZvcmV1cGRhdGUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUsIG9sZClcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIiAmJiB0eXBlb2Ygdm5vZGUuX3N0YXRlLm9uYmVmb3JldXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGZvcmNlQ29tcG9uZW50VXBkYXRlID0gdm5vZGUuX3N0YXRlLm9uYmVmb3JldXBkYXRlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlLCBvbGQpXG5cdFx0aWYgKCEoZm9yY2VWbm9kZVVwZGF0ZSA9PT0gdW5kZWZpbmVkICYmIGZvcmNlQ29tcG9uZW50VXBkYXRlID09PSB1bmRlZmluZWQpICYmICFmb3JjZVZub2RlVXBkYXRlICYmICFmb3JjZUNvbXBvbmVudFVwZGF0ZSkge1xuXHRcdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IG9sZC5kb21TaXplXG5cdFx0XHR2bm9kZS5pbnN0YW5jZSA9IG9sZC5pbnN0YW5jZVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblx0ZnVuY3Rpb24gcmVuZGVyKGRvbSwgdm5vZGVzKSB7XG5cdFx0aWYgKCFkb20pIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgYmVpbmcgcGFzc2VkIHRvIG0ucm91dGUvbS5tb3VudC9tLnJlbmRlciBpcyBub3QgdW5kZWZpbmVkLlwiKVxuXHRcdHZhciBob29rcyA9IFtdXG5cdFx0dmFyIGFjdGl2ZSA9ICRkb2MuYWN0aXZlRWxlbWVudFxuXHRcdHZhciBuYW1lc3BhY2UgPSBkb20ubmFtZXNwYWNlVVJJXG5cdFx0Ly8gRmlyc3QgdGltZTAgcmVuZGVyaW5nIGludG8gYSBub2RlIGNsZWFycyBpdCBvdXRcblx0XHRpZiAoZG9tLnZub2RlcyA9PSBudWxsKSBkb20udGV4dENvbnRlbnQgPSBcIlwiXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZub2RlcykpIHZub2RlcyA9IFt2bm9kZXNdXG5cdFx0dXBkYXRlTm9kZXMoZG9tLCBkb20udm5vZGVzLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbih2bm9kZXMpLCBmYWxzZSwgaG9va3MsIG51bGwsIG5hbWVzcGFjZSA9PT0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIgPyB1bmRlZmluZWQgOiBuYW1lc3BhY2UpXG5cdFx0ZG9tLnZub2RlcyA9IHZub2Rlc1xuXHRcdC8vIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgY2FuIHJldHVybiBudWxsIGluIElFIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Eb2N1bWVudC9hY3RpdmVFbGVtZW50XG5cdFx0aWYgKGFjdGl2ZSAhPSBudWxsICYmICRkb2MuYWN0aXZlRWxlbWVudCAhPT0gYWN0aXZlKSBhY3RpdmUuZm9jdXMoKVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyBpKyspIGhvb2tzW2ldKClcblx0fVxuXHRyZXR1cm4ge3JlbmRlcjogcmVuZGVyLCBzZXRFdmVudENhbGxiYWNrOiBzZXRFdmVudENhbGxiYWNrfVxufVxuZnVuY3Rpb24gdGhyb3R0bGUoY2FsbGJhY2spIHtcblx0Ly82MGZwcyB0cmFuc2xhdGVzIHRvIDE2LjZtcywgcm91bmQgaXQgZG93biBzaW5jZSBzZXRUaW1lb3V0IHJlcXVpcmVzIGludFxuXHR2YXIgdGltZSA9IDE2XG5cdHZhciBsYXN0ID0gMCwgcGVuZGluZyA9IG51bGxcblx0dmFyIHRpbWVvdXQgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSBcImZ1bmN0aW9uXCIgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgOiBzZXRUaW1lb3V0XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm93ID0gRGF0ZS5ub3coKVxuXHRcdGlmIChsYXN0ID09PSAwIHx8IG5vdyAtIGxhc3QgPj0gdGltZSkge1xuXHRcdFx0bGFzdCA9IG5vd1xuXHRcdFx0Y2FsbGJhY2soKVxuXHRcdH1cblx0XHRlbHNlIGlmIChwZW5kaW5nID09PSBudWxsKSB7XG5cdFx0XHRwZW5kaW5nID0gdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0cGVuZGluZyA9IG51bGxcblx0XHRcdFx0Y2FsbGJhY2soKVxuXHRcdFx0XHRsYXN0ID0gRGF0ZS5ub3coKVxuXHRcdFx0fSwgdGltZSAtIChub3cgLSBsYXN0KSlcblx0XHR9XG5cdH1cbn1cbnZhciBfMTEgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciByZW5kZXJTZXJ2aWNlID0gY29yZVJlbmRlcmVyKCR3aW5kb3cpXG5cdHJlbmRlclNlcnZpY2Uuc2V0RXZlbnRDYWxsYmFjayhmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucmVkcmF3ID09PSBmYWxzZSkgZS5yZWRyYXcgPSB1bmRlZmluZWRcblx0XHRlbHNlIHJlZHJhdygpXG5cdH0pXG5cdHZhciBjYWxsYmFja3MgPSBbXVxuXHRmdW5jdGlvbiBzdWJzY3JpYmUoa2V5MSwgY2FsbGJhY2spIHtcblx0XHR1bnN1YnNjcmliZShrZXkxKVxuXHRcdGNhbGxiYWNrcy5wdXNoKGtleTEsIHRocm90dGxlKGNhbGxiYWNrKSlcblx0fVxuXHRmdW5jdGlvbiB1bnN1YnNjcmliZShrZXkxKSB7XG5cdFx0dmFyIGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2Yoa2V5MSlcblx0XHRpZiAoaW5kZXggPiAtMSkgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMilcblx0fVxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpICs9IDIpIHtcblx0XHRcdGNhbGxiYWNrc1tpXSgpXG5cdFx0fVxuXHR9XG5cdHJldHVybiB7c3Vic2NyaWJlOiBzdWJzY3JpYmUsIHVuc3Vic2NyaWJlOiB1bnN1YnNjcmliZSwgcmVkcmF3OiByZWRyYXcsIHJlbmRlcjogcmVuZGVyU2VydmljZS5yZW5kZXJ9XG59XG52YXIgcmVkcmF3U2VydmljZSA9IF8xMSh3aW5kb3cpXG5yZXF1ZXN0U2VydmljZS5zZXRDb21wbGV0aW9uQ2FsbGJhY2socmVkcmF3U2VydmljZS5yZWRyYXcpXG52YXIgXzE2ID0gZnVuY3Rpb24ocmVkcmF3U2VydmljZTApIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHJvb3QsIGNvbXBvbmVudCkge1xuXHRcdGlmIChjb21wb25lbnQgPT09IG51bGwpIHtcblx0XHRcdHJlZHJhd1NlcnZpY2UwLnJlbmRlcihyb290LCBbXSlcblx0XHRcdHJlZHJhd1NlcnZpY2UwLnVuc3Vic2NyaWJlKHJvb3QpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0XG5cdFx0aWYgKGNvbXBvbmVudC52aWV3ID09IG51bGwgJiYgdHlwZW9mIGNvbXBvbmVudCAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJtLm1vdW50KGVsZW1lbnQsIGNvbXBvbmVudCkgZXhwZWN0cyBhIGNvbXBvbmVudCwgbm90IGEgdm5vZGVcIilcblx0XHRcblx0XHR2YXIgcnVuMCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVkcmF3U2VydmljZTAucmVuZGVyKHJvb3QsIFZub2RlKGNvbXBvbmVudCkpXG5cdFx0fVxuXHRcdHJlZHJhd1NlcnZpY2UwLnN1YnNjcmliZShyb290LCBydW4wKVxuXHRcdHJlZHJhd1NlcnZpY2UwLnJlZHJhdygpXG5cdH1cbn1cbm0ubW91bnQgPSBfMTYocmVkcmF3U2VydmljZSlcbnZhciBQcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG52YXIgcGFyc2VRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZykge1xuXHRpZiAoc3RyaW5nID09PSBcIlwiIHx8IHN0cmluZyA9PSBudWxsKSByZXR1cm4ge31cblx0aWYgKHN0cmluZy5jaGFyQXQoMCkgPT09IFwiP1wiKSBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMSlcblx0dmFyIGVudHJpZXMgPSBzdHJpbmcuc3BsaXQoXCImXCIpLCBkYXRhMCA9IHt9LCBjb3VudGVycyA9IHt9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBlbnRyeSA9IGVudHJpZXNbaV0uc3BsaXQoXCI9XCIpXG5cdFx0dmFyIGtleTUgPSBkZWNvZGVVUklDb21wb25lbnQoZW50cnlbMF0pXG5cdFx0dmFyIHZhbHVlID0gZW50cnkubGVuZ3RoID09PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50KGVudHJ5WzFdKSA6IFwiXCJcblx0XHRpZiAodmFsdWUgPT09IFwidHJ1ZVwiKSB2YWx1ZSA9IHRydWVcblx0XHRlbHNlIGlmICh2YWx1ZSA9PT0gXCJmYWxzZVwiKSB2YWx1ZSA9IGZhbHNlXG5cdFx0dmFyIGxldmVscyA9IGtleTUuc3BsaXQoL1xcXVxcWz98XFxbLylcblx0XHR2YXIgY3Vyc29yID0gZGF0YTBcblx0XHRpZiAoa2V5NS5pbmRleE9mKFwiW1wiKSA+IC0xKSBsZXZlbHMucG9wKClcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGxldmVscy5sZW5ndGg7IGorKykge1xuXHRcdFx0dmFyIGxldmVsID0gbGV2ZWxzW2pdLCBuZXh0TGV2ZWwgPSBsZXZlbHNbaiArIDFdXG5cdFx0XHR2YXIgaXNOdW1iZXIgPSBuZXh0TGV2ZWwgPT0gXCJcIiB8fCAhaXNOYU4ocGFyc2VJbnQobmV4dExldmVsLCAxMCkpXG5cdFx0XHR2YXIgaXNWYWx1ZSA9IGogPT09IGxldmVscy5sZW5ndGggLSAxXG5cdFx0XHRpZiAobGV2ZWwgPT09IFwiXCIpIHtcblx0XHRcdFx0dmFyIGtleTUgPSBsZXZlbHMuc2xpY2UoMCwgaikuam9pbigpXG5cdFx0XHRcdGlmIChjb3VudGVyc1trZXk1XSA9PSBudWxsKSBjb3VudGVyc1trZXk1XSA9IDBcblx0XHRcdFx0bGV2ZWwgPSBjb3VudGVyc1trZXk1XSsrXG5cdFx0XHR9XG5cdFx0XHRpZiAoY3Vyc29yW2xldmVsXSA9PSBudWxsKSB7XG5cdFx0XHRcdGN1cnNvcltsZXZlbF0gPSBpc1ZhbHVlID8gdmFsdWUgOiBpc051bWJlciA/IFtdIDoge31cblx0XHRcdH1cblx0XHRcdGN1cnNvciA9IGN1cnNvcltsZXZlbF1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGRhdGEwXG59XG52YXIgY29yZVJvdXRlciA9IGZ1bmN0aW9uKCR3aW5kb3cpIHtcblx0dmFyIHN1cHBvcnRzUHVzaFN0YXRlID0gdHlwZW9mICR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUgPT09IFwiZnVuY3Rpb25cIlxuXHR2YXIgY2FsbEFzeW5jMCA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IHNldFRpbWVvdXRcblx0ZnVuY3Rpb24gbm9ybWFsaXplMShmcmFnbWVudDApIHtcblx0XHR2YXIgZGF0YSA9ICR3aW5kb3cubG9jYXRpb25bZnJhZ21lbnQwXS5yZXBsYWNlKC8oPzolW2EtZjg5XVthLWYwLTldKSsvZ2ltLCBkZWNvZGVVUklDb21wb25lbnQpXG5cdFx0aWYgKGZyYWdtZW50MCA9PT0gXCJwYXRobmFtZVwiICYmIGRhdGFbMF0gIT09IFwiL1wiKSBkYXRhID0gXCIvXCIgKyBkYXRhXG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXHR2YXIgYXN5bmNJZFxuXHRmdW5jdGlvbiBkZWJvdW5jZUFzeW5jKGNhbGxiYWNrMCkge1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChhc3luY0lkICE9IG51bGwpIHJldHVyblxuXHRcdFx0YXN5bmNJZCA9IGNhbGxBc3luYzAoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFzeW5jSWQgPSBudWxsXG5cdFx0XHRcdGNhbGxiYWNrMCgpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBwYXJzZVBhdGgocGF0aCwgcXVlcnlEYXRhLCBoYXNoRGF0YSkge1xuXHRcdHZhciBxdWVyeUluZGV4ID0gcGF0aC5pbmRleE9mKFwiP1wiKVxuXHRcdHZhciBoYXNoSW5kZXggPSBwYXRoLmluZGV4T2YoXCIjXCIpXG5cdFx0dmFyIHBhdGhFbmQgPSBxdWVyeUluZGV4ID4gLTEgPyBxdWVyeUluZGV4IDogaGFzaEluZGV4ID4gLTEgPyBoYXNoSW5kZXggOiBwYXRoLmxlbmd0aFxuXHRcdGlmIChxdWVyeUluZGV4ID4gLTEpIHtcblx0XHRcdHZhciBxdWVyeUVuZCA9IGhhc2hJbmRleCA+IC0xID8gaGFzaEluZGV4IDogcGF0aC5sZW5ndGhcblx0XHRcdHZhciBxdWVyeVBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zbGljZShxdWVyeUluZGV4ICsgMSwgcXVlcnlFbmQpKVxuXHRcdFx0Zm9yICh2YXIga2V5NCBpbiBxdWVyeVBhcmFtcykgcXVlcnlEYXRhW2tleTRdID0gcXVlcnlQYXJhbXNba2V5NF1cblx0XHR9XG5cdFx0aWYgKGhhc2hJbmRleCA+IC0xKSB7XG5cdFx0XHR2YXIgaGFzaFBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zbGljZShoYXNoSW5kZXggKyAxKSlcblx0XHRcdGZvciAodmFyIGtleTQgaW4gaGFzaFBhcmFtcykgaGFzaERhdGFba2V5NF0gPSBoYXNoUGFyYW1zW2tleTRdXG5cdFx0fVxuXHRcdHJldHVybiBwYXRoLnNsaWNlKDAsIHBhdGhFbmQpXG5cdH1cblx0dmFyIHJvdXRlciA9IHtwcmVmaXg6IFwiIyFcIn1cblx0cm91dGVyLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdHlwZTIgPSByb3V0ZXIucHJlZml4LmNoYXJBdCgwKVxuXHRcdHN3aXRjaCAodHlwZTIpIHtcblx0XHRcdGNhc2UgXCIjXCI6IHJldHVybiBub3JtYWxpemUxKFwiaGFzaFwiKS5zbGljZShyb3V0ZXIucHJlZml4Lmxlbmd0aClcblx0XHRcdGNhc2UgXCI/XCI6IHJldHVybiBub3JtYWxpemUxKFwic2VhcmNoXCIpLnNsaWNlKHJvdXRlci5wcmVmaXgubGVuZ3RoKSArIG5vcm1hbGl6ZTEoXCJoYXNoXCIpXG5cdFx0XHRkZWZhdWx0OiByZXR1cm4gbm9ybWFsaXplMShcInBhdGhuYW1lXCIpLnNsaWNlKHJvdXRlci5wcmVmaXgubGVuZ3RoKSArIG5vcm1hbGl6ZTEoXCJzZWFyY2hcIikgKyBub3JtYWxpemUxKFwiaGFzaFwiKVxuXHRcdH1cblx0fVxuXHRyb3V0ZXIuc2V0UGF0aCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIG9wdGlvbnMpIHtcblx0XHR2YXIgcXVlcnlEYXRhID0ge30sIGhhc2hEYXRhID0ge31cblx0XHRwYXRoID0gcGFyc2VQYXRoKHBhdGgsIHF1ZXJ5RGF0YSwgaGFzaERhdGEpXG5cdFx0aWYgKGRhdGEgIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIga2V5NCBpbiBkYXRhKSBxdWVyeURhdGFba2V5NF0gPSBkYXRhW2tleTRdXG5cdFx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKC86KFteXFwvXSspL2csIGZ1bmN0aW9uKG1hdGNoMiwgdG9rZW4pIHtcblx0XHRcdFx0ZGVsZXRlIHF1ZXJ5RGF0YVt0b2tlbl1cblx0XHRcdFx0cmV0dXJuIGRhdGFbdG9rZW5dXG5cdFx0XHR9KVxuXHRcdH1cblx0XHR2YXIgcXVlcnkgPSBidWlsZFF1ZXJ5U3RyaW5nKHF1ZXJ5RGF0YSlcblx0XHRpZiAocXVlcnkpIHBhdGggKz0gXCI/XCIgKyBxdWVyeVxuXHRcdHZhciBoYXNoID0gYnVpbGRRdWVyeVN0cmluZyhoYXNoRGF0YSlcblx0XHRpZiAoaGFzaCkgcGF0aCArPSBcIiNcIiArIGhhc2hcblx0XHRpZiAoc3VwcG9ydHNQdXNoU3RhdGUpIHtcblx0XHRcdHZhciBzdGF0ZSA9IG9wdGlvbnMgPyBvcHRpb25zLnN0YXRlIDogbnVsbFxuXHRcdFx0dmFyIHRpdGxlID0gb3B0aW9ucyA/IG9wdGlvbnMudGl0bGUgOiBudWxsXG5cdFx0XHQkd2luZG93Lm9ucG9wc3RhdGUoKVxuXHRcdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXBsYWNlKSAkd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgcm91dGVyLnByZWZpeCArIHBhdGgpXG5cdFx0XHRlbHNlICR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCByb3V0ZXIucHJlZml4ICsgcGF0aClcblx0XHR9XG5cdFx0ZWxzZSAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSByb3V0ZXIucHJlZml4ICsgcGF0aFxuXHR9XG5cdHJvdXRlci5kZWZpbmVSb3V0ZXMgPSBmdW5jdGlvbihyb3V0ZXMsIHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZ1bmN0aW9uIHJlc29sdmVSb3V0ZSgpIHtcblx0XHRcdHZhciBwYXRoID0gcm91dGVyLmdldFBhdGgoKVxuXHRcdFx0dmFyIHBhcmFtcyA9IHt9XG5cdFx0XHR2YXIgcGF0aG5hbWUgPSBwYXJzZVBhdGgocGF0aCwgcGFyYW1zLCBwYXJhbXMpXG5cdFx0XHR2YXIgc3RhdGUgPSAkd2luZG93Lmhpc3Rvcnkuc3RhdGVcblx0XHRcdGlmIChzdGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRcdGZvciAodmFyIGsgaW4gc3RhdGUpIHBhcmFtc1trXSA9IHN0YXRlW2tdXG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciByb3V0ZTAgaW4gcm91dGVzKSB7XG5cdFx0XHRcdHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcIl5cIiArIHJvdXRlMC5yZXBsYWNlKC86W15cXC9dKz9cXC57M30vZywgXCIoLio/KVwiKS5yZXBsYWNlKC86W15cXC9dKy9nLCBcIihbXlxcXFwvXSspXCIpICsgXCJcXC8/JFwiKVxuXHRcdFx0XHRpZiAobWF0Y2hlci50ZXN0KHBhdGhuYW1lKSkge1xuXHRcdFx0XHRcdHBhdGhuYW1lLnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIga2V5cyA9IHJvdXRlMC5tYXRjaCgvOlteXFwvXSsvZykgfHwgW11cblx0XHRcdFx0XHRcdHZhciB2YWx1ZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgLTIpXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0cGFyYW1zW2tleXNbaV0ucmVwbGFjZSgvOnxcXC4vZywgXCJcIildID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tpXSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJlc29sdmUocm91dGVzW3JvdXRlMF0sIHBhcmFtcywgcGF0aCwgcm91dGUwKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJlamVjdChwYXRoLCBwYXJhbXMpXG5cdFx0fVxuXHRcdGlmIChzdXBwb3J0c1B1c2hTdGF0ZSkgJHdpbmRvdy5vbnBvcHN0YXRlID0gZGVib3VuY2VBc3luYyhyZXNvbHZlUm91dGUpXG5cdFx0ZWxzZSBpZiAocm91dGVyLnByZWZpeC5jaGFyQXQoMCkgPT09IFwiI1wiKSAkd2luZG93Lm9uaGFzaGNoYW5nZSA9IHJlc29sdmVSb3V0ZVxuXHRcdHJlc29sdmVSb3V0ZSgpXG5cdH1cblx0cmV0dXJuIHJvdXRlclxufVxudmFyIF8yMCA9IGZ1bmN0aW9uKCR3aW5kb3csIHJlZHJhd1NlcnZpY2UwKSB7XG5cdHZhciByb3V0ZVNlcnZpY2UgPSBjb3JlUm91dGVyKCR3aW5kb3cpXG5cdHZhciBpZGVudGl0eSA9IGZ1bmN0aW9uKHYpIHtyZXR1cm4gdn1cblx0dmFyIHJlbmRlcjEsIGNvbXBvbmVudCwgYXR0cnMzLCBjdXJyZW50UGF0aCwgbGFzdFVwZGF0ZVxuXHR2YXIgcm91dGUgPSBmdW5jdGlvbihyb290LCBkZWZhdWx0Um91dGUsIHJvdXRlcykge1xuXHRcdGlmIChyb290ID09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgdGhhdCB3YXMgcGFzc2VkIHRvIGBtLnJvdXRlYCBpcyBub3QgdW5kZWZpbmVkXCIpXG5cdFx0dmFyIHJ1bjEgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChyZW5kZXIxICE9IG51bGwpIHJlZHJhd1NlcnZpY2UwLnJlbmRlcihyb290LCByZW5kZXIxKFZub2RlKGNvbXBvbmVudCwgYXR0cnMzLmtleSwgYXR0cnMzKSkpXG5cdFx0fVxuXHRcdHZhciBiYWlsID0gZnVuY3Rpb24ocGF0aCkge1xuXHRcdFx0aWYgKHBhdGggIT09IGRlZmF1bHRSb3V0ZSkgcm91dGVTZXJ2aWNlLnNldFBhdGgoZGVmYXVsdFJvdXRlLCBudWxsLCB7cmVwbGFjZTogdHJ1ZX0pXG5cdFx0XHRlbHNlIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCByZXNvbHZlIGRlZmF1bHQgcm91dGUgXCIgKyBkZWZhdWx0Um91dGUpXG5cdFx0fVxuXHRcdHJvdXRlU2VydmljZS5kZWZpbmVSb3V0ZXMocm91dGVzLCBmdW5jdGlvbihwYXlsb2FkLCBwYXJhbXMsIHBhdGgpIHtcblx0XHRcdHZhciB1cGRhdGUgPSBsYXN0VXBkYXRlID0gZnVuY3Rpb24ocm91dGVSZXNvbHZlciwgY29tcCkge1xuXHRcdFx0XHRpZiAodXBkYXRlICE9PSBsYXN0VXBkYXRlKSByZXR1cm5cblx0XHRcdFx0Y29tcG9uZW50ID0gY29tcCAhPSBudWxsICYmICh0eXBlb2YgY29tcC52aWV3ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIGNvbXAgPT09IFwiZnVuY3Rpb25cIik/IGNvbXAgOiBcImRpdlwiXG5cdFx0XHRcdGF0dHJzMyA9IHBhcmFtcywgY3VycmVudFBhdGggPSBwYXRoLCBsYXN0VXBkYXRlID0gbnVsbFxuXHRcdFx0XHRyZW5kZXIxID0gKHJvdXRlUmVzb2x2ZXIucmVuZGVyIHx8IGlkZW50aXR5KS5iaW5kKHJvdXRlUmVzb2x2ZXIpXG5cdFx0XHRcdHJ1bjEoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHBheWxvYWQudmlldyB8fCB0eXBlb2YgcGF5bG9hZCA9PT0gXCJmdW5jdGlvblwiKSB1cGRhdGUoe30sIHBheWxvYWQpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKHBheWxvYWQub25tYXRjaCkge1xuXHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZShwYXlsb2FkLm9ubWF0Y2gocGFyYW1zLCBwYXRoKSkudGhlbihmdW5jdGlvbihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdFx0dXBkYXRlKHBheWxvYWQsIHJlc29sdmVkKVxuXHRcdFx0XHRcdH0sIGJhaWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB1cGRhdGUocGF5bG9hZCwgXCJkaXZcIilcblx0XHRcdH1cblx0XHR9LCBiYWlsKVxuXHRcdHJlZHJhd1NlcnZpY2UwLnN1YnNjcmliZShyb290LCBydW4xKVxuXHR9XG5cdHJvdXRlLnNldCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIG9wdGlvbnMpIHtcblx0XHRpZiAobGFzdFVwZGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXHRcdFx0b3B0aW9ucy5yZXBsYWNlID0gdHJ1ZVxuXHRcdH1cblx0XHRsYXN0VXBkYXRlID0gbnVsbFxuXHRcdHJvdXRlU2VydmljZS5zZXRQYXRoKHBhdGgsIGRhdGEsIG9wdGlvbnMpXG5cdH1cblx0cm91dGUuZ2V0ID0gZnVuY3Rpb24oKSB7cmV0dXJuIGN1cnJlbnRQYXRofVxuXHRyb3V0ZS5wcmVmaXggPSBmdW5jdGlvbihwcmVmaXgwKSB7cm91dGVTZXJ2aWNlLnByZWZpeCA9IHByZWZpeDB9XG5cdHJvdXRlLmxpbmsgPSBmdW5jdGlvbih2bm9kZTEpIHtcblx0XHR2bm9kZTEuZG9tLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgcm91dGVTZXJ2aWNlLnByZWZpeCArIHZub2RlMS5hdHRycy5ocmVmKVxuXHRcdHZub2RlMS5kb20ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUuc2hpZnRLZXkgfHwgZS53aGljaCA9PT0gMikgcmV0dXJuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRcdGUucmVkcmF3ID0gZmFsc2Vcblx0XHRcdHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpXG5cdFx0XHRpZiAoaHJlZi5pbmRleE9mKHJvdXRlU2VydmljZS5wcmVmaXgpID09PSAwKSBocmVmID0gaHJlZi5zbGljZShyb3V0ZVNlcnZpY2UucHJlZml4Lmxlbmd0aClcblx0XHRcdHJvdXRlLnNldChocmVmLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0XHR9XG5cdH1cblx0cm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXkzKSB7XG5cdFx0aWYodHlwZW9mIGF0dHJzMyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2Yga2V5MyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGF0dHJzM1trZXkzXVxuXHRcdHJldHVybiBhdHRyczNcblx0fVxuXHRyZXR1cm4gcm91dGVcbn1cbm0ucm91dGUgPSBfMjAod2luZG93LCByZWRyYXdTZXJ2aWNlKVxubS53aXRoQXR0ciA9IGZ1bmN0aW9uKGF0dHJOYW1lLCBjYWxsYmFjazEsIGNvbnRleHQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcblx0XHRjYWxsYmFjazEuY2FsbChjb250ZXh0IHx8IHRoaXMsIGF0dHJOYW1lIGluIGUuY3VycmVudFRhcmdldCA/IGUuY3VycmVudFRhcmdldFthdHRyTmFtZV0gOiBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKSlcblx0fVxufVxudmFyIF8yOCA9IGNvcmVSZW5kZXJlcih3aW5kb3cpXG5tLnJlbmRlciA9IF8yOC5yZW5kZXJcbm0ucmVkcmF3ID0gcmVkcmF3U2VydmljZS5yZWRyYXdcbm0ucmVxdWVzdCA9IHJlcXVlc3RTZXJ2aWNlLnJlcXVlc3Rcbm0uanNvbnAgPSByZXF1ZXN0U2VydmljZS5qc29ucFxubS5wYXJzZVF1ZXJ5U3RyaW5nID0gcGFyc2VRdWVyeVN0cmluZ1xubS5idWlsZFF1ZXJ5U3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZ1xubS52ZXJzaW9uID0gXCIxLjEuNlwiXG5tLnZub2RlID0gVm5vZGVcbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKSBtb2R1bGVbXCJleHBvcnRzXCJdID0gbVxuZWxzZSB3aW5kb3cubSA9IG1cbn0oKSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbWl0aHJpbC9taXRocmlsLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxyXG5leHBvcnQgY29uc3QgQ09MT1JTID0gWyd3aGl0ZScsICdsaWdodCcsICdkYXJrJywgJ2JsYWNrJywgJ2xpbmsnXVxyXG5leHBvcnQgY29uc3QgU1RBVEVTID0gWydwcmltYXJ5JywgJ2luZm8nLCAnc3VjY2VzcycsICd3YXJuaW5nJywgJ2RhbmdlciddXHJcbmV4cG9ydCBjb25zdCBTSVpFUyA9IFsnc21hbGwnLCAnJywgJ21lZGl1bScsICdsYXJnZSddXHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IGdldF9jbGFzc2VzID0gKHN0YXRlKSA9PiB7XHJcbiAgICBsZXQgY2xhc3NlcyA9IFtdXHJcbiAgICBpZiAoc3RhdGUuY29sb3IpIGNsYXNzZXMucHVzaCgnaXMtJyArIHN0YXRlLmNvbG9yKVxyXG4gICAgaWYgKHN0YXRlLnN0YXRlKSBjbGFzc2VzLnB1c2goJ2lzLScgKyBzdGF0ZS5zdGF0ZSlcclxuICAgIGlmIChzdGF0ZS5zaXplKSBjbGFzc2VzLnB1c2goJ2lzLScgKyBzdGF0ZS5zaXplKVxyXG4gICAgaWYgKHN0YXRlLmxvYWRpbmcpIGNsYXNzZXMucHVzaCgnaXMtbG9hZGluZycpXHJcbiAgICBpZiAoc3RhdGUuaG92ZXJlZCkgY2xhc3Nlcy5wdXNoKCdpcy1ob3ZlcmVkJylcclxuICAgIGlmIChzdGF0ZS5mb2N1c2VkKSBjbGFzc2VzLnB1c2goJ2lzLWZvY3VzZWQnKVxyXG5cclxuICAgIHJldHVybiBjbGFzc2VzLmpvaW4oJyAnKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IGJ1bG1pZnkgPSAoc3RhdGUpID0+IHtcclxuICAgIGxldCBjbGFzc2VzID0gZ2V0X2NsYXNzZXMoc3RhdGUpXHJcbiAgICBsZXQgbmV3X3N0YXRlID0ge31cclxuICAgIGlmIChjbGFzc2VzKSBuZXdfc3RhdGUuY2xhc3MgPSBjbGFzc2VzXHJcbiAgICBPYmplY3Qua2V5cyhzdGF0ZSkuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgIGlmIChbJ2NvbG9yJywgJ3N0YXRlJywgJ3NpemUnLCAnbG9hZGluZycsXHJcbiAgICAgICAgICAgICdpY29uJywgJ2NvbnRlbnQnLCAnaG92ZXJlZCcsICdmb2N1c2VkJ10uaW5kZXhPZihrZXkpID09PSAtMSlcclxuICAgICAgICAgICAgbmV3X3N0YXRlW2tleV0gPSBzdGF0ZVtrZXldXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIG5ld19zdGF0ZVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29sbGVjdF9ib29sZWFuID0gKHN0YXRlLCBuYW1lcykgPT4ge1xyXG4gICAgbGV0IHN0eWxlcyA9IFtdXHJcbiAgICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4ge1xyXG4gICAgICAgIGlmIChuYW1lIGluIHN0YXRlICYmIHN0YXRlW25hbWVdID09PSB0cnVlKVxyXG4gICAgICAgICAgICBzdHlsZXMucHVzaCgnaXMtJyArIG5hbWUpXHJcbiAgICB9KVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IHNsZWVwID0gKHRpbWUpID0+XHJcbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKSlcclxuXHJcblxyXG5leHBvcnQgY29uc3Qgc21hbGxlcl90aGFuID0gKHN6KSA9PiBzeiA/IFNJWkVTW1NJWkVTLmluZGV4T2Yoc3opIC0gMV0gOiAnc21hbGwnXHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vaW5kZXguanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5leHBvcnQgY29uc3QgSWNvbiA9IHtcclxuICAgIHZpZXc6ICh7YXR0cnN9KSA9PlxyXG4gICAgICAgIG0oJ3NwYW4uaWNvbicsIHtjbGFzczogYXR0cnMuc2l6ZSA/ICdpcy0nICsgYXR0cnMuc2l6ZSA6ICcnfSxcclxuICAgICAgICAgICAgbSgnaS5mYScsIHtjbGFzczogJ2ZhLScgKyBhdHRycy5pY29ufSlcclxuICAgICAgICApXHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2VsZW1lbnRzL2ljb24uanMiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuXHJcbmNvbnN0IG9uY2xpY2sgPSAodm5vZGUsIHZhbCkgPT5cclxuICAgICgpID0+IHtcclxuICAgICAgICByZXNldCh2bm9kZSwgdmFsKVxyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB2bm9kZS5hdHRycy5vbmNsaWNrKHZhbClcclxuICAgIH1cclxuXHJcbmNvbnN0IHJlc2V0ID0gKHZub2RlLCB2YWwpID0+IHtcclxuICAgIHZub2RlLnN0YXRlLmN1cnJlbnQgPSB2YWxcclxuICAgIGxldCBtYXhfYnV0dG9ucyA9IHZub2RlLmF0dHJzLm1heF9idXR0b25zIHx8IDEwXHJcbiAgICBsZXQgbmIgPSB2bm9kZS5hdHRycy5uYlxyXG4gICAgaWYgKG5iID4gbWF4X2J1dHRvbnMpIHtcclxuICAgICAgICBsZXQgbWlkID0gbmIgLyAyXHJcbiAgICAgICAgaWYgKFsxLCAyXS5pbmNsdWRlcyh2YWwpKSB2bm9kZS5zdGF0ZS5idXR0b25zID0gWzEsIDIsIDMsIG51bGwsIG1pZCwgbnVsbCwgbmJdXHJcbiAgICAgICAgZWxzZSBpZiAoW25iLTEsIG5iXS5pbmNsdWRlcyh2YWwpKSB2bm9kZS5zdGF0ZS5idXR0b25zID0gWzEsIG51bGwsIG1pZCwgbnVsbCwgbmItMiwgbmItMSwgbmJdXHJcbiAgICAgICAgZWxzZSB2bm9kZS5zdGF0ZS5idXR0b25zID0gWzEsIG51bGwsIHZhbCAtIDEsIHZhbCwgdmFsICsgMSwgbnVsbCwgbmJdXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZub2RlLnN0YXRlLmJ1dHRvbnMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IG5iOyBpKyspIHZub2RlLnN0YXRlLmJ1dHRvbnMucHVzaChpKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUGFnaW5hdGlvbiA9IHtcclxuICAgIG9uaW5pdDogdm5vZGUgPT4gcmVzZXQodm5vZGUsIHZub2RlLmF0dHJzLmN1cnJlbnQgfHwgMSksXHJcblxyXG4gICAgdmlldzogdm5vZGUgPT4gbSgnbmF2LnBhZ2luYXRpb24nLFxyXG4gICAgICAgIG0oJ2EucGFnaW5hdGlvbi1wcmV2aW91cycsXHJcbiAgICAgICAgICAgIHtvbmNsaWNrOiBvbmNsaWNrKHZub2RlLCB2bm9kZS5zdGF0ZS5jdXJyZW50IC0gMSksXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdm5vZGUuc3RhdGUuY3VycmVudCA9PT0gMX0sXHJcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLnByZXZpb3VzX3RleHQgfHwgJ1ByZXZpb3VzJyksXHJcbiAgICAgICAgbSgnYS5wYWdpbmF0aW9uLW5leHQnLFxyXG4gICAgICAgICAgICB7b25jbGljazogb25jbGljayh2bm9kZSwgdm5vZGUuc3RhdGUuY3VycmVudCArIDEpLFxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHZub2RlLnN0YXRlLmN1cnJlbnQgPT09IHZub2RlLnN0YXRlLmJ1dHRvbnMubGVuZ3RofSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMubmV4dF90ZXh0IHx8ICdOZXh0JyksXHJcbiAgICAgICAgbSgndWwucGFnaW5hdGlvbi1saXN0JyxcclxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuYnV0dG9ucy5tYXAodmFsID0+IHZhbCA9PT0gbnVsbCA/XHJcbiAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ3NwYW4ucGFnaW5hdGlvbi1lbGxpcHNpcycsIG0udHJ1c3QoJyZoZWxsaXA7JykpKSA6XHJcbiAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ2EucGFnaW5hdGlvbi1saW5rJyxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5zdGF0ZS5jdXJyZW50ID09PSB2YWwgPyAnaXMtY3VycmVudCcgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrKHZub2RlLCB2YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdmFsKSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgIClcclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9wYWdpbmF0aW9uLmpzIiwiZXhwb3J0IHsgQm94IH0gZnJvbSAnLi9lbGVtZW50cy9ib3guanMnXG5leHBvcnQgeyBCdXR0b24gfSBmcm9tICcuL2VsZW1lbnRzL2J1dHRvbi5qcydcbmV4cG9ydCB7IEljb24gfSBmcm9tICcuL2VsZW1lbnRzL2ljb24uanMnXG5leHBvcnQgeyBMYWJlbCwgSW5wdXQsIFNlbGVjdCwgVGV4dEFyZWEsIENoZWNrQm94LCBSYWRpb30gZnJvbSAnLi9lbGVtZW50cy9mb3JtLmpzJ1xuZXhwb3J0IHsgSW1hZ2UgfSBmcm9tICcuL2VsZW1lbnRzL2ltYWdlLmpzJ1xuZXhwb3J0IHsgTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9lbGVtZW50cy9ub3RpZmljYXRpb24uanMnXG5leHBvcnQgeyBQcm9ncmVzcyB9IGZyb20gJy4vZWxlbWVudHMvcHJvZ3Jlc3MuanMnXG5leHBvcnQgeyBUYWJsZSB9IGZyb20gJy4vZWxlbWVudHMvdGFibGUuanMnXG5leHBvcnQgeyBUYWcgfSBmcm9tICcuL2VsZW1lbnRzL3RhZy5qcydcbmV4cG9ydCB7IFRpdGxlLCBTdWJUaXRsZSB9IGZyb20gJy4vZWxlbWVudHMvdGl0bGUuanMnXG5leHBvcnQgeyBDb250ZW50IH0gZnJvbSAnLi9lbGVtZW50cy9jb250ZW50LmpzJ1xuZXhwb3J0IHsgTGV2ZWwsIExldmVsSXRlbSB9IGZyb20gJy4vY29tcG9uZW50cy9sZXZlbC5qcydcbmV4cG9ydCB7IE1lZGlhIH0gZnJvbSAnLi9jb21wb25lbnRzL21lZGlhLmpzJ1xuZXhwb3J0IHsgTWVudSB9IGZyb20gJy4vY29tcG9uZW50cy9tZW51LmpzJ1xuZXhwb3J0IHsgTWVzc2FnZSB9IGZyb20gJy4vY29tcG9uZW50cy9tZXNzYWdlLmpzJ1xuZXhwb3J0IHsgTW9kYWwgfSBmcm9tICcuL2NvbXBvbmVudHMvbW9kYWwuanMnXG5leHBvcnQgeyBOYXYgfSBmcm9tICcuL2NvbXBvbmVudHMvbmF2LmpzJ1xuZXhwb3J0IHsgQ2FyZCwgQ2FyZEhlYWRlciwgQ2FyZENvbnRlbnQsIENhcmRGb290ZXIsIENhcmRGb290ZXJJdGVtfSBmcm9tICcuL2NvbXBvbmVudHMvY2FyZC5qcydcbmV4cG9ydCB7IFBhZ2luYXRpb24gfSBmcm9tICcuL2NvbXBvbmVudHMvcGFnaW5hdGlvbi5qcydcbmV4cG9ydCB7IFRhYnMgfSBmcm9tICcuL2NvbXBvbmVudHMvdGFicy5qcydcbmV4cG9ydCB7IFBhbmVsLCBQYW5lbEhlYWRpbmcsIFBhbmVsVGFicywgUGFuZWxCbG9ja3N9IGZyb20gJy4vY29tcG9uZW50cy9wYW5lbC5qcydcbmV4cG9ydCAqIGZyb20gJy4vY29tbW9uJ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IEJveCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnLmJveCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9lbGVtZW50cy9ib3guanMiLCJ2YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG4gIGlmICh0aW1lb3V0KSB7XG4gICAgdGltZW91dC5jbG9zZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIHNldGltbWVkaWF0ZSBhdHRhY2hlcyBpdHNlbGYgdG8gdGhlIGdsb2JhbCBvYmplY3RcbnJlcXVpcmUoXCJzZXRpbW1lZGlhdGVcIik7XG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSBjbGVhckltbWVkaWF0ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uIChnbG9iYWwsIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKGdsb2JhbC5zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXh0SGFuZGxlID0gMTsgLy8gU3BlYyBzYXlzIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgdmFyIHRhc2tzQnlIYW5kbGUgPSB7fTtcbiAgICB2YXIgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgdmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgcmVnaXN0ZXJJbW1lZGlhdGU7XG5cbiAgICBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoY2FsbGJhY2spIHtcbiAgICAgIC8vIENhbGxiYWNrIGNhbiBlaXRoZXIgYmUgYSBmdW5jdGlvbiBvciBhIHN0cmluZ1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKFwiXCIgKyBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgICAvLyBDb3B5IGZ1bmN0aW9uIGFyZ3VtZW50c1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICB9XG4gICAgICAvLyBTdG9yZSBhbmQgcmVnaXN0ZXIgdGhlIHRhc2tcbiAgICAgIHZhciB0YXNrID0geyBjYWxsYmFjazogY2FsbGJhY2ssIGFyZ3M6IGFyZ3MgfTtcbiAgICAgIHRhc2tzQnlIYW5kbGVbbmV4dEhhbmRsZV0gPSB0YXNrO1xuICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUobmV4dEhhbmRsZSk7XG4gICAgICByZXR1cm4gbmV4dEhhbmRsZSsrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGhhbmRsZSkge1xuICAgICAgICBkZWxldGUgdGFza3NCeUhhbmRsZVtoYW5kbGVdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bih0YXNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRhc2suY2FsbGJhY2s7XG4gICAgICAgIHZhciBhcmdzID0gdGFzay5hcmdzO1xuICAgICAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bklmUHJlc2VudChoYW5kbGUpIHtcbiAgICAgICAgLy8gRnJvbSB0aGUgc3BlYzogXCJXYWl0IHVudGlsIGFueSBpbnZvY2F0aW9ucyBvZiB0aGlzIGFsZ29yaXRobSBzdGFydGVkIGJlZm9yZSB0aGlzIG9uZSBoYXZlIGNvbXBsZXRlZC5cIlxuICAgICAgICAvLyBTbyBpZiB3ZSdyZSBjdXJyZW50bHkgcnVubmluZyBhIHRhc2ssIHdlJ2xsIG5lZWQgdG8gZGVsYXkgdGhpcyBpbnZvY2F0aW9uLlxuICAgICAgICBpZiAoY3VycmVudGx5UnVubmluZ0FUYXNrKSB7XG4gICAgICAgICAgICAvLyBEZWxheSBieSBkb2luZyBhIHNldFRpbWVvdXQuIHNldEltbWVkaWF0ZSB3YXMgdHJpZWQgaW5zdGVhZCwgYnV0IGluIEZpcmVmb3ggNyBpdCBnZW5lcmF0ZWQgYVxuICAgICAgICAgICAgLy8gXCJ0b28gbXVjaCByZWN1cnNpb25cIiBlcnJvci5cbiAgICAgICAgICAgIHNldFRpbWVvdXQocnVuSWZQcmVzZW50LCAwLCBoYW5kbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IHRydWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcnVuKHRhc2spO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW1tZWRpYXRlKGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7IHJ1bklmUHJlc2VudChoYW5kbGUpOyB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5Vc2VQb3N0TWVzc2FnZSgpIHtcbiAgICAgICAgLy8gVGhlIHRlc3QgYWdhaW5zdCBgaW1wb3J0U2NyaXB0c2AgcHJldmVudHMgdGhpcyBpbXBsZW1lbnRhdGlvbiBmcm9tIGJlaW5nIGluc3RhbGxlZCBpbnNpZGUgYSB3ZWIgd29ya2VyLFxuICAgICAgICAvLyB3aGVyZSBgZ2xvYmFsLnBvc3RNZXNzYWdlYCBtZWFucyBzb21ldGhpbmcgY29tcGxldGVseSBkaWZmZXJlbnQgYW5kIGNhbid0IGJlIHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgICAgaWYgKGdsb2JhbC5wb3N0TWVzc2FnZSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpIHtcbiAgICAgICAgICAgIHZhciBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBvbGRPbk1lc3NhZ2UgPSBnbG9iYWwub25tZXNzYWdlO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoXCJcIiwgXCIqXCIpO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IG9sZE9uTWVzc2FnZTtcbiAgICAgICAgICAgIHJldHVybiBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIC8vIEluc3RhbGxzIGFuIGV2ZW50IGhhbmRsZXIgb24gYGdsb2JhbGAgZm9yIHRoZSBgbWVzc2FnZWAgZXZlbnQ6IHNlZVxuICAgICAgICAvLyAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0RPTS93aW5kb3cucG9zdE1lc3NhZ2VcbiAgICAgICAgLy8gKiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9jb21tcy5odG1sI2Nyb3NzRG9jdW1lbnRNZXNzYWdlc1xuXG4gICAgICAgIHZhciBtZXNzYWdlUHJlZml4ID0gXCJzZXRJbW1lZGlhdGUkXCIgKyBNYXRoLnJhbmRvbSgpICsgXCIkXCI7XG4gICAgICAgIHZhciBvbkdsb2JhbE1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gZ2xvYmFsICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGV2ZW50LmRhdGEgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgICAgICAgICAgICBldmVudC5kYXRhLmluZGV4T2YobWVzc2FnZVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBydW5JZlByZXNlbnQoK2V2ZW50LmRhdGEuc2xpY2UobWVzc2FnZVByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbC5hdHRhY2hFdmVudChcIm9ubWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShtZXNzYWdlUHJlZml4ICsgaGFuZGxlLCBcIipcIik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGUgPSBldmVudC5kYXRhO1xuICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSA8c2NyaXB0PiBlbGVtZW50OyBpdHMgcmVhZHlzdGF0ZWNoYW5nZSBldmVudCB3aWxsIGJlIGZpcmVkIGFzeW5jaHJvbm91c2x5IG9uY2UgaXQgaXMgaW5zZXJ0ZWRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIGRvY3VtZW50LiBEbyBzbywgdGh1cyBxdWV1aW5nIHVwIHRoZSB0YXNrLiBSZW1lbWJlciB0byBjbGVhbiB1cCBvbmNlIGl0J3MgYmVlbiBjYWxsZWQuXG4gICAgICAgICAgICB2YXIgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudChoYW5kbGUpO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgICAgICBzY3JpcHQgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSWYgc3VwcG9ydGVkLCB3ZSBzaG91bGQgYXR0YWNoIHRvIHRoZSBwcm90b3R5cGUgb2YgZ2xvYmFsLCBzaW5jZSB0aGF0IGlzIHdoZXJlIHNldFRpbWVvdXQgZXQgYWwuIGxpdmUuXG4gICAgdmFyIGF0dGFjaFRvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihnbG9iYWwpO1xuICAgIGF0dGFjaFRvID0gYXR0YWNoVG8gJiYgYXR0YWNoVG8uc2V0VGltZW91dCA/IGF0dGFjaFRvIDogZ2xvYmFsO1xuXG4gICAgLy8gRG9uJ3QgZ2V0IGZvb2xlZCBieSBlLmcuIGJyb3dzZXJpZnkgZW52aXJvbm1lbnRzLlxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGdsb2JhbC5wcm9jZXNzKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIpIHtcbiAgICAgICAgLy8gRm9yIE5vZGUuanMgYmVmb3JlIDAuOVxuICAgICAgICBpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChjYW5Vc2VQb3N0TWVzc2FnZSgpKSB7XG4gICAgICAgIC8vIEZvciBub24tSUUxMCBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZ2xvYmFsLk1lc3NhZ2VDaGFubmVsKSB7XG4gICAgICAgIC8vIEZvciB3ZWIgd29ya2Vycywgd2hlcmUgc3VwcG9ydGVkXG4gICAgICAgIGluc3RhbGxNZXNzYWdlQ2hhbm5lbEltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGRvYyAmJiBcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiIGluIGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpKSB7XG4gICAgICAgIC8vIEZvciBJRSA24oCTOFxuICAgICAgICBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3Igb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFNldFRpbWVvdXRJbXBsZW1lbnRhdGlvbigpO1xuICAgIH1cblxuICAgIGF0dGFjaFRvLnNldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbiAgICBhdHRhY2hUby5jbGVhckltbWVkaWF0ZSA9IGNsZWFySW1tZWRpYXRlO1xufSh0eXBlb2Ygc2VsZiA9PT0gXCJ1bmRlZmluZWRcIiA/IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB0aGlzIDogZ2xvYmFsIDogc2VsZikpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvc2V0aW1tZWRpYXRlL3NldEltbWVkaWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuaW1wb3J0IHsgYnVsbWlmeSwgc21hbGxlcl90aGFuIH0gZnJvbSAnLi4vY29tbW9uJ1xyXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnLi9pY29uLmpzJ1xyXG5cclxuZXhwb3J0IGNvbnN0IGljb25fYnV0dG9uID0gKHZub2RlKSA9PiBbXHJcbiAgICAhdm5vZGUuYXR0cnMuaWNvbl9yaWdodCA/XHJcbiAgICAgICAgbShJY29uLCB7aWNvbjogdm5vZGUuYXR0cnMuaWNvbiwgc2l6ZTogc21hbGxlcl90aGFuKHZub2RlLmF0dHJzLnNpemUpfSkgOiAnJyxcclxuICAgIG0oJ3NwYW4nLCB2bm9kZS5hdHRycy5jb250ZW50KSxcclxuICAgIHZub2RlLmF0dHJzLmljb25fcmlnaHQgP1xyXG4gICAgICAgIG0oSWNvbiwge2ljb246IHZub2RlLmF0dHJzLmljb24sIHNpemU6IHNtYWxsZXJfdGhhbih2bm9kZS5hdHRycy5zaXplKX0pIDogJydcclxuXVxyXG5cclxuZXhwb3J0IGNvbnN0IEJ1dHRvbiA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnYS5idXR0b24nLCBidWxtaWZ5KHZub2RlLmF0dHJzKSxcclxuICAgICAgICB2bm9kZS5hdHRycy5pY29uID8gaWNvbl9idXR0b24odm5vZGUpIDogdm5vZGUuYXR0cnMuY29udGVudClcclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZWxlbWVudHMvYnV0dG9uLmpzIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnLi9pY29uJ1xyXG5pbXBvcnQgeyBidWxtaWZ5IH0gZnJvbSAnLi4vY29tbW9uJ1xyXG5cclxuZXhwb3J0IGNvbnN0IExhYmVsID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdsYWJlbC5sYWJlbCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgSW5wdXQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ3AuY29udHJvbCcsXHJcbiAgICAgICAgeyBjbGFzczogdm5vZGUuYXR0cnMuaWNvbiA/ICdoYXMtaWNvbiBoYXMtaWNvbi1yaWdodCcgOiAnJyB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgbSgnaW5wdXQuaW5wdXRbdHlwZT10ZXh0XScsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuaWNvbiA/IG0oSWNvbiwge3NpemU6ICdzbWFsbCcsIGljb246IHZub2RlLmF0dHJzLmljb259KSA6ICcnXHJcbiAgICAgICAgXVxyXG4gICAgKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU2VsZWN0ID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT5cclxuICAgICAgICBtKCdwLmNvbnRyb2wnLFxyXG4gICAgICAgICAgICBtKCdzcGFuLnNlbGVjdCcsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLFxyXG4gICAgICAgICAgICAgICAgbSgnc2VsZWN0JyxcclxuICAgICAgICAgICAgICAgICAgICB2bm9kZS5hdHRycy5jaG9pY2VzLm1hcChrID0+IG0oJ29wdGlvbicsIHt2YWx1ZToga1swXX0sIGtbMV0pKVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFRleHRBcmVhID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT5cclxuICAgICAgICBtKFwicC5jb250cm9sXCIsXHJcbiAgICAgICAgICAgIG0oXCJ0ZXh0YXJlYS50ZXh0YXJlYVwiLCBidWxtaWZ5KHZub2RlLmF0dHJzKSlcclxuICAgICAgICApXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3QgQ2hlY2tCb3ggPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PlxyXG4gICAgICAgIG0oXCJwLmNvbnRyb2xcIixcclxuICAgICAgICAgICAgbShcImxhYmVsLmNoZWNrYm94XCIsXHJcbiAgICAgICAgICAgICAgICBtKFwiaW5wdXRbdHlwZT0nY2hlY2tib3gnXVwiLCBidWxtaWZ5KHZub2RlLmF0dHJzKSksXHJcbiAgICAgICAgICAgICAgICB2bm9kZS5hdHRycy5jb250ZW50XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3QgUmFkaW8gPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PlxyXG4gICAgICAgIG0oXCJwLmNvbnRyb2xcIixcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuY2hvaWNlcy5tYXAoayA9PlxyXG4gICAgICAgICAgICAgICAgbShcImxhYmVsLnJhZGlvXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbShcImlucHV0W3R5cGU9J3JhZGlvJ11cIiwge3ZhbHVlOiBrWzBdLCBuYW1lOiB2bm9kZS5hdHRycy5uYW1lfSksXHJcbiAgICAgICAgICAgICAgICAgICAga1sxXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9lbGVtZW50cy9mb3JtLmpzIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuXG5leHBvcnQgY29uc3QgSW1hZ2UgPSB7XG4gICAgdmlldzogdm5vZGUgPT5cbiAgICAgICAgbSgnZmlndXJlLmltYWdlJyxcbiAgICAgICAgICAgIHtjbGFzczogdm5vZGUuYXR0cnMuc2l6ZSA/XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5zaXplICsgJ3gnICsgdm5vZGUuYXR0cnMuc2l6ZSA6XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5yYXRpb30sXG4gICAgICAgICAgICBtKCdpbWcnLCB7c3JjOiB2bm9kZS5hdHRycy5zcmN9KSlcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9lbGVtZW50cy9pbWFnZS5qcyIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGJ1bG1pZnkgfSBmcm9tICcuLi9jb21tb24nXG5cbmV4cG9ydCBjb25zdCBOb3RpZmljYXRpb24gPSB7XG4gICAgdmlldzogdm5vZGUgPT5cbiAgICAgICAgbShcIi5ub3RpZmljYXRpb25cIiwgYnVsbWlmeSh2bm9kZS5hdHRycyksXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5kZWxldGUgP1xuICAgICAgICAgICAgICAgIG0oXCJidXR0b24uZGVsZXRlXCIsIHtvbmNsaWNrOiB2bm9kZS5hdHRycy5vbmNsaWNrfSkgOiAnJyxcbiAgICAgICAgICAgIHZub2RlLmNoaWxkcmVuXG4gICAgICAgIClcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9lbGVtZW50cy9ub3RpZmljYXRpb24uanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBidWxtaWZ5IH0gZnJvbSAnLi4vY29tbW9uJ1xuXG5leHBvcnQgY29uc3QgUHJvZ3Jlc3MgPSB7XG4gICAgdmlldzogdm5vZGUgPT5cbiAgICAgICAgbShcInByb2dyZXNzLnByb2dyZXNzXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLFxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cbiAgICAgICAgKVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2VsZW1lbnRzL3Byb2dyZXNzLmpzIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgY29sbGVjdF9ib29sZWFuIH0gZnJvbSAnLi4vY29tbW9uJ1xuaW1wb3J0IHsgUGFnaW5hdGlvbiB9IGZyb20gJy4uL2NvbXBvbmVudHMvcGFnaW5hdGlvbi5qcydcblxuY29uc3QgU1RZTEVTID0gWydib3JkZXJlZCcsICdzdHJpcGVkJywgJ25hcnJvdyddXG5cbmNvbnN0IGhlYWRlcl9jb2wgPSAodm5vZGUsIGl0ZW0sIGlkeCkgPT4ge1xuICAgIGxldCB3YXkgPSAoaWR4ID09PSB2bm9kZS5zdGF0ZS5zb3J0X2J5KSA/XG4gICAgICAgICh2bm9kZS5zdGF0ZS5zb3J0X2FzYyA/ICcgVScgOiAnIEQnKSA6ICcnXG4gICAgcmV0dXJuIGl0ZW0ubmFtZSArIHdheVxufVxuXG5cbmNvbnN0IHRoX3RmID0gKHZub2RlLCB0YWcpID0+XG4gICAgbSh0YWcgPT09ICdoZWFkZXInID8gJ3RoZWFkJyA6ICd0Zm9vdCcsXG4gICAgICAgIG0oJ3RyJyxcbiAgICAgICAgICAgIHZub2RlLmF0dHJzW3RhZ10ubWFwKChpdGVtLCBpZHgpID0+XG4gICAgICAgICAgICAgICAgbSgndGgnLCB7b25jbGljazogaXRlbS5zb3J0YWJsZSA/IHNvcnRoYW5kbGVyKHZub2RlLCBpZHgpOiBudWxsfSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50aXRsZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhYmJyJywge3RpdGxlOiBpdGVtLnRpdGxlfSwgaGVhZGVyX2NvbCh2bm9kZSwgaXRlbSwgaWR4KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaGVhZGVyX2NvbCh2bm9kZSwgaXRlbSwgaWR4KSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIClcblxuY29uc3QgY29tcGFyYXRvciA9IGlkeCA9PlxuICAgIChhLCBiKSA9PiB7XG4gICAgICBpZiAoYVtpZHhdIDwgYltpZHhdKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIChhW2lkeF0gPiBiW2lkeF0pXG4gICAgICAgIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICAgIH1cblxuY29uc3Qgc29ydGhhbmRsZXIgPSAodm5vZGUsIGlkeCkgPT5cbiAgICAoKSA9PiB7XG4gICAgICAgIGlmICh2bm9kZS5zdGF0ZS5zb3J0X2J5ID09PSBpZHgpXG4gICAgICAgICAgICB2bm9kZS5zdGF0ZS5zb3J0X2FzYyA9ICEgdm5vZGUuc3RhdGUuc29ydF9hc2NcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9hc2MgPSB0cnVlXG5cbiAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9ieSA9IGlkeFxuICAgICAgICB2bm9kZS5zdGF0ZS5yb3dzLnNvcnQoY29tcGFyYXRvcihpZHgpKVxuICAgICAgICBpZiAoISB2bm9kZS5zdGF0ZS5zb3J0X2FzYylcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLnJvd3MucmV2ZXJzZSgpXG4gICAgfVxuXG5leHBvcnQgY29uc3QgVGFibGUgPSB7XG5cbiAgICBvbmluaXQ6IHZub2RlID0+IHtcbiAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9ieSA9IG51bGxcbiAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9hc2MgPSB0cnVlXG4gICAgICAgIHZub2RlLnN0YXRlLnJvd3MgPSB2bm9kZS5hdHRycy5yb3dzXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5wYWdpbmF0ZV9ieSl7XG4gICAgICAgICAgICB2bm9kZS5zdGF0ZS5wYWdlID0gMVxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuc3RhcnRfYXQgPSAwXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuZGlzcGxheV9yb3dzID0gdm5vZGUuYXR0cnMucm93c1xuICAgIH0sXG5cbiAgICB2aWV3OiB2bm9kZSA9PiBbXG4gICAgICAgIG0oJ3RhYmxlLnRhYmxlJywge2NsYXNzOiBjb2xsZWN0X2Jvb2xlYW4odm5vZGUuYXR0cnMsIFNUWUxFUyl9LFxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuaGVhZGVyID8gdGhfdGYodm5vZGUsICdoZWFkZXInKSA6IG51bGwsXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5mb290ZXIgPyB0aF90Zih2bm9kZSwgJ2Zvb3RlcicpIDogbnVsbCxcbiAgICAgICAgICAgIG0oJ3Rib2R5JyxcbiAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5yb3dzLnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5zdGFydF9hdCxcbiAgICAgICAgICAgICAgICAgICAgdm5vZGUuc3RhdGUuc3RhcnRfYXQgKyB2bm9kZS5hdHRycy5wYWdpbmF0ZV9ieSkubWFwKHJvdyA9PlxuICAgICAgICAgICAgICAgICAgICBtKCd0cicsIHJvdy5tYXAoY29sID0+IG0oJ3RkJywgY29sKSkpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICApXG4gICAgICAgICksXG5cbiAgICAgICAgdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkgP1xuICAgICAgICAgICAgbShQYWdpbmF0aW9uLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmI6IE1hdGguY2VpbCh2bm9kZS5zdGF0ZS5yb3dzLmxlbmd0aCAvIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KSxcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogbmIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm5vZGUuc3RhdGUucGFnZSA9IG5iXG4gICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5zdGFydF9hdCA9IG5iID09PSAxID8gMCA6ICgobmIgLTEpICogdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApIDogbnVsbFxuICAgIF1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9lbGVtZW50cy90YWJsZS5qcyIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuaW1wb3J0IHsgYnVsbWlmeSB9IGZyb20gJy4uL2NvbW1vbidcclxuXHJcbmV4cG9ydCBjb25zdCBUYWcgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ3NwYW4udGFnJywgYnVsbWlmeSh2bm9kZS5hdHRycyksIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9lbGVtZW50cy90YWcuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5cblxuZXhwb3J0IGNvbnN0IFRpdGxlID0ge1xuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnaCcgKyB2bm9kZS5hdHRycy5zaXplICsgJy50aXRsZScgKyAnLmlzLScgKyB2bm9kZS5hdHRycy5zaXplLCB2bm9kZS5jaGlsZHJlbilcbn1cblxuXG5leHBvcnQgY29uc3QgU3ViVGl0bGUgPSB7XG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdoJyArIHZub2RlLmF0dHJzLnNpemUgKyAnLnN1YnRpdGxlJyArICcuaXMtJyArIHZub2RlLmF0dHJzLnNpemUsIHZub2RlLmNoaWxkcmVuKVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2VsZW1lbnRzL3RpdGxlLmpzIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IENvbnRlbnQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+XHJcbiAgICAgICAgbSgnY29udGVudCcsIHtjbGFzczogdm5vZGUuYXR0cnMuc2l6ZSA/ICdpcy0nICsgdm5vZGUuYXR0cnMuc2l6ZSA6ICcnfSxcclxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cclxuICAgICAgICApXHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2VsZW1lbnRzL2NvbnRlbnQuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5leHBvcnQgY29uc3QgTGV2ZWwgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ25hdi5sZXZlbCcsXHJcbiAgICAgICAgeydpcy1tb2JpbGUnOiB2bm9kZS5hdHRycy5tb2JpbGV9LCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IExldmVsTGVmdCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnZGl2LmxldmVsLWxlZnQnLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IExldmVsUmlnaHQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2Rpdi5sZXZlbC1yaWdodCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgTGV2ZWxJdGVtID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdwLmxldmVsLWl0ZW0nLFxyXG4gICAgICAgIHtjbGFzczogdm5vZGUuYXR0cnMuY2VudGVyZWQgPyAnaGFzLXRleHQtY2VudGVyZWQnOiAnJ30sIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9sZXZlbC5qcyIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuXHJcbmV4cG9ydCBjb25zdCBNZWRpYUxlZnQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2ZpZ3VyZS5tZWRpYS1sZWZ0Jywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBNZWRpYUNvbnRlbnQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2Rpdi5tZWRpYS1jb250ZW50Jywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBNZWRpYVJpZ2h0ID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdkaXYubWVkaWEtcmlnaHQnLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IE1lZGlhID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdhcnRpY2xlLm1lZGlhJywgW1xyXG5cclxuICAgICAgICB2bm9kZS5hdHRycy5pbWFnZSA/XHJcbiAgICAgICAgICAgIG0oTWVkaWFMZWZ0LCBtKCdwLmltYWdlJywge2NsYXNzOiAnaXMtJyArIHZub2RlLmF0dHJzLmltYWdlLnJhdGlvfSxcclxuICAgICAgICAgICAgICAgIG0oJ2ltZycsIHsnc3JjJzogdm5vZGUuYXR0cnMuaW1hZ2Uuc3JjfSkpKSA6ICcnLFxyXG5cclxuICAgICAgICBtKE1lZGlhQ29udGVudCwgdm5vZGUuY2hpbGRyZW4pLFxyXG5cclxuICAgICAgICB2bm9kZS5hdHRycy5idXR0b24gPyBtKE1lZGlhUmlnaHQsIHZub2RlLmF0dHJzLmJ1dHRvbikgOiAnJ1xyXG4gICAgXSlcclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9tZWRpYS5qcyIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuaW1wb3J0IHsgSWNvbiB9IGZyb20gJy4uL2VsZW1lbnRzL2ljb24uanMnXHJcblxyXG5jb25zdCBjbGlja2hhbmRsZXIgPSAoZ2xvYmFsX3N0YXRlLCBpdGVtLCBzdGF0ZSkgPT5cclxuICAgICgpID0+IHtcclxuICAgICAgICBnbG9iYWxfc3RhdGUuc2VsZWN0ZWQgPSBpdGVtLmtleVxyXG4gICAgICAgIGlmIChnbG9iYWxfc3RhdGUuY29sbGFwc2FibGUgJiYgc3RhdGUpIHN0YXRlLmNvbGxhcHNlZCA9ICEgc3RhdGUuY29sbGFwc2VkXHJcbiAgICAgICAgaWYgKGl0ZW0ub25jbGljaykgaXRlbS5vbmNsaWNrKGl0ZW0ua2V5KVxyXG4gICAgfVxyXG5cclxuXHJcbmNvbnN0IE1lbnVJdGVtID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gdm5vZGUuYXR0cnMucm9vdC5jb2xsYXBzZWQgfHwgZmFsc2VcclxuICAgIH0sXHJcbiAgICB2aWV3OiB2bm9kZSA9PlxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgbSgnYScsIHtvbmNsaWNrOiBjbGlja2hhbmRsZXIodm5vZGUuYXR0cnMuc3RhdGUsIHZub2RlLmF0dHJzLnJvb3QsIHZub2RlLnN0YXRlKSxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5hdHRycy5zdGF0ZS5zZWxlY3RlZCA9PT0gdm5vZGUuYXR0cnMucm9vdC5rZXkgPyBcImlzLWFjdGl2ZVwiIDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICB2bm9kZS5hdHRycy5yb290LmxhYmVsLFxyXG4gICAgICAgICAgICAgICAgdm5vZGUuYXR0cnMuc3RhdGUuY29sbGFwc2FibGUgPyBcclxuICAgICAgICAgICAgICAgICAgICAodm5vZGUuc3RhdGUuY29sbGFwc2VkID8gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oSWNvbiwge2ljb246ICdjYXJldC11cCcsIHNpemU6ICdzbWFsbCd9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG0oSWNvbiwge2ljb246ICdjYXJldC1kb3duJywgc2l6ZTogJ3NtYWxsJ30pKTogbnVsbCksXHJcbiAgICAgICAgICAgICghdm5vZGUuYXR0cnMuc3RhdGUuY29sbGFwc2FibGUgfHwgIXZub2RlLnN0YXRlLmNvbGxhcHNlZCkgJiYgdm5vZGUuYXR0cnMucm9vdC5pdGVtcyA/XHJcbiAgICAgICAgICAgICAgICBtKCd1bCcsIHZub2RlLmF0dHJzLnJvb3QuaXRlbXMubWFwKGl0ZW0gPT5cclxuICAgICAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ2EnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5hdHRycy5zdGF0ZS5zZWxlY3RlZCA9PT0gaXRlbS5rZXkgPyBcImlzLWFjdGl2ZVwiIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY2xpY2toYW5kbGVyKHZub2RlLmF0dHJzLnN0YXRlLCBpdGVtLCBudWxsKX0sIGl0ZW0ubGFiZWwpKSkpXHJcbiAgICAgICAgICAgICAgICA6IG51bGxcclxuICAgICAgICBdXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBNZW51ID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUgPSB2bm9kZS5hdHRyc1xyXG4gICAgICAgIHZub2RlLnN0YXRlLmNvbGxhcHNhYmxlID0gIHZub2RlLmF0dHJzLmNvbGxhcHNhYmxlIHx8IGZhbHNlXHJcbiAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gdm5vZGUuYXR0cnMuY29sbGFwc2VkIHx8IGZhbHNlXHJcbiAgICB9LFxyXG4gICAgdmlldzogdm5vZGUgPT4gbSgnYXNpZGUubWVudScsXHJcbiAgICAgICAgdm5vZGUuc3RhdGUuaXRlbXMubWFwKG1lbnUgPT4gW1xyXG4gICAgICAgICAgICBtKCdwLm1lbnUtbGFiZWwnLCB7b25jbGljazogdm5vZGUuYXR0cnMuY29sbGFwc2FibGUgPyBcclxuICAgICAgICAgICAgICAgICgpID0+IHZub2RlLnN0YXRlLmNvbGxhcHNlZCA9ICF2bm9kZS5zdGF0ZS5jb2xsYXBzZWQgOiBudWxsfSwgXHJcbiAgICAgICAgICAgICAgICBtZW51LmxhYmVsLCBcclxuICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLmNvbGxhcHNhYmxlID8gXHJcbiAgICAgICAgICAgICAgICAgICAgKHZub2RlLnN0YXRlLmNvbGxhcHNlZCA/IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKEljb24sIHtpY29uOiAnY2FyZXQtdXAnLCBzaXplOiAnc21hbGwnfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBtKEljb24sIHtpY29uOiAnY2FyZXQtZG93bicsIHNpemU6ICdzbWFsbCd9KSk6IG51bGwpLFxyXG4gICAgICAgICAgICAhdm5vZGUuc3RhdGUuY29sbGFwc2FibGUgfHwgIXZub2RlLnN0YXRlLmNvbGxhcHNlZCA/XHJcbiAgICAgICAgICAgICAgICBtKCd1bC5tZW51LWxpc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuaXRlbXMubWFwKGl0ZW0gPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGknLCBtKE1lbnVJdGVtLCB7c3RhdGU6IHZub2RlLnN0YXRlLCByb290OiBpdGVtfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKSA6IG51bGxcclxuICAgICAgICBdKVxyXG4gICAgKVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL21lbnUuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5leHBvcnQgY29uc3QgTWVzc2FnZSA9IHtcclxuICAgIHZpZXc6IHZub2RlID0+IG0oJ2FydGljbGUubWVzc2FnZScsXHJcbiAgICAgICAge2NsYXNzOiB2bm9kZS5hdHRycy5jb2xvciA/ICdpcy0nICsgdm5vZGUuYXR0cnMuY29sb3IgOiAnJ30sIFtcclxuICAgICAgICB2bm9kZS5hdHRycy5oZWFkZXIgP1xyXG4gICAgICAgICAgICBtKCcubWVzc2FnZS1oZWFkZXInLCBtKCdwJywgdm5vZGUuYXR0cnMuaGVhZGVyKSxcclxuICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLm9uY2xvc2UgPyBtKCdidXR0b24nLFxyXG4gICAgICAgICAgICAgICAgICAgIHtjbGFzczogJ2RlbGV0ZScsIG9uY2xpY2s6IHZub2RlLmF0dHJzLm9uY2xvc2V9KTogJycpXHJcbiAgICAgICAgOiAnJyxcclxuICAgICAgICBtKCcubWVzc2FnZS1ib2R5Jywgdm5vZGUuY2hpbGRyZW4pXHJcbiAgICBdKVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL21lc3NhZ2UuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5leHBvcnQgY29uc3QgTW9kYWwgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCcubW9kYWwnLCB7Y2xhc3M6IHZub2RlLmF0dHJzLmFjdGl2ZSA/ICdpcy1hY3RpdmUnOiAnJ30sIFtcclxuICAgICAgICAgICAgbSgnLm1vZGFsLWJhY2tncm91bmQnKSxcclxuICAgICAgICAgICAgbSgnLm1vZGFsLWNvbnRlbnQnLCB2bm9kZS5jaGlsZHJlbiksXHJcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLm9uY2xvc2UgPyBtKCcuYnV0dG9uLm1vZGFsLWNsb3NlJywge29uY2xpY2s6IHZub2RlLmF0dHJzLm9uY2xvc2V9KTogJydcclxuICAgIF0pXHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbXBvbmVudHMvbW9kYWwuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5cclxuY29uc3QgZ2V0X2NsYXNzID0gKHZub2RlLCBpdGVtKSA9PiB7XHJcbiAgICBsZXQgY2xhc3NlcyA9IHZub2RlLmF0dHJzLnRhYiA/ICdpcy10YWInIDogJydcclxuICAgIGlmIChpdGVtLmhpZGRlbikgY2xhc3NlcyArPSAgJyBpcy1oaWRkZW4nICsgaXRlbS5oaWRkZW5cclxuICAgIGlmICh2bm9kZS5zdGF0ZS5hY3RpdmUgPT09IGl0ZW0ua2V5KSBjbGFzc2VzICs9ICAnIGlzLWFjdGl2ZSdcclxuICAgIHJldHVybiBjbGFzc2VzXHJcbn1cclxuXHJcbmNvbnN0IGNsaWNraGFuZGxlciA9ICh2bm9kZSwgaXRlbSkgPT5cclxuICAgICgpID0+IHtcclxuICAgICAgICB2bm9kZS5zdGF0ZS5hY3RpdmUgPSBpdGVtLmtleVxyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB2bm9kZS5hdHRycy5vbmNsaWNrKGl0ZW0pXHJcbiAgICAgICAgaWYgKGl0ZW0ub25jbGljaykgaXRlbS5vbmNsaWNrKGl0ZW0pXHJcbiAgICB9XHJcblxyXG5leHBvcnQgY29uc3QgTmF2VG9nZ2xlID0ge1xyXG4gICAgdmlldzogKCkgPT4gbSgnc3Bhbi5uYXYtdG9nZ2xlJywgbSgnc3BhbicpLCBtKCdzcGFuJyksIG0oJ3NwYW4nKSlcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IE5hdkl0ZW1zID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB2bm9kZS5zdGF0ZS5hY3RpdmUgPSB2bm9kZS5hdHRycy5hY3RpdmUsXHJcbiAgICB2aWV3OiB2bm9kZSA9PiB2bm9kZS5hdHRycy5pdGVtcy5tYXAoaXRlbSA9PlxyXG4gICAgICAgIG0oJ2EubmF2LWl0ZW0nLCB7Y2xhc3M6IGdldF9jbGFzcyh2bm9kZSwgaXRlbSksIG9uY2xpY2s6IGNsaWNraGFuZGxlcihpdGVtKX0sIGl0ZW0uY29udGVudCkpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBOYXYgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCduYXYubmF2Jywge2NsYXNzOiB2bm9kZS5hdHRycy5zaGFkb3cgPyAnaGFzLXNoYWRvdyc6IG51bGx9LCBbXHJcbiAgICAgICAgdm5vZGUuYXR0cnMubGVmdCA/IG0oJy5uYXYtbGVmdCcsIHZub2RlLmF0dHJzLmxlZnQubWFwKGl0ZW0gPT4gbSgnYS5uYXYtaXRlbScsIGl0ZW0pKSkgOiBudWxsLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLmNlbnRlciA/IG0oJy5uYXYtY2VudGVyJywgdm5vZGUuYXR0cnMuY2VudGVyLm1hcChpdGVtID0+IG0oJ2EubmF2LWl0ZW0nLCBpdGVtKSkpIDogbnVsbCxcclxuICAgICAgICB2bm9kZS5hdHRycy5yaWdodCA/IG0oJy5uYXYtcmlnaHQnLCB2bm9kZS5hdHRycy5yaWdodC5tYXAoaXRlbSA9PiBtKCdhLm5hdi1pdGVtJywgaXRlbSkpKSA6IG51bGxcclxuICAgIF0pXHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbXBvbmVudHMvbmF2LmpzIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnLi4vZWxlbWVudHMvaWNvbi5qcydcclxuXHJcbmV4cG9ydCBjb25zdCBDYXJkSW1hZ2UgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+XHJcbiAgICAgICAgbSgnY2FyZC1pbWFnZScsXHJcbiAgICAgICAgICAgIG0oJ2ZpZ3VyZS5pbWFnZScsIHtjbGFzczogJ2lzLScgKyB2bm9kZS5hdHRycy5yYXRpb30sXHJcbiAgICAgICAgICAgICAgICBtKCdpbWcnLCB7c3JjOiB2bm9kZS5hdHRycy5zcmN9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgQ2FyZEhlYWRlciA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnaGVhZGVyLmNhcmQtaGVhZGVyJywgW1xyXG4gICAgICAgIG0oJ3AuY2FyZC1oZWFkZXItdGl0bGUnLCB2bm9kZS5hdHRycy50aXRsZSksXHJcbiAgICAgICAgbSgnYS5jYXJkLWhlYWRlci1pY29uJywgdm5vZGUuYXR0cnMuaWNvbilcclxuICAgIF0pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBDYXJkRm9vdGVyID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdmb290ZXIuY2FyZC1mb290ZXInLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IENhcmRGb290ZXJJdGVtID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdhLmNhcmQtZm9vdGVyLWl0ZW0nLCB2bm9kZS5hdHRycylcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IENhcmRDb250ZW50ID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT4gbSgnLmNhcmQtY29udGVudCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgQ2FyZCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT5cclxuICAgICAgICBtKCcuY2FyZCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL2NhcmQuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcbmltcG9ydCB7IEljb24gfSBmcm9tICcuLi9lbGVtZW50cy9pY29uLmpzJ1xyXG5cclxuY29uc3Qgb25jbGljayA9ICh2bm9kZSwgaXRlbSwgaWR4KSA9PlxyXG4gICAgKCkgPT4ge1xyXG4gICAgICAgIHZub2RlLnN0YXRlLmFjdGl2ZSA9IGlkeFxyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB2bm9kZS5hdHRycy5vbmNsaWNrKGl0ZW0pXHJcbiAgICB9XHJcblxyXG5leHBvcnQgY29uc3QgVGFic01lbnUgPSB7XHJcbiAgICBvbmluaXQ6IHZub2RlID0+IHZub2RlLnN0YXRlLmFjdGl2ZSA9IHZub2RlLmF0dHJzLmFjdGl2ZSB8fCAwLFxyXG5cclxuICAgIHZpZXc6IHZub2RlID0+IG0oJy50YWJzJywgbSgndWwnLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLml0ZW1zLm1hcCgoaXRlbSwgaWR4KSA9PlxyXG4gICAgICAgICAgICBtKCdsaScsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGlkeCA9PT0gdm5vZGUuc3RhdGUuYWN0aXZlID8gJ2lzLWFjdGl2ZScgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IG9uY2xpY2sodm5vZGUsIGl0ZW0sIGlkeClcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtKCdhJywgaXRlbS5pY29uID8gW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uaWNvbi5pcy1zbWFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnaS5mYScsIHtjbGFzczogJ2ZhLScgKyBpdGVtLmljb259KSksIG0oJ3NwYW4nLCBpdGVtLmxhYmVsKV1cclxuICAgICAgICAgICAgICAgICAgICA6IGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICApKVxyXG59XHJcblxyXG5cclxuY29uc3QgY2xpY2toYW5kbGVyID0gdm5vZGUgPT5cclxuICAgIGl0ZW0gPT4gdm5vZGUuc3RhdGUuYWN0aXZlID0gaXRlbS5rZXlcclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuYWN0aXZlID0gdm5vZGUuYXR0cnMuYWN0aXZlIHx8IDBcclxuICAgICAgICB2bm9kZS5zdGF0ZS5pdGVtcyA9IHZub2RlLmF0dHJzLml0ZW1zLm1hcCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIGl0ZW0ua2V5ID0gaWR4XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtXHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgdmlldzogdm5vZGUgPT5cclxuICAgICAgICBtKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCcsIGZsZXg6ICcxJywgd2lkdGg6ICcxMDAlJywgJ2ZsZXgtZGlyZWN0aW9uJzogJ2NvbHVtbid9fSwgW1xyXG4gICAgICAgICAgICBtKFRhYnNNZW51LCB7YWN0aXZlOiB2bm9kZS5zdGF0ZS5hY3RpdmUsIG9uY2xpY2s6IGNsaWNraGFuZGxlcih2bm9kZSksIGl0ZW1zOiB2bm9kZS5zdGF0ZS5pdGVtc30pLFxyXG4gICAgICAgICAgICB2bm9kZS5zdGF0ZS5pdGVtcy5tYXAoaXRlbSA9PlxyXG4gICAgICAgICAgICAgICAgbSgnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICB7c3R5bGU6IHtkaXNwbGF5OiBpdGVtLmtleSA9PT0gdm5vZGUuc3RhdGUuYWN0aXZlID8gJ2Jsb2NrJzogJ25vbmUnLCAnbWFyZ2luLWxlZnQnOiAnMTBweCd9fSxcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbnRlbnRcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIF0pXHJcblxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3RhYnMuanMiLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcbmltcG9ydCB7IEljb24gfSBmcm9tICcuLi9lbGVtZW50cy9pY29uLmpzJ1xyXG5cclxuY29uc3Qgb25jbGljayA9ICh2bm9kZSwgaXRlbSwgaWR4KSA9PlxyXG4gICAgKCkgPT4ge1xyXG4gICAgICAgIGlmICh2bm9kZS5zdGF0ZS5hY3RpdmUgPT09IGlkeCkgdm5vZGUuc3RhdGUuYWN0aXZlID0gbnVsbFxyXG4gICAgICAgIGVsc2Ugdm5vZGUuc3RhdGUuYWN0aXZlID0gaWR4XHJcbiAgICAgICAgaWYgKHZub2RlLmF0dHJzLm9uY2xpY2spIHZub2RlLmF0dHJzLm9uY2xpY2soaXRlbSlcclxuICAgIH1cclxuXHJcbmV4cG9ydCBjb25zdCBQYW5lbCA9IHtcclxuICAgIHZpZXc6IHZub2RlID0+IG0oJ25hdi5wYW5lbCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUGFuZWxIZWFkaW5nID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT4gbSgncC5wYW5lbC1oZWFkaW5nJywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBQYW5lbFRhYnMgPSB7XHJcbiAgICBvbmluaXQ6IHZub2RlID0+IHZub2RlLnN0YXRlLmFjdGl2ZSA9IHZub2RlLmF0dHJzLmFjdGl2ZSB8fCBudWxsLFxyXG5cclxuICAgIHZpZXc6IHZub2RlID0+IG0oJy5wYW5lbC10YWJzJyxcclxuICAgICAgICB2bm9kZS5hdHRycy5pdGVtcy5tYXAoKGl0ZW0sIGlkeCkgPT5cclxuICAgICAgICAgICAgbSgnYScsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGlkeCA9PT0gdm5vZGUuc3RhdGUuYWN0aXZlID8gJ2lzLWFjdGl2ZScgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IG9uY2xpY2sodm5vZGUsIGl0ZW0sIGlkeClcclxuICAgICAgICAgICAgICAgIH0sIGl0ZW0ubGFiZWxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgIClcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFBhbmVsQmxvY2sgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCcucGFuZWwtYmxvY2snLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFBhbmVsQmxvY2tzID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB2bm9kZS5zdGF0ZS5hY3RpdmUgPSB2bm9kZS5hdHRycy5hY3RpdmUgfHwgbnVsbCxcclxuXHJcbiAgICB2aWV3OiB2bm9kZSA9PiB2bm9kZS5hdHRycy5pdGVtcy5tYXAoKGl0ZW0sIGlkeCkgPT5cclxuICAgICAgICBtKCdhLnBhbmVsLWJsb2NrJywge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGlkeCA9PT0gdm5vZGUuc3RhdGUuYWN0aXZlID8gJ2lzLWFjdGl2ZScgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgb25jbGljazogb25jbGljayh2bm9kZSwgaXRlbSwgaWR4KVxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIG0oJ3NwYW4ucGFuZWwtaWNvbicsIG0oJ2kuZmEnLCB7Y2xhc3M6ICdmYS0nICsgaXRlbS5pY29ufSkpLFxyXG4gICAgICAgICAgICBpdGVtLmxhYmVsXHJcbiAgICAgICAgXSlcclxuICAgIClcclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9wYW5lbC5qcyJdLCJzb3VyY2VSb290IjoiIn0=