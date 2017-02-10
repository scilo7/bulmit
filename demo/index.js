(function (exports) {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var mithril = createCommonjsModule(function (module) {
new function() {

function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: {}, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) { return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined) }
	if (node != null && typeof node !== "object") { return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined) }
	return node
};
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i]);
	}
	return children
};
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
var selectorCache = {};
function hyperscript(selector) {
	var arguments$1 = arguments;

	if (selector == null || typeof selector !== "string" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string" && selectorCache[selector] === undefined) {
		var match, tag, classes = [], attributes = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") { tag = value; }
			else if (type === "#") { attributes.id = value; }
			else if (type === ".") { classes.push(value); }
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) { attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\"); }
				if (match[4] === "class") { classes.push(attrValue); }
				else { attributes[match[4]] = attrValue || true; }
			}
		}
		if (classes.length > 0) { attributes.className = classes.join(" "); }
		selectorCache[selector] = function(attrs, children) {
			var hasAttrs = false, childList, text;
			var className = attrs.className || attrs.class;
			for (var key in attributes) { attrs[key] = attributes[key]; }
			if (className !== undefined) {
				if (attrs.class !== undefined) {
					attrs.class = undefined;
					attrs.className = className;
				}
				if (attributes.className !== undefined) { attrs.className = attributes.className + " " + className; }
			}
			for (var key in attrs) {
				if (key !== "key") {
					hasAttrs = true;
					break
				}
			}
			if (Array.isArray(children) && children.length == 1 && children[0] != null && children[0].tag === "#") { text = children[0].children; }
			else { childList = children; }
			return Vnode(tag || "div", attrs.key, hasAttrs ? attrs : undefined, childList, text, undefined)
		};
	}
	var attrs, children, childrenIndex;
	if (arguments[1] == null || typeof arguments[1] === "object" && arguments[1].tag === undefined && !Array.isArray(arguments[1])) {
		attrs = arguments[1];
		childrenIndex = 2;
	}
	else { childrenIndex = 1; }
	if (arguments.length === childrenIndex + 1) {
		children = Array.isArray(arguments[childrenIndex]) ? arguments[childrenIndex] : [arguments[childrenIndex]];
	}
	else {
		children = [];
		for (var i = childrenIndex; i < arguments.length; i++) { children.push(arguments$1[i]); }
	}
	if (typeof selector === "string") { return selectorCache[selector](attrs || {}, Vnode.normalizeChildren(children)) }
	return Vnode(selector, attrs && attrs.key, attrs || {}, Vnode.normalizeChildren(children), undefined, undefined)
}
hyperscript.trust = function(html) {
	if (html == null) { html = ""; }
	return Vnode("<", undefined, undefined, html, undefined, undefined)
};
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
};
var m = hyperscript;
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) { throw new Error("Promise must be called with `new`") }
	if (typeof executor !== "function") { throw new TypeError("executor must be a function") }
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then;
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) { throw new TypeError("Promise can't be resolved w/ itself") }
					executeOnce(then.bind(value));
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) { console.error("Possible unhandled promise rejection:", value); }
						for (var i = 0; i < list.length; i++) { list[i](value); }
						resolvers.length = 0, rejectors.length = 0;
						instance.state = shouldAbsorb;
						instance.retry = function() {execute(value);};
					});
				}
			}
			catch (e) {
				rejectCurrent(e);
			}
		}
	}
	function executeOnce(then) {
		var runs = 0;
		function run(fn) {
			return function(value) {
				if (runs++ > 0) { return }
				fn(value);
			}
		}
		var onerror = run(rejectCurrent);
		try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
	}
	executeOnce(executor);
};
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance;
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") { next(value); }
			else { try {resolveNext(callback(value));} catch (e) {if (rejectNext) { rejectNext(e); }} }
		});
		if (typeof instance.retry === "function" && state === instance.state) { instance.retry(); }
	}
	var resolveNext, rejectNext;
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
	return promise
};
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
};
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) { return value }
	return new PromisePolyfill(function(resolve) {resolve(value);})
};
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value);})
};
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = [];
		if (list.length === 0) { resolve([]); }
		else { for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++;
					values[i] = value;
					if (count === total) { resolve(values); }
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject);
				}
				else { consume(list[i]); }
			})(i);
		} }
	})
};
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject);
		}
	})
};
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") { window.Promise = PromisePolyfill; }
	var PromisePolyfill = window.Promise;
} else if (typeof commonjsGlobal !== "undefined") {
	if (typeof commonjsGlobal.Promise === "undefined") { commonjsGlobal.Promise = PromisePolyfill; }
	var PromisePolyfill = commonjsGlobal.Promise;
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") { return "" }
	var args = [];
	for (var key0 in object) {
		destructure(key0, object[key0]);
	}
	return args.join("&")
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key0 + "[" + i + "]", value[i]);
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key0 + "[" + i + "]", value[i]);
			}
		}
		else { args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : "")); }
	}
};
var _8 = function($window, Promise) {
	var callbackCount = 0;
	var oncompletion;
	function setCompletionCallback(callback) {oncompletion = callback;}
	function finalizer() {
		var count = 0;
		function complete() {if (--count === 0 && typeof oncompletion === "function") { oncompletion(); }}
		return function finalize(promise0) {
			var then0 = promise0.then;
			promise0.then = function() {
				count++;
				var next = then0.apply(promise0, arguments);
				next.then(complete, function(e) {
					complete();
					if (count === 0) { throw e }
				});
				return finalize(next)
			};
			return promise0
		}
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			var url = args;
			args = extra || {};
			if (args.url == null) { args.url = url; }
		}
		return args
	}
	function request(args, extra) {
		var finalize = finalizer();
		args = normalize(args, extra);
		var promise0 = new Promise(function(resolve, reject) {
			if (args.method == null) { args.method = "GET"; }
			args.method = args.method.toUpperCase();
			var useBody = typeof args.useBody === "boolean" ? args.useBody : args.method !== "GET" && args.method !== "TRACE";
			if (typeof args.serialize !== "function") { args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify; }
			if (typeof args.deserialize !== "function") { args.deserialize = deserialize; }
			if (typeof args.extract !== "function") { args.extract = extract; }
			args.url = interpolate(args.url, args.data);
			if (useBody) { args.data = args.serialize(args.data); }
			else { args.url = assemble(args.url, args.data); }
			var xhr = new $window.XMLHttpRequest();
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
			if (args.serialize === JSON.stringify && useBody) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			}
			if (args.deserialize === deserialize) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (args.withCredentials) { xhr.withCredentials = args.withCredentials; }
			for (var key in args.headers) { if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key]);
			} }
			if (typeof args.config === "function") { xhr = args.config(xhr, args) || xhr; }
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort(). XMLHttpRequests ends up in a state of
				// xhr.status == 0 and xhr.readyState == 4 if aborted after open, but before completion.
				if (xhr.status && xhr.readyState === 4) {
					try {
						var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args));
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
							resolve(cast(args.type, response));
						}
						else {
							var error = new Error(xhr.responseText);
							for (var key in response) { error[key] = response[key]; }
							reject(error);
						}
					}
					catch (e) {
						reject(e);
					}
				}
			};
			if (useBody && (args.data != null)) { xhr.send(args.data); }
			else { xhr.send(); }
		});
		return args.background === true ? promise0 : finalize(promise0)
	}
	function jsonp(args, extra) {
		var finalize = finalizer();
		args = normalize(args, extra);
		var promise0 = new Promise(function(resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
			var script = $window.document.createElement("script");
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script);
				resolve(cast(args.type, data));
				delete $window[callbackName];
			};
			script.onerror = function() {
				script.parentNode.removeChild(script);
				reject(new Error("JSONP request failed"));
				delete $window[callbackName];
			};
			if (args.data == null) { args.data = {}; }
			args.url = interpolate(args.url, args.data);
			args.data[args.callbackKey || "callback"] = callbackName;
			script.src = assemble(args.url, args.data);
			$window.document.documentElement.appendChild(script);
		});
		return args.background === true? promise0 : finalize(promise0)
	}
	function interpolate(url, data) {
		if (data == null) { return url }
		var tokens = url.match(/:[^\/]+/gi) || [];
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1);
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key]);
			}
		}
		return url
	}
	function assemble(url, data) {
		var querystring = buildQueryString(data);
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&";
			url += prefix + querystring;
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
					data[i] = new type0(data[i]);
				}
			}
			else { return new type0(data) }
		}
		return data
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
};
var requestService = _8(window, PromisePolyfill);
var coreRenderer = function($window) {
	var $doc = $window.document;
	var $emptyFragment = $doc.createDocumentFragment();
	var onevent;
	function setEventCallback(callback) {return onevent = callback}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i];
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling);
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag;
		if (vnode.attrs != null) { initLifecycle(vnode.attrs, vnode, hooks); }
		if (typeof tag === "string") {
			switch (tag) {
				case "#": return createText(parent, vnode, nextSibling)
				case "<": return createHTML(parent, vnode, nextSibling)
				case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
				default: return createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else { return createComponent(parent, vnode, hooks, ns, nextSibling) }
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children);
		insertNode(parent, vnode.dom, nextSibling);
		return vnode.dom
	}
	function createHTML(parent, vnode, nextSibling) {
		var match1 = vnode.children.match(/^\s*?<(\w+)/im) || [];
		var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div";
		var temp = $doc.createElement(parent1);
		temp.innerHTML = vnode.children;
		vnode.dom = temp.firstChild;
		vnode.domSize = temp.childNodes.length;
		var fragment = $doc.createDocumentFragment();
		var child;
		while (child = temp.firstChild) {
			fragment.appendChild(child);
		}
		insertNode(parent, fragment, nextSibling);
		return fragment
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment();
		if (vnode.children != null) {
			var children = vnode.children;
			createNodes(fragment, children, 0, children.length, hooks, null, ns);
		}
		vnode.dom = fragment.firstChild;
		vnode.domSize = fragment.childNodes.length;
		insertNode(parent, fragment, nextSibling);
		return fragment
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag;
		switch (vnode.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
		}
		var attrs2 = vnode.attrs;
		var is = attrs2 && attrs2.is;
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
		vnode.dom = element;
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns);
		}
		insertNode(parent, element, nextSibling);
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode);
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") { element.textContent = vnode.text; }
				else { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
			}
			if (vnode.children != null) {
				var children = vnode.children;
				createNodes(element, children, 0, children.length, hooks, null, ns);
				setLateAttrs(vnode);
			}
		}
		return element
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		vnode.state = Object.create(vnode.tag);
		var view = vnode.tag.view;
		if (view.reentrantLock != null) { return $emptyFragment }
		view.reentrantLock = true;
		initLifecycle(vnode.tag, vnode, hooks);
		vnode.instance = Vnode.normalize(view.call(vnode.state, vnode));
		view.reentrantLock = null;
		if (vnode.instance != null) {
			if (vnode.instance === vnode) { throw Error("A view cannot return the vnode it received as arguments") }
			var element = createNode(parent, vnode.instance, hooks, ns, nextSibling);
			vnode.dom = vnode.instance.dom;
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
			insertNode(parent, element, nextSibling);
			return element
		}
		else {
			vnode.domSize = 0;
			return $emptyFragment
		}
	}
	//update
	function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) { return }
		else if (old == null) { createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, undefined); }
		else if (vnodes == null) { removeNodes(old, 0, old.length, vnodes); }
		else {
			if (old.length === vnodes.length) {
				var isUnkeyed = false;
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null;
						break
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) { continue }
						else if (old[i] == null && vnodes[i] != null) { createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling)); }
						else if (vnodes[i] == null) { removeNodes(old, i, i + 1, vnodes); }
						else { updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), false, ns); }
					}
					return
				}
			}
			recycling = recycling || isRecyclable(old, vnodes);
			if (recycling) { old = old.concat(old.pool); }
			
			var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map;
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], v = vnodes[start];
				if (o === v && !recycling) { oldStart++, start++; }
				else if (o == null) { oldStart++; }
				else if (v == null) { start++; }
				else if (o.key === v.key) {
					oldStart++, start++;
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), recycling, ns);
					if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
				}
				else {
					var o = old[oldEnd];
					if (o === v && !recycling) { oldEnd--, start++; }
					else if (o == null) { oldEnd--; }
					else if (v == null) { start++; }
					else if (o.key === v.key) {
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
						if (recycling || start < end) { insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling)); }
						oldEnd--, start++;
					}
					else { break }
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], v = vnodes[end];
				if (o === v && !recycling) { oldEnd--, end--; }
				else if (o == null) { oldEnd--; }
				else if (v == null) { end--; }
				else if (o.key === v.key) {
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
					if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
					if (o.dom != null) { nextSibling = o.dom; }
					oldEnd--, end--;
				}
				else {
					if (!map) { map = getKeyMap(old, oldEnd); }
					if (v != null) {
						var oldIndex = map[v.key];
						if (oldIndex != null) {
							var movable = old[oldIndex];
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
							insertNode(parent, toFragment(movable), nextSibling);
							old[oldIndex].skip = true;
							if (movable.dom != null) { nextSibling = movable.dom; }
						}
						else {
							var dom = createNode(parent, v, hooks, undefined, nextSibling);
							nextSibling = dom;
						}
					}
					end--;
				}
				if (end < start) { break }
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
			removeNodes(old, oldStart, oldEnd + 1, vnodes);
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode.tag;
		if (oldTag === tag) {
			vnode.state = old.state;
			vnode.events = old.events;
			if (shouldUpdate(vnode, old)) { return }
			if (vnode.attrs != null) {
				updateLifecycle(vnode.attrs, vnode, hooks, recycling);
			}
			if (typeof oldTag === "string") {
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, nextSibling); break
					case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, recycling, hooks, ns);
				}
			}
			else { updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns); }
		}
		else {
			removeNode(old, null);
			createNode(parent, vnode, hooks, ns, nextSibling);
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children;
		}
		vnode.dom = old.dom;
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old);
			createHTML(parent, vnode, nextSibling);
		}
		else { vnode.dom = old.dom, vnode.domSize = old.domSize; }
	}
	function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns);
		var domSize = 0, children = vnode.children;
		vnode.dom = null;
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child != null && child.dom != null) {
					if (vnode.dom == null) { vnode.dom = child.dom; }
					domSize += child.domSize || 1;
				}
			}
			if (domSize !== 1) { vnode.domSize = domSize; }
		}
	}
	function updateElement(old, vnode, recycling, hooks, ns) {
		var element = vnode.dom = old.dom;
		switch (vnode.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
		}
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) { vnode.attrs = {}; }
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text; //FIXME handle0 multiple children
				vnode.text = undefined;
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns);
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode);
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) { old.dom.firstChild.nodeValue = vnode.text; }
		}
		else {
			if (old.text != null) { old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]; }
			if (vnode.text != null) { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
			updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns);
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		vnode.instance = Vnode.normalize(vnode.tag.view.call(vnode.state, vnode));
		updateLifecycle(vnode.tag, vnode, hooks, recycling);
		if (vnode.instance != null) {
			if (old.instance == null) { createNode(parent, vnode.instance, hooks, ns, nextSibling); }
			else { updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns); }
			vnode.dom = vnode.instance.dom;
			vnode.domSize = vnode.instance.domSize;
		}
		else if (old.instance != null) {
			removeNode(old.instance, null);
			vnode.dom = undefined;
			vnode.domSize = 0;
		}
		else {
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0;
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0;
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0;
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0;
		for (var i = 0; i < end; i++) {
			var vnode = vnodes[i];
			if (vnode != null) {
				var key2 = vnode.key;
				if (key2 != null) { map[key2] = i; }
			}
		}
		return map
	}
	function toFragment(vnode) {
		var count0 = vnode.domSize;
		if (count0 != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment();
			if (count0 > 0) {
				var dom = vnode.dom;
				while (--count0) { fragment.appendChild(dom.nextSibling); }
				fragment.insertBefore(dom, fragment.firstChild);
			}
			return fragment
		}
		else { return vnode.dom }
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) { return vnodes[i].dom }
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) { parent.insertBefore(dom, nextSibling); }
		else { parent.appendChild(dom); }
	}
	function setContentEditable(vnode) {
		var children = vnode.children;
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children;
			if (vnode.dom.innerHTML !== content) { vnode.dom.innerHTML = content; }
		}
		else if (vnode.text != null || children != null && children.length !== 0) { throw new Error("Child node of a contenteditable must be trusted") }
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i];
			if (vnode != null) {
				if (vnode.skip) { vnode.skip = false; }
				else { removeNode(vnode, context); }
			}
		}
	}
	function removeNode(vnode, context) {
		var expected = 1, called = 0;
		if (vnode.attrs && vnode.attrs.onbeforeremove) {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		if (typeof vnode.tag !== "string" && vnode.tag.onbeforeremove) {
			var result = vnode.tag.onbeforeremove.call(vnode.state, vnode);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		continuation();
		function continuation() {
			if (++called === expected) {
				onremove(vnode);
				if (vnode.dom) {
					var count0 = vnode.domSize || 1;
					if (count0 > 1) {
						var dom = vnode.dom;
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling);
						}
					}
					removeNodeFromDOM(vnode.dom);
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) { context.pool = [vnode]; }
						else { context.pool.push(vnode); }
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		var parent = node.parentNode;
		if (parent != null) { parent.removeChild(node); }
	}
	function onremove(vnode) {
		if (vnode.attrs && vnode.attrs.onremove) { vnode.attrs.onremove.call(vnode.state, vnode); }
		if (typeof vnode.tag !== "string" && vnode.tag.onremove) { vnode.tag.onremove.call(vnode.state, vnode); }
		if (vnode.instance != null) { onremove(vnode.instance); }
		else {
			var children = vnode.children;
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child != null) { onremove(child); }
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (var key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns);
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		var element = vnode.dom;
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) { return }
		var nsLastIndex = key2.indexOf(":");
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value);
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") { updateEvent(vnode, key2, value); }
		else if (key2 === "style") { updateStyle(element, old, value); }
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
			if (vnode.tag === "input" && key2 === "value" && vnode.dom.value === value && vnode.dom === $doc.activeElement) { return }
			//setting select[value] to same value while having select open blinks select dropdown in Chrome
			if (vnode.tag === "select" && key2 === "value" && vnode.dom.value === value && vnode.dom === $doc.activeElement) { return }
			//setting option[value] to same value while having select open blinks select dropdown in Chrome
			if (vnode.tag === "option" && key2 === "value" && vnode.dom.value === value) { return }
			element[key2] = value;
		}
		else {
			if (typeof value === "boolean") {
				if (value) { element.setAttribute(key2, ""); }
				else { element.removeAttribute(key2); }
			}
			else { element.setAttribute(key2 === "className" ? "class" : key2, value); }
		}
	}
	function setLateAttrs(vnode) {
		var attrs2 = vnode.attrs;
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) { setAttr(vnode, "value", null, attrs2.value, undefined); }
			if ("selectedIndex" in attrs2) { setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined); }
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns);
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") { key2 = "class"; }
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) { updateEvent(vnode, key2, undefined); }
					else if (key2 !== "key") { vnode.dom.removeAttribute(key2); }
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
		if (old === style) { element.style.cssText = "", old = null; }
		if (style == null) { element.style.cssText = ""; }
		else if (typeof style === "string") { element.style.cssText = style; }
		else {
			if (typeof old === "string") { element.style.cssText = ""; }
			for (var key2 in style) {
				element.style[key2] = style[key2];
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) { element.style[key2] = ""; }
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		var element = vnode.dom;
		var callback = typeof onevent !== "function" ? value : function(e) {
			var result = value.call(element, e);
			onevent.call(element, e);
			return result
		};
		if (key2 in element) { element[key2] = typeof value === "function" ? callback : null; }
		else {
			var eventName = key2.slice(2);
			if (vnode.events === undefined) { vnode.events = {}; }
			if (vnode.events[key2] === callback) { return }
			if (vnode.events[key2] != null) { element.removeEventListener(eventName, vnode.events[key2], false); }
			if (typeof value === "function") {
				vnode.events[key2] = callback;
				element.addEventListener(eventName, vnode.events[key2], false);
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") { source.oninit.call(vnode.state, vnode); }
		if (typeof source.oncreate === "function") { hooks.push(source.oncreate.bind(vnode.state, vnode)); }
	}
	function updateLifecycle(source, vnode, hooks, recycling) {
		if (recycling) { initLifecycle(source, vnode, hooks); }
		else if (typeof source.onupdate === "function") { hooks.push(source.onupdate.bind(vnode.state, vnode)); }
	}
	function shouldUpdate(vnode, old) {
		var forceVnodeUpdate, forceComponentUpdate;
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") { forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old); }
		if (typeof vnode.tag !== "string" && typeof vnode.tag.onbeforeupdate === "function") { forceComponentUpdate = vnode.tag.onbeforeupdate.call(vnode.state, vnode, old); }
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
			vnode.instance = old.instance;
			return true
		}
		return false
	}
	function render(dom, vnodes) {
		if (!dom) { throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.") }
		var hooks = [];
		var active = $doc.activeElement;
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) { dom.textContent = ""; }
		if (!Array.isArray(vnodes)) { vnodes = [vnodes]; }
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, undefined);
		dom.vnodes = vnodes;
		for (var i = 0; i < hooks.length; i++) { hooks[i](); }
		if ($doc.activeElement !== active) { active.focus(); }
	}
	return {render: render, setEventCallback: setEventCallback}
};
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16;
	var last = 0, pending = null;
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
	return function() {
		var now = Date.now();
		if (last === 0 || now - last >= time) {
			last = now;
			callback();
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null;
				callback();
				last = Date.now();
			}, time - (now - last));
		}
	}
}
var _11 = function($window) {
	var renderService = coreRenderer($window);
	renderService.setEventCallback(function(e) {
		if (e.redraw !== false) { redraw(); }
	});
	var callbacks = [];
	function subscribe(key1, callback) {
		unsubscribe(key1);
		callbacks.push(key1, throttle(callback));
	}
	function unsubscribe(key1) {
		var index = callbacks.indexOf(key1);
		if (index > -1) { callbacks.splice(index, 2); }
	}
    function redraw() {
        for (var i = 1; i < callbacks.length; i += 2) {
            callbacks[i]();
        }
    }
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
};
var redrawService = _11(window);
requestService.setCompletionCallback(redrawService.redraw);
var _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, []);
			redrawService0.unsubscribe(root);
			return
		}
		
		if (component.view == null) { throw new Error("m.mount(element, component) expects a component, not a vnode") }
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component));
		};
		redrawService0.subscribe(root, run0);
		redrawService0.redraw();
	}
};
m.mount = _16(redrawService);
var Promise = PromisePolyfill;
var parseQueryString = function(string) {
	if (string === "" || string == null) { return {} }
	if (string.charAt(0) === "?") { string = string.slice(1); }
	var entries = string.split("&"), data0 = {}, counters = {};
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=");
		var key5 = decodeURIComponent(entry[0]);
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
		if (value === "true") { value = true; }
		else if (value === "false") { value = false; }
		var levels = key5.split(/\]\[?|\[/);
		var cursor = data0;
		if (key5.indexOf("[") > -1) { levels.pop(); }
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1];
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
			var isValue = j === levels.length - 1;
			if (level === "") {
				var key5 = levels.slice(0, j).join();
				if (counters[key5] == null) { counters[key5] = 0; }
				level = counters[key5]++;
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {};
			}
			cursor = cursor[level];
		}
	}
	return data0
};
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function";
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function normalize1(fragment0) {
		var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
		if (fragment0 === "pathname" && data[0] !== "/") { data = "/" + data; }
		return data
	}
	var asyncId;
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) { return }
			asyncId = callAsync0(function() {
				asyncId = null;
				callback0();
			});
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?");
		var hashIndex = path.indexOf("#");
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length;
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
			for (var key4 in queryParams) { queryData[key4] = queryParams[key4]; }
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1));
			for (var key4 in hashParams) { hashData[key4] = hashParams[key4]; }
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"};
	router.getPath = function() {
		var type2 = router.prefix.charAt(0);
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length)
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
		}
	};
	router.setPath = function(path, data, options) {
		var queryData = {}, hashData = {};
		path = parsePath(path, queryData, hashData);
		if (data != null) {
			for (var key4 in data) { queryData[key4] = data[key4]; }
			path = path.replace(/:([^\/]+)/g, function(match2, token) {
				delete queryData[token];
				return data[token]
			});
		}
		var query = buildQueryString(queryData);
		if (query) { path += "?" + query; }
		var hash = buildQueryString(hashData);
		if (hash) { path += "#" + hash; }
		if (supportsPushState) {
			var state = options ? options.state : null;
			var title = options ? options.title : null;
			$window.onpopstate();
			if (options && options.replace) { $window.history.replaceState(state, title, router.prefix + path); }
			else { $window.history.pushState(state, title, router.prefix + path); }
		}
		else { $window.location.href = router.prefix + path; }
	};
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath();
			var params = {};
			var pathname = parsePath(path, params, params);
			var state = $window.history.state;
			if (state != null) {
				for (var k in state) { params[k] = state[k]; }
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || [];
						var values = [].slice.call(arguments, 1, -2);
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
						}
						resolve(routes[route0], params, path, route0);
					});
					return
				}
			}
			reject(path, params);
		}
		if (supportsPushState) { $window.onpopstate = debounceAsync(resolveRoute); }
		else if (router.prefix.charAt(0) === "#") { $window.onhashchange = resolveRoute; }
		resolveRoute();
	};
	return router
};
var _20 = function($window, redrawService0) {
	var routeService = coreRouter($window);
	var identity = function(v) {return v};
	var render1, component, attrs3, currentPath, lastUpdate;
	var route = function(root, defaultRoute, routes) {
		if (root == null) { throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined") }
		var run1 = function() {
			if (render1 != null) { redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3))); }
		};
		var bail = function(path) {
			if (path !== defaultRoute) { routeService.setPath(defaultRoute, null, {replace: true}); }
			else { throw new Error("Could not resolve default route " + defaultRoute) }
		};
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) { return }
				component = comp != null && typeof comp.view === "function" ? comp : "div", attrs3 = params, currentPath = path, lastUpdate = null;
				render1 = (routeResolver.render || identity).bind(routeResolver);
				run1();
			};
			if (payload.view) { update({}, payload); }
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved);
					}, bail);
				}
				else { update(payload, "div"); }
			}
		}, bail);
		redrawService0.subscribe(root, run1);
	};
	route.set = function(path, data, options) {
		if (lastUpdate != null) { options = {replace: true}; }
		lastUpdate = null;
		routeService.setPath(path, data, options);
	};
	route.get = function() {return currentPath};
	route.prefix = function(prefix0) {routeService.prefix = prefix0;};
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href);
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) { return }
			e.preventDefault();
			e.redraw = false;
			var href = this.getAttribute("href");
			if (href.indexOf(routeService.prefix) === 0) { href = href.slice(routeService.prefix.length); }
			route.set(href, undefined, undefined);
		};
	};
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") { return attrs3[key3] }
		return attrs3
	};
	return route
};
m.route = _20(window, redrawService);
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName));
	}
};
var _28 = coreRenderer(window);
m.render = _28.render;
m.redraw = redrawService.redraw;
m.request = requestService.request;
m.jsonp = requestService.jsonp;
m.parseQueryString = parseQueryString;
m.buildQueryString = buildQueryString;
m.version = "1.0.1";
m.vnode = Vnode;
if (typeof module !== "undefined") { module["exports"] = m; }
else { window.m = m; }
};
});

var Box = {
    view: function (vnode) { return mithril('.box', vnode.children); }
};

var COLORS = ['white', 'light', 'dark', 'black', 'link'];
var STATES = ['primary', 'info', 'success', 'warning', 'danger'];
var SIZES = ['small', '', 'medium', 'large'];


var get_classes = function (state) {
    var classes = [];
    if (state.color) { classes.push('is-' + state.color); }
    if (state.state) { classes.push('is-' + state.state); }
    if (state.size) { classes.push('is-' + state.size); }
    if (state.loading) { classes.push('is-loading'); }
    if (state.hovered) { classes.push('is-hovered'); }
    if (state.focused) { classes.push('is-focused'); }

    return classes.join(' ')
};


var bulmify = function (state) {
    var classes = get_classes(state);
    var new_state = {};
    if (classes) { new_state.class = classes; }
    Object.keys(state).forEach(function (key) {
        if (['color', 'state', 'size', 'loading',
            'icon', 'content', 'hovered', 'focused'].indexOf(key) === -1)
            { new_state[key] = state[key]; }
    });
    return new_state
};

var collect_boolean = function (state, names) {
    var styles = [];
    names.forEach(function (name) {
        if (name in state && state[name] === true)
            { styles.push('is-' + name); }
    });
};


var sleep = function (time) { return new Promise(function (resolve) { return setTimeout(resolve, time); }); };


var smaller_than = function (sz) { return sz ? SIZES[SIZES.indexOf(sz) - 1] : 'small'; };

var Icon = {
    view: function (ref) {
            var attrs = ref.attrs;

            return mithril('span.icon', {class: attrs.size ? 'is-' + attrs.size : ''},
            mithril('i.fa', {class: 'fa-' + attrs.icon})
        );
}
};

var icon_button = function (vnode) { return [
    !vnode.attrs.icon_right ?
        mithril(Icon, {icon: vnode.attrs.icon, size: smaller_than(vnode.attrs.size)}) : '',
    mithril('span', vnode.attrs.content),
    vnode.attrs.icon_right ?
        mithril(Icon, {icon: vnode.attrs.icon, size: smaller_than(vnode.attrs.size)}) : ''
]; };

var Button = {
    view: function (vnode) { return mithril('a.button', bulmify(vnode.attrs),
        vnode.attrs.icon ? icon_button(vnode) : vnode.attrs.content); }
};

var Label = {
    view: function (vnode) { return mithril('label.label', vnode.children); }
};

var Input = {
    view: function (vnode) { return mithril('p.control',
        { class: vnode.attrs.icon ? 'has-icon has-icon-right' : '' },
        [
            mithril('input.input[type=text]', bulmify(vnode.attrs)),
            vnode.attrs.icon ? mithril(Icon, {size: 'small', icon: vnode.attrs.icon}) : ''
        ]
    ); }
};

var Select = {
    view: function (vnode) { return mithril('p.control',
            mithril('span.select', bulmify(vnode.attrs),
                mithril('select',
                    vnode.attrs.choices.map(function (k) { return mithril('option', {value: k[0]}, k[1]); })
                )
            )
        ); }
};


var TextArea = {
    view: function (vnode) { return mithril("p.control",
            mithril("textarea.textarea", bulmify(vnode.attrs))
        ); }
};


var CheckBox = {
    view: function (vnode) { return mithril("p.control",
            mithril("label.checkbox",
                mithril("input[type='checkbox']", bulmify(vnode.attrs)),
                vnode.attrs.content
            )
        ); }
};


var Radio = {
    view: function (vnode) { return mithril("p.control",
            vnode.attrs.choices.map(function (k) { return mithril("label.radio",
                    mithril("input[type='radio']", {value: k[0], name: vnode.attrs.name}),
                    k[1]
                ); }
            )
        ); }
};

var Image = {
    view: function (vnode) { return mithril('figure.image',
            {class: vnode.attrs.size ?
                'is-' + vnode.attrs.size + 'x' + vnode.attrs.size :
                'is-' + vnode.attrs.ratio},
            mithril('img', {src: vnode.attrs.src})); }
};

var Notification = {
    view: function (vnode) { return mithril(".notification", bulmify(vnode.attrs),
            vnode.attrs.delete ?
                mithril("button.delete", {onclick: vnode.attrs.onclick}) : '',
            vnode.children
        ); }
};

var Progress = {
    view: function (vnode) { return mithril("progress.progress", bulmify(vnode.attrs),
            vnode.children
        ); }
};

var onclick = function (vnode, val) { return function () {
        reset(vnode, val);
        if (vnode.attrs.onclick) { vnode.attrs.onclick(val); }
    }; };

var reset = function (vnode, val) {
    vnode.state.current = val;
    var max_buttons = vnode.attrs.max_buttons || 10;
    var nb = vnode.attrs.nb;
    if (nb > max_buttons) {
        var mid = nb / 2;
        if ([1, 2].includes(val)) { vnode.state.buttons = [1, 2, 3, null, mid, null, nb]; }
        else if ([nb-1, nb].includes(val)) { vnode.state.buttons = [1, null, mid, null, nb-2, nb-1, nb]; }
        else { vnode.state.buttons = [1, null, val - 1, val, val + 1, null, nb]; }
    } else {
        vnode.state.buttons = [];
        for (var i = 1; i <= nb; i++) { vnode.state.buttons.push(i); }
    }
};

var Pagination = {
    oninit: function (vnode) { return reset(vnode, vnode.attrs.current || 1); },

    view: function (vnode) { return mithril('nav.pagination',
        mithril('a.pagination-previous',
            {onclick: onclick(vnode, vnode.state.current - 1),
                disabled: vnode.state.current === 1},
            vnode.attrs.previous_text || 'Previous'),
        mithril('a.pagination-next',
            {onclick: onclick(vnode, vnode.state.current + 1),
                disabled: vnode.state.current === vnode.state.buttons.length},
            vnode.attrs.next_text || 'Next'),
        mithril('ul.pagination-list',
            vnode.state.buttons.map(function (val) { return val === null ?
                mithril('li', mithril('span.pagination-ellipsis', mithril.trust('&hellip;'))) :
                mithril('li', mithril('a.pagination-link',
                    {
                        class: vnode.state.current === val ? 'is-current' : null,
                        onclick: onclick(vnode, val)
                    }, val)); }
            )
        )
    ); }
};

var STYLES = ['bordered', 'striped', 'narrow'];

var header_col = function (vnode, item, idx) {
    var way = (idx === vnode.state.sort_by) ?
        (vnode.state.sort_asc ? ' U' : ' D') : '';
    return item.name + way
};


var th_tf = function (vnode, tag) { return mithril(tag === 'header' ? 'thead' : 'tfoot',
        mithril('tr',
            vnode.attrs[tag].map(function (item, idx) { return mithril('th', {onclick: item.sortable ? sorthandler(vnode, idx): null},
                    item.title ?
                        mithril('abbr', {title: item.title}, header_col(vnode, item, idx))
                        : header_col(vnode, item, idx)); }
            )
        )
    ); };

var comparator = function (idx) { return function (a, b) {
      if (a[idx] < b[idx])
        { return -1 }
      if (a[idx] > b[idx])
        { return 1 }
      return 0
    }; };

var sorthandler = function (vnode, idx) { return function () {
        if (vnode.state.sort_by === idx)
            { vnode.state.sort_asc = ! vnode.state.sort_asc; }
        else
            { vnode.state.sort_asc = true; }

        vnode.state.sort_by = idx;
        vnode.state.rows.sort(comparator(idx));
        if (! vnode.state.sort_asc)
            { vnode.state.rows.reverse(); }
    }; };

var Table = {

    oninit: function (vnode) {
        vnode.state.sort_by = null;
        vnode.state.sort_asc = true;
        vnode.state.rows = vnode.attrs.rows;
        if (vnode.attrs.paginate_by){
            vnode.state.page = 1;
            vnode.state.start_at = 0;
        }
        else
            { vnode.state.display_rows = vnode.attrs.rows; }
    },

    view: function (vnode) { return [
        mithril('table.table', {class: collect_boolean(vnode.attrs, STYLES)},
            vnode.attrs.header ? th_tf(vnode, 'header') : null,
            vnode.attrs.footer ? th_tf(vnode, 'footer') : null,
            mithril('tbody',
                vnode.state.rows.slice(
                    vnode.state.start_at,
                    vnode.state.start_at + vnode.attrs.paginate_by).map(function (row) { return mithril('tr', row.map(function (col) { return mithril('td', col); })); }
                )
           )
        ),

        vnode.attrs.paginate_by ?
            mithril(Pagination,
                {
                    nb: Math.ceil(vnode.state.rows.length / vnode.attrs.paginate_by),
                    onclick: function (nb) {
                        vnode.state.page = nb;
                        vnode.state.start_at = nb === 1 ? 0 : ((nb -1) * vnode.attrs.paginate_by);
                    }
                }
            ) : null
    ]; }
};

var Tag = {
    view: function (vnode) { return mithril('span.tag', bulmify(vnode.attrs), vnode.children); }
};

var Title = {
    view: function (vnode) { return mithril('h' + vnode.attrs.size + '.title' + '.is-' + vnode.attrs.size, vnode.children); }
};


var SubTitle = {
    view: function (vnode) { return mithril('h' + vnode.attrs.size + '.subtitle' + '.is-' + vnode.attrs.size, vnode.children); }
};

var Content = {
    view: function (vnode) { return mithril('content', {class: vnode.attrs.size ? 'is-' + vnode.attrs.size : ''},
            vnode.children
        ); }
};

var Level = {
    view: function (vnode) { return mithril('nav.level',
        {'is-mobile': vnode.attrs.mobile}, vnode.children); }
};





var LevelItem = {
    view: function (vnode) { return mithril('p.level-item',
        {class: vnode.attrs.centered ? 'has-text-centered': ''}, vnode.children); }
};

var MediaLeft = {
    view: function (vnode) { return mithril('figure.media-left', vnode.children); }
};

var MediaContent = {
    view: function (vnode) { return mithril('div.media-content', vnode.children); }
};

var MediaRight = {
    view: function (vnode) { return mithril('div.media-right', vnode.children); }
};

var Media = {
    view: function (vnode) { return mithril('article.media', [

        vnode.attrs.image ?
            mithril(MediaLeft, mithril('p.image', {class: 'is-' + vnode.attrs.image.ratio},
                mithril('img', {'src': vnode.attrs.image.src}))) : '',

        mithril(MediaContent, vnode.children),

        vnode.attrs.button ? mithril(MediaRight, vnode.attrs.button) : ''
    ]); }
};

var clickhandler = function (state, item) { return function () {
        state.selected = item.key;
        if (item.url) { console.log('redirect to ' + item.url); }
        if (item.onclick) { item.onclick(item.key); }
    }; };


var MenuItem = {
    view: function (vnode) { return [
            mithril('a', {onclick: clickhandler(vnode.attrs.state, vnode.attrs.root),
                class: vnode.attrs.state.selected === vnode.attrs.root.key ? "is-active" : ''},
                vnode.attrs.root.label),
            vnode.attrs.root.items ?
                mithril('ul', vnode.attrs.root.items.map(function (item) { return mithril('li', mithril('a', {
                        class: vnode.attrs.state.selected === item.key ? "is-active" : '',
                        onclick: clickhandler(vnode.attrs.state, item)}, item.label)); }))
                : ''
        ]; }
};

var Menu$1 = {
    oninit: function (vnode) { return vnode.state = vnode.attrs; },
    view: function (vnode) { return mithril('aside.menu',
        vnode.state.items.map(function (menu) { return [
            mithril('p.menu-label', menu.label),
            mithril('ul.menu-list',
                menu.items.map(function (item) { return mithril('li', mithril(MenuItem, {state: vnode.state, root: item})); }
                )
            )
        ]; })
    ); }
};

var Message = {
    view: function (vnode) { return mithril('article.message',
        {class: vnode.attrs.color ? 'is-' + vnode.attrs.color : ''}, [
        vnode.attrs.header ?
            mithril('.message-header', mithril('p', vnode.attrs.header),
                vnode.attrs.onclose ? mithril('button',
                    {class: 'delete', onclick: vnode.attrs.onclose}): '')
        : '',
        mithril('.message-body', vnode.children)
    ]); }
};

var Modal = {
    view: function (vnode) { return mithril('.modal', {class: vnode.attrs.active ? 'is-active': ''}, [
            mithril('.modal-background'),
            mithril('.modal-content', vnode.children),
            vnode.attrs.onclose ? mithril('.button.modal-close', {onclick: vnode.attrs.onclose}): ''
    ]); }
};

var Nav = {
    view: function (vnode) { return mithril('nav.nav', [
        vnode.attrs.left ? mithril('.nav-left', vnode.attrs.left.map(function (item) { return mithril('a.nav-item', item); })) : '',
        vnode.attrs.center ? mithril('.nav-center', vnode.attrs.center.map(function (item) { return mithril('a.nav-item', item); })) : '',
        vnode.attrs.right ? mithril('.nav-right', vnode.attrs.right.map(function (item) { return mithril('a.nav-item', item); })) : ''
    ]); }
};

var CardHeader = {
    view: function (vnode) { return mithril('header.card-header', [
        mithril('p.card-header-title', vnode.attrs.title),
        mithril('a.card-header-icon', vnode.attrs.icon)
    ]); }
};

var CardFooter = {
    view: function (vnode) { return mithril('footer.card-footer', vnode.children); }
};

var CardFooterItem = {
    view: function (vnode) { return mithril('a.card-footer-item', vnode.attrs); }
};

var CardContent = {
    view: function (vnode) { return mithril('.card-content', vnode.children); }
};

var Card = {
    view: function (vnode) { return mithril('.card', vnode.children); }
};

var onclick$1 = function (vnode, item, idx) { return function () {
        vnode.state.active = idx;
        if (vnode.attrs.onclick) { vnode.attrs.onclick(item); }
    }; };

var TabsMenu = {
    oninit: function (vnode) { return vnode.state.active = vnode.attrs.active || 0; },

    view: function (vnode) { return mithril('.tabs', mithril('ul',
        vnode.attrs.items.map(function (item, idx) { return mithril('li',
                {
                    class: idx === vnode.state.active ? 'is-active' : null,
                    onclick: onclick$1(vnode, item, idx)
                },
                mithril('a', item.icon ? [
                    mithril('span.icon.is-small',
                    mithril('i.fa', {class: 'fa-' + item.icon})), mithril('span', item.label)]
                    : item.label)
            ); }
        )
    )); }
};


var clickhandler$1 = function (vnode) { return function (item) { return vnode.state.active = item.key; }; };

var Tabs = {
    oninit: function (vnode) {
        vnode.state.active = vnode.attrs.active || 0;
        vnode.state.items = vnode.attrs.items.map(function (item, idx) {
            item.key = idx;
            return item
        });
    },

    view: function (vnode) { return mithril('div', {style: {display: 'flex', flex: '1', width: '100%', 'flex-direction': 'column'}}, [
            mithril(TabsMenu, {active: vnode.state.active, onclick: clickhandler$1(vnode), items: vnode.state.items}),
            vnode.state.items.map(function (item) { return mithril('div',
                    {style: {display: item.key === vnode.state.active ? 'block': 'none', 'margin-left': '10px'}},
                    item.content
                ); }
            )
        ]); }

};

var onclick$2 = function (vnode, item, idx) { return function () {
        if (vnode.state.active === idx) { vnode.state.active = null; }
        else { vnode.state.active = idx; }
        if (vnode.attrs.onclick) { vnode.attrs.onclick(item); }
    }; };

var Panel = {
    view: function (vnode) { return mithril('nav.panel', vnode.children); }
};

var PanelHeading = {
    view: function (vnode) { return mithril('p.panel-heading', vnode.children); }
};

var PanelTabs = {
    oninit: function (vnode) { return vnode.state.active = vnode.attrs.active || null; },

    view: function (vnode) { return mithril('.panel-tabs',
        vnode.attrs.items.map(function (item, idx) { return mithril('a',
                {
                    class: idx === vnode.state.active ? 'is-active' : null,
                    onclick: onclick$2(vnode, item, idx)
                }, item.label
            ); }
        )
    ); }
};



var PanelBlocks = {
    oninit: function (vnode) { return vnode.state.active = vnode.attrs.active || null; },

    view: function (vnode) { return vnode.attrs.items.map(function (item, idx) { return mithril('a.panel-block', {
                class: idx === vnode.state.active ? 'is-active' : null,
                onclick: onclick$2(vnode, item, idx)
            }, [
            mithril('span.panel-icon', mithril('i.fa', {class: 'fa-' + item.icon})),
            item.label
        ]); }
    ); }
};

var DataState = {
    count: 0,
    loading: false,
    page: null,

    add: function (evt) {
        
        DataState.count += 1;
        DataState.loading = true;
        console.log('youuuuuuu' + DataState.count);
        sleep(500).then(function () {
            DataState.loading = false;
            mithril.redraw();
            console.log('sleep' + DataState.count);
        });
    }
};

var DemoBox = {
    view: function () { return mithril(Box, 'a box'); }
};

var DemoButton = {
    view: function () { return [
        mithril(Title, {size: 3}, 'Event handler & state'),
        mithril(Button, {
            onclick: DataState.add,
            loading: DataState.loading,
            state: DataState.loading ? 'primary' : null,
            size: 'large',
            content: 'a button ' + DataState.count,
            icon: 'align-left', icon_right: true}),

        mithril(Title, {size: 3}, 'Colors'),
        COLORS.map(function (color) { return mithril(Button, {color: color, content: 'a ' + color + ' button'}); }),

        mithril(Title, {size: 3}, 'Colors'),
        STATES.map(function (state) { return mithril(Button, {state: state, content: 'a ' + state + ' button'}); }) ]; }
};

var DemoTable = {
    view: function () { return mithril(Table, {
        striped: true,
        bordered: true,
        paginate_by: 6,
        header: [
            {name: 'Pos', title: 'Position'},
            {name: 'Team', sortable: true},
            {name: 'W', title: 'Won', sortable: true}
        ],
        footer: [
            {name: 'Pos', title: 'Position'},
            {name: 'Team'},
            {name: 'W', title: 'Won'}
        ],
        rows: [
            [1, 'Leicester City', 23],
            [2, 'Arsenal', 20],
            [3, 'Tottenham Hotspur', 19],
            [1, 'dd City', 23],
            [2, 'ee', 20],
            [3, 'ff Hotspur', 19],
            [1, 'gg City', 23],
            [2, 'hh', 20],
            [3, 'ii Hotspur', 19],
            [1, 'jj City', 23],
            [2, 'kk', 20],
            [3, 'll Hotspur', 19]
        ]
    }); }
};


var DemoForm = {
    view: function () { return [
        mithril(Label, 'Le nom ?'),
        mithril(Input, {placeholder: 'wooo', value: 'toto', icon: 'check'}),
        mithril(Input, {placeholder: 'email', state: 'danger', icon: 'warning'}),
        mithril(Label, 'Le choix ?'),
        mithril(Select, {choices: [[1, 'bo'], [2, 'uu']], size: 'large'}),
        mithril(TextArea, {placeholder: 'comments', value: 'bob', loading: true}),
        mithril(CheckBox, {content: 'click !'}),
        mithril(Radio, {name: 'xx', choices: [[10, 'nope'], [1, 'yeah']]})
    ]; }
};


var DemoImage = {
    view: function () { return [
        mithril(Image, {size: 128, 
            src: "http://bulma.io/images/placeholders/128x128.png"}),
        mithril(Image, {ratio: '2by1', 
            src: "http://bulma.io/images/placeholders/128x128.png"})
    ]; }
};


var DemoNotification = {
    view: function () { return mithril(Notification, {
            state: 'danger', 'delete': true, onclick: function (e) { return console.log('click'); }}, 
            'What the hell !'); },

};

var DemoProgress = {
    view: function () { return [
        mithril(Progress, {state: 'info', 'max': 80, value: 60}),
        mithril(Progress, {'max': 80, value: 30, size: 'large'})
    ]; }
};


var DemoTag = {
    view: function () { return [
        mithril(Tag, {state: 'info'}, 'wooot'),
        mithril(Tag, {size: 'large'}, 'big') ]; }
};

var DemoTitle = {
    view: function () { return [1, 2, 3, 4].map(function (x) { return [
        mithril(Title, {size: x}, 'Title ' + x),
        mithril(SubTitle, {size: x}, 'SubTitle ' + x) ]; }); }
};

var DemoLevel = {
    view: function () { return mithril(Level, [
            mithril(LevelItem, {centered: true}, mithril('div', mithril('p.heading', 'Twwwets'), mithril('p.title', '400k'))),
            mithril(LevelItem, {centered: true}, mithril('div', mithril('p.heading', 'Following'), mithril('p.title', '2544'))),
            mithril(LevelItem, {centered: true}, mithril('div', mithril('p.heading', 'Followers'), mithril('p.title', '879'))),
            mithril(LevelItem, {centered: true}, mithril('div', mithril('p.heading', 'Likes'), mithril('p.title', '200.10'))) ]); }
};

var DemoMedia = {
    view: function () { return [1, 2, 3].map(function (x) { return mithril(Media, {
                image: {
                    ratio: '64x64',
                    src: 'http://bulma.io/images/placeholders/128x128.png'},
                button: mithril(Button, {class: 'delete'})
            },
            mithril('.content', 'Media ' + x)
        ); }
    ); }
};

var DemoMenu = {
    view: function () { return mithril(Menu$1, {
            selected: 'myt',
            items: [
                {
                    label: 'Administration',
                    items: [
                        { key: 'ts', label:'Team Settings' },
                        { key: 'myt', url: '/', label: 'Manage Your Team', items: [
                            { key: 'myt1', url: '/', label: 'Members' },
                            { key: 'myt2', onclick: function () { return console.log('onclick !!'); }, label: 'Add member' }
                        ]}
                    ]
                }
            ]
        }); }
};

var DemoMessage = {
    view: function () { return [
        mithril(Message, {color: 'warning', header: 'salut', onclose: function () { return console.log('yo'); }},
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            "Pellentesque risus mi</strong>, tempus quis placerat ut, " +
            "porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla." +
            "Nullam gravida purus diam, et dictum felis venenatis efficitur"),

        mithril(Message, {color: 'dark'},
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            "Pellentesque risus mi</strong>, tempus quis placerat ut, " +
            "porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla." +
            "Nullam gravida purus diam, et dictum felis venenatis efficitur") ]; }
};

var DemoModal = {
    view: function () { return [
        mithril(Button, {onclick: function () { return DataState.active=true; }, text: 'launch modal'}),
        mithril(Modal, {onclose: function () { return DataState.active=false; }, active:DataState.active},
            mithril('.box', 'Hello there')) ]; }
};

var DemoNav = {
    view: function () { return mithril(Nav, {
        left: [mithril('img[src="http://bulma.io/images/bulma-logo.png"][alt="Bulma logo"]')],
        center: [mithril(Icon, {icon: 'github'})],
        right: ['Home', 'Docs']
    }); }
};

var DemoCard = {
    view: function () { return mithril(Card, [
        mithril(CardHeader, {icon: mithril(Icon, {icon: 'angle-down'}), title: 'a card'}),
        mithril(CardContent, mithril(Content, 'Lorem ipsum dolor sit amet')),
        mithril(CardFooter, [
            mithril(CardFooterItem, {text: 'Save'}),
            mithril(CardFooterItem, {text: 'Delete'})
        ])
    ]); }
};

var DemoPagination = {
    view: function () { return mithril(Pagination, 
        {nb: 100, current: 51, onclick: function (nb) { return console.log(nb + ' clicked'); }}); }
};


var DemoPanel = {
    view: function () { return mithril(Panel, [
        mithril(PanelHeading, 'A Panel !'),
        mithril(PanelTabs, {items: [
            {label: 'All'},
            {label: 'Public'},
            {label: 'Private'}]}),
        mithril(PanelBlocks, {items: [
            {label: 'marksheet', icon: 'book'},
            {label: 'minireset.css', icon: 'book'},
            {label: 'github', icon: 'code-fork'}]})
    ]); }
};

var DemoTabs = {
    view: function () { return mithril(Tabs, {items: [
        {label: 'All', icon: 'image', content: 'blob'},
        {label: 'Public', icon: 'film', content: 'wooot'},
        {label: 'Private', content: 'prive !!'}]}
    ); }
};


var Elements = {
    box: ['Box', DemoBox],
    button: ['Button', DemoButton],
    form: ['Form', DemoForm],
    image: ['Image', DemoImage],
    notif: ['Notification', DemoNotification],
    progress: ['Progress', DemoProgress],
    tag: ['Tag', DemoTag],
    table: ['Table', DemoTable],
    title: ['Title', DemoTitle]
};


var Components = {
    level: ['Level', DemoLevel],
    media: ['Media', DemoMedia],
    menu: ['Menu', DemoMenu],
    message: ['Message', DemoMessage],
    modal: ['Modal', DemoModal],
    nav: ['Nav', DemoNav],
    card: ['Card', DemoCard],
    pagination: ['Pagination', DemoPagination],
    panel: ['Panel', DemoPanel],
    tabs: ['Tabs', DemoTabs]
};


var Menu$$1 = {
    view: function (vnode) { return mithril(Menu$1, {
        selected: DataState.page,
        items: [
            {
                label: 'Demos',
                items: [
                    {   key: 'elements', label: 'Elements', 
                        items: Object.keys(Elements).map(function (key) {
                            return { 
                                key: key, 
                                onclick: function (key) { return DataState.page = key; }, 
                                label: Elements[key][0] }})
                    },
                    {   key: 'components', label: 'Components', 
                        items: Object.keys(Components).map(function (key) {
                            return { 
                                key: key, 
                                onclick: function (key) { return DataState.page = key; }, 
                                label: Components[key][0] }})
                    } ]
            }
        ]
    }); }
};

var get_demo = function () {
    console.log(DataState.page);
    if (DataState.page in Elements) { return mithril(Elements[DataState.page][1]) }
    if (DataState.page in Components) { return mithril(Components[DataState.page][1]) }
    return null
};

var App = {
    view: function (vnode) { return mithril('.container',
            mithril(Title, 'Bulmit'),
            mithril(".columns.is-mobile", 
                mithril('.column.is-one-third', mithril(Menu$$1)),
                mithril('.column', get_demo())
            )
        ); }
};


mithril.mount(document.getElementById('app'), App);

exports.App = App;

}((this.demo = this.demo || {})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCIuLi9idWlsZC9idWxtaXQubWluLmpzIiwiaW5kZXguZXM2LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm5ldyBmdW5jdGlvbigpIHtcblxuZnVuY3Rpb24gVm5vZGUodGFnLCBrZXksIGF0dHJzMCwgY2hpbGRyZW4sIHRleHQsIGRvbSkge1xuXHRyZXR1cm4ge3RhZzogdGFnLCBrZXk6IGtleSwgYXR0cnM6IGF0dHJzMCwgY2hpbGRyZW46IGNoaWxkcmVuLCB0ZXh0OiB0ZXh0LCBkb206IGRvbSwgZG9tU2l6ZTogdW5kZWZpbmVkLCBzdGF0ZToge30sIGV2ZW50czogdW5kZWZpbmVkLCBpbnN0YW5jZTogdW5kZWZpbmVkLCBza2lwOiBmYWxzZX1cbn1cblZub2RlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHJldHVybiBWbm9kZShcIltcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKG5vZGUpLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0aWYgKG5vZGUgIT0gbnVsbCAmJiB0eXBlb2Ygbm9kZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFZub2RlKFwiI1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm9kZSA9PT0gZmFsc2UgPyBcIlwiIDogbm9kZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdHJldHVybiBub2RlXG59XG5Wbm9kZS5ub3JtYWxpemVDaGlsZHJlbiA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRjaGlsZHJlbltpXSA9IFZub2RlLm5vcm1hbGl6ZShjaGlsZHJlbltpXSlcblx0fVxuXHRyZXR1cm4gY2hpbGRyZW5cbn1cbnZhciBzZWxlY3RvclBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbKC4rPykoPzpcXHMqPVxccyooXCJ8J3wpKCg/OlxcXFxbXCInXFxdXXwuKSo/KVxcNSk/XFxdKS9nXG52YXIgc2VsZWN0b3JDYWNoZSA9IHt9XG5mdW5jdGlvbiBoeXBlcnNjcmlwdChzZWxlY3Rvcikge1xuXHRpZiAoc2VsZWN0b3IgPT0gbnVsbCB8fCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHNlbGVjdG9yLnZpZXcgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHRocm93IEVycm9yKFwiVGhlIHNlbGVjdG9yIG11c3QgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGEgY29tcG9uZW50LlwiKTtcblx0fVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiICYmIHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgbWF0Y2gsIHRhZywgY2xhc3NlcyA9IFtdLCBhdHRyaWJ1dGVzID0ge31cblx0XHR3aGlsZSAobWF0Y2ggPSBzZWxlY3RvclBhcnNlci5leGVjKHNlbGVjdG9yKSkge1xuXHRcdFx0dmFyIHR5cGUgPSBtYXRjaFsxXSwgdmFsdWUgPSBtYXRjaFsyXVxuXHRcdFx0aWYgKHR5cGUgPT09IFwiXCIgJiYgdmFsdWUgIT09IFwiXCIpIHRhZyA9IHZhbHVlXG5cdFx0XHRlbHNlIGlmICh0eXBlID09PSBcIiNcIikgYXR0cmlidXRlcy5pZCA9IHZhbHVlXG5cdFx0XHRlbHNlIGlmICh0eXBlID09PSBcIi5cIikgY2xhc3Nlcy5wdXNoKHZhbHVlKVxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09IFwiW1wiKSB7XG5cdFx0XHRcdHZhciBhdHRyVmFsdWUgPSBtYXRjaFs2XVxuXHRcdFx0XHRpZiAoYXR0clZhbHVlKSBhdHRyVmFsdWUgPSBhdHRyVmFsdWUucmVwbGFjZSgvXFxcXChbXCInXSkvZywgXCIkMVwiKS5yZXBsYWNlKC9cXFxcXFxcXC9nLCBcIlxcXFxcIilcblx0XHRcdFx0aWYgKG1hdGNoWzRdID09PSBcImNsYXNzXCIpIGNsYXNzZXMucHVzaChhdHRyVmFsdWUpXG5cdFx0XHRcdGVsc2UgYXR0cmlidXRlc1ttYXRjaFs0XV0gPSBhdHRyVmFsdWUgfHwgdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBhdHRyaWJ1dGVzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRzZWxlY3RvckNhY2hlW3NlbGVjdG9yXSA9IGZ1bmN0aW9uKGF0dHJzLCBjaGlsZHJlbikge1xuXHRcdFx0dmFyIGhhc0F0dHJzID0gZmFsc2UsIGNoaWxkTGlzdCwgdGV4dFxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzTmFtZSB8fCBhdHRycy5jbGFzc1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIGF0dHJzW2tleV0gPSBhdHRyaWJ1dGVzW2tleV1cblx0XHRcdGlmIChjbGFzc05hbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAoYXR0cnMuY2xhc3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGF0dHJzLmNsYXNzID0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0YXR0cnMuY2xhc3NOYW1lID0gY2xhc3NOYW1lXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGF0dHJpYnV0ZXMuY2xhc3NOYW1lICE9PSB1bmRlZmluZWQpIGF0dHJzLmNsYXNzTmFtZSA9IGF0dHJpYnV0ZXMuY2xhc3NOYW1lICsgXCIgXCIgKyBjbGFzc05hbWVcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRycykge1xuXHRcdFx0XHRpZiAoa2V5ICE9PSBcImtleVwiKSB7XG5cdFx0XHRcdFx0aGFzQXR0cnMgPSB0cnVlXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pICYmIGNoaWxkcmVuLmxlbmd0aCA9PSAxICYmIGNoaWxkcmVuWzBdICE9IG51bGwgJiYgY2hpbGRyZW5bMF0udGFnID09PSBcIiNcIikgdGV4dCA9IGNoaWxkcmVuWzBdLmNoaWxkcmVuXG5cdFx0XHRlbHNlIGNoaWxkTGlzdCA9IGNoaWxkcmVuXG5cdFx0XHRyZXR1cm4gVm5vZGUodGFnIHx8IFwiZGl2XCIsIGF0dHJzLmtleSwgaGFzQXR0cnMgPyBhdHRycyA6IHVuZGVmaW5lZCwgY2hpbGRMaXN0LCB0ZXh0LCB1bmRlZmluZWQpXG5cdFx0fVxuXHR9XG5cdHZhciBhdHRycywgY2hpbGRyZW4sIGNoaWxkcmVuSW5kZXhcblx0aWYgKGFyZ3VtZW50c1sxXSA9PSBudWxsIHx8IHR5cGVvZiBhcmd1bWVudHNbMV0gPT09IFwib2JqZWN0XCIgJiYgYXJndW1lbnRzWzFdLnRhZyA9PT0gdW5kZWZpbmVkICYmICFBcnJheS5pc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcblx0XHRhdHRycyA9IGFyZ3VtZW50c1sxXVxuXHRcdGNoaWxkcmVuSW5kZXggPSAyXG5cdH1cblx0ZWxzZSBjaGlsZHJlbkluZGV4ID0gMVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gY2hpbGRyZW5JbmRleCArIDEpIHtcblx0XHRjaGlsZHJlbiA9IEFycmF5LmlzQXJyYXkoYXJndW1lbnRzW2NoaWxkcmVuSW5kZXhdKSA/IGFyZ3VtZW50c1tjaGlsZHJlbkluZGV4XSA6IFthcmd1bWVudHNbY2hpbGRyZW5JbmRleF1dXG5cdH1cblx0ZWxzZSB7XG5cdFx0Y2hpbGRyZW4gPSBbXVxuXHRcdGZvciAodmFyIGkgPSBjaGlsZHJlbkluZGV4OyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBjaGlsZHJlbi5wdXNoKGFyZ3VtZW50c1tpXSlcblx0fVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSByZXR1cm4gc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0oYXR0cnMgfHwge30sIFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKSlcblx0cmV0dXJuIFZub2RlKHNlbGVjdG9yLCBhdHRycyAmJiBhdHRycy5rZXksIGF0dHJzIHx8IHt9LCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbiksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuaHlwZXJzY3JpcHQudHJ1c3QgPSBmdW5jdGlvbihodG1sKSB7XG5cdGlmIChodG1sID09IG51bGwpIGh0bWwgPSBcIlwiXG5cdHJldHVybiBWbm9kZShcIjxcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGh0bWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuaHlwZXJzY3JpcHQuZnJhZ21lbnQgPSBmdW5jdGlvbihhdHRyczEsIGNoaWxkcmVuKSB7XG5cdHJldHVybiBWbm9kZShcIltcIiwgYXR0cnMxLmtleSwgYXR0cnMxLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbiksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxudmFyIG0gPSBoeXBlcnNjcmlwdFxuLyoqIEBjb25zdHJ1Y3RvciAqL1xudmFyIFByb21pc2VQb2x5ZmlsbCA9IGZ1bmN0aW9uKGV4ZWN1dG9yKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpKSB0aHJvdyBuZXcgRXJyb3IoXCJQcm9taXNlIG11c3QgYmUgY2FsbGVkIHdpdGggYG5ld2BcIilcblx0aWYgKHR5cGVvZiBleGVjdXRvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpXG5cdHZhciBzZWxmID0gdGhpcywgcmVzb2x2ZXJzID0gW10sIHJlamVjdG9ycyA9IFtdLCByZXNvbHZlQ3VycmVudCA9IGhhbmRsZXIocmVzb2x2ZXJzLCB0cnVlKSwgcmVqZWN0Q3VycmVudCA9IGhhbmRsZXIocmVqZWN0b3JzLCBmYWxzZSlcblx0dmFyIGluc3RhbmNlID0gc2VsZi5faW5zdGFuY2UgPSB7cmVzb2x2ZXJzOiByZXNvbHZlcnMsIHJlamVjdG9yczogcmVqZWN0b3JzfVxuXHR2YXIgY2FsbEFzeW5jID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogc2V0VGltZW91dFxuXHRmdW5jdGlvbiBoYW5kbGVyKGxpc3QsIHNob3VsZEFic29yYikge1xuXHRcdHJldHVybiBmdW5jdGlvbiBleGVjdXRlKHZhbHVlKSB7XG5cdFx0XHR2YXIgdGhlblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKHNob3VsZEFic29yYiAmJiB2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpICYmIHR5cGVvZiAodGhlbiA9IHZhbHVlLnRoZW4pID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlIGNhbid0IGJlIHJlc29sdmVkIHcvIGl0c2VsZlwiKVxuXHRcdFx0XHRcdGV4ZWN1dGVPbmNlKHRoZW4uYmluZCh2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2FsbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFzaG91bGRBYnNvcmIgJiYgbGlzdC5sZW5ndGggPT09IDApIGNvbnNvbGUuZXJyb3IoXCJQb3NzaWJsZSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246XCIsIHZhbHVlKVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSBsaXN0W2ldKHZhbHVlKVxuXHRcdFx0XHRcdFx0cmVzb2x2ZXJzLmxlbmd0aCA9IDAsIHJlamVjdG9ycy5sZW5ndGggPSAwXG5cdFx0XHRcdFx0XHRpbnN0YW5jZS5zdGF0ZSA9IHNob3VsZEFic29yYlxuXHRcdFx0XHRcdFx0aW5zdGFuY2UucmV0cnkgPSBmdW5jdGlvbigpIHtleGVjdXRlKHZhbHVlKX1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3RDdXJyZW50KGUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGV4ZWN1dGVPbmNlKHRoZW4pIHtcblx0XHR2YXIgcnVucyA9IDBcblx0XHRmdW5jdGlvbiBydW4oZm4pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZiAocnVucysrID4gMCkgcmV0dXJuXG5cdFx0XHRcdGZuKHZhbHVlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgb25lcnJvciA9IHJ1bihyZWplY3RDdXJyZW50KVxuXHRcdHRyeSB7dGhlbihydW4ocmVzb2x2ZUN1cnJlbnQpLCBvbmVycm9yKX0gY2F0Y2ggKGUpIHtvbmVycm9yKGUpfVxuXHR9XG5cdGV4ZWN1dGVPbmNlKGV4ZWN1dG9yKVxufVxuUHJvbWlzZVBvbHlmaWxsLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0aW9uKSB7XG5cdHZhciBzZWxmID0gdGhpcywgaW5zdGFuY2UgPSBzZWxmLl9pbnN0YW5jZVxuXHRmdW5jdGlvbiBoYW5kbGUoY2FsbGJhY2ssIGxpc3QsIG5leHQsIHN0YXRlKSB7XG5cdFx0bGlzdC5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIG5leHQodmFsdWUpXG5cdFx0XHRlbHNlIHRyeSB7cmVzb2x2ZU5leHQoY2FsbGJhY2sodmFsdWUpKX0gY2F0Y2ggKGUpIHtpZiAocmVqZWN0TmV4dCkgcmVqZWN0TmV4dChlKX1cblx0XHR9KVxuXHRcdGlmICh0eXBlb2YgaW5zdGFuY2UucmV0cnkgPT09IFwiZnVuY3Rpb25cIiAmJiBzdGF0ZSA9PT0gaW5zdGFuY2Uuc3RhdGUpIGluc3RhbmNlLnJldHJ5KClcblx0fVxuXHR2YXIgcmVzb2x2ZU5leHQsIHJlamVjdE5leHRcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3Jlc29sdmVOZXh0ID0gcmVzb2x2ZSwgcmVqZWN0TmV4dCA9IHJlamVjdH0pXG5cdGhhbmRsZShvbkZ1bGZpbGxlZCwgaW5zdGFuY2UucmVzb2x2ZXJzLCByZXNvbHZlTmV4dCwgdHJ1ZSksIGhhbmRsZShvblJlamVjdGlvbiwgaW5zdGFuY2UucmVqZWN0b3JzLCByZWplY3ROZXh0LCBmYWxzZSlcblx0cmV0dXJuIHByb21pc2Vcbn1cblByb21pc2VQb2x5ZmlsbC5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbihvblJlamVjdGlvbikge1xuXHRyZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpIHJldHVybiB2YWx1ZVxuXHRyZXR1cm4gbmV3IFByb21pc2VQb2x5ZmlsbChmdW5jdGlvbihyZXNvbHZlKSB7cmVzb2x2ZSh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3JlamVjdCh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLmFsbCA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0dmFyIHRvdGFsID0gbGlzdC5sZW5ndGgsIGNvdW50ID0gMCwgdmFsdWVzID0gW11cblx0XHRpZiAobGlzdC5sZW5ndGggPT09IDApIHJlc29sdmUoW10pXG5cdFx0ZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdChmdW5jdGlvbihpKSB7XG5cdFx0XHRcdGZ1bmN0aW9uIGNvbnN1bWUodmFsdWUpIHtcblx0XHRcdFx0XHRjb3VudCsrXG5cdFx0XHRcdFx0dmFsdWVzW2ldID0gdmFsdWVcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IHRvdGFsKSByZXNvbHZlKHZhbHVlcylcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobGlzdFtpXSAhPSBudWxsICYmICh0eXBlb2YgbGlzdFtpXSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgbGlzdFtpXSA9PT0gXCJmdW5jdGlvblwiKSAmJiB0eXBlb2YgbGlzdFtpXS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRsaXN0W2ldLnRoZW4oY29uc3VtZSwgcmVqZWN0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgY29uc3VtZShsaXN0W2ldKVxuXHRcdFx0fSkoaSlcblx0XHR9XG5cdH0pXG59XG5Qcm9taXNlUG9seWZpbGwucmFjZSA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaXN0W2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuXHRcdH1cblx0fSlcbn1cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93LlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSB3aW5kb3cuUHJvbWlzZVxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsLlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIGdsb2JhbC5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSBnbG9iYWwuUHJvbWlzZVxufSBlbHNlIHtcbn1cbnZhciBidWlsZFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIFwiXCJcblx0dmFyIGFyZ3MgPSBbXVxuXHRmb3IgKHZhciBrZXkwIGluIG9iamVjdCkge1xuXHRcdGRlc3RydWN0dXJlKGtleTAsIG9iamVjdFtrZXkwXSlcblx0fVxuXHRyZXR1cm4gYXJncy5qb2luKFwiJlwiKVxuXHRmdW5jdGlvbiBkZXN0cnVjdHVyZShrZXkwLCB2YWx1ZSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkwICsgXCJbXCIgKyBpICsgXCJdXCIsIHZhbHVlW2ldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIHZhbHVlKSB7XG5cdFx0XHRcdGRlc3RydWN0dXJlKGtleTAgKyBcIltcIiArIGkgKyBcIl1cIiwgdmFsdWVbaV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgYXJncy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkwKSArICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBcIlwiID8gXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpIDogXCJcIikpXG5cdH1cbn1cbnZhciBfOCA9IGZ1bmN0aW9uKCR3aW5kb3csIFByb21pc2UpIHtcblx0dmFyIGNhbGxiYWNrQ291bnQgPSAwXG5cdHZhciBvbmNvbXBsZXRpb25cblx0ZnVuY3Rpb24gc2V0Q29tcGxldGlvbkNhbGxiYWNrKGNhbGxiYWNrKSB7b25jb21wbGV0aW9uID0gY2FsbGJhY2t9XG5cdGZ1bmN0aW9uIGZpbmFsaXplcigpIHtcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0ZnVuY3Rpb24gY29tcGxldGUoKSB7aWYgKC0tY291bnQgPT09IDAgJiYgdHlwZW9mIG9uY29tcGxldGlvbiA9PT0gXCJmdW5jdGlvblwiKSBvbmNvbXBsZXRpb24oKX1cblx0XHRyZXR1cm4gZnVuY3Rpb24gZmluYWxpemUocHJvbWlzZTApIHtcblx0XHRcdHZhciB0aGVuMCA9IHByb21pc2UwLnRoZW5cblx0XHRcdHByb21pc2UwLnRoZW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y291bnQrK1xuXHRcdFx0XHR2YXIgbmV4dCA9IHRoZW4wLmFwcGx5KHByb21pc2UwLCBhcmd1bWVudHMpXG5cdFx0XHRcdG5leHQudGhlbihjb21wbGV0ZSwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdGNvbXBsZXRlKClcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IDApIHRocm93IGVcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIGZpbmFsaXplKG5leHQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTBcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKSB7XG5cdFx0aWYgKHR5cGVvZiBhcmdzID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR2YXIgdXJsID0gYXJnc1xuXHRcdFx0YXJncyA9IGV4dHJhIHx8IHt9XG5cdFx0XHRpZiAoYXJncy51cmwgPT0gbnVsbCkgYXJncy51cmwgPSB1cmxcblx0XHR9XG5cdFx0cmV0dXJuIGFyZ3Ncblx0fVxuXHRmdW5jdGlvbiByZXF1ZXN0KGFyZ3MsIGV4dHJhKSB7XG5cdFx0dmFyIGZpbmFsaXplID0gZmluYWxpemVyKClcblx0XHRhcmdzID0gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKVxuXHRcdHZhciBwcm9taXNlMCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0aWYgKGFyZ3MubWV0aG9kID09IG51bGwpIGFyZ3MubWV0aG9kID0gXCJHRVRcIlxuXHRcdFx0YXJncy5tZXRob2QgPSBhcmdzLm1ldGhvZC50b1VwcGVyQ2FzZSgpXG5cdFx0XHR2YXIgdXNlQm9keSA9IHR5cGVvZiBhcmdzLnVzZUJvZHkgPT09IFwiYm9vbGVhblwiID8gYXJncy51c2VCb2R5IDogYXJncy5tZXRob2QgIT09IFwiR0VUXCIgJiYgYXJncy5tZXRob2QgIT09IFwiVFJBQ0VcIlxuXHRcdFx0aWYgKHR5cGVvZiBhcmdzLnNlcmlhbGl6ZSAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLnNlcmlhbGl6ZSA9IHR5cGVvZiBGb3JtRGF0YSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhcmdzLmRhdGEgaW5zdGFuY2VvZiBGb3JtRGF0YSA/IGZ1bmN0aW9uKHZhbHVlKSB7cmV0dXJuIHZhbHVlfSA6IEpTT04uc3RyaW5naWZ5XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZGVzZXJpYWxpemUgIT09IFwiZnVuY3Rpb25cIikgYXJncy5kZXNlcmlhbGl6ZSA9IGRlc2VyaWFsaXplXG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZXh0cmFjdCAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLmV4dHJhY3QgPSBleHRyYWN0XG5cdFx0XHRhcmdzLnVybCA9IGludGVycG9sYXRlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHRpZiAodXNlQm9keSkgYXJncy5kYXRhID0gYXJncy5zZXJpYWxpemUoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSBhcmdzLnVybCA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHR2YXIgeGhyID0gbmV3ICR3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuXHRcdFx0eGhyLm9wZW4oYXJncy5tZXRob2QsIGFyZ3MudXJsLCB0eXBlb2YgYXJncy5hc3luYyA9PT0gXCJib29sZWFuXCIgPyBhcmdzLmFzeW5jIDogdHJ1ZSwgdHlwZW9mIGFyZ3MudXNlciA9PT0gXCJzdHJpbmdcIiA/IGFyZ3MudXNlciA6IHVuZGVmaW5lZCwgdHlwZW9mIGFyZ3MucGFzc3dvcmQgPT09IFwic3RyaW5nXCIgPyBhcmdzLnBhc3N3b3JkIDogdW5kZWZpbmVkKVxuXHRcdFx0aWYgKGFyZ3Muc2VyaWFsaXplID09PSBKU09OLnN0cmluZ2lmeSAmJiB1c2VCb2R5KSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGVzZXJpYWxpemUgPT09IGRlc2VyaWFsaXplKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy53aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSBhcmdzLndpdGhDcmVkZW50aWFsc1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZ3MuaGVhZGVycykgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwoYXJncy5oZWFkZXJzLCBrZXkpKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgYXJncy5oZWFkZXJzW2tleV0pXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuY29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHhociA9IGFyZ3MuY29uZmlnKHhociwgYXJncykgfHwgeGhyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIERvbid0IHRocm93IGVycm9ycyBvbiB4aHIuYWJvcnQoKS4gWE1MSHR0cFJlcXVlc3RzIGVuZHMgdXAgaW4gYSBzdGF0ZSBvZlxuXHRcdFx0XHQvLyB4aHIuc3RhdHVzID09IDAgYW5kIHhoci5yZWFkeVN0YXRlID09IDQgaWYgYWJvcnRlZCBhZnRlciBvcGVuLCBidXQgYmVmb3JlIGNvbXBsZXRpb24uXG5cdFx0XHRcdGlmICh4aHIuc3RhdHVzICYmIHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHZhciByZXNwb25zZSA9IChhcmdzLmV4dHJhY3QgIT09IGV4dHJhY3QpID8gYXJncy5leHRyYWN0KHhociwgYXJncykgOiBhcmdzLmRlc2VyaWFsaXplKGFyZ3MuZXh0cmFjdCh4aHIsIGFyZ3MpKVxuXHRcdFx0XHRcdFx0aWYgKCh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB8fCB4aHIuc3RhdHVzID09PSAzMDQpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShjYXN0KGFyZ3MudHlwZSwgcmVzcG9uc2UpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IG5ldyBFcnJvcih4aHIucmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVzcG9uc2UpIGVycm9yW2tleV0gPSByZXNwb25zZVtrZXldXG5cdFx0XHRcdFx0XHRcdHJlamVjdChlcnJvcilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHJlamVjdChlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHVzZUJvZHkgJiYgKGFyZ3MuZGF0YSAhPSBudWxsKSkgeGhyLnNlbmQoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSB4aHIuc2VuZCgpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlID8gcHJvbWlzZTAgOiBmaW5hbGl6ZShwcm9taXNlMClcblx0fVxuXHRmdW5jdGlvbiBqc29ucChhcmdzLCBleHRyYSkge1xuXHRcdHZhciBmaW5hbGl6ZSA9IGZpbmFsaXplcigpXG5cdFx0YXJncyA9IG5vcm1hbGl6ZShhcmdzLCBleHRyYSlcblx0XHR2YXIgcHJvbWlzZTAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdHZhciBjYWxsYmFja05hbWUgPSBhcmdzLmNhbGxiYWNrTmFtZSB8fCBcIl9taXRocmlsX1wiICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikgKyBcIl9cIiArIGNhbGxiYWNrQ291bnQrK1xuXHRcdFx0dmFyIHNjcmlwdCA9ICR3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKVxuXHRcdFx0JHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlc29sdmUoY2FzdChhcmdzLnR5cGUsIGRhdGEpKVxuXHRcdFx0XHRkZWxldGUgJHdpbmRvd1tjYWxsYmFja05hbWVdXG5cdFx0XHR9XG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoXCJKU09OUCByZXF1ZXN0IGZhaWxlZFwiKSlcblx0XHRcdFx0ZGVsZXRlICR3aW5kb3dbY2FsbGJhY2tOYW1lXVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGF0YSA9PSBudWxsKSBhcmdzLmRhdGEgPSB7fVxuXHRcdFx0YXJncy51cmwgPSBpbnRlcnBvbGF0ZShhcmdzLnVybCwgYXJncy5kYXRhKVxuXHRcdFx0YXJncy5kYXRhW2FyZ3MuY2FsbGJhY2tLZXkgfHwgXCJjYWxsYmFja1wiXSA9IGNhbGxiYWNrTmFtZVxuXHRcdFx0c2NyaXB0LnNyYyA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHQkd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChzY3JpcHQpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlPyBwcm9taXNlMCA6IGZpbmFsaXplKHByb21pc2UwKVxuXHR9XG5cdGZ1bmN0aW9uIGludGVycG9sYXRlKHVybCwgZGF0YSkge1xuXHRcdGlmIChkYXRhID09IG51bGwpIHJldHVybiB1cmxcblx0XHR2YXIgdG9rZW5zID0gdXJsLm1hdGNoKC86W15cXC9dKy9naSkgfHwgW11cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IHRva2Vuc1tpXS5zbGljZSgxKVxuXHRcdFx0aWYgKGRhdGFba2V5XSAhPSBudWxsKSB7XG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2Vuc1tpXSwgZGF0YVtrZXldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdXJsXG5cdH1cblx0ZnVuY3Rpb24gYXNzZW1ibGUodXJsLCBkYXRhKSB7XG5cdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKVxuXHRcdGlmIChxdWVyeXN0cmluZyAhPT0gXCJcIikge1xuXHRcdFx0dmFyIHByZWZpeCA9IHVybC5pbmRleE9mKFwiP1wiKSA8IDAgPyBcIj9cIiA6IFwiJlwiXG5cdFx0XHR1cmwgKz0gcHJlZml4ICsgcXVlcnlzdHJpbmdcblx0XHR9XG5cdFx0cmV0dXJuIHVybFxuXHR9XG5cdGZ1bmN0aW9uIGRlc2VyaWFsaXplKGRhdGEpIHtcblx0XHR0cnkge3JldHVybiBkYXRhICE9PSBcIlwiID8gSlNPTi5wYXJzZShkYXRhKSA6IG51bGx9XG5cdFx0Y2F0Y2ggKGUpIHt0aHJvdyBuZXcgRXJyb3IoZGF0YSl9XG5cdH1cblx0ZnVuY3Rpb24gZXh0cmFjdCh4aHIpIHtyZXR1cm4geGhyLnJlc3BvbnNlVGV4dH1cblx0ZnVuY3Rpb24gY2FzdCh0eXBlMCwgZGF0YSkge1xuXHRcdGlmICh0eXBlb2YgdHlwZTAgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZGF0YVtpXSA9IG5ldyB0eXBlMChkYXRhW2ldKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHJldHVybiBuZXcgdHlwZTAoZGF0YSlcblx0XHR9XG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXHRyZXR1cm4ge3JlcXVlc3Q6IHJlcXVlc3QsIGpzb25wOiBqc29ucCwgc2V0Q29tcGxldGlvbkNhbGxiYWNrOiBzZXRDb21wbGV0aW9uQ2FsbGJhY2t9XG59XG52YXIgcmVxdWVzdFNlcnZpY2UgPSBfOCh3aW5kb3csIFByb21pc2VQb2x5ZmlsbClcbnZhciBjb3JlUmVuZGVyZXIgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciAkZG9jID0gJHdpbmRvdy5kb2N1bWVudFxuXHR2YXIgJGVtcHR5RnJhZ21lbnQgPSAkZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHR2YXIgb25ldmVudFxuXHRmdW5jdGlvbiBzZXRFdmVudENhbGxiYWNrKGNhbGxiYWNrKSB7cmV0dXJuIG9uZXZlbnQgPSBjYWxsYmFja31cblx0Ly9jcmVhdGVcblx0ZnVuY3Rpb24gY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCBlbmQsIGhvb2tzLCBuZXh0U2libGluZywgbnMpIHtcblx0XHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0dmFyIHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgaW5pdExpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdGlmICh0eXBlb2YgdGFnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRzd2l0Y2ggKHRhZykge1xuXHRcdFx0XHRjYXNlIFwiI1wiOiByZXR1cm4gY3JlYXRlVGV4dChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHRcdFx0Y2FzZSBcIjxcIjogcmV0dXJuIGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdGNhc2UgXCJbXCI6IHJldHVybiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRkZWZhdWx0OiByZXR1cm4gY3JlYXRlRWxlbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHJldHVybiBjcmVhdGVDb21wb25lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVUZXh0KHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0dm5vZGUuZG9tID0gJGRvYy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS5jaGlsZHJlbilcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgdm5vZGUuZG9tLCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZykge1xuXHRcdHZhciBtYXRjaDEgPSB2bm9kZS5jaGlsZHJlbi5tYXRjaCgvXlxccyo/PChcXHcrKS9pbSkgfHwgW11cblx0XHR2YXIgcGFyZW50MSA9IHtjYXB0aW9uOiBcInRhYmxlXCIsIHRoZWFkOiBcInRhYmxlXCIsIHRib2R5OiBcInRhYmxlXCIsIHRmb290OiBcInRhYmxlXCIsIHRyOiBcInRib2R5XCIsIHRoOiBcInRyXCIsIHRkOiBcInRyXCIsIGNvbGdyb3VwOiBcInRhYmxlXCIsIGNvbDogXCJjb2xncm91cFwifVttYXRjaDFbMV1dIHx8IFwiZGl2XCJcblx0XHR2YXIgdGVtcCA9ICRkb2MuY3JlYXRlRWxlbWVudChwYXJlbnQxKVxuXHRcdHRlbXAuaW5uZXJIVE1MID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSB0ZW1wLmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gdGVtcC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdHZhciBmcmFnbWVudCA9ICRkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0dmFyIGNoaWxkXG5cdFx0d2hpbGUgKGNoaWxkID0gdGVtcC5maXJzdENoaWxkKSB7XG5cdFx0XHRmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0XHR9XG5cdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGZyYWdtZW50LCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gZnJhZ21lbnRcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRpZiAodm5vZGUuY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGNyZWF0ZU5vZGVzKGZyYWdtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGZyYWdtZW50LmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGhcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHRcdHJldHVybiBmcmFnbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHRzd2l0Y2ggKHZub2RlLnRhZykge1xuXHRcdFx0Y2FzZSBcInN2Z1wiOiBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjsgYnJlYWtcblx0XHRcdGNhc2UgXCJtYXRoXCI6IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCI7IGJyZWFrXG5cdFx0fVxuXHRcdHZhciBhdHRyczIgPSB2bm9kZS5hdHRyc1xuXHRcdHZhciBpcyA9IGF0dHJzMiAmJiBhdHRyczIuaXNcblx0XHR2YXIgZWxlbWVudCA9IG5zID9cblx0XHRcdGlzID8gJGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZywge2lzOiBpc30pIDogJGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZykgOlxuXHRcdFx0aXMgPyAkZG9jLmNyZWF0ZUVsZW1lbnQodGFnLCB7aXM6IGlzfSkgOiAkZG9jLmNyZWF0ZUVsZW1lbnQodGFnKVxuXHRcdHZub2RlLmRvbSA9IGVsZW1lbnRcblx0XHRpZiAoYXR0cnMyICE9IG51bGwpIHtcblx0XHRcdHNldEF0dHJzKHZub2RlLCBhdHRyczIsIG5zKVxuXHRcdH1cblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdm5vZGUuYXR0cnMuY29udGVudGVkaXRhYmxlICE9IG51bGwpIHtcblx0XHRcdHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSlcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodm5vZGUudGV4dCAhPSBudWxsKSB7XG5cdFx0XHRcdGlmICh2bm9kZS50ZXh0ICE9PSBcIlwiKSBlbGVtZW50LnRleHRDb250ZW50ID0gdm5vZGUudGV4dFxuXHRcdFx0XHRlbHNlIHZub2RlLmNoaWxkcmVuID0gW1Zub2RlKFwiI1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdm5vZGUudGV4dCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXVxuXHRcdFx0fVxuXHRcdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdFx0Y3JlYXRlTm9kZXMoZWxlbWVudCwgY2hpbGRyZW4sIDAsIGNoaWxkcmVuLmxlbmd0aCwgaG9va3MsIG51bGwsIG5zKVxuXHRcdFx0XHRzZXRMYXRlQXR0cnModm5vZGUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBlbGVtZW50XG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpIHtcblx0XHR2bm9kZS5zdGF0ZSA9IE9iamVjdC5jcmVhdGUodm5vZGUudGFnKVxuXHRcdHZhciB2aWV3ID0gdm5vZGUudGFnLnZpZXdcblx0XHRpZiAodmlldy5yZWVudHJhbnRMb2NrICE9IG51bGwpIHJldHVybiAkZW1wdHlGcmFnbWVudFxuXHRcdHZpZXcucmVlbnRyYW50TG9jayA9IHRydWVcblx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLnRhZywgdm5vZGUsIGhvb2tzKVxuXHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKHZpZXcuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHRcdHZpZXcucmVlbnRyYW50TG9jayA9IG51bGxcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHZub2RlLmluc3RhbmNlID09PSB2bm9kZSkgdGhyb3cgRXJyb3IoXCJBIHZpZXcgY2Fubm90IHJldHVybiB0aGUgdm5vZGUgaXQgcmVjZWl2ZWQgYXMgYXJndW1lbnRzXCIpXG5cdFx0XHR2YXIgZWxlbWVudCA9IGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmRvbSAhPSBudWxsID8gdm5vZGUuaW5zdGFuY2UuZG9tU2l6ZSA6IDBcblx0XHRcdGluc2VydE5vZGUocGFyZW50LCBlbGVtZW50LCBuZXh0U2libGluZylcblx0XHRcdHJldHVybiBlbGVtZW50XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IDBcblx0XHRcdHJldHVybiAkZW1wdHlGcmFnbWVudFxuXHRcdH1cblx0fVxuXHQvL3VwZGF0ZVxuXHRmdW5jdGlvbiB1cGRhdGVOb2RlcyhwYXJlbnQsIG9sZCwgdm5vZGVzLCByZWN5Y2xpbmcsIGhvb2tzLCBuZXh0U2libGluZywgbnMpIHtcblx0XHRpZiAob2xkID09PSB2bm9kZXMgfHwgb2xkID09IG51bGwgJiYgdm5vZGVzID09IG51bGwpIHJldHVyblxuXHRcdGVsc2UgaWYgKG9sZCA9PSBudWxsKSBjcmVhdGVOb2RlcyhwYXJlbnQsIHZub2RlcywgMCwgdm5vZGVzLmxlbmd0aCwgaG9va3MsIG5leHRTaWJsaW5nLCB1bmRlZmluZWQpXG5cdFx0ZWxzZSBpZiAodm5vZGVzID09IG51bGwpIHJlbW92ZU5vZGVzKG9sZCwgMCwgb2xkLmxlbmd0aCwgdm5vZGVzKVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKG9sZC5sZW5ndGggPT09IHZub2Rlcy5sZW5ndGgpIHtcblx0XHRcdFx0dmFyIGlzVW5rZXllZCA9IGZhbHNlXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKHZub2Rlc1tpXSAhPSBudWxsICYmIG9sZFtpXSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRpc1Vua2V5ZWQgPSB2bm9kZXNbaV0ua2V5ID09IG51bGwgJiYgb2xkW2ldLmtleSA9PSBudWxsXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNVbmtleWVkKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmIChvbGRbaV0gPT09IHZub2Rlc1tpXSkgY29udGludWVcblx0XHRcdFx0XHRcdGVsc2UgaWYgKG9sZFtpXSA9PSBudWxsICYmIHZub2Rlc1tpXSAhPSBudWxsKSBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGVzW2ldLCBob29rcywgbnMsIGdldE5leHRTaWJsaW5nKG9sZCwgaSArIDEsIG5leHRTaWJsaW5nKSlcblx0XHRcdFx0XHRcdGVsc2UgaWYgKHZub2Rlc1tpXSA9PSBudWxsKSByZW1vdmVOb2RlcyhvbGQsIGksIGkgKyAxLCB2bm9kZXMpXG5cdFx0XHRcdFx0XHRlbHNlIHVwZGF0ZU5vZGUocGFyZW50LCBvbGRbaV0sIHZub2Rlc1tpXSwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgaSArIDEsIG5leHRTaWJsaW5nKSwgZmFsc2UsIG5zKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVjeWNsaW5nID0gcmVjeWNsaW5nIHx8IGlzUmVjeWNsYWJsZShvbGQsIHZub2Rlcylcblx0XHRcdGlmIChyZWN5Y2xpbmcpIG9sZCA9IG9sZC5jb25jYXQob2xkLnBvb2wpXG5cdFx0XHRcblx0XHRcdHZhciBvbGRTdGFydCA9IDAsIHN0YXJ0ID0gMCwgb2xkRW5kID0gb2xkLmxlbmd0aCAtIDEsIGVuZCA9IHZub2Rlcy5sZW5ndGggLSAxLCBtYXBcblx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdHZhciBvID0gb2xkW29sZFN0YXJ0XSwgdiA9IHZub2Rlc1tzdGFydF1cblx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkU3RhcnQrKywgc3RhcnQrK1xuXHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZFN0YXJ0Kytcblx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdGVsc2UgaWYgKG8ua2V5ID09PSB2LmtleSkge1xuXHRcdFx0XHRcdG9sZFN0YXJ0KyssIHN0YXJ0Kytcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG5leHRTaWJsaW5nKSwgcmVjeWNsaW5nLCBucylcblx0XHRcdFx0XHRpZiAocmVjeWNsaW5nICYmIG8udGFnID09PSB2LnRhZykgaW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobyksIG5leHRTaWJsaW5nKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHZhciBvID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHRpZiAobyA9PT0gdiAmJiAhcmVjeWNsaW5nKSBvbGRFbmQtLSwgc3RhcnQrK1xuXHRcdFx0XHRcdGVsc2UgaWYgKG8gPT0gbnVsbCkgb2xkRW5kLS1cblx0XHRcdFx0XHRlbHNlIGlmICh2ID09IG51bGwpIHN0YXJ0Kytcblx0XHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRFbmQgKyAxLCBuZXh0U2libGluZyksIHJlY3ljbGluZywgbnMpXG5cdFx0XHRcdFx0XHRpZiAocmVjeWNsaW5nIHx8IHN0YXJ0IDwgZW5kKSBpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChvKSwgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRTdGFydCwgbmV4dFNpYmxpbmcpKVxuXHRcdFx0XHRcdFx0b2xkRW5kLS0sIHN0YXJ0Kytcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBicmVha1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRFbmRdLCB2ID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkRW5kLS0sIGVuZC0tXG5cdFx0XHRcdGVsc2UgaWYgKG8gPT0gbnVsbCkgb2xkRW5kLS1cblx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBlbmQtLVxuXHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkRW5kICsgMSwgbmV4dFNpYmxpbmcpLCByZWN5Y2xpbmcsIG5zKVxuXHRcdFx0XHRcdGlmIChyZWN5Y2xpbmcgJiYgby50YWcgPT09IHYudGFnKSBpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChvKSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0aWYgKG8uZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gby5kb21cblx0XHRcdFx0XHRvbGRFbmQtLSwgZW5kLS1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiAoIW1hcCkgbWFwID0gZ2V0S2V5TWFwKG9sZCwgb2xkRW5kKVxuXHRcdFx0XHRcdGlmICh2ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdHZhciBvbGRJbmRleCA9IG1hcFt2LmtleV1cblx0XHRcdFx0XHRcdGlmIChvbGRJbmRleCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBtb3ZhYmxlID0gb2xkW29sZEluZGV4XVxuXHRcdFx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbW92YWJsZSwgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkRW5kICsgMSwgbmV4dFNpYmxpbmcpLCByZWN5Y2xpbmcsIG5zKVxuXHRcdFx0XHRcdFx0XHRpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChtb3ZhYmxlKSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0XHRcdG9sZFtvbGRJbmRleF0uc2tpcCA9IHRydWVcblx0XHRcdFx0XHRcdFx0aWYgKG1vdmFibGUuZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gbW92YWJsZS5kb21cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR2YXIgZG9tID0gY3JlYXRlTm9kZShwYXJlbnQsIHYsIGhvb2tzLCB1bmRlZmluZWQsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdFx0XHRuZXh0U2libGluZyA9IGRvbVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbmQtLVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChlbmQgPCBzdGFydCkgYnJlYWtcblx0XHRcdH1cblx0XHRcdGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kICsgMSwgaG9va3MsIG5leHRTaWJsaW5nLCBucylcblx0XHRcdHJlbW92ZU5vZGVzKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEsIHZub2Rlcylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlTm9kZShwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucykge1xuXHRcdHZhciBvbGRUYWcgPSBvbGQudGFnLCB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAob2xkVGFnID09PSB0YWcpIHtcblx0XHRcdHZub2RlLnN0YXRlID0gb2xkLnN0YXRlXG5cdFx0XHR2bm9kZS5ldmVudHMgPSBvbGQuZXZlbnRzXG5cdFx0XHRpZiAoc2hvdWxkVXBkYXRlKHZub2RlLCBvbGQpKSByZXR1cm5cblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSB7XG5cdFx0XHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzLCByZWN5Y2xpbmcpXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIG9sZFRhZyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzd2l0Y2ggKG9sZFRhZykge1xuXHRcdFx0XHRcdGNhc2UgXCIjXCI6IHVwZGF0ZVRleHQob2xkLCB2bm9kZSk7IGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBcIjxcIjogdXBkYXRlSFRNTChwYXJlbnQsIG9sZCwgdm5vZGUsIG5leHRTaWJsaW5nKTsgYnJlYWtcblx0XHRcdFx0XHRjYXNlIFwiW1wiOiB1cGRhdGVGcmFnbWVudChwYXJlbnQsIG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucyk7IGJyZWFrXG5cdFx0XHRcdFx0ZGVmYXVsdDogdXBkYXRlRWxlbWVudChvbGQsIHZub2RlLCByZWN5Y2xpbmcsIGhvb2tzLCBucylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB1cGRhdGVDb21wb25lbnQocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIHJlY3ljbGluZywgbnMpXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVtb3ZlTm9kZShvbGQsIG51bGwpXG5cdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZVRleHQob2xkLCB2bm9kZSkge1xuXHRcdGlmIChvbGQuY2hpbGRyZW4udG9TdHJpbmcoKSAhPT0gdm5vZGUuY2hpbGRyZW4udG9TdHJpbmcoKSkge1xuXHRcdFx0b2xkLmRvbS5ub2RlVmFsdWUgPSB2bm9kZS5jaGlsZHJlblxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlSFRNTChwYXJlbnQsIG9sZCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbiAhPT0gdm5vZGUuY2hpbGRyZW4pIHtcblx0XHRcdHRvRnJhZ21lbnQob2xkKVxuXHRcdFx0Y3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHR9XG5cdFx0ZWxzZSB2bm9kZS5kb20gPSBvbGQuZG9tLCB2bm9kZS5kb21TaXplID0gb2xkLmRvbVNpemVcblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVGcmFnbWVudChwYXJlbnQsIG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucykge1xuXHRcdHVwZGF0ZU5vZGVzKHBhcmVudCwgb2xkLmNoaWxkcmVuLCB2bm9kZS5jaGlsZHJlbiwgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKVxuXHRcdHZhciBkb21TaXplID0gMCwgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdHZub2RlLmRvbSA9IG51bGxcblx0XHRpZiAoY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRpZiAoY2hpbGQgIT0gbnVsbCAmJiBjaGlsZC5kb20gIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmICh2bm9kZS5kb20gPT0gbnVsbCkgdm5vZGUuZG9tID0gY2hpbGQuZG9tXG5cdFx0XHRcdFx0ZG9tU2l6ZSArPSBjaGlsZC5kb21TaXplIHx8IDFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGRvbVNpemUgIT09IDEpIHZub2RlLmRvbVNpemUgPSBkb21TaXplXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQob2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbnMpIHtcblx0XHR2YXIgZWxlbWVudCA9IHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRzd2l0Y2ggKHZub2RlLnRhZykge1xuXHRcdFx0Y2FzZSBcInN2Z1wiOiBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjsgYnJlYWtcblx0XHRcdGNhc2UgXCJtYXRoXCI6IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCI7IGJyZWFrXG5cdFx0fVxuXHRcdGlmICh2bm9kZS50YWcgPT09IFwidGV4dGFyZWFcIikge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0XHRcdGlmICh2bm9kZS50ZXh0ICE9IG51bGwpIHtcblx0XHRcdFx0dm5vZGUuYXR0cnMudmFsdWUgPSB2bm9kZS50ZXh0IC8vRklYTUUgaGFuZGxlMCBtdWx0aXBsZSBjaGlsZHJlblxuXHRcdFx0XHR2bm9kZS50ZXh0ID0gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHVwZGF0ZUF0dHJzKHZub2RlLCBvbGQuYXR0cnMsIHZub2RlLmF0dHJzLCBucylcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCAmJiB2bm9kZS5hdHRycy5jb250ZW50ZWRpdGFibGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q29udGVudEVkaXRhYmxlKHZub2RlKVxuXHRcdH1cblx0XHRlbHNlIGlmIChvbGQudGV4dCAhPSBudWxsICYmIHZub2RlLnRleHQgIT0gbnVsbCAmJiB2bm9kZS50ZXh0ICE9PSBcIlwiKSB7XG5cdFx0XHRpZiAob2xkLnRleHQudG9TdHJpbmcoKSAhPT0gdm5vZGUudGV4dC50b1N0cmluZygpKSBvbGQuZG9tLmZpcnN0Q2hpbGQubm9kZVZhbHVlID0gdm5vZGUudGV4dFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQudGV4dCAhPSBudWxsKSBvbGQuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvbGQudGV4dCwgdW5kZWZpbmVkLCBvbGQuZG9tLmZpcnN0Q2hpbGQpXVxuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkgdm5vZGUuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB2bm9kZS50ZXh0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCldXG5cdFx0XHR1cGRhdGVOb2RlcyhlbGVtZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCByZWN5Y2xpbmcsIGhvb2tzLCBudWxsLCBucylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlQ29tcG9uZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgaG9va3MsIG5leHRTaWJsaW5nLCByZWN5Y2xpbmcsIG5zKSB7XG5cdFx0dm5vZGUuaW5zdGFuY2UgPSBWbm9kZS5ub3JtYWxpemUodm5vZGUudGFnLnZpZXcuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS50YWcsIHZub2RlLCBob29rcywgcmVjeWNsaW5nKVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAob2xkLmluc3RhbmNlID09IG51bGwpIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmluc3RhbmNlLmRvbVNpemVcblx0XHR9XG5cdFx0ZWxzZSBpZiAob2xkLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdHJlbW92ZU5vZGUob2xkLmluc3RhbmNlLCBudWxsKVxuXHRcdFx0dm5vZGUuZG9tID0gdW5kZWZpbmVkXG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBpc1JlY3ljbGFibGUob2xkLCB2bm9kZXMpIHtcblx0XHRpZiAob2xkLnBvb2wgIT0gbnVsbCAmJiBNYXRoLmFicyhvbGQucG9vbC5sZW5ndGggLSB2bm9kZXMubGVuZ3RoKSA8PSBNYXRoLmFicyhvbGQubGVuZ3RoIC0gdm5vZGVzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBvbGRDaGlsZHJlbkxlbmd0aCA9IG9sZFswXSAmJiBvbGRbMF0uY2hpbGRyZW4gJiYgb2xkWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHR2YXIgcG9vbENoaWxkcmVuTGVuZ3RoID0gb2xkLnBvb2xbMF0gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4ubGVuZ3RoIHx8IDBcblx0XHRcdHZhciB2bm9kZXNDaGlsZHJlbkxlbmd0aCA9IHZub2Rlc1swXSAmJiB2bm9kZXNbMF0uY2hpbGRyZW4gJiYgdm5vZGVzWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHRpZiAoTWF0aC5hYnMocG9vbENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpIDw9IE1hdGguYWJzKG9sZENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cdGZ1bmN0aW9uIGdldEtleU1hcCh2bm9kZXMsIGVuZCkge1xuXHRcdHZhciBtYXAgPSB7fSwgaSA9IDBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHR2YXIgdm5vZGUgPSB2bm9kZXNbaV1cblx0XHRcdGlmICh2bm9kZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBrZXkyID0gdm5vZGUua2V5XG5cdFx0XHRcdGlmIChrZXkyICE9IG51bGwpIG1hcFtrZXkyXSA9IGlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1hcFxuXHR9XG5cdGZ1bmN0aW9uIHRvRnJhZ21lbnQodm5vZGUpIHtcblx0XHR2YXIgY291bnQwID0gdm5vZGUuZG9tU2l6ZVxuXHRcdGlmIChjb3VudDAgIT0gbnVsbCB8fCB2bm9kZS5kb20gPT0gbnVsbCkge1xuXHRcdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRcdGlmIChjb3VudDAgPiAwKSB7XG5cdFx0XHRcdHZhciBkb20gPSB2bm9kZS5kb21cblx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSBmcmFnbWVudC5hcHBlbmRDaGlsZChkb20ubmV4dFNpYmxpbmcpXG5cdFx0XHRcdGZyYWdtZW50Lmluc2VydEJlZm9yZShkb20sIGZyYWdtZW50LmZpcnN0Q2hpbGQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZnJhZ21lbnRcblx0XHR9XG5cdFx0ZWxzZSByZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gZ2V0TmV4dFNpYmxpbmcodm5vZGVzLCBpLCBuZXh0U2libGluZykge1xuXHRcdGZvciAoOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwgJiYgdm5vZGVzW2ldLmRvbSAhPSBudWxsKSByZXR1cm4gdm5vZGVzW2ldLmRvbVxuXHRcdH1cblx0XHRyZXR1cm4gbmV4dFNpYmxpbmdcblx0fVxuXHRmdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudCwgZG9tLCBuZXh0U2libGluZykge1xuXHRcdGlmIChuZXh0U2libGluZyAmJiBuZXh0U2libGluZy5wYXJlbnROb2RlKSBwYXJlbnQuaW5zZXJ0QmVmb3JlKGRvbSwgbmV4dFNpYmxpbmcpXG5cdFx0ZWxzZSBwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tKVxuXHR9XG5cdGZ1bmN0aW9uIHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSkge1xuXHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdLnRhZyA9PT0gXCI8XCIpIHtcblx0XHRcdHZhciBjb250ZW50ID0gY2hpbGRyZW5bMF0uY2hpbGRyZW5cblx0XHRcdGlmICh2bm9kZS5kb20uaW5uZXJIVE1MICE9PSBjb250ZW50KSB2bm9kZS5kb20uaW5uZXJIVE1MID0gY29udGVudFxuXHRcdH1cblx0XHRlbHNlIGlmICh2bm9kZS50ZXh0ICE9IG51bGwgfHwgY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggIT09IDApIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIG5vZGUgb2YgYSBjb250ZW50ZWRpdGFibGUgbXVzdCBiZSB0cnVzdGVkXCIpXG5cdH1cblx0Ly9yZW1vdmVcblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZXModm5vZGVzLCBzdGFydCwgZW5kLCBjb250ZXh0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0aWYgKHZub2RlLnNraXApIHZub2RlLnNraXAgPSBmYWxzZVxuXHRcdFx0XHRlbHNlIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpIHtcblx0XHR2YXIgZXhwZWN0ZWQgPSAxLCBjYWxsZWQgPSAwXG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHZub2RlLmF0dHJzLm9uYmVmb3JlcmVtb3ZlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUuYXR0cnMub25iZWZvcmVyZW1vdmUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0ZXhwZWN0ZWQrK1xuXHRcdFx0XHRyZXN1bHQudGhlbihjb250aW51YXRpb24sIGNvbnRpbnVhdGlvbilcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09IFwic3RyaW5nXCIgJiYgdm5vZGUudGFnLm9uYmVmb3JlcmVtb3ZlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUudGFnLm9uYmVmb3JlcmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdGV4cGVjdGVkKytcblx0XHRcdFx0cmVzdWx0LnRoZW4oY29udGludWF0aW9uLCBjb250aW51YXRpb24pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnRpbnVhdGlvbigpXG5cdFx0ZnVuY3Rpb24gY29udGludWF0aW9uKCkge1xuXHRcdFx0aWYgKCsrY2FsbGVkID09PSBleHBlY3RlZCkge1xuXHRcdFx0XHRvbnJlbW92ZSh2bm9kZSlcblx0XHRcdFx0aWYgKHZub2RlLmRvbSkge1xuXHRcdFx0XHRcdHZhciBjb3VudDAgPSB2bm9kZS5kb21TaXplIHx8IDFcblx0XHRcdFx0XHRpZiAoY291bnQwID4gMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRvbSA9IHZub2RlLmRvbVxuXHRcdFx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSB7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZU5vZGVGcm9tRE9NKGRvbS5uZXh0U2libGluZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVtb3ZlTm9kZUZyb21ET00odm5vZGUuZG9tKVxuXHRcdFx0XHRcdGlmIChjb250ZXh0ICE9IG51bGwgJiYgdm5vZGUuZG9tU2l6ZSA9PSBudWxsICYmICFoYXNJbnRlZ3JhdGlvbk1ldGhvZHModm5vZGUuYXR0cnMpICYmIHR5cGVvZiB2bm9kZS50YWcgPT09IFwic3RyaW5nXCIpIHsgLy9UT0RPIHRlc3QgY3VzdG9tIGVsZW1lbnRzXG5cdFx0XHRcdFx0XHRpZiAoIWNvbnRleHQucG9vbCkgY29udGV4dC5wb29sID0gW3Zub2RlXVxuXHRcdFx0XHRcdFx0ZWxzZSBjb250ZXh0LnBvb2wucHVzaCh2bm9kZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZUZyb21ET00obm9kZSkge1xuXHRcdHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGVcblx0XHRpZiAocGFyZW50ICE9IG51bGwpIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKVxuXHR9XG5cdGZ1bmN0aW9uIG9ucmVtb3ZlKHZub2RlKSB7XG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHZub2RlLmF0dHJzLm9ucmVtb3ZlKSB2bm9kZS5hdHRycy5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIiAmJiB2bm9kZS50YWcub25yZW1vdmUpIHZub2RlLnRhZy5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkgb25yZW1vdmUodm5vZGUuaW5zdGFuY2UpXG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsKSBvbnJlbW92ZShjaGlsZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL2F0dHJzMlxuXHRmdW5jdGlvbiBzZXRBdHRycyh2bm9kZSwgYXR0cnMyLCBucykge1xuXHRcdGZvciAodmFyIGtleTIgaW4gYXR0cnMyKSB7XG5cdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBudWxsLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQsIHZhbHVlLCBucykge1xuXHRcdHZhciBlbGVtZW50ID0gdm5vZGUuZG9tXG5cdFx0aWYgKGtleTIgPT09IFwia2V5XCIgfHwga2V5MiA9PT0gXCJpc1wiIHx8IChvbGQgPT09IHZhbHVlICYmICFpc0Zvcm1BdHRyaWJ1dGUodm5vZGUsIGtleTIpKSAmJiB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleTIpKSByZXR1cm5cblx0XHR2YXIgbnNMYXN0SW5kZXggPSBrZXkyLmluZGV4T2YoXCI6XCIpXG5cdFx0aWYgKG5zTGFzdEluZGV4ID4gLTEgJiYga2V5Mi5zdWJzdHIoMCwgbnNMYXN0SW5kZXgpID09PSBcInhsaW5rXCIpIHtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIGtleTIuc2xpY2UobnNMYXN0SW5kZXggKyAxKSwgdmFsdWUpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoa2V5MiA9PT0gXCJzdHlsZVwiKSB1cGRhdGVTdHlsZShlbGVtZW50LCBvbGQsIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGtleTIgaW4gZWxlbWVudCAmJiAhaXNBdHRyaWJ1dGUoa2V5MikgJiYgbnMgPT09IHVuZGVmaW5lZCAmJiAhaXNDdXN0b21FbGVtZW50KHZub2RlKSkge1xuXHRcdFx0Ly9zZXR0aW5nIGlucHV0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIGJ5IHR5cGluZyBvbiBmb2N1c2VkIGVsZW1lbnQgbW92ZXMgY3Vyc29yIHRvIGVuZCBpbiBDaHJvbWVcblx0XHRcdGlmICh2bm9kZS50YWcgPT09IFwiaW5wdXRcIiAmJiBrZXkyID09PSBcInZhbHVlXCIgJiYgdm5vZGUuZG9tLnZhbHVlID09PSB2YWx1ZSAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHQvL3NldHRpbmcgc2VsZWN0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJzZWxlY3RcIiAmJiBrZXkyID09PSBcInZhbHVlXCIgJiYgdm5vZGUuZG9tLnZhbHVlID09PSB2YWx1ZSAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHQvL3NldHRpbmcgb3B0aW9uW3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJvcHRpb25cIiAmJiBrZXkyID09PSBcInZhbHVlXCIgJiYgdm5vZGUuZG9tLnZhbHVlID09PSB2YWx1ZSkgcmV0dXJuXG5cdFx0XHRlbGVtZW50W2tleTJdID0gdmFsdWVcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRpZiAodmFsdWUpIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleTIsIFwiXCIpXG5cdFx0XHRcdGVsc2UgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoa2V5Milcblx0XHRcdH1cblx0XHRcdGVsc2UgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5MiA9PT0gXCJjbGFzc05hbWVcIiA/IFwiY2xhc3NcIiA6IGtleTIsIHZhbHVlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRMYXRlQXR0cnModm5vZGUpIHtcblx0XHR2YXIgYXR0cnMyID0gdm5vZGUuYXR0cnNcblx0XHRpZiAodm5vZGUudGFnID09PSBcInNlbGVjdFwiICYmIGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRpZiAoXCJ2YWx1ZVwiIGluIGF0dHJzMikgc2V0QXR0cih2bm9kZSwgXCJ2YWx1ZVwiLCBudWxsLCBhdHRyczIudmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdGlmIChcInNlbGVjdGVkSW5kZXhcIiBpbiBhdHRyczIpIHNldEF0dHIodm5vZGUsIFwic2VsZWN0ZWRJbmRleFwiLCBudWxsLCBhdHRyczIuc2VsZWN0ZWRJbmRleCwgdW5kZWZpbmVkKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVBdHRycyh2bm9kZSwgb2xkLCBhdHRyczIsIG5zKSB7XG5cdFx0aWYgKGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkyIGluIGF0dHJzMikge1xuXHRcdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQgJiYgb2xkW2tleTJdLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob2xkICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleTIgaW4gb2xkKSB7XG5cdFx0XHRcdGlmIChhdHRyczIgPT0gbnVsbCB8fCAhKGtleTIgaW4gYXR0cnMyKSkge1xuXHRcdFx0XHRcdGlmIChrZXkyID09PSBcImNsYXNzTmFtZVwiKSBrZXkyID0gXCJjbGFzc1wiXG5cdFx0XHRcdFx0aWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmICFpc0xpZmVjeWNsZU1ldGhvZChrZXkyKSkgdXBkYXRlRXZlbnQodm5vZGUsIGtleTIsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRlbHNlIGlmIChrZXkyICE9PSBcImtleVwiKSB2bm9kZS5kb20ucmVtb3ZlQXR0cmlidXRlKGtleTIpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaXNGb3JtQXR0cmlidXRlKHZub2RlLCBhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwidmFsdWVcIiB8fCBhdHRyID09PSBcImNoZWNrZWRcIiB8fCBhdHRyID09PSBcInNlbGVjdGVkSW5kZXhcIiB8fCBhdHRyID09PSBcInNlbGVjdGVkXCIgJiYgdm5vZGUuZG9tID09PSAkZG9jLmFjdGl2ZUVsZW1lbnRcblx0fVxuXHRmdW5jdGlvbiBpc0xpZmVjeWNsZU1ldGhvZChhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwib25pbml0XCIgfHwgYXR0ciA9PT0gXCJvbmNyZWF0ZVwiIHx8IGF0dHIgPT09IFwib251cGRhdGVcIiB8fCBhdHRyID09PSBcIm9ucmVtb3ZlXCIgfHwgYXR0ciA9PT0gXCJvbmJlZm9yZXJlbW92ZVwiIHx8IGF0dHIgPT09IFwib25iZWZvcmV1cGRhdGVcIlxuXHR9XG5cdGZ1bmN0aW9uIGlzQXR0cmlidXRlKGF0dHIpIHtcblx0XHRyZXR1cm4gYXR0ciA9PT0gXCJocmVmXCIgfHwgYXR0ciA9PT0gXCJsaXN0XCIgfHwgYXR0ciA9PT0gXCJmb3JtXCIgfHwgYXR0ciA9PT0gXCJ3aWR0aFwiIHx8IGF0dHIgPT09IFwiaGVpZ2h0XCIvLyB8fCBhdHRyID09PSBcInR5cGVcIlxuXHR9XG5cdGZ1bmN0aW9uIGlzQ3VzdG9tRWxlbWVudCh2bm9kZSl7XG5cdFx0cmV0dXJuIHZub2RlLmF0dHJzLmlzIHx8IHZub2RlLnRhZy5pbmRleE9mKFwiLVwiKSA+IC0xXG5cdH1cblx0ZnVuY3Rpb24gaGFzSW50ZWdyYXRpb25NZXRob2RzKHNvdXJjZSkge1xuXHRcdHJldHVybiBzb3VyY2UgIT0gbnVsbCAmJiAoc291cmNlLm9uY3JlYXRlIHx8IHNvdXJjZS5vbnVwZGF0ZSB8fCBzb3VyY2Uub25iZWZvcmVyZW1vdmUgfHwgc291cmNlLm9ucmVtb3ZlKVxuXHR9XG5cdC8vc3R5bGVcblx0ZnVuY3Rpb24gdXBkYXRlU3R5bGUoZWxlbWVudCwgb2xkLCBzdHlsZSkge1xuXHRcdGlmIChvbGQgPT09IHN0eWxlKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBcIlwiLCBvbGQgPSBudWxsXG5cdFx0aWYgKHN0eWxlID09IG51bGwpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IFwiXCJcblx0XHRlbHNlIGlmICh0eXBlb2Ygc3R5bGUgPT09IFwic3RyaW5nXCIpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IHN0eWxlXG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIG9sZCA9PT0gXCJzdHJpbmdcIikgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gXCJcIlxuXHRcdFx0Zm9yICh2YXIga2V5MiBpbiBzdHlsZSkge1xuXHRcdFx0XHRlbGVtZW50LnN0eWxlW2tleTJdID0gc3R5bGVba2V5Ml1cblx0XHRcdH1cblx0XHRcdGlmIChvbGQgIT0gbnVsbCAmJiB0eXBlb2Ygb2xkICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleTIgaW4gb2xkKSB7XG5cdFx0XHRcdFx0aWYgKCEoa2V5MiBpbiBzdHlsZSkpIGVsZW1lbnQuc3R5bGVba2V5Ml0gPSBcIlwiXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Ly9ldmVudFxuXHRmdW5jdGlvbiB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpIHtcblx0XHR2YXIgZWxlbWVudCA9IHZub2RlLmRvbVxuXHRcdHZhciBjYWxsYmFjayA9IHR5cGVvZiBvbmV2ZW50ICE9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdHZhciByZXN1bHQgPSB2YWx1ZS5jYWxsKGVsZW1lbnQsIGUpXG5cdFx0XHRvbmV2ZW50LmNhbGwoZWxlbWVudCwgZSlcblx0XHRcdHJldHVybiByZXN1bHRcblx0XHR9XG5cdFx0aWYgKGtleTIgaW4gZWxlbWVudCkgZWxlbWVudFtrZXkyXSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2FsbGJhY2sgOiBudWxsXG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgZXZlbnROYW1lID0ga2V5Mi5zbGljZSgyKVxuXHRcdFx0aWYgKHZub2RlLmV2ZW50cyA9PT0gdW5kZWZpbmVkKSB2bm9kZS5ldmVudHMgPSB7fVxuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXkyXSA9PT0gY2FsbGJhY2spIHJldHVyblxuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXkyXSAhPSBudWxsKSBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB2bm9kZS5ldmVudHNba2V5Ml0sIGZhbHNlKVxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHZub2RlLmV2ZW50c1trZXkyXSA9IGNhbGxiYWNrXG5cdFx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHZub2RlLmV2ZW50c1trZXkyXSwgZmFsc2UpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdC8vbGlmZWN5Y2xlXG5cdGZ1bmN0aW9uIGluaXRMaWZlY3ljbGUoc291cmNlLCB2bm9kZSwgaG9va3MpIHtcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmluaXQgPT09IFwiZnVuY3Rpb25cIikgc291cmNlLm9uaW5pdC5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmNyZWF0ZSA9PT0gXCJmdW5jdGlvblwiKSBob29rcy5wdXNoKHNvdXJjZS5vbmNyZWF0ZS5iaW5kKHZub2RlLnN0YXRlLCB2bm9kZSkpXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlTGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzLCByZWN5Y2xpbmcpIHtcblx0XHRpZiAocmVjeWNsaW5nKSBpbml0TGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzKVxuXHRcdGVsc2UgaWYgKHR5cGVvZiBzb3VyY2Uub251cGRhdGUgPT09IFwiZnVuY3Rpb25cIikgaG9va3MucHVzaChzb3VyY2Uub251cGRhdGUuYmluZCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHR9XG5cdGZ1bmN0aW9uIHNob3VsZFVwZGF0ZSh2bm9kZSwgb2xkKSB7XG5cdFx0dmFyIGZvcmNlVm5vZGVVcGRhdGUsIGZvcmNlQ29tcG9uZW50VXBkYXRlXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JldXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGZvcmNlVm5vZGVVcGRhdGUgPSB2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSwgb2xkKVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnICE9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2bm9kZS50YWcub25iZWZvcmV1cGRhdGUgPT09IFwiZnVuY3Rpb25cIikgZm9yY2VDb21wb25lbnRVcGRhdGUgPSB2bm9kZS50YWcub25iZWZvcmV1cGRhdGUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUsIG9sZClcblx0XHRpZiAoIShmb3JjZVZub2RlVXBkYXRlID09PSB1bmRlZmluZWQgJiYgZm9yY2VDb21wb25lbnRVcGRhdGUgPT09IHVuZGVmaW5lZCkgJiYgIWZvcmNlVm5vZGVVcGRhdGUgJiYgIWZvcmNlQ29tcG9uZW50VXBkYXRlKSB7XG5cdFx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gb2xkLmRvbVNpemVcblx0XHRcdHZub2RlLmluc3RhbmNlID0gb2xkLmluc3RhbmNlXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXHRmdW5jdGlvbiByZW5kZXIoZG9tLCB2bm9kZXMpIHtcblx0XHRpZiAoIWRvbSkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBET00gZWxlbWVudCBiZWluZyBwYXNzZWQgdG8gbS5yb3V0ZS9tLm1vdW50L20ucmVuZGVyIGlzIG5vdCB1bmRlZmluZWQuXCIpXG5cdFx0dmFyIGhvb2tzID0gW11cblx0XHR2YXIgYWN0aXZlID0gJGRvYy5hY3RpdmVFbGVtZW50XG5cdFx0Ly8gRmlyc3QgdGltZTAgcmVuZGVyaW5nIGludG8gYSBub2RlIGNsZWFycyBpdCBvdXRcblx0XHRpZiAoZG9tLnZub2RlcyA9PSBudWxsKSBkb20udGV4dENvbnRlbnQgPSBcIlwiXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZub2RlcykpIHZub2RlcyA9IFt2bm9kZXNdXG5cdFx0dXBkYXRlTm9kZXMoZG9tLCBkb20udm5vZGVzLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbih2bm9kZXMpLCBmYWxzZSwgaG9va3MsIG51bGwsIHVuZGVmaW5lZClcblx0XHRkb20udm5vZGVzID0gdm5vZGVzXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7IGkrKykgaG9va3NbaV0oKVxuXHRcdGlmICgkZG9jLmFjdGl2ZUVsZW1lbnQgIT09IGFjdGl2ZSkgYWN0aXZlLmZvY3VzKClcblx0fVxuXHRyZXR1cm4ge3JlbmRlcjogcmVuZGVyLCBzZXRFdmVudENhbGxiYWNrOiBzZXRFdmVudENhbGxiYWNrfVxufVxuZnVuY3Rpb24gdGhyb3R0bGUoY2FsbGJhY2spIHtcblx0Ly82MGZwcyB0cmFuc2xhdGVzIHRvIDE2LjZtcywgcm91bmQgaXQgZG93biBzaW5jZSBzZXRUaW1lb3V0IHJlcXVpcmVzIGludFxuXHR2YXIgdGltZSA9IDE2XG5cdHZhciBsYXN0ID0gMCwgcGVuZGluZyA9IG51bGxcblx0dmFyIHRpbWVvdXQgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSBcImZ1bmN0aW9uXCIgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgOiBzZXRUaW1lb3V0XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm93ID0gRGF0ZS5ub3coKVxuXHRcdGlmIChsYXN0ID09PSAwIHx8IG5vdyAtIGxhc3QgPj0gdGltZSkge1xuXHRcdFx0bGFzdCA9IG5vd1xuXHRcdFx0Y2FsbGJhY2soKVxuXHRcdH1cblx0XHRlbHNlIGlmIChwZW5kaW5nID09PSBudWxsKSB7XG5cdFx0XHRwZW5kaW5nID0gdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0cGVuZGluZyA9IG51bGxcblx0XHRcdFx0Y2FsbGJhY2soKVxuXHRcdFx0XHRsYXN0ID0gRGF0ZS5ub3coKVxuXHRcdFx0fSwgdGltZSAtIChub3cgLSBsYXN0KSlcblx0XHR9XG5cdH1cbn1cbnZhciBfMTEgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciByZW5kZXJTZXJ2aWNlID0gY29yZVJlbmRlcmVyKCR3aW5kb3cpXG5cdHJlbmRlclNlcnZpY2Uuc2V0RXZlbnRDYWxsYmFjayhmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucmVkcmF3ICE9PSBmYWxzZSkgcmVkcmF3KClcblx0fSlcblx0dmFyIGNhbGxiYWNrcyA9IFtdXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShrZXkxLCBjYWxsYmFjaykge1xuXHRcdHVuc3Vic2NyaWJlKGtleTEpXG5cdFx0Y2FsbGJhY2tzLnB1c2goa2V5MSwgdGhyb3R0bGUoY2FsbGJhY2spKVxuXHR9XG5cdGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGtleTEpIHtcblx0XHR2YXIgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihrZXkxKVxuXHRcdGlmIChpbmRleCA+IC0xKSBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAyKVxuXHR9XG4gICAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgICAgY2FsbGJhY2tzW2ldKClcbiAgICAgICAgfVxuICAgIH1cblx0cmV0dXJuIHtzdWJzY3JpYmU6IHN1YnNjcmliZSwgdW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlLCByZWRyYXc6IHJlZHJhdywgcmVuZGVyOiByZW5kZXJTZXJ2aWNlLnJlbmRlcn1cbn1cbnZhciByZWRyYXdTZXJ2aWNlID0gXzExKHdpbmRvdylcbnJlcXVlc3RTZXJ2aWNlLnNldENvbXBsZXRpb25DYWxsYmFjayhyZWRyYXdTZXJ2aWNlLnJlZHJhdylcbnZhciBfMTYgPSBmdW5jdGlvbihyZWRyYXdTZXJ2aWNlMCkge1xuXHRyZXR1cm4gZnVuY3Rpb24ocm9vdCwgY29tcG9uZW50KSB7XG5cdFx0aWYgKGNvbXBvbmVudCA9PT0gbnVsbCkge1xuXHRcdFx0cmVkcmF3U2VydmljZTAucmVuZGVyKHJvb3QsIFtdKVxuXHRcdFx0cmVkcmF3U2VydmljZTAudW5zdWJzY3JpYmUocm9vdClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRcblx0XHRpZiAoY29tcG9uZW50LnZpZXcgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwibS5tb3VudChlbGVtZW50LCBjb21wb25lbnQpIGV4cGVjdHMgYSBjb21wb25lbnQsIG5vdCBhIHZub2RlXCIpXG5cdFx0XG5cdFx0dmFyIHJ1bjAgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlZHJhd1NlcnZpY2UwLnJlbmRlcihyb290LCBWbm9kZShjb21wb25lbnQpKVxuXHRcdH1cblx0XHRyZWRyYXdTZXJ2aWNlMC5zdWJzY3JpYmUocm9vdCwgcnVuMClcblx0XHRyZWRyYXdTZXJ2aWNlMC5yZWRyYXcoKVxuXHR9XG59XG5tLm1vdW50ID0gXzE2KHJlZHJhd1NlcnZpY2UpXG52YXIgUHJvbWlzZSA9IFByb21pc2VQb2x5ZmlsbFxudmFyIHBhcnNlUXVlcnlTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcblx0aWYgKHN0cmluZyA9PT0gXCJcIiB8fCBzdHJpbmcgPT0gbnVsbCkgcmV0dXJuIHt9XG5cdGlmIChzdHJpbmcuY2hhckF0KDApID09PSBcIj9cIikgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDEpXG5cdHZhciBlbnRyaWVzID0gc3RyaW5nLnNwbGl0KFwiJlwiKSwgZGF0YTAgPSB7fSwgY291bnRlcnMgPSB7fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgZW50cnkgPSBlbnRyaWVzW2ldLnNwbGl0KFwiPVwiKVxuXHRcdHZhciBrZXk1ID0gZGVjb2RlVVJJQ29tcG9uZW50KGVudHJ5WzBdKVxuXHRcdHZhciB2YWx1ZSA9IGVudHJ5Lmxlbmd0aCA9PT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChlbnRyeVsxXSkgOiBcIlwiXG5cdFx0aWYgKHZhbHVlID09PSBcInRydWVcIikgdmFsdWUgPSB0cnVlXG5cdFx0ZWxzZSBpZiAodmFsdWUgPT09IFwiZmFsc2VcIikgdmFsdWUgPSBmYWxzZVxuXHRcdHZhciBsZXZlbHMgPSBrZXk1LnNwbGl0KC9cXF1cXFs/fFxcWy8pXG5cdFx0dmFyIGN1cnNvciA9IGRhdGEwXG5cdFx0aWYgKGtleTUuaW5kZXhPZihcIltcIikgPiAtMSkgbGV2ZWxzLnBvcCgpXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBsZXZlbHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdHZhciBsZXZlbCA9IGxldmVsc1tqXSwgbmV4dExldmVsID0gbGV2ZWxzW2ogKyAxXVxuXHRcdFx0dmFyIGlzTnVtYmVyID0gbmV4dExldmVsID09IFwiXCIgfHwgIWlzTmFOKHBhcnNlSW50KG5leHRMZXZlbCwgMTApKVxuXHRcdFx0dmFyIGlzVmFsdWUgPSBqID09PSBsZXZlbHMubGVuZ3RoIC0gMVxuXHRcdFx0aWYgKGxldmVsID09PSBcIlwiKSB7XG5cdFx0XHRcdHZhciBrZXk1ID0gbGV2ZWxzLnNsaWNlKDAsIGopLmpvaW4oKVxuXHRcdFx0XHRpZiAoY291bnRlcnNba2V5NV0gPT0gbnVsbCkgY291bnRlcnNba2V5NV0gPSAwXG5cdFx0XHRcdGxldmVsID0gY291bnRlcnNba2V5NV0rK1xuXHRcdFx0fVxuXHRcdFx0aWYgKGN1cnNvcltsZXZlbF0gPT0gbnVsbCkge1xuXHRcdFx0XHRjdXJzb3JbbGV2ZWxdID0gaXNWYWx1ZSA/IHZhbHVlIDogaXNOdW1iZXIgPyBbXSA6IHt9XG5cdFx0XHR9XG5cdFx0XHRjdXJzb3IgPSBjdXJzb3JbbGV2ZWxdXG5cdFx0fVxuXHR9XG5cdHJldHVybiBkYXRhMFxufVxudmFyIGNvcmVSb3V0ZXIgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciBzdXBwb3J0c1B1c2hTdGF0ZSA9IHR5cGVvZiAkd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlID09PSBcImZ1bmN0aW9uXCJcblx0dmFyIGNhbGxBc3luYzAgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBzZXRUaW1lb3V0XG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZTEoZnJhZ21lbnQwKSB7XG5cdFx0dmFyIGRhdGEgPSAkd2luZG93LmxvY2F0aW9uW2ZyYWdtZW50MF0ucmVwbGFjZSgvKD86JVthLWY4OV1bYS1mMC05XSkrL2dpbSwgZGVjb2RlVVJJQ29tcG9uZW50KVxuXHRcdGlmIChmcmFnbWVudDAgPT09IFwicGF0aG5hbWVcIiAmJiBkYXRhWzBdICE9PSBcIi9cIikgZGF0YSA9IFwiL1wiICsgZGF0YVxuXHRcdHJldHVybiBkYXRhXG5cdH1cblx0dmFyIGFzeW5jSWRcblx0ZnVuY3Rpb24gZGVib3VuY2VBc3luYyhjYWxsYmFjazApIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoYXN5bmNJZCAhPSBudWxsKSByZXR1cm5cblx0XHRcdGFzeW5jSWQgPSBjYWxsQXN5bmMwKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhc3luY0lkID0gbnVsbFxuXHRcdFx0XHRjYWxsYmFjazAoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcGFyc2VQYXRoKHBhdGgsIHF1ZXJ5RGF0YSwgaGFzaERhdGEpIHtcblx0XHR2YXIgcXVlcnlJbmRleCA9IHBhdGguaW5kZXhPZihcIj9cIilcblx0XHR2YXIgaGFzaEluZGV4ID0gcGF0aC5pbmRleE9mKFwiI1wiKVxuXHRcdHZhciBwYXRoRW5kID0gcXVlcnlJbmRleCA+IC0xID8gcXVlcnlJbmRleCA6IGhhc2hJbmRleCA+IC0xID8gaGFzaEluZGV4IDogcGF0aC5sZW5ndGhcblx0XHRpZiAocXVlcnlJbmRleCA+IC0xKSB7XG5cdFx0XHR2YXIgcXVlcnlFbmQgPSBoYXNoSW5kZXggPiAtMSA/IGhhc2hJbmRleCA6IHBhdGgubGVuZ3RoXG5cdFx0XHR2YXIgcXVlcnlQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc2xpY2UocXVlcnlJbmRleCArIDEsIHF1ZXJ5RW5kKSlcblx0XHRcdGZvciAodmFyIGtleTQgaW4gcXVlcnlQYXJhbXMpIHF1ZXJ5RGF0YVtrZXk0XSA9IHF1ZXJ5UGFyYW1zW2tleTRdXG5cdFx0fVxuXHRcdGlmIChoYXNoSW5kZXggPiAtMSkge1xuXHRcdFx0dmFyIGhhc2hQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc2xpY2UoaGFzaEluZGV4ICsgMSkpXG5cdFx0XHRmb3IgKHZhciBrZXk0IGluIGhhc2hQYXJhbXMpIGhhc2hEYXRhW2tleTRdID0gaGFzaFBhcmFtc1trZXk0XVxuXHRcdH1cblx0XHRyZXR1cm4gcGF0aC5zbGljZSgwLCBwYXRoRW5kKVxuXHR9XG5cdHZhciByb3V0ZXIgPSB7cHJlZml4OiBcIiMhXCJ9XG5cdHJvdXRlci5nZXRQYXRoID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHR5cGUyID0gcm91dGVyLnByZWZpeC5jaGFyQXQoMClcblx0XHRzd2l0Y2ggKHR5cGUyKSB7XG5cdFx0XHRjYXNlIFwiI1wiOiByZXR1cm4gbm9ybWFsaXplMShcImhhc2hcIikuc2xpY2Uocm91dGVyLnByZWZpeC5sZW5ndGgpXG5cdFx0XHRjYXNlIFwiP1wiOiByZXR1cm4gbm9ybWFsaXplMShcInNlYXJjaFwiKS5zbGljZShyb3V0ZXIucHJlZml4Lmxlbmd0aCkgKyBub3JtYWxpemUxKFwiaGFzaFwiKVxuXHRcdFx0ZGVmYXVsdDogcmV0dXJuIG5vcm1hbGl6ZTEoXCJwYXRobmFtZVwiKS5zbGljZShyb3V0ZXIucHJlZml4Lmxlbmd0aCkgKyBub3JtYWxpemUxKFwic2VhcmNoXCIpICsgbm9ybWFsaXplMShcImhhc2hcIilcblx0XHR9XG5cdH1cblx0cm91dGVyLnNldFBhdGggPSBmdW5jdGlvbihwYXRoLCBkYXRhLCBvcHRpb25zKSB7XG5cdFx0dmFyIHF1ZXJ5RGF0YSA9IHt9LCBoYXNoRGF0YSA9IHt9XG5cdFx0cGF0aCA9IHBhcnNlUGF0aChwYXRoLCBxdWVyeURhdGEsIGhhc2hEYXRhKVxuXHRcdGlmIChkYXRhICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleTQgaW4gZGF0YSkgcXVlcnlEYXRhW2tleTRdID0gZGF0YVtrZXk0XVxuXHRcdFx0cGF0aCA9IHBhdGgucmVwbGFjZSgvOihbXlxcL10rKS9nLCBmdW5jdGlvbihtYXRjaDIsIHRva2VuKSB7XG5cdFx0XHRcdGRlbGV0ZSBxdWVyeURhdGFbdG9rZW5dXG5cdFx0XHRcdHJldHVybiBkYXRhW3Rva2VuXVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0dmFyIHF1ZXJ5ID0gYnVpbGRRdWVyeVN0cmluZyhxdWVyeURhdGEpXG5cdFx0aWYgKHF1ZXJ5KSBwYXRoICs9IFwiP1wiICsgcXVlcnlcblx0XHR2YXIgaGFzaCA9IGJ1aWxkUXVlcnlTdHJpbmcoaGFzaERhdGEpXG5cdFx0aWYgKGhhc2gpIHBhdGggKz0gXCIjXCIgKyBoYXNoXG5cdFx0aWYgKHN1cHBvcnRzUHVzaFN0YXRlKSB7XG5cdFx0XHR2YXIgc3RhdGUgPSBvcHRpb25zID8gb3B0aW9ucy5zdGF0ZSA6IG51bGxcblx0XHRcdHZhciB0aXRsZSA9IG9wdGlvbnMgPyBvcHRpb25zLnRpdGxlIDogbnVsbFxuXHRcdFx0JHdpbmRvdy5vbnBvcHN0YXRlKClcblx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVwbGFjZSkgJHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIHJvdXRlci5wcmVmaXggKyBwYXRoKVxuXHRcdFx0ZWxzZSAkd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgcm91dGVyLnByZWZpeCArIHBhdGgpXG5cdFx0fVxuXHRcdGVsc2UgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcm91dGVyLnByZWZpeCArIHBhdGhcblx0fVxuXHRyb3V0ZXIuZGVmaW5lUm91dGVzID0gZnVuY3Rpb24ocm91dGVzLCByZXNvbHZlLCByZWplY3QpIHtcblx0XHRmdW5jdGlvbiByZXNvbHZlUm91dGUoKSB7XG5cdFx0XHR2YXIgcGF0aCA9IHJvdXRlci5nZXRQYXRoKClcblx0XHRcdHZhciBwYXJhbXMgPSB7fVxuXHRcdFx0dmFyIHBhdGhuYW1lID0gcGFyc2VQYXRoKHBhdGgsIHBhcmFtcywgcGFyYW1zKVxuXHRcdFx0dmFyIHN0YXRlID0gJHdpbmRvdy5oaXN0b3J5LnN0YXRlXG5cdFx0XHRpZiAoc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIHN0YXRlKSBwYXJhbXNba10gPSBzdGF0ZVtrXVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgcm91dGUwIGluIHJvdXRlcykge1xuXHRcdFx0XHR2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoXCJeXCIgKyByb3V0ZTAucmVwbGFjZSgvOlteXFwvXSs/XFwuezN9L2csIFwiKC4qPylcIikucmVwbGFjZSgvOlteXFwvXSsvZywgXCIoW15cXFxcL10rKVwiKSArIFwiXFwvPyRcIilcblx0XHRcdFx0aWYgKG1hdGNoZXIudGVzdChwYXRobmFtZSkpIHtcblx0XHRcdFx0XHRwYXRobmFtZS5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGtleXMgPSByb3V0ZTAubWF0Y2goLzpbXlxcL10rL2cpIHx8IFtdXG5cdFx0XHRcdFx0XHR2YXIgdmFsdWVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIC0yKVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdHBhcmFtc1trZXlzW2ldLnJlcGxhY2UoLzp8XFwuL2csIFwiXCIpXSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbaV0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXNvbHZlKHJvdXRlc1tyb3V0ZTBdLCBwYXJhbXMsIHBhdGgsIHJvdXRlMClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZWplY3QocGF0aCwgcGFyYW1zKVxuXHRcdH1cblx0XHRpZiAoc3VwcG9ydHNQdXNoU3RhdGUpICR3aW5kb3cub25wb3BzdGF0ZSA9IGRlYm91bmNlQXN5bmMocmVzb2x2ZVJvdXRlKVxuXHRcdGVsc2UgaWYgKHJvdXRlci5wcmVmaXguY2hhckF0KDApID09PSBcIiNcIikgJHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSByZXNvbHZlUm91dGVcblx0XHRyZXNvbHZlUm91dGUoKVxuXHR9XG5cdHJldHVybiByb3V0ZXJcbn1cbnZhciBfMjAgPSBmdW5jdGlvbigkd2luZG93LCByZWRyYXdTZXJ2aWNlMCkge1xuXHR2YXIgcm91dGVTZXJ2aWNlID0gY29yZVJvdXRlcigkd2luZG93KVxuXHR2YXIgaWRlbnRpdHkgPSBmdW5jdGlvbih2KSB7cmV0dXJuIHZ9XG5cdHZhciByZW5kZXIxLCBjb21wb25lbnQsIGF0dHJzMywgY3VycmVudFBhdGgsIGxhc3RVcGRhdGVcblx0dmFyIHJvdXRlID0gZnVuY3Rpb24ocm9vdCwgZGVmYXVsdFJvdXRlLCByb3V0ZXMpIHtcblx0XHRpZiAocm9vdCA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnN1cmUgdGhlIERPTSBlbGVtZW50IHRoYXQgd2FzIHBhc3NlZCB0byBgbS5yb3V0ZWAgaXMgbm90IHVuZGVmaW5lZFwiKVxuXHRcdHZhciBydW4xID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAocmVuZGVyMSAhPSBudWxsKSByZWRyYXdTZXJ2aWNlMC5yZW5kZXIocm9vdCwgcmVuZGVyMShWbm9kZShjb21wb25lbnQsIGF0dHJzMy5rZXksIGF0dHJzMykpKVxuXHRcdH1cblx0XHR2YXIgYmFpbCA9IGZ1bmN0aW9uKHBhdGgpIHtcblx0XHRcdGlmIChwYXRoICE9PSBkZWZhdWx0Um91dGUpIHJvdXRlU2VydmljZS5zZXRQYXRoKGRlZmF1bHRSb3V0ZSwgbnVsbCwge3JlcGxhY2U6IHRydWV9KVxuXHRcdFx0ZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVzb2x2ZSBkZWZhdWx0IHJvdXRlIFwiICsgZGVmYXVsdFJvdXRlKVxuXHRcdH1cblx0XHRyb3V0ZVNlcnZpY2UuZGVmaW5lUm91dGVzKHJvdXRlcywgZnVuY3Rpb24ocGF5bG9hZCwgcGFyYW1zLCBwYXRoKSB7XG5cdFx0XHR2YXIgdXBkYXRlID0gbGFzdFVwZGF0ZSA9IGZ1bmN0aW9uKHJvdXRlUmVzb2x2ZXIsIGNvbXApIHtcblx0XHRcdFx0aWYgKHVwZGF0ZSAhPT0gbGFzdFVwZGF0ZSkgcmV0dXJuXG5cdFx0XHRcdGNvbXBvbmVudCA9IGNvbXAgIT0gbnVsbCAmJiB0eXBlb2YgY29tcC52aWV3ID09PSBcImZ1bmN0aW9uXCIgPyBjb21wIDogXCJkaXZcIiwgYXR0cnMzID0gcGFyYW1zLCBjdXJyZW50UGF0aCA9IHBhdGgsIGxhc3RVcGRhdGUgPSBudWxsXG5cdFx0XHRcdHJlbmRlcjEgPSAocm91dGVSZXNvbHZlci5yZW5kZXIgfHwgaWRlbnRpdHkpLmJpbmQocm91dGVSZXNvbHZlcilcblx0XHRcdFx0cnVuMSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAocGF5bG9hZC52aWV3KSB1cGRhdGUoe30sIHBheWxvYWQpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKHBheWxvYWQub25tYXRjaCkge1xuXHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZShwYXlsb2FkLm9ubWF0Y2gocGFyYW1zLCBwYXRoKSkudGhlbihmdW5jdGlvbihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdFx0dXBkYXRlKHBheWxvYWQsIHJlc29sdmVkKVxuXHRcdFx0XHRcdH0sIGJhaWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB1cGRhdGUocGF5bG9hZCwgXCJkaXZcIilcblx0XHRcdH1cblx0XHR9LCBiYWlsKVxuXHRcdHJlZHJhd1NlcnZpY2UwLnN1YnNjcmliZShyb290LCBydW4xKVxuXHR9XG5cdHJvdXRlLnNldCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIG9wdGlvbnMpIHtcblx0XHRpZiAobGFzdFVwZGF0ZSAhPSBudWxsKSBvcHRpb25zID0ge3JlcGxhY2U6IHRydWV9XG5cdFx0bGFzdFVwZGF0ZSA9IG51bGxcblx0XHRyb3V0ZVNlcnZpY2Uuc2V0UGF0aChwYXRoLCBkYXRhLCBvcHRpb25zKVxuXHR9XG5cdHJvdXRlLmdldCA9IGZ1bmN0aW9uKCkge3JldHVybiBjdXJyZW50UGF0aH1cblx0cm91dGUucHJlZml4ID0gZnVuY3Rpb24ocHJlZml4MCkge3JvdXRlU2VydmljZS5wcmVmaXggPSBwcmVmaXgwfVxuXHRyb3V0ZS5saW5rID0gZnVuY3Rpb24odm5vZGUxKSB7XG5cdFx0dm5vZGUxLmRvbS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHJvdXRlU2VydmljZS5wcmVmaXggKyB2bm9kZTEuYXR0cnMuaHJlZilcblx0XHR2bm9kZTEuZG9tLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHRpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLnNoaWZ0S2V5IHx8IGUud2hpY2ggPT09IDIpIHJldHVyblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRlLnJlZHJhdyA9IGZhbHNlXG5cdFx0XHR2YXIgaHJlZiA9IHRoaXMuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKVxuXHRcdFx0aWYgKGhyZWYuaW5kZXhPZihyb3V0ZVNlcnZpY2UucHJlZml4KSA9PT0gMCkgaHJlZiA9IGhyZWYuc2xpY2Uocm91dGVTZXJ2aWNlLnByZWZpeC5sZW5ndGgpXG5cdFx0XHRyb3V0ZS5zZXQoaHJlZiwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdFx0fVxuXHR9XG5cdHJvdXRlLnBhcmFtID0gZnVuY3Rpb24oa2V5Mykge1xuXHRcdGlmKHR5cGVvZiBhdHRyczMgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGtleTMgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBhdHRyczNba2V5M11cblx0XHRyZXR1cm4gYXR0cnMzXG5cdH1cblx0cmV0dXJuIHJvdXRlXG59XG5tLnJvdXRlID0gXzIwKHdpbmRvdywgcmVkcmF3U2VydmljZSlcbm0ud2l0aEF0dHIgPSBmdW5jdGlvbihhdHRyTmFtZSwgY2FsbGJhY2sxLCBjb250ZXh0KSB7XG5cdHJldHVybiBmdW5jdGlvbihlKSB7XG5cdFx0Y2FsbGJhY2sxLmNhbGwoY29udGV4dCB8fCB0aGlzLCBhdHRyTmFtZSBpbiBlLmN1cnJlbnRUYXJnZXQgPyBlLmN1cnJlbnRUYXJnZXRbYXR0ck5hbWVdIDogZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyTmFtZSkpXG5cdH1cbn1cbnZhciBfMjggPSBjb3JlUmVuZGVyZXIod2luZG93KVxubS5yZW5kZXIgPSBfMjgucmVuZGVyXG5tLnJlZHJhdyA9IHJlZHJhd1NlcnZpY2UucmVkcmF3XG5tLnJlcXVlc3QgPSByZXF1ZXN0U2VydmljZS5yZXF1ZXN0XG5tLmpzb25wID0gcmVxdWVzdFNlcnZpY2UuanNvbnBcbm0ucGFyc2VRdWVyeVN0cmluZyA9IHBhcnNlUXVlcnlTdHJpbmdcbm0uYnVpbGRRdWVyeVN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmdcbm0udmVyc2lvbiA9IFwiMS4wLjFcIlxubS52bm9kZSA9IFZub2RlXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlW1wiZXhwb3J0c1wiXSA9IG1cbmVsc2Ugd2luZG93Lm0gPSBtXG59IiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5cbnZhciBCb3ggPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJy5ib3gnLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIENPTE9SUyA9IFsnd2hpdGUnLCAnbGlnaHQnLCAnZGFyaycsICdibGFjaycsICdsaW5rJ107XHJcbnZhciBTVEFURVMgPSBbJ3ByaW1hcnknLCAnaW5mbycsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJ107XHJcbnZhciBTSVpFUyA9IFsnc21hbGwnLCAnJywgJ21lZGl1bScsICdsYXJnZSddO1xyXG5cclxuXHJcbnZhciBnZXRfY2xhc3NlcyA9IGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gICAgdmFyIGNsYXNzZXMgPSBbXTtcclxuICAgIGlmIChzdGF0ZS5jb2xvcikgeyBjbGFzc2VzLnB1c2goJ2lzLScgKyBzdGF0ZS5jb2xvcik7IH1cclxuICAgIGlmIChzdGF0ZS5zdGF0ZSkgeyBjbGFzc2VzLnB1c2goJ2lzLScgKyBzdGF0ZS5zdGF0ZSk7IH1cclxuICAgIGlmIChzdGF0ZS5zaXplKSB7IGNsYXNzZXMucHVzaCgnaXMtJyArIHN0YXRlLnNpemUpOyB9XHJcbiAgICBpZiAoc3RhdGUubG9hZGluZykgeyBjbGFzc2VzLnB1c2goJ2lzLWxvYWRpbmcnKTsgfVxyXG4gICAgaWYgKHN0YXRlLmhvdmVyZWQpIHsgY2xhc3Nlcy5wdXNoKCdpcy1ob3ZlcmVkJyk7IH1cclxuICAgIGlmIChzdGF0ZS5mb2N1c2VkKSB7IGNsYXNzZXMucHVzaCgnaXMtZm9jdXNlZCcpOyB9XHJcblxyXG4gICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpXHJcbn07XHJcblxyXG5cclxudmFyIGJ1bG1pZnkgPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgIHZhciBjbGFzc2VzID0gZ2V0X2NsYXNzZXMoc3RhdGUpO1xyXG4gICAgdmFyIG5ld19zdGF0ZSA9IHt9O1xyXG4gICAgaWYgKGNsYXNzZXMpIHsgbmV3X3N0YXRlLmNsYXNzID0gY2xhc3NlczsgfVxyXG4gICAgT2JqZWN0LmtleXMoc3RhdGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgIGlmIChbJ2NvbG9yJywgJ3N0YXRlJywgJ3NpemUnLCAnbG9hZGluZycsXHJcbiAgICAgICAgICAgICdpY29uJywgJ2NvbnRlbnQnLCAnaG92ZXJlZCcsICdmb2N1c2VkJ10uaW5kZXhPZihrZXkpID09PSAtMSlcclxuICAgICAgICAgICAgeyBuZXdfc3RhdGVba2V5XSA9IHN0YXRlW2tleV07IH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ld19zdGF0ZVxyXG59O1xyXG5cclxudmFyIGNvbGxlY3RfYm9vbGVhbiA9IGZ1bmN0aW9uIChzdGF0ZSwgbmFtZXMpIHtcclxuICAgIHZhciBzdHlsZXMgPSBbXTtcclxuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICBpZiAobmFtZSBpbiBzdGF0ZSAmJiBzdGF0ZVtuYW1lXSA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgeyBzdHlsZXMucHVzaCgnaXMtJyArIG5hbWUpOyB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblxyXG52YXIgc2xlZXAgPSBmdW5jdGlvbiAodGltZSkgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmV0dXJuIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSk7IH0pOyB9O1xyXG5cclxuXHJcbnZhciBzbWFsbGVyX3RoYW4gPSBmdW5jdGlvbiAoc3opIHsgcmV0dXJuIHN6ID8gU0laRVNbU0laRVMuaW5kZXhPZihzeikgLSAxXSA6ICdzbWFsbCc7IH07XG5cbnZhciBJY29uID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgdmFyIGF0dHJzID0gcmVmLmF0dHJzO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnc3Bhbi5pY29uJywge2NsYXNzOiBhdHRycy5zaXplID8gJ2lzLScgKyBhdHRycy5zaXplIDogJyd9LFxyXG4gICAgICAgICAgICBtKCdpLmZhJywge2NsYXNzOiAnZmEtJyArIGF0dHJzLmljb259KVxyXG4gICAgICAgICk7XG59XHJcbn07XG5cbnZhciBpY29uX2J1dHRvbiA9IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gW1xyXG4gICAgIXZub2RlLmF0dHJzLmljb25fcmlnaHQgP1xyXG4gICAgICAgIG0oSWNvbiwge2ljb246IHZub2RlLmF0dHJzLmljb24sIHNpemU6IHNtYWxsZXJfdGhhbih2bm9kZS5hdHRycy5zaXplKX0pIDogJycsXHJcbiAgICBtKCdzcGFuJywgdm5vZGUuYXR0cnMuY29udGVudCksXHJcbiAgICB2bm9kZS5hdHRycy5pY29uX3JpZ2h0ID9cclxuICAgICAgICBtKEljb24sIHtpY29uOiB2bm9kZS5hdHRycy5pY29uLCBzaXplOiBzbWFsbGVyX3RoYW4odm5vZGUuYXR0cnMuc2l6ZSl9KSA6ICcnXHJcbl07IH07XHJcblxyXG52YXIgQnV0dG9uID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdhLmJ1dHRvbicsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLmljb24gPyBpY29uX2J1dHRvbih2bm9kZSkgOiB2bm9kZS5hdHRycy5jb250ZW50KTsgfVxyXG59O1xuXG52YXIgTGFiZWwgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2xhYmVsLmxhYmVsJywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgSW5wdXQgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ3AuY29udHJvbCcsXHJcbiAgICAgICAgeyBjbGFzczogdm5vZGUuYXR0cnMuaWNvbiA/ICdoYXMtaWNvbiBoYXMtaWNvbi1yaWdodCcgOiAnJyB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgbSgnaW5wdXQuaW5wdXRbdHlwZT10ZXh0XScsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuaWNvbiA/IG0oSWNvbiwge3NpemU6ICdzbWFsbCcsIGljb246IHZub2RlLmF0dHJzLmljb259KSA6ICcnXHJcbiAgICAgICAgXVxyXG4gICAgKTsgfVxyXG59O1xyXG5cclxudmFyIFNlbGVjdCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgncC5jb250cm9sJyxcclxuICAgICAgICAgICAgbSgnc3Bhbi5zZWxlY3QnLCBidWxtaWZ5KHZub2RlLmF0dHJzKSxcclxuICAgICAgICAgICAgICAgIG0oJ3NlbGVjdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdm5vZGUuYXR0cnMuY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGspIHsgcmV0dXJuIG0oJ29wdGlvbicsIHt2YWx1ZToga1swXX0sIGtbMV0pOyB9KVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTsgfVxyXG59O1xyXG5cclxuXHJcbnZhciBUZXh0QXJlYSA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbShcInAuY29udHJvbFwiLFxyXG4gICAgICAgICAgICBtKFwidGV4dGFyZWEudGV4dGFyZWFcIiwgYnVsbWlmeSh2bm9kZS5hdHRycykpXHJcbiAgICAgICAgKTsgfVxyXG59O1xyXG5cclxuXHJcbnZhciBDaGVja0JveCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbShcInAuY29udHJvbFwiLFxyXG4gICAgICAgICAgICBtKFwibGFiZWwuY2hlY2tib3hcIixcclxuICAgICAgICAgICAgICAgIG0oXCJpbnB1dFt0eXBlPSdjaGVja2JveCddXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKSxcclxuICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLmNvbnRlbnRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7IH1cclxufTtcclxuXHJcblxyXG52YXIgUmFkaW8gPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oXCJwLmNvbnRyb2xcIixcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGspIHsgcmV0dXJuIG0oXCJsYWJlbC5yYWRpb1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oXCJpbnB1dFt0eXBlPSdyYWRpbyddXCIsIHt2YWx1ZToga1swXSwgbmFtZTogdm5vZGUuYXR0cnMubmFtZX0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGtbMV1cclxuICAgICAgICAgICAgICAgICk7IH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7IH1cclxufTtcblxudmFyIEltYWdlID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZmlndXJlLmltYWdlJyxcbiAgICAgICAgICAgIHtjbGFzczogdm5vZGUuYXR0cnMuc2l6ZSA/XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5zaXplICsgJ3gnICsgdm5vZGUuYXR0cnMuc2l6ZSA6XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5yYXRpb30sXG4gICAgICAgICAgICBtKCdpbWcnLCB7c3JjOiB2bm9kZS5hdHRycy5zcmN9KSk7IH1cbn07XG5cbnZhciBOb3RpZmljYXRpb24gPSB7XG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKFwiLm5vdGlmaWNhdGlvblwiLCBidWxtaWZ5KHZub2RlLmF0dHJzKSxcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLmRlbGV0ZSA/XG4gICAgICAgICAgICAgICAgbShcImJ1dHRvbi5kZWxldGVcIiwge29uY2xpY2s6IHZub2RlLmF0dHJzLm9uY2xpY2t9KSA6ICcnLFxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cbiAgICAgICAgKTsgfVxufTtcblxudmFyIFByb2dyZXNzID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbShcInByb2dyZXNzLnByb2dyZXNzXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLFxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cbiAgICAgICAgKTsgfVxufTtcblxudmFyIG9uY2xpY2sgPSBmdW5jdGlvbiAodm5vZGUsIHZhbCkgeyByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlc2V0KHZub2RlLCB2YWwpO1xyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB7IHZub2RlLmF0dHJzLm9uY2xpY2sodmFsKTsgfVxyXG4gICAgfTsgfTtcclxuXHJcbnZhciByZXNldCA9IGZ1bmN0aW9uICh2bm9kZSwgdmFsKSB7XHJcbiAgICB2bm9kZS5zdGF0ZS5jdXJyZW50ID0gdmFsO1xyXG4gICAgdmFyIG1heF9idXR0b25zID0gdm5vZGUuYXR0cnMubWF4X2J1dHRvbnMgfHwgMTA7XHJcbiAgICB2YXIgbmIgPSB2bm9kZS5hdHRycy5uYjtcclxuICAgIGlmIChuYiA+IG1heF9idXR0b25zKSB7XHJcbiAgICAgICAgdmFyIG1pZCA9IG5iIC8gMjtcclxuICAgICAgICBpZiAoWzEsIDJdLmluY2x1ZGVzKHZhbCkpIHsgdm5vZGUuc3RhdGUuYnV0dG9ucyA9IFsxLCAyLCAzLCBudWxsLCBtaWQsIG51bGwsIG5iXTsgfVxyXG4gICAgICAgIGVsc2UgaWYgKFtuYi0xLCBuYl0uaW5jbHVkZXModmFsKSkgeyB2bm9kZS5zdGF0ZS5idXR0b25zID0gWzEsIG51bGwsIG1pZCwgbnVsbCwgbmItMiwgbmItMSwgbmJdOyB9XHJcbiAgICAgICAgZWxzZSB7IHZub2RlLnN0YXRlLmJ1dHRvbnMgPSBbMSwgbnVsbCwgdmFsIC0gMSwgdmFsLCB2YWwgKyAxLCBudWxsLCBuYl07IH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuYnV0dG9ucyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG5iOyBpKyspIHsgdm5vZGUuc3RhdGUuYnV0dG9ucy5wdXNoKGkpOyB9XHJcbiAgICB9XHJcbn07XHJcblxyXG52YXIgUGFnaW5hdGlvbiA9IHtcclxuICAgIG9uaW5pdDogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiByZXNldCh2bm9kZSwgdm5vZGUuYXR0cnMuY3VycmVudCB8fCAxKTsgfSxcclxuXHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ25hdi5wYWdpbmF0aW9uJyxcclxuICAgICAgICBtKCdhLnBhZ2luYXRpb24tcHJldmlvdXMnLFxyXG4gICAgICAgICAgICB7b25jbGljazogb25jbGljayh2bm9kZSwgdm5vZGUuc3RhdGUuY3VycmVudCAtIDEpLFxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHZub2RlLnN0YXRlLmN1cnJlbnQgPT09IDF9LFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5wcmV2aW91c190ZXh0IHx8ICdQcmV2aW91cycpLFxyXG4gICAgICAgIG0oJ2EucGFnaW5hdGlvbi1uZXh0JyxcclxuICAgICAgICAgICAge29uY2xpY2s6IG9uY2xpY2sodm5vZGUsIHZub2RlLnN0YXRlLmN1cnJlbnQgKyAxKSxcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB2bm9kZS5zdGF0ZS5jdXJyZW50ID09PSB2bm9kZS5zdGF0ZS5idXR0b25zLmxlbmd0aH0sXHJcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLm5leHRfdGV4dCB8fCAnTmV4dCcpLFxyXG4gICAgICAgIG0oJ3VsLnBhZ2luYXRpb24tbGlzdCcsXHJcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLmJ1dHRvbnMubWFwKGZ1bmN0aW9uICh2YWwpIHsgcmV0dXJuIHZhbCA9PT0gbnVsbCA/XHJcbiAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ3NwYW4ucGFnaW5hdGlvbi1lbGxpcHNpcycsIG0udHJ1c3QoJyZoZWxsaXA7JykpKSA6XHJcbiAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ2EucGFnaW5hdGlvbi1saW5rJyxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5zdGF0ZS5jdXJyZW50ID09PSB2YWwgPyAnaXMtY3VycmVudCcgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrKHZub2RlLCB2YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdmFsKSk7IH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICk7IH1cclxufTtcblxudmFyIFNUWUxFUyA9IFsnYm9yZGVyZWQnLCAnc3RyaXBlZCcsICduYXJyb3cnXTtcblxudmFyIGhlYWRlcl9jb2wgPSBmdW5jdGlvbiAodm5vZGUsIGl0ZW0sIGlkeCkge1xuICAgIHZhciB3YXkgPSAoaWR4ID09PSB2bm9kZS5zdGF0ZS5zb3J0X2J5KSA/XG4gICAgICAgICh2bm9kZS5zdGF0ZS5zb3J0X2FzYyA/ICcgVScgOiAnIEQnKSA6ICcnO1xuICAgIHJldHVybiBpdGVtLm5hbWUgKyB3YXlcbn07XG5cblxudmFyIHRoX3RmID0gZnVuY3Rpb24gKHZub2RlLCB0YWcpIHsgcmV0dXJuIG0odGFnID09PSAnaGVhZGVyJyA/ICd0aGVhZCcgOiAndGZvb3QnLFxuICAgICAgICBtKCd0cicsXG4gICAgICAgICAgICB2bm9kZS5hdHRyc1t0YWddLm1hcChmdW5jdGlvbiAoaXRlbSwgaWR4KSB7IHJldHVybiBtKCd0aCcsIHtvbmNsaWNrOiBpdGVtLnNvcnRhYmxlID8gc29ydGhhbmRsZXIodm5vZGUsIGlkeCk6IG51bGx9LFxuICAgICAgICAgICAgICAgICAgICBpdGVtLnRpdGxlID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FiYnInLCB7dGl0bGU6IGl0ZW0udGl0bGV9LCBoZWFkZXJfY29sKHZub2RlLCBpdGVtLCBpZHgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBoZWFkZXJfY29sKHZub2RlLCBpdGVtLCBpZHgpKTsgfVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgKTsgfTtcblxudmFyIGNvbXBhcmF0b3IgPSBmdW5jdGlvbiAoaWR4KSB7IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgaWYgKGFbaWR4XSA8IGJbaWR4XSlcbiAgICAgICAgeyByZXR1cm4gLTEgfVxuICAgICAgaWYgKGFbaWR4XSA+IGJbaWR4XSlcbiAgICAgICAgeyByZXR1cm4gMSB9XG4gICAgICByZXR1cm4gMFxuICAgIH07IH07XG5cbnZhciBzb3J0aGFuZGxlciA9IGZ1bmN0aW9uICh2bm9kZSwgaWR4KSB7IHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh2bm9kZS5zdGF0ZS5zb3J0X2J5ID09PSBpZHgpXG4gICAgICAgICAgICB7IHZub2RlLnN0YXRlLnNvcnRfYXNjID0gISB2bm9kZS5zdGF0ZS5zb3J0X2FzYzsgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB7IHZub2RlLnN0YXRlLnNvcnRfYXNjID0gdHJ1ZTsgfVxuXG4gICAgICAgIHZub2RlLnN0YXRlLnNvcnRfYnkgPSBpZHg7XG4gICAgICAgIHZub2RlLnN0YXRlLnJvd3Muc29ydChjb21wYXJhdG9yKGlkeCkpO1xuICAgICAgICBpZiAoISB2bm9kZS5zdGF0ZS5zb3J0X2FzYylcbiAgICAgICAgICAgIHsgdm5vZGUuc3RhdGUucm93cy5yZXZlcnNlKCk7IH1cbiAgICB9OyB9O1xuXG52YXIgVGFibGUgPSB7XG5cbiAgICBvbmluaXQ6IGZ1bmN0aW9uICh2bm9kZSkge1xuICAgICAgICB2bm9kZS5zdGF0ZS5zb3J0X2J5ID0gbnVsbDtcbiAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9hc2MgPSB0cnVlO1xuICAgICAgICB2bm9kZS5zdGF0ZS5yb3dzID0gdm5vZGUuYXR0cnMucm93cztcbiAgICAgICAgaWYgKHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KXtcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLnBhZ2UgPSAxO1xuICAgICAgICAgICAgdm5vZGUuc3RhdGUuc3RhcnRfYXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHsgdm5vZGUuc3RhdGUuZGlzcGxheV9yb3dzID0gdm5vZGUuYXR0cnMucm93czsgfVxuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIFtcbiAgICAgICAgbSgndGFibGUudGFibGUnLCB7Y2xhc3M6IGNvbGxlY3RfYm9vbGVhbih2bm9kZS5hdHRycywgU1RZTEVTKX0sXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5oZWFkZXIgPyB0aF90Zih2bm9kZSwgJ2hlYWRlcicpIDogbnVsbCxcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLmZvb3RlciA/IHRoX3RmKHZub2RlLCAnZm9vdGVyJykgOiBudWxsLFxuICAgICAgICAgICAgbSgndGJvZHknLFxuICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLnJvd3Muc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLnN0YXJ0X2F0LFxuICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5zdGFydF9hdCArIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KS5tYXAoZnVuY3Rpb24gKHJvdykgeyByZXR1cm4gbSgndHInLCByb3cubWFwKGZ1bmN0aW9uIChjb2wpIHsgcmV0dXJuIG0oJ3RkJywgY29sKTsgfSkpOyB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICApXG4gICAgICAgICksXG5cbiAgICAgICAgdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkgP1xuICAgICAgICAgICAgbShQYWdpbmF0aW9uLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmI6IE1hdGguY2VpbCh2bm9kZS5zdGF0ZS5yb3dzLmxlbmd0aCAvIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KSxcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogZnVuY3Rpb24gKG5iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5wYWdlID0gbmI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5zdGFydF9hdCA9IG5iID09PSAxID8gMCA6ICgobmIgLTEpICogdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSA6IG51bGxcbiAgICBdOyB9XG59O1xuXG52YXIgVGFnID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdzcGFuLnRhZycsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIFRpdGxlID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnaCcgKyB2bm9kZS5hdHRycy5zaXplICsgJy50aXRsZScgKyAnLmlzLScgKyB2bm9kZS5hdHRycy5zaXplLCB2bm9kZS5jaGlsZHJlbik7IH1cbn07XG5cblxudmFyIFN1YlRpdGxlID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnaCcgKyB2bm9kZS5hdHRycy5zaXplICsgJy5zdWJ0aXRsZScgKyAnLmlzLScgKyB2bm9kZS5hdHRycy5zaXplLCB2bm9kZS5jaGlsZHJlbik7IH1cbn07XG5cbnZhciBDb250ZW50ID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdjb250ZW50Jywge2NsYXNzOiB2bm9kZS5hdHRycy5zaXplID8gJ2lzLScgKyB2bm9kZS5hdHRycy5zaXplIDogJyd9LFxyXG4gICAgICAgICAgICB2bm9kZS5jaGlsZHJlblxyXG4gICAgICAgICk7IH1cclxufTtcblxudmFyIExldmVsID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCduYXYubGV2ZWwnLFxyXG4gICAgICAgIHsnaXMtbW9iaWxlJzogdm5vZGUuYXR0cnMubW9iaWxlfSwgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5cclxudmFyIExldmVsSXRlbSA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgncC5sZXZlbC1pdGVtJyxcclxuICAgICAgICB7Y2xhc3M6IHZub2RlLmF0dHJzLmNlbnRlcmVkID8gJ2hhcy10ZXh0LWNlbnRlcmVkJzogJyd9LCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIE1lZGlhTGVmdCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZmlndXJlLm1lZGlhLWxlZnQnLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcclxuXHJcbnZhciBNZWRpYUNvbnRlbnQgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2Rpdi5tZWRpYS1jb250ZW50Jywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgTWVkaWFSaWdodCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZGl2Lm1lZGlhLXJpZ2h0Jywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgTWVkaWEgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2FydGljbGUubWVkaWEnLCBbXHJcblxyXG4gICAgICAgIHZub2RlLmF0dHJzLmltYWdlID9cclxuICAgICAgICAgICAgbShNZWRpYUxlZnQsIG0oJ3AuaW1hZ2UnLCB7Y2xhc3M6ICdpcy0nICsgdm5vZGUuYXR0cnMuaW1hZ2UucmF0aW99LFxyXG4gICAgICAgICAgICAgICAgbSgnaW1nJywgeydzcmMnOiB2bm9kZS5hdHRycy5pbWFnZS5zcmN9KSkpIDogJycsXHJcblxyXG4gICAgICAgIG0oTWVkaWFDb250ZW50LCB2bm9kZS5jaGlsZHJlbiksXHJcblxyXG4gICAgICAgIHZub2RlLmF0dHJzLmJ1dHRvbiA/IG0oTWVkaWFSaWdodCwgdm5vZGUuYXR0cnMuYnV0dG9uKSA6ICcnXHJcbiAgICBdKTsgfVxyXG59O1xuXG52YXIgY2xpY2toYW5kbGVyID0gZnVuY3Rpb24gKHN0YXRlLCBpdGVtKSB7IHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWQgPSBpdGVtLmtleTtcclxuICAgICAgICBpZiAoaXRlbS51cmwpIHsgY29uc29sZS5sb2coJ3JlZGlyZWN0IHRvICcgKyBpdGVtLnVybCk7IH1cclxuICAgICAgICBpZiAoaXRlbS5vbmNsaWNrKSB7IGl0ZW0ub25jbGljayhpdGVtLmtleSk7IH1cclxuICAgIH07IH07XHJcblxyXG5cclxudmFyIE1lbnVJdGVtID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBbXHJcbiAgICAgICAgICAgIG0oJ2EnLCB7b25jbGljazogY2xpY2toYW5kbGVyKHZub2RlLmF0dHJzLnN0YXRlLCB2bm9kZS5hdHRycy5yb290KSxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5hdHRycy5zdGF0ZS5zZWxlY3RlZCA9PT0gdm5vZGUuYXR0cnMucm9vdC5rZXkgPyBcImlzLWFjdGl2ZVwiIDogJyd9LFxyXG4gICAgICAgICAgICAgICAgdm5vZGUuYXR0cnMucm9vdC5sYWJlbCksXHJcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLnJvb3QuaXRlbXMgP1xyXG4gICAgICAgICAgICAgICAgbSgndWwnLCB2bm9kZS5hdHRycy5yb290Lml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gbSgnbGknLCBtKCdhJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogdm5vZGUuYXR0cnMuc3RhdGUuc2VsZWN0ZWQgPT09IGl0ZW0ua2V5ID8gXCJpcy1hY3RpdmVcIiA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjbGlja2hhbmRsZXIodm5vZGUuYXR0cnMuc3RhdGUsIGl0ZW0pfSwgaXRlbS5sYWJlbCkpOyB9KSlcclxuICAgICAgICAgICAgICAgIDogJydcclxuICAgICAgICBdOyB9XHJcbn07XHJcblxyXG52YXIgTWVudSA9IHtcclxuICAgIG9uaW5pdDogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiB2bm9kZS5zdGF0ZSA9IHZub2RlLmF0dHJzOyB9LFxyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdhc2lkZS5tZW51JyxcclxuICAgICAgICB2bm9kZS5zdGF0ZS5pdGVtcy5tYXAoZnVuY3Rpb24gKG1lbnUpIHsgcmV0dXJuIFtcclxuICAgICAgICAgICAgbSgncC5tZW51LWxhYmVsJywgbWVudS5sYWJlbCksXHJcbiAgICAgICAgICAgIG0oJ3VsLm1lbnUtbGlzdCcsXHJcbiAgICAgICAgICAgICAgICBtZW51Lml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gbSgnbGknLCBtKE1lbnVJdGVtLCB7c3RhdGU6IHZub2RlLnN0YXRlLCByb290OiBpdGVtfSkpOyB9XHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdOyB9KVxyXG4gICAgKTsgfVxyXG59O1xuXG52YXIgTWVzc2FnZSA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnYXJ0aWNsZS5tZXNzYWdlJyxcclxuICAgICAgICB7Y2xhc3M6IHZub2RlLmF0dHJzLmNvbG9yID8gJ2lzLScgKyB2bm9kZS5hdHRycy5jb2xvciA6ICcnfSwgW1xyXG4gICAgICAgIHZub2RlLmF0dHJzLmhlYWRlciA/XHJcbiAgICAgICAgICAgIG0oJy5tZXNzYWdlLWhlYWRlcicsIG0oJ3AnLCB2bm9kZS5hdHRycy5oZWFkZXIpLFxyXG4gICAgICAgICAgICAgICAgdm5vZGUuYXR0cnMub25jbG9zZSA/IG0oJ2J1dHRvbicsXHJcbiAgICAgICAgICAgICAgICAgICAge2NsYXNzOiAnZGVsZXRlJywgb25jbGljazogdm5vZGUuYXR0cnMub25jbG9zZX0pOiAnJylcclxuICAgICAgICA6ICcnLFxyXG4gICAgICAgIG0oJy5tZXNzYWdlLWJvZHknLCB2bm9kZS5jaGlsZHJlbilcclxuICAgIF0pOyB9XHJcbn07XG5cbnZhciBNb2RhbCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnLm1vZGFsJywge2NsYXNzOiB2bm9kZS5hdHRycy5hY3RpdmUgPyAnaXMtYWN0aXZlJzogJyd9LCBbXHJcbiAgICAgICAgICAgIG0oJy5tb2RhbC1iYWNrZ3JvdW5kJyksXHJcbiAgICAgICAgICAgIG0oJy5tb2RhbC1jb250ZW50Jywgdm5vZGUuY2hpbGRyZW4pLFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5vbmNsb3NlID8gbSgnLmJ1dHRvbi5tb2RhbC1jbG9zZScsIHtvbmNsaWNrOiB2bm9kZS5hdHRycy5vbmNsb3NlfSk6ICcnXHJcbiAgICBdKTsgfVxyXG59O1xuXG52YXIgTmF2ID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCduYXYubmF2JywgW1xyXG4gICAgICAgIHZub2RlLmF0dHJzLmxlZnQgPyBtKCcubmF2LWxlZnQnLCB2bm9kZS5hdHRycy5sZWZ0Lm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gbSgnYS5uYXYtaXRlbScsIGl0ZW0pOyB9KSkgOiAnJyxcclxuICAgICAgICB2bm9kZS5hdHRycy5jZW50ZXIgPyBtKCcubmF2LWNlbnRlcicsIHZub2RlLmF0dHJzLmNlbnRlci5tYXAoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIG0oJ2EubmF2LWl0ZW0nLCBpdGVtKTsgfSkpIDogJycsXHJcbiAgICAgICAgdm5vZGUuYXR0cnMucmlnaHQgPyBtKCcubmF2LXJpZ2h0Jywgdm5vZGUuYXR0cnMucmlnaHQubWFwKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBtKCdhLm5hdi1pdGVtJywgaXRlbSk7IH0pKSA6ICcnXHJcbiAgICBdKTsgfVxyXG59O1xuXG52YXIgQ2FyZEhlYWRlciA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnaGVhZGVyLmNhcmQtaGVhZGVyJywgW1xyXG4gICAgICAgIG0oJ3AuY2FyZC1oZWFkZXItdGl0bGUnLCB2bm9kZS5hdHRycy50aXRsZSksXHJcbiAgICAgICAgbSgnYS5jYXJkLWhlYWRlci1pY29uJywgdm5vZGUuYXR0cnMuaWNvbilcclxuICAgIF0pOyB9XHJcbn07XHJcblxyXG52YXIgQ2FyZEZvb3RlciA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZm9vdGVyLmNhcmQtZm9vdGVyJywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgQ2FyZEZvb3Rlckl0ZW0gPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2EuY2FyZC1mb290ZXItaXRlbScsIHZub2RlLmF0dHJzKTsgfVxyXG59O1xyXG5cclxudmFyIENhcmRDb250ZW50ID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCcuY2FyZC1jb250ZW50Jywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgQ2FyZCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnLmNhcmQnLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIG9uY2xpY2skMSA9IGZ1bmN0aW9uICh2bm9kZSwgaXRlbSwgaWR4KSB7IHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuYWN0aXZlID0gaWR4O1xyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB7IHZub2RlLmF0dHJzLm9uY2xpY2soaXRlbSk7IH1cclxuICAgIH07IH07XHJcblxyXG52YXIgVGFic01lbnUgPSB7XHJcbiAgICBvbmluaXQ6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gdm5vZGUuc3RhdGUuYWN0aXZlID0gdm5vZGUuYXR0cnMuYWN0aXZlIHx8IDA7IH0sXHJcblxyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCcudGFicycsIG0oJ3VsJyxcclxuICAgICAgICB2bm9kZS5hdHRycy5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0sIGlkeCkgeyByZXR1cm4gbSgnbGknLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBpZHggPT09IHZub2RlLnN0YXRlLmFjdGl2ZSA/ICdpcy1hY3RpdmUnIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrJDEodm5vZGUsIGl0ZW0sIGlkeClcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtKCdhJywgaXRlbS5pY29uID8gW1xyXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uaWNvbi5pcy1zbWFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnaS5mYScsIHtjbGFzczogJ2ZhLScgKyBpdGVtLmljb259KSksIG0oJ3NwYW4nLCBpdGVtLmxhYmVsKV1cclxuICAgICAgICAgICAgICAgICAgICA6IGl0ZW0ubGFiZWwpXHJcbiAgICAgICAgICAgICk7IH1cclxuICAgICAgICApXHJcbiAgICApKTsgfVxyXG59O1xyXG5cclxuXHJcbnZhciBjbGlja2hhbmRsZXIkMSA9IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIHZub2RlLnN0YXRlLmFjdGl2ZSA9IGl0ZW0ua2V5OyB9OyB9O1xyXG5cclxudmFyIFRhYnMgPSB7XHJcbiAgICBvbmluaXQ6IGZ1bmN0aW9uICh2bm9kZSkge1xyXG4gICAgICAgIHZub2RlLnN0YXRlLmFjdGl2ZSA9IHZub2RlLmF0dHJzLmFjdGl2ZSB8fCAwO1xyXG4gICAgICAgIHZub2RlLnN0YXRlLml0ZW1zID0gdm5vZGUuYXR0cnMuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHtcclxuICAgICAgICAgICAgaXRlbS5rZXkgPSBpZHg7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnLCBmbGV4OiAnMScsIHdpZHRoOiAnMTAwJScsICdmbGV4LWRpcmVjdGlvbic6ICdjb2x1bW4nfX0sIFtcclxuICAgICAgICAgICAgbShUYWJzTWVudSwge2FjdGl2ZTogdm5vZGUuc3RhdGUuYWN0aXZlLCBvbmNsaWNrOiBjbGlja2hhbmRsZXIkMSh2bm9kZSksIGl0ZW1zOiB2bm9kZS5zdGF0ZS5pdGVtc30pLFxyXG4gICAgICAgICAgICB2bm9kZS5zdGF0ZS5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIG0oJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAgICAge3N0eWxlOiB7ZGlzcGxheTogaXRlbS5rZXkgPT09IHZub2RlLnN0YXRlLmFjdGl2ZSA/ICdibG9jayc6ICdub25lJywgJ21hcmdpbi1sZWZ0JzogJzEwcHgnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jb250ZW50XHJcbiAgICAgICAgICAgICAgICApOyB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdKTsgfVxyXG5cclxufTtcblxudmFyIG9uY2xpY2skMiA9IGZ1bmN0aW9uICh2bm9kZSwgaXRlbSwgaWR4KSB7IHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHZub2RlLnN0YXRlLmFjdGl2ZSA9PT0gaWR4KSB7IHZub2RlLnN0YXRlLmFjdGl2ZSA9IG51bGw7IH1cclxuICAgICAgICBlbHNlIHsgdm5vZGUuc3RhdGUuYWN0aXZlID0gaWR4OyB9XHJcbiAgICAgICAgaWYgKHZub2RlLmF0dHJzLm9uY2xpY2spIHsgdm5vZGUuYXR0cnMub25jbGljayhpdGVtKTsgfVxyXG4gICAgfTsgfTtcclxuXHJcbnZhciBQYW5lbCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnbmF2LnBhbmVsJywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgUGFuZWxIZWFkaW5nID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdwLnBhbmVsLWhlYWRpbmcnLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcclxuXHJcbnZhciBQYW5lbFRhYnMgPSB7XHJcbiAgICBvbmluaXQ6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gdm5vZGUuc3RhdGUuYWN0aXZlID0gdm5vZGUuYXR0cnMuYWN0aXZlIHx8IG51bGw7IH0sXHJcblxyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCcucGFuZWwtdGFicycsXHJcbiAgICAgICAgdm5vZGUuYXR0cnMuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIG0oJ2EnLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBpZHggPT09IHZub2RlLnN0YXRlLmFjdGl2ZSA/ICdpcy1hY3RpdmUnIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrJDIodm5vZGUsIGl0ZW0sIGlkeClcclxuICAgICAgICAgICAgICAgIH0sIGl0ZW0ubGFiZWxcclxuICAgICAgICAgICAgKTsgfVxyXG4gICAgICAgIClcclxuICAgICk7IH1cclxufTtcclxuXHJcblxyXG5cclxudmFyIFBhbmVsQmxvY2tzID0ge1xyXG4gICAgb25pbml0OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIHZub2RlLnN0YXRlLmFjdGl2ZSA9IHZub2RlLmF0dHJzLmFjdGl2ZSB8fCBudWxsOyB9LFxyXG5cclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gdm5vZGUuYXR0cnMuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIG0oJ2EucGFuZWwtYmxvY2snLCB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogaWR4ID09PSB2bm9kZS5zdGF0ZS5hY3RpdmUgPyAnaXMtYWN0aXZlJyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrJDIodm5vZGUsIGl0ZW0sIGlkeClcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICBtKCdzcGFuLnBhbmVsLWljb24nLCBtKCdpLmZhJywge2NsYXNzOiAnZmEtJyArIGl0ZW0uaWNvbn0pKSxcclxuICAgICAgICAgICAgaXRlbS5sYWJlbFxyXG4gICAgICAgIF0pOyB9XHJcbiAgICApOyB9XHJcbn07XG5cbmV4cG9ydCB7IEJveCwgQnV0dG9uLCBJY29uLCBMYWJlbCwgSW5wdXQsIFNlbGVjdCwgVGV4dEFyZWEsIENoZWNrQm94LCBSYWRpbywgSW1hZ2UsIE5vdGlmaWNhdGlvbiwgUHJvZ3Jlc3MsIFRhYmxlLCBUYWcsIFRpdGxlLCBTdWJUaXRsZSwgQ29udGVudCwgTGV2ZWwsIExldmVsSXRlbSwgTWVkaWEsIE1lbnUsIE1lc3NhZ2UsIE1vZGFsLCBOYXYsIENhcmQsIENhcmRIZWFkZXIsIENhcmRDb250ZW50LCBDYXJkRm9vdGVyLCBDYXJkRm9vdGVySXRlbSwgUGFnaW5hdGlvbiwgVGFicywgUGFuZWwsIFBhbmVsSGVhZGluZywgUGFuZWxUYWJzLCBQYW5lbEJsb2NrcywgQ09MT1JTLCBTVEFURVMsIFNJWkVTLCBnZXRfY2xhc3NlcywgYnVsbWlmeSwgY29sbGVjdF9ib29sZWFuLCBzbGVlcCwgc21hbGxlcl90aGFuIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpwdWRXeHNMQ0p6YjNWeVkyVnpJanBiSWk0dUwzTnlZeTlsYkdWdFpXNTBjeTlpYjNndWFuTWlMQ0l1TGk5emNtTXZZMjl0Ylc5dUwybHVaR1Y0TG1weklpd2lMaTR2YzNKakwyVnNaVzFsYm5SekwybGpiMjR1YW5NaUxDSXVMaTl6Y21NdlpXeGxiV1Z1ZEhNdlluVjBkRzl1TG1weklpd2lMaTR2YzNKakwyVnNaVzFsYm5SekwyWnZjbTB1YW5NaUxDSXVMaTl6Y21NdlpXeGxiV1Z1ZEhNdmFXMWhaMlV1YW5NaUxDSXVMaTl6Y21NdlpXeGxiV1Z1ZEhNdmJtOTBhV1pwWTJGMGFXOXVMbXB6SWl3aUxpNHZjM0pqTDJWc1pXMWxiblJ6TDNCeWIyZHlaWE56TG1weklpd2lMaTR2YzNKakwyTnZiWEJ2Ym1WdWRITXZjR0ZuYVc1aGRHbHZiaTVxY3lJc0lpNHVMM055WXk5bGJHVnRaVzUwY3k5MFlXSnNaUzVxY3lJc0lpNHVMM055WXk5bGJHVnRaVzUwY3k5MFlXY3Vhbk1pTENJdUxpOXpjbU12Wld4bGJXVnVkSE12ZEdsMGJHVXVhbk1pTENJdUxpOXpjbU12Wld4bGJXVnVkSE12WTI5dWRHVnVkQzVxY3lJc0lpNHVMM055WXk5amIyMXdiMjVsYm5SekwyeGxkbVZzTG1weklpd2lMaTR2YzNKakwyTnZiWEJ2Ym1WdWRITXZiV1ZrYVdFdWFuTWlMQ0l1TGk5emNtTXZZMjl0Y0c5dVpXNTBjeTl0Wlc1MUxtcHpJaXdpTGk0dmMzSmpMMk52YlhCdmJtVnVkSE12YldWemMyRm5aUzVxY3lJc0lpNHVMM055WXk5amIyMXdiMjVsYm5SekwyMXZaR0ZzTG1weklpd2lMaTR2YzNKakwyTnZiWEJ2Ym1WdWRITXZibUYyTG1weklpd2lMaTR2YzNKakwyTnZiWEJ2Ym1WdWRITXZZMkZ5WkM1cWN5SXNJaTR1TDNOeVl5OWpiMjF3YjI1bGJuUnpMM1JoWW5NdWFuTWlMQ0l1TGk5emNtTXZZMjl0Y0c5dVpXNTBjeTl3WVc1bGJDNXFjeUpkTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnYlNCbWNtOXRJRndpYldsMGFISnBiRndpWEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1FtOTRJRDBnZTF4eVhHNGdJQ0FnZG1sbGR6b2dLSFp1YjJSbEtTQTlQaUJ0S0NjdVltOTRKeXdnZG01dlpHVXVZMmhwYkdSeVpXNHBYSEpjYm4xY2NseHVJaXdpWEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JEVDB4UFVsTWdQU0JiSjNkb2FYUmxKeXdnSjJ4cFoyaDBKeXdnSjJSaGNtc25MQ0FuWW14aFkyc25MQ0FuYkdsdWF5ZGRYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQlRWRUZVUlZNZ1BTQmJKM0J5YVcxaGNua25MQ0FuYVc1bWJ5Y3NJQ2R6ZFdOalpYTnpKeXdnSjNkaGNtNXBibWNuTENBblpHRnVaMlZ5SjExY2NseHVaWGh3YjNKMElHTnZibk4wSUZOSldrVlRJRDBnV3lkemJXRnNiQ2NzSUNjbkxDQW5iV1ZrYVhWdEp5d2dKMnhoY21kbEoxMWNjbHh1WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1oyVjBYMk5zWVhOelpYTWdQU0FvYzNSaGRHVXBJRDArSUh0Y2NseHVJQ0FnSUd4bGRDQmpiR0Z6YzJWeklEMGdXMTFjY2x4dUlDQWdJR2xtSUNoemRHRjBaUzVqYjJ4dmNpa2dZMnhoYzNObGN5NXdkWE5vS0NkcGN5MG5JQ3NnYzNSaGRHVXVZMjlzYjNJcFhISmNiaUFnSUNCcFppQW9jM1JoZEdVdWMzUmhkR1VwSUdOc1lYTnpaWE11Y0hWemFDZ25hWE10SnlBcklITjBZWFJsTG5OMFlYUmxLVnh5WEc0Z0lDQWdhV1lnS0hOMFlYUmxMbk5wZW1VcElHTnNZWE56WlhNdWNIVnphQ2duYVhNdEp5QXJJSE4wWVhSbExuTnBlbVVwWEhKY2JpQWdJQ0JwWmlBb2MzUmhkR1V1Ykc5aFpHbHVaeWtnWTJ4aGMzTmxjeTV3ZFhOb0tDZHBjeTFzYjJGa2FXNW5KeWxjY2x4dUlDQWdJR2xtSUNoemRHRjBaUzVvYjNabGNtVmtLU0JqYkdGemMyVnpMbkIxYzJnb0oybHpMV2h2ZG1WeVpXUW5LVnh5WEc0Z0lDQWdhV1lnS0hOMFlYUmxMbVp2WTNWelpXUXBJR05zWVhOelpYTXVjSFZ6YUNnbmFYTXRabTlqZFhObFpDY3BYSEpjYmx4eVhHNGdJQ0FnY21WMGRYSnVJR05zWVhOelpYTXVhbTlwYmlnbklDY3BYSEpjYm4xY2NseHVYSEpjYmx4eVhHNWxlSEJ2Y25RZ1kyOXVjM1FnWW5Wc2JXbG1lU0E5SUNoemRHRjBaU2tnUFQ0Z2UxeHlYRzRnSUNBZ2JHVjBJR05zWVhOelpYTWdQU0JuWlhSZlkyeGhjM05sY3loemRHRjBaU2xjY2x4dUlDQWdJR3hsZENCdVpYZGZjM1JoZEdVZ1BTQjdmVnh5WEc0Z0lDQWdhV1lnS0dOc1lYTnpaWE1wSUc1bGQxOXpkR0YwWlM1amJHRnpjeUE5SUdOc1lYTnpaWE5jY2x4dUlDQWdJRTlpYW1WamRDNXJaWGx6S0hOMFlYUmxLUzVtYjNKRllXTm9LR3RsZVNBOVBpQjdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tGc25ZMjlzYjNJbkxDQW5jM1JoZEdVbkxDQW5jMmw2WlNjc0lDZHNiMkZrYVc1bkp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0oybGpiMjRuTENBblkyOXVkR1Z1ZENjc0lDZG9iM1psY21Wa0p5d2dKMlp2WTNWelpXUW5YUzVwYm1SbGVFOW1LR3RsZVNrZ1BUMDlJQzB4S1Z4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhkZmMzUmhkR1ZiYTJWNVhTQTlJSE4wWVhSbFcydGxlVjFjY2x4dUlDQWdJSDBwWEhKY2JpQWdJQ0J5WlhSMWNtNGdibVYzWDNOMFlYUmxYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQmpiMnhzWldOMFgySnZiMnhsWVc0Z1BTQW9jM1JoZEdVc0lHNWhiV1Z6S1NBOVBpQjdYSEpjYmlBZ0lDQnNaWFFnYzNSNWJHVnpJRDBnVzExY2NseHVJQ0FnSUc1aGJXVnpMbVp2Y2tWaFkyZ29ibUZ0WlNBOVBpQjdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tHNWhiV1VnYVc0Z2MzUmhkR1VnSmlZZ2MzUmhkR1ZiYm1GdFpWMGdQVDA5SUhSeWRXVXBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lITjBlV3hsY3k1d2RYTm9LQ2RwY3kwbklDc2dibUZ0WlNsY2NseHVJQ0FnSUgwcFhISmNibjFjY2x4dVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdjMnhsWlhBZ1BTQW9kR2x0WlNrZ1BUNWNjbHh1SUNBZ0lHNWxkeUJRY205dGFYTmxLQ2h5WlhOdmJIWmxLU0E5UGlCelpYUlVhVzFsYjNWMEtISmxjMjlzZG1Vc0lIUnBiV1VwS1Z4eVhHNWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0J6YldGc2JHVnlYM1JvWVc0Z1BTQW9jM29wSUQwK0lITjZJRDhnVTBsYVJWTmJVMGxhUlZNdWFXNWtaWGhQWmloemVpa2dMU0F4WFNBNklDZHpiV0ZzYkNkY2NseHVJaXdpYVcxd2IzSjBJRzBnWm5KdmJTQmNJbTFwZEdoeWFXeGNJbHh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUVsamIyNGdQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQW9lMkYwZEhKemZTa2dQVDVjY2x4dUlDQWdJQ0FnSUNCdEtDZHpjR0Z1TG1samIyNG5MQ0I3WTJ4aGMzTTZJR0YwZEhKekxuTnBlbVVnUHlBbmFYTXRKeUFySUdGMGRISnpMbk5wZW1VZ09pQW5KMzBzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzBvSjJrdVptRW5MQ0I3WTJ4aGMzTTZJQ2RtWVMwbklDc2dZWFIwY25NdWFXTnZibjBwWEhKY2JpQWdJQ0FnSUNBZ0tWeHlYRzU5WEhKY2JpSXNJbWx0Y0c5eWRDQnRJR1p5YjIwZ1hDSnRhWFJvY21sc1hDSmNjbHh1YVcxd2IzSjBJSHNnWW5Wc2JXbG1lU3dnYzIxaGJHeGxjbDkwYUdGdUlIMGdabkp2YlNBbkxpNHZZMjl0Ylc5dUoxeHlYRzVwYlhCdmNuUWdleUJKWTI5dUlIMGdabkp2YlNBbkxpOXBZMjl1TG1wekoxeHlYRzVjY2x4dVpYaHdiM0owSUdOdmJuTjBJR2xqYjI1ZlluVjBkRzl1SUQwZ0tIWnViMlJsS1NBOVBpQmJYSEpjYmlBZ0lDQWhkbTV2WkdVdVlYUjBjbk11YVdOdmJsOXlhV2RvZENBL1hISmNiaUFnSUNBZ0lDQWdiU2hKWTI5dUxDQjdhV052YmpvZ2RtNXZaR1V1WVhSMGNuTXVhV052Yml3Z2MybDZaVG9nYzIxaGJHeGxjbDkwYUdGdUtIWnViMlJsTG1GMGRISnpMbk5wZW1VcGZTa2dPaUFuSnl4Y2NseHVJQ0FnSUcwb0ozTndZVzRuTENCMmJtOWtaUzVoZEhSeWN5NWpiMjUwWlc1MEtTeGNjbHh1SUNBZ0lIWnViMlJsTG1GMGRISnpMbWxqYjI1ZmNtbG5hSFFnUDF4eVhHNGdJQ0FnSUNBZ0lHMG9TV052Yml3Z2UybGpiMjQ2SUhadWIyUmxMbUYwZEhKekxtbGpiMjRzSUhOcGVtVTZJSE50WVd4c1pYSmZkR2hoYmloMmJtOWtaUzVoZEhSeWN5NXphWHBsS1gwcElEb2dKeWRjY2x4dVhWeHlYRzVjY2x4dVpYaHdiM0owSUdOdmJuTjBJRUoxZEhSdmJpQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duWVM1aWRYUjBiMjRuTENCaWRXeHRhV1o1S0hadWIyUmxMbUYwZEhKektTeGNjbHh1SUNBZ0lDQWdJQ0IyYm05a1pTNWhkSFJ5Y3k1cFkyOXVJRDhnYVdOdmJsOWlkWFIwYjI0b2RtNXZaR1VwSURvZ2RtNXZaR1V1WVhSMGNuTXVZMjl1ZEdWdWRDbGNjbHh1ZlZ4eVhHNGlMQ0pwYlhCdmNuUWdiU0JtY205dElGd2liV2wwYUhKcGJGd2lYSEpjYm1sdGNHOXlkQ0I3SUVsamIyNGdmU0JtY205dElDY3VMMmxqYjI0blhISmNibWx0Y0c5eWRDQjdJR0oxYkcxcFpua2dmU0JtY205dElDY3VMaTlqYjIxdGIyNG5YSEpjYmx4eVhHNWxlSEJ2Y25RZ1kyOXVjM1FnVEdGaVpXd2dQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQW9kbTV2WkdVcElEMCtJRzBvSjJ4aFltVnNMbXhoWW1Wc0p5d2dkbTV2WkdVdVkyaHBiR1J5Wlc0cFhISmNibjFjY2x4dVhISmNibVY0Y0c5eWRDQmpiMjV6ZENCSmJuQjFkQ0E5SUh0Y2NseHVJQ0FnSUhacFpYYzZJQ2gyYm05a1pTa2dQVDRnYlNnbmNDNWpiMjUwY205c0p5eGNjbHh1SUNBZ0lDQWdJQ0I3SUdOc1lYTnpPaUIyYm05a1pTNWhkSFJ5Y3k1cFkyOXVJRDhnSjJoaGN5MXBZMjl1SUdoaGN5MXBZMjl1TFhKcFoyaDBKeUE2SUNjbklIMHNYSEpjYmlBZ0lDQWdJQ0FnVzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J0S0NkcGJuQjFkQzVwYm5CMWRGdDBlWEJsUFhSbGVIUmRKeXdnWW5Wc2JXbG1lU2gyYm05a1pTNWhkSFJ5Y3lrcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWN5NXBZMjl1SUQ4Z2JTaEpZMjl1TENCN2MybDZaVG9nSjNOdFlXeHNKeXdnYVdOdmJqb2dkbTV2WkdVdVlYUjBjbk11YVdOdmJuMHBJRG9nSnlkY2NseHVJQ0FnSUNBZ0lDQmRYSEpjYmlBZ0lDQXBYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQlRaV3hsWTNRZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lCMmJtOWtaU0E5UGx4eVhHNGdJQ0FnSUNBZ0lHMG9KM0F1WTI5dWRISnZiQ2NzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzBvSjNOd1lXNHVjMlZzWldOMEp5d2dZblZzYldsbWVTaDJibTlrWlM1aGRIUnljeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdEtDZHpaV3hsWTNRbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtTm9iMmxqWlhNdWJXRndLR3NnUFQ0Z2JTZ25iM0IwYVc5dUp5d2dlM1poYkhWbE9pQnJXekJkZlN3Z2Exc3hYU2twWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNsY2NseHVJQ0FnSUNBZ0lDQXBYSEpjYm4xY2NseHVYSEpjYmx4eVhHNWxlSEJ2Y25RZ1kyOXVjM1FnVkdWNGRFRnlaV0VnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUIyYm05a1pTQTlQbHh5WEc0Z0lDQWdJQ0FnSUcwb1hDSndMbU52Ym5SeWIyeGNJaXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdiU2hjSW5SbGVIUmhjbVZoTG5SbGVIUmhjbVZoWENJc0lHSjFiRzFwWm5rb2RtNXZaR1V1WVhSMGNuTXBLVnh5WEc0Z0lDQWdJQ0FnSUNsY2NseHVmVnh5WEc1Y2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQkRhR1ZqYTBKdmVDQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklIWnViMlJsSUQwK1hISmNiaUFnSUNBZ0lDQWdiU2hjSW5BdVkyOXVkSEp2YkZ3aUxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdEtGd2liR0ZpWld3dVkyaGxZMnRpYjNoY0lpeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzBvWENKcGJuQjFkRnQwZVhCbFBTZGphR1ZqYTJKdmVDZGRYQ0lzSUdKMWJHMXBabmtvZG01dlpHVXVZWFIwY25NcEtTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG1OdmJuUmxiblJjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdJQ0FnSUNsY2NseHVmVnh5WEc1Y2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQlNZV1JwYnlBOUlIdGNjbHh1SUNBZ0lIWnBaWGM2SUhadWIyUmxJRDArWEhKY2JpQWdJQ0FnSUNBZ2JTaGNJbkF1WTI5dWRISnZiRndpTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNWhkSFJ5Y3k1amFHOXBZMlZ6TG0xaGNDaHJJRDArWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdEtGd2liR0ZpWld3dWNtRmthVzljSWl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0S0Z3aWFXNXdkWFJiZEhsd1pUMG5jbUZrYVc4blhWd2lMQ0I3ZG1Gc2RXVTZJR3RiTUYwc0lHNWhiV1U2SUhadWIyUmxMbUYwZEhKekxtNWhiV1Y5S1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JyV3pGZFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDbGNjbHh1SUNBZ0lDQWdJQ0FwWEhKY2JuMWNjbHh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4dVhHNWxlSEJ2Y25RZ1kyOXVjM1FnU1cxaFoyVWdQU0I3WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ1Y2JpQWdJQ0FnSUNBZ2JTZ25abWxuZFhKbExtbHRZV2RsSnl4Y2JpQWdJQ0FnSUNBZ0lDQWdJSHRqYkdGemN6b2dkbTV2WkdVdVlYUjBjbk11YzJsNlpTQS9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKMmx6TFNjZ0t5QjJibTlrWlM1aGRIUnljeTV6YVhwbElDc2dKM2duSUNzZ2RtNXZaR1V1WVhSMGNuTXVjMmw2WlNBNlhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0oybHpMU2NnS3lCMmJtOWtaUzVoZEhSeWN5NXlZWFJwYjMwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J0S0NkcGJXY25MQ0I3YzNKak9pQjJibTlrWlM1aGRIUnljeTV6Y21OOUtTbGNibjFjYmlJc0ltbHRjRzl5ZENCdElHWnliMjBnWENKdGFYUm9jbWxzWENKY2JtbHRjRzl5ZENCN0lHSjFiRzFwWm5rZ2ZTQm1jbTl0SUNjdUxpOWpiMjF0YjI0blhHNWNibVY0Y0c5eWRDQmpiMjV6ZENCT2IzUnBabWxqWVhScGIyNGdQU0I3WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ1Y2JpQWdJQ0FnSUNBZ2JTaGNJaTV1YjNScFptbGpZWFJwYjI1Y0lpd2dZblZzYldsbWVTaDJibTlrWlM1aGRIUnljeWtzWEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1aGRIUnljeTVrWld4bGRHVWdQMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzBvWENKaWRYUjBiMjR1WkdWc1pYUmxYQ0lzSUh0dmJtTnNhV05yT2lCMmJtOWtaUzVoZEhSeWN5NXZibU5zYVdOcmZTa2dPaUFuSnl4Y2JpQWdJQ0FnSUNBZ0lDQWdJSFp1YjJSbExtTm9hV3hrY21WdVhHNGdJQ0FnSUNBZ0lDbGNibjFjYmlJc0ltbHRjRzl5ZENCdElHWnliMjBnWENKdGFYUm9jbWxzWENKY2JtbHRjRzl5ZENCN0lHSjFiRzFwWm5rZ2ZTQm1jbTl0SUNjdUxpOWpiMjF0YjI0blhHNWNibVY0Y0c5eWRDQmpiMjV6ZENCUWNtOW5jbVZ6Y3lBOUlIdGNiaUFnSUNCMmFXVjNPaUIyYm05a1pTQTlQbHh1SUNBZ0lDQWdJQ0J0S0Z3aWNISnZaM0psYzNNdWNISnZaM0psYzNOY0lpd2dZblZzYldsbWVTaDJibTlrWlM1aGRIUnljeWtzWEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1amFHbHNaSEpsYmx4dUlDQWdJQ0FnSUNBcFhHNTlYRzRpTENKcGJYQnZjblFnYlNCbWNtOXRJRndpYldsMGFISnBiRndpWEhKY2JseHlYRzVjY2x4dVkyOXVjM1FnYjI1amJHbGpheUE5SUNoMmJtOWtaU3dnZG1Gc0tTQTlQbHh5WEc0Z0lDQWdLQ2tnUFQ0Z2UxeHlYRzRnSUNBZ0lDQWdJSEpsYzJWMEtIWnViMlJsTENCMllXd3BYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tIWnViMlJsTG1GMGRISnpMbTl1WTJ4cFkyc3BJSFp1YjJSbExtRjBkSEp6TG05dVkyeHBZMnNvZG1Gc0tWeHlYRzRnSUNBZ2ZWeHlYRzVjY2x4dVkyOXVjM1FnY21WelpYUWdQU0FvZG01dlpHVXNJSFpoYkNrZ1BUNGdlMXh5WEc0Z0lDQWdkbTV2WkdVdWMzUmhkR1V1WTNWeWNtVnVkQ0E5SUhaaGJGeHlYRzRnSUNBZ2JHVjBJRzFoZUY5aWRYUjBiMjV6SUQwZ2RtNXZaR1V1WVhSMGNuTXViV0Y0WDJKMWRIUnZibk1nZkh3Z01UQmNjbHh1SUNBZ0lHeGxkQ0J1WWlBOUlIWnViMlJsTG1GMGRISnpMbTVpWEhKY2JpQWdJQ0JwWmlBb2JtSWdQaUJ0WVhoZlluVjBkRzl1Y3lrZ2UxeHlYRzRnSUNBZ0lDQWdJR3hsZENCdGFXUWdQU0J1WWlBdklESmNjbHh1SUNBZ0lDQWdJQ0JwWmlBb1d6RXNJREpkTG1sdVkyeDFaR1Z6S0haaGJDa3BJSFp1YjJSbExuTjBZWFJsTG1KMWRIUnZibk1nUFNCYk1Td2dNaXdnTXl3Z2JuVnNiQ3dnYldsa0xDQnVkV3hzTENCdVlsMWNjbHh1SUNBZ0lDQWdJQ0JsYkhObElHbG1JQ2hiYm1JdE1Td2dibUpkTG1sdVkyeDFaR1Z6S0haaGJDa3BJSFp1YjJSbExuTjBZWFJsTG1KMWRIUnZibk1nUFNCYk1Td2diblZzYkN3Z2JXbGtMQ0J1ZFd4c0xDQnVZaTB5TENCdVlpMHhMQ0J1WWwxY2NseHVJQ0FnSUNBZ0lDQmxiSE5sSUhadWIyUmxMbk4wWVhSbExtSjFkSFJ2Ym5NZ1BTQmJNU3dnYm5Wc2JDd2dkbUZzSUMwZ01Td2dkbUZzTENCMllXd2dLeUF4TENCdWRXeHNMQ0J1WWwxY2NseHVJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVZblYwZEc5dWN5QTlJRnRkWEhKY2JpQWdJQ0FnSUNBZ1ptOXlJQ2hzWlhRZ2FTQTlJREU3SUdrZ1BEMGdibUk3SUdrckt5a2dkbTV2WkdVdWMzUmhkR1V1WW5WMGRHOXVjeTV3ZFhOb0tHa3BYSEpjYmlBZ0lDQjlYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQlFZV2RwYm1GMGFXOXVJRDBnZTF4eVhHNGdJQ0FnYjI1cGJtbDBPaUIyYm05a1pTQTlQaUJ5WlhObGRDaDJibTlrWlN3Z2RtNXZaR1V1WVhSMGNuTXVZM1Z5Y21WdWRDQjhmQ0F4S1N4Y2NseHVYSEpjYmlBZ0lDQjJhV1YzT2lCMmJtOWtaU0E5UGlCdEtDZHVZWFl1Y0dGbmFXNWhkR2x2Ymljc1hISmNiaUFnSUNBZ0lDQWdiU2duWVM1d1lXZHBibUYwYVc5dUxYQnlaWFpwYjNWekp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2UyOXVZMnhwWTJzNklHOXVZMnhwWTJzb2RtNXZaR1VzSUhadWIyUmxMbk4wWVhSbExtTjFjbkpsYm5RZ0xTQXhLU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdScGMyRmliR1ZrT2lCMmJtOWtaUzV6ZEdGMFpTNWpkWEp5Wlc1MElEMDlQU0F4ZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZG01dlpHVXVZWFIwY25NdWNISmxkbWx2ZFhOZmRHVjRkQ0I4ZkNBblVISmxkbWx2ZFhNbktTeGNjbHh1SUNBZ0lDQWdJQ0J0S0NkaExuQmhaMmx1WVhScGIyNHRibVY0ZENjc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUh0dmJtTnNhV05yT2lCdmJtTnNhV05yS0hadWIyUmxMQ0IyYm05a1pTNXpkR0YwWlM1amRYSnlaVzUwSUNzZ01Ta3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrYVhOaFlteGxaRG9nZG01dlpHVXVjM1JoZEdVdVkzVnljbVZ1ZENBOVBUMGdkbTV2WkdVdWMzUmhkR1V1WW5WMGRHOXVjeTVzWlc1bmRHaDlMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1aGRIUnljeTV1WlhoMFgzUmxlSFFnZkh3Z0owNWxlSFFuS1N4Y2NseHVJQ0FnSUNBZ0lDQnRLQ2QxYkM1d1lXZHBibUYwYVc5dUxXeHBjM1FuTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNXpkR0YwWlM1aWRYUjBiMjV6TG0xaGNDaDJZV3dnUFQ0Z2RtRnNJRDA5UFNCdWRXeHNJRDljY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb0oyeHBKeXdnYlNnbmMzQmhiaTV3WVdkcGJtRjBhVzl1TFdWc2JHbHdjMmx6Snl3Z2JTNTBjblZ6ZENnbkptaGxiR3hwY0RzbktTa3BJRHBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb0oyeHBKeXdnYlNnbllTNXdZV2RwYm1GMGFXOXVMV3hwYm1zbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyeGhjM002SUhadWIyUmxMbk4wWVhSbExtTjFjbkpsYm5RZ1BUMDlJSFpoYkNBL0lDZHBjeTFqZFhKeVpXNTBKeUE2SUc1MWJHd3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzl1WTJ4cFkyczZJRzl1WTJ4cFkyc29kbTV2WkdVc0lIWmhiQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlMQ0IyWVd3cEtWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBcFhISmNiaUFnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjYm1sdGNHOXlkQ0I3SUdOdmJHeGxZM1JmWW05dmJHVmhiaUI5SUdaeWIyMGdKeTR1TDJOdmJXMXZiaWRjYm1sdGNHOXlkQ0I3SUZCaFoybHVZWFJwYjI0Z2ZTQm1jbTl0SUNjdUxpOWpiMjF3YjI1bGJuUnpMM0JoWjJsdVlYUnBiMjR1YW5NblhHNWNibU52Ym5OMElGTlVXVXhGVXlBOUlGc25ZbTl5WkdWeVpXUW5MQ0FuYzNSeWFYQmxaQ2NzSUNkdVlYSnliM2NuWFZ4dVhHNWpiMjV6ZENCb1pXRmtaWEpmWTI5c0lEMGdLSFp1YjJSbExDQnBkR1Z0TENCcFpIZ3BJRDArSUh0Y2JpQWdJQ0JzWlhRZ2QyRjVJRDBnS0dsa2VDQTlQVDBnZG01dlpHVXVjM1JoZEdVdWMyOXlkRjlpZVNrZ1AxeHVJQ0FnSUNBZ0lDQW9kbTV2WkdVdWMzUmhkR1V1YzI5eWRGOWhjMk1nUHlBbklGVW5JRG9nSnlCRUp5a2dPaUFuSjF4dUlDQWdJSEpsZEhWeWJpQnBkR1Z0TG01aGJXVWdLeUIzWVhsY2JuMWNibHh1WEc1amIyNXpkQ0IwYUY5MFppQTlJQ2gyYm05a1pTd2dkR0ZuS1NBOVBseHVJQ0FnSUcwb2RHRm5JRDA5UFNBbmFHVmhaR1Z5SnlBL0lDZDBhR1ZoWkNjZ09pQW5kR1p2YjNRbkxGeHVJQ0FnSUNBZ0lDQnRLQ2QwY2ljc1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNWhkSFJ5YzF0MFlXZGRMbTFoY0Nnb2FYUmxiU3dnYVdSNEtTQTlQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzBvSjNSb0p5d2dlMjl1WTJ4cFkyczZJR2wwWlcwdWMyOXlkR0ZpYkdVZ1B5QnpiM0owYUdGdVpHeGxjaWgyYm05a1pTd2dhV1I0S1RvZ2JuVnNiSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbDBaVzB1ZEdsMGJHVWdQMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duWVdKaWNpY3NJSHQwYVhSc1pUb2dhWFJsYlM1MGFYUnNaWDBzSUdobFlXUmxjbDlqYjJ3b2RtNXZaR1VzSUdsMFpXMHNJR2xrZUNrcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBNklHaGxZV1JsY2w5amIyd29kbTV2WkdVc0lHbDBaVzBzSUdsa2VDa3BYRzRnSUNBZ0lDQWdJQ0FnSUNBcFhHNGdJQ0FnSUNBZ0lDbGNiaUFnSUNBcFhHNWNibU52Ym5OMElHTnZiWEJoY21GMGIzSWdQU0JwWkhnZ1BUNWNiaUFnSUNBb1lTd2dZaWtnUFQ0Z2UxeHVJQ0FnSUNBZ2FXWWdLR0ZiYVdSNFhTQThJR0piYVdSNFhTbGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlDMHhYRzRnSUNBZ0lDQnBaaUFvWVZ0cFpIaGRJRDRnWWx0cFpIaGRLVnh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdNVnh1SUNBZ0lDQWdjbVYwZFhKdUlEQmNiaUFnSUNCOVhHNWNibU52Ym5OMElITnZjblJvWVc1a2JHVnlJRDBnS0hadWIyUmxMQ0JwWkhncElEMCtYRzRnSUNBZ0tDa2dQVDRnZTF4dUlDQWdJQ0FnSUNCcFppQW9kbTV2WkdVdWMzUmhkR1V1YzI5eWRGOWllU0E5UFQwZ2FXUjRLVnh1SUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVjMjl5ZEY5aGMyTWdQU0FoSUhadWIyUmxMbk4wWVhSbExuTnZjblJmWVhOalhHNGdJQ0FnSUNBZ0lHVnNjMlZjYmlBZ0lDQWdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbk52Y25SZllYTmpJRDBnZEhKMVpWeHVYRzRnSUNBZ0lDQWdJSFp1YjJSbExuTjBZWFJsTG5OdmNuUmZZbmtnUFNCcFpIaGNiaUFnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1Y205M2N5NXpiM0owS0dOdmJYQmhjbUYwYjNJb2FXUjRLU2xjYmlBZ0lDQWdJQ0FnYVdZZ0tDRWdkbTV2WkdVdWMzUmhkR1V1YzI5eWRGOWhjMk1wWEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1emRHRjBaUzV5YjNkekxuSmxkbVZ5YzJVb0tWeHVJQ0FnSUgxY2JseHVaWGh3YjNKMElHTnZibk4wSUZSaFlteGxJRDBnZTF4dVhHNGdJQ0FnYjI1cGJtbDBPaUIyYm05a1pTQTlQaUI3WEc0Z0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExuTnZjblJmWW5rZ1BTQnVkV3hzWEc0Z0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExuTnZjblJmWVhOaklEMGdkSEoxWlZ4dUlDQWdJQ0FnSUNCMmJtOWtaUzV6ZEdGMFpTNXliM2R6SUQwZ2RtNXZaR1V1WVhSMGNuTXVjbTkzYzF4dUlDQWdJQ0FnSUNCcFppQW9kbTV2WkdVdVlYUjBjbk11Y0dGbmFXNWhkR1ZmWW5rcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG01dlpHVXVjM1JoZEdVdWNHRm5aU0E5SURGY2JpQWdJQ0FnSUNBZ0lDQWdJSFp1YjJSbExuTjBZWFJsTG5OMFlYSjBYMkYwSUQwZ01GeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR1ZzYzJWY2JpQWdJQ0FnSUNBZ0lDQWdJSFp1YjJSbExuTjBZWFJsTG1ScGMzQnNZWGxmY205M2N5QTlJSFp1YjJSbExtRjBkSEp6TG5KdmQzTmNiaUFnSUNCOUxGeHVYRzRnSUNBZ2RtbGxkem9nZG01dlpHVWdQVDRnVzF4dUlDQWdJQ0FnSUNCdEtDZDBZV0pzWlM1MFlXSnNaU2NzSUh0amJHRnpjem9nWTI5c2JHVmpkRjlpYjI5c1pXRnVLSFp1YjJSbExtRjBkSEp6TENCVFZGbE1SVk1wZlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG1obFlXUmxjaUEvSUhSb1gzUm1LSFp1YjJSbExDQW5hR1ZoWkdWeUp5a2dPaUJ1ZFd4c0xGeHVJQ0FnSUNBZ0lDQWdJQ0FnZG01dlpHVXVZWFIwY25NdVptOXZkR1Z5SUQ4Z2RHaGZkR1lvZG01dlpHVXNJQ2RtYjI5MFpYSW5LU0E2SUc1MWJHd3NYRzRnSUNBZ0lDQWdJQ0FnSUNCdEtDZDBZbTlrZVNjc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVjbTkzY3k1emJHbGpaU2hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVjM1JoY25SZllYUXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExuTjBZWEowWDJGMElDc2dkbTV2WkdVdVlYUjBjbk11Y0dGbmFXNWhkR1ZmWW5rcExtMWhjQ2h5YjNjZ1BUNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYlNnbmRISW5MQ0J5YjNjdWJXRndLR052YkNBOVBpQnRLQ2QwWkNjc0lHTnZiQ2twS1Z4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNsY2JpQWdJQ0FnSUNBZ0lDQWdLVnh1SUNBZ0lDQWdJQ0FwTEZ4dVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbkJoWjJsdVlYUmxYMko1SUQ5Y2JpQWdJQ0FnSUNBZ0lDQWdJRzBvVUdGbmFXNWhkR2x2Yml4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzVpT2lCTllYUm9MbU5sYVd3b2RtNXZaR1V1YzNSaGRHVXVjbTkzY3k1c1pXNW5kR2dnTHlCMmJtOWtaUzVoZEhSeWN5NXdZV2RwYm1GMFpWOWllU2tzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHOXVZMnhwWTJzNklHNWlJRDArSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExuQmhaMlVnUFNCdVlseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVjM1JoY25SZllYUWdQU0J1WWlBOVBUMGdNU0EvSURBZ09pQW9LRzVpSUMweEtTQXFJSFp1YjJSbExtRjBkSEp6TG5CaFoybHVZWFJsWDJKNUtWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdLU0E2SUc1MWJHeGNiaUFnSUNCZFhHNTlYRzRpTENKcGJYQnZjblFnYlNCbWNtOXRJRndpYldsMGFISnBiRndpWEhKY2JtbHRjRzl5ZENCN0lHSjFiRzFwWm5rZ2ZTQm1jbTl0SUNjdUxpOWpiMjF0YjI0blhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdWR0ZuSUQwZ2UxeHlYRzRnSUNBZ2RtbGxkem9nS0hadWIyUmxLU0E5UGlCdEtDZHpjR0Z1TG5SaFp5Y3NJR0oxYkcxcFpua29kbTV2WkdVdVlYUjBjbk1wTENCMmJtOWtaUzVqYUdsc1pISmxiaWxjY2x4dWZWeHlYRzRpTENKcGJYQnZjblFnYlNCbWNtOXRJRndpYldsMGFISnBiRndpWEc1Y2JseHVaWGh3YjNKMElHTnZibk4wSUZScGRHeGxJRDBnZTF4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duYUNjZ0t5QjJibTlrWlM1aGRIUnljeTV6YVhwbElDc2dKeTUwYVhSc1pTY2dLeUFuTG1sekxTY2dLeUIyYm05a1pTNWhkSFJ5Y3k1emFYcGxMQ0IyYm05a1pTNWphR2xzWkhKbGJpbGNibjFjYmx4dVhHNWxlSEJ2Y25RZ1kyOXVjM1FnVTNWaVZHbDBiR1VnUFNCN1hHNGdJQ0FnZG1sbGR6b2dLSFp1YjJSbEtTQTlQaUJ0S0Nkb0p5QXJJSFp1YjJSbExtRjBkSEp6TG5OcGVtVWdLeUFuTG5OMVluUnBkR3hsSnlBcklDY3VhWE10SnlBcklIWnViMlJsTG1GMGRISnpMbk5wZW1Vc0lIWnViMlJsTG1Ob2FXeGtjbVZ1S1Z4dWZWeHVJaXdpYVcxd2IzSjBJRzBnWm5KdmJTQmNJbTFwZEdoeWFXeGNJbHh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUVOdmJuUmxiblFnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZG01dlpHVXBJRDArWEhKY2JpQWdJQ0FnSUNBZ2JTZ25ZMjl1ZEdWdWRDY3NJSHRqYkdGemN6b2dkbTV2WkdVdVlYUjBjbk11YzJsNlpTQS9JQ2RwY3kwbklDc2dkbTV2WkdVdVlYUjBjbk11YzJsNlpTQTZJQ2NuZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZG01dlpHVXVZMmhwYkdSeVpXNWNjbHh1SUNBZ0lDQWdJQ0FwWEhKY2JuMWNjbHh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFeGxkbVZzSUQwZ2UxeHlYRzRnSUNBZ2RtbGxkem9nS0hadWIyUmxLU0E5UGlCdEtDZHVZWFl1YkdWMlpXd25MRnh5WEc0Z0lDQWdJQ0FnSUhzbmFYTXRiVzlpYVd4bEp6b2dkbTV2WkdVdVlYUjBjbk11Ylc5aWFXeGxmU3dnZG01dlpHVXVZMmhwYkdSeVpXNHBYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQk1aWFpsYkV4bFpuUWdQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQW9kbTV2WkdVcElEMCtJRzBvSjJScGRpNXNaWFpsYkMxc1pXWjBKeXdnZG01dlpHVXVZMmhwYkdSeVpXNHBYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQk1aWFpsYkZKcFoyaDBJRDBnZTF4eVhHNGdJQ0FnZG1sbGR6b2dLSFp1YjJSbEtTQTlQaUJ0S0Nka2FYWXViR1YyWld3dGNtbG5hSFFuTENCMmJtOWtaUzVqYUdsc1pISmxiaWxjY2x4dWZWeHlYRzVjY2x4dVpYaHdiM0owSUdOdmJuTjBJRXhsZG1Wc1NYUmxiU0E5SUh0Y2NseHVJQ0FnSUhacFpYYzZJQ2gyYm05a1pTa2dQVDRnYlNnbmNDNXNaWFpsYkMxcGRHVnRKeXhjY2x4dUlDQWdJQ0FnSUNCN1kyeGhjM002SUhadWIyUmxMbUYwZEhKekxtTmxiblJsY21Wa0lEOGdKMmhoY3kxMFpYaDBMV05sYm5SbGNtVmtKem9nSnlkOUxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc1Y2NseHVJaXdpYVcxd2IzSjBJRzBnWm5KdmJTQmNJbTFwZEdoeWFXeGNJbHh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUUxbFpHbGhUR1ZtZENBOUlIdGNjbHh1SUNBZ0lIWnBaWGM2SUNoMmJtOWtaU2tnUFQ0Z2JTZ25abWxuZFhKbExtMWxaR2xoTFd4bFpuUW5MQ0IyYm05a1pTNWphR2xzWkhKbGJpbGNjbHh1ZlZ4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFMWxaR2xoUTI5dWRHVnVkQ0E5SUh0Y2NseHVJQ0FnSUhacFpYYzZJQ2gyYm05a1pTa2dQVDRnYlNnblpHbDJMbTFsWkdsaExXTnZiblJsYm5RbkxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUUxbFpHbGhVbWxuYUhRZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lBb2RtNXZaR1VwSUQwK0lHMG9KMlJwZGk1dFpXUnBZUzF5YVdkb2RDY3NJSFp1YjJSbExtTm9hV3hrY21WdUtWeHlYRzU5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1RXVmthV0VnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZG01dlpHVXBJRDArSUcwb0oyRnlkR2xqYkdVdWJXVmthV0VuTENCYlhISmNibHh5WEc0Z0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtbHRZV2RsSUQ5Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYlNoTlpXUnBZVXhsWm5Rc0lHMG9KM0F1YVcxaFoyVW5MQ0I3WTJ4aGMzTTZJQ2RwY3kwbklDc2dkbTV2WkdVdVlYUjBjbk11YVcxaFoyVXVjbUYwYVc5OUxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duYVcxbkp5d2dleWR6Y21Nbk9pQjJibTlrWlM1aGRIUnljeTVwYldGblpTNXpjbU45S1NrcElEb2dKeWNzWEhKY2JseHlYRzRnSUNBZ0lDQWdJRzBvVFdWa2FXRkRiMjUwWlc1MExDQjJibTlrWlM1amFHbHNaSEpsYmlrc1hISmNibHh5WEc0Z0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtSjFkSFJ2YmlBL0lHMG9UV1ZrYVdGU2FXZG9kQ3dnZG01dlpHVXVZWFIwY25NdVluVjBkRzl1S1NBNklDY25YSEpjYmlBZ0lDQmRLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dVhISmNibU52Ym5OMElHTnNhV05yYUdGdVpHeGxjaUE5SUNoemRHRjBaU3dnYVhSbGJTa2dQVDVjY2x4dUlDQWdJQ2dwSUQwK0lIdGNjbHh1SUNBZ0lDQWdJQ0J6ZEdGMFpTNXpaV3hsWTNSbFpDQTlJR2wwWlcwdWEyVjVYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tHbDBaVzB1ZFhKc0tTQmpiMjV6YjJ4bExteHZaeWduY21Wa2FYSmxZM1FnZEc4Z0p5QXJJR2wwWlcwdWRYSnNLVnh5WEc0Z0lDQWdJQ0FnSUdsbUlDaHBkR1Z0TG05dVkyeHBZMnNwSUdsMFpXMHViMjVqYkdsamF5aHBkR1Z0TG10bGVTbGNjbHh1SUNBZ0lIMWNjbHh1WEhKY2JseHlYRzVqYjI1emRDQk5aVzUxU1hSbGJTQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklIWnViMlJsSUQwK1hISmNiaUFnSUNBZ0lDQWdXMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2RoSnl3Z2UyOXVZMnhwWTJzNklHTnNhV05yYUdGdVpHeGxjaWgyYm05a1pTNWhkSFJ5Y3k1emRHRjBaU3dnZG01dlpHVXVZWFIwY25NdWNtOXZkQ2tzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamJHRnpjem9nZG01dlpHVXVZWFIwY25NdWMzUmhkR1V1YzJWc1pXTjBaV1FnUFQwOUlIWnViMlJsTG1GMGRISnpMbkp2YjNRdWEyVjVJRDhnWENKcGN5MWhZM1JwZG1WY0lpQTZJQ2NuZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbkp2YjNRdWJHRmlaV3dwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNWhkSFJ5Y3k1eWIyOTBMbWwwWlcxeklEOWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzBvSjNWc0p5d2dkbTV2WkdVdVlYUjBjbk11Y205dmRDNXBkR1Z0Y3k1dFlYQW9hWFJsYlNBOVBseHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb0oyeHBKeXdnYlNnbllTY3NJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJ4aGMzTTZJSFp1YjJSbExtRjBkSEp6TG5OMFlYUmxMbk5sYkdWamRHVmtJRDA5UFNCcGRHVnRMbXRsZVNBL0lGd2lhWE10WVdOMGFYWmxYQ0lnT2lBbkp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiMjVqYkdsamF6b2dZMnhwWTJ0b1lXNWtiR1Z5S0hadWIyUmxMbUYwZEhKekxuTjBZWFJsTENCcGRHVnRLWDBzSUdsMFpXMHViR0ZpWld3cEtTa3BYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E2SUNjblhISmNiaUFnSUNBZ0lDQWdYVnh5WEc1OVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdUV1Z1ZFNBOUlIdGNjbHh1SUNBZ0lHOXVhVzVwZERvZ2RtNXZaR1VnUFQ0Z2RtNXZaR1V1YzNSaGRHVWdQU0IyYm05a1pTNWhkSFJ5Y3l4Y2NseHVJQ0FnSUhacFpYYzZJSFp1YjJSbElEMCtJRzBvSjJGemFXUmxMbTFsYm5VbkxGeHlYRzRnSUNBZ0lDQWdJSFp1YjJSbExuTjBZWFJsTG1sMFpXMXpMbTFoY0NodFpXNTFJRDArSUZ0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYlNnbmNDNXRaVzUxTFd4aFltVnNKeXdnYldWdWRTNXNZV0psYkNrc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUcwb0ozVnNMbTFsYm5VdGJHbHpkQ2NzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdFpXNTFMbWwwWlcxekxtMWhjQ2hwZEdWdElEMCtYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JTZ25iR2tuTENCdEtFMWxiblZKZEdWdExDQjdjM1JoZEdVNklIWnViMlJsTG5OMFlYUmxMQ0J5YjI5ME9pQnBkR1Z0ZlNrcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDbGNjbHh1SUNBZ0lDQWdJQ0JkS1Z4eVhHNGdJQ0FnS1Z4eVhHNTlYSEpjYmlJc0ltbHRjRzl5ZENCdElHWnliMjBnWENKdGFYUm9jbWxzWENKY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQk5aWE56WVdkbElEMGdlMXh5WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ0Z2JTZ25ZWEowYVdOc1pTNXRaWE56WVdkbEp5eGNjbHh1SUNBZ0lDQWdJQ0I3WTJ4aGMzTTZJSFp1YjJSbExtRjBkSEp6TG1OdmJHOXlJRDhnSjJsekxTY2dLeUIyYm05a1pTNWhkSFJ5Y3k1amIyeHZjaUE2SUNjbmZTd2dXMXh5WEc0Z0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtaGxZV1JsY2lBL1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUcwb0p5NXRaWE56WVdkbExXaGxZV1JsY2ljc0lHMG9KM0FuTENCMmJtOWtaUzVoZEhSeWN5NW9aV0ZrWlhJcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbTV2WkdVdVlYUjBjbk11YjI1amJHOXpaU0EvSUcwb0oySjFkSFJ2Ymljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZTJOc1lYTnpPaUFuWkdWc1pYUmxKeXdnYjI1amJHbGphem9nZG01dlpHVXVZWFIwY25NdWIyNWpiRzl6WlgwcE9pQW5KeWxjY2x4dUlDQWdJQ0FnSUNBNklDY25MRnh5WEc0Z0lDQWdJQ0FnSUcwb0p5NXRaWE56WVdkbExXSnZaSGtuTENCMmJtOWtaUzVqYUdsc1pISmxiaWxjY2x4dUlDQWdJRjBwWEhKY2JuMWNjbHh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFMXZaR0ZzSUQwZ2UxeHlYRzRnSUNBZ2RtbGxkem9nZG01dlpHVWdQVDRnYlNnbkxtMXZaR0ZzSnl3Z2UyTnNZWE56T2lCMmJtOWtaUzVoZEhSeWN5NWhZM1JwZG1VZ1B5QW5hWE10WVdOMGFYWmxKem9nSnlkOUxDQmJYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHMG9KeTV0YjJSaGJDMWlZV05yWjNKdmRXNWtKeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzBvSnk1dGIyUmhiQzFqYjI1MFpXNTBKeXdnZG01dlpHVXVZMmhwYkdSeVpXNHBMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1aGRIUnljeTV2Ym1Oc2IzTmxJRDhnYlNnbkxtSjFkSFJ2Ymk1dGIyUmhiQzFqYkc5elpTY3NJSHR2Ym1Oc2FXTnJPaUIyYm05a1pTNWhkSFJ5Y3k1dmJtTnNiM05sZlNrNklDY25YSEpjYmlBZ0lDQmRLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dVhISmNibVY0Y0c5eWRDQmpiMjV6ZENCT1lYWWdQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQjJibTlrWlNBOVBpQnRLQ2R1WVhZdWJtRjJKeXdnVzF4eVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbXhsWm5RZ1B5QnRLQ2N1Ym1GMkxXeGxablFuTENCMmJtOWtaUzVoZEhSeWN5NXNaV1owTG0xaGNDaHBkR1Z0SUQwK0lHMG9KMkV1Ym1GMkxXbDBaVzBuTENCcGRHVnRLU2twSURvZ0p5Y3NYSEpjYmlBZ0lDQWdJQ0FnZG01dlpHVXVZWFIwY25NdVkyVnVkR1Z5SUQ4Z2JTZ25MbTVoZGkxalpXNTBaWEluTENCMmJtOWtaUzVoZEhSeWN5NWpaVzUwWlhJdWJXRndLR2wwWlcwZ1BUNGdiU2duWVM1dVlYWXRhWFJsYlNjc0lHbDBaVzBwS1NrZ09pQW5KeXhjY2x4dUlDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWN5NXlhV2RvZENBL0lHMG9KeTV1WVhZdGNtbG5hSFFuTENCMmJtOWtaUzVoZEhSeWN5NXlhV2RvZEM1dFlYQW9hWFJsYlNBOVBpQnRLQ2RoTG01aGRpMXBkR1Z0Snl3Z2FYUmxiU2twS1NBNklDY25YSEpjYmlBZ0lDQmRLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dWFXMXdiM0owSUhzZ1NXTnZiaUI5SUdaeWIyMGdKeTR1TDJWc1pXMWxiblJ6TDJsamIyNHVhbk1uWEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1EyRnlaRWx0WVdkbElEMGdlMXh5WEc0Z0lDQWdkbWxsZHpvZ0tIWnViMlJsS1NBOVBseHlYRzRnSUNBZ0lDQWdJRzBvSjJOaGNtUXRhVzFoWjJVbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdEtDZG1hV2QxY21VdWFXMWhaMlVuTENCN1kyeGhjM002SUNkcGN5MG5JQ3NnZG01dlpHVXVZWFIwY25NdWNtRjBhVzk5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JTZ25hVzFuSnl3Z2UzTnlZem9nZG01dlpHVXVZWFIwY25NdWMzSmpmU2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdJQ0FnSUNsY2NseHVmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUVOaGNtUklaV0ZrWlhJZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lBb2RtNXZaR1VwSUQwK0lHMG9KMmhsWVdSbGNpNWpZWEprTFdobFlXUmxjaWNzSUZ0Y2NseHVJQ0FnSUNBZ0lDQnRLQ2R3TG1OaGNtUXRhR1ZoWkdWeUxYUnBkR3hsSnl3Z2RtNXZaR1V1WVhSMGNuTXVkR2wwYkdVcExGeHlYRzRnSUNBZ0lDQWdJRzBvSjJFdVkyRnlaQzFvWldGa1pYSXRhV052Ymljc0lIWnViMlJsTG1GMGRISnpMbWxqYjI0cFhISmNiaUFnSUNCZEtWeHlYRzU5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1EyRnlaRVp2YjNSbGNpQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duWm05dmRHVnlMbU5oY21RdFptOXZkR1Z5Snl3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JEWVhKa1JtOXZkR1Z5U1hSbGJTQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duWVM1allYSmtMV1p2YjNSbGNpMXBkR1Z0Snl3Z2RtNXZaR1V1WVhSMGNuTXBYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQkRZWEprUTI5dWRHVnVkQ0E5SUh0Y2NseHVJQ0FnSUhacFpYYzZJSFp1YjJSbElEMCtJRzBvSnk1allYSmtMV052Ym5SbGJuUW5MQ0IyYm05a1pTNWphR2xzWkhKbGJpbGNjbHh1ZlZ4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFTmhjbVFnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZG01dlpHVXBJRDArWEhKY2JpQWdJQ0FnSUNBZ2JTZ25MbU5oY21RbkxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc0aUxDSnBiWEJ2Y25RZ2JTQm1jbTl0SUZ3aWJXbDBhSEpwYkZ3aVhISmNibWx0Y0c5eWRDQjdJRWxqYjI0Z2ZTQm1jbTl0SUNjdUxpOWxiR1Z0Wlc1MGN5OXBZMjl1TG1wekoxeHlYRzVjY2x4dVkyOXVjM1FnYjI1amJHbGpheUE5SUNoMmJtOWtaU3dnYVhSbGJTd2dhV1I0S1NBOVBseHlYRzRnSUNBZ0tDa2dQVDRnZTF4eVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbUZqZEdsMlpTQTlJR2xrZUZ4eVhHNGdJQ0FnSUNBZ0lHbG1JQ2gyYm05a1pTNWhkSFJ5Y3k1dmJtTnNhV05yS1NCMmJtOWtaUzVoZEhSeWN5NXZibU5zYVdOcktHbDBaVzBwWEhKY2JpQWdJQ0I5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1ZHRmljMDFsYm5VZ1BTQjdYSEpjYmlBZ0lDQnZibWx1YVhRNklIWnViMlJsSUQwK0lIWnViMlJsTG5OMFlYUmxMbUZqZEdsMlpTQTlJSFp1YjJSbExtRjBkSEp6TG1GamRHbDJaU0I4ZkNBd0xGeHlYRzVjY2x4dUlDQWdJSFpwWlhjNklIWnViMlJsSUQwK0lHMG9KeTUwWVdKekp5d2diU2duZFd3bkxGeHlYRzRnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG1sMFpXMXpMbTFoY0Nnb2FYUmxiU3dnYVdSNEtTQTlQbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2RzYVNjc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyeGhjM002SUdsa2VDQTlQVDBnZG01dlpHVXVjM1JoZEdVdVlXTjBhWFpsSUQ4Z0oybHpMV0ZqZEdsMlpTY2dPaUJ1ZFd4c0xGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5dVkyeHBZMnM2SUc5dVkyeHBZMnNvZG01dlpHVXNJR2wwWlcwc0lHbGtlQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRLQ2RoSnl3Z2FYUmxiUzVwWTI5dUlEOGdXMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMG9KM053WVc0dWFXTnZiaTVwY3kxemJXRnNiQ2NzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duYVM1bVlTY3NJSHRqYkdGemN6b2dKMlpoTFNjZ0t5QnBkR1Z0TG1samIyNTlLU2tzSUcwb0ozTndZVzRuTENCcGRHVnRMbXhoWW1Wc0tWMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBNklHbDBaVzB1YkdGaVpXd3BYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDbGNjbHh1SUNBZ0lDQWdJQ0FwWEhKY2JpQWdJQ0FwS1Z4eVhHNTlYSEpjYmx4eVhHNWNjbHh1WTI5dWMzUWdZMnhwWTJ0b1lXNWtiR1Z5SUQwZ2RtNXZaR1VnUFQ1Y2NseHVJQ0FnSUdsMFpXMGdQVDRnZG01dlpHVXVjM1JoZEdVdVlXTjBhWFpsSUQwZ2FYUmxiUzVyWlhsY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQlVZV0p6SUQwZ2UxeHlYRzRnSUNBZ2IyNXBibWwwT2lCMmJtOWtaU0E5UGlCN1hISmNiaUFnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1WVdOMGFYWmxJRDBnZG01dlpHVXVZWFIwY25NdVlXTjBhWFpsSUh4OElEQmNjbHh1SUNBZ0lDQWdJQ0IyYm05a1pTNXpkR0YwWlM1cGRHVnRjeUE5SUhadWIyUmxMbUYwZEhKekxtbDBaVzF6TG0xaGNDZ29hWFJsYlN3Z2FXUjRLU0E5UGlCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpXMHVhMlY1SUQwZ2FXUjRYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCcGRHVnRYSEpjYmlBZ0lDQWdJQ0FnZlNsY2NseHVJQ0FnSUgwc1hISmNibHh5WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ1Y2NseHVJQ0FnSUNBZ0lDQnRLQ2RrYVhZbkxDQjdjM1I1YkdVNklIdGthWE53YkdGNU9pQW5abXhsZUNjc0lHWnNaWGc2SUNjeEp5d2dkMmxrZEdnNklDY3hNREFsSnl3Z0oyWnNaWGd0WkdseVpXTjBhVzl1SnpvZ0oyTnZiSFZ0YmlkOWZTd2dXMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLRlJoWW5OTlpXNTFMQ0I3WVdOMGFYWmxPaUIyYm05a1pTNXpkR0YwWlM1aFkzUnBkbVVzSUc5dVkyeHBZMnM2SUdOc2FXTnJhR0Z1Wkd4bGNpaDJibTlrWlNrc0lHbDBaVzF6T2lCMmJtOWtaUzV6ZEdGMFpTNXBkR1Z0YzMwcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzV6ZEdGMFpTNXBkR1Z0Y3k1dFlYQW9hWFJsYlNBOVBseHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duWkdsMkp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCN2MzUjViR1U2SUh0a2FYTndiR0Y1T2lCcGRHVnRMbXRsZVNBOVBUMGdkbTV2WkdVdWMzUmhkR1V1WVdOMGFYWmxJRDhnSjJKc2IyTnJKem9nSjI1dmJtVW5MQ0FuYldGeVoybHVMV3hsWm5Rbk9pQW5NVEJ3ZUNkOWZTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGRHVnRMbU52Ym5SbGJuUmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdJQ0FnSUYwcFhISmNibHh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dWFXMXdiM0owSUhzZ1NXTnZiaUI5SUdaeWIyMGdKeTR1TDJWc1pXMWxiblJ6TDJsamIyNHVhbk1uWEhKY2JseHlYRzVqYjI1emRDQnZibU5zYVdOcklEMGdLSFp1YjJSbExDQnBkR1Z0TENCcFpIZ3BJRDArWEhKY2JpQWdJQ0FvS1NBOVBpQjdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tIWnViMlJsTG5OMFlYUmxMbUZqZEdsMlpTQTlQVDBnYVdSNEtTQjJibTlrWlM1emRHRjBaUzVoWTNScGRtVWdQU0J1ZFd4c1hISmNiaUFnSUNBZ0lDQWdaV3h6WlNCMmJtOWtaUzV6ZEdGMFpTNWhZM1JwZG1VZ1BTQnBaSGhjY2x4dUlDQWdJQ0FnSUNCcFppQW9kbTV2WkdVdVlYUjBjbk11YjI1amJHbGpheWtnZG01dlpHVXVZWFIwY25NdWIyNWpiR2xqYXlocGRHVnRLVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUZCaGJtVnNJRDBnZTF4eVhHNGdJQ0FnZG1sbGR6b2dkbTV2WkdVZ1BUNGdiU2duYm1GMkxuQmhibVZzSnl3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JRWVc1bGJFaGxZV1JwYm1jZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lCMmJtOWtaU0E5UGlCdEtDZHdMbkJoYm1Wc0xXaGxZV1JwYm1jbkxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUZCaGJtVnNWR0ZpY3lBOUlIdGNjbHh1SUNBZ0lHOXVhVzVwZERvZ2RtNXZaR1VnUFQ0Z2RtNXZaR1V1YzNSaGRHVXVZV04wYVhabElEMGdkbTV2WkdVdVlYUjBjbk11WVdOMGFYWmxJSHg4SUc1MWJHd3NYSEpjYmx4eVhHNGdJQ0FnZG1sbGR6b2dkbTV2WkdVZ1BUNGdiU2duTG5CaGJtVnNMWFJoWW5NbkxGeHlYRzRnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG1sMFpXMXpMbTFoY0Nnb2FYUmxiU3dnYVdSNEtTQTlQbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2RoSnl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamJHRnpjem9nYVdSNElEMDlQU0IyYm05a1pTNXpkR0YwWlM1aFkzUnBkbVVnUHlBbmFYTXRZV04wYVhabEp5QTZJRzUxYkd3c1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYjI1amJHbGphem9nYjI1amJHbGpheWgyYm05a1pTd2dhWFJsYlN3Z2FXUjRLVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z2FYUmxiUzVzWVdKbGJGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBcFhISmNiaUFnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdLVnh5WEc1OVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdVR0Z1Wld4Q2JHOWpheUE5SUh0Y2NseHVJQ0FnSUhacFpYYzZJSFp1YjJSbElEMCtJRzBvSnk1d1lXNWxiQzFpYkc5amF5Y3NJSFp1YjJSbExtTm9hV3hrY21WdUtWeHlYRzU5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1VHRnVaV3hDYkc5amEzTWdQU0I3WEhKY2JpQWdJQ0J2Ym1sdWFYUTZJSFp1YjJSbElEMCtJSFp1YjJSbExuTjBZWFJsTG1GamRHbDJaU0E5SUhadWIyUmxMbUYwZEhKekxtRmpkR2wyWlNCOGZDQnVkV3hzTEZ4eVhHNWNjbHh1SUNBZ0lIWnBaWGM2SUhadWIyUmxJRDArSUhadWIyUmxMbUYwZEhKekxtbDBaVzF6TG0xaGNDZ29hWFJsYlN3Z2FXUjRLU0E5UGx4eVhHNGdJQ0FnSUNBZ0lHMG9KMkV1Y0dGdVpXd3RZbXh2WTJzbkxDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYkdGemN6b2dhV1I0SUQwOVBTQjJibTlrWlM1emRHRjBaUzVoWTNScGRtVWdQeUFuYVhNdFlXTjBhWFpsSnlBNklHNTFiR3dzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJtTnNhV05yT2lCdmJtTnNhV05yS0hadWIyUmxMQ0JwZEdWdExDQnBaSGdwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBzSUZ0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYlNnbmMzQmhiaTV3WVc1bGJDMXBZMjl1Snl3Z2JTZ25hUzVtWVNjc0lIdGpiR0Z6Y3pvZ0oyWmhMU2NnS3lCcGRHVnRMbWxqYjI1OUtTa3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbDBaVzB1YkdGaVpXeGNjbHh1SUNBZ0lDQWdJQ0JkS1Z4eVhHNGdJQ0FnS1Z4eVhHNTlYSEpjYmlKZExDSnVZVzFsY3lJNld5SmpiMjV6ZENJc0lteGxkQ0lzSW05dVkyeHBZMnNpTENKamJHbGphMmhoYm1Sc1pYSWlYU3dpYldGd2NHbHVaM01pT2lJN08wRkJSVTlCTEVsQlFVMHNSMEZCUnl4SFFVRkhPMGxCUTJZc1NVRkJTU3hGUVVGRkxGVkJRVU1zUzBGQlN5eEZRVUZGTEZOQlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVRTdRMEZETjBNc1EwRkJRVHM3UVVOSVRVRXNTVUZCVFN4TlFVRk5MRWRCUVVjc1EwRkJReXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4UFFVRlBMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVUU3UVVGRGFrVXNRVUZCVDBFc1NVRkJUU3hOUVVGTkxFZEJRVWNzUTBGQlF5eFRRVUZUTEVWQlFVVXNUVUZCVFN4RlFVRkZMRk5CUVZNc1JVRkJSU3hUUVVGVExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVRTdRVUZEZWtVc1FVRkJUMEVzU1VGQlRTeExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUVRzN08wRkJSM0pFTEVGQlFVOUJMRWxCUVUwc1YwRkJWeXhIUVVGSExGVkJRVU1zUzBGQlN5eEZRVUZGTzBsQlF5OUNReXhKUVVGSkxFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVRTdTVUZEYUVJc1NVRkJTU3hMUVVGTExFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVRXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkJMRVZCUVVFN1NVRkRiRVFzU1VGQlNTeExRVUZMTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVFc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGQkxFVkJRVUU3U1VGRGJFUXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVUVzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZCTEVWQlFVRTdTVUZEYUVRc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVRXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlFTeEZRVUZCTzBsQlF6ZERMRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVUVzUlVGQlFUdEpRVU0zUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlFTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGQkxFVkJRVUU3TzBsQlJUZERMRTlCUVU4c1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTTdRMEZETTBJc1EwRkJRVHM3TzBGQlIwUXNRVUZCVDBRc1NVRkJUU3hQUVVGUExFZEJRVWNzVlVGQlF5eExRVUZMTEVWQlFVVTdTVUZETTBKRExFbEJRVWtzVDBGQlR5eEhRVUZITEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRVHRKUVVOb1EwRXNTVUZCU1N4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGQk8wbEJRMnhDTEVsQlFVa3NUMEZCVHl4RlFVRkZMRVZCUVVFc1UwRkJVeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFBRVUZQTEVOQlFVRXNSVUZCUVR0SlFVTjBReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGQkxFZEJRVWNzUlVGQlF6dFJRVU16UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNVMEZCVXp0WlFVTndReXhOUVVGTkxFVkJRVVVzVTBGQlV5eEZRVUZGTEZOQlFWTXNSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpWRUxFVkJRVUVzVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlFTeEZRVUZCTzB0QlEyeERMRU5CUVVNc1EwRkJRVHRKUVVOR0xFOUJRVThzVTBGQlV6dERRVU51UWl4RFFVRkJPenRCUVVWRUxFRkJRVTlFTEVsQlFVMHNaVUZCWlN4SFFVRkhMRlZCUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJUdEpRVU14UTBNc1NVRkJTU3hOUVVGTkxFZEJRVWNzUlVGQlJTeERRVUZCTzBsQlEyWXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGQkxFbEJRVWtzUlVGQlF6dFJRVU5tTEVsQlFVa3NTVUZCU1N4SlFVRkpMRXRCUVVzc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NTVUZCU1R0WlFVTnlReXhGUVVGQkxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGQkxFVkJRVUU3UzBGRGFFTXNRMEZCUXl4RFFVRkJPME5CUTB3c1EwRkJRVHM3TzBGQlIwUXNRVUZCVDBRc1NVRkJUU3hMUVVGTExFZEJRVWNzVlVGQlF5eEpRVUZKTEVWQlFVVXNVMEZEZUVJc1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlF5eFBRVUZQTEVWQlFVVXNVMEZCUnl4VlFVRlZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eEhRVUZCTEVOQlFVTXNSMEZCUVN4RFFVRkJPenM3UVVGSGRrUXNRVUZCVDBFc1NVRkJUU3haUVVGWkxFZEJRVWNzVlVGQlF5eEZRVUZGTEVWQlFVVXNVMEZCUnl4RlFVRkZMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzVDBGQlR5eEhRVUZCTEVOQlFVRTdPMEZETVVONFJVRXNTVUZCVFN4SlFVRkpMRWRCUVVjN1NVRkRhRUlzU1VGQlNTeEZRVUZGTEZWQlFVTXNSMEZCUVN4RlFVRlRPMmRDUVVGU0xFdEJRVXM3TzIxQ1FVTlVMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNN1dVRkRlRVFzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTNwRE8wTkJRVUU3UTBGRFVpeERRVUZCT3p0QlEwaE5RU3hKUVVGTkxGZEJRVmNzUjBGQlJ5eFZRVUZETEV0QlFVc3NSVUZCUlN4VFFVRkhPMGxCUTJ4RExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZPMUZCUTI1Q0xFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRmxCUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRk8wbEJRMmhHTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTTdTVUZET1VJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFZRVUZWTzFGQlEyeENMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeEZRVUZGTEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZPME5CUTI1R0xFZEJRVUVzUTBGQlFUczdRVUZGUkN4QlFVRlBRU3hKUVVGTkxFMUJRVTBzUjBGQlJ6dEpRVU5zUWl4SlFVRkpMRVZCUVVVc1ZVRkJReXhMUVVGTExFVkJRVVVzVTBGQlJ5eERRVUZETEVOQlFVTXNWVUZCVlN4RlFVRkZMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETzFGQlF5OURMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkJPME5CUTI1RkxFTkJRVUU3TzBGRFdFMUJMRWxCUVUwc1MwRkJTeXhIUVVGSE8wbEJRMnBDTEVsQlFVa3NSVUZCUlN4VlFVRkRMRXRCUVVzc1JVRkJSU3hUUVVGSExFTkJRVU1zUTBGQlF5eGhRVUZoTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGQk8wTkJRM0JFTEVOQlFVRTdPMEZCUlVRc1FVRkJUMEVzU1VGQlRTeExRVUZMTEVkQlFVYzdTVUZEYWtJc1NVRkJTU3hGUVVGRkxGVkJRVU1zUzBGQlN5eEZRVUZGTEZOQlFVY3NRMEZCUXl4RFFVRkRMRmRCUVZjN1VVRkRNVUlzUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzZVVKQlFYbENMRWRCUVVjc1JVRkJSU3hGUVVGRk8xRkJRelZFTzFsQlEwa3NRMEZCUXl4RFFVRkRMSGRDUVVGM1FpeEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRGFrUXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUjBGQlJ5eEZRVUZGTzFOQlF6TkZPMHRCUTBvc1IwRkJRVHREUVVOS0xFTkJRVUU3TzBGQlJVUXNRVUZCVDBFc1NVRkJUU3hOUVVGTkxFZEJRVWM3U1VGRGJFSXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEZkQlFWYzdXVUZEVkN4RFFVRkRMRU5CUVVNc1lVRkJZU3hGUVVGRkxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVOcVF5eERRVUZETEVOQlFVTXNVVUZCVVR0dlFrRkRUaXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1ZVRkJRU3hEUVVGRExFVkJRVU1zVTBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZCTEVOQlFVTTdhVUpCUTJwRk8yRkJRMG83VTBGRFNpeEhRVUZCTzBOQlExSXNRMEZCUVRzN08wRkJSMFFzUVVGQlQwRXNTVUZCVFN4UlFVRlJMRWRCUVVjN1NVRkRjRUlzU1VGQlNTeEZRVUZGTEZWQlFVRXNTMEZCU3l4RlFVRkRMRk5CUTFJc1EwRkJReXhEUVVGRExGZEJRVmM3V1VGRFZDeERRVUZETEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVVzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRUUVVNdlF5eEhRVUZCTzBOQlExSXNRMEZCUVRzN08wRkJSMFFzUVVGQlQwRXNTVUZCVFN4UlFVRlJMRWRCUVVjN1NVRkRjRUlzU1VGQlNTeEZRVUZGTEZWQlFVRXNTMEZCU3l4RlFVRkRMRk5CUTFJc1EwRkJReXhEUVVGRExGZEJRVmM3V1VGRFZDeERRVUZETEVOQlFVTXNaMEpCUVdkQ08yZENRVU5rTEVOQlFVTXNRMEZCUXl4M1FrRkJkMElzUlVGQlJTeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8yZENRVU5xUkN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVTg3WVVGRGRFSTdVMEZEU2l4SFFVRkJPME5CUTFJc1EwRkJRVHM3TzBGQlIwUXNRVUZCVDBFc1NVRkJUU3hMUVVGTExFZEJRVWM3U1VGRGFrSXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEZkQlFWYzdXVUZEVkN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCUVN4RFFVRkRMRVZCUVVNc1UwRkRkRUlzUTBGQlF5eERRVUZETEdGQlFXRTdiMEpCUTFnc1EwRkJReXhEUVVGRExIRkNRVUZ4UWl4RlFVRkZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0dlFrRkRMMFFzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0cFFrRkRVQ3hIUVVGQk8yRkJRMG83VTBGRFNpeEhRVUZCTzBOQlExSXNRMEZCUVRzN1FVTjZSRTFCTEVsQlFVMHNTMEZCU3l4SFFVRkhPMGxCUTJwQ0xFbEJRVWtzUlVGQlJTeFZRVUZCTEV0QlFVc3NSVUZCUXl4VFFVTlNMRU5CUVVNc1EwRkJReXhqUVVGak8xbEJRMW9zUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSk8yZENRVU53UWl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNUdG5Ra0ZEYWtRc1MwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRPMWxCUXpsQ0xFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVFN1EwRkROVU1zUTBGQlFUczdRVU5PVFVFc1NVRkJUU3haUVVGWkxFZEJRVWM3U1VGRGVFSXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEdWQlFXVXNSVUZCUlN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF6dFpRVU51UXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTA3WjBKQlEyUXNRMEZCUXl4RFFVRkRMR1ZCUVdVc1JVRkJSU3hEUVVGRExFOUJRVThzUlVGQlJTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU16UkN4TFFVRkxMRU5CUVVNc1VVRkJVVHRUUVVOcVFpeEhRVUZCTzBOQlExSXNRMEZCUVRzN1FVTlFUVUVzU1VGQlRTeFJRVUZSTEVkQlFVYzdTVUZEY0VJc1NVRkJTU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlExSXNRMEZCUXl4RFFVRkRMRzFDUVVGdFFpeEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRE8xbEJRM1pETEV0QlFVc3NRMEZCUXl4UlFVRlJPMU5CUTJwQ0xFZEJRVUU3UTBGRFVpeERRVUZCT3p0QlEweEVRU3hKUVVGTkxFOUJRVThzUjBGQlJ5eFZRVUZETEV0QlFVc3NSVUZCUlN4SFFVRkhMRVZCUVVVc1UwRkRla0lzV1VGQlJ6dFJRVU5ETEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVUU3VVVGRGFrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZCTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZCTEVWQlFVRTdTMEZEY0VRc1IwRkJRU3hEUVVGQk96dEJRVVZNUVN4SlFVRk5MRXRCUVVzc1IwRkJSeXhWUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVWQlFVVTdTVUZEZGtJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSMEZCUnl4RFFVRkJPMGxCUTNwQ1F5eEpRVUZKTEZkQlFWY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExGZEJRVmNzU1VGQlNTeEZRVUZGTEVOQlFVRTdTVUZETDBOQkxFbEJRVWtzUlVGQlJTeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hEUVVGQk8wbEJRM1pDTEVsQlFVa3NSVUZCUlN4SFFVRkhMRmRCUVZjc1JVRkJSVHRSUVVOc1FrRXNTVUZCU1N4SFFVRkhMRWRCUVVjc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlFUdFJRVU5vUWl4SlFVRkpMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVRXNSVUZCUVR0aFFVTjZSU3hKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNSVUZCUVN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhGUVVGRkxFbEJRVWtzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVRXNSVUZCUVR0aFFVTjRSaXhGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFZEJRVWNzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRU3hGUVVGQk8wdEJRM2hGTEUxQlFVMDdVVUZEU0N4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVRTdVVUZEZUVJc1MwRkJTMEVzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCUVN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1JVRkJRVHRMUVVNMVJEdERRVU5LTEVOQlFVRTdPMEZCUlVRc1FVRkJUMFFzU1VGQlRTeFZRVUZWTEVkQlFVYzdTVUZEZEVJc1RVRkJUU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNTVUZCU1N4RFFVRkRMRU5CUVVNc1IwRkJRVHM3U1VGRmRrUXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRVWNzUTBGQlF5eERRVUZETEdkQ1FVRm5RanRSUVVNM1FpeERRVUZETEVOQlFVTXNkVUpCUVhWQ08xbEJRM0pDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTlCUVU4c1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTNoRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNZVUZCWVN4SlFVRkpMRlZCUVZVc1EwRkJRenRSUVVNMVF5eERRVUZETEVOQlFVTXNiVUpCUVcxQ08xbEJRMnBDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTlCUVU4c1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEV0QlFVc3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETzFsQlEycEZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVTBGQlV5eEpRVUZKTEUxQlFVMHNRMEZCUXp0UlFVTndReXhEUVVGRExFTkJRVU1zYjBKQlFXOUNPMWxCUTJ4Q0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGQkxFZEJRVWNzUlVGQlF5eFRRVUZITEVkQlFVY3NTMEZCU3l4SlFVRkpPMmRDUVVOMlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXd3UWtGQk1FSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpORUxFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRMRzFDUVVGdFFqdHZRa0ZEZWtJN2QwSkJRMGtzUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhMUVVGTExFZEJRVWNzUjBGQlJ5eFpRVUZaTEVkQlFVY3NTVUZCU1R0M1FrRkRlRVFzVDBGQlR5eEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhEUVVGRE8zRkNRVU12UWl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVUU3WVVGRFpqdFRRVU5LTzB0QlEwb3NSMEZCUVR0RFFVTktMRU5CUVVFN08wRkRNME5FUVN4SlFVRk5MRTFCUVUwc1IwRkJSeXhEUVVGRExGVkJRVlVzUlVGQlJTeFRRVUZUTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVFN08wRkJSV2hFUVN4SlFVRk5MRlZCUVZVc1IwRkJSeXhWUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVWQlFVVXNSMEZCUnl4RlFVRkZPMGxCUTJ4RFF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1MwRkJTeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTnVReXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlFVRTdTVUZETjBNc1QwRkJUeXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEVkQlFVYzdRMEZEZWtJc1EwRkJRVHM3TzBGQlIwUkVMRWxCUVUwc1MwRkJTeXhIUVVGSExGVkJRVU1zUzBGQlN5eEZRVUZGTEVkQlFVY3NSVUZCUlN4VFFVTjJRaXhEUVVGRExFTkJRVU1zUjBGQlJ5eExRVUZMTEZGQlFWRXNSMEZCUnl4UFFVRlBMRWRCUVVjc1QwRkJUenRSUVVOc1F5eERRVUZETEVOQlFVTXNTVUZCU1R0WlFVTkdMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzUlVGQlJTeFRRVU0zUWl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4UlFVRlJMRWRCUVVjc1YwRkJWeXhEUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNN2IwSkJRelZFTEVsQlFVa3NRMEZCUXl4TFFVRkxPM2RDUVVOT0xFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZET3pCQ1FVTXhSQ3hWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGQk8yRkJRekZETzFOQlEwbzdTMEZEU2l4SFFVRkJMRU5CUVVFN08wRkJSVXhCTEVsQlFVMHNWVUZCVlN4SFFVRkhMRlZCUVVFc1IwRkJSeXhGUVVGRExGTkJRMjVDTEZWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSVHROUVVOTUxFbEJRVWtzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU03VVVGRGFrSXNSVUZCUVN4UFFVRlBMRU5CUVVNc1EwRkJReXhGUVVGQk8wMUJRMWdzU1VGQlNTeERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF6dFJRVU5xUWl4RlFVRkJMRTlCUVU4c1EwRkJReXhGUVVGQk8wMUJRMVlzVDBGQlR5eERRVUZETzB0QlExUXNSMEZCUVN4RFFVRkJPenRCUVVWTVFTeEpRVUZOTEZkQlFWY3NSMEZCUnl4VlFVRkRMRXRCUVVzc1JVRkJSU3hIUVVGSExFVkJRVVVzVTBGRE4wSXNXVUZCUnp0UlFVTkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEV0QlFVc3NSMEZCUnp0WlFVTXpRaXhGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVRXNSVUZCUVRzN1dVRkZOME1zUlVGQlFTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVUVzUlVGQlFUczdVVUZGTDBJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSMEZCUnl4RFFVRkJPMUZCUTNwQ0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUVR0UlFVTjBReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJPMWxCUTNSQ0xFVkJRVUVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVUVzUlVGQlFUdExRVU5xUXl4SFFVRkJMRU5CUVVFN08wRkJSVXdzUVVGQlQwRXNTVUZCVFN4TFFVRkxMRWRCUVVjN08wbEJSV3BDTEUxQlFVMHNSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJRenRSUVVOV0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRVHRSUVVNeFFpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVUU3VVVGRE0wSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVFN1VVRkRia01zU1VGQlNTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVONFFpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVUU3V1VGRGNFSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFZEJRVWNzUTBGQlF5eERRVUZCTzFOQlF6TkNPenRaUVVWSExFVkJRVUVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4WlFVRlpMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVRXNSVUZCUVR0TFFVTnNSRHM3U1VGRlJDeEpRVUZKTEVWQlFVVXNWVUZCUVN4TFFVRkxMRVZCUVVNc1UwRkJSenRSUVVOWUxFTkJRVU1zUTBGQlF5eGhRVUZoTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1pVRkJaU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRNVVFzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTEVOQlFVTXNSMEZCUnl4SlFVRkpPMWxCUTJ4RUxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVVVzVVVGQlVTeERRVUZETEVkQlFVY3NTVUZCU1R0WlFVTnNSQ3hEUVVGRExFTkJRVU1zVDBGQlR6dG5Ra0ZEVEN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTzI5Q1FVTnNRaXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRTdiMEpCUTNCQ0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVVFc1IwRkJSeXhGUVVGRExGTkJRM2hFTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEVkQlFVY3NSVUZCUXl4VFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUjBGQlJ5eERRVUZETEVkQlFVRXNRMEZCUXl4RFFVRkRMRWRCUVVFN2FVSkJRM2hETzFsQlEwdzdVMEZEU0RzN1VVRkZSQ3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZkQlFWYzdXVUZEYmtJc1EwRkJReXhEUVVGRExGVkJRVlU3WjBKQlExSTdiMEpCUTBrc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRE8yOUNRVU5vUlN4UFFVRlBMRVZCUVVVc1ZVRkJRU3hGUVVGRkxFVkJRVU03ZDBKQlExSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzUlVGQlJTeERRVUZCTzNkQ1FVTnlRaXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4RlFVRkZMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVFN2NVSkJRelZGTzJsQ1FVTktPMkZCUTBvc1IwRkJSeXhKUVVGSk8wdEJRMllzUjBGQlFUdERRVU5LTEVOQlFVRTdPMEZEYkVaTlFTeEpRVUZOTEVkQlFVY3NSMEZCUnp0SlFVTm1MRWxCUVVrc1JVRkJSU3hWUVVGRExFdEJRVXNzUlVGQlJTeFRRVUZITEVOQlFVTXNRMEZCUXl4VlFVRlZMRVZCUVVVc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVUU3UTBGRGRrVXNRMEZCUVRzN1FVTkdUVUVzU1VGQlRTeExRVUZMTEVkQlFVYzdTVUZEYWtJc1NVRkJTU3hGUVVGRkxGVkJRVU1zUzBGQlN5eEZRVUZGTEZOQlFVY3NRMEZCUXl4RFFVRkRMRWRCUVVjc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4UlFVRlJMRWRCUVVjc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlFUdERRVU53Unl4RFFVRkJPenM3UVVGSFJDeEJRVUZQUVN4SlFVRk5MRkZCUVZFc1IwRkJSenRKUVVOd1FpeEpRVUZKTEVWQlFVVXNWVUZCUXl4TFFVRkxMRVZCUVVVc1UwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExGZEJRVmNzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkJPME5CUTNaSExFTkJRVUU3TzBGRFVrMUJMRWxCUVUwc1QwRkJUeXhIUVVGSE8wbEJRMjVDTEVsQlFVa3NSVUZCUlN4VlFVRkRMRXRCUVVzc1JVRkJSU3hUUVVOV0xFTkJRVU1zUTBGQlF5eFRRVUZUTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTnNSU3hMUVVGTExFTkJRVU1zVVVGQlVUdFRRVU5xUWl4SFFVRkJPME5CUTFJc1EwRkJRVHM3UVVOTVRVRXNTVUZCVFN4TFFVRkxMRWRCUVVjN1NVRkRha0lzU1VGQlNTeEZRVUZGTEZWQlFVTXNTMEZCU3l4RlFVRkZMRk5CUVVjc1EwRkJReXhEUVVGRExGZEJRVmM3VVVGRE1VSXNRMEZCUXl4WFFVRlhMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVUU3UTBGRGVrUXNRMEZCUVRzN1FVRkZSQ3hCUVVGUFFTeEJRVVZPT3p0QlFVVkVMRUZCUVU5QkxFRkJSVTQ3TzBGQlJVUXNRVUZCVDBFc1NVRkJUU3hUUVVGVExFZEJRVWM3U1VGRGNrSXNTVUZCU1N4RlFVRkZMRlZCUVVNc1MwRkJTeXhGUVVGRkxGTkJRVWNzUTBGQlF5eERRVUZETEdOQlFXTTdVVUZETjBJc1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc2JVSkJRVzFDTEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZCTzBOQlF5OUZMRU5CUVVFN08wRkRhRUpOUVN4SlFVRk5MRk5CUVZNc1IwRkJSenRKUVVOeVFpeEpRVUZKTEVWQlFVVXNWVUZCUXl4TFFVRkxMRVZCUVVVc1UwRkJSeXhEUVVGRExFTkJRVU1zYlVKQlFXMUNMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZCTzBOQlF6RkVMRU5CUVVFN08wRkJSVVFzUVVGQlQwRXNTVUZCVFN4WlFVRlpMRWRCUVVjN1NVRkRlRUlzU1VGQlNTeEZRVUZGTEZWQlFVTXNTMEZCU3l4RlFVRkZMRk5CUVVjc1EwRkJReXhEUVVGRExHMUNRVUZ0UWl4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlFUdERRVU14UkN4RFFVRkJPenRCUVVWRUxFRkJRVTlCTEVsQlFVMHNWVUZCVlN4SFFVRkhPMGxCUTNSQ0xFbEJRVWtzUlVGQlJTeFZRVUZETEV0QlFVc3NSVUZCUlN4VFFVRkhMRU5CUVVNc1EwRkJReXhwUWtGQmFVSXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVUU3UTBGRGVFUXNRMEZCUVRzN1FVRkZSQ3hCUVVGUFFTeEpRVUZOTEV0QlFVc3NSMEZCUnp0SlFVTnFRaXhKUVVGSkxFVkJRVVVzVlVGQlF5eExRVUZMTEVWQlFVVXNVMEZCUnl4RFFVRkRMRU5CUVVNc1pVRkJaU3hGUVVGRk96dFJRVVZvUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXM3V1VGRFlpeERRVUZETEVOQlFVTXNVMEZCVXl4RlFVRkZMRU5CUVVNc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXp0blFrRkRPVVFzUTBGQlF5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEZRVUZGT3p0UlFVVjJSQ3hEUVVGRExFTkJRVU1zV1VGQldTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNN08xRkJSUzlDTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eFZRVUZWTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzB0QlF6bEVMRU5CUVVNc1IwRkJRVHREUVVOTUxFTkJRVUU3TzBGRGRrSkVRU3hKUVVGTkxGbEJRVmtzUjBGQlJ5eFZRVUZETEV0QlFVc3NSVUZCUlN4SlFVRkpMRVZCUVVVc1UwRkRMMElzV1VGQlJ6dFJRVU5ETEV0QlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlFUdFJRVU42UWl4SlFVRkpMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGQlFTeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMR05CUVdNc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVRXNSVUZCUVR0UlFVTndSQ3hKUVVGSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUVN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUVN4RlFVRkJPMHRCUXpORExFZEJRVUVzUTBGQlFUczdPMEZCUjB4QkxFbEJRVTBzVVVGQlVTeEhRVUZITzBsQlEySXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUk3V1VGRFNTeERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1QwRkJUeXhGUVVGRkxGbEJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXp0blFrRkRPVVFzUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUzBGQlN5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzVjBGQlZ5eEhRVUZITEVWQlFVVXNRMEZCUXp0blFrRkRPVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRE8xbEJRek5DTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXM3WjBKQlEyeENMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEVsQlFVa3NSVUZCUXl4VFFVTndReXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkhMRVZCUVVVN2QwSkJRMWdzUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUzBGQlN5eEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRmRCUVZjc1IwRkJSeXhGUVVGRk8zZENRVU5xUlN4UFFVRlBMRVZCUVVVc1dVRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRWRCUVVFc1EwRkJReXhEUVVGRE8ydENRVU55UlN4RlFVRkZPMU5CUTFnc1IwRkJRVHREUVVOU0xFTkJRVUU3TzBGQlJVUXNRVUZCVDBFc1NVRkJUU3hKUVVGSkxFZEJRVWM3U1VGRGFFSXNUVUZCVFN4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NSMEZCUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhIUVVGQk8wbEJRekZETEVsQlFVa3NSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJReXhUUVVGSExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlEzcENMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRkJMRWxCUVVrc1JVRkJReXhUUVVGSE8xbEJRekZDTEVOQlFVTXNRMEZCUXl4alFVRmpMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF6dFpRVU0zUWl4RFFVRkRMRU5CUVVNc1kwRkJZenRuUWtGRFdpeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGQkxFbEJRVWtzUlVGQlF5eFRRVU5vUWl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGQk8ybENRVU42UkR0aFFVTktPMU5CUTBvc1IwRkJRU3hEUVVGRE8wdEJRMHdzUjBGQlFUdERRVU5LTEVOQlFVRTdPMEZEYmtOTlFTeEpRVUZOTEU5QlFVOHNSMEZCUnp0SlFVTnVRaXhKUVVGSkxFVkJRVVVzVlVGQlFTeExRVUZMTEVWQlFVTXNVMEZCUnl4RFFVRkRMRU5CUVVNc2FVSkJRV2xDTzFGQlF6bENMRU5CUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4SFFVRkhMRXRCUVVzc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NSMEZCUnl4RlFVRkZMRU5CUVVNc1JVRkJSVHRSUVVNM1JDeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwN1dVRkRaQ3hEUVVGRExFTkJRVU1zYVVKQlFXbENMRVZCUVVVc1EwRkJReXhEUVVGRExFZEJRVWNzUlVGQlJTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJRenRuUWtGRE0wTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRTdiMEpCUXpWQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlN4UFFVRlBMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJRenRWUVVNdlJDeEZRVUZGTzFGQlEwb3NRMEZCUXl4RFFVRkRMR1ZCUVdVc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETzB0QlEzSkRMRU5CUVVNc1IwRkJRVHREUVVOTUxFTkJRVUU3TzBGRFZrMUJMRWxCUVUwc1MwRkJTeXhIUVVGSE8wbEJRMnBDTEVsQlFVa3NSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJReXhUUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NWMEZCVnl4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRk8xbEJRMnhGTEVOQlFVTXNRMEZCUXl4dFFrRkJiVUlzUTBGQlF6dFpRVU4wUWl4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJRenRaUVVOdVF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU1zY1VKQlFYRkNMRVZCUVVVc1EwRkJReXhQUVVGUExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVU3UzBGRGVrWXNRMEZCUXl4SFFVRkJPME5CUTB3c1EwRkJRVHM3UVVOT1RVRXNTVUZCVFN4SFFVRkhMRWRCUVVjN1NVRkRaaXhKUVVGSkxFVkJRVVVzVlVGQlFTeExRVUZMTEVWQlFVTXNVMEZCUnl4RFFVRkRMRU5CUVVNc1UwRkJVeXhGUVVGRk8xRkJRM2hDTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eFhRVUZYTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFVRXNTVUZCU1N4RlFVRkRMRk5CUVVjc1EwRkJReXhEUVVGRExGbEJRVmtzUlVGQlJTeEpRVUZKTEVOQlFVTXNSMEZCUVN4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRk8xRkJRek5HTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eGhRVUZoTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFVRXNTVUZCU1N4RlFVRkRMRk5CUVVjc1EwRkJReXhEUVVGRExGbEJRVmtzUlVGQlJTeEpRVUZKTEVOQlFVTXNSMEZCUVN4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRk8xRkJRMnBITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF5eFpRVUZaTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFVRXNTVUZCU1N4RlFVRkRMRk5CUVVjc1EwRkJReXhEUVVGRExGbEJRVmtzUlVGQlJTeEpRVUZKTEVOQlFVTXNSMEZCUVN4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRk8wdEJRMnBITEVOQlFVTXNSMEZCUVR0RFFVTk1MRU5CUVVFN08wRkRTVTFCTEVsQlFVMHNWVUZCVlN4SFFVRkhPMGxCUTNSQ0xFbEJRVWtzUlVGQlJTeFZRVUZETEV0QlFVc3NSVUZCUlN4VFFVRkhMRU5CUVVNc1EwRkJReXh2UWtGQmIwSXNSVUZCUlR0UlFVTnlReXhEUVVGRExFTkJRVU1zY1VKQlFYRkNMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTTdVVUZETTBNc1EwRkJReXhEUVVGRExHOUNRVUZ2UWl4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETzB0QlF6VkRMRU5CUVVNc1IwRkJRVHREUVVOTUxFTkJRVUU3TzBGQlJVUXNRVUZCVDBFc1NVRkJUU3hWUVVGVkxFZEJRVWM3U1VGRGRFSXNTVUZCU1N4RlFVRkZMRlZCUVVNc1MwRkJTeXhGUVVGRkxGTkJRVWNzUTBGQlF5eERRVUZETEc5Q1FVRnZRaXhGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUVR0RFFVTXpSQ3hEUVVGQk96dEJRVVZFTEVGQlFVOUJMRWxCUVUwc1kwRkJZeXhIUVVGSE8wbEJRekZDTEVsQlFVa3NSVUZCUlN4VlFVRkRMRXRCUVVzc1JVRkJSU3hUUVVGSExFTkJRVU1zUTBGQlF5eHZRa0ZCYjBJc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVRTdRMEZEZUVRc1EwRkJRVHM3UVVGRlJDeEJRVUZQUVN4SlFVRk5MRmRCUVZjc1IwRkJSenRKUVVOMlFpeEpRVUZKTEVWQlFVVXNWVUZCUVN4TFFVRkxMRVZCUVVNc1UwRkJSeXhEUVVGRExFTkJRVU1zWlVGQlpTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJRVHREUVVOd1JDeERRVUZCT3p0QlFVVkVMRUZCUVU5QkxFbEJRVTBzU1VGQlNTeEhRVUZITzBsQlEyaENMRWxCUVVrc1JVRkJSU3hWUVVGRExFdEJRVXNzUlVGQlJTeFRRVU5XTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZCTzBOQlEycERMRU5CUVVFN08wRkRMMEpFUVN4SlFVRk5SU3hUUVVGUExFZEJRVWNzVlVGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hUUVVNdlFpeFpRVUZITzFGQlEwTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUjBGQlJ5eERRVUZCTzFGQlEzaENMRWxCUVVrc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUVN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUVN4RlFVRkJPMHRCUTNKRUxFZEJRVUVzUTBGQlFUczdRVUZGVEN4QlFVRlBSaXhKUVVGTkxGRkJRVkVzUjBGQlJ6dEpRVU53UWl4TlFVRk5MRVZCUVVVc1ZVRkJRU3hMUVVGTExFVkJRVU1zVTBGQlJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRWRCUVVFN08wbEJSVGRFTEVsQlFVa3NSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJReXhUUVVGSExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrN1VVRkROVUlzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExGVkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NSVUZCUlN4VFFVTTVRaXhEUVVGRExFTkJRVU1zU1VGQlNUdG5Ra0ZEUmp0dlFrRkRTU3hMUVVGTExFVkJRVVVzUjBGQlJ5eExRVUZMTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExGZEJRVmNzUjBGQlJ5eEpRVUZKTzI5Q1FVTjBSQ3hQUVVGUExFVkJRVVZGTEZOQlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF6dHBRa0ZEY2tNN1owSkJRMFFzUTBGQlF5eERRVUZETEVkQlFVY3NSVUZCUlN4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSE8yOUNRVU5tTEVOQlFVTXNRMEZCUXl4dlFrRkJiMEk3YjBKQlEzUkNMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdjMEpCUXpWRUxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTTdZVUZEY0VJc1IwRkJRVHRUUVVOS08wdEJRMG9zUTBGQlF5eEhRVUZCTzBOQlEwd3NRMEZCUVRzN08wRkJSMFJHTEVsQlFVMUhMR05CUVZrc1IwRkJSeXhWUVVGQkxFdEJRVXNzUlVGQlF5eFRRVU4yUWl4VlFVRkJMRWxCUVVrc1JVRkJReXhUUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFMUJRVUVzUTBGQlFUczdRVUZGZWtNc1FVRkJUMGdzU1VGQlRTeEpRVUZKTEVkQlFVYzdTVUZEYUVJc1RVRkJUU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETzFGQlExWXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhEUVVGQk8xRkJRelZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVWQlFVVTdXVUZEYkVRc1NVRkJTU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVRTdXVUZEWkN4UFFVRlBMRWxCUVVrN1UwRkRaQ3hEUVVGRExFTkJRVUU3UzBGRFREczdTVUZGUkN4SlFVRkpMRVZCUVVVc1ZVRkJRU3hMUVVGTExFVkJRVU1zVTBGRFVpeERRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhGUVVGRkxFdEJRVXNzUlVGQlJTeE5RVUZOTEVWQlFVVXNaMEpCUVdkQ0xFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTXNSVUZCUlR0WlFVTjJSaXhEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEU5QlFVOHNSVUZCUlVjc1kwRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzFsQlEycEhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRkJMRWxCUVVrc1JVRkJReXhUUVVOMlFpeERRVUZETEVOQlFVTXNTMEZCU3p0dlFrRkRTQ3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1IwRkJSeXhMUVVGTExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTlCUVU4c1JVRkJSU3hOUVVGTkxFVkJRVVVzWVVGQllTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMjlDUVVNMVJpeEpRVUZKTEVOQlFVTXNUMEZCVHp0cFFrRkRaaXhIUVVGQk8yRkJRMG83VTBGRFNpeERRVUZETEVkQlFVRTdPME5CUlZRc1EwRkJRVHM3UVVOcVJFUklMRWxCUVUxRkxGTkJRVThzUjBGQlJ5eFZRVUZETEV0QlFVc3NSVUZCUlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhGUVVGRkxGTkJReTlDTEZsQlFVYzdVVUZEUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeExRVUZMTEVkQlFVY3NSVUZCUlN4RlFVRkJMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUVN4RlFVRkJPMkZCUTNCRUxFVkJRVUVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1IwRkJSeXhEUVVGQkxFVkJRVUU3VVVGRE4wSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZCTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZCTEVWQlFVRTdTMEZEY2tRc1IwRkJRU3hEUVVGQk96dEJRVVZNTEVGQlFVOUdMRWxCUVUwc1MwRkJTeXhIUVVGSE8wbEJRMnBDTEVsQlFVa3NSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJReXhUUVVGSExFTkJRVU1zUTBGQlF5eFhRVUZYTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGQk8wTkJRMmhFTEVOQlFVRTdPMEZCUlVRc1FVRkJUMEVzU1VGQlRTeFpRVUZaTEVkQlFVYzdTVUZEZUVJc1NVRkJTU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlFVY3NRMEZCUXl4RFFVRkRMR2xDUVVGcFFpeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJRVHREUVVOMFJDeERRVUZCT3p0QlFVVkVMRUZCUVU5QkxFbEJRVTBzVTBGQlV5eEhRVUZITzBsQlEzSkNMRTFCUVUwc1JVRkJSU3hWUVVGQkxFdEJRVXNzUlVGQlF5eFRRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SlFVRkpMRWxCUVVrc1IwRkJRVHM3U1VGRmFFVXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRVWNzUTBGQlF5eERRVUZETEdGQlFXRTdVVUZETVVJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzUlVGQlJTeFRRVU01UWl4RFFVRkRMRU5CUVVNc1IwRkJSenRuUWtGRFJEdHZRa0ZEU1N4TFFVRkxMRVZCUVVVc1IwRkJSeXhMUVVGTExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRmRCUVZjc1IwRkJSeXhKUVVGSk8yOUNRVU4wUkN4UFFVRlBMRVZCUVVWRkxGTkJRVThzUTBGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1EwRkJRenRwUWtGRGNrTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1MwRkJTenRoUVVOb1FpeEhRVUZCTzFOQlEwbzdTMEZEU2l4SFFVRkJPME5CUTBvc1EwRkJRVHM3UVVGRlJDeEJRVUZQUml4QlFVVk9PenRCUVVWRUxFRkJRVTlCTEVsQlFVMHNWMEZCVnl4SFFVRkhPMGxCUTNaQ0xFMUJRVTBzUlVGQlJTeFZRVUZCTEV0QlFVc3NSVUZCUXl4VFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hKUVVGSkxFbEJRVWtzUjBGQlFUczdTVUZGYUVVc1NVRkJTU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFVTXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hUUVVNM1F5eERRVUZETEVOQlFVTXNaVUZCWlN4RlFVRkZPMmRDUVVOWUxFdEJRVXNzUlVGQlJTeEhRVUZITEV0QlFVc3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzVjBGQlZ5eEhRVUZITEVsQlFVazdaMEpCUTNSRUxFOUJRVThzUlVGQlJVVXNVMEZCVHl4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFVkJRVVVzUjBGQlJ5eERRVUZETzJGQlEzSkRMRVZCUVVVN1dVRkRTQ3hEUVVGRExFTkJRVU1zYVVKQlFXbENMRVZCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEV0QlFVc3NSVUZCUlN4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETTBRc1NVRkJTU3hEUVVGRExFdEJRVXM3VTBGRFlpeERRVUZETEVkQlFVRTdTMEZEVEN4SFFVRkJPME5CUTBvc1EwRkJRVHM3SW4wPVxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0ICogYXMgYm0gZnJvbSAnLi4vYnVpbGQvYnVsbWl0Lm1pbi5qcydcblxuY29uc3QgRGF0YVN0YXRlID0ge1xuICAgIGNvdW50OiAwLFxuICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgIHBhZ2U6IG51bGwsXG5cbiAgICBhZGQ6IChldnQpID0+IHtcbiAgICAgICAgXG4gICAgICAgIERhdGFTdGF0ZS5jb3VudCArPSAxXG4gICAgICAgIERhdGFTdGF0ZS5sb2FkaW5nID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLmxvZygneW91dXV1dXV1JyArIERhdGFTdGF0ZS5jb3VudClcbiAgICAgICAgYm0uc2xlZXAoNTAwKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIERhdGFTdGF0ZS5sb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICAgIG0ucmVkcmF3KClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzbGVlcCcgKyBEYXRhU3RhdGUuY291bnQpXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5jb25zdCBEZW1vQm94ID0ge1xuICAgIHZpZXc6ICgpID0+IG0oYm0uQm94LCAnYSBib3gnKVxufVxuXG5jb25zdCBEZW1vQnV0dG9uID0ge1xuICAgIHZpZXc6ICgpID0+IFtcbiAgICAgICAgbShibS5UaXRsZSwge3NpemU6IDN9LCAnRXZlbnQgaGFuZGxlciAmIHN0YXRlJyksXG4gICAgICAgIG0oYm0uQnV0dG9uLCB7XG4gICAgICAgICAgICBvbmNsaWNrOiBEYXRhU3RhdGUuYWRkLFxuICAgICAgICAgICAgbG9hZGluZzogRGF0YVN0YXRlLmxvYWRpbmcsXG4gICAgICAgICAgICBzdGF0ZTogRGF0YVN0YXRlLmxvYWRpbmcgPyAncHJpbWFyeScgOiBudWxsLFxuICAgICAgICAgICAgc2l6ZTogJ2xhcmdlJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdhIGJ1dHRvbiAnICsgRGF0YVN0YXRlLmNvdW50LFxuICAgICAgICAgICAgaWNvbjogJ2FsaWduLWxlZnQnLCBpY29uX3JpZ2h0OiB0cnVlfSksXG5cbiAgICAgICAgbShibS5UaXRsZSwge3NpemU6IDN9LCAnQ29sb3JzJyksXG4gICAgICAgIGJtLkNPTE9SUy5tYXAoY29sb3IgPT4gbShibS5CdXR0b24sIHtjb2xvcjogY29sb3IsIGNvbnRlbnQ6ICdhICcgKyBjb2xvciArICcgYnV0dG9uJ30pKSxcblxuICAgICAgICBtKGJtLlRpdGxlLCB7c2l6ZTogM30sICdDb2xvcnMnKSxcbiAgICAgICAgYm0uU1RBVEVTLm1hcChzdGF0ZSA9PiBtKGJtLkJ1dHRvbiwge3N0YXRlOiBzdGF0ZSwgY29udGVudDogJ2EgJyArIHN0YXRlICsgJyBidXR0b24nfSkpLFxuICAgIF1cbn1cblxuY29uc3QgRGVtb1RhYmxlID0ge1xuICAgIHZpZXc6ICgpID0+IG0oYm0uVGFibGUsIHtcbiAgICAgICAgc3RyaXBlZDogdHJ1ZSxcbiAgICAgICAgYm9yZGVyZWQ6IHRydWUsXG4gICAgICAgIHBhZ2luYXRlX2J5OiA2LFxuICAgICAgICBoZWFkZXI6IFtcbiAgICAgICAgICAgIHtuYW1lOiAnUG9zJywgdGl0bGU6ICdQb3NpdGlvbid9LFxuICAgICAgICAgICAge25hbWU6ICdUZWFtJywgc29ydGFibGU6IHRydWV9LFxuICAgICAgICAgICAge25hbWU6ICdXJywgdGl0bGU6ICdXb24nLCBzb3J0YWJsZTogdHJ1ZX1cbiAgICAgICAgXSxcbiAgICAgICAgZm9vdGVyOiBbXG4gICAgICAgICAgICB7bmFtZTogJ1BvcycsIHRpdGxlOiAnUG9zaXRpb24nfSxcbiAgICAgICAgICAgIHtuYW1lOiAnVGVhbSd9LFxuICAgICAgICAgICAge25hbWU6ICdXJywgdGl0bGU6ICdXb24nfVxuICAgICAgICBdLFxuICAgICAgICByb3dzOiBbXG4gICAgICAgICAgICBbMSwgJ0xlaWNlc3RlciBDaXR5JywgMjNdLFxuICAgICAgICAgICAgWzIsICdBcnNlbmFsJywgMjBdLFxuICAgICAgICAgICAgWzMsICdUb3R0ZW5oYW0gSG90c3B1cicsIDE5XSxcbiAgICAgICAgICAgIFsxLCAnZGQgQ2l0eScsIDIzXSxcbiAgICAgICAgICAgIFsyLCAnZWUnLCAyMF0sXG4gICAgICAgICAgICBbMywgJ2ZmIEhvdHNwdXInLCAxOV0sXG4gICAgICAgICAgICBbMSwgJ2dnIENpdHknLCAyM10sXG4gICAgICAgICAgICBbMiwgJ2hoJywgMjBdLFxuICAgICAgICAgICAgWzMsICdpaSBIb3RzcHVyJywgMTldLFxuICAgICAgICAgICAgWzEsICdqaiBDaXR5JywgMjNdLFxuICAgICAgICAgICAgWzIsICdraycsIDIwXSxcbiAgICAgICAgICAgIFszLCAnbGwgSG90c3B1cicsIDE5XVxuICAgICAgICBdXG4gICAgfSlcbn1cblxuXG5jb25zdCBEZW1vRm9ybSA9IHtcbiAgICB2aWV3OiAoKSA9PiBbXG4gICAgICAgIG0oYm0uTGFiZWwsICdMZSBub20gPycpLFxuICAgICAgICBtKGJtLklucHV0LCB7cGxhY2Vob2xkZXI6ICd3b29vJywgdmFsdWU6ICd0b3RvJywgaWNvbjogJ2NoZWNrJ30pLFxuICAgICAgICBtKGJtLklucHV0LCB7cGxhY2Vob2xkZXI6ICdlbWFpbCcsIHN0YXRlOiAnZGFuZ2VyJywgaWNvbjogJ3dhcm5pbmcnfSksXG4gICAgICAgIG0oYm0uTGFiZWwsICdMZSBjaG9peCA/JyksXG4gICAgICAgIG0oYm0uU2VsZWN0LCB7Y2hvaWNlczogW1sxLCAnYm8nXSwgWzIsICd1dSddXSwgc2l6ZTogJ2xhcmdlJ30pLFxuICAgICAgICBtKGJtLlRleHRBcmVhLCB7cGxhY2Vob2xkZXI6ICdjb21tZW50cycsIHZhbHVlOiAnYm9iJywgbG9hZGluZzogdHJ1ZX0pLFxuICAgICAgICBtKGJtLkNoZWNrQm94LCB7Y29udGVudDogJ2NsaWNrICEnfSksXG4gICAgICAgIG0oYm0uUmFkaW8sIHtuYW1lOiAneHgnLCBjaG9pY2VzOiBbWzEwLCAnbm9wZSddLCBbMSwgJ3llYWgnXV19KVxuICAgIF1cbn1cblxuXG5jb25zdCBEZW1vSW1hZ2UgPSB7XG4gICAgdmlldzogKCkgPT4gW1xuICAgICAgICBtKGJtLkltYWdlLCB7c2l6ZTogMTI4LCBcbiAgICAgICAgICAgIHNyYzogXCJodHRwOi8vYnVsbWEuaW8vaW1hZ2VzL3BsYWNlaG9sZGVycy8xMjh4MTI4LnBuZ1wifSksXG4gICAgICAgIG0oYm0uSW1hZ2UsIHtyYXRpbzogJzJieTEnLCBcbiAgICAgICAgICAgIHNyYzogXCJodHRwOi8vYnVsbWEuaW8vaW1hZ2VzL3BsYWNlaG9sZGVycy8xMjh4MTI4LnBuZ1wifSlcbiAgICBdXG59XG5cblxuY29uc3QgRGVtb05vdGlmaWNhdGlvbiA9IHtcbiAgICB2aWV3OiAoKSA9PiBtKGJtLk5vdGlmaWNhdGlvbiwge1xuICAgICAgICAgICAgc3RhdGU6ICdkYW5nZXInLCAnZGVsZXRlJzogdHJ1ZSwgb25jbGljazogKGUpID0+IGNvbnNvbGUubG9nKCdjbGljaycpfSwgXG4gICAgICAgICAgICAnV2hhdCB0aGUgaGVsbCAhJyksXG5cbn1cblxuY29uc3QgRGVtb1Byb2dyZXNzID0ge1xuICAgIHZpZXc6ICgpID0+IFtcbiAgICAgICAgbShibS5Qcm9ncmVzcywge3N0YXRlOiAnaW5mbycsICdtYXgnOiA4MCwgdmFsdWU6IDYwfSksXG4gICAgICAgIG0oYm0uUHJvZ3Jlc3MsIHsnbWF4JzogODAsIHZhbHVlOiAzMCwgc2l6ZTogJ2xhcmdlJ30pXG4gICAgXVxufVxuXG5cbmNvbnN0IERlbW9UYWcgPSB7XG4gICAgdmlldzogKCkgPT4gW1xuICAgICAgICBtKGJtLlRhZywge3N0YXRlOiAnaW5mbyd9LCAnd29vb3QnKSxcbiAgICAgICAgbShibS5UYWcsIHtzaXplOiAnbGFyZ2UnfSwgJ2JpZycpLFxuICAgIF1cbn1cblxuY29uc3QgRGVtb1RpdGxlID0ge1xuICAgIHZpZXc6ICgpID0+IFsxLCAyLCAzLCA0XS5tYXAoeCA9PiBbXG4gICAgICAgIG0oYm0uVGl0bGUsIHtzaXplOiB4fSwgJ1RpdGxlICcgKyB4KSxcbiAgICAgICAgbShibS5TdWJUaXRsZSwge3NpemU6IHh9LCAnU3ViVGl0bGUgJyArIHgpLFxuICAgIF0pXG59XG5cbmNvbnN0IERlbW9MZXZlbCA9IHtcbiAgICB2aWV3OiAoKSA9PiBcbiAgICAgICAgbShibS5MZXZlbCwgW1xuICAgICAgICAgICAgbShibS5MZXZlbEl0ZW0sIHtjZW50ZXJlZDogdHJ1ZX0sIG0oJ2RpdicsIG0oJ3AuaGVhZGluZycsICdUd3d3ZXRzJyksIG0oJ3AudGl0bGUnLCAnNDAwaycpKSksXG4gICAgICAgICAgICBtKGJtLkxldmVsSXRlbSwge2NlbnRlcmVkOiB0cnVlfSwgbSgnZGl2JywgbSgncC5oZWFkaW5nJywgJ0ZvbGxvd2luZycpLCBtKCdwLnRpdGxlJywgJzI1NDQnKSkpLFxuICAgICAgICAgICAgbShibS5MZXZlbEl0ZW0sIHtjZW50ZXJlZDogdHJ1ZX0sIG0oJ2RpdicsIG0oJ3AuaGVhZGluZycsICdGb2xsb3dlcnMnKSwgbSgncC50aXRsZScsICc4NzknKSkpLFxuICAgICAgICAgICAgbShibS5MZXZlbEl0ZW0sIHtjZW50ZXJlZDogdHJ1ZX0sIG0oJ2RpdicsIG0oJ3AuaGVhZGluZycsICdMaWtlcycpLCBtKCdwLnRpdGxlJywgJzIwMC4xMCcpKSksXG4gICAgICAgIF0pXG59XG5cbmNvbnN0IERlbW9NZWRpYSA9IHtcbiAgICB2aWV3OiAoKSA9PiBbMSwgMiwgM10ubWFwKHggPT5cbiAgICAgICAgbShibS5NZWRpYSwge1xuICAgICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHJhdGlvOiAnNjR4NjQnLFxuICAgICAgICAgICAgICAgICAgICBzcmM6ICdodHRwOi8vYnVsbWEuaW8vaW1hZ2VzL3BsYWNlaG9sZGVycy8xMjh4MTI4LnBuZyd9LFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogbShibS5CdXR0b24sIHtjbGFzczogJ2RlbGV0ZSd9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG0oJy5jb250ZW50JywgJ01lZGlhICcgKyB4KVxuICAgICAgICApXG4gICAgKVxufVxuXG5jb25zdCBEZW1vTWVudSA9IHtcbiAgICB2aWV3OiAoKSA9PlxuICAgICAgICBtKGJtLk1lbnUsIHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnbXl0JyxcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0FkbWluaXN0cmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiAndHMnLCBsYWJlbDonVGVhbSBTZXR0aW5ncycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiAnbXl0JywgdXJsOiAnLycsIGxhYmVsOiAnTWFuYWdlIFlvdXIgVGVhbScsIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXk6ICdteXQxJywgdXJsOiAnLycsIGxhYmVsOiAnTWVtYmVycycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGtleTogJ215dDInLCBvbmNsaWNrOiAoKSA9PiBjb25zb2xlLmxvZygnb25jbGljayAhIScpLCBsYWJlbDogJ0FkZCBtZW1iZXInIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pXG59XG5cbmNvbnN0IERlbW9NZXNzYWdlID0ge1xuICAgIHZpZXc6ICgpID0+IFtcbiAgICAgICAgbShibS5NZXNzYWdlLCB7Y29sb3I6ICd3YXJuaW5nJywgaGVhZGVyOiAnc2FsdXQnLCBvbmNsb3NlOiAoKSA9PiBjb25zb2xlLmxvZygneW8nKX0sXG4gICAgICAgICAgICBcIkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQuXCIgK1xuICAgICAgICAgICAgXCJQZWxsZW50ZXNxdWUgcmlzdXMgbWk8L3N0cm9uZz4sIHRlbXB1cyBxdWlzIHBsYWNlcmF0IHV0LCBcIiArXG4gICAgICAgICAgICBcInBvcnRhIG5lYyBudWxsYS4gVmVzdGlidWx1bSByaG9uY3VzIGFjIGV4IHNpdCBhbWV0IGZyaW5naWxsYS5cIiArXG4gICAgICAgICAgICBcIk51bGxhbSBncmF2aWRhIHB1cnVzIGRpYW0sIGV0IGRpY3R1bSBmZWxpcyB2ZW5lbmF0aXMgZWZmaWNpdHVyXCIpLFxuXG4gICAgICAgIG0oYm0uTWVzc2FnZSwge2NvbG9yOiAnZGFyayd9LFxuICAgICAgICAgICAgXCJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LlwiICtcbiAgICAgICAgICAgIFwiUGVsbGVudGVzcXVlIHJpc3VzIG1pPC9zdHJvbmc+LCB0ZW1wdXMgcXVpcyBwbGFjZXJhdCB1dCwgXCIgK1xuICAgICAgICAgICAgXCJwb3J0YSBuZWMgbnVsbGEuIFZlc3RpYnVsdW0gcmhvbmN1cyBhYyBleCBzaXQgYW1ldCBmcmluZ2lsbGEuXCIgK1xuICAgICAgICAgICAgXCJOdWxsYW0gZ3JhdmlkYSBwdXJ1cyBkaWFtLCBldCBkaWN0dW0gZmVsaXMgdmVuZW5hdGlzIGVmZmljaXR1clwiKSxcbiAgICBdXG59XG5cbmNvbnN0IERlbW9Nb2RhbCA9IHtcbiAgICB2aWV3OiAoKSA9PiBbXG4gICAgICAgIG0oYm0uQnV0dG9uLCB7b25jbGljazogKCkgPT4gRGF0YVN0YXRlLmFjdGl2ZT10cnVlLCB0ZXh0OiAnbGF1bmNoIG1vZGFsJ30pLFxuICAgICAgICBtKGJtLk1vZGFsLCB7b25jbG9zZTogKCkgPT4gRGF0YVN0YXRlLmFjdGl2ZT1mYWxzZSwgYWN0aXZlOkRhdGFTdGF0ZS5hY3RpdmV9LFxuICAgICAgICAgICAgbSgnLmJveCcsICdIZWxsbyB0aGVyZScpKSxcbiAgICBdXG59XG5cbmNvbnN0IERlbW9OYXYgPSB7XG4gICAgdmlldzogKCkgPT4gbShibS5OYXYsIHtcbiAgICAgICAgbGVmdDogW20oJ2ltZ1tzcmM9XCJodHRwOi8vYnVsbWEuaW8vaW1hZ2VzL2J1bG1hLWxvZ28ucG5nXCJdW2FsdD1cIkJ1bG1hIGxvZ29cIl0nKV0sXG4gICAgICAgIGNlbnRlcjogW20oYm0uSWNvbiwge2ljb246ICdnaXRodWInfSldLFxuICAgICAgICByaWdodDogWydIb21lJywgJ0RvY3MnXVxuICAgIH0pXG59XG5cbmNvbnN0IERlbW9DYXJkID0ge1xuICAgIHZpZXc6ICgpID0+IG0oYm0uQ2FyZCwgW1xuICAgICAgICBtKGJtLkNhcmRIZWFkZXIsIHtpY29uOiBtKGJtLkljb24sIHtpY29uOiAnYW5nbGUtZG93bid9KSwgdGl0bGU6ICdhIGNhcmQnfSksXG4gICAgICAgIG0oYm0uQ2FyZENvbnRlbnQsIG0oYm0uQ29udGVudCwgJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0JykpLFxuICAgICAgICBtKGJtLkNhcmRGb290ZXIsIFtcbiAgICAgICAgICAgIG0oYm0uQ2FyZEZvb3Rlckl0ZW0sIHt0ZXh0OiAnU2F2ZSd9KSxcbiAgICAgICAgICAgIG0oYm0uQ2FyZEZvb3Rlckl0ZW0sIHt0ZXh0OiAnRGVsZXRlJ30pXG4gICAgICAgIF0pXG4gICAgXSlcbn1cblxuY29uc3QgRGVtb1BhZ2luYXRpb24gPSB7XG4gICAgdmlldzogKCkgPT4gbShibS5QYWdpbmF0aW9uLCBcbiAgICAgICAge25iOiAxMDAsIGN1cnJlbnQ6IDUxLCBvbmNsaWNrOiAobmIpID0+IGNvbnNvbGUubG9nKG5iICsgJyBjbGlja2VkJyl9KVxufVxuXG5cbmNvbnN0IERlbW9QYW5lbCA9IHtcbiAgICB2aWV3OiAoKSA9PiBtKGJtLlBhbmVsLCBbXG4gICAgICAgIG0oYm0uUGFuZWxIZWFkaW5nLCAnQSBQYW5lbCAhJyksXG4gICAgICAgIG0oYm0uUGFuZWxUYWJzLCB7aXRlbXM6IFtcbiAgICAgICAgICAgIHtsYWJlbDogJ0FsbCd9LFxuICAgICAgICAgICAge2xhYmVsOiAnUHVibGljJ30sXG4gICAgICAgICAgICB7bGFiZWw6ICdQcml2YXRlJ31dfSksXG4gICAgICAgIG0oYm0uUGFuZWxCbG9ja3MsIHtpdGVtczogW1xuICAgICAgICAgICAge2xhYmVsOiAnbWFya3NoZWV0JywgaWNvbjogJ2Jvb2snfSxcbiAgICAgICAgICAgIHtsYWJlbDogJ21pbmlyZXNldC5jc3MnLCBpY29uOiAnYm9vayd9LFxuICAgICAgICAgICAge2xhYmVsOiAnZ2l0aHViJywgaWNvbjogJ2NvZGUtZm9yayd9XX0pXG4gICAgXSlcbn1cblxuY29uc3QgRGVtb1RhYnMgPSB7XG4gICAgdmlldzogKCkgPT4gbShibS5UYWJzLCB7aXRlbXM6IFtcbiAgICAgICAge2xhYmVsOiAnQWxsJywgaWNvbjogJ2ltYWdlJywgY29udGVudDogJ2Jsb2InfSxcbiAgICAgICAge2xhYmVsOiAnUHVibGljJywgaWNvbjogJ2ZpbG0nLCBjb250ZW50OiAnd29vb3QnfSxcbiAgICAgICAge2xhYmVsOiAnUHJpdmF0ZScsIGNvbnRlbnQ6ICdwcml2ZSAhISd9XX1cbiAgICApXG59XG5cblxuY29uc3QgRWxlbWVudHMgPSB7XG4gICAgYm94OiBbJ0JveCcsIERlbW9Cb3hdLFxuICAgIGJ1dHRvbjogWydCdXR0b24nLCBEZW1vQnV0dG9uXSxcbiAgICBmb3JtOiBbJ0Zvcm0nLCBEZW1vRm9ybV0sXG4gICAgaW1hZ2U6IFsnSW1hZ2UnLCBEZW1vSW1hZ2VdLFxuICAgIG5vdGlmOiBbJ05vdGlmaWNhdGlvbicsIERlbW9Ob3RpZmljYXRpb25dLFxuICAgIHByb2dyZXNzOiBbJ1Byb2dyZXNzJywgRGVtb1Byb2dyZXNzXSxcbiAgICB0YWc6IFsnVGFnJywgRGVtb1RhZ10sXG4gICAgdGFibGU6IFsnVGFibGUnLCBEZW1vVGFibGVdLFxuICAgIHRpdGxlOiBbJ1RpdGxlJywgRGVtb1RpdGxlXVxufVxuXG5cbmNvbnN0IENvbXBvbmVudHMgPSB7XG4gICAgbGV2ZWw6IFsnTGV2ZWwnLCBEZW1vTGV2ZWxdLFxuICAgIG1lZGlhOiBbJ01lZGlhJywgRGVtb01lZGlhXSxcbiAgICBtZW51OiBbJ01lbnUnLCBEZW1vTWVudV0sXG4gICAgbWVzc2FnZTogWydNZXNzYWdlJywgRGVtb01lc3NhZ2VdLFxuICAgIG1vZGFsOiBbJ01vZGFsJywgRGVtb01vZGFsXSxcbiAgICBuYXY6IFsnTmF2JywgRGVtb05hdl0sXG4gICAgY2FyZDogWydDYXJkJywgRGVtb0NhcmRdLFxuICAgIHBhZ2luYXRpb246IFsnUGFnaW5hdGlvbicsIERlbW9QYWdpbmF0aW9uXSxcbiAgICBwYW5lbDogWydQYW5lbCcsIERlbW9QYW5lbF0sXG4gICAgdGFiczogWydUYWJzJywgRGVtb1RhYnNdXG59XG5cblxuY29uc3QgTWVudSA9IHtcbiAgICB2aWV3OiB2bm9kZSA9PiBtKGJtLk1lbnUsIHtcbiAgICAgICAgc2VsZWN0ZWQ6IERhdGFTdGF0ZS5wYWdlLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVtb3MnLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgICBrZXk6ICdlbGVtZW50cycsIGxhYmVsOiAnRWxlbWVudHMnLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBPYmplY3Qua2V5cyhFbGVtZW50cykubWFwKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleToga2V5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazoga2V5ID0+IERhdGFTdGF0ZS5wYWdlID0ga2V5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEVsZW1lbnRzW2tleV1bMF0gfX0pXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgICBrZXk6ICdjb21wb25lbnRzJywgbGFiZWw6ICdDb21wb25lbnRzJywgXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogT2JqZWN0LmtleXMoQ29tcG9uZW50cykubWFwKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleToga2V5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazoga2V5ID0+IERhdGFTdGF0ZS5wYWdlID0ga2V5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IENvbXBvbmVudHNba2V5XVswXSB9fSlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9KVxufVxuXG5jb25zdCBnZXRfZGVtbyA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhEYXRhU3RhdGUucGFnZSlcbiAgICBpZiAoRGF0YVN0YXRlLnBhZ2UgaW4gRWxlbWVudHMpIHJldHVybiBtKEVsZW1lbnRzW0RhdGFTdGF0ZS5wYWdlXVsxXSlcbiAgICBpZiAoRGF0YVN0YXRlLnBhZ2UgaW4gQ29tcG9uZW50cykgcmV0dXJuIG0oQ29tcG9uZW50c1tEYXRhU3RhdGUucGFnZV1bMV0pXG4gICAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGNvbnN0IEFwcCA9IHtcbiAgICB2aWV3OiB2bm9kZSA9PiBcbiAgICAgICAgbSgnLmNvbnRhaW5lcicsXG4gICAgICAgICAgICBtKGJtLlRpdGxlLCAnQnVsbWl0JyksXG4gICAgICAgICAgICBtKFwiLmNvbHVtbnMuaXMtbW9iaWxlXCIsIFxuICAgICAgICAgICAgICAgIG0oJy5jb2x1bW4uaXMtb25lLXRoaXJkJywgbShNZW51KSksXG4gICAgICAgICAgICAgICAgbSgnLmNvbHVtbicsIGdldF9kZW1vKCkpXG4gICAgICAgICAgICApXG4gICAgICAgIClcbn1cblxuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSwgQXBwKSJdLCJuYW1lcyI6WyJhcmd1bWVudHMiLCJnbG9iYWwiLCJtIiwiTWVudSIsImNvbnN0IiwiYm0uc2xlZXAiLCJibS5Cb3giLCJibS5UaXRsZSIsImJtLkJ1dHRvbiIsImJtLkNPTE9SUyIsImJtLlNUQVRFUyIsImJtLlRhYmxlIiwiYm0uTGFiZWwiLCJibS5JbnB1dCIsImJtLlNlbGVjdCIsImJtLlRleHRBcmVhIiwiYm0uQ2hlY2tCb3giLCJibS5SYWRpbyIsImJtLkltYWdlIiwiYm0uTm90aWZpY2F0aW9uIiwiYm0uUHJvZ3Jlc3MiLCJibS5UYWciLCJibS5TdWJUaXRsZSIsImJtLkxldmVsIiwiYm0uTGV2ZWxJdGVtIiwiYm0uTWVkaWEiLCJibS5NZW51IiwiYm0uTWVzc2FnZSIsImJtLk1vZGFsIiwiYm0uTmF2IiwiYm0uSWNvbiIsImJtLkNhcmQiLCJibS5DYXJkSGVhZGVyIiwiYm0uQ2FyZENvbnRlbnQiLCJibS5Db250ZW50IiwiYm0uQ2FyZEZvb3RlciIsImJtLkNhcmRGb290ZXJJdGVtIiwiYm0uUGFnaW5hdGlvbiIsImJtLlBhbmVsIiwiYm0uUGFuZWxIZWFkaW5nIiwiYm0uUGFuZWxUYWJzIiwiYm0uUGFuZWxCbG9ja3MiLCJibS5UYWJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLElBQUksV0FBVzs7QUFFZixTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtDQUNyRCxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0NBQ3hLO0FBQ0QsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLElBQUksRUFBRTtDQUNoQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQSxPQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFBO0NBQ3JILElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUUsRUFBQSxPQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUssS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFBO0NBQ3ZJLE9BQU8sSUFBSTtDQUNYLENBQUE7QUFDRCxLQUFLLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7Q0FDOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDekMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDMUM7Q0FDRCxPQUFPLFFBQVE7Q0FDZixDQUFBO0FBQ0QsSUFBSSxjQUFjLEdBQUcsOEVBQThFLENBQUE7QUFDbkcsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRTs7O0NBQzlCLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksT0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtFQUM1RixNQUFNLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO0VBQ3BFO0NBQ0QsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsRUFBRTtFQUMxRSxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRSxDQUFBO0VBQzdDLE9BQU8sS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7R0FDN0MsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDckMsSUFBSSxJQUFJLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUUsRUFBQSxHQUFHLEdBQUcsS0FBSyxDQUFBLEVBQUE7UUFDdkMsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLEVBQUEsVUFBVSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUEsRUFBQTtRQUN2QyxJQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBLEVBQUE7UUFDckMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0lBQzdCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4QixJQUFJLFNBQVMsRUFBRSxFQUFBLFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFBLEVBQUE7SUFDdEYsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFLEVBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQSxFQUFBO1NBQzVDLEVBQUEsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUEsRUFBQTtJQUM3QztHQUNEO0VBQ0QsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFBLFVBQVUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxFQUFBO0VBQ2hFLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLEtBQUssRUFBRSxRQUFRLEVBQUU7R0FDbkQsSUFBSSxRQUFRLEdBQUcsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUE7R0FDckMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFBO0dBQzlDLEtBQUssSUFBSSxHQUFHLElBQUksVUFBVSxFQUFFLEVBQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQSxFQUFBO0dBQ3hELElBQUksU0FBUyxLQUFLLFNBQVMsRUFB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QUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7R0FDdkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFBO0dBQ2pILElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsRUFBRSxFQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxRQUFRLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxJQUFJLFlBQVksUUFBUSxHQUFHLFNBQVMsS0FBSyxFQUFFLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBLEVBQUE7R0FDN0ssSUFBSSxPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFLEVBQUEsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUEsRUFBQTtHQUMxRSxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUUsRUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQSxFQUFBO0dBQzlELElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQzNDLElBQUksT0FBTyxFQUFFLEVBQUEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxFQUFBO1FBQzdDLEVBQUEsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsRUFBQTtHQUM3QyxJQUFJLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQTtHQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FB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LElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxVQUFVLENBQUMsR0FBRyxZQUFZLENBQUE7R0FDeEQsTUFBTSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDMUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBQ3BELENBQUMsQ0FBQTtFQUNGLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7RUFDOUQ7Q0FDRCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0VBQy9CLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxFQUFBLE9BQU8sR0FBRyxFQUFBO0VBQzVCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFBO0VBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0dBQ3ZDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDNUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFO0lBQ3RCLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUN2QztHQUNEO0VBQ0QsT0FBTyxHQUFHO0VBQ1Y7Q0FDRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0VB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RUFBQSxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFBLEVBQUE7T0FDN0YsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFLEVBQUEsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQSxFQUFBO09BQzNEO0dBQ0osSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUU7SUFDakMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFBO0lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0tBQ3ZDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFO01BQ3hDLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQTtNQUN2RCxLQUFLO01BQ0w7S0FDRDtJQUNELElBQUksU0FBUyxFQUFFO0tBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDcEMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUEsUUFBUSxFQUFBO1dBQzdCLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUEsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQSxFQUFBO1dBQzFILElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFBLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUEsRUFBQTtXQUN6RCxFQUFBLFVBQVUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQSxFQUFBO01BQ3JHO0tBQ0QsTUFBTTtLQUNOO0lBQ0Q7R0FDRCxTQUFTLEdBQUcsU0FBUyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDbEQsSUFBSSxTQUFTLEVBQUUsRUFBQSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUEsRUFBQTs7R0FFekMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUE7R0FDbEYsT0FBTyxNQUFNLElBQUksUUFBUSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7SUFDMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUEsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLENB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LEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBLEVBQUE7R0FDaEgsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxFQUFBLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQSxFQUFBO0dBQzdHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0dBQzlFO0VBQ0Q7Q0FDRCxTQUFTLGVBQWUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7RUFDL0UsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7RUFDekUsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtFQUNuRCxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO0dBQzNCLElBQUksR0FBRyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUUsRUFBQSxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQSxFQUFBO1FBQy9FLEVBQUEsVUFBVSxDQUFDLE1BQU0sRUFBRSxH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RDtLQUNELGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUM1QixJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtNQUNySCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFBLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQSxFQUFBO1dBQ3BDLEVBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUEsRUFBQTtNQUM3QjtLQUNEO0lBQ0Q7R0FDRDtFQUNEO0NBQ0QsU0FBUyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUU7RUFDaEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTtFQUM1QixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUUsRUFBQSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBLEVBQUE7RUFDNUM7Q0FDRCxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUU7RUFDeEIsSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUEsRUFBQTtFQUN0RixJQUFJLE9BQU8sS0FBSyxDQUFDLEdBQUcsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBQSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQSxFQUFBO0VBQ3BHLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUUsRUFBQSxRQUFRLENB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
