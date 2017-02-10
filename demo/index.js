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

var clickhandler = function (global_state, item, state) { return function () {
        global_state.selected = item.key;
        if (global_state.collapsable && state) { state.collapsed = ! state.collapsed; }
        if (item.onclick) { item.onclick(item.key); }
    }; };


var MenuItem = {
    oninit: function (vnode) {
        vnode.state.collapsed = vnode.attrs.root.collapsed || false;
    },
    view: function (vnode) { return [
            mithril('a', {onclick: clickhandler(vnode.attrs.state, vnode.attrs.root, vnode.state),
                class: vnode.attrs.state.selected === vnode.attrs.root.key ? "is-active" : null},
                vnode.attrs.root.label,
                vnode.attrs.state.collapsable ? 
                    (vnode.state.collapsed ? 
                        mithril(Icon, {icon: 'caret-up', size: 'small'})
                        : mithril(Icon, {icon: 'caret-down', size: 'small'})): null),
            (!vnode.attrs.state.collapsable || !vnode.state.collapsed) && vnode.attrs.root.items ?
                mithril('ul', vnode.attrs.root.items.map(function (item) { return mithril('li', mithril('a', {
                        class: vnode.attrs.state.selected === item.key ? "is-active" : null,
                        onclick: clickhandler(vnode.attrs.state, item, null)}, item.label)); }))
                : null
        ]; }
};

var Menu$1 = {
    oninit: function (vnode) {
        vnode.state = vnode.attrs;
        vnode.state.collapsable =  vnode.attrs.collapsable || false;
        vnode.state.collapsed = vnode.attrs.collapsed || false;
    },
    view: function (vnode) { return mithril('aside.menu',
        vnode.state.items.map(function (menu) { return [
            mithril('p.menu-label', {onclick: vnode.attrs.collapsable ? 
                function () { return vnode.state.collapsed = !vnode.state.collapsed; } : null}, 
                menu.label, 
                vnode.state.collapsable ? 
                    (vnode.state.collapsed ? 
                        mithril(Icon, {icon: 'caret-up', size: 'small'})
                        : mithril(Icon, {icon: 'caret-down', size: 'small'})): null),
            !vnode.state.collapsable || !vnode.state.collapsed ?
                mithril('ul.menu-list',
                    menu.items.map(function (item) { return mithril('li', mithril(MenuItem, {state: vnode.state, root: item})); }
                    )
                ) : null
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

    add: function () {
        
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
            state: 'danger', 'delete': true, onclick: function () { return console.log('click'); }}, 
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
    view: function () { return [1, 2, 3, 4, 5, 6].map(function (x) { return [
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
            collapsable: true,
            items: [
                {
                    label: 'Administration',
                    items: [
                        { key: 'ts', label:'Team Settings' },
                        { key: 'myt', label: 'Manage Your Team', items: [
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
    view: function () { return mithril(Menu$1, {
        selected: DataState.page,
        collapsable: true,
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
    view: function () { return mithril('.container',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCIuLi9idWlsZC9idWxtaXQubWluLmpzIiwiaW5kZXguZXM2LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm5ldyBmdW5jdGlvbigpIHtcblxuZnVuY3Rpb24gVm5vZGUodGFnLCBrZXksIGF0dHJzMCwgY2hpbGRyZW4sIHRleHQsIGRvbSkge1xuXHRyZXR1cm4ge3RhZzogdGFnLCBrZXk6IGtleSwgYXR0cnM6IGF0dHJzMCwgY2hpbGRyZW46IGNoaWxkcmVuLCB0ZXh0OiB0ZXh0LCBkb206IGRvbSwgZG9tU2l6ZTogdW5kZWZpbmVkLCBzdGF0ZToge30sIGV2ZW50czogdW5kZWZpbmVkLCBpbnN0YW5jZTogdW5kZWZpbmVkLCBza2lwOiBmYWxzZX1cbn1cblZub2RlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHJldHVybiBWbm9kZShcIltcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKG5vZGUpLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0aWYgKG5vZGUgIT0gbnVsbCAmJiB0eXBlb2Ygbm9kZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFZub2RlKFwiI1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm9kZSA9PT0gZmFsc2UgPyBcIlwiIDogbm9kZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdHJldHVybiBub2RlXG59XG5Wbm9kZS5ub3JtYWxpemVDaGlsZHJlbiA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRjaGlsZHJlbltpXSA9IFZub2RlLm5vcm1hbGl6ZShjaGlsZHJlbltpXSlcblx0fVxuXHRyZXR1cm4gY2hpbGRyZW5cbn1cbnZhciBzZWxlY3RvclBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbKC4rPykoPzpcXHMqPVxccyooXCJ8J3wpKCg/OlxcXFxbXCInXFxdXXwuKSo/KVxcNSk/XFxdKS9nXG52YXIgc2VsZWN0b3JDYWNoZSA9IHt9XG5mdW5jdGlvbiBoeXBlcnNjcmlwdChzZWxlY3Rvcikge1xuXHRpZiAoc2VsZWN0b3IgPT0gbnVsbCB8fCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHNlbGVjdG9yLnZpZXcgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHRocm93IEVycm9yKFwiVGhlIHNlbGVjdG9yIG11c3QgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGEgY29tcG9uZW50LlwiKTtcblx0fVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiICYmIHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgbWF0Y2gsIHRhZywgY2xhc3NlcyA9IFtdLCBhdHRyaWJ1dGVzID0ge31cblx0XHR3aGlsZSAobWF0Y2ggPSBzZWxlY3RvclBhcnNlci5leGVjKHNlbGVjdG9yKSkge1xuXHRcdFx0dmFyIHR5cGUgPSBtYXRjaFsxXSwgdmFsdWUgPSBtYXRjaFsyXVxuXHRcdFx0aWYgKHR5cGUgPT09IFwiXCIgJiYgdmFsdWUgIT09IFwiXCIpIHRhZyA9IHZhbHVlXG5cdFx0XHRlbHNlIGlmICh0eXBlID09PSBcIiNcIikgYXR0cmlidXRlcy5pZCA9IHZhbHVlXG5cdFx0XHRlbHNlIGlmICh0eXBlID09PSBcIi5cIikgY2xhc3Nlcy5wdXNoKHZhbHVlKVxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09IFwiW1wiKSB7XG5cdFx0XHRcdHZhciBhdHRyVmFsdWUgPSBtYXRjaFs2XVxuXHRcdFx0XHRpZiAoYXR0clZhbHVlKSBhdHRyVmFsdWUgPSBhdHRyVmFsdWUucmVwbGFjZSgvXFxcXChbXCInXSkvZywgXCIkMVwiKS5yZXBsYWNlKC9cXFxcXFxcXC9nLCBcIlxcXFxcIilcblx0XHRcdFx0aWYgKG1hdGNoWzRdID09PSBcImNsYXNzXCIpIGNsYXNzZXMucHVzaChhdHRyVmFsdWUpXG5cdFx0XHRcdGVsc2UgYXR0cmlidXRlc1ttYXRjaFs0XV0gPSBhdHRyVmFsdWUgfHwgdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBhdHRyaWJ1dGVzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRzZWxlY3RvckNhY2hlW3NlbGVjdG9yXSA9IGZ1bmN0aW9uKGF0dHJzLCBjaGlsZHJlbikge1xuXHRcdFx0dmFyIGhhc0F0dHJzID0gZmFsc2UsIGNoaWxkTGlzdCwgdGV4dFxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzTmFtZSB8fCBhdHRycy5jbGFzc1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIGF0dHJzW2tleV0gPSBhdHRyaWJ1dGVzW2tleV1cblx0XHRcdGlmIChjbGFzc05hbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAoYXR0cnMuY2xhc3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGF0dHJzLmNsYXNzID0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0YXR0cnMuY2xhc3NOYW1lID0gY2xhc3NOYW1lXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGF0dHJpYnV0ZXMuY2xhc3NOYW1lICE9PSB1bmRlZmluZWQpIGF0dHJzLmNsYXNzTmFtZSA9IGF0dHJpYnV0ZXMuY2xhc3NOYW1lICsgXCIgXCIgKyBjbGFzc05hbWVcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRycykge1xuXHRcdFx0XHRpZiAoa2V5ICE9PSBcImtleVwiKSB7XG5cdFx0XHRcdFx0aGFzQXR0cnMgPSB0cnVlXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pICYmIGNoaWxkcmVuLmxlbmd0aCA9PSAxICYmIGNoaWxkcmVuWzBdICE9IG51bGwgJiYgY2hpbGRyZW5bMF0udGFnID09PSBcIiNcIikgdGV4dCA9IGNoaWxkcmVuWzBdLmNoaWxkcmVuXG5cdFx0XHRlbHNlIGNoaWxkTGlzdCA9IGNoaWxkcmVuXG5cdFx0XHRyZXR1cm4gVm5vZGUodGFnIHx8IFwiZGl2XCIsIGF0dHJzLmtleSwgaGFzQXR0cnMgPyBhdHRycyA6IHVuZGVmaW5lZCwgY2hpbGRMaXN0LCB0ZXh0LCB1bmRlZmluZWQpXG5cdFx0fVxuXHR9XG5cdHZhciBhdHRycywgY2hpbGRyZW4sIGNoaWxkcmVuSW5kZXhcblx0aWYgKGFyZ3VtZW50c1sxXSA9PSBudWxsIHx8IHR5cGVvZiBhcmd1bWVudHNbMV0gPT09IFwib2JqZWN0XCIgJiYgYXJndW1lbnRzWzFdLnRhZyA9PT0gdW5kZWZpbmVkICYmICFBcnJheS5pc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcblx0XHRhdHRycyA9IGFyZ3VtZW50c1sxXVxuXHRcdGNoaWxkcmVuSW5kZXggPSAyXG5cdH1cblx0ZWxzZSBjaGlsZHJlbkluZGV4ID0gMVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gY2hpbGRyZW5JbmRleCArIDEpIHtcblx0XHRjaGlsZHJlbiA9IEFycmF5LmlzQXJyYXkoYXJndW1lbnRzW2NoaWxkcmVuSW5kZXhdKSA/IGFyZ3VtZW50c1tjaGlsZHJlbkluZGV4XSA6IFthcmd1bWVudHNbY2hpbGRyZW5JbmRleF1dXG5cdH1cblx0ZWxzZSB7XG5cdFx0Y2hpbGRyZW4gPSBbXVxuXHRcdGZvciAodmFyIGkgPSBjaGlsZHJlbkluZGV4OyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBjaGlsZHJlbi5wdXNoKGFyZ3VtZW50c1tpXSlcblx0fVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSByZXR1cm4gc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0oYXR0cnMgfHwge30sIFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKSlcblx0cmV0dXJuIFZub2RlKHNlbGVjdG9yLCBhdHRycyAmJiBhdHRycy5rZXksIGF0dHJzIHx8IHt9LCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbiksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuaHlwZXJzY3JpcHQudHJ1c3QgPSBmdW5jdGlvbihodG1sKSB7XG5cdGlmIChodG1sID09IG51bGwpIGh0bWwgPSBcIlwiXG5cdHJldHVybiBWbm9kZShcIjxcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGh0bWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuaHlwZXJzY3JpcHQuZnJhZ21lbnQgPSBmdW5jdGlvbihhdHRyczEsIGNoaWxkcmVuKSB7XG5cdHJldHVybiBWbm9kZShcIltcIiwgYXR0cnMxLmtleSwgYXR0cnMxLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbiksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxudmFyIG0gPSBoeXBlcnNjcmlwdFxuLyoqIEBjb25zdHJ1Y3RvciAqL1xudmFyIFByb21pc2VQb2x5ZmlsbCA9IGZ1bmN0aW9uKGV4ZWN1dG9yKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpKSB0aHJvdyBuZXcgRXJyb3IoXCJQcm9taXNlIG11c3QgYmUgY2FsbGVkIHdpdGggYG5ld2BcIilcblx0aWYgKHR5cGVvZiBleGVjdXRvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpXG5cdHZhciBzZWxmID0gdGhpcywgcmVzb2x2ZXJzID0gW10sIHJlamVjdG9ycyA9IFtdLCByZXNvbHZlQ3VycmVudCA9IGhhbmRsZXIocmVzb2x2ZXJzLCB0cnVlKSwgcmVqZWN0Q3VycmVudCA9IGhhbmRsZXIocmVqZWN0b3JzLCBmYWxzZSlcblx0dmFyIGluc3RhbmNlID0gc2VsZi5faW5zdGFuY2UgPSB7cmVzb2x2ZXJzOiByZXNvbHZlcnMsIHJlamVjdG9yczogcmVqZWN0b3JzfVxuXHR2YXIgY2FsbEFzeW5jID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogc2V0VGltZW91dFxuXHRmdW5jdGlvbiBoYW5kbGVyKGxpc3QsIHNob3VsZEFic29yYikge1xuXHRcdHJldHVybiBmdW5jdGlvbiBleGVjdXRlKHZhbHVlKSB7XG5cdFx0XHR2YXIgdGhlblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKHNob3VsZEFic29yYiAmJiB2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpICYmIHR5cGVvZiAodGhlbiA9IHZhbHVlLnRoZW4pID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlIGNhbid0IGJlIHJlc29sdmVkIHcvIGl0c2VsZlwiKVxuXHRcdFx0XHRcdGV4ZWN1dGVPbmNlKHRoZW4uYmluZCh2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2FsbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFzaG91bGRBYnNvcmIgJiYgbGlzdC5sZW5ndGggPT09IDApIGNvbnNvbGUuZXJyb3IoXCJQb3NzaWJsZSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246XCIsIHZhbHVlKVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSBsaXN0W2ldKHZhbHVlKVxuXHRcdFx0XHRcdFx0cmVzb2x2ZXJzLmxlbmd0aCA9IDAsIHJlamVjdG9ycy5sZW5ndGggPSAwXG5cdFx0XHRcdFx0XHRpbnN0YW5jZS5zdGF0ZSA9IHNob3VsZEFic29yYlxuXHRcdFx0XHRcdFx0aW5zdGFuY2UucmV0cnkgPSBmdW5jdGlvbigpIHtleGVjdXRlKHZhbHVlKX1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3RDdXJyZW50KGUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGV4ZWN1dGVPbmNlKHRoZW4pIHtcblx0XHR2YXIgcnVucyA9IDBcblx0XHRmdW5jdGlvbiBydW4oZm4pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZiAocnVucysrID4gMCkgcmV0dXJuXG5cdFx0XHRcdGZuKHZhbHVlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgb25lcnJvciA9IHJ1bihyZWplY3RDdXJyZW50KVxuXHRcdHRyeSB7dGhlbihydW4ocmVzb2x2ZUN1cnJlbnQpLCBvbmVycm9yKX0gY2F0Y2ggKGUpIHtvbmVycm9yKGUpfVxuXHR9XG5cdGV4ZWN1dGVPbmNlKGV4ZWN1dG9yKVxufVxuUHJvbWlzZVBvbHlmaWxsLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0aW9uKSB7XG5cdHZhciBzZWxmID0gdGhpcywgaW5zdGFuY2UgPSBzZWxmLl9pbnN0YW5jZVxuXHRmdW5jdGlvbiBoYW5kbGUoY2FsbGJhY2ssIGxpc3QsIG5leHQsIHN0YXRlKSB7XG5cdFx0bGlzdC5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIG5leHQodmFsdWUpXG5cdFx0XHRlbHNlIHRyeSB7cmVzb2x2ZU5leHQoY2FsbGJhY2sodmFsdWUpKX0gY2F0Y2ggKGUpIHtpZiAocmVqZWN0TmV4dCkgcmVqZWN0TmV4dChlKX1cblx0XHR9KVxuXHRcdGlmICh0eXBlb2YgaW5zdGFuY2UucmV0cnkgPT09IFwiZnVuY3Rpb25cIiAmJiBzdGF0ZSA9PT0gaW5zdGFuY2Uuc3RhdGUpIGluc3RhbmNlLnJldHJ5KClcblx0fVxuXHR2YXIgcmVzb2x2ZU5leHQsIHJlamVjdE5leHRcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3Jlc29sdmVOZXh0ID0gcmVzb2x2ZSwgcmVqZWN0TmV4dCA9IHJlamVjdH0pXG5cdGhhbmRsZShvbkZ1bGZpbGxlZCwgaW5zdGFuY2UucmVzb2x2ZXJzLCByZXNvbHZlTmV4dCwgdHJ1ZSksIGhhbmRsZShvblJlamVjdGlvbiwgaW5zdGFuY2UucmVqZWN0b3JzLCByZWplY3ROZXh0LCBmYWxzZSlcblx0cmV0dXJuIHByb21pc2Vcbn1cblByb21pc2VQb2x5ZmlsbC5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbihvblJlamVjdGlvbikge1xuXHRyZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpIHJldHVybiB2YWx1ZVxuXHRyZXR1cm4gbmV3IFByb21pc2VQb2x5ZmlsbChmdW5jdGlvbihyZXNvbHZlKSB7cmVzb2x2ZSh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3JlamVjdCh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLmFsbCA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0dmFyIHRvdGFsID0gbGlzdC5sZW5ndGgsIGNvdW50ID0gMCwgdmFsdWVzID0gW11cblx0XHRpZiAobGlzdC5sZW5ndGggPT09IDApIHJlc29sdmUoW10pXG5cdFx0ZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdChmdW5jdGlvbihpKSB7XG5cdFx0XHRcdGZ1bmN0aW9uIGNvbnN1bWUodmFsdWUpIHtcblx0XHRcdFx0XHRjb3VudCsrXG5cdFx0XHRcdFx0dmFsdWVzW2ldID0gdmFsdWVcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IHRvdGFsKSByZXNvbHZlKHZhbHVlcylcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobGlzdFtpXSAhPSBudWxsICYmICh0eXBlb2YgbGlzdFtpXSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgbGlzdFtpXSA9PT0gXCJmdW5jdGlvblwiKSAmJiB0eXBlb2YgbGlzdFtpXS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRsaXN0W2ldLnRoZW4oY29uc3VtZSwgcmVqZWN0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgY29uc3VtZShsaXN0W2ldKVxuXHRcdFx0fSkoaSlcblx0XHR9XG5cdH0pXG59XG5Qcm9taXNlUG9seWZpbGwucmFjZSA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaXN0W2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuXHRcdH1cblx0fSlcbn1cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93LlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSB3aW5kb3cuUHJvbWlzZVxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsLlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIGdsb2JhbC5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSBnbG9iYWwuUHJvbWlzZVxufSBlbHNlIHtcbn1cbnZhciBidWlsZFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIFwiXCJcblx0dmFyIGFyZ3MgPSBbXVxuXHRmb3IgKHZhciBrZXkwIGluIG9iamVjdCkge1xuXHRcdGRlc3RydWN0dXJlKGtleTAsIG9iamVjdFtrZXkwXSlcblx0fVxuXHRyZXR1cm4gYXJncy5qb2luKFwiJlwiKVxuXHRmdW5jdGlvbiBkZXN0cnVjdHVyZShrZXkwLCB2YWx1ZSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkwICsgXCJbXCIgKyBpICsgXCJdXCIsIHZhbHVlW2ldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIHZhbHVlKSB7XG5cdFx0XHRcdGRlc3RydWN0dXJlKGtleTAgKyBcIltcIiArIGkgKyBcIl1cIiwgdmFsdWVbaV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgYXJncy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkwKSArICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBcIlwiID8gXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpIDogXCJcIikpXG5cdH1cbn1cbnZhciBfOCA9IGZ1bmN0aW9uKCR3aW5kb3csIFByb21pc2UpIHtcblx0dmFyIGNhbGxiYWNrQ291bnQgPSAwXG5cdHZhciBvbmNvbXBsZXRpb25cblx0ZnVuY3Rpb24gc2V0Q29tcGxldGlvbkNhbGxiYWNrKGNhbGxiYWNrKSB7b25jb21wbGV0aW9uID0gY2FsbGJhY2t9XG5cdGZ1bmN0aW9uIGZpbmFsaXplcigpIHtcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0ZnVuY3Rpb24gY29tcGxldGUoKSB7aWYgKC0tY291bnQgPT09IDAgJiYgdHlwZW9mIG9uY29tcGxldGlvbiA9PT0gXCJmdW5jdGlvblwiKSBvbmNvbXBsZXRpb24oKX1cblx0XHRyZXR1cm4gZnVuY3Rpb24gZmluYWxpemUocHJvbWlzZTApIHtcblx0XHRcdHZhciB0aGVuMCA9IHByb21pc2UwLnRoZW5cblx0XHRcdHByb21pc2UwLnRoZW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y291bnQrK1xuXHRcdFx0XHR2YXIgbmV4dCA9IHRoZW4wLmFwcGx5KHByb21pc2UwLCBhcmd1bWVudHMpXG5cdFx0XHRcdG5leHQudGhlbihjb21wbGV0ZSwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdGNvbXBsZXRlKClcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IDApIHRocm93IGVcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIGZpbmFsaXplKG5leHQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTBcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKSB7XG5cdFx0aWYgKHR5cGVvZiBhcmdzID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR2YXIgdXJsID0gYXJnc1xuXHRcdFx0YXJncyA9IGV4dHJhIHx8IHt9XG5cdFx0XHRpZiAoYXJncy51cmwgPT0gbnVsbCkgYXJncy51cmwgPSB1cmxcblx0XHR9XG5cdFx0cmV0dXJuIGFyZ3Ncblx0fVxuXHRmdW5jdGlvbiByZXF1ZXN0KGFyZ3MsIGV4dHJhKSB7XG5cdFx0dmFyIGZpbmFsaXplID0gZmluYWxpemVyKClcblx0XHRhcmdzID0gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKVxuXHRcdHZhciBwcm9taXNlMCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0aWYgKGFyZ3MubWV0aG9kID09IG51bGwpIGFyZ3MubWV0aG9kID0gXCJHRVRcIlxuXHRcdFx0YXJncy5tZXRob2QgPSBhcmdzLm1ldGhvZC50b1VwcGVyQ2FzZSgpXG5cdFx0XHR2YXIgdXNlQm9keSA9IHR5cGVvZiBhcmdzLnVzZUJvZHkgPT09IFwiYm9vbGVhblwiID8gYXJncy51c2VCb2R5IDogYXJncy5tZXRob2QgIT09IFwiR0VUXCIgJiYgYXJncy5tZXRob2QgIT09IFwiVFJBQ0VcIlxuXHRcdFx0aWYgKHR5cGVvZiBhcmdzLnNlcmlhbGl6ZSAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLnNlcmlhbGl6ZSA9IHR5cGVvZiBGb3JtRGF0YSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhcmdzLmRhdGEgaW5zdGFuY2VvZiBGb3JtRGF0YSA/IGZ1bmN0aW9uKHZhbHVlKSB7cmV0dXJuIHZhbHVlfSA6IEpTT04uc3RyaW5naWZ5XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZGVzZXJpYWxpemUgIT09IFwiZnVuY3Rpb25cIikgYXJncy5kZXNlcmlhbGl6ZSA9IGRlc2VyaWFsaXplXG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZXh0cmFjdCAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLmV4dHJhY3QgPSBleHRyYWN0XG5cdFx0XHRhcmdzLnVybCA9IGludGVycG9sYXRlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHRpZiAodXNlQm9keSkgYXJncy5kYXRhID0gYXJncy5zZXJpYWxpemUoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSBhcmdzLnVybCA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHR2YXIgeGhyID0gbmV3ICR3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuXHRcdFx0eGhyLm9wZW4oYXJncy5tZXRob2QsIGFyZ3MudXJsLCB0eXBlb2YgYXJncy5hc3luYyA9PT0gXCJib29sZWFuXCIgPyBhcmdzLmFzeW5jIDogdHJ1ZSwgdHlwZW9mIGFyZ3MudXNlciA9PT0gXCJzdHJpbmdcIiA/IGFyZ3MudXNlciA6IHVuZGVmaW5lZCwgdHlwZW9mIGFyZ3MucGFzc3dvcmQgPT09IFwic3RyaW5nXCIgPyBhcmdzLnBhc3N3b3JkIDogdW5kZWZpbmVkKVxuXHRcdFx0aWYgKGFyZ3Muc2VyaWFsaXplID09PSBKU09OLnN0cmluZ2lmeSAmJiB1c2VCb2R5KSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGVzZXJpYWxpemUgPT09IGRlc2VyaWFsaXplKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy53aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSBhcmdzLndpdGhDcmVkZW50aWFsc1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZ3MuaGVhZGVycykgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwoYXJncy5oZWFkZXJzLCBrZXkpKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgYXJncy5oZWFkZXJzW2tleV0pXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuY29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHhociA9IGFyZ3MuY29uZmlnKHhociwgYXJncykgfHwgeGhyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIERvbid0IHRocm93IGVycm9ycyBvbiB4aHIuYWJvcnQoKS4gWE1MSHR0cFJlcXVlc3RzIGVuZHMgdXAgaW4gYSBzdGF0ZSBvZlxuXHRcdFx0XHQvLyB4aHIuc3RhdHVzID09IDAgYW5kIHhoci5yZWFkeVN0YXRlID09IDQgaWYgYWJvcnRlZCBhZnRlciBvcGVuLCBidXQgYmVmb3JlIGNvbXBsZXRpb24uXG5cdFx0XHRcdGlmICh4aHIuc3RhdHVzICYmIHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHZhciByZXNwb25zZSA9IChhcmdzLmV4dHJhY3QgIT09IGV4dHJhY3QpID8gYXJncy5leHRyYWN0KHhociwgYXJncykgOiBhcmdzLmRlc2VyaWFsaXplKGFyZ3MuZXh0cmFjdCh4aHIsIGFyZ3MpKVxuXHRcdFx0XHRcdFx0aWYgKCh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB8fCB4aHIuc3RhdHVzID09PSAzMDQpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShjYXN0KGFyZ3MudHlwZSwgcmVzcG9uc2UpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IG5ldyBFcnJvcih4aHIucmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVzcG9uc2UpIGVycm9yW2tleV0gPSByZXNwb25zZVtrZXldXG5cdFx0XHRcdFx0XHRcdHJlamVjdChlcnJvcilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHJlamVjdChlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHVzZUJvZHkgJiYgKGFyZ3MuZGF0YSAhPSBudWxsKSkgeGhyLnNlbmQoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSB4aHIuc2VuZCgpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlID8gcHJvbWlzZTAgOiBmaW5hbGl6ZShwcm9taXNlMClcblx0fVxuXHRmdW5jdGlvbiBqc29ucChhcmdzLCBleHRyYSkge1xuXHRcdHZhciBmaW5hbGl6ZSA9IGZpbmFsaXplcigpXG5cdFx0YXJncyA9IG5vcm1hbGl6ZShhcmdzLCBleHRyYSlcblx0XHR2YXIgcHJvbWlzZTAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdHZhciBjYWxsYmFja05hbWUgPSBhcmdzLmNhbGxiYWNrTmFtZSB8fCBcIl9taXRocmlsX1wiICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikgKyBcIl9cIiArIGNhbGxiYWNrQ291bnQrK1xuXHRcdFx0dmFyIHNjcmlwdCA9ICR3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKVxuXHRcdFx0JHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlc29sdmUoY2FzdChhcmdzLnR5cGUsIGRhdGEpKVxuXHRcdFx0XHRkZWxldGUgJHdpbmRvd1tjYWxsYmFja05hbWVdXG5cdFx0XHR9XG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoXCJKU09OUCByZXF1ZXN0IGZhaWxlZFwiKSlcblx0XHRcdFx0ZGVsZXRlICR3aW5kb3dbY2FsbGJhY2tOYW1lXVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGF0YSA9PSBudWxsKSBhcmdzLmRhdGEgPSB7fVxuXHRcdFx0YXJncy51cmwgPSBpbnRlcnBvbGF0ZShhcmdzLnVybCwgYXJncy5kYXRhKVxuXHRcdFx0YXJncy5kYXRhW2FyZ3MuY2FsbGJhY2tLZXkgfHwgXCJjYWxsYmFja1wiXSA9IGNhbGxiYWNrTmFtZVxuXHRcdFx0c2NyaXB0LnNyYyA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHQkd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChzY3JpcHQpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlPyBwcm9taXNlMCA6IGZpbmFsaXplKHByb21pc2UwKVxuXHR9XG5cdGZ1bmN0aW9uIGludGVycG9sYXRlKHVybCwgZGF0YSkge1xuXHRcdGlmIChkYXRhID09IG51bGwpIHJldHVybiB1cmxcblx0XHR2YXIgdG9rZW5zID0gdXJsLm1hdGNoKC86W15cXC9dKy9naSkgfHwgW11cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IHRva2Vuc1tpXS5zbGljZSgxKVxuXHRcdFx0aWYgKGRhdGFba2V5XSAhPSBudWxsKSB7XG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2Vuc1tpXSwgZGF0YVtrZXldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdXJsXG5cdH1cblx0ZnVuY3Rpb24gYXNzZW1ibGUodXJsLCBkYXRhKSB7XG5cdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKVxuXHRcdGlmIChxdWVyeXN0cmluZyAhPT0gXCJcIikge1xuXHRcdFx0dmFyIHByZWZpeCA9IHVybC5pbmRleE9mKFwiP1wiKSA8IDAgPyBcIj9cIiA6IFwiJlwiXG5cdFx0XHR1cmwgKz0gcHJlZml4ICsgcXVlcnlzdHJpbmdcblx0XHR9XG5cdFx0cmV0dXJuIHVybFxuXHR9XG5cdGZ1bmN0aW9uIGRlc2VyaWFsaXplKGRhdGEpIHtcblx0XHR0cnkge3JldHVybiBkYXRhICE9PSBcIlwiID8gSlNPTi5wYXJzZShkYXRhKSA6IG51bGx9XG5cdFx0Y2F0Y2ggKGUpIHt0aHJvdyBuZXcgRXJyb3IoZGF0YSl9XG5cdH1cblx0ZnVuY3Rpb24gZXh0cmFjdCh4aHIpIHtyZXR1cm4geGhyLnJlc3BvbnNlVGV4dH1cblx0ZnVuY3Rpb24gY2FzdCh0eXBlMCwgZGF0YSkge1xuXHRcdGlmICh0eXBlb2YgdHlwZTAgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZGF0YVtpXSA9IG5ldyB0eXBlMChkYXRhW2ldKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHJldHVybiBuZXcgdHlwZTAoZGF0YSlcblx0XHR9XG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXHRyZXR1cm4ge3JlcXVlc3Q6IHJlcXVlc3QsIGpzb25wOiBqc29ucCwgc2V0Q29tcGxldGlvbkNhbGxiYWNrOiBzZXRDb21wbGV0aW9uQ2FsbGJhY2t9XG59XG52YXIgcmVxdWVzdFNlcnZpY2UgPSBfOCh3aW5kb3csIFByb21pc2VQb2x5ZmlsbClcbnZhciBjb3JlUmVuZGVyZXIgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciAkZG9jID0gJHdpbmRvdy5kb2N1bWVudFxuXHR2YXIgJGVtcHR5RnJhZ21lbnQgPSAkZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHR2YXIgb25ldmVudFxuXHRmdW5jdGlvbiBzZXRFdmVudENhbGxiYWNrKGNhbGxiYWNrKSB7cmV0dXJuIG9uZXZlbnQgPSBjYWxsYmFja31cblx0Ly9jcmVhdGVcblx0ZnVuY3Rpb24gY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCBlbmQsIGhvb2tzLCBuZXh0U2libGluZywgbnMpIHtcblx0XHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0dmFyIHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgaW5pdExpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdGlmICh0eXBlb2YgdGFnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRzd2l0Y2ggKHRhZykge1xuXHRcdFx0XHRjYXNlIFwiI1wiOiByZXR1cm4gY3JlYXRlVGV4dChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHRcdFx0Y2FzZSBcIjxcIjogcmV0dXJuIGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdGNhc2UgXCJbXCI6IHJldHVybiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRkZWZhdWx0OiByZXR1cm4gY3JlYXRlRWxlbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHJldHVybiBjcmVhdGVDb21wb25lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVUZXh0KHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0dm5vZGUuZG9tID0gJGRvYy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS5jaGlsZHJlbilcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgdm5vZGUuZG9tLCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZykge1xuXHRcdHZhciBtYXRjaDEgPSB2bm9kZS5jaGlsZHJlbi5tYXRjaCgvXlxccyo/PChcXHcrKS9pbSkgfHwgW11cblx0XHR2YXIgcGFyZW50MSA9IHtjYXB0aW9uOiBcInRhYmxlXCIsIHRoZWFkOiBcInRhYmxlXCIsIHRib2R5OiBcInRhYmxlXCIsIHRmb290OiBcInRhYmxlXCIsIHRyOiBcInRib2R5XCIsIHRoOiBcInRyXCIsIHRkOiBcInRyXCIsIGNvbGdyb3VwOiBcInRhYmxlXCIsIGNvbDogXCJjb2xncm91cFwifVttYXRjaDFbMV1dIHx8IFwiZGl2XCJcblx0XHR2YXIgdGVtcCA9ICRkb2MuY3JlYXRlRWxlbWVudChwYXJlbnQxKVxuXHRcdHRlbXAuaW5uZXJIVE1MID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSB0ZW1wLmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gdGVtcC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdHZhciBmcmFnbWVudCA9ICRkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0dmFyIGNoaWxkXG5cdFx0d2hpbGUgKGNoaWxkID0gdGVtcC5maXJzdENoaWxkKSB7XG5cdFx0XHRmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0XHR9XG5cdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGZyYWdtZW50LCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gZnJhZ21lbnRcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRpZiAodm5vZGUuY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGNyZWF0ZU5vZGVzKGZyYWdtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGZyYWdtZW50LmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGhcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHRcdHJldHVybiBmcmFnbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHRzd2l0Y2ggKHZub2RlLnRhZykge1xuXHRcdFx0Y2FzZSBcInN2Z1wiOiBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjsgYnJlYWtcblx0XHRcdGNhc2UgXCJtYXRoXCI6IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCI7IGJyZWFrXG5cdFx0fVxuXHRcdHZhciBhdHRyczIgPSB2bm9kZS5hdHRyc1xuXHRcdHZhciBpcyA9IGF0dHJzMiAmJiBhdHRyczIuaXNcblx0XHR2YXIgZWxlbWVudCA9IG5zID9cblx0XHRcdGlzID8gJGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZywge2lzOiBpc30pIDogJGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZykgOlxuXHRcdFx0aXMgPyAkZG9jLmNyZWF0ZUVsZW1lbnQodGFnLCB7aXM6IGlzfSkgOiAkZG9jLmNyZWF0ZUVsZW1lbnQodGFnKVxuXHRcdHZub2RlLmRvbSA9IGVsZW1lbnRcblx0XHRpZiAoYXR0cnMyICE9IG51bGwpIHtcblx0XHRcdHNldEF0dHJzKHZub2RlLCBhdHRyczIsIG5zKVxuXHRcdH1cblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdm5vZGUuYXR0cnMuY29udGVudGVkaXRhYmxlICE9IG51bGwpIHtcblx0XHRcdHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSlcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodm5vZGUudGV4dCAhPSBudWxsKSB7XG5cdFx0XHRcdGlmICh2bm9kZS50ZXh0ICE9PSBcIlwiKSBlbGVtZW50LnRleHRDb250ZW50ID0gdm5vZGUudGV4dFxuXHRcdFx0XHRlbHNlIHZub2RlLmNoaWxkcmVuID0gW1Zub2RlKFwiI1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdm5vZGUudGV4dCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXVxuXHRcdFx0fVxuXHRcdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdFx0Y3JlYXRlTm9kZXMoZWxlbWVudCwgY2hpbGRyZW4sIDAsIGNoaWxkcmVuLmxlbmd0aCwgaG9va3MsIG51bGwsIG5zKVxuXHRcdFx0XHRzZXRMYXRlQXR0cnModm5vZGUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBlbGVtZW50XG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpIHtcblx0XHR2bm9kZS5zdGF0ZSA9IE9iamVjdC5jcmVhdGUodm5vZGUudGFnKVxuXHRcdHZhciB2aWV3ID0gdm5vZGUudGFnLnZpZXdcblx0XHRpZiAodmlldy5yZWVudHJhbnRMb2NrICE9IG51bGwpIHJldHVybiAkZW1wdHlGcmFnbWVudFxuXHRcdHZpZXcucmVlbnRyYW50TG9jayA9IHRydWVcblx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLnRhZywgdm5vZGUsIGhvb2tzKVxuXHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKHZpZXcuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHRcdHZpZXcucmVlbnRyYW50TG9jayA9IG51bGxcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHZub2RlLmluc3RhbmNlID09PSB2bm9kZSkgdGhyb3cgRXJyb3IoXCJBIHZpZXcgY2Fubm90IHJldHVybiB0aGUgdm5vZGUgaXQgcmVjZWl2ZWQgYXMgYXJndW1lbnRzXCIpXG5cdFx0XHR2YXIgZWxlbWVudCA9IGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmRvbSAhPSBudWxsID8gdm5vZGUuaW5zdGFuY2UuZG9tU2l6ZSA6IDBcblx0XHRcdGluc2VydE5vZGUocGFyZW50LCBlbGVtZW50LCBuZXh0U2libGluZylcblx0XHRcdHJldHVybiBlbGVtZW50XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IDBcblx0XHRcdHJldHVybiAkZW1wdHlGcmFnbWVudFxuXHRcdH1cblx0fVxuXHQvL3VwZGF0ZVxuXHRmdW5jdGlvbiB1cGRhdGVOb2RlcyhwYXJlbnQsIG9sZCwgdm5vZGVzLCByZWN5Y2xpbmcsIGhvb2tzLCBuZXh0U2libGluZywgbnMpIHtcblx0XHRpZiAob2xkID09PSB2bm9kZXMgfHwgb2xkID09IG51bGwgJiYgdm5vZGVzID09IG51bGwpIHJldHVyblxuXHRcdGVsc2UgaWYgKG9sZCA9PSBudWxsKSBjcmVhdGVOb2RlcyhwYXJlbnQsIHZub2RlcywgMCwgdm5vZGVzLmxlbmd0aCwgaG9va3MsIG5leHRTaWJsaW5nLCB1bmRlZmluZWQpXG5cdFx0ZWxzZSBpZiAodm5vZGVzID09IG51bGwpIHJlbW92ZU5vZGVzKG9sZCwgMCwgb2xkLmxlbmd0aCwgdm5vZGVzKVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKG9sZC5sZW5ndGggPT09IHZub2Rlcy5sZW5ndGgpIHtcblx0XHRcdFx0dmFyIGlzVW5rZXllZCA9IGZhbHNlXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKHZub2Rlc1tpXSAhPSBudWxsICYmIG9sZFtpXSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRpc1Vua2V5ZWQgPSB2bm9kZXNbaV0ua2V5ID09IG51bGwgJiYgb2xkW2ldLmtleSA9PSBudWxsXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNVbmtleWVkKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmIChvbGRbaV0gPT09IHZub2Rlc1tpXSkgY29udGludWVcblx0XHRcdFx0XHRcdGVsc2UgaWYgKG9sZFtpXSA9PSBudWxsICYmIHZub2Rlc1tpXSAhPSBudWxsKSBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGVzW2ldLCBob29rcywgbnMsIGdldE5leHRTaWJsaW5nKG9sZCwgaSArIDEsIG5leHRTaWJsaW5nKSlcblx0XHRcdFx0XHRcdGVsc2UgaWYgKHZub2Rlc1tpXSA9PSBudWxsKSByZW1vdmVOb2RlcyhvbGQsIGksIGkgKyAxLCB2bm9kZXMpXG5cdFx0XHRcdFx0XHRlbHNlIHVwZGF0ZU5vZGUocGFyZW50LCBvbGRbaV0sIHZub2Rlc1tpXSwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgaSArIDEsIG5leHRTaWJsaW5nKSwgZmFsc2UsIG5zKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVjeWNsaW5nID0gcmVjeWNsaW5nIHx8IGlzUmVjeWNsYWJsZShvbGQsIHZub2Rlcylcblx0XHRcdGlmIChyZWN5Y2xpbmcpIG9sZCA9IG9sZC5jb25jYXQob2xkLnBvb2wpXG5cdFx0XHRcblx0XHRcdHZhciBvbGRTdGFydCA9IDAsIHN0YXJ0ID0gMCwgb2xkRW5kID0gb2xkLmxlbmd0aCAtIDEsIGVuZCA9IHZub2Rlcy5sZW5ndGggLSAxLCBtYXBcblx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdHZhciBvID0gb2xkW29sZFN0YXJ0XSwgdiA9IHZub2Rlc1tzdGFydF1cblx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkU3RhcnQrKywgc3RhcnQrK1xuXHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZFN0YXJ0Kytcblx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdGVsc2UgaWYgKG8ua2V5ID09PSB2LmtleSkge1xuXHRcdFx0XHRcdG9sZFN0YXJ0KyssIHN0YXJ0Kytcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG5leHRTaWJsaW5nKSwgcmVjeWNsaW5nLCBucylcblx0XHRcdFx0XHRpZiAocmVjeWNsaW5nICYmIG8udGFnID09PSB2LnRhZykgaW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobyksIG5leHRTaWJsaW5nKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHZhciBvID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHRpZiAobyA9PT0gdiAmJiAhcmVjeWNsaW5nKSBvbGRFbmQtLSwgc3RhcnQrK1xuXHRcdFx0XHRcdGVsc2UgaWYgKG8gPT0gbnVsbCkgb2xkRW5kLS1cblx0XHRcdFx0XHRlbHNlIGlmICh2ID09IG51bGwpIHN0YXJ0Kytcblx0XHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRFbmQgKyAxLCBuZXh0U2libGluZyksIHJlY3ljbGluZywgbnMpXG5cdFx0XHRcdFx0XHRpZiAocmVjeWNsaW5nIHx8IHN0YXJ0IDwgZW5kKSBpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChvKSwgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRTdGFydCwgbmV4dFNpYmxpbmcpKVxuXHRcdFx0XHRcdFx0b2xkRW5kLS0sIHN0YXJ0Kytcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBicmVha1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRFbmRdLCB2ID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkRW5kLS0sIGVuZC0tXG5cdFx0XHRcdGVsc2UgaWYgKG8gPT0gbnVsbCkgb2xkRW5kLS1cblx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBlbmQtLVxuXHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkRW5kICsgMSwgbmV4dFNpYmxpbmcpLCByZWN5Y2xpbmcsIG5zKVxuXHRcdFx0XHRcdGlmIChyZWN5Y2xpbmcgJiYgby50YWcgPT09IHYudGFnKSBpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChvKSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0aWYgKG8uZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gby5kb21cblx0XHRcdFx0XHRvbGRFbmQtLSwgZW5kLS1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiAoIW1hcCkgbWFwID0gZ2V0S2V5TWFwKG9sZCwgb2xkRW5kKVxuXHRcdFx0XHRcdGlmICh2ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdHZhciBvbGRJbmRleCA9IG1hcFt2LmtleV1cblx0XHRcdFx0XHRcdGlmIChvbGRJbmRleCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBtb3ZhYmxlID0gb2xkW29sZEluZGV4XVxuXHRcdFx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbW92YWJsZSwgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkRW5kICsgMSwgbmV4dFNpYmxpbmcpLCByZWN5Y2xpbmcsIG5zKVxuXHRcdFx0XHRcdFx0XHRpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChtb3ZhYmxlKSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0XHRcdG9sZFtvbGRJbmRleF0uc2tpcCA9IHRydWVcblx0XHRcdFx0XHRcdFx0aWYgKG1vdmFibGUuZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gbW92YWJsZS5kb21cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR2YXIgZG9tID0gY3JlYXRlTm9kZShwYXJlbnQsIHYsIGhvb2tzLCB1bmRlZmluZWQsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdFx0XHRuZXh0U2libGluZyA9IGRvbVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbmQtLVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChlbmQgPCBzdGFydCkgYnJlYWtcblx0XHRcdH1cblx0XHRcdGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kICsgMSwgaG9va3MsIG5leHRTaWJsaW5nLCBucylcblx0XHRcdHJlbW92ZU5vZGVzKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEsIHZub2Rlcylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlTm9kZShwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucykge1xuXHRcdHZhciBvbGRUYWcgPSBvbGQudGFnLCB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAob2xkVGFnID09PSB0YWcpIHtcblx0XHRcdHZub2RlLnN0YXRlID0gb2xkLnN0YXRlXG5cdFx0XHR2bm9kZS5ldmVudHMgPSBvbGQuZXZlbnRzXG5cdFx0XHRpZiAoc2hvdWxkVXBkYXRlKHZub2RlLCBvbGQpKSByZXR1cm5cblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSB7XG5cdFx0XHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzLCByZWN5Y2xpbmcpXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIG9sZFRhZyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzd2l0Y2ggKG9sZFRhZykge1xuXHRcdFx0XHRcdGNhc2UgXCIjXCI6IHVwZGF0ZVRleHQob2xkLCB2bm9kZSk7IGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBcIjxcIjogdXBkYXRlSFRNTChwYXJlbnQsIG9sZCwgdm5vZGUsIG5leHRTaWJsaW5nKTsgYnJlYWtcblx0XHRcdFx0XHRjYXNlIFwiW1wiOiB1cGRhdGVGcmFnbWVudChwYXJlbnQsIG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucyk7IGJyZWFrXG5cdFx0XHRcdFx0ZGVmYXVsdDogdXBkYXRlRWxlbWVudChvbGQsIHZub2RlLCByZWN5Y2xpbmcsIGhvb2tzLCBucylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB1cGRhdGVDb21wb25lbnQocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIHJlY3ljbGluZywgbnMpXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVtb3ZlTm9kZShvbGQsIG51bGwpXG5cdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZVRleHQob2xkLCB2bm9kZSkge1xuXHRcdGlmIChvbGQuY2hpbGRyZW4udG9TdHJpbmcoKSAhPT0gdm5vZGUuY2hpbGRyZW4udG9TdHJpbmcoKSkge1xuXHRcdFx0b2xkLmRvbS5ub2RlVmFsdWUgPSB2bm9kZS5jaGlsZHJlblxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlSFRNTChwYXJlbnQsIG9sZCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbiAhPT0gdm5vZGUuY2hpbGRyZW4pIHtcblx0XHRcdHRvRnJhZ21lbnQob2xkKVxuXHRcdFx0Y3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHR9XG5cdFx0ZWxzZSB2bm9kZS5kb20gPSBvbGQuZG9tLCB2bm9kZS5kb21TaXplID0gb2xkLmRvbVNpemVcblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVGcmFnbWVudChwYXJlbnQsIG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucykge1xuXHRcdHVwZGF0ZU5vZGVzKHBhcmVudCwgb2xkLmNoaWxkcmVuLCB2bm9kZS5jaGlsZHJlbiwgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKVxuXHRcdHZhciBkb21TaXplID0gMCwgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdHZub2RlLmRvbSA9IG51bGxcblx0XHRpZiAoY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRpZiAoY2hpbGQgIT0gbnVsbCAmJiBjaGlsZC5kb20gIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmICh2bm9kZS5kb20gPT0gbnVsbCkgdm5vZGUuZG9tID0gY2hpbGQuZG9tXG5cdFx0XHRcdFx0ZG9tU2l6ZSArPSBjaGlsZC5kb21TaXplIHx8IDFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGRvbVNpemUgIT09IDEpIHZub2RlLmRvbVNpemUgPSBkb21TaXplXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQob2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbnMpIHtcblx0XHR2YXIgZWxlbWVudCA9IHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRzd2l0Y2ggKHZub2RlLnRhZykge1xuXHRcdFx0Y2FzZSBcInN2Z1wiOiBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjsgYnJlYWtcblx0XHRcdGNhc2UgXCJtYXRoXCI6IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCI7IGJyZWFrXG5cdFx0fVxuXHRcdGlmICh2bm9kZS50YWcgPT09IFwidGV4dGFyZWFcIikge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0XHRcdGlmICh2bm9kZS50ZXh0ICE9IG51bGwpIHtcblx0XHRcdFx0dm5vZGUuYXR0cnMudmFsdWUgPSB2bm9kZS50ZXh0IC8vRklYTUUgaGFuZGxlMCBtdWx0aXBsZSBjaGlsZHJlblxuXHRcdFx0XHR2bm9kZS50ZXh0ID0gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHVwZGF0ZUF0dHJzKHZub2RlLCBvbGQuYXR0cnMsIHZub2RlLmF0dHJzLCBucylcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCAmJiB2bm9kZS5hdHRycy5jb250ZW50ZWRpdGFibGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q29udGVudEVkaXRhYmxlKHZub2RlKVxuXHRcdH1cblx0XHRlbHNlIGlmIChvbGQudGV4dCAhPSBudWxsICYmIHZub2RlLnRleHQgIT0gbnVsbCAmJiB2bm9kZS50ZXh0ICE9PSBcIlwiKSB7XG5cdFx0XHRpZiAob2xkLnRleHQudG9TdHJpbmcoKSAhPT0gdm5vZGUudGV4dC50b1N0cmluZygpKSBvbGQuZG9tLmZpcnN0Q2hpbGQubm9kZVZhbHVlID0gdm5vZGUudGV4dFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQudGV4dCAhPSBudWxsKSBvbGQuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvbGQudGV4dCwgdW5kZWZpbmVkLCBvbGQuZG9tLmZpcnN0Q2hpbGQpXVxuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkgdm5vZGUuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB2bm9kZS50ZXh0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCldXG5cdFx0XHR1cGRhdGVOb2RlcyhlbGVtZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCByZWN5Y2xpbmcsIGhvb2tzLCBudWxsLCBucylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlQ29tcG9uZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgaG9va3MsIG5leHRTaWJsaW5nLCByZWN5Y2xpbmcsIG5zKSB7XG5cdFx0dm5vZGUuaW5zdGFuY2UgPSBWbm9kZS5ub3JtYWxpemUodm5vZGUudGFnLnZpZXcuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS50YWcsIHZub2RlLCBob29rcywgcmVjeWNsaW5nKVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAob2xkLmluc3RhbmNlID09IG51bGwpIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmluc3RhbmNlLmRvbVNpemVcblx0XHR9XG5cdFx0ZWxzZSBpZiAob2xkLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdHJlbW92ZU5vZGUob2xkLmluc3RhbmNlLCBudWxsKVxuXHRcdFx0dm5vZGUuZG9tID0gdW5kZWZpbmVkXG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBpc1JlY3ljbGFibGUob2xkLCB2bm9kZXMpIHtcblx0XHRpZiAob2xkLnBvb2wgIT0gbnVsbCAmJiBNYXRoLmFicyhvbGQucG9vbC5sZW5ndGggLSB2bm9kZXMubGVuZ3RoKSA8PSBNYXRoLmFicyhvbGQubGVuZ3RoIC0gdm5vZGVzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBvbGRDaGlsZHJlbkxlbmd0aCA9IG9sZFswXSAmJiBvbGRbMF0uY2hpbGRyZW4gJiYgb2xkWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHR2YXIgcG9vbENoaWxkcmVuTGVuZ3RoID0gb2xkLnBvb2xbMF0gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4ubGVuZ3RoIHx8IDBcblx0XHRcdHZhciB2bm9kZXNDaGlsZHJlbkxlbmd0aCA9IHZub2Rlc1swXSAmJiB2bm9kZXNbMF0uY2hpbGRyZW4gJiYgdm5vZGVzWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHRpZiAoTWF0aC5hYnMocG9vbENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpIDw9IE1hdGguYWJzKG9sZENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cdGZ1bmN0aW9uIGdldEtleU1hcCh2bm9kZXMsIGVuZCkge1xuXHRcdHZhciBtYXAgPSB7fSwgaSA9IDBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHR2YXIgdm5vZGUgPSB2bm9kZXNbaV1cblx0XHRcdGlmICh2bm9kZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBrZXkyID0gdm5vZGUua2V5XG5cdFx0XHRcdGlmIChrZXkyICE9IG51bGwpIG1hcFtrZXkyXSA9IGlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1hcFxuXHR9XG5cdGZ1bmN0aW9uIHRvRnJhZ21lbnQodm5vZGUpIHtcblx0XHR2YXIgY291bnQwID0gdm5vZGUuZG9tU2l6ZVxuXHRcdGlmIChjb3VudDAgIT0gbnVsbCB8fCB2bm9kZS5kb20gPT0gbnVsbCkge1xuXHRcdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRcdGlmIChjb3VudDAgPiAwKSB7XG5cdFx0XHRcdHZhciBkb20gPSB2bm9kZS5kb21cblx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSBmcmFnbWVudC5hcHBlbmRDaGlsZChkb20ubmV4dFNpYmxpbmcpXG5cdFx0XHRcdGZyYWdtZW50Lmluc2VydEJlZm9yZShkb20sIGZyYWdtZW50LmZpcnN0Q2hpbGQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZnJhZ21lbnRcblx0XHR9XG5cdFx0ZWxzZSByZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gZ2V0TmV4dFNpYmxpbmcodm5vZGVzLCBpLCBuZXh0U2libGluZykge1xuXHRcdGZvciAoOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwgJiYgdm5vZGVzW2ldLmRvbSAhPSBudWxsKSByZXR1cm4gdm5vZGVzW2ldLmRvbVxuXHRcdH1cblx0XHRyZXR1cm4gbmV4dFNpYmxpbmdcblx0fVxuXHRmdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudCwgZG9tLCBuZXh0U2libGluZykge1xuXHRcdGlmIChuZXh0U2libGluZyAmJiBuZXh0U2libGluZy5wYXJlbnROb2RlKSBwYXJlbnQuaW5zZXJ0QmVmb3JlKGRvbSwgbmV4dFNpYmxpbmcpXG5cdFx0ZWxzZSBwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tKVxuXHR9XG5cdGZ1bmN0aW9uIHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSkge1xuXHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdLnRhZyA9PT0gXCI8XCIpIHtcblx0XHRcdHZhciBjb250ZW50ID0gY2hpbGRyZW5bMF0uY2hpbGRyZW5cblx0XHRcdGlmICh2bm9kZS5kb20uaW5uZXJIVE1MICE9PSBjb250ZW50KSB2bm9kZS5kb20uaW5uZXJIVE1MID0gY29udGVudFxuXHRcdH1cblx0XHRlbHNlIGlmICh2bm9kZS50ZXh0ICE9IG51bGwgfHwgY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggIT09IDApIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIG5vZGUgb2YgYSBjb250ZW50ZWRpdGFibGUgbXVzdCBiZSB0cnVzdGVkXCIpXG5cdH1cblx0Ly9yZW1vdmVcblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZXModm5vZGVzLCBzdGFydCwgZW5kLCBjb250ZXh0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0aWYgKHZub2RlLnNraXApIHZub2RlLnNraXAgPSBmYWxzZVxuXHRcdFx0XHRlbHNlIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpIHtcblx0XHR2YXIgZXhwZWN0ZWQgPSAxLCBjYWxsZWQgPSAwXG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHZub2RlLmF0dHJzLm9uYmVmb3JlcmVtb3ZlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUuYXR0cnMub25iZWZvcmVyZW1vdmUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0ZXhwZWN0ZWQrK1xuXHRcdFx0XHRyZXN1bHQudGhlbihjb250aW51YXRpb24sIGNvbnRpbnVhdGlvbilcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09IFwic3RyaW5nXCIgJiYgdm5vZGUudGFnLm9uYmVmb3JlcmVtb3ZlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUudGFnLm9uYmVmb3JlcmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdGV4cGVjdGVkKytcblx0XHRcdFx0cmVzdWx0LnRoZW4oY29udGludWF0aW9uLCBjb250aW51YXRpb24pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnRpbnVhdGlvbigpXG5cdFx0ZnVuY3Rpb24gY29udGludWF0aW9uKCkge1xuXHRcdFx0aWYgKCsrY2FsbGVkID09PSBleHBlY3RlZCkge1xuXHRcdFx0XHRvbnJlbW92ZSh2bm9kZSlcblx0XHRcdFx0aWYgKHZub2RlLmRvbSkge1xuXHRcdFx0XHRcdHZhciBjb3VudDAgPSB2bm9kZS5kb21TaXplIHx8IDFcblx0XHRcdFx0XHRpZiAoY291bnQwID4gMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRvbSA9IHZub2RlLmRvbVxuXHRcdFx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSB7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZU5vZGVGcm9tRE9NKGRvbS5uZXh0U2libGluZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVtb3ZlTm9kZUZyb21ET00odm5vZGUuZG9tKVxuXHRcdFx0XHRcdGlmIChjb250ZXh0ICE9IG51bGwgJiYgdm5vZGUuZG9tU2l6ZSA9PSBudWxsICYmICFoYXNJbnRlZ3JhdGlvbk1ldGhvZHModm5vZGUuYXR0cnMpICYmIHR5cGVvZiB2bm9kZS50YWcgPT09IFwic3RyaW5nXCIpIHsgLy9UT0RPIHRlc3QgY3VzdG9tIGVsZW1lbnRzXG5cdFx0XHRcdFx0XHRpZiAoIWNvbnRleHQucG9vbCkgY29udGV4dC5wb29sID0gW3Zub2RlXVxuXHRcdFx0XHRcdFx0ZWxzZSBjb250ZXh0LnBvb2wucHVzaCh2bm9kZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZUZyb21ET00obm9kZSkge1xuXHRcdHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGVcblx0XHRpZiAocGFyZW50ICE9IG51bGwpIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKVxuXHR9XG5cdGZ1bmN0aW9uIG9ucmVtb3ZlKHZub2RlKSB7XG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHZub2RlLmF0dHJzLm9ucmVtb3ZlKSB2bm9kZS5hdHRycy5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIiAmJiB2bm9kZS50YWcub25yZW1vdmUpIHZub2RlLnRhZy5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkgb25yZW1vdmUodm5vZGUuaW5zdGFuY2UpXG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsKSBvbnJlbW92ZShjaGlsZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL2F0dHJzMlxuXHRmdW5jdGlvbiBzZXRBdHRycyh2bm9kZSwgYXR0cnMyLCBucykge1xuXHRcdGZvciAodmFyIGtleTIgaW4gYXR0cnMyKSB7XG5cdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBudWxsLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQsIHZhbHVlLCBucykge1xuXHRcdHZhciBlbGVtZW50ID0gdm5vZGUuZG9tXG5cdFx0aWYgKGtleTIgPT09IFwia2V5XCIgfHwga2V5MiA9PT0gXCJpc1wiIHx8IChvbGQgPT09IHZhbHVlICYmICFpc0Zvcm1BdHRyaWJ1dGUodm5vZGUsIGtleTIpKSAmJiB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleTIpKSByZXR1cm5cblx0XHR2YXIgbnNMYXN0SW5kZXggPSBrZXkyLmluZGV4T2YoXCI6XCIpXG5cdFx0aWYgKG5zTGFzdEluZGV4ID4gLTEgJiYga2V5Mi5zdWJzdHIoMCwgbnNMYXN0SW5kZXgpID09PSBcInhsaW5rXCIpIHtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIGtleTIuc2xpY2UobnNMYXN0SW5kZXggKyAxKSwgdmFsdWUpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoa2V5MiA9PT0gXCJzdHlsZVwiKSB1cGRhdGVTdHlsZShlbGVtZW50LCBvbGQsIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGtleTIgaW4gZWxlbWVudCAmJiAhaXNBdHRyaWJ1dGUoa2V5MikgJiYgbnMgPT09IHVuZGVmaW5lZCAmJiAhaXNDdXN0b21FbGVtZW50KHZub2RlKSkge1xuXHRcdFx0Ly9zZXR0aW5nIGlucHV0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIGJ5IHR5cGluZyBvbiBmb2N1c2VkIGVsZW1lbnQgbW92ZXMgY3Vyc29yIHRvIGVuZCBpbiBDaHJvbWVcblx0XHRcdGlmICh2bm9kZS50YWcgPT09IFwiaW5wdXRcIiAmJiBrZXkyID09PSBcInZhbHVlXCIgJiYgdm5vZGUuZG9tLnZhbHVlID09PSB2YWx1ZSAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHQvL3NldHRpbmcgc2VsZWN0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJzZWxlY3RcIiAmJiBrZXkyID09PSBcInZhbHVlXCIgJiYgdm5vZGUuZG9tLnZhbHVlID09PSB2YWx1ZSAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHQvL3NldHRpbmcgb3B0aW9uW3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJvcHRpb25cIiAmJiBrZXkyID09PSBcInZhbHVlXCIgJiYgdm5vZGUuZG9tLnZhbHVlID09PSB2YWx1ZSkgcmV0dXJuXG5cdFx0XHRlbGVtZW50W2tleTJdID0gdmFsdWVcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRpZiAodmFsdWUpIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleTIsIFwiXCIpXG5cdFx0XHRcdGVsc2UgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoa2V5Milcblx0XHRcdH1cblx0XHRcdGVsc2UgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5MiA9PT0gXCJjbGFzc05hbWVcIiA/IFwiY2xhc3NcIiA6IGtleTIsIHZhbHVlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRMYXRlQXR0cnModm5vZGUpIHtcblx0XHR2YXIgYXR0cnMyID0gdm5vZGUuYXR0cnNcblx0XHRpZiAodm5vZGUudGFnID09PSBcInNlbGVjdFwiICYmIGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRpZiAoXCJ2YWx1ZVwiIGluIGF0dHJzMikgc2V0QXR0cih2bm9kZSwgXCJ2YWx1ZVwiLCBudWxsLCBhdHRyczIudmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdGlmIChcInNlbGVjdGVkSW5kZXhcIiBpbiBhdHRyczIpIHNldEF0dHIodm5vZGUsIFwic2VsZWN0ZWRJbmRleFwiLCBudWxsLCBhdHRyczIuc2VsZWN0ZWRJbmRleCwgdW5kZWZpbmVkKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVBdHRycyh2bm9kZSwgb2xkLCBhdHRyczIsIG5zKSB7XG5cdFx0aWYgKGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkyIGluIGF0dHJzMikge1xuXHRcdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQgJiYgb2xkW2tleTJdLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob2xkICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleTIgaW4gb2xkKSB7XG5cdFx0XHRcdGlmIChhdHRyczIgPT0gbnVsbCB8fCAhKGtleTIgaW4gYXR0cnMyKSkge1xuXHRcdFx0XHRcdGlmIChrZXkyID09PSBcImNsYXNzTmFtZVwiKSBrZXkyID0gXCJjbGFzc1wiXG5cdFx0XHRcdFx0aWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmICFpc0xpZmVjeWNsZU1ldGhvZChrZXkyKSkgdXBkYXRlRXZlbnQodm5vZGUsIGtleTIsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRlbHNlIGlmIChrZXkyICE9PSBcImtleVwiKSB2bm9kZS5kb20ucmVtb3ZlQXR0cmlidXRlKGtleTIpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaXNGb3JtQXR0cmlidXRlKHZub2RlLCBhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwidmFsdWVcIiB8fCBhdHRyID09PSBcImNoZWNrZWRcIiB8fCBhdHRyID09PSBcInNlbGVjdGVkSW5kZXhcIiB8fCBhdHRyID09PSBcInNlbGVjdGVkXCIgJiYgdm5vZGUuZG9tID09PSAkZG9jLmFjdGl2ZUVsZW1lbnRcblx0fVxuXHRmdW5jdGlvbiBpc0xpZmVjeWNsZU1ldGhvZChhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwib25pbml0XCIgfHwgYXR0ciA9PT0gXCJvbmNyZWF0ZVwiIHx8IGF0dHIgPT09IFwib251cGRhdGVcIiB8fCBhdHRyID09PSBcIm9ucmVtb3ZlXCIgfHwgYXR0ciA9PT0gXCJvbmJlZm9yZXJlbW92ZVwiIHx8IGF0dHIgPT09IFwib25iZWZvcmV1cGRhdGVcIlxuXHR9XG5cdGZ1bmN0aW9uIGlzQXR0cmlidXRlKGF0dHIpIHtcblx0XHRyZXR1cm4gYXR0ciA9PT0gXCJocmVmXCIgfHwgYXR0ciA9PT0gXCJsaXN0XCIgfHwgYXR0ciA9PT0gXCJmb3JtXCIgfHwgYXR0ciA9PT0gXCJ3aWR0aFwiIHx8IGF0dHIgPT09IFwiaGVpZ2h0XCIvLyB8fCBhdHRyID09PSBcInR5cGVcIlxuXHR9XG5cdGZ1bmN0aW9uIGlzQ3VzdG9tRWxlbWVudCh2bm9kZSl7XG5cdFx0cmV0dXJuIHZub2RlLmF0dHJzLmlzIHx8IHZub2RlLnRhZy5pbmRleE9mKFwiLVwiKSA+IC0xXG5cdH1cblx0ZnVuY3Rpb24gaGFzSW50ZWdyYXRpb25NZXRob2RzKHNvdXJjZSkge1xuXHRcdHJldHVybiBzb3VyY2UgIT0gbnVsbCAmJiAoc291cmNlLm9uY3JlYXRlIHx8IHNvdXJjZS5vbnVwZGF0ZSB8fCBzb3VyY2Uub25iZWZvcmVyZW1vdmUgfHwgc291cmNlLm9ucmVtb3ZlKVxuXHR9XG5cdC8vc3R5bGVcblx0ZnVuY3Rpb24gdXBkYXRlU3R5bGUoZWxlbWVudCwgb2xkLCBzdHlsZSkge1xuXHRcdGlmIChvbGQgPT09IHN0eWxlKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBcIlwiLCBvbGQgPSBudWxsXG5cdFx0aWYgKHN0eWxlID09IG51bGwpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IFwiXCJcblx0XHRlbHNlIGlmICh0eXBlb2Ygc3R5bGUgPT09IFwic3RyaW5nXCIpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IHN0eWxlXG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIG9sZCA9PT0gXCJzdHJpbmdcIikgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gXCJcIlxuXHRcdFx0Zm9yICh2YXIga2V5MiBpbiBzdHlsZSkge1xuXHRcdFx0XHRlbGVtZW50LnN0eWxlW2tleTJdID0gc3R5bGVba2V5Ml1cblx0XHRcdH1cblx0XHRcdGlmIChvbGQgIT0gbnVsbCAmJiB0eXBlb2Ygb2xkICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleTIgaW4gb2xkKSB7XG5cdFx0XHRcdFx0aWYgKCEoa2V5MiBpbiBzdHlsZSkpIGVsZW1lbnQuc3R5bGVba2V5Ml0gPSBcIlwiXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Ly9ldmVudFxuXHRmdW5jdGlvbiB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpIHtcblx0XHR2YXIgZWxlbWVudCA9IHZub2RlLmRvbVxuXHRcdHZhciBjYWxsYmFjayA9IHR5cGVvZiBvbmV2ZW50ICE9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdHZhciByZXN1bHQgPSB2YWx1ZS5jYWxsKGVsZW1lbnQsIGUpXG5cdFx0XHRvbmV2ZW50LmNhbGwoZWxlbWVudCwgZSlcblx0XHRcdHJldHVybiByZXN1bHRcblx0XHR9XG5cdFx0aWYgKGtleTIgaW4gZWxlbWVudCkgZWxlbWVudFtrZXkyXSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2FsbGJhY2sgOiBudWxsXG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgZXZlbnROYW1lID0ga2V5Mi5zbGljZSgyKVxuXHRcdFx0aWYgKHZub2RlLmV2ZW50cyA9PT0gdW5kZWZpbmVkKSB2bm9kZS5ldmVudHMgPSB7fVxuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXkyXSA9PT0gY2FsbGJhY2spIHJldHVyblxuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXkyXSAhPSBudWxsKSBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB2bm9kZS5ldmVudHNba2V5Ml0sIGZhbHNlKVxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHZub2RlLmV2ZW50c1trZXkyXSA9IGNhbGxiYWNrXG5cdFx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHZub2RlLmV2ZW50c1trZXkyXSwgZmFsc2UpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdC8vbGlmZWN5Y2xlXG5cdGZ1bmN0aW9uIGluaXRMaWZlY3ljbGUoc291cmNlLCB2bm9kZSwgaG9va3MpIHtcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmluaXQgPT09IFwiZnVuY3Rpb25cIikgc291cmNlLm9uaW5pdC5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmNyZWF0ZSA9PT0gXCJmdW5jdGlvblwiKSBob29rcy5wdXNoKHNvdXJjZS5vbmNyZWF0ZS5iaW5kKHZub2RlLnN0YXRlLCB2bm9kZSkpXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlTGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzLCByZWN5Y2xpbmcpIHtcblx0XHRpZiAocmVjeWNsaW5nKSBpbml0TGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzKVxuXHRcdGVsc2UgaWYgKHR5cGVvZiBzb3VyY2Uub251cGRhdGUgPT09IFwiZnVuY3Rpb25cIikgaG9va3MucHVzaChzb3VyY2Uub251cGRhdGUuYmluZCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHR9XG5cdGZ1bmN0aW9uIHNob3VsZFVwZGF0ZSh2bm9kZSwgb2xkKSB7XG5cdFx0dmFyIGZvcmNlVm5vZGVVcGRhdGUsIGZvcmNlQ29tcG9uZW50VXBkYXRlXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JldXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGZvcmNlVm5vZGVVcGRhdGUgPSB2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSwgb2xkKVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnICE9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2bm9kZS50YWcub25iZWZvcmV1cGRhdGUgPT09IFwiZnVuY3Rpb25cIikgZm9yY2VDb21wb25lbnRVcGRhdGUgPSB2bm9kZS50YWcub25iZWZvcmV1cGRhdGUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUsIG9sZClcblx0XHRpZiAoIShmb3JjZVZub2RlVXBkYXRlID09PSB1bmRlZmluZWQgJiYgZm9yY2VDb21wb25lbnRVcGRhdGUgPT09IHVuZGVmaW5lZCkgJiYgIWZvcmNlVm5vZGVVcGRhdGUgJiYgIWZvcmNlQ29tcG9uZW50VXBkYXRlKSB7XG5cdFx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gb2xkLmRvbVNpemVcblx0XHRcdHZub2RlLmluc3RhbmNlID0gb2xkLmluc3RhbmNlXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXHRmdW5jdGlvbiByZW5kZXIoZG9tLCB2bm9kZXMpIHtcblx0XHRpZiAoIWRvbSkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBET00gZWxlbWVudCBiZWluZyBwYXNzZWQgdG8gbS5yb3V0ZS9tLm1vdW50L20ucmVuZGVyIGlzIG5vdCB1bmRlZmluZWQuXCIpXG5cdFx0dmFyIGhvb2tzID0gW11cblx0XHR2YXIgYWN0aXZlID0gJGRvYy5hY3RpdmVFbGVtZW50XG5cdFx0Ly8gRmlyc3QgdGltZTAgcmVuZGVyaW5nIGludG8gYSBub2RlIGNsZWFycyBpdCBvdXRcblx0XHRpZiAoZG9tLnZub2RlcyA9PSBudWxsKSBkb20udGV4dENvbnRlbnQgPSBcIlwiXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZub2RlcykpIHZub2RlcyA9IFt2bm9kZXNdXG5cdFx0dXBkYXRlTm9kZXMoZG9tLCBkb20udm5vZGVzLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbih2bm9kZXMpLCBmYWxzZSwgaG9va3MsIG51bGwsIHVuZGVmaW5lZClcblx0XHRkb20udm5vZGVzID0gdm5vZGVzXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7IGkrKykgaG9va3NbaV0oKVxuXHRcdGlmICgkZG9jLmFjdGl2ZUVsZW1lbnQgIT09IGFjdGl2ZSkgYWN0aXZlLmZvY3VzKClcblx0fVxuXHRyZXR1cm4ge3JlbmRlcjogcmVuZGVyLCBzZXRFdmVudENhbGxiYWNrOiBzZXRFdmVudENhbGxiYWNrfVxufVxuZnVuY3Rpb24gdGhyb3R0bGUoY2FsbGJhY2spIHtcblx0Ly82MGZwcyB0cmFuc2xhdGVzIHRvIDE2LjZtcywgcm91bmQgaXQgZG93biBzaW5jZSBzZXRUaW1lb3V0IHJlcXVpcmVzIGludFxuXHR2YXIgdGltZSA9IDE2XG5cdHZhciBsYXN0ID0gMCwgcGVuZGluZyA9IG51bGxcblx0dmFyIHRpbWVvdXQgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSBcImZ1bmN0aW9uXCIgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgOiBzZXRUaW1lb3V0XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm93ID0gRGF0ZS5ub3coKVxuXHRcdGlmIChsYXN0ID09PSAwIHx8IG5vdyAtIGxhc3QgPj0gdGltZSkge1xuXHRcdFx0bGFzdCA9IG5vd1xuXHRcdFx0Y2FsbGJhY2soKVxuXHRcdH1cblx0XHRlbHNlIGlmIChwZW5kaW5nID09PSBudWxsKSB7XG5cdFx0XHRwZW5kaW5nID0gdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0cGVuZGluZyA9IG51bGxcblx0XHRcdFx0Y2FsbGJhY2soKVxuXHRcdFx0XHRsYXN0ID0gRGF0ZS5ub3coKVxuXHRcdFx0fSwgdGltZSAtIChub3cgLSBsYXN0KSlcblx0XHR9XG5cdH1cbn1cbnZhciBfMTEgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciByZW5kZXJTZXJ2aWNlID0gY29yZVJlbmRlcmVyKCR3aW5kb3cpXG5cdHJlbmRlclNlcnZpY2Uuc2V0RXZlbnRDYWxsYmFjayhmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucmVkcmF3ICE9PSBmYWxzZSkgcmVkcmF3KClcblx0fSlcblx0dmFyIGNhbGxiYWNrcyA9IFtdXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShrZXkxLCBjYWxsYmFjaykge1xuXHRcdHVuc3Vic2NyaWJlKGtleTEpXG5cdFx0Y2FsbGJhY2tzLnB1c2goa2V5MSwgdGhyb3R0bGUoY2FsbGJhY2spKVxuXHR9XG5cdGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGtleTEpIHtcblx0XHR2YXIgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihrZXkxKVxuXHRcdGlmIChpbmRleCA+IC0xKSBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAyKVxuXHR9XG4gICAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgICAgY2FsbGJhY2tzW2ldKClcbiAgICAgICAgfVxuICAgIH1cblx0cmV0dXJuIHtzdWJzY3JpYmU6IHN1YnNjcmliZSwgdW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlLCByZWRyYXc6IHJlZHJhdywgcmVuZGVyOiByZW5kZXJTZXJ2aWNlLnJlbmRlcn1cbn1cbnZhciByZWRyYXdTZXJ2aWNlID0gXzExKHdpbmRvdylcbnJlcXVlc3RTZXJ2aWNlLnNldENvbXBsZXRpb25DYWxsYmFjayhyZWRyYXdTZXJ2aWNlLnJlZHJhdylcbnZhciBfMTYgPSBmdW5jdGlvbihyZWRyYXdTZXJ2aWNlMCkge1xuXHRyZXR1cm4gZnVuY3Rpb24ocm9vdCwgY29tcG9uZW50KSB7XG5cdFx0aWYgKGNvbXBvbmVudCA9PT0gbnVsbCkge1xuXHRcdFx0cmVkcmF3U2VydmljZTAucmVuZGVyKHJvb3QsIFtdKVxuXHRcdFx0cmVkcmF3U2VydmljZTAudW5zdWJzY3JpYmUocm9vdClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRcblx0XHRpZiAoY29tcG9uZW50LnZpZXcgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwibS5tb3VudChlbGVtZW50LCBjb21wb25lbnQpIGV4cGVjdHMgYSBjb21wb25lbnQsIG5vdCBhIHZub2RlXCIpXG5cdFx0XG5cdFx0dmFyIHJ1bjAgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlZHJhd1NlcnZpY2UwLnJlbmRlcihyb290LCBWbm9kZShjb21wb25lbnQpKVxuXHRcdH1cblx0XHRyZWRyYXdTZXJ2aWNlMC5zdWJzY3JpYmUocm9vdCwgcnVuMClcblx0XHRyZWRyYXdTZXJ2aWNlMC5yZWRyYXcoKVxuXHR9XG59XG5tLm1vdW50ID0gXzE2KHJlZHJhd1NlcnZpY2UpXG52YXIgUHJvbWlzZSA9IFByb21pc2VQb2x5ZmlsbFxudmFyIHBhcnNlUXVlcnlTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcblx0aWYgKHN0cmluZyA9PT0gXCJcIiB8fCBzdHJpbmcgPT0gbnVsbCkgcmV0dXJuIHt9XG5cdGlmIChzdHJpbmcuY2hhckF0KDApID09PSBcIj9cIikgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDEpXG5cdHZhciBlbnRyaWVzID0gc3RyaW5nLnNwbGl0KFwiJlwiKSwgZGF0YTAgPSB7fSwgY291bnRlcnMgPSB7fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgZW50cnkgPSBlbnRyaWVzW2ldLnNwbGl0KFwiPVwiKVxuXHRcdHZhciBrZXk1ID0gZGVjb2RlVVJJQ29tcG9uZW50KGVudHJ5WzBdKVxuXHRcdHZhciB2YWx1ZSA9IGVudHJ5Lmxlbmd0aCA9PT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChlbnRyeVsxXSkgOiBcIlwiXG5cdFx0aWYgKHZhbHVlID09PSBcInRydWVcIikgdmFsdWUgPSB0cnVlXG5cdFx0ZWxzZSBpZiAodmFsdWUgPT09IFwiZmFsc2VcIikgdmFsdWUgPSBmYWxzZVxuXHRcdHZhciBsZXZlbHMgPSBrZXk1LnNwbGl0KC9cXF1cXFs/fFxcWy8pXG5cdFx0dmFyIGN1cnNvciA9IGRhdGEwXG5cdFx0aWYgKGtleTUuaW5kZXhPZihcIltcIikgPiAtMSkgbGV2ZWxzLnBvcCgpXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBsZXZlbHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdHZhciBsZXZlbCA9IGxldmVsc1tqXSwgbmV4dExldmVsID0gbGV2ZWxzW2ogKyAxXVxuXHRcdFx0dmFyIGlzTnVtYmVyID0gbmV4dExldmVsID09IFwiXCIgfHwgIWlzTmFOKHBhcnNlSW50KG5leHRMZXZlbCwgMTApKVxuXHRcdFx0dmFyIGlzVmFsdWUgPSBqID09PSBsZXZlbHMubGVuZ3RoIC0gMVxuXHRcdFx0aWYgKGxldmVsID09PSBcIlwiKSB7XG5cdFx0XHRcdHZhciBrZXk1ID0gbGV2ZWxzLnNsaWNlKDAsIGopLmpvaW4oKVxuXHRcdFx0XHRpZiAoY291bnRlcnNba2V5NV0gPT0gbnVsbCkgY291bnRlcnNba2V5NV0gPSAwXG5cdFx0XHRcdGxldmVsID0gY291bnRlcnNba2V5NV0rK1xuXHRcdFx0fVxuXHRcdFx0aWYgKGN1cnNvcltsZXZlbF0gPT0gbnVsbCkge1xuXHRcdFx0XHRjdXJzb3JbbGV2ZWxdID0gaXNWYWx1ZSA/IHZhbHVlIDogaXNOdW1iZXIgPyBbXSA6IHt9XG5cdFx0XHR9XG5cdFx0XHRjdXJzb3IgPSBjdXJzb3JbbGV2ZWxdXG5cdFx0fVxuXHR9XG5cdHJldHVybiBkYXRhMFxufVxudmFyIGNvcmVSb3V0ZXIgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciBzdXBwb3J0c1B1c2hTdGF0ZSA9IHR5cGVvZiAkd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlID09PSBcImZ1bmN0aW9uXCJcblx0dmFyIGNhbGxBc3luYzAgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBzZXRUaW1lb3V0XG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZTEoZnJhZ21lbnQwKSB7XG5cdFx0dmFyIGRhdGEgPSAkd2luZG93LmxvY2F0aW9uW2ZyYWdtZW50MF0ucmVwbGFjZSgvKD86JVthLWY4OV1bYS1mMC05XSkrL2dpbSwgZGVjb2RlVVJJQ29tcG9uZW50KVxuXHRcdGlmIChmcmFnbWVudDAgPT09IFwicGF0aG5hbWVcIiAmJiBkYXRhWzBdICE9PSBcIi9cIikgZGF0YSA9IFwiL1wiICsgZGF0YVxuXHRcdHJldHVybiBkYXRhXG5cdH1cblx0dmFyIGFzeW5jSWRcblx0ZnVuY3Rpb24gZGVib3VuY2VBc3luYyhjYWxsYmFjazApIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoYXN5bmNJZCAhPSBudWxsKSByZXR1cm5cblx0XHRcdGFzeW5jSWQgPSBjYWxsQXN5bmMwKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhc3luY0lkID0gbnVsbFxuXHRcdFx0XHRjYWxsYmFjazAoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcGFyc2VQYXRoKHBhdGgsIHF1ZXJ5RGF0YSwgaGFzaERhdGEpIHtcblx0XHR2YXIgcXVlcnlJbmRleCA9IHBhdGguaW5kZXhPZihcIj9cIilcblx0XHR2YXIgaGFzaEluZGV4ID0gcGF0aC5pbmRleE9mKFwiI1wiKVxuXHRcdHZhciBwYXRoRW5kID0gcXVlcnlJbmRleCA+IC0xID8gcXVlcnlJbmRleCA6IGhhc2hJbmRleCA+IC0xID8gaGFzaEluZGV4IDogcGF0aC5sZW5ndGhcblx0XHRpZiAocXVlcnlJbmRleCA+IC0xKSB7XG5cdFx0XHR2YXIgcXVlcnlFbmQgPSBoYXNoSW5kZXggPiAtMSA/IGhhc2hJbmRleCA6IHBhdGgubGVuZ3RoXG5cdFx0XHR2YXIgcXVlcnlQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc2xpY2UocXVlcnlJbmRleCArIDEsIHF1ZXJ5RW5kKSlcblx0XHRcdGZvciAodmFyIGtleTQgaW4gcXVlcnlQYXJhbXMpIHF1ZXJ5RGF0YVtrZXk0XSA9IHF1ZXJ5UGFyYW1zW2tleTRdXG5cdFx0fVxuXHRcdGlmIChoYXNoSW5kZXggPiAtMSkge1xuXHRcdFx0dmFyIGhhc2hQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc2xpY2UoaGFzaEluZGV4ICsgMSkpXG5cdFx0XHRmb3IgKHZhciBrZXk0IGluIGhhc2hQYXJhbXMpIGhhc2hEYXRhW2tleTRdID0gaGFzaFBhcmFtc1trZXk0XVxuXHRcdH1cblx0XHRyZXR1cm4gcGF0aC5zbGljZSgwLCBwYXRoRW5kKVxuXHR9XG5cdHZhciByb3V0ZXIgPSB7cHJlZml4OiBcIiMhXCJ9XG5cdHJvdXRlci5nZXRQYXRoID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHR5cGUyID0gcm91dGVyLnByZWZpeC5jaGFyQXQoMClcblx0XHRzd2l0Y2ggKHR5cGUyKSB7XG5cdFx0XHRjYXNlIFwiI1wiOiByZXR1cm4gbm9ybWFsaXplMShcImhhc2hcIikuc2xpY2Uocm91dGVyLnByZWZpeC5sZW5ndGgpXG5cdFx0XHRjYXNlIFwiP1wiOiByZXR1cm4gbm9ybWFsaXplMShcInNlYXJjaFwiKS5zbGljZShyb3V0ZXIucHJlZml4Lmxlbmd0aCkgKyBub3JtYWxpemUxKFwiaGFzaFwiKVxuXHRcdFx0ZGVmYXVsdDogcmV0dXJuIG5vcm1hbGl6ZTEoXCJwYXRobmFtZVwiKS5zbGljZShyb3V0ZXIucHJlZml4Lmxlbmd0aCkgKyBub3JtYWxpemUxKFwic2VhcmNoXCIpICsgbm9ybWFsaXplMShcImhhc2hcIilcblx0XHR9XG5cdH1cblx0cm91dGVyLnNldFBhdGggPSBmdW5jdGlvbihwYXRoLCBkYXRhLCBvcHRpb25zKSB7XG5cdFx0dmFyIHF1ZXJ5RGF0YSA9IHt9LCBoYXNoRGF0YSA9IHt9XG5cdFx0cGF0aCA9IHBhcnNlUGF0aChwYXRoLCBxdWVyeURhdGEsIGhhc2hEYXRhKVxuXHRcdGlmIChkYXRhICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleTQgaW4gZGF0YSkgcXVlcnlEYXRhW2tleTRdID0gZGF0YVtrZXk0XVxuXHRcdFx0cGF0aCA9IHBhdGgucmVwbGFjZSgvOihbXlxcL10rKS9nLCBmdW5jdGlvbihtYXRjaDIsIHRva2VuKSB7XG5cdFx0XHRcdGRlbGV0ZSBxdWVyeURhdGFbdG9rZW5dXG5cdFx0XHRcdHJldHVybiBkYXRhW3Rva2VuXVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0dmFyIHF1ZXJ5ID0gYnVpbGRRdWVyeVN0cmluZyhxdWVyeURhdGEpXG5cdFx0aWYgKHF1ZXJ5KSBwYXRoICs9IFwiP1wiICsgcXVlcnlcblx0XHR2YXIgaGFzaCA9IGJ1aWxkUXVlcnlTdHJpbmcoaGFzaERhdGEpXG5cdFx0aWYgKGhhc2gpIHBhdGggKz0gXCIjXCIgKyBoYXNoXG5cdFx0aWYgKHN1cHBvcnRzUHVzaFN0YXRlKSB7XG5cdFx0XHR2YXIgc3RhdGUgPSBvcHRpb25zID8gb3B0aW9ucy5zdGF0ZSA6IG51bGxcblx0XHRcdHZhciB0aXRsZSA9IG9wdGlvbnMgPyBvcHRpb25zLnRpdGxlIDogbnVsbFxuXHRcdFx0JHdpbmRvdy5vbnBvcHN0YXRlKClcblx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVwbGFjZSkgJHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIHJvdXRlci5wcmVmaXggKyBwYXRoKVxuXHRcdFx0ZWxzZSAkd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgcm91dGVyLnByZWZpeCArIHBhdGgpXG5cdFx0fVxuXHRcdGVsc2UgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcm91dGVyLnByZWZpeCArIHBhdGhcblx0fVxuXHRyb3V0ZXIuZGVmaW5lUm91dGVzID0gZnVuY3Rpb24ocm91dGVzLCByZXNvbHZlLCByZWplY3QpIHtcblx0XHRmdW5jdGlvbiByZXNvbHZlUm91dGUoKSB7XG5cdFx0XHR2YXIgcGF0aCA9IHJvdXRlci5nZXRQYXRoKClcblx0XHRcdHZhciBwYXJhbXMgPSB7fVxuXHRcdFx0dmFyIHBhdGhuYW1lID0gcGFyc2VQYXRoKHBhdGgsIHBhcmFtcywgcGFyYW1zKVxuXHRcdFx0dmFyIHN0YXRlID0gJHdpbmRvdy5oaXN0b3J5LnN0YXRlXG5cdFx0XHRpZiAoc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIHN0YXRlKSBwYXJhbXNba10gPSBzdGF0ZVtrXVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgcm91dGUwIGluIHJvdXRlcykge1xuXHRcdFx0XHR2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoXCJeXCIgKyByb3V0ZTAucmVwbGFjZSgvOlteXFwvXSs/XFwuezN9L2csIFwiKC4qPylcIikucmVwbGFjZSgvOlteXFwvXSsvZywgXCIoW15cXFxcL10rKVwiKSArIFwiXFwvPyRcIilcblx0XHRcdFx0aWYgKG1hdGNoZXIudGVzdChwYXRobmFtZSkpIHtcblx0XHRcdFx0XHRwYXRobmFtZS5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGtleXMgPSByb3V0ZTAubWF0Y2goLzpbXlxcL10rL2cpIHx8IFtdXG5cdFx0XHRcdFx0XHR2YXIgdmFsdWVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIC0yKVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdHBhcmFtc1trZXlzW2ldLnJlcGxhY2UoLzp8XFwuL2csIFwiXCIpXSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbaV0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXNvbHZlKHJvdXRlc1tyb3V0ZTBdLCBwYXJhbXMsIHBhdGgsIHJvdXRlMClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZWplY3QocGF0aCwgcGFyYW1zKVxuXHRcdH1cblx0XHRpZiAoc3VwcG9ydHNQdXNoU3RhdGUpICR3aW5kb3cub25wb3BzdGF0ZSA9IGRlYm91bmNlQXN5bmMocmVzb2x2ZVJvdXRlKVxuXHRcdGVsc2UgaWYgKHJvdXRlci5wcmVmaXguY2hhckF0KDApID09PSBcIiNcIikgJHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSByZXNvbHZlUm91dGVcblx0XHRyZXNvbHZlUm91dGUoKVxuXHR9XG5cdHJldHVybiByb3V0ZXJcbn1cbnZhciBfMjAgPSBmdW5jdGlvbigkd2luZG93LCByZWRyYXdTZXJ2aWNlMCkge1xuXHR2YXIgcm91dGVTZXJ2aWNlID0gY29yZVJvdXRlcigkd2luZG93KVxuXHR2YXIgaWRlbnRpdHkgPSBmdW5jdGlvbih2KSB7cmV0dXJuIHZ9XG5cdHZhciByZW5kZXIxLCBjb21wb25lbnQsIGF0dHJzMywgY3VycmVudFBhdGgsIGxhc3RVcGRhdGVcblx0dmFyIHJvdXRlID0gZnVuY3Rpb24ocm9vdCwgZGVmYXVsdFJvdXRlLCByb3V0ZXMpIHtcblx0XHRpZiAocm9vdCA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnN1cmUgdGhlIERPTSBlbGVtZW50IHRoYXQgd2FzIHBhc3NlZCB0byBgbS5yb3V0ZWAgaXMgbm90IHVuZGVmaW5lZFwiKVxuXHRcdHZhciBydW4xID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAocmVuZGVyMSAhPSBudWxsKSByZWRyYXdTZXJ2aWNlMC5yZW5kZXIocm9vdCwgcmVuZGVyMShWbm9kZShjb21wb25lbnQsIGF0dHJzMy5rZXksIGF0dHJzMykpKVxuXHRcdH1cblx0XHR2YXIgYmFpbCA9IGZ1bmN0aW9uKHBhdGgpIHtcblx0XHRcdGlmIChwYXRoICE9PSBkZWZhdWx0Um91dGUpIHJvdXRlU2VydmljZS5zZXRQYXRoKGRlZmF1bHRSb3V0ZSwgbnVsbCwge3JlcGxhY2U6IHRydWV9KVxuXHRcdFx0ZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVzb2x2ZSBkZWZhdWx0IHJvdXRlIFwiICsgZGVmYXVsdFJvdXRlKVxuXHRcdH1cblx0XHRyb3V0ZVNlcnZpY2UuZGVmaW5lUm91dGVzKHJvdXRlcywgZnVuY3Rpb24ocGF5bG9hZCwgcGFyYW1zLCBwYXRoKSB7XG5cdFx0XHR2YXIgdXBkYXRlID0gbGFzdFVwZGF0ZSA9IGZ1bmN0aW9uKHJvdXRlUmVzb2x2ZXIsIGNvbXApIHtcblx0XHRcdFx0aWYgKHVwZGF0ZSAhPT0gbGFzdFVwZGF0ZSkgcmV0dXJuXG5cdFx0XHRcdGNvbXBvbmVudCA9IGNvbXAgIT0gbnVsbCAmJiB0eXBlb2YgY29tcC52aWV3ID09PSBcImZ1bmN0aW9uXCIgPyBjb21wIDogXCJkaXZcIiwgYXR0cnMzID0gcGFyYW1zLCBjdXJyZW50UGF0aCA9IHBhdGgsIGxhc3RVcGRhdGUgPSBudWxsXG5cdFx0XHRcdHJlbmRlcjEgPSAocm91dGVSZXNvbHZlci5yZW5kZXIgfHwgaWRlbnRpdHkpLmJpbmQocm91dGVSZXNvbHZlcilcblx0XHRcdFx0cnVuMSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAocGF5bG9hZC52aWV3KSB1cGRhdGUoe30sIHBheWxvYWQpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKHBheWxvYWQub25tYXRjaCkge1xuXHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZShwYXlsb2FkLm9ubWF0Y2gocGFyYW1zLCBwYXRoKSkudGhlbihmdW5jdGlvbihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdFx0dXBkYXRlKHBheWxvYWQsIHJlc29sdmVkKVxuXHRcdFx0XHRcdH0sIGJhaWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB1cGRhdGUocGF5bG9hZCwgXCJkaXZcIilcblx0XHRcdH1cblx0XHR9LCBiYWlsKVxuXHRcdHJlZHJhd1NlcnZpY2UwLnN1YnNjcmliZShyb290LCBydW4xKVxuXHR9XG5cdHJvdXRlLnNldCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIG9wdGlvbnMpIHtcblx0XHRpZiAobGFzdFVwZGF0ZSAhPSBudWxsKSBvcHRpb25zID0ge3JlcGxhY2U6IHRydWV9XG5cdFx0bGFzdFVwZGF0ZSA9IG51bGxcblx0XHRyb3V0ZVNlcnZpY2Uuc2V0UGF0aChwYXRoLCBkYXRhLCBvcHRpb25zKVxuXHR9XG5cdHJvdXRlLmdldCA9IGZ1bmN0aW9uKCkge3JldHVybiBjdXJyZW50UGF0aH1cblx0cm91dGUucHJlZml4ID0gZnVuY3Rpb24ocHJlZml4MCkge3JvdXRlU2VydmljZS5wcmVmaXggPSBwcmVmaXgwfVxuXHRyb3V0ZS5saW5rID0gZnVuY3Rpb24odm5vZGUxKSB7XG5cdFx0dm5vZGUxLmRvbS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHJvdXRlU2VydmljZS5wcmVmaXggKyB2bm9kZTEuYXR0cnMuaHJlZilcblx0XHR2bm9kZTEuZG9tLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHRpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLnNoaWZ0S2V5IHx8IGUud2hpY2ggPT09IDIpIHJldHVyblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRlLnJlZHJhdyA9IGZhbHNlXG5cdFx0XHR2YXIgaHJlZiA9IHRoaXMuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKVxuXHRcdFx0aWYgKGhyZWYuaW5kZXhPZihyb3V0ZVNlcnZpY2UucHJlZml4KSA9PT0gMCkgaHJlZiA9IGhyZWYuc2xpY2Uocm91dGVTZXJ2aWNlLnByZWZpeC5sZW5ndGgpXG5cdFx0XHRyb3V0ZS5zZXQoaHJlZiwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdFx0fVxuXHR9XG5cdHJvdXRlLnBhcmFtID0gZnVuY3Rpb24oa2V5Mykge1xuXHRcdGlmKHR5cGVvZiBhdHRyczMgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGtleTMgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBhdHRyczNba2V5M11cblx0XHRyZXR1cm4gYXR0cnMzXG5cdH1cblx0cmV0dXJuIHJvdXRlXG59XG5tLnJvdXRlID0gXzIwKHdpbmRvdywgcmVkcmF3U2VydmljZSlcbm0ud2l0aEF0dHIgPSBmdW5jdGlvbihhdHRyTmFtZSwgY2FsbGJhY2sxLCBjb250ZXh0KSB7XG5cdHJldHVybiBmdW5jdGlvbihlKSB7XG5cdFx0Y2FsbGJhY2sxLmNhbGwoY29udGV4dCB8fCB0aGlzLCBhdHRyTmFtZSBpbiBlLmN1cnJlbnRUYXJnZXQgPyBlLmN1cnJlbnRUYXJnZXRbYXR0ck5hbWVdIDogZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyTmFtZSkpXG5cdH1cbn1cbnZhciBfMjggPSBjb3JlUmVuZGVyZXIod2luZG93KVxubS5yZW5kZXIgPSBfMjgucmVuZGVyXG5tLnJlZHJhdyA9IHJlZHJhd1NlcnZpY2UucmVkcmF3XG5tLnJlcXVlc3QgPSByZXF1ZXN0U2VydmljZS5yZXF1ZXN0XG5tLmpzb25wID0gcmVxdWVzdFNlcnZpY2UuanNvbnBcbm0ucGFyc2VRdWVyeVN0cmluZyA9IHBhcnNlUXVlcnlTdHJpbmdcbm0uYnVpbGRRdWVyeVN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmdcbm0udmVyc2lvbiA9IFwiMS4wLjFcIlxubS52bm9kZSA9IFZub2RlXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlW1wiZXhwb3J0c1wiXSA9IG1cbmVsc2Ugd2luZG93Lm0gPSBtXG59IiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5cbnZhciBCb3ggPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJy5ib3gnLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIENPTE9SUyA9IFsnd2hpdGUnLCAnbGlnaHQnLCAnZGFyaycsICdibGFjaycsICdsaW5rJ107XHJcbnZhciBTVEFURVMgPSBbJ3ByaW1hcnknLCAnaW5mbycsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJ107XHJcbnZhciBTSVpFUyA9IFsnc21hbGwnLCAnJywgJ21lZGl1bScsICdsYXJnZSddO1xyXG5cclxuXHJcbnZhciBnZXRfY2xhc3NlcyA9IGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gICAgdmFyIGNsYXNzZXMgPSBbXTtcclxuICAgIGlmIChzdGF0ZS5jb2xvcikgeyBjbGFzc2VzLnB1c2goJ2lzLScgKyBzdGF0ZS5jb2xvcik7IH1cclxuICAgIGlmIChzdGF0ZS5zdGF0ZSkgeyBjbGFzc2VzLnB1c2goJ2lzLScgKyBzdGF0ZS5zdGF0ZSk7IH1cclxuICAgIGlmIChzdGF0ZS5zaXplKSB7IGNsYXNzZXMucHVzaCgnaXMtJyArIHN0YXRlLnNpemUpOyB9XHJcbiAgICBpZiAoc3RhdGUubG9hZGluZykgeyBjbGFzc2VzLnB1c2goJ2lzLWxvYWRpbmcnKTsgfVxyXG4gICAgaWYgKHN0YXRlLmhvdmVyZWQpIHsgY2xhc3Nlcy5wdXNoKCdpcy1ob3ZlcmVkJyk7IH1cclxuICAgIGlmIChzdGF0ZS5mb2N1c2VkKSB7IGNsYXNzZXMucHVzaCgnaXMtZm9jdXNlZCcpOyB9XHJcblxyXG4gICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpXHJcbn07XHJcblxyXG5cclxudmFyIGJ1bG1pZnkgPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgIHZhciBjbGFzc2VzID0gZ2V0X2NsYXNzZXMoc3RhdGUpO1xyXG4gICAgdmFyIG5ld19zdGF0ZSA9IHt9O1xyXG4gICAgaWYgKGNsYXNzZXMpIHsgbmV3X3N0YXRlLmNsYXNzID0gY2xhc3NlczsgfVxyXG4gICAgT2JqZWN0LmtleXMoc3RhdGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgIGlmIChbJ2NvbG9yJywgJ3N0YXRlJywgJ3NpemUnLCAnbG9hZGluZycsXHJcbiAgICAgICAgICAgICdpY29uJywgJ2NvbnRlbnQnLCAnaG92ZXJlZCcsICdmb2N1c2VkJ10uaW5kZXhPZihrZXkpID09PSAtMSlcclxuICAgICAgICAgICAgeyBuZXdfc3RhdGVba2V5XSA9IHN0YXRlW2tleV07IH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ld19zdGF0ZVxyXG59O1xyXG5cclxudmFyIGNvbGxlY3RfYm9vbGVhbiA9IGZ1bmN0aW9uIChzdGF0ZSwgbmFtZXMpIHtcclxuICAgIHZhciBzdHlsZXMgPSBbXTtcclxuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICBpZiAobmFtZSBpbiBzdGF0ZSAmJiBzdGF0ZVtuYW1lXSA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgeyBzdHlsZXMucHVzaCgnaXMtJyArIG5hbWUpOyB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblxyXG52YXIgc2xlZXAgPSBmdW5jdGlvbiAodGltZSkgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmV0dXJuIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSk7IH0pOyB9O1xyXG5cclxuXHJcbnZhciBzbWFsbGVyX3RoYW4gPSBmdW5jdGlvbiAoc3opIHsgcmV0dXJuIHN6ID8gU0laRVNbU0laRVMuaW5kZXhPZihzeikgLSAxXSA6ICdzbWFsbCc7IH07XG5cbnZhciBJY29uID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgdmFyIGF0dHJzID0gcmVmLmF0dHJzO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnc3Bhbi5pY29uJywge2NsYXNzOiBhdHRycy5zaXplID8gJ2lzLScgKyBhdHRycy5zaXplIDogJyd9LFxyXG4gICAgICAgICAgICBtKCdpLmZhJywge2NsYXNzOiAnZmEtJyArIGF0dHJzLmljb259KVxyXG4gICAgICAgICk7XG59XHJcbn07XG5cbnZhciBpY29uX2J1dHRvbiA9IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gW1xyXG4gICAgIXZub2RlLmF0dHJzLmljb25fcmlnaHQgP1xyXG4gICAgICAgIG0oSWNvbiwge2ljb246IHZub2RlLmF0dHJzLmljb24sIHNpemU6IHNtYWxsZXJfdGhhbih2bm9kZS5hdHRycy5zaXplKX0pIDogJycsXHJcbiAgICBtKCdzcGFuJywgdm5vZGUuYXR0cnMuY29udGVudCksXHJcbiAgICB2bm9kZS5hdHRycy5pY29uX3JpZ2h0ID9cclxuICAgICAgICBtKEljb24sIHtpY29uOiB2bm9kZS5hdHRycy5pY29uLCBzaXplOiBzbWFsbGVyX3RoYW4odm5vZGUuYXR0cnMuc2l6ZSl9KSA6ICcnXHJcbl07IH07XHJcblxyXG52YXIgQnV0dG9uID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdhLmJ1dHRvbicsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLmljb24gPyBpY29uX2J1dHRvbih2bm9kZSkgOiB2bm9kZS5hdHRycy5jb250ZW50KTsgfVxyXG59O1xuXG52YXIgTGFiZWwgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2xhYmVsLmxhYmVsJywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgSW5wdXQgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ3AuY29udHJvbCcsXHJcbiAgICAgICAgeyBjbGFzczogdm5vZGUuYXR0cnMuaWNvbiA/ICdoYXMtaWNvbiBoYXMtaWNvbi1yaWdodCcgOiAnJyB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgbSgnaW5wdXQuaW5wdXRbdHlwZT10ZXh0XScsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuaWNvbiA/IG0oSWNvbiwge3NpemU6ICdzbWFsbCcsIGljb246IHZub2RlLmF0dHJzLmljb259KSA6ICcnXHJcbiAgICAgICAgXVxyXG4gICAgKTsgfVxyXG59O1xyXG5cclxudmFyIFNlbGVjdCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgncC5jb250cm9sJyxcclxuICAgICAgICAgICAgbSgnc3Bhbi5zZWxlY3QnLCBidWxtaWZ5KHZub2RlLmF0dHJzKSxcclxuICAgICAgICAgICAgICAgIG0oJ3NlbGVjdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdm5vZGUuYXR0cnMuY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGspIHsgcmV0dXJuIG0oJ29wdGlvbicsIHt2YWx1ZToga1swXX0sIGtbMV0pOyB9KVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTsgfVxyXG59O1xyXG5cclxuXHJcbnZhciBUZXh0QXJlYSA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbShcInAuY29udHJvbFwiLFxyXG4gICAgICAgICAgICBtKFwidGV4dGFyZWEudGV4dGFyZWFcIiwgYnVsbWlmeSh2bm9kZS5hdHRycykpXHJcbiAgICAgICAgKTsgfVxyXG59O1xyXG5cclxuXHJcbnZhciBDaGVja0JveCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbShcInAuY29udHJvbFwiLFxyXG4gICAgICAgICAgICBtKFwibGFiZWwuY2hlY2tib3hcIixcclxuICAgICAgICAgICAgICAgIG0oXCJpbnB1dFt0eXBlPSdjaGVja2JveCddXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKSxcclxuICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLmNvbnRlbnRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7IH1cclxufTtcclxuXHJcblxyXG52YXIgUmFkaW8gPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oXCJwLmNvbnRyb2xcIixcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGspIHsgcmV0dXJuIG0oXCJsYWJlbC5yYWRpb1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oXCJpbnB1dFt0eXBlPSdyYWRpbyddXCIsIHt2YWx1ZToga1swXSwgbmFtZTogdm5vZGUuYXR0cnMubmFtZX0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGtbMV1cclxuICAgICAgICAgICAgICAgICk7IH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7IH1cclxufTtcblxudmFyIEltYWdlID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZmlndXJlLmltYWdlJyxcbiAgICAgICAgICAgIHtjbGFzczogdm5vZGUuYXR0cnMuc2l6ZSA/XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5zaXplICsgJ3gnICsgdm5vZGUuYXR0cnMuc2l6ZSA6XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5yYXRpb30sXG4gICAgICAgICAgICBtKCdpbWcnLCB7c3JjOiB2bm9kZS5hdHRycy5zcmN9KSk7IH1cbn07XG5cbnZhciBOb3RpZmljYXRpb24gPSB7XG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKFwiLm5vdGlmaWNhdGlvblwiLCBidWxtaWZ5KHZub2RlLmF0dHJzKSxcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLmRlbGV0ZSA/XG4gICAgICAgICAgICAgICAgbShcImJ1dHRvbi5kZWxldGVcIiwge29uY2xpY2s6IHZub2RlLmF0dHJzLm9uY2xpY2t9KSA6ICcnLFxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cbiAgICAgICAgKTsgfVxufTtcblxudmFyIFByb2dyZXNzID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbShcInByb2dyZXNzLnByb2dyZXNzXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLFxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cbiAgICAgICAgKTsgfVxufTtcblxudmFyIG9uY2xpY2sgPSBmdW5jdGlvbiAodm5vZGUsIHZhbCkgeyByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlc2V0KHZub2RlLCB2YWwpO1xyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB7IHZub2RlLmF0dHJzLm9uY2xpY2sodmFsKTsgfVxyXG4gICAgfTsgfTtcclxuXHJcbnZhciByZXNldCA9IGZ1bmN0aW9uICh2bm9kZSwgdmFsKSB7XHJcbiAgICB2bm9kZS5zdGF0ZS5jdXJyZW50ID0gdmFsO1xyXG4gICAgdmFyIG1heF9idXR0b25zID0gdm5vZGUuYXR0cnMubWF4X2J1dHRvbnMgfHwgMTA7XHJcbiAgICB2YXIgbmIgPSB2bm9kZS5hdHRycy5uYjtcclxuICAgIGlmIChuYiA+IG1heF9idXR0b25zKSB7XHJcbiAgICAgICAgdmFyIG1pZCA9IG5iIC8gMjtcclxuICAgICAgICBpZiAoWzEsIDJdLmluY2x1ZGVzKHZhbCkpIHsgdm5vZGUuc3RhdGUuYnV0dG9ucyA9IFsxLCAyLCAzLCBudWxsLCBtaWQsIG51bGwsIG5iXTsgfVxyXG4gICAgICAgIGVsc2UgaWYgKFtuYi0xLCBuYl0uaW5jbHVkZXModmFsKSkgeyB2bm9kZS5zdGF0ZS5idXR0b25zID0gWzEsIG51bGwsIG1pZCwgbnVsbCwgbmItMiwgbmItMSwgbmJdOyB9XHJcbiAgICAgICAgZWxzZSB7IHZub2RlLnN0YXRlLmJ1dHRvbnMgPSBbMSwgbnVsbCwgdmFsIC0gMSwgdmFsLCB2YWwgKyAxLCBudWxsLCBuYl07IH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuYnV0dG9ucyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG5iOyBpKyspIHsgdm5vZGUuc3RhdGUuYnV0dG9ucy5wdXNoKGkpOyB9XHJcbiAgICB9XHJcbn07XHJcblxyXG52YXIgUGFnaW5hdGlvbiA9IHtcclxuICAgIG9uaW5pdDogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiByZXNldCh2bm9kZSwgdm5vZGUuYXR0cnMuY3VycmVudCB8fCAxKTsgfSxcclxuXHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ25hdi5wYWdpbmF0aW9uJyxcclxuICAgICAgICBtKCdhLnBhZ2luYXRpb24tcHJldmlvdXMnLFxyXG4gICAgICAgICAgICB7b25jbGljazogb25jbGljayh2bm9kZSwgdm5vZGUuc3RhdGUuY3VycmVudCAtIDEpLFxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHZub2RlLnN0YXRlLmN1cnJlbnQgPT09IDF9LFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5wcmV2aW91c190ZXh0IHx8ICdQcmV2aW91cycpLFxyXG4gICAgICAgIG0oJ2EucGFnaW5hdGlvbi1uZXh0JyxcclxuICAgICAgICAgICAge29uY2xpY2s6IG9uY2xpY2sodm5vZGUsIHZub2RlLnN0YXRlLmN1cnJlbnQgKyAxKSxcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB2bm9kZS5zdGF0ZS5jdXJyZW50ID09PSB2bm9kZS5zdGF0ZS5idXR0b25zLmxlbmd0aH0sXHJcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLm5leHRfdGV4dCB8fCAnTmV4dCcpLFxyXG4gICAgICAgIG0oJ3VsLnBhZ2luYXRpb24tbGlzdCcsXHJcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLmJ1dHRvbnMubWFwKGZ1bmN0aW9uICh2YWwpIHsgcmV0dXJuIHZhbCA9PT0gbnVsbCA/XHJcbiAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ3NwYW4ucGFnaW5hdGlvbi1lbGxpcHNpcycsIG0udHJ1c3QoJyZoZWxsaXA7JykpKSA6XHJcbiAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ2EucGFnaW5hdGlvbi1saW5rJyxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5zdGF0ZS5jdXJyZW50ID09PSB2YWwgPyAnaXMtY3VycmVudCcgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrKHZub2RlLCB2YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdmFsKSk7IH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICk7IH1cclxufTtcblxudmFyIFNUWUxFUyA9IFsnYm9yZGVyZWQnLCAnc3RyaXBlZCcsICduYXJyb3cnXTtcblxudmFyIGhlYWRlcl9jb2wgPSBmdW5jdGlvbiAodm5vZGUsIGl0ZW0sIGlkeCkge1xuICAgIHZhciB3YXkgPSAoaWR4ID09PSB2bm9kZS5zdGF0ZS5zb3J0X2J5KSA/XG4gICAgICAgICh2bm9kZS5zdGF0ZS5zb3J0X2FzYyA/ICcgVScgOiAnIEQnKSA6ICcnO1xuICAgIHJldHVybiBpdGVtLm5hbWUgKyB3YXlcbn07XG5cblxudmFyIHRoX3RmID0gZnVuY3Rpb24gKHZub2RlLCB0YWcpIHsgcmV0dXJuIG0odGFnID09PSAnaGVhZGVyJyA/ICd0aGVhZCcgOiAndGZvb3QnLFxuICAgICAgICBtKCd0cicsXG4gICAgICAgICAgICB2bm9kZS5hdHRyc1t0YWddLm1hcChmdW5jdGlvbiAoaXRlbSwgaWR4KSB7IHJldHVybiBtKCd0aCcsIHtvbmNsaWNrOiBpdGVtLnNvcnRhYmxlID8gc29ydGhhbmRsZXIodm5vZGUsIGlkeCk6IG51bGx9LFxuICAgICAgICAgICAgICAgICAgICBpdGVtLnRpdGxlID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FiYnInLCB7dGl0bGU6IGl0ZW0udGl0bGV9LCBoZWFkZXJfY29sKHZub2RlLCBpdGVtLCBpZHgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBoZWFkZXJfY29sKHZub2RlLCBpdGVtLCBpZHgpKTsgfVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgKTsgfTtcblxudmFyIGNvbXBhcmF0b3IgPSBmdW5jdGlvbiAoaWR4KSB7IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgaWYgKGFbaWR4XSA8IGJbaWR4XSlcbiAgICAgICAgeyByZXR1cm4gLTEgfVxuICAgICAgaWYgKGFbaWR4XSA+IGJbaWR4XSlcbiAgICAgICAgeyByZXR1cm4gMSB9XG4gICAgICByZXR1cm4gMFxuICAgIH07IH07XG5cbnZhciBzb3J0aGFuZGxlciA9IGZ1bmN0aW9uICh2bm9kZSwgaWR4KSB7IHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh2bm9kZS5zdGF0ZS5zb3J0X2J5ID09PSBpZHgpXG4gICAgICAgICAgICB7IHZub2RlLnN0YXRlLnNvcnRfYXNjID0gISB2bm9kZS5zdGF0ZS5zb3J0X2FzYzsgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB7IHZub2RlLnN0YXRlLnNvcnRfYXNjID0gdHJ1ZTsgfVxuXG4gICAgICAgIHZub2RlLnN0YXRlLnNvcnRfYnkgPSBpZHg7XG4gICAgICAgIHZub2RlLnN0YXRlLnJvd3Muc29ydChjb21wYXJhdG9yKGlkeCkpO1xuICAgICAgICBpZiAoISB2bm9kZS5zdGF0ZS5zb3J0X2FzYylcbiAgICAgICAgICAgIHsgdm5vZGUuc3RhdGUucm93cy5yZXZlcnNlKCk7IH1cbiAgICB9OyB9O1xuXG52YXIgVGFibGUgPSB7XG5cbiAgICBvbmluaXQ6IGZ1bmN0aW9uICh2bm9kZSkge1xuICAgICAgICB2bm9kZS5zdGF0ZS5zb3J0X2J5ID0gbnVsbDtcbiAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9hc2MgPSB0cnVlO1xuICAgICAgICB2bm9kZS5zdGF0ZS5yb3dzID0gdm5vZGUuYXR0cnMucm93cztcbiAgICAgICAgaWYgKHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KXtcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLnBhZ2UgPSAxO1xuICAgICAgICAgICAgdm5vZGUuc3RhdGUuc3RhcnRfYXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHsgdm5vZGUuc3RhdGUuZGlzcGxheV9yb3dzID0gdm5vZGUuYXR0cnMucm93czsgfVxuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIFtcbiAgICAgICAgbSgndGFibGUudGFibGUnLCB7Y2xhc3M6IGNvbGxlY3RfYm9vbGVhbih2bm9kZS5hdHRycywgU1RZTEVTKX0sXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5oZWFkZXIgPyB0aF90Zih2bm9kZSwgJ2hlYWRlcicpIDogbnVsbCxcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLmZvb3RlciA/IHRoX3RmKHZub2RlLCAnZm9vdGVyJykgOiBudWxsLFxuICAgICAgICAgICAgbSgndGJvZHknLFxuICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLnJvd3Muc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLnN0YXJ0X2F0LFxuICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5zdGFydF9hdCArIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KS5tYXAoZnVuY3Rpb24gKHJvdykgeyByZXR1cm4gbSgndHInLCByb3cubWFwKGZ1bmN0aW9uIChjb2wpIHsgcmV0dXJuIG0oJ3RkJywgY29sKTsgfSkpOyB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICApXG4gICAgICAgICksXG5cbiAgICAgICAgdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkgP1xuICAgICAgICAgICAgbShQYWdpbmF0aW9uLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmI6IE1hdGguY2VpbCh2bm9kZS5zdGF0ZS5yb3dzLmxlbmd0aCAvIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KSxcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogZnVuY3Rpb24gKG5iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5wYWdlID0gbmI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bm9kZS5zdGF0ZS5zdGFydF9hdCA9IG5iID09PSAxID8gMCA6ICgobmIgLTEpICogdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSA6IG51bGxcbiAgICBdOyB9XG59O1xuXG52YXIgVGFnID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdzcGFuLnRhZycsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIFRpdGxlID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnaCcgKyB2bm9kZS5hdHRycy5zaXplICsgJy50aXRsZScgKyAnLmlzLScgKyB2bm9kZS5hdHRycy5zaXplLCB2bm9kZS5jaGlsZHJlbik7IH1cbn07XG5cblxudmFyIFN1YlRpdGxlID0ge1xuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnaCcgKyB2bm9kZS5hdHRycy5zaXplICsgJy5zdWJ0aXRsZScgKyAnLmlzLScgKyB2bm9kZS5hdHRycy5zaXplLCB2bm9kZS5jaGlsZHJlbik7IH1cbn07XG5cbnZhciBDb250ZW50ID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdjb250ZW50Jywge2NsYXNzOiB2bm9kZS5hdHRycy5zaXplID8gJ2lzLScgKyB2bm9kZS5hdHRycy5zaXplIDogJyd9LFxyXG4gICAgICAgICAgICB2bm9kZS5jaGlsZHJlblxyXG4gICAgICAgICk7IH1cclxufTtcblxudmFyIExldmVsID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCduYXYubGV2ZWwnLFxyXG4gICAgICAgIHsnaXMtbW9iaWxlJzogdm5vZGUuYXR0cnMubW9iaWxlfSwgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5cclxudmFyIExldmVsSXRlbSA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgncC5sZXZlbC1pdGVtJyxcclxuICAgICAgICB7Y2xhc3M6IHZub2RlLmF0dHJzLmNlbnRlcmVkID8gJ2hhcy10ZXh0LWNlbnRlcmVkJzogJyd9LCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcblxudmFyIE1lZGlhTGVmdCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZmlndXJlLm1lZGlhLWxlZnQnLCB2bm9kZS5jaGlsZHJlbik7IH1cclxufTtcclxuXHJcbnZhciBNZWRpYUNvbnRlbnQgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2Rpdi5tZWRpYS1jb250ZW50Jywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgTWVkaWFSaWdodCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnZGl2Lm1lZGlhLXJpZ2h0Jywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgTWVkaWEgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2FydGljbGUubWVkaWEnLCBbXHJcblxyXG4gICAgICAgIHZub2RlLmF0dHJzLmltYWdlID9cclxuICAgICAgICAgICAgbShNZWRpYUxlZnQsIG0oJ3AuaW1hZ2UnLCB7Y2xhc3M6ICdpcy0nICsgdm5vZGUuYXR0cnMuaW1hZ2UucmF0aW99LFxyXG4gICAgICAgICAgICAgICAgbSgnaW1nJywgeydzcmMnOiB2bm9kZS5hdHRycy5pbWFnZS5zcmN9KSkpIDogJycsXHJcblxyXG4gICAgICAgIG0oTWVkaWFDb250ZW50LCB2bm9kZS5jaGlsZHJlbiksXHJcblxyXG4gICAgICAgIHZub2RlLmF0dHJzLmJ1dHRvbiA/IG0oTWVkaWFSaWdodCwgdm5vZGUuYXR0cnMuYnV0dG9uKSA6ICcnXHJcbiAgICBdKTsgfVxyXG59O1xuXG52YXIgY2xpY2toYW5kbGVyID0gZnVuY3Rpb24gKGdsb2JhbF9zdGF0ZSwgaXRlbSwgc3RhdGUpIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBnbG9iYWxfc3RhdGUuc2VsZWN0ZWQgPSBpdGVtLmtleTtcclxuICAgICAgICBpZiAoZ2xvYmFsX3N0YXRlLmNvbGxhcHNhYmxlICYmIHN0YXRlKSB7IHN0YXRlLmNvbGxhcHNlZCA9ICEgc3RhdGUuY29sbGFwc2VkOyB9XHJcbiAgICAgICAgaWYgKGl0ZW0ub25jbGljaykgeyBpdGVtLm9uY2xpY2soaXRlbS5rZXkpOyB9XHJcbiAgICB9OyB9O1xyXG5cclxuXHJcbnZhciBNZW51SXRlbSA9IHtcclxuICAgIG9uaW5pdDogZnVuY3Rpb24gKHZub2RlKSB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gdm5vZGUuYXR0cnMucm9vdC5jb2xsYXBzZWQgfHwgZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBbXHJcbiAgICAgICAgICAgIG0oJ2EnLCB7b25jbGljazogY2xpY2toYW5kbGVyKHZub2RlLmF0dHJzLnN0YXRlLCB2bm9kZS5hdHRycy5yb290LCB2bm9kZS5zdGF0ZSksXHJcbiAgICAgICAgICAgICAgICBjbGFzczogdm5vZGUuYXR0cnMuc3RhdGUuc2VsZWN0ZWQgPT09IHZub2RlLmF0dHJzLnJvb3Qua2V5ID8gXCJpcy1hY3RpdmVcIiA6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgdm5vZGUuYXR0cnMucm9vdC5sYWJlbCxcclxuICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLnN0YXRlLmNvbGxhcHNhYmxlID8gXHJcbiAgICAgICAgICAgICAgICAgICAgKHZub2RlLnN0YXRlLmNvbGxhcHNlZCA/IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKEljb24sIHtpY29uOiAnY2FyZXQtdXAnLCBzaXplOiAnc21hbGwnfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBtKEljb24sIHtpY29uOiAnY2FyZXQtZG93bicsIHNpemU6ICdzbWFsbCd9KSk6IG51bGwpLFxyXG4gICAgICAgICAgICAoIXZub2RlLmF0dHJzLnN0YXRlLmNvbGxhcHNhYmxlIHx8ICF2bm9kZS5zdGF0ZS5jb2xsYXBzZWQpICYmIHZub2RlLmF0dHJzLnJvb3QuaXRlbXMgP1xyXG4gICAgICAgICAgICAgICAgbSgndWwnLCB2bm9kZS5hdHRycy5yb290Lml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gbSgnbGknLCBtKCdhJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogdm5vZGUuYXR0cnMuc3RhdGUuc2VsZWN0ZWQgPT09IGl0ZW0ua2V5ID8gXCJpcy1hY3RpdmVcIiA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGNsaWNraGFuZGxlcih2bm9kZS5hdHRycy5zdGF0ZSwgaXRlbSwgbnVsbCl9LCBpdGVtLmxhYmVsKSk7IH0pKVxyXG4gICAgICAgICAgICAgICAgOiBudWxsXHJcbiAgICAgICAgXTsgfVxyXG59O1xyXG5cclxudmFyIE1lbnUgPSB7XHJcbiAgICBvbmluaXQ6IGZ1bmN0aW9uICh2bm9kZSkge1xyXG4gICAgICAgIHZub2RlLnN0YXRlID0gdm5vZGUuYXR0cnM7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2FibGUgPSAgdm5vZGUuYXR0cnMuY29sbGFwc2FibGUgfHwgZmFsc2U7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gdm5vZGUuYXR0cnMuY29sbGFwc2VkIHx8IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnYXNpZGUubWVudScsXHJcbiAgICAgICAgdm5vZGUuc3RhdGUuaXRlbXMubWFwKGZ1bmN0aW9uIChtZW51KSB7IHJldHVybiBbXHJcbiAgICAgICAgICAgIG0oJ3AubWVudS1sYWJlbCcsIHtvbmNsaWNrOiB2bm9kZS5hdHRycy5jb2xsYXBzYWJsZSA/IFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gIXZub2RlLnN0YXRlLmNvbGxhcHNlZDsgfSA6IG51bGx9LCBcclxuICAgICAgICAgICAgICAgIG1lbnUubGFiZWwsIFxyXG4gICAgICAgICAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2FibGUgPyBcclxuICAgICAgICAgICAgICAgICAgICAodm5vZGUuc3RhdGUuY29sbGFwc2VkID8gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oSWNvbiwge2ljb246ICdjYXJldC11cCcsIHNpemU6ICdzbWFsbCd9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG0oSWNvbiwge2ljb246ICdjYXJldC1kb3duJywgc2l6ZTogJ3NtYWxsJ30pKTogbnVsbCksXHJcbiAgICAgICAgICAgICF2bm9kZS5zdGF0ZS5jb2xsYXBzYWJsZSB8fCAhdm5vZGUuc3RhdGUuY29sbGFwc2VkID9cclxuICAgICAgICAgICAgICAgIG0oJ3VsLm1lbnUtbGlzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIG0oJ2xpJywgbShNZW51SXRlbSwge3N0YXRlOiB2bm9kZS5zdGF0ZSwgcm9vdDogaXRlbX0pKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICkgOiBudWxsXHJcbiAgICAgICAgXTsgfSlcclxuICAgICk7IH1cclxufTtcblxudmFyIE1lc3NhZ2UgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2FydGljbGUubWVzc2FnZScsXHJcbiAgICAgICAge2NsYXNzOiB2bm9kZS5hdHRycy5jb2xvciA/ICdpcy0nICsgdm5vZGUuYXR0cnMuY29sb3IgOiAnJ30sIFtcclxuICAgICAgICB2bm9kZS5hdHRycy5oZWFkZXIgP1xyXG4gICAgICAgICAgICBtKCcubWVzc2FnZS1oZWFkZXInLCBtKCdwJywgdm5vZGUuYXR0cnMuaGVhZGVyKSxcclxuICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLm9uY2xvc2UgPyBtKCdidXR0b24nLFxyXG4gICAgICAgICAgICAgICAgICAgIHtjbGFzczogJ2RlbGV0ZScsIG9uY2xpY2s6IHZub2RlLmF0dHJzLm9uY2xvc2V9KTogJycpXHJcbiAgICAgICAgOiAnJyxcclxuICAgICAgICBtKCcubWVzc2FnZS1ib2R5Jywgdm5vZGUuY2hpbGRyZW4pXHJcbiAgICBdKTsgfVxyXG59O1xuXG52YXIgTW9kYWwgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJy5tb2RhbCcsIHtjbGFzczogdm5vZGUuYXR0cnMuYWN0aXZlID8gJ2lzLWFjdGl2ZSc6ICcnfSwgW1xyXG4gICAgICAgICAgICBtKCcubW9kYWwtYmFja2dyb3VuZCcpLFxyXG4gICAgICAgICAgICBtKCcubW9kYWwtY29udGVudCcsIHZub2RlLmNoaWxkcmVuKSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMub25jbG9zZSA/IG0oJy5idXR0b24ubW9kYWwtY2xvc2UnLCB7b25jbGljazogdm5vZGUuYXR0cnMub25jbG9zZX0pOiAnJ1xyXG4gICAgXSk7IH1cclxufTtcblxudmFyIE5hdiA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnbmF2Lm5hdicsIFtcclxuICAgICAgICB2bm9kZS5hdHRycy5sZWZ0ID8gbSgnLm5hdi1sZWZ0Jywgdm5vZGUuYXR0cnMubGVmdC5tYXAoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIG0oJ2EubmF2LWl0ZW0nLCBpdGVtKTsgfSkpIDogJycsXHJcbiAgICAgICAgdm5vZGUuYXR0cnMuY2VudGVyID8gbSgnLm5hdi1jZW50ZXInLCB2bm9kZS5hdHRycy5jZW50ZXIubWFwKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBtKCdhLm5hdi1pdGVtJywgaXRlbSk7IH0pKSA6ICcnLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLnJpZ2h0ID8gbSgnLm5hdi1yaWdodCcsIHZub2RlLmF0dHJzLnJpZ2h0Lm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gbSgnYS5uYXYtaXRlbScsIGl0ZW0pOyB9KSkgOiAnJ1xyXG4gICAgXSk7IH1cclxufTtcblxudmFyIENhcmRIZWFkZXIgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2hlYWRlci5jYXJkLWhlYWRlcicsIFtcclxuICAgICAgICBtKCdwLmNhcmQtaGVhZGVyLXRpdGxlJywgdm5vZGUuYXR0cnMudGl0bGUpLFxyXG4gICAgICAgIG0oJ2EuY2FyZC1oZWFkZXItaWNvbicsIHZub2RlLmF0dHJzLmljb24pXHJcbiAgICBdKTsgfVxyXG59O1xyXG5cclxudmFyIENhcmRGb290ZXIgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2Zvb3Rlci5jYXJkLWZvb3RlcicsIHZub2RlLmNoaWxkcmVuKTsgfVxyXG59O1xyXG5cclxudmFyIENhcmRGb290ZXJJdGVtID0ge1xyXG4gICAgdmlldzogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiBtKCdhLmNhcmQtZm9vdGVyLWl0ZW0nLCB2bm9kZS5hdHRycyk7IH1cclxufTtcclxuXHJcbnZhciBDYXJkQ29udGVudCA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnLmNhcmQtY29udGVudCcsIHZub2RlLmNoaWxkcmVuKTsgfVxyXG59O1xyXG5cclxudmFyIENhcmQgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJy5jYXJkJywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XG5cbnZhciBvbmNsaWNrJDEgPSBmdW5jdGlvbiAodm5vZGUsIGl0ZW0sIGlkeCkgeyByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZub2RlLnN0YXRlLmFjdGl2ZSA9IGlkeDtcclxuICAgICAgICBpZiAodm5vZGUuYXR0cnMub25jbGljaykgeyB2bm9kZS5hdHRycy5vbmNsaWNrKGl0ZW0pOyB9XHJcbiAgICB9OyB9O1xyXG5cclxudmFyIFRhYnNNZW51ID0ge1xyXG4gICAgb25pbml0OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIHZub2RlLnN0YXRlLmFjdGl2ZSA9IHZub2RlLmF0dHJzLmFjdGl2ZSB8fCAwOyB9LFxyXG5cclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnLnRhYnMnLCBtKCd1bCcsXHJcbiAgICAgICAgdm5vZGUuYXR0cnMuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIG0oJ2xpJyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogaWR4ID09PSB2bm9kZS5zdGF0ZS5hY3RpdmUgPyAnaXMtYWN0aXZlJyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogb25jbGljayQxKHZub2RlLCBpdGVtLCBpZHgpXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbSgnYScsIGl0ZW0uaWNvbiA/IFtcclxuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmljb24uaXMtc21hbGwnLFxyXG4gICAgICAgICAgICAgICAgICAgIG0oJ2kuZmEnLCB7Y2xhc3M6ICdmYS0nICsgaXRlbS5pY29ufSkpLCBtKCdzcGFuJywgaXRlbS5sYWJlbCldXHJcbiAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmxhYmVsKVxyXG4gICAgICAgICAgICApOyB9XHJcbiAgICAgICAgKVxyXG4gICAgKSk7IH1cclxufTtcclxuXHJcblxyXG52YXIgY2xpY2toYW5kbGVyJDEgPSBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiB2bm9kZS5zdGF0ZS5hY3RpdmUgPSBpdGVtLmtleTsgfTsgfTtcclxuXHJcbnZhciBUYWJzID0ge1xyXG4gICAgb25pbml0OiBmdW5jdGlvbiAodm5vZGUpIHtcclxuICAgICAgICB2bm9kZS5zdGF0ZS5hY3RpdmUgPSB2bm9kZS5hdHRycy5hY3RpdmUgfHwgMDtcclxuICAgICAgICB2bm9kZS5zdGF0ZS5pdGVtcyA9IHZub2RlLmF0dHJzLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSwgaWR4KSB7XHJcbiAgICAgICAgICAgIGl0ZW0ua2V5ID0gaWR4O1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4JywgZmxleDogJzEnLCB3aWR0aDogJzEwMCUnLCAnZmxleC1kaXJlY3Rpb24nOiAnY29sdW1uJ319LCBbXHJcbiAgICAgICAgICAgIG0oVGFic01lbnUsIHthY3RpdmU6IHZub2RlLnN0YXRlLmFjdGl2ZSwgb25jbGljazogY2xpY2toYW5kbGVyJDEodm5vZGUpLCBpdGVtczogdm5vZGUuc3RhdGUuaXRlbXN9KSxcclxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBtKCdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHtzdHlsZToge2Rpc3BsYXk6IGl0ZW0ua2V5ID09PSB2bm9kZS5zdGF0ZS5hY3RpdmUgPyAnYmxvY2snOiAnbm9uZScsICdtYXJnaW4tbGVmdCc6ICcxMHB4J319LFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY29udGVudFxyXG4gICAgICAgICAgICAgICAgKTsgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgXSk7IH1cclxuXHJcbn07XG5cbnZhciBvbmNsaWNrJDIgPSBmdW5jdGlvbiAodm5vZGUsIGl0ZW0sIGlkeCkgeyByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh2bm9kZS5zdGF0ZS5hY3RpdmUgPT09IGlkeCkgeyB2bm9kZS5zdGF0ZS5hY3RpdmUgPSBudWxsOyB9XHJcbiAgICAgICAgZWxzZSB7IHZub2RlLnN0YXRlLmFjdGl2ZSA9IGlkeDsgfVxyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB7IHZub2RlLmF0dHJzLm9uY2xpY2soaXRlbSk7IH1cclxuICAgIH07IH07XHJcblxyXG52YXIgUGFuZWwgPSB7XHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIG0oJ25hdi5wYW5lbCcsIHZub2RlLmNoaWxkcmVuKTsgfVxyXG59O1xyXG5cclxudmFyIFBhbmVsSGVhZGluZyA9IHtcclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgncC5wYW5lbC1oZWFkaW5nJywgdm5vZGUuY2hpbGRyZW4pOyB9XHJcbn07XHJcblxyXG52YXIgUGFuZWxUYWJzID0ge1xyXG4gICAgb25pbml0OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIHZub2RlLnN0YXRlLmFjdGl2ZSA9IHZub2RlLmF0dHJzLmFjdGl2ZSB8fCBudWxsOyB9LFxyXG5cclxuICAgIHZpZXc6IGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gbSgnLnBhbmVsLXRhYnMnLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSwgaWR4KSB7IHJldHVybiBtKCdhJyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogaWR4ID09PSB2bm9kZS5zdGF0ZS5hY3RpdmUgPyAnaXMtYWN0aXZlJyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogb25jbGljayQyKHZub2RlLCBpdGVtLCBpZHgpXHJcbiAgICAgICAgICAgICAgICB9LCBpdGVtLmxhYmVsXHJcbiAgICAgICAgICAgICk7IH1cclxuICAgICAgICApXHJcbiAgICApOyB9XHJcbn07XHJcblxyXG5cclxuXHJcbnZhciBQYW5lbEJsb2NrcyA9IHtcclxuICAgIG9uaW5pdDogZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiB2bm9kZS5zdGF0ZS5hY3RpdmUgPSB2bm9kZS5hdHRycy5hY3RpdmUgfHwgbnVsbDsgfSxcclxuXHJcbiAgICB2aWV3OiBmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIHZub2RlLmF0dHJzLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSwgaWR4KSB7IHJldHVybiBtKCdhLnBhbmVsLWJsb2NrJywge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGlkeCA9PT0gdm5vZGUuc3RhdGUuYWN0aXZlID8gJ2lzLWFjdGl2ZScgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgb25jbGljazogb25jbGljayQyKHZub2RlLCBpdGVtLCBpZHgpXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgbSgnc3Bhbi5wYW5lbC1pY29uJywgbSgnaS5mYScsIHtjbGFzczogJ2ZhLScgKyBpdGVtLmljb259KSksXHJcbiAgICAgICAgICAgIGl0ZW0ubGFiZWxcclxuICAgICAgICBdKTsgfVxyXG4gICAgKTsgfVxyXG59O1xuXG5leHBvcnQgeyBCb3gsIEJ1dHRvbiwgSWNvbiwgTGFiZWwsIElucHV0LCBTZWxlY3QsIFRleHRBcmVhLCBDaGVja0JveCwgUmFkaW8sIEltYWdlLCBOb3RpZmljYXRpb24sIFByb2dyZXNzLCBUYWJsZSwgVGFnLCBUaXRsZSwgU3ViVGl0bGUsIENvbnRlbnQsIExldmVsLCBMZXZlbEl0ZW0sIE1lZGlhLCBNZW51LCBNZXNzYWdlLCBNb2RhbCwgTmF2LCBDYXJkLCBDYXJkSGVhZGVyLCBDYXJkQ29udGVudCwgQ2FyZEZvb3RlciwgQ2FyZEZvb3Rlckl0ZW0sIFBhZ2luYXRpb24sIFRhYnMsIFBhbmVsLCBQYW5lbEhlYWRpbmcsIFBhbmVsVGFicywgUGFuZWxCbG9ja3MsIENPTE9SUywgU1RBVEVTLCBTSVpFUywgZ2V0X2NsYXNzZXMsIGJ1bG1pZnksIGNvbGxlY3RfYm9vbGVhbiwgc2xlZXAsIHNtYWxsZXJfdGhhbiB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqcHVkV3hzTENKemIzVnlZMlZ6SWpwYklpNHVMM055WXk5bGJHVnRaVzUwY3k5aWIzZ3Vhbk1pTENJdUxpOXpjbU12WTI5dGJXOXVMMmx1WkdWNExtcHpJaXdpTGk0dmMzSmpMMlZzWlcxbGJuUnpMMmxqYjI0dWFuTWlMQ0l1TGk5emNtTXZaV3hsYldWdWRITXZZblYwZEc5dUxtcHpJaXdpTGk0dmMzSmpMMlZzWlcxbGJuUnpMMlp2Y20wdWFuTWlMQ0l1TGk5emNtTXZaV3hsYldWdWRITXZhVzFoWjJVdWFuTWlMQ0l1TGk5emNtTXZaV3hsYldWdWRITXZibTkwYVdacFkyRjBhVzl1TG1weklpd2lMaTR2YzNKakwyVnNaVzFsYm5SekwzQnliMmR5WlhOekxtcHpJaXdpTGk0dmMzSmpMMk52YlhCdmJtVnVkSE12Y0dGbmFXNWhkR2x2Ymk1cWN5SXNJaTR1TDNOeVl5OWxiR1Z0Wlc1MGN5OTBZV0pzWlM1cWN5SXNJaTR1TDNOeVl5OWxiR1Z0Wlc1MGN5OTBZV2N1YW5NaUxDSXVMaTl6Y21NdlpXeGxiV1Z1ZEhNdmRHbDBiR1V1YW5NaUxDSXVMaTl6Y21NdlpXeGxiV1Z1ZEhNdlkyOXVkR1Z1ZEM1cWN5SXNJaTR1TDNOeVl5OWpiMjF3YjI1bGJuUnpMMnhsZG1Wc0xtcHpJaXdpTGk0dmMzSmpMMk52YlhCdmJtVnVkSE12YldWa2FXRXVhbk1pTENJdUxpOXpjbU12WTI5dGNHOXVaVzUwY3k5dFpXNTFMbXB6SWl3aUxpNHZjM0pqTDJOdmJYQnZibVZ1ZEhNdmJXVnpjMkZuWlM1cWN5SXNJaTR1TDNOeVl5OWpiMjF3YjI1bGJuUnpMMjF2WkdGc0xtcHpJaXdpTGk0dmMzSmpMMk52YlhCdmJtVnVkSE12Ym1GMkxtcHpJaXdpTGk0dmMzSmpMMk52YlhCdmJtVnVkSE12WTJGeVpDNXFjeUlzSWk0dUwzTnlZeTlqYjIxd2IyNWxiblJ6TDNSaFluTXVhbk1pTENJdUxpOXpjbU12WTI5dGNHOXVaVzUwY3k5d1lXNWxiQzVxY3lKZExDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SnBiWEJ2Y25RZ2JTQm1jbTl0SUZ3aWJXbDBhSEpwYkZ3aVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdRbTk0SUQwZ2UxeHlYRzRnSUNBZ2RtbGxkem9nS0hadWIyUmxLU0E5UGlCdEtDY3VZbTk0Snl3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1SWl3aVhISmNibVY0Y0c5eWRDQmpiMjV6ZENCRFQweFBVbE1nUFNCYkozZG9hWFJsSnl3Z0oyeHBaMmgwSnl3Z0oyUmhjbXNuTENBbllteGhZMnNuTENBbmJHbHVheWRkWEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JUVkVGVVJWTWdQU0JiSjNCeWFXMWhjbmtuTENBbmFXNW1ieWNzSUNkemRXTmpaWE56Snl3Z0ozZGhjbTVwYm1jbkxDQW5aR0Z1WjJWeUoxMWNjbHh1Wlhod2IzSjBJR052Ym5OMElGTkpXa1ZUSUQwZ1d5ZHpiV0ZzYkNjc0lDY25MQ0FuYldWa2FYVnRKeXdnSjJ4aGNtZGxKMTFjY2x4dVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdaMlYwWDJOc1lYTnpaWE1nUFNBb2MzUmhkR1VwSUQwK0lIdGNjbHh1SUNBZ0lHeGxkQ0JqYkdGemMyVnpJRDBnVzExY2NseHVJQ0FnSUdsbUlDaHpkR0YwWlM1amIyeHZjaWtnWTJ4aGMzTmxjeTV3ZFhOb0tDZHBjeTBuSUNzZ2MzUmhkR1V1WTI5c2IzSXBYSEpjYmlBZ0lDQnBaaUFvYzNSaGRHVXVjM1JoZEdVcElHTnNZWE56WlhNdWNIVnphQ2duYVhNdEp5QXJJSE4wWVhSbExuTjBZWFJsS1Z4eVhHNGdJQ0FnYVdZZ0tITjBZWFJsTG5OcGVtVXBJR05zWVhOelpYTXVjSFZ6YUNnbmFYTXRKeUFySUhOMFlYUmxMbk5wZW1VcFhISmNiaUFnSUNCcFppQW9jM1JoZEdVdWJHOWhaR2x1WnlrZ1kyeGhjM05sY3k1d2RYTm9LQ2RwY3kxc2IyRmthVzVuSnlsY2NseHVJQ0FnSUdsbUlDaHpkR0YwWlM1b2IzWmxjbVZrS1NCamJHRnpjMlZ6TG5CMWMyZ29KMmx6TFdodmRtVnlaV1FuS1Z4eVhHNGdJQ0FnYVdZZ0tITjBZWFJsTG1adlkzVnpaV1FwSUdOc1lYTnpaWE11Y0hWemFDZ25hWE10Wm05amRYTmxaQ2NwWEhKY2JseHlYRzRnSUNBZ2NtVjBkWEp1SUdOc1lYTnpaWE11YW05cGJpZ25JQ2NwWEhKY2JuMWNjbHh1WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1luVnNiV2xtZVNBOUlDaHpkR0YwWlNrZ1BUNGdlMXh5WEc0Z0lDQWdiR1YwSUdOc1lYTnpaWE1nUFNCblpYUmZZMnhoYzNObGN5aHpkR0YwWlNsY2NseHVJQ0FnSUd4bGRDQnVaWGRmYzNSaGRHVWdQU0I3ZlZ4eVhHNGdJQ0FnYVdZZ0tHTnNZWE56WlhNcElHNWxkMTl6ZEdGMFpTNWpiR0Z6Y3lBOUlHTnNZWE56WlhOY2NseHVJQ0FnSUU5aWFtVmpkQzVyWlhsektITjBZWFJsS1M1bWIzSkZZV05vS0d0bGVTQTlQaUI3WEhKY2JpQWdJQ0FnSUNBZ2FXWWdLRnNuWTI5c2IzSW5MQ0FuYzNSaGRHVW5MQ0FuYzJsNlpTY3NJQ2RzYjJGa2FXNW5KeXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKMmxqYjI0bkxDQW5ZMjl1ZEdWdWRDY3NJQ2RvYjNabGNtVmtKeXdnSjJadlkzVnpaV1FuWFM1cGJtUmxlRTltS0d0bGVTa2dQVDA5SUMweEtWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZGZjM1JoZEdWYmEyVjVYU0E5SUhOMFlYUmxXMnRsZVYxY2NseHVJQ0FnSUgwcFhISmNiaUFnSUNCeVpYUjFjbTRnYm1WM1gzTjBZWFJsWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JqYjJ4c1pXTjBYMkp2YjJ4bFlXNGdQU0FvYzNSaGRHVXNJRzVoYldWektTQTlQaUI3WEhKY2JpQWdJQ0JzWlhRZ2MzUjViR1Z6SUQwZ1cxMWNjbHh1SUNBZ0lHNWhiV1Z6TG1admNrVmhZMmdvYm1GdFpTQTlQaUI3WEhKY2JpQWdJQ0FnSUNBZ2FXWWdLRzVoYldVZ2FXNGdjM1JoZEdVZ0ppWWdjM1JoZEdWYmJtRnRaVjBnUFQwOUlIUnlkV1VwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSE4wZVd4bGN5NXdkWE5vS0NkcGN5MG5JQ3NnYm1GdFpTbGNjbHh1SUNBZ0lIMHBYSEpjYm4xY2NseHVYSEpjYmx4eVhHNWxlSEJ2Y25RZ1kyOXVjM1FnYzJ4bFpYQWdQU0FvZEdsdFpTa2dQVDVjY2x4dUlDQWdJRzVsZHlCUWNtOXRhWE5sS0NoeVpYTnZiSFpsS1NBOVBpQnpaWFJVYVcxbGIzVjBLSEpsYzI5c2RtVXNJSFJwYldVcEtWeHlYRzVjY2x4dVhISmNibVY0Y0c5eWRDQmpiMjV6ZENCemJXRnNiR1Z5WDNSb1lXNGdQU0FvYzNvcElEMCtJSE42SUQ4Z1UwbGFSVk5iVTBsYVJWTXVhVzVrWlhoUFppaHplaWtnTFNBeFhTQTZJQ2R6YldGc2JDZGNjbHh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFbGpiMjRnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZTJGMGRISnpmU2tnUFQ1Y2NseHVJQ0FnSUNBZ0lDQnRLQ2R6Y0dGdUxtbGpiMjRuTENCN1kyeGhjM002SUdGMGRISnpMbk5wZW1VZ1B5QW5hWE10SnlBcklHRjBkSEp6TG5OcGVtVWdPaUFuSjMwc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUcwb0oya3VabUVuTENCN1kyeGhjM002SUNkbVlTMG5JQ3NnWVhSMGNuTXVhV052Ym4wcFhISmNiaUFnSUNBZ0lDQWdLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dWFXMXdiM0owSUhzZ1luVnNiV2xtZVN3Z2MyMWhiR3hsY2w5MGFHRnVJSDBnWm5KdmJTQW5MaTR2WTI5dGJXOXVKMXh5WEc1cGJYQnZjblFnZXlCSlkyOXVJSDBnWm5KdmJTQW5MaTlwWTI5dUxtcHpKMXh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUdsamIyNWZZblYwZEc5dUlEMGdLSFp1YjJSbEtTQTlQaUJiWEhKY2JpQWdJQ0FoZG01dlpHVXVZWFIwY25NdWFXTnZibDl5YVdkb2RDQS9YSEpjYmlBZ0lDQWdJQ0FnYlNoSlkyOXVMQ0I3YVdOdmJqb2dkbTV2WkdVdVlYUjBjbk11YVdOdmJpd2djMmw2WlRvZ2MyMWhiR3hsY2w5MGFHRnVLSFp1YjJSbExtRjBkSEp6TG5OcGVtVXBmU2tnT2lBbkp5eGNjbHh1SUNBZ0lHMG9KM053WVc0bkxDQjJibTlrWlM1aGRIUnljeTVqYjI1MFpXNTBLU3hjY2x4dUlDQWdJSFp1YjJSbExtRjBkSEp6TG1samIyNWZjbWxuYUhRZ1AxeHlYRzRnSUNBZ0lDQWdJRzBvU1dOdmJpd2dlMmxqYjI0NklIWnViMlJsTG1GMGRISnpMbWxqYjI0c0lITnBlbVU2SUhOdFlXeHNaWEpmZEdoaGJpaDJibTlrWlM1aGRIUnljeTV6YVhwbEtYMHBJRG9nSnlkY2NseHVYVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUVKMWRIUnZiaUE5SUh0Y2NseHVJQ0FnSUhacFpYYzZJQ2gyYm05a1pTa2dQVDRnYlNnbllTNWlkWFIwYjI0bkxDQmlkV3h0YVdaNUtIWnViMlJsTG1GMGRISnpLU3hjY2x4dUlDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWN5NXBZMjl1SUQ4Z2FXTnZibDlpZFhSMGIyNG9kbTV2WkdVcElEb2dkbTV2WkdVdVlYUjBjbk11WTI5dWRHVnVkQ2xjY2x4dWZWeHlYRzRpTENKcGJYQnZjblFnYlNCbWNtOXRJRndpYldsMGFISnBiRndpWEhKY2JtbHRjRzl5ZENCN0lFbGpiMjRnZlNCbWNtOXRJQ2N1TDJsamIyNG5YSEpjYm1sdGNHOXlkQ0I3SUdKMWJHMXBabmtnZlNCbWNtOXRJQ2N1TGk5amIyMXRiMjRuWEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1RHRmlaV3dnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZG01dlpHVXBJRDArSUcwb0oyeGhZbVZzTG14aFltVnNKeXdnZG01dlpHVXVZMmhwYkdSeVpXNHBYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQkpibkIxZENBOUlIdGNjbHh1SUNBZ0lIWnBaWGM2SUNoMmJtOWtaU2tnUFQ0Z2JTZ25jQzVqYjI1MGNtOXNKeXhjY2x4dUlDQWdJQ0FnSUNCN0lHTnNZWE56T2lCMmJtOWtaUzVoZEhSeWN5NXBZMjl1SUQ4Z0oyaGhjeTFwWTI5dUlHaGhjeTFwWTI5dUxYSnBaMmgwSnlBNklDY25JSDBzWEhKY2JpQWdJQ0FnSUNBZ1cxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdEtDZHBibkIxZEM1cGJuQjFkRnQwZVhCbFBYUmxlSFJkSnl3Z1luVnNiV2xtZVNoMmJtOWtaUzVoZEhSeWN5a3BMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1aGRIUnljeTVwWTI5dUlEOGdiU2hKWTI5dUxDQjdjMmw2WlRvZ0ozTnRZV3hzSnl3Z2FXTnZiam9nZG01dlpHVXVZWFIwY25NdWFXTnZibjBwSURvZ0p5ZGNjbHh1SUNBZ0lDQWdJQ0JkWEhKY2JpQWdJQ0FwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JUWld4bFkzUWdQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQjJibTlrWlNBOVBseHlYRzRnSUNBZ0lDQWdJRzBvSjNBdVkyOXVkSEp2YkNjc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUcwb0ozTndZVzR1YzJWc1pXTjBKeXdnWW5Wc2JXbG1lU2gyYm05a1pTNWhkSFJ5Y3lrc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRLQ2R6Wld4bFkzUW5MRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbU5vYjJsalpYTXViV0Z3S0dzZ1BUNGdiU2duYjNCMGFXOXVKeXdnZTNaaGJIVmxPaUJyV3pCZGZTd2dhMXN4WFNrcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDbGNjbHh1SUNBZ0lDQWdJQ0FwWEhKY2JuMWNjbHh1WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1ZHVjRkRUZ5WldFZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lCMmJtOWtaU0E5UGx4eVhHNGdJQ0FnSUNBZ0lHMG9YQ0p3TG1OdmJuUnliMnhjSWl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYlNoY0luUmxlSFJoY21WaExuUmxlSFJoY21WaFhDSXNJR0oxYkcxcFpua29kbTV2WkdVdVlYUjBjbk1wS1Z4eVhHNGdJQ0FnSUNBZ0lDbGNjbHh1ZlZ4eVhHNWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JEYUdWamEwSnZlQ0E5SUh0Y2NseHVJQ0FnSUhacFpYYzZJSFp1YjJSbElEMCtYSEpjYmlBZ0lDQWdJQ0FnYlNoY0luQXVZMjl1ZEhKdmJGd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLRndpYkdGaVpXd3VZMmhsWTJ0aWIzaGNJaXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb1hDSnBibkIxZEZ0MGVYQmxQU2RqYUdWamEySnZlQ2RkWENJc0lHSjFiRzFwWm5rb2RtNXZaR1V1WVhSMGNuTXBLU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtTnZiblJsYm5SY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnS1Z4eVhHNGdJQ0FnSUNBZ0lDbGNjbHh1ZlZ4eVhHNWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JTWVdScGJ5QTlJSHRjY2x4dUlDQWdJSFpwWlhjNklIWnViMlJsSUQwK1hISmNiaUFnSUNBZ0lDQWdiU2hjSW5BdVkyOXVkSEp2YkZ3aUxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWN5NWphRzlwWTJWekxtMWhjQ2hySUQwK1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRLRndpYkdGaVpXd3VjbUZrYVc5Y0lpeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdEtGd2lhVzV3ZFhSYmRIbHdaVDBuY21Ga2FXOG5YVndpTENCN2RtRnNkV1U2SUd0Yk1GMHNJRzVoYldVNklIWnViMlJsTG1GMGRISnpMbTVoYldWOUtTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcld6RmRYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ2xjY2x4dUlDQWdJQ0FnSUNBcFhISmNibjFjY2x4dUlpd2lhVzF3YjNKMElHMGdabkp2YlNCY0ltMXBkR2h5YVd4Y0lseHVYRzVsZUhCdmNuUWdZMjl1YzNRZ1NXMWhaMlVnUFNCN1hHNGdJQ0FnZG1sbGR6b2dkbTV2WkdVZ1BUNWNiaUFnSUNBZ0lDQWdiU2duWm1sbmRYSmxMbWx0WVdkbEp5eGNiaUFnSUNBZ0lDQWdJQ0FnSUh0amJHRnpjem9nZG01dlpHVXVZWFIwY25NdWMybDZaU0EvWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSjJsekxTY2dLeUIyYm05a1pTNWhkSFJ5Y3k1emFYcGxJQ3NnSjNnbklDc2dkbTV2WkdVdVlYUjBjbk11YzJsNlpTQTZYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKMmx6TFNjZ0t5QjJibTlrWlM1aGRIUnljeTV5WVhScGIzMHNYRzRnSUNBZ0lDQWdJQ0FnSUNCdEtDZHBiV2NuTENCN2MzSmpPaUIyYm05a1pTNWhkSFJ5Y3k1emNtTjlLU2xjYm4xY2JpSXNJbWx0Y0c5eWRDQnRJR1p5YjIwZ1hDSnRhWFJvY21sc1hDSmNibWx0Y0c5eWRDQjdJR0oxYkcxcFpua2dmU0JtY205dElDY3VMaTlqYjIxdGIyNG5YRzVjYm1WNGNHOXlkQ0JqYjI1emRDQk9iM1JwWm1sallYUnBiMjRnUFNCN1hHNGdJQ0FnZG1sbGR6b2dkbTV2WkdVZ1BUNWNiaUFnSUNBZ0lDQWdiU2hjSWk1dWIzUnBabWxqWVhScGIyNWNJaXdnWW5Wc2JXbG1lU2gyYm05a1pTNWhkSFJ5Y3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNWhkSFJ5Y3k1a1pXeGxkR1VnUDF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb1hDSmlkWFIwYjI0dVpHVnNaWFJsWENJc0lIdHZibU5zYVdOck9pQjJibTlrWlM1aGRIUnljeTV2Ym1Oc2FXTnJmU2tnT2lBbkp5eGNiaUFnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbU5vYVd4a2NtVnVYRzRnSUNBZ0lDQWdJQ2xjYm4xY2JpSXNJbWx0Y0c5eWRDQnRJR1p5YjIwZ1hDSnRhWFJvY21sc1hDSmNibWx0Y0c5eWRDQjdJR0oxYkcxcFpua2dmU0JtY205dElDY3VMaTlqYjIxdGIyNG5YRzVjYm1WNGNHOXlkQ0JqYjI1emRDQlFjbTluY21WemN5QTlJSHRjYmlBZ0lDQjJhV1YzT2lCMmJtOWtaU0E5UGx4dUlDQWdJQ0FnSUNCdEtGd2ljSEp2WjNKbGMzTXVjSEp2WjNKbGMzTmNJaXdnWW5Wc2JXbG1lU2gyYm05a1pTNWhkSFJ5Y3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNWphR2xzWkhKbGJseHVJQ0FnSUNBZ0lDQXBYRzU5WEc0aUxDSnBiWEJ2Y25RZ2JTQm1jbTl0SUZ3aWJXbDBhSEpwYkZ3aVhISmNibHh5WEc1Y2NseHVZMjl1YzNRZ2IyNWpiR2xqYXlBOUlDaDJibTlrWlN3Z2RtRnNLU0E5UGx4eVhHNGdJQ0FnS0NrZ1BUNGdlMXh5WEc0Z0lDQWdJQ0FnSUhKbGMyVjBLSFp1YjJSbExDQjJZV3dwWEhKY2JpQWdJQ0FnSUNBZ2FXWWdLSFp1YjJSbExtRjBkSEp6TG05dVkyeHBZMnNwSUhadWIyUmxMbUYwZEhKekxtOXVZMnhwWTJzb2RtRnNLVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVZMjl1YzNRZ2NtVnpaWFFnUFNBb2RtNXZaR1VzSUhaaGJDa2dQVDRnZTF4eVhHNGdJQ0FnZG01dlpHVXVjM1JoZEdVdVkzVnljbVZ1ZENBOUlIWmhiRnh5WEc0Z0lDQWdiR1YwSUcxaGVGOWlkWFIwYjI1eklEMGdkbTV2WkdVdVlYUjBjbk11YldGNFgySjFkSFJ2Ym5NZ2ZId2dNVEJjY2x4dUlDQWdJR3hsZENCdVlpQTlJSFp1YjJSbExtRjBkSEp6TG01aVhISmNiaUFnSUNCcFppQW9ibUlnUGlCdFlYaGZZblYwZEc5dWN5a2dlMXh5WEc0Z0lDQWdJQ0FnSUd4bGRDQnRhV1FnUFNCdVlpQXZJREpjY2x4dUlDQWdJQ0FnSUNCcFppQW9XekVzSURKZExtbHVZMngxWkdWektIWmhiQ2twSUhadWIyUmxMbk4wWVhSbExtSjFkSFJ2Ym5NZ1BTQmJNU3dnTWl3Z015d2diblZzYkN3Z2JXbGtMQ0J1ZFd4c0xDQnVZbDFjY2x4dUlDQWdJQ0FnSUNCbGJITmxJR2xtSUNoYmJtSXRNU3dnYm1KZExtbHVZMngxWkdWektIWmhiQ2twSUhadWIyUmxMbk4wWVhSbExtSjFkSFJ2Ym5NZ1BTQmJNU3dnYm5Wc2JDd2diV2xrTENCdWRXeHNMQ0J1WWkweUxDQnVZaTB4TENCdVlsMWNjbHh1SUNBZ0lDQWdJQ0JsYkhObElIWnViMlJsTG5OMFlYUmxMbUoxZEhSdmJuTWdQU0JiTVN3Z2JuVnNiQ3dnZG1Gc0lDMGdNU3dnZG1Gc0xDQjJZV3dnS3lBeExDQnVkV3hzTENCdVlsMWNjbHh1SUNBZ0lIMGdaV3h6WlNCN1hISmNiaUFnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1WW5WMGRHOXVjeUE5SUZ0ZFhISmNiaUFnSUNBZ0lDQWdabTl5SUNoc1pYUWdhU0E5SURFN0lHa2dQRDBnYm1JN0lHa3JLeWtnZG01dlpHVXVjM1JoZEdVdVluVjBkRzl1Y3k1d2RYTm9LR2twWEhKY2JpQWdJQ0I5WEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JRWVdkcGJtRjBhVzl1SUQwZ2UxeHlYRzRnSUNBZ2IyNXBibWwwT2lCMmJtOWtaU0E5UGlCeVpYTmxkQ2gyYm05a1pTd2dkbTV2WkdVdVlYUjBjbk11WTNWeWNtVnVkQ0I4ZkNBeEtTeGNjbHh1WEhKY2JpQWdJQ0IyYVdWM09pQjJibTlrWlNBOVBpQnRLQ2R1WVhZdWNHRm5hVzVoZEdsdmJpY3NYSEpjYmlBZ0lDQWdJQ0FnYlNnbllTNXdZV2RwYm1GMGFXOXVMWEJ5WlhacGIzVnpKeXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdlMjl1WTJ4cFkyczZJRzl1WTJ4cFkyc29kbTV2WkdVc0lIWnViMlJsTG5OMFlYUmxMbU4xY25KbGJuUWdMU0F4S1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUnBjMkZpYkdWa09pQjJibTlrWlM1emRHRjBaUzVqZFhKeVpXNTBJRDA5UFNBeGZTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1WVhSMGNuTXVjSEpsZG1sdmRYTmZkR1Y0ZENCOGZDQW5VSEpsZG1sdmRYTW5LU3hjY2x4dUlDQWdJQ0FnSUNCdEtDZGhMbkJoWjJsdVlYUnBiMjR0Ym1WNGRDY3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIdHZibU5zYVdOck9pQnZibU5zYVdOcktIWnViMlJsTENCMmJtOWtaUzV6ZEdGMFpTNWpkWEp5Wlc1MElDc2dNU2tzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa2FYTmhZbXhsWkRvZ2RtNXZaR1V1YzNSaGRHVXVZM1Z5Y21WdWRDQTlQVDBnZG01dlpHVXVjM1JoZEdVdVluVjBkRzl1Y3k1c1pXNW5kR2g5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNWhkSFJ5Y3k1dVpYaDBYM1JsZUhRZ2ZId2dKMDVsZUhRbktTeGNjbHh1SUNBZ0lDQWdJQ0J0S0NkMWJDNXdZV2RwYm1GMGFXOXVMV3hwYzNRbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzV6ZEdGMFpTNWlkWFIwYjI1ekxtMWhjQ2gyWVd3Z1BUNGdkbUZzSUQwOVBTQnVkV3hzSUQ5Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMG9KMnhwSnl3Z2JTZ25jM0JoYmk1d1lXZHBibUYwYVc5dUxXVnNiR2x3YzJsekp5d2diUzUwY25WemRDZ25KbWhsYkd4cGNEc25LU2twSURwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMG9KMnhwSnl3Z2JTZ25ZUzV3WVdkcGJtRjBhVzl1TFd4cGJtc25MRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMnhoYzNNNklIWnViMlJsTG5OMFlYUmxMbU4xY25KbGJuUWdQVDA5SUhaaGJDQS9JQ2RwY3kxamRYSnlaVzUwSnlBNklHNTFiR3dzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5dVkyeHBZMnM2SUc5dVkyeHBZMnNvZG01dlpHVXNJSFpoYkNsY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5TENCMllXd3BLVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQXBYSEpjYmlBZ0lDQWdJQ0FnS1Z4eVhHNGdJQ0FnS1Z4eVhHNTlYSEpjYmlJc0ltbHRjRzl5ZENCdElHWnliMjBnWENKdGFYUm9jbWxzWENKY2JtbHRjRzl5ZENCN0lHTnZiR3hsWTNSZlltOXZiR1ZoYmlCOUlHWnliMjBnSnk0dUwyTnZiVzF2YmlkY2JtbHRjRzl5ZENCN0lGQmhaMmx1WVhScGIyNGdmU0JtY205dElDY3VMaTlqYjIxd2IyNWxiblJ6TDNCaFoybHVZWFJwYjI0dWFuTW5YRzVjYm1OdmJuTjBJRk5VV1V4RlV5QTlJRnNuWW05eVpHVnlaV1FuTENBbmMzUnlhWEJsWkNjc0lDZHVZWEp5YjNjblhWeHVYRzVqYjI1emRDQm9aV0ZrWlhKZlkyOXNJRDBnS0hadWIyUmxMQ0JwZEdWdExDQnBaSGdwSUQwK0lIdGNiaUFnSUNCc1pYUWdkMkY1SUQwZ0tHbGtlQ0E5UFQwZ2RtNXZaR1V1YzNSaGRHVXVjMjl5ZEY5aWVTa2dQMXh1SUNBZ0lDQWdJQ0FvZG01dlpHVXVjM1JoZEdVdWMyOXlkRjloYzJNZ1B5QW5JRlVuSURvZ0p5QkVKeWtnT2lBbkoxeHVJQ0FnSUhKbGRIVnliaUJwZEdWdExtNWhiV1VnS3lCM1lYbGNibjFjYmx4dVhHNWpiMjV6ZENCMGFGOTBaaUE5SUNoMmJtOWtaU3dnZEdGbktTQTlQbHh1SUNBZ0lHMG9kR0ZuSUQwOVBTQW5hR1ZoWkdWeUp5QS9JQ2QwYUdWaFpDY2dPaUFuZEdadmIzUW5MRnh1SUNBZ0lDQWdJQ0J0S0NkMGNpY3NYRzRnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWMxdDBZV2RkTG0xaGNDZ29hWFJsYlN3Z2FXUjRLU0E5UGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb0ozUm9KeXdnZTI5dVkyeHBZMnM2SUdsMFpXMHVjMjl5ZEdGaWJHVWdQeUJ6YjNKMGFHRnVaR3hsY2loMmJtOWtaU3dnYVdSNEtUb2diblZzYkgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2wwWlcwdWRHbDBiR1VnUDF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYlNnbllXSmljaWNzSUh0MGFYUnNaVG9nYVhSbGJTNTBhWFJzWlgwc0lHaGxZV1JsY2w5amIyd29kbTV2WkdVc0lHbDBaVzBzSUdsa2VDa3BYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQTZJR2hsWVdSbGNsOWpiMndvZG01dlpHVXNJR2wwWlcwc0lHbGtlQ2twWEc0Z0lDQWdJQ0FnSUNBZ0lDQXBYRzRnSUNBZ0lDQWdJQ2xjYmlBZ0lDQXBYRzVjYm1OdmJuTjBJR052YlhCaGNtRjBiM0lnUFNCcFpIZ2dQVDVjYmlBZ0lDQW9ZU3dnWWlrZ1BUNGdlMXh1SUNBZ0lDQWdhV1lnS0dGYmFXUjRYU0E4SUdKYmFXUjRYU2xjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJQzB4WEc0Z0lDQWdJQ0JwWmlBb1lWdHBaSGhkSUQ0Z1lsdHBaSGhkS1Z4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnTVZ4dUlDQWdJQ0FnY21WMGRYSnVJREJjYmlBZ0lDQjlYRzVjYm1OdmJuTjBJSE52Y25Sb1lXNWtiR1Z5SUQwZ0tIWnViMlJsTENCcFpIZ3BJRDArWEc0Z0lDQWdLQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZG01dlpHVXVjM1JoZEdVdWMyOXlkRjlpZVNBOVBUMGdhV1I0S1Z4dUlDQWdJQ0FnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1YzI5eWRGOWhjMk1nUFNBaElIWnViMlJsTG5OMFlYUmxMbk52Y25SZllYTmpYRzRnSUNBZ0lDQWdJR1ZzYzJWY2JpQWdJQ0FnSUNBZ0lDQWdJSFp1YjJSbExuTjBZWFJsTG5OdmNuUmZZWE5qSUQwZ2RISjFaVnh1WEc0Z0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExuTnZjblJmWW5rZ1BTQnBaSGhjYmlBZ0lDQWdJQ0FnZG01dlpHVXVjM1JoZEdVdWNtOTNjeTV6YjNKMEtHTnZiWEJoY21GMGIzSW9hV1I0S1NsY2JpQWdJQ0FnSUNBZ2FXWWdLQ0VnZG01dlpHVXVjM1JoZEdVdWMyOXlkRjloYzJNcFhHNGdJQ0FnSUNBZ0lDQWdJQ0IyYm05a1pTNXpkR0YwWlM1eWIzZHpMbkpsZG1WeWMyVW9LVnh1SUNBZ0lIMWNibHh1Wlhod2IzSjBJR052Ym5OMElGUmhZbXhsSUQwZ2UxeHVYRzRnSUNBZ2IyNXBibWwwT2lCMmJtOWtaU0E5UGlCN1hHNGdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbk52Y25SZllua2dQU0J1ZFd4c1hHNGdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbk52Y25SZllYTmpJRDBnZEhKMVpWeHVJQ0FnSUNBZ0lDQjJibTlrWlM1emRHRjBaUzV5YjNkeklEMGdkbTV2WkdVdVlYUjBjbk11Y205M2MxeHVJQ0FnSUNBZ0lDQnBaaUFvZG01dlpHVXVZWFIwY25NdWNHRm5hVzVoZEdWZllua3BlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVjR0ZuWlNBOUlERmNiaUFnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExuTjBZWEowWDJGMElEMGdNRnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdWc2MyVmNiaUFnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbk4wWVhSbExtUnBjM0JzWVhsZmNtOTNjeUE5SUhadWIyUmxMbUYwZEhKekxuSnZkM05jYmlBZ0lDQjlMRnh1WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ0Z1cxeHVJQ0FnSUNBZ0lDQnRLQ2QwWVdKc1pTNTBZV0pzWlNjc0lIdGpiR0Z6Y3pvZ1kyOXNiR1ZqZEY5aWIyOXNaV0Z1S0hadWIyUmxMbUYwZEhKekxDQlRWRmxNUlZNcGZTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtaGxZV1JsY2lBL0lIUm9YM1JtS0hadWIyUmxMQ0FuYUdWaFpHVnlKeWtnT2lCdWRXeHNMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1WVhSMGNuTXVabTl2ZEdWeUlEOGdkR2hmZEdZb2RtNXZaR1VzSUNkbWIyOTBaWEluS1NBNklHNTFiR3dzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2QwWW05a2VTY3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1Y205M2N5NXpiR2xqWlNoY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1YzNSaGNuUmZZWFFzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbk4wWVhKMFgyRjBJQ3NnZG01dlpHVXVZWFIwY25NdWNHRm5hVzVoZEdWZllua3BMbTFoY0NoeWIzY2dQVDVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JTZ25kSEluTENCeWIzY3ViV0Z3S0dOdmJDQTlQaUJ0S0NkMFpDY3NJR052YkNrcEtWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDbGNiaUFnSUNBZ0lDQWdJQ0FnS1Z4dUlDQWdJQ0FnSUNBcExGeHVYRzRnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG5CaFoybHVZWFJsWDJKNUlEOWNiaUFnSUNBZ0lDQWdJQ0FnSUcwb1VHRm5hVzVoZEdsdmJpeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc1aU9pQk5ZWFJvTG1ObGFXd29kbTV2WkdVdWMzUmhkR1V1Y205M2N5NXNaVzVuZEdnZ0x5QjJibTlrWlM1aGRIUnljeTV3WVdkcGJtRjBaVjlpZVNrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzl1WTJ4cFkyczZJRzVpSUQwK0lIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbkJoWjJVZ1BTQnVZbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1YzNSaGNuUmZZWFFnUFNCdVlpQTlQVDBnTVNBL0lEQWdPaUFvS0c1aUlDMHhLU0FxSUhadWIyUmxMbUYwZEhKekxuQmhaMmx1WVhSbFgySjVLVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnS1NBNklHNTFiR3hjYmlBZ0lDQmRYRzU5WEc0aUxDSnBiWEJ2Y25RZ2JTQm1jbTl0SUZ3aWJXbDBhSEpwYkZ3aVhISmNibWx0Y0c5eWRDQjdJR0oxYkcxcFpua2dmU0JtY205dElDY3VMaTlqYjIxdGIyNG5YSEpjYmx4eVhHNWxlSEJ2Y25RZ1kyOXVjM1FnVkdGbklEMGdlMXh5WEc0Z0lDQWdkbWxsZHpvZ0tIWnViMlJsS1NBOVBpQnRLQ2R6Y0dGdUxuUmhaeWNzSUdKMWJHMXBabmtvZG01dlpHVXVZWFIwY25NcExDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc0aUxDSnBiWEJ2Y25RZ2JTQm1jbTl0SUZ3aWJXbDBhSEpwYkZ3aVhHNWNibHh1Wlhod2IzSjBJR052Ym5OMElGUnBkR3hsSUQwZ2UxeHVJQ0FnSUhacFpYYzZJQ2gyYm05a1pTa2dQVDRnYlNnbmFDY2dLeUIyYm05a1pTNWhkSFJ5Y3k1emFYcGxJQ3NnSnk1MGFYUnNaU2NnS3lBbkxtbHpMU2NnS3lCMmJtOWtaUzVoZEhSeWN5NXphWHBsTENCMmJtOWtaUzVqYUdsc1pISmxiaWxjYm4xY2JseHVYRzVsZUhCdmNuUWdZMjl1YzNRZ1UzVmlWR2wwYkdVZ1BTQjdYRzRnSUNBZ2RtbGxkem9nS0hadWIyUmxLU0E5UGlCdEtDZG9KeUFySUhadWIyUmxMbUYwZEhKekxuTnBlbVVnS3lBbkxuTjFZblJwZEd4bEp5QXJJQ2N1YVhNdEp5QXJJSFp1YjJSbExtRjBkSEp6TG5OcGVtVXNJSFp1YjJSbExtTm9hV3hrY21WdUtWeHVmVnh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFTnZiblJsYm5RZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lBb2RtNXZaR1VwSUQwK1hISmNiaUFnSUNBZ0lDQWdiU2duWTI5dWRHVnVkQ2NzSUh0amJHRnpjem9nZG01dlpHVXVZWFIwY25NdWMybDZaU0EvSUNkcGN5MG5JQ3NnZG01dlpHVXVZWFIwY25NdWMybDZaU0E2SUNjbmZTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtNXZaR1V1WTJocGJHUnlaVzVjY2x4dUlDQWdJQ0FnSUNBcFhISmNibjFjY2x4dUlpd2lhVzF3YjNKMElHMGdabkp2YlNCY0ltMXBkR2h5YVd4Y0lseHlYRzVjY2x4dVpYaHdiM0owSUdOdmJuTjBJRXhsZG1Wc0lEMGdlMXh5WEc0Z0lDQWdkbWxsZHpvZ0tIWnViMlJsS1NBOVBpQnRLQ2R1WVhZdWJHVjJaV3duTEZ4eVhHNGdJQ0FnSUNBZ0lIc25hWE10Ylc5aWFXeGxKem9nZG01dlpHVXVZWFIwY25NdWJXOWlhV3hsZlN3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JNWlhabGJFeGxablFnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZG01dlpHVXBJRDArSUcwb0oyUnBkaTVzWlhabGJDMXNaV1owSnl3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JNWlhabGJGSnBaMmgwSUQwZ2UxeHlYRzRnSUNBZ2RtbGxkem9nS0hadWIyUmxLU0E5UGlCdEtDZGthWFl1YkdWMlpXd3RjbWxuYUhRbkxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUV4bGRtVnNTWFJsYlNBOUlIdGNjbHh1SUNBZ0lIWnBaWGM2SUNoMmJtOWtaU2tnUFQ0Z2JTZ25jQzVzWlhabGJDMXBkR1Z0Snl4Y2NseHVJQ0FnSUNBZ0lDQjdZMnhoYzNNNklIWnViMlJsTG1GMGRISnpMbU5sYm5SbGNtVmtJRDhnSjJoaGN5MTBaWGgwTFdObGJuUmxjbVZrSnpvZ0p5ZDlMQ0IyYm05a1pTNWphR2xzWkhKbGJpbGNjbHh1ZlZ4eVhHNWNjbHh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFMWxaR2xoVEdWbWRDQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duWm1sbmRYSmxMbTFsWkdsaExXeGxablFuTENCMmJtOWtaUzVqYUdsc1pISmxiaWxjY2x4dWZWeHlYRzVjY2x4dVpYaHdiM0owSUdOdmJuTjBJRTFsWkdsaFEyOXVkR1Z1ZENBOUlIdGNjbHh1SUNBZ0lIWnBaWGM2SUNoMmJtOWtaU2tnUFQ0Z2JTZ25aR2wyTG0xbFpHbGhMV052Ym5SbGJuUW5MQ0IyYm05a1pTNWphR2xzWkhKbGJpbGNjbHh1ZlZ4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFMWxaR2xoVW1sbmFIUWdQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQW9kbTV2WkdVcElEMCtJRzBvSjJScGRpNXRaV1JwWVMxeWFXZG9kQ2NzSUhadWIyUmxMbU5vYVd4a2NtVnVLVnh5WEc1OVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdUV1ZrYVdFZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lBb2RtNXZaR1VwSUQwK0lHMG9KMkZ5ZEdsamJHVXViV1ZrYVdFbkxDQmJYSEpjYmx4eVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbWx0WVdkbElEOWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2JTaE5aV1JwWVV4bFpuUXNJRzBvSjNBdWFXMWhaMlVuTENCN1kyeGhjM002SUNkcGN5MG5JQ3NnZG01dlpHVXVZWFIwY25NdWFXMWhaMlV1Y21GMGFXOTlMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYlNnbmFXMW5KeXdnZXlkemNtTW5PaUIyYm05a1pTNWhkSFJ5Y3k1cGJXRm5aUzV6Y21OOUtTa3BJRG9nSnljc1hISmNibHh5WEc0Z0lDQWdJQ0FnSUcwb1RXVmthV0ZEYjI1MFpXNTBMQ0IyYm05a1pTNWphR2xzWkhKbGJpa3NYSEpjYmx4eVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbUoxZEhSdmJpQS9JRzBvVFdWa2FXRlNhV2RvZEN3Z2RtNXZaR1V1WVhSMGNuTXVZblYwZEc5dUtTQTZJQ2NuWEhKY2JpQWdJQ0JkS1Z4eVhHNTlYSEpjYmlJc0ltbHRjRzl5ZENCdElHWnliMjBnWENKdGFYUm9jbWxzWENKY2NseHVhVzF3YjNKMElIc2dTV052YmlCOUlHWnliMjBnSnk0dUwyVnNaVzFsYm5SekwybGpiMjR1YW5NblhISmNibHh5WEc1amIyNXpkQ0JqYkdsamEyaGhibVJzWlhJZ1BTQW9aMnh2WW1Gc1gzTjBZWFJsTENCcGRHVnRMQ0J6ZEdGMFpTa2dQVDVjY2x4dUlDQWdJQ2dwSUQwK0lIdGNjbHh1SUNBZ0lDQWdJQ0JuYkc5aVlXeGZjM1JoZEdVdWMyVnNaV04wWldRZ1BTQnBkR1Z0TG10bGVWeHlYRzRnSUNBZ0lDQWdJR2xtSUNobmJHOWlZV3hmYzNSaGRHVXVZMjlzYkdGd2MyRmliR1VnSmlZZ2MzUmhkR1VwSUhOMFlYUmxMbU52Ykd4aGNITmxaQ0E5SUNFZ2MzUmhkR1V1WTI5c2JHRndjMlZrWEhKY2JpQWdJQ0FnSUNBZ2FXWWdLR2wwWlcwdWIyNWpiR2xqYXlrZ2FYUmxiUzV2Ym1Oc2FXTnJLR2wwWlcwdWEyVjVLVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVYSEpjYm1OdmJuTjBJRTFsYm5WSmRHVnRJRDBnZTF4eVhHNGdJQ0FnYjI1cGJtbDBPaUIyYm05a1pTQTlQaUI3WEhKY2JpQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVZMjlzYkdGd2MyVmtJRDBnZG01dlpHVXVZWFIwY25NdWNtOXZkQzVqYjJ4c1lYQnpaV1FnZkh3Z1ptRnNjMlZjY2x4dUlDQWdJSDBzWEhKY2JpQWdJQ0IyYVdWM09pQjJibTlrWlNBOVBseHlYRzRnSUNBZ0lDQWdJRnRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdiU2duWVNjc0lIdHZibU5zYVdOck9pQmpiR2xqYTJoaGJtUnNaWElvZG01dlpHVXVZWFIwY25NdWMzUmhkR1VzSUhadWIyUmxMbUYwZEhKekxuSnZiM1FzSUhadWIyUmxMbk4wWVhSbEtTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05zWVhOek9pQjJibTlrWlM1aGRIUnljeTV6ZEdGMFpTNXpaV3hsWTNSbFpDQTlQVDBnZG01dlpHVXVZWFIwY25NdWNtOXZkQzVyWlhrZ1B5QmNJbWx6TFdGamRHbDJaVndpSURvZ2JuVnNiSDBzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWN5NXliMjkwTG14aFltVnNMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG01dlpHVXVZWFIwY25NdWMzUmhkR1V1WTI5c2JHRndjMkZpYkdVZ1B5QmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBb2RtNXZaR1V1YzNSaGRHVXVZMjlzYkdGd2MyVmtJRDhnWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcwb1NXTnZiaXdnZTJsamIyNDZJQ2RqWVhKbGRDMTFjQ2NzSUhOcGVtVTZJQ2R6YldGc2JDZDlLVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E2SUcwb1NXTnZiaXdnZTJsamIyNDZJQ2RqWVhKbGRDMWtiM2R1Snl3Z2MybDZaVG9nSjNOdFlXeHNKMzBwS1RvZ2JuVnNiQ2tzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ2doZG01dlpHVXVZWFIwY25NdWMzUmhkR1V1WTI5c2JHRndjMkZpYkdVZ2ZId2dJWFp1YjJSbExuTjBZWFJsTG1OdmJHeGhjSE5sWkNrZ0ppWWdkbTV2WkdVdVlYUjBjbk11Y205dmRDNXBkR1Z0Y3lBL1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRLQ2QxYkNjc0lIWnViMlJsTG1GMGRISnpMbkp2YjNRdWFYUmxiWE11YldGd0tHbDBaVzBnUFQ1Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0S0Nkc2FTY3NJRzBvSjJFbkxDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05zWVhOek9pQjJibTlrWlM1aGRIUnljeTV6ZEdGMFpTNXpaV3hsWTNSbFpDQTlQVDBnYVhSbGJTNXJaWGtnUHlCY0ltbHpMV0ZqZEdsMlpWd2lJRG9nYm5Wc2JDeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiMjVqYkdsamF6b2dZMnhwWTJ0b1lXNWtiR1Z5S0hadWIyUmxMbUYwZEhKekxuTjBZWFJsTENCcGRHVnRMQ0J1ZFd4c0tYMHNJR2wwWlcwdWJHRmlaV3dwS1NrcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQTZJRzUxYkd4Y2NseHVJQ0FnSUNBZ0lDQmRYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQk5aVzUxSUQwZ2UxeHlYRzRnSUNBZ2IyNXBibWwwT2lCMmJtOWtaU0E5UGlCN1hISmNiaUFnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1VnUFNCMmJtOWtaUzVoZEhSeWMxeHlYRzRnSUNBZ0lDQWdJSFp1YjJSbExuTjBZWFJsTG1OdmJHeGhjSE5oWW14bElEMGdJSFp1YjJSbExtRjBkSEp6TG1OdmJHeGhjSE5oWW14bElIeDhJR1poYkhObFhISmNiaUFnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1WTI5c2JHRndjMlZrSUQwZ2RtNXZaR1V1WVhSMGNuTXVZMjlzYkdGd2MyVmtJSHg4SUdaaGJITmxYSEpjYmlBZ0lDQjlMRnh5WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ0Z2JTZ25ZWE5wWkdVdWJXVnVkU2NzWEhKY2JpQWdJQ0FnSUNBZ2RtNXZaR1V1YzNSaGRHVXVhWFJsYlhNdWJXRndLRzFsYm5VZ1BUNGdXMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2R3TG0xbGJuVXRiR0ZpWld3bkxDQjdiMjVqYkdsamF6b2dkbTV2WkdVdVlYUjBjbk11WTI5c2JHRndjMkZpYkdVZ1B5QmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2dwSUQwK0lIWnViMlJsTG5OMFlYUmxMbU52Ykd4aGNITmxaQ0E5SUNGMmJtOWtaUzV6ZEdGMFpTNWpiMnhzWVhCelpXUWdPaUJ1ZFd4c2ZTd2dYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0Wlc1MUxteGhZbVZzTENCY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbU52Ykd4aGNITmhZbXhsSUQ4Z1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnS0hadWIyUmxMbk4wWVhSbExtTnZiR3hoY0hObFpDQS9JRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0S0VsamIyNHNJSHRwWTI5dU9pQW5ZMkZ5WlhRdGRYQW5MQ0J6YVhwbE9pQW5jMjFoYkd3bmZTbGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdPaUJ0S0VsamIyNHNJSHRwWTI5dU9pQW5ZMkZ5WlhRdFpHOTNiaWNzSUhOcGVtVTZJQ2R6YldGc2JDZDlLU2s2SUc1MWJHd3BMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWhkbTV2WkdVdWMzUmhkR1V1WTI5c2JHRndjMkZpYkdVZ2ZId2dJWFp1YjJSbExuTjBZWFJsTG1OdmJHeGhjSE5sWkNBL1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRLQ2QxYkM1dFpXNTFMV3hwYzNRbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcxbGJuVXVhWFJsYlhNdWJXRndLR2wwWlcwZ1BUNWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duYkdrbkxDQnRLRTFsYm5WSmRHVnRMQ0I3YzNSaGRHVTZJSFp1YjJSbExuTjBZWFJsTENCeWIyOTBPaUJwZEdWdGZTa3BYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0tWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdLU0E2SUc1MWJHeGNjbHh1SUNBZ0lDQWdJQ0JkS1Z4eVhHNGdJQ0FnS1Z4eVhHNTlYSEpjYmlJc0ltbHRjRzl5ZENCdElHWnliMjBnWENKdGFYUm9jbWxzWENKY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQk5aWE56WVdkbElEMGdlMXh5WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ0Z2JTZ25ZWEowYVdOc1pTNXRaWE56WVdkbEp5eGNjbHh1SUNBZ0lDQWdJQ0I3WTJ4aGMzTTZJSFp1YjJSbExtRjBkSEp6TG1OdmJHOXlJRDhnSjJsekxTY2dLeUIyYm05a1pTNWhkSFJ5Y3k1amIyeHZjaUE2SUNjbmZTd2dXMXh5WEc0Z0lDQWdJQ0FnSUhadWIyUmxMbUYwZEhKekxtaGxZV1JsY2lBL1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUcwb0p5NXRaWE56WVdkbExXaGxZV1JsY2ljc0lHMG9KM0FuTENCMmJtOWtaUzVoZEhSeWN5NW9aV0ZrWlhJcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbTV2WkdVdVlYUjBjbk11YjI1amJHOXpaU0EvSUcwb0oySjFkSFJ2Ymljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZTJOc1lYTnpPaUFuWkdWc1pYUmxKeXdnYjI1amJHbGphem9nZG01dlpHVXVZWFIwY25NdWIyNWpiRzl6WlgwcE9pQW5KeWxjY2x4dUlDQWdJQ0FnSUNBNklDY25MRnh5WEc0Z0lDQWdJQ0FnSUcwb0p5NXRaWE56WVdkbExXSnZaSGtuTENCMmJtOWtaUzVqYUdsc1pISmxiaWxjY2x4dUlDQWdJRjBwWEhKY2JuMWNjbHh1SWl3aWFXMXdiM0owSUcwZ1puSnZiU0JjSW0xcGRHaHlhV3hjSWx4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFMXZaR0ZzSUQwZ2UxeHlYRzRnSUNBZ2RtbGxkem9nZG01dlpHVWdQVDRnYlNnbkxtMXZaR0ZzSnl3Z2UyTnNZWE56T2lCMmJtOWtaUzVoZEhSeWN5NWhZM1JwZG1VZ1B5QW5hWE10WVdOMGFYWmxKem9nSnlkOUxDQmJYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHMG9KeTV0YjJSaGJDMWlZV05yWjNKdmRXNWtKeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzBvSnk1dGIyUmhiQzFqYjI1MFpXNTBKeXdnZG01dlpHVXVZMmhwYkdSeVpXNHBMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJibTlrWlM1aGRIUnljeTV2Ym1Oc2IzTmxJRDhnYlNnbkxtSjFkSFJ2Ymk1dGIyUmhiQzFqYkc5elpTY3NJSHR2Ym1Oc2FXTnJPaUIyYm05a1pTNWhkSFJ5Y3k1dmJtTnNiM05sZlNrNklDY25YSEpjYmlBZ0lDQmRLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dVhISmNibVY0Y0c5eWRDQmpiMjV6ZENCT1lYWWdQU0I3WEhKY2JpQWdJQ0IyYVdWM09pQjJibTlrWlNBOVBpQnRLQ2R1WVhZdWJtRjJKeXdnVzF4eVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG1GMGRISnpMbXhsWm5RZ1B5QnRLQ2N1Ym1GMkxXeGxablFuTENCMmJtOWtaUzVoZEhSeWN5NXNaV1owTG0xaGNDaHBkR1Z0SUQwK0lHMG9KMkV1Ym1GMkxXbDBaVzBuTENCcGRHVnRLU2twSURvZ0p5Y3NYSEpjYmlBZ0lDQWdJQ0FnZG01dlpHVXVZWFIwY25NdVkyVnVkR1Z5SUQ4Z2JTZ25MbTVoZGkxalpXNTBaWEluTENCMmJtOWtaUzVoZEhSeWN5NWpaVzUwWlhJdWJXRndLR2wwWlcwZ1BUNGdiU2duWVM1dVlYWXRhWFJsYlNjc0lHbDBaVzBwS1NrZ09pQW5KeXhjY2x4dUlDQWdJQ0FnSUNCMmJtOWtaUzVoZEhSeWN5NXlhV2RvZENBL0lHMG9KeTV1WVhZdGNtbG5hSFFuTENCMmJtOWtaUzVoZEhSeWN5NXlhV2RvZEM1dFlYQW9hWFJsYlNBOVBpQnRLQ2RoTG01aGRpMXBkR1Z0Snl3Z2FYUmxiU2twS1NBNklDY25YSEpjYmlBZ0lDQmRLVnh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dWFXMXdiM0owSUhzZ1NXTnZiaUI5SUdaeWIyMGdKeTR1TDJWc1pXMWxiblJ6TDJsamIyNHVhbk1uWEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1EyRnlaRWx0WVdkbElEMGdlMXh5WEc0Z0lDQWdkbWxsZHpvZ0tIWnViMlJsS1NBOVBseHlYRzRnSUNBZ0lDQWdJRzBvSjJOaGNtUXRhVzFoWjJVbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdEtDZG1hV2QxY21VdWFXMWhaMlVuTENCN1kyeGhjM002SUNkcGN5MG5JQ3NnZG01dlpHVXVZWFIwY25NdWNtRjBhVzk5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JTZ25hVzFuSnl3Z2UzTnlZem9nZG01dlpHVXVZWFIwY25NdWMzSmpmU2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdJQ0FnSUNsY2NseHVmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUVOaGNtUklaV0ZrWlhJZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lBb2RtNXZaR1VwSUQwK0lHMG9KMmhsWVdSbGNpNWpZWEprTFdobFlXUmxjaWNzSUZ0Y2NseHVJQ0FnSUNBZ0lDQnRLQ2R3TG1OaGNtUXRhR1ZoWkdWeUxYUnBkR3hsSnl3Z2RtNXZaR1V1WVhSMGNuTXVkR2wwYkdVcExGeHlYRzRnSUNBZ0lDQWdJRzBvSjJFdVkyRnlaQzFvWldGa1pYSXRhV052Ymljc0lIWnViMlJsTG1GMGRISnpMbWxqYjI0cFhISmNiaUFnSUNCZEtWeHlYRzU5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1EyRnlaRVp2YjNSbGNpQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duWm05dmRHVnlMbU5oY21RdFptOXZkR1Z5Snl3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JEWVhKa1JtOXZkR1Z5U1hSbGJTQTlJSHRjY2x4dUlDQWdJSFpwWlhjNklDaDJibTlrWlNrZ1BUNGdiU2duWVM1allYSmtMV1p2YjNSbGNpMXBkR1Z0Snl3Z2RtNXZaR1V1WVhSMGNuTXBYSEpjYm4xY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQkRZWEprUTI5dWRHVnVkQ0E5SUh0Y2NseHVJQ0FnSUhacFpYYzZJSFp1YjJSbElEMCtJRzBvSnk1allYSmtMV052Ym5SbGJuUW5MQ0IyYm05a1pTNWphR2xzWkhKbGJpbGNjbHh1ZlZ4eVhHNWNjbHh1Wlhod2IzSjBJR052Ym5OMElFTmhjbVFnUFNCN1hISmNiaUFnSUNCMmFXVjNPaUFvZG01dlpHVXBJRDArWEhKY2JpQWdJQ0FnSUNBZ2JTZ25MbU5oY21RbkxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc0aUxDSnBiWEJ2Y25RZ2JTQm1jbTl0SUZ3aWJXbDBhSEpwYkZ3aVhISmNibWx0Y0c5eWRDQjdJRWxqYjI0Z2ZTQm1jbTl0SUNjdUxpOWxiR1Z0Wlc1MGN5OXBZMjl1TG1wekoxeHlYRzVjY2x4dVkyOXVjM1FnYjI1amJHbGpheUE5SUNoMmJtOWtaU3dnYVhSbGJTd2dhV1I0S1NBOVBseHlYRzRnSUNBZ0tDa2dQVDRnZTF4eVhHNGdJQ0FnSUNBZ0lIWnViMlJsTG5OMFlYUmxMbUZqZEdsMlpTQTlJR2xrZUZ4eVhHNGdJQ0FnSUNBZ0lHbG1JQ2gyYm05a1pTNWhkSFJ5Y3k1dmJtTnNhV05yS1NCMmJtOWtaUzVoZEhSeWN5NXZibU5zYVdOcktHbDBaVzBwWEhKY2JpQWdJQ0I5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1ZHRmljMDFsYm5VZ1BTQjdYSEpjYmlBZ0lDQnZibWx1YVhRNklIWnViMlJsSUQwK0lIWnViMlJsTG5OMFlYUmxMbUZqZEdsMlpTQTlJSFp1YjJSbExtRjBkSEp6TG1GamRHbDJaU0I4ZkNBd0xGeHlYRzVjY2x4dUlDQWdJSFpwWlhjNklIWnViMlJsSUQwK0lHMG9KeTUwWVdKekp5d2diU2duZFd3bkxGeHlYRzRnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG1sMFpXMXpMbTFoY0Nnb2FYUmxiU3dnYVdSNEtTQTlQbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2RzYVNjc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyeGhjM002SUdsa2VDQTlQVDBnZG01dlpHVXVjM1JoZEdVdVlXTjBhWFpsSUQ4Z0oybHpMV0ZqZEdsMlpTY2dPaUJ1ZFd4c0xGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5dVkyeHBZMnM2SUc5dVkyeHBZMnNvZG01dlpHVXNJR2wwWlcwc0lHbGtlQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRLQ2RoSnl3Z2FYUmxiUzVwWTI5dUlEOGdXMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMG9KM053WVc0dWFXTnZiaTVwY3kxemJXRnNiQ2NzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duYVM1bVlTY3NJSHRqYkdGemN6b2dKMlpoTFNjZ0t5QnBkR1Z0TG1samIyNTlLU2tzSUcwb0ozTndZVzRuTENCcGRHVnRMbXhoWW1Wc0tWMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBNklHbDBaVzB1YkdGaVpXd3BYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDbGNjbHh1SUNBZ0lDQWdJQ0FwWEhKY2JpQWdJQ0FwS1Z4eVhHNTlYSEpjYmx4eVhHNWNjbHh1WTI5dWMzUWdZMnhwWTJ0b1lXNWtiR1Z5SUQwZ2RtNXZaR1VnUFQ1Y2NseHVJQ0FnSUdsMFpXMGdQVDRnZG01dlpHVXVjM1JoZEdVdVlXTjBhWFpsSUQwZ2FYUmxiUzVyWlhsY2NseHVYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQlVZV0p6SUQwZ2UxeHlYRzRnSUNBZ2IyNXBibWwwT2lCMmJtOWtaU0E5UGlCN1hISmNiaUFnSUNBZ0lDQWdkbTV2WkdVdWMzUmhkR1V1WVdOMGFYWmxJRDBnZG01dlpHVXVZWFIwY25NdVlXTjBhWFpsSUh4OElEQmNjbHh1SUNBZ0lDQWdJQ0IyYm05a1pTNXpkR0YwWlM1cGRHVnRjeUE5SUhadWIyUmxMbUYwZEhKekxtbDBaVzF6TG0xaGNDZ29hWFJsYlN3Z2FXUjRLU0E5UGlCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpXMHVhMlY1SUQwZ2FXUjRYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCcGRHVnRYSEpjYmlBZ0lDQWdJQ0FnZlNsY2NseHVJQ0FnSUgwc1hISmNibHh5WEc0Z0lDQWdkbWxsZHpvZ2RtNXZaR1VnUFQ1Y2NseHVJQ0FnSUNBZ0lDQnRLQ2RrYVhZbkxDQjdjM1I1YkdVNklIdGthWE53YkdGNU9pQW5abXhsZUNjc0lHWnNaWGc2SUNjeEp5d2dkMmxrZEdnNklDY3hNREFsSnl3Z0oyWnNaWGd0WkdseVpXTjBhVzl1SnpvZ0oyTnZiSFZ0YmlkOWZTd2dXMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLRlJoWW5OTlpXNTFMQ0I3WVdOMGFYWmxPaUIyYm05a1pTNXpkR0YwWlM1aFkzUnBkbVVzSUc5dVkyeHBZMnM2SUdOc2FXTnJhR0Z1Wkd4bGNpaDJibTlrWlNrc0lHbDBaVzF6T2lCMmJtOWtaUzV6ZEdGMFpTNXBkR1Z0YzMwcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMmJtOWtaUzV6ZEdGMFpTNXBkR1Z0Y3k1dFlYQW9hWFJsYlNBOVBseHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiU2duWkdsMkp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCN2MzUjViR1U2SUh0a2FYTndiR0Y1T2lCcGRHVnRMbXRsZVNBOVBUMGdkbTV2WkdVdWMzUmhkR1V1WVdOMGFYWmxJRDhnSjJKc2IyTnJKem9nSjI1dmJtVW5MQ0FuYldGeVoybHVMV3hsWm5Rbk9pQW5NVEJ3ZUNkOWZTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGRHVnRMbU52Ym5SbGJuUmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdJQ0FnSUYwcFhISmNibHh5WEc1OVhISmNiaUlzSW1sdGNHOXlkQ0J0SUdaeWIyMGdYQ0p0YVhSb2NtbHNYQ0pjY2x4dWFXMXdiM0owSUhzZ1NXTnZiaUI5SUdaeWIyMGdKeTR1TDJWc1pXMWxiblJ6TDJsamIyNHVhbk1uWEhKY2JseHlYRzVqYjI1emRDQnZibU5zYVdOcklEMGdLSFp1YjJSbExDQnBkR1Z0TENCcFpIZ3BJRDArWEhKY2JpQWdJQ0FvS1NBOVBpQjdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tIWnViMlJsTG5OMFlYUmxMbUZqZEdsMlpTQTlQVDBnYVdSNEtTQjJibTlrWlM1emRHRjBaUzVoWTNScGRtVWdQU0J1ZFd4c1hISmNiaUFnSUNBZ0lDQWdaV3h6WlNCMmJtOWtaUzV6ZEdGMFpTNWhZM1JwZG1VZ1BTQnBaSGhjY2x4dUlDQWdJQ0FnSUNCcFppQW9kbTV2WkdVdVlYUjBjbk11YjI1amJHbGpheWtnZG01dlpHVXVZWFIwY25NdWIyNWpiR2xqYXlocGRHVnRLVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUZCaGJtVnNJRDBnZTF4eVhHNGdJQ0FnZG1sbGR6b2dkbTV2WkdVZ1BUNGdiU2duYm1GMkxuQmhibVZzSnl3Z2RtNXZaR1V1WTJocGJHUnlaVzRwWEhKY2JuMWNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JRWVc1bGJFaGxZV1JwYm1jZ1BTQjdYSEpjYmlBZ0lDQjJhV1YzT2lCMmJtOWtaU0E5UGlCdEtDZHdMbkJoYm1Wc0xXaGxZV1JwYm1jbkxDQjJibTlrWlM1amFHbHNaSEpsYmlsY2NseHVmVnh5WEc1Y2NseHVaWGh3YjNKMElHTnZibk4wSUZCaGJtVnNWR0ZpY3lBOUlIdGNjbHh1SUNBZ0lHOXVhVzVwZERvZ2RtNXZaR1VnUFQ0Z2RtNXZaR1V1YzNSaGRHVXVZV04wYVhabElEMGdkbTV2WkdVdVlYUjBjbk11WVdOMGFYWmxJSHg4SUc1MWJHd3NYSEpjYmx4eVhHNGdJQ0FnZG1sbGR6b2dkbTV2WkdVZ1BUNGdiU2duTG5CaGJtVnNMWFJoWW5NbkxGeHlYRzRnSUNBZ0lDQWdJSFp1YjJSbExtRjBkSEp6TG1sMFpXMXpMbTFoY0Nnb2FYUmxiU3dnYVdSNEtTQTlQbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRLQ2RoSnl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamJHRnpjem9nYVdSNElEMDlQU0IyYm05a1pTNXpkR0YwWlM1aFkzUnBkbVVnUHlBbmFYTXRZV04wYVhabEp5QTZJRzUxYkd3c1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYjI1amJHbGphem9nYjI1amJHbGpheWgyYm05a1pTd2dhWFJsYlN3Z2FXUjRLVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z2FYUmxiUzVzWVdKbGJGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBcFhISmNiaUFnSUNBZ0lDQWdLVnh5WEc0Z0lDQWdLVnh5WEc1OVhISmNibHh5WEc1bGVIQnZjblFnWTI5dWMzUWdVR0Z1Wld4Q2JHOWpheUE5SUh0Y2NseHVJQ0FnSUhacFpYYzZJSFp1YjJSbElEMCtJRzBvSnk1d1lXNWxiQzFpYkc5amF5Y3NJSFp1YjJSbExtTm9hV3hrY21WdUtWeHlYRzU5WEhKY2JseHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1VHRnVaV3hDYkc5amEzTWdQU0I3WEhKY2JpQWdJQ0J2Ym1sdWFYUTZJSFp1YjJSbElEMCtJSFp1YjJSbExuTjBZWFJsTG1GamRHbDJaU0E5SUhadWIyUmxMbUYwZEhKekxtRmpkR2wyWlNCOGZDQnVkV3hzTEZ4eVhHNWNjbHh1SUNBZ0lIWnBaWGM2SUhadWIyUmxJRDArSUhadWIyUmxMbUYwZEhKekxtbDBaVzF6TG0xaGNDZ29hWFJsYlN3Z2FXUjRLU0E5UGx4eVhHNGdJQ0FnSUNBZ0lHMG9KMkV1Y0dGdVpXd3RZbXh2WTJzbkxDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYkdGemN6b2dhV1I0SUQwOVBTQjJibTlrWlM1emRHRjBaUzVoWTNScGRtVWdQeUFuYVhNdFlXTjBhWFpsSnlBNklHNTFiR3dzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdmJtTnNhV05yT2lCdmJtTnNhV05yS0hadWIyUmxMQ0JwZEdWdExDQnBaSGdwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBzSUZ0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYlNnbmMzQmhiaTV3WVc1bGJDMXBZMjl1Snl3Z2JTZ25hUzVtWVNjc0lIdGpiR0Z6Y3pvZ0oyWmhMU2NnS3lCcGRHVnRMbWxqYjI1OUtTa3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbDBaVzB1YkdGaVpXeGNjbHh1SUNBZ0lDQWdJQ0JkS1Z4eVhHNGdJQ0FnS1Z4eVhHNTlYSEpjYmlKZExDSnVZVzFsY3lJNld5SmpiMjV6ZENJc0lteGxkQ0lzSW05dVkyeHBZMnNpTENKamJHbGphMmhoYm1Sc1pYSWlYU3dpYldGd2NHbHVaM01pT2lJN08wRkJSVTlCTEVsQlFVMHNSMEZCUnl4SFFVRkhPMGxCUTJZc1NVRkJTU3hGUVVGRkxGVkJRVU1zUzBGQlN5eEZRVUZGTEZOQlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVRTdRMEZETjBNc1EwRkJRVHM3UVVOSVRVRXNTVUZCVFN4TlFVRk5MRWRCUVVjc1EwRkJReXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4UFFVRlBMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVUU3UVVGRGFrVXNRVUZCVDBFc1NVRkJUU3hOUVVGTkxFZEJRVWNzUTBGQlF5eFRRVUZUTEVWQlFVVXNUVUZCVFN4RlFVRkZMRk5CUVZNc1JVRkJSU3hUUVVGVExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVRTdRVUZEZWtVc1FVRkJUMEVzU1VGQlRTeExRVUZMTEVkQlFVY3NRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUVRzN08wRkJSM0pFTEVGQlFVOUJMRWxCUVUwc1YwRkJWeXhIUVVGSExGVkJRVU1zUzBGQlN5eEZRVUZGTzBsQlF5OUNReXhKUVVGSkxFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVRTdTVUZEYUVJc1NVRkJTU3hMUVVGTExFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVRXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkJMRVZCUVVFN1NVRkRiRVFzU1VGQlNTeExRVUZMTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVFc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGQkxFVkJRVUU3U1VGRGJFUXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVUVzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZCTEVWQlFVRTdTVUZEYUVRc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVRXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlFTeEZRVUZCTzBsQlF6ZERMRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVUVzUlVGQlFUdEpRVU0zUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlFTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGQkxFVkJRVUU3TzBsQlJUZERMRTlCUVU4c1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTTdRMEZETTBJc1EwRkJRVHM3TzBGQlIwUXNRVUZCVDBRc1NVRkJUU3hQUVVGUExFZEJRVWNzVlVGQlF5eExRVUZMTEVWQlFVVTdTVUZETTBKRExFbEJRVWtzVDBGQlR5eEhRVUZITEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRVHRKUVVOb1EwRXNTVUZCU1N4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGQk8wbEJRMnhDTEVsQlFVa3NUMEZCVHl4RlFVRkZMRVZCUVVFc1UwRkJVeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFBRVUZQTEVOQlFVRXNSVUZCUVR0SlFVTjBReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGQkxFZEJRVWNzUlVGQlF6dFJRVU16UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNVMEZCVXp0WlFVTndReXhOUVVGTkxFVkJRVVVzVTBGQlV5eEZRVUZGTEZOQlFWTXNSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUXpWRUxFVkJRVUVzVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlFTeEZRVUZCTzB0QlEyeERMRU5CUVVNc1EwRkJRVHRKUVVOR0xFOUJRVThzVTBGQlV6dERRVU51UWl4RFFVRkJPenRCUVVWRUxFRkJRVTlFTEVsQlFVMHNaVUZCWlN4SFFVRkhMRlZCUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJUdEpRVU14UTBNc1NVRkJTU3hOUVVGTkxFZEJRVWNzUlVGQlJTeERRVUZCTzBsQlEyWXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhWUVVGQkxFbEJRVWtzUlVGQlF6dFJRVU5tTEVsQlFVa3NTVUZCU1N4SlFVRkpMRXRCUVVzc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NTVUZCU1R0WlFVTnlReXhGUVVGQkxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGQkxFVkJRVUU3UzBGRGFFTXNRMEZCUXl4RFFVRkJPME5CUTB3c1EwRkJRVHM3TzBGQlIwUXNRVUZCVDBRc1NVRkJUU3hMUVVGTExFZEJRVWNzVlVGQlF5eEpRVUZKTEVWQlFVVXNVMEZEZUVJc1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlF5eFBRVUZQTEVWQlFVVXNVMEZCUnl4VlFVRlZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eEhRVUZCTEVOQlFVTXNSMEZCUVN4RFFVRkJPenM3UVVGSGRrUXNRVUZCVDBFc1NVRkJUU3haUVVGWkxFZEJRVWNzVlVGQlF5eEZRVUZGTEVWQlFVVXNVMEZCUnl4RlFVRkZMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzVDBGQlR5eEhRVUZCTEVOQlFVRTdPMEZETVVONFJVRXNTVUZCVFN4SlFVRkpMRWRCUVVjN1NVRkRhRUlzU1VGQlNTeEZRVUZGTEZWQlFVTXNSMEZCUVN4RlFVRlRPMmRDUVVGU0xFdEJRVXM3TzIxQ1FVTlVMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4RlFVRkZMRU5CUVVNN1dVRkRlRVFzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTNwRE8wTkJRVUU3UTBGRFVpeERRVUZCT3p0QlEwaE5RU3hKUVVGTkxGZEJRVmNzUjBGQlJ5eFZRVUZETEV0QlFVc3NSVUZCUlN4VFFVRkhPMGxCUTJ4RExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4VlFVRlZPMUZCUTI1Q0xFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRmxCUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRk8wbEJRMmhHTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTTdTVUZET1VJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFZRVUZWTzFGQlEyeENMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeEZRVUZGTEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZPME5CUTI1R0xFZEJRVUVzUTBGQlFUczdRVUZGUkN4QlFVRlBRU3hKUVVGTkxFMUJRVTBzUjBGQlJ6dEpRVU5zUWl4SlFVRkpMRVZCUVVVc1ZVRkJReXhMUVVGTExFVkJRVVVzVTBGQlJ5eERRVUZETEVOQlFVTXNWVUZCVlN4RlFVRkZMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETzFGQlF5OURMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkJPME5CUTI1RkxFTkJRVUU3TzBGRFdFMUJMRWxCUVUwc1MwRkJTeXhIUVVGSE8wbEJRMnBDTEVsQlFVa3NSVUZCUlN4VlFVRkRMRXRCUVVzc1JVRkJSU3hUUVVGSExFTkJRVU1zUTBGQlF5eGhRVUZoTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGQk8wTkJRM0JFTEVOQlFVRTdPMEZCUlVRc1FVRkJUMEVzU1VGQlRTeExRVUZMTEVkQlFVYzdTVUZEYWtJc1NVRkJTU3hGUVVGRkxGVkJRVU1zUzBGQlN5eEZRVUZGTEZOQlFVY3NRMEZCUXl4RFFVRkRMRmRCUVZjN1VVRkRNVUlzUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzZVVKQlFYbENMRWRCUVVjc1JVRkJSU3hGUVVGRk8xRkJRelZFTzFsQlEwa3NRMEZCUXl4RFFVRkRMSGRDUVVGM1FpeEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRGFrUXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUjBGQlJ5eEZRVUZGTzFOQlF6TkZPMHRCUTBvc1IwRkJRVHREUVVOS0xFTkJRVUU3TzBGQlJVUXNRVUZCVDBFc1NVRkJUU3hOUVVGTkxFZEJRVWM3U1VGRGJFSXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEZkQlFWYzdXVUZEVkN4RFFVRkRMRU5CUVVNc1lVRkJZU3hGUVVGRkxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVOcVF5eERRVUZETEVOQlFVTXNVVUZCVVR0dlFrRkRUaXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1ZVRkJRU3hEUVVGRExFVkJRVU1zVTBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZCTEVOQlFVTTdhVUpCUTJwRk8yRkJRMG83VTBGRFNpeEhRVUZCTzBOQlExSXNRMEZCUVRzN08wRkJSMFFzUVVGQlQwRXNTVUZCVFN4UlFVRlJMRWRCUVVjN1NVRkRjRUlzU1VGQlNTeEZRVUZGTEZWQlFVRXNTMEZCU3l4RlFVRkRMRk5CUTFJc1EwRkJReXhEUVVGRExGZEJRVmM3V1VGRFZDeERRVUZETEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVVzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRUUVVNdlF5eEhRVUZCTzBOQlExSXNRMEZCUVRzN08wRkJSMFFzUVVGQlQwRXNTVUZCVFN4UlFVRlJMRWRCUVVjN1NVRkRjRUlzU1VGQlNTeEZRVUZGTEZWQlFVRXNTMEZCU3l4RlFVRkRMRk5CUTFJc1EwRkJReXhEUVVGRExGZEJRVmM3V1VGRFZDeERRVUZETEVOQlFVTXNaMEpCUVdkQ08yZENRVU5rTEVOQlFVTXNRMEZCUXl4M1FrRkJkMElzUlVGQlJTeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8yZENRVU5xUkN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVTg3WVVGRGRFSTdVMEZEU2l4SFFVRkJPME5CUTFJc1EwRkJRVHM3TzBGQlIwUXNRVUZCVDBFc1NVRkJUU3hMUVVGTExFZEJRVWM3U1VGRGFrSXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEZkQlFWYzdXVUZEVkN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCUVN4RFFVRkRMRVZCUVVNc1UwRkRkRUlzUTBGQlF5eERRVUZETEdGQlFXRTdiMEpCUTFnc1EwRkJReXhEUVVGRExIRkNRVUZ4UWl4RlFVRkZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0dlFrRkRMMFFzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0cFFrRkRVQ3hIUVVGQk8yRkJRMG83VTBGRFNpeEhRVUZCTzBOQlExSXNRMEZCUVRzN1FVTjZSRTFCTEVsQlFVMHNTMEZCU3l4SFFVRkhPMGxCUTJwQ0xFbEJRVWtzUlVGQlJTeFZRVUZCTEV0QlFVc3NSVUZCUXl4VFFVTlNMRU5CUVVNc1EwRkJReXhqUVVGak8xbEJRMW9zUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSk8yZENRVU53UWl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNUdG5Ra0ZEYWtRc1MwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRPMWxCUXpsQ0xFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVFN1EwRkROVU1zUTBGQlFUczdRVU5PVFVFc1NVRkJUU3haUVVGWkxFZEJRVWM3U1VGRGVFSXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEdWQlFXVXNSVUZCUlN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF6dFpRVU51UXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTA3WjBKQlEyUXNRMEZCUXl4RFFVRkRMR1ZCUVdVc1JVRkJSU3hEUVVGRExFOUJRVThzUlVGQlJTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU16UkN4TFFVRkxMRU5CUVVNc1VVRkJVVHRUUVVOcVFpeEhRVUZCTzBOQlExSXNRMEZCUVRzN1FVTlFUVUVzU1VGQlRTeFJRVUZSTEVkQlFVYzdTVUZEY0VJc1NVRkJTU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlExSXNRMEZCUXl4RFFVRkRMRzFDUVVGdFFpeEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRE8xbEJRM1pETEV0QlFVc3NRMEZCUXl4UlFVRlJPMU5CUTJwQ0xFZEJRVUU3UTBGRFVpeERRVUZCT3p0QlEweEVRU3hKUVVGTkxFOUJRVThzUjBGQlJ5eFZRVUZETEV0QlFVc3NSVUZCUlN4SFFVRkhMRVZCUVVVc1UwRkRla0lzV1VGQlJ6dFJRVU5ETEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVUU3VVVGRGFrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZCTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZCTEVWQlFVRTdTMEZEY0VRc1IwRkJRU3hEUVVGQk96dEJRVVZNUVN4SlFVRk5MRXRCUVVzc1IwRkJSeXhWUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVWQlFVVTdTVUZEZGtJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSMEZCUnl4RFFVRkJPMGxCUTNwQ1F5eEpRVUZKTEZkQlFWY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExGZEJRVmNzU1VGQlNTeEZRVUZGTEVOQlFVRTdTVUZETDBOQkxFbEJRVWtzUlVGQlJTeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hEUVVGQk8wbEJRM1pDTEVsQlFVa3NSVUZCUlN4SFFVRkhMRmRCUVZjc1JVRkJSVHRSUVVOc1FrRXNTVUZCU1N4SFFVRkhMRWRCUVVjc1JVRkJSU3hIUVVGSExFTkJRVU1zUTBGQlFUdFJRVU5vUWl4SlFVRkpMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVRXNSVUZCUVR0aFFVTjZSU3hKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNSVUZCUVN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhGUVVGRkxFbEJRVWtzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVRXNSVUZCUVR0aFFVTjRSaXhGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFZEJRVWNzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRU3hGUVVGQk8wdEJRM2hGTEUxQlFVMDdVVUZEU0N4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVRTdVVUZEZUVJc1MwRkJTMEVzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCUVN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1JVRkJRVHRMUVVNMVJEdERRVU5LTEVOQlFVRTdPMEZCUlVRc1FVRkJUMFFzU1VGQlRTeFZRVUZWTEVkQlFVYzdTVUZEZEVJc1RVRkJUU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNTVUZCU1N4RFFVRkRMRU5CUVVNc1IwRkJRVHM3U1VGRmRrUXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRVWNzUTBGQlF5eERRVUZETEdkQ1FVRm5RanRSUVVNM1FpeERRVUZETEVOQlFVTXNkVUpCUVhWQ08xbEJRM0pDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTlCUVU4c1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEV0QlFVc3NRMEZCUXl4RFFVRkRPMWxCUTNoRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNZVUZCWVN4SlFVRkpMRlZCUVZVc1EwRkJRenRSUVVNMVF5eERRVUZETEVOQlFVTXNiVUpCUVcxQ08xbEJRMnBDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTlCUVU4c1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU0zUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEV0QlFVc3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETzFsQlEycEZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVTBGQlV5eEpRVUZKTEUxQlFVMHNRMEZCUXp0UlFVTndReXhEUVVGRExFTkJRVU1zYjBKQlFXOUNPMWxCUTJ4Q0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGQkxFZEJRVWNzUlVGQlF5eFRRVUZITEVkQlFVY3NTMEZCU3l4SlFVRkpPMmRDUVVOMlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXd3UWtGQk1FSXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpORUxFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRMRzFDUVVGdFFqdHZRa0ZEZWtJN2QwSkJRMGtzUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhMUVVGTExFZEJRVWNzUjBGQlJ5eFpRVUZaTEVkQlFVY3NTVUZCU1R0M1FrRkRlRVFzVDBGQlR5eEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhEUVVGRE8zRkNRVU12UWl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVUU3WVVGRFpqdFRRVU5LTzB0QlEwb3NSMEZCUVR0RFFVTktMRU5CUVVFN08wRkRNME5FUVN4SlFVRk5MRTFCUVUwc1IwRkJSeXhEUVVGRExGVkJRVlVzUlVGQlJTeFRRVUZUTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVFN08wRkJSV2hFUVN4SlFVRk5MRlZCUVZVc1IwRkJSeXhWUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVWQlFVVXNSMEZCUnl4RlFVRkZPMGxCUTJ4RFF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1MwRkJTeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTnVReXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlFVRTdTVUZETjBNc1QwRkJUeXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEVkQlFVYzdRMEZEZWtJc1EwRkJRVHM3TzBGQlIwUkVMRWxCUVUwc1MwRkJTeXhIUVVGSExGVkJRVU1zUzBGQlN5eEZRVUZGTEVkQlFVY3NSVUZCUlN4VFFVTjJRaXhEUVVGRExFTkJRVU1zUjBGQlJ5eExRVUZMTEZGQlFWRXNSMEZCUnl4UFFVRlBMRWRCUVVjc1QwRkJUenRSUVVOc1F5eERRVUZETEVOQlFVTXNTVUZCU1R0WlFVTkdMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzUlVGQlJTeFRRVU0zUWl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4UlFVRlJMRWRCUVVjc1YwRkJWeXhEUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNN2IwSkJRelZFTEVsQlFVa3NRMEZCUXl4TFFVRkxPM2RDUVVOT0xFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZET3pCQ1FVTXhSQ3hWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGQk8yRkJRekZETzFOQlEwbzdTMEZEU2l4SFFVRkJMRU5CUVVFN08wRkJSVXhCTEVsQlFVMHNWVUZCVlN4SFFVRkhMRlZCUVVFc1IwRkJSeXhGUVVGRExGTkJRMjVDTEZWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSVHROUVVOTUxFbEJRVWtzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU03VVVGRGFrSXNSVUZCUVN4UFFVRlBMRU5CUVVNc1EwRkJReXhGUVVGQk8wMUJRMWdzU1VGQlNTeERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF6dFJRVU5xUWl4RlFVRkJMRTlCUVU4c1EwRkJReXhGUVVGQk8wMUJRMVlzVDBGQlR5eERRVUZETzB0QlExUXNSMEZCUVN4RFFVRkJPenRCUVVWTVFTeEpRVUZOTEZkQlFWY3NSMEZCUnl4VlFVRkRMRXRCUVVzc1JVRkJSU3hIUVVGSExFVkJRVVVzVTBGRE4wSXNXVUZCUnp0UlFVTkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEV0QlFVc3NSMEZCUnp0WlFVTXpRaXhGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVRXNSVUZCUVRzN1dVRkZOME1zUlVGQlFTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVUVzUlVGQlFUczdVVUZGTDBJc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSMEZCUnl4RFFVRkJPMUZCUTNwQ0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUVR0UlFVTjBReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJPMWxCUTNSQ0xFVkJRVUVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVUVzUlVGQlFUdExRVU5xUXl4SFFVRkJMRU5CUVVFN08wRkJSVXdzUVVGQlQwRXNTVUZCVFN4TFFVRkxMRWRCUVVjN08wbEJSV3BDTEUxQlFVMHNSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJRenRSUVVOV0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRVHRSUVVNeFFpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVUU3VVVGRE0wSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVFN1VVRkRia01zU1VGQlNTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVONFFpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVUU3V1VGRGNFSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFZEJRVWNzUTBGQlF5eERRVUZCTzFOQlF6TkNPenRaUVVWSExFVkJRVUVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4WlFVRlpMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVRXNSVUZCUVR0TFFVTnNSRHM3U1VGRlJDeEpRVUZKTEVWQlFVVXNWVUZCUVN4TFFVRkxMRVZCUVVNc1UwRkJSenRSUVVOWUxFTkJRVU1zUTBGQlF5eGhRVUZoTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1pVRkJaU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRNVVFzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTEVOQlFVTXNSMEZCUnl4SlFVRkpPMWxCUTJ4RUxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVVVzVVVGQlVTeERRVUZETEVkQlFVY3NTVUZCU1R0WlFVTnNSQ3hEUVVGRExFTkJRVU1zVDBGQlR6dG5Ra0ZEVEN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTzI5Q1FVTnNRaXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRTdiMEpCUTNCQ0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVVFc1IwRkJSeXhGUVVGRExGTkJRM2hFTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEVkQlFVY3NSVUZCUXl4VFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUjBGQlJ5eERRVUZETEVkQlFVRXNRMEZCUXl4RFFVRkRMRWRCUVVFN2FVSkJRM2hETzFsQlEwdzdVMEZEU0RzN1VVRkZSQ3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZkQlFWYzdXVUZEYmtJc1EwRkJReXhEUVVGRExGVkJRVlU3WjBKQlExSTdiMEpCUTBrc1JVRkJSU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRE8yOUNRVU5vUlN4UFFVRlBMRVZCUVVVc1ZVRkJRU3hGUVVGRkxFVkJRVU03ZDBKQlExSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFZEJRVWNzUlVGQlJTeERRVUZCTzNkQ1FVTnlRaXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4RlFVRkZMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVFN2NVSkJRelZGTzJsQ1FVTktPMkZCUTBvc1IwRkJSeXhKUVVGSk8wdEJRMllzUjBGQlFUdERRVU5LTEVOQlFVRTdPMEZEYkVaTlFTeEpRVUZOTEVkQlFVY3NSMEZCUnp0SlFVTm1MRWxCUVVrc1JVRkJSU3hWUVVGRExFdEJRVXNzUlVGQlJTeFRRVUZITEVOQlFVTXNRMEZCUXl4VlFVRlZMRVZCUVVVc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVUU3UTBGRGRrVXNRMEZCUVRzN1FVTkdUVUVzU1VGQlRTeExRVUZMTEVkQlFVYzdTVUZEYWtJc1NVRkJTU3hGUVVGRkxGVkJRVU1zUzBGQlN5eEZRVUZGTEZOQlFVY3NRMEZCUXl4RFFVRkRMRWRCUVVjc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSMEZCUnl4UlFVRlJMRWRCUVVjc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlFUdERRVU53Unl4RFFVRkJPenM3UVVGSFJDeEJRVUZQUVN4SlFVRk5MRkZCUVZFc1IwRkJSenRKUVVOd1FpeEpRVUZKTEVWQlFVVXNWVUZCUXl4TFFVRkxMRVZCUVVVc1UwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExGZEJRVmNzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkJPME5CUTNaSExFTkJRVUU3TzBGRFVrMUJMRWxCUVUwc1QwRkJUeXhIUVVGSE8wbEJRMjVDTEVsQlFVa3NSVUZCUlN4VlFVRkRMRXRCUVVzc1JVRkJSU3hUUVVOV0xFTkJRVU1zUTBGQlF5eFRRVUZUTEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVkQlFVY3NTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTnNSU3hMUVVGTExFTkJRVU1zVVVGQlVUdFRRVU5xUWl4SFFVRkJPME5CUTFJc1EwRkJRVHM3UVVOTVRVRXNTVUZCVFN4TFFVRkxMRWRCUVVjN1NVRkRha0lzU1VGQlNTeEZRVUZGTEZWQlFVTXNTMEZCU3l4RlFVRkZMRk5CUVVjc1EwRkJReXhEUVVGRExGZEJRVmM3VVVGRE1VSXNRMEZCUXl4WFFVRlhMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVUU3UTBGRGVrUXNRMEZCUVRzN1FVRkZSQ3hCUVVGUFFTeEJRVVZPT3p0QlFVVkVMRUZCUVU5QkxFRkJSVTQ3TzBGQlJVUXNRVUZCVDBFc1NVRkJUU3hUUVVGVExFZEJRVWM3U1VGRGNrSXNTVUZCU1N4RlFVRkZMRlZCUVVNc1MwRkJTeXhGUVVGRkxGTkJRVWNzUTBGQlF5eERRVUZETEdOQlFXTTdVVUZETjBJc1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc2JVSkJRVzFDTEVWQlFVVXNSVUZCUlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZCTzBOQlF5OUZMRU5CUVVFN08wRkRhRUpOUVN4SlFVRk5MRk5CUVZNc1IwRkJSenRKUVVOeVFpeEpRVUZKTEVWQlFVVXNWVUZCUXl4TFFVRkxMRVZCUVVVc1UwRkJSeXhEUVVGRExFTkJRVU1zYlVKQlFXMUNMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZCTzBOQlF6RkVMRU5CUVVFN08wRkJSVVFzUVVGQlQwRXNTVUZCVFN4WlFVRlpMRWRCUVVjN1NVRkRlRUlzU1VGQlNTeEZRVUZGTEZWQlFVTXNTMEZCU3l4RlFVRkZMRk5CUVVjc1EwRkJReXhEUVVGRExHMUNRVUZ0UWl4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlFUdERRVU14UkN4RFFVRkJPenRCUVVWRUxFRkJRVTlCTEVsQlFVMHNWVUZCVlN4SFFVRkhPMGxCUTNSQ0xFbEJRVWtzUlVGQlJTeFZRVUZETEV0QlFVc3NSVUZCUlN4VFFVRkhMRU5CUVVNc1EwRkJReXhwUWtGQmFVSXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVUU3UTBGRGVFUXNRMEZCUVRzN1FVRkZSQ3hCUVVGUFFTeEpRVUZOTEV0QlFVc3NSMEZCUnp0SlFVTnFRaXhKUVVGSkxFVkJRVVVzVlVGQlF5eExRVUZMTEVWQlFVVXNVMEZCUnl4RFFVRkRMRU5CUVVNc1pVRkJaU3hGUVVGRk96dFJRVVZvUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXM3V1VGRFlpeERRVUZETEVOQlFVTXNVMEZCVXl4RlFVRkZMRU5CUVVNc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXp0blFrRkRPVVFzUTBGQlF5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEZRVUZGT3p0UlFVVjJSQ3hEUVVGRExFTkJRVU1zV1VGQldTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNN08xRkJSUzlDTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eFZRVUZWTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzB0QlF6bEVMRU5CUVVNc1IwRkJRVHREUVVOTUxFTkJRVUU3TzBGRGRFSkVRU3hKUVVGTkxGbEJRVmtzUjBGQlJ5eFZRVUZETEZsQlFWa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1MwRkJTeXhGUVVGRkxGTkJRemRETEZsQlFVYzdVVUZEUXl4WlFVRlpMRU5CUVVNc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVRTdVVUZEYUVNc1NVRkJTU3haUVVGWkxFTkJRVU1zVjBGQlZ5eEpRVUZKTEV0QlFVc3NSVUZCUlN4RlFVRkJMRXRCUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzUlVGQlJTeExRVUZMTEVOQlFVTXNVMEZCVXl4RFFVRkJMRVZCUVVFN1VVRkRNVVVzU1VGQlNTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVFc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVFc1JVRkJRVHRMUVVNelF5eEhRVUZCTEVOQlFVRTdPenRCUVVkTVFTeEpRVUZOTEZGQlFWRXNSMEZCUnp0SlFVTmlMRTFCUVUwc1JVRkJSU3hWUVVGQkxFdEJRVXNzUlVGQlF6dFJRVU5XTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1UwRkJVeXhIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1NVRkJTU3hMUVVGTExFTkJRVUU3UzBGRE9VUTdTVUZEUkN4SlFVRkpMRVZCUVVVc1ZVRkJRU3hMUVVGTExFVkJRVU1zVTBGRFVqdFpRVU5KTEVOQlFVTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJReXhQUVVGUExFVkJRVVVzV1VGQldTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU03WjBKQlF6TkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRXRCUVVzc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4SFFVRkhMRmRCUVZjc1IwRkJSeXhKUVVGSkxFTkJRVU03WjBKQlEyaEdMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVczdaMEpCUTNSQ0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmRCUVZjN2IwSkJRM3BDTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhUUVVGVE8zZENRVU5zUWl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zU1VGQlNTeEZRVUZGTEZWQlFWVXNSVUZCUlN4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03TUVKQlEzaERMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVVXNXVUZCV1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNTVUZCU1N4RFFVRkRPMWxCUTJ4RkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhYUVVGWExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzN1owSkJRMmhHTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGQkxFbEJRVWtzUlVGQlF5eFRRVU53UXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZITEVWQlFVVTdkMEpCUTFnc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1MwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEhRVUZITEZkQlFWY3NSMEZCUnl4SlFVRkpPM2RDUVVOdVJTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJReXhGUVVGRkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4SFFVRkJMRU5CUVVNc1EwRkJRenRyUWtGRE0wVXNTVUZCU1R0VFFVTmlMRWRCUVVFN1EwRkRVaXhEUVVGQk96dEJRVVZFTEVGQlFVOUJMRWxCUVUwc1NVRkJTU3hIUVVGSE8wbEJRMmhDTEUxQlFVMHNSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJRenRSUVVOV0xFdEJRVXNzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJRVHRSUVVONlFpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmRCUVZjc1NVRkJTU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZkQlFWY3NTVUZCU1N4TFFVRkxMRU5CUVVFN1VVRkRNMFFzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFRRVUZUTEVsQlFVa3NTMEZCU3l4RFFVRkJPMHRCUTNwRU8wbEJRMFFzU1VGQlNTeEZRVUZGTEZWQlFVRXNTMEZCU3l4RlFVRkRMRk5CUVVjc1EwRkJReXhEUVVGRExGbEJRVms3VVVGRGVrSXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFVRXNTVUZCU1N4RlFVRkRMRk5CUVVjN1dVRkRNVUlzUTBGQlF5eERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRMRTlCUVU4c1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZkQlFWYzdaMEpCUXk5RExGbEJRVWNzVTBGQlJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJSeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVMEZCVXl4SFFVRkJMRWRCUVVjc1NVRkJTU3hEUVVGRE8yZENRVU0xUkN4SlFVRkpMRU5CUVVNc1MwRkJTenRuUWtGRFZpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmRCUVZjN2IwSkJRMjVDTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhUUVVGVE8zZENRVU5zUWl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zU1VGQlNTeEZRVUZGTEZWQlFWVXNSVUZCUlN4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03TUVKQlEzaERMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVVXNXVUZCV1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNTVUZCU1N4RFFVRkRPMWxCUTJ4RkxFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4WFFVRlhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTTdaMEpCUXpsRExFTkJRVU1zUTBGQlF5eGpRVUZqTzI5Q1FVTmFMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFVRXNTVUZCU1N4RlFVRkRMRk5CUTJoQ0xFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExFdEJRVXNzUlVGQlJTeExRVUZMTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVRTdjVUpCUTNwRU8ybENRVU5LTEVkQlFVY3NTVUZCU1R0VFFVTm1MRWRCUVVFc1EwRkJRenRMUVVOTUxFZEJRVUU3UTBGRFNpeERRVUZCT3p0QlEzUkVUVUVzU1VGQlRTeFBRVUZQTEVkQlFVYzdTVUZEYmtJc1NVRkJTU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlFVY3NRMEZCUXl4RFFVRkRMR2xDUVVGcFFqdFJRVU01UWl4RFFVRkRMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NSMEZCUnl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVkQlFVY3NSVUZCUlN4RFFVRkRMRVZCUVVVN1VVRkROMFFzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5PMWxCUTJRc1EwRkJReXhEUVVGRExHbENRVUZwUWl4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNN1owSkJRek5ETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTzI5Q1FVTTFRaXhEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTEVWQlFVVXNUMEZCVHl4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNN1ZVRkRMMFFzUlVGQlJUdFJRVU5LTEVOQlFVTXNRMEZCUXl4bFFVRmxMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF6dExRVU55UXl4RFFVRkRMRWRCUVVFN1EwRkRUQ3hEUVVGQk96dEJRMVpOUVN4SlFVRk5MRXRCUVVzc1IwRkJSenRKUVVOcVFpeEpRVUZKTEVWQlFVVXNWVUZCUVN4TFFVRkxMRVZCUVVNc1UwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNTMEZCU3l4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEZkQlFWY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSVHRaUVVOc1JTeERRVUZETEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU03V1VGRGRFSXNRMEZCUXl4RFFVRkRMR2RDUVVGblFpeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNN1dVRkRia01zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExIRkNRVUZ4UWl4RlFVRkZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRk8wdEJRM3BHTEVOQlFVTXNSMEZCUVR0RFFVTk1MRU5CUVVFN08wRkRUazFCTEVsQlFVMHNSMEZCUnl4SFFVRkhPMGxCUTJZc1NVRkJTU3hGUVVGRkxGVkJRVUVzUzBGQlN5eEZRVUZETEZOQlFVY3NRMEZCUXl4RFFVRkRMRk5CUVZNc1JVRkJSVHRSUVVONFFpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zVjBGQlZ5eEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEVsQlFVa3NSVUZCUXl4VFFVRkhMRU5CUVVNc1EwRkJReXhaUVVGWkxFVkJRVVVzU1VGQlNTeERRVUZETEVkQlFVRXNRMEZCUXl4RFFVRkRMRWRCUVVjc1JVRkJSVHRSUVVNelJpeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU1zWVVGQllTeEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEVsQlFVa3NSVUZCUXl4VFFVRkhMRU5CUVVNc1EwRkJReXhaUVVGWkxFVkJRVVVzU1VGQlNTeERRVUZETEVkQlFVRXNRMEZCUXl4RFFVRkRMRWRCUVVjc1JVRkJSVHRSUVVOcVJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zV1VGQldTeEZRVUZGTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEVsQlFVa3NSVUZCUXl4VFFVRkhMRU5CUVVNc1EwRkJReXhaUVVGWkxFVkJRVVVzU1VGQlNTeERRVUZETEVkQlFVRXNRMEZCUXl4RFFVRkRMRWRCUVVjc1JVRkJSVHRMUVVOcVJ5eERRVUZETEVkQlFVRTdRMEZEVEN4RFFVRkJPenRCUTBsTlFTeEpRVUZOTEZWQlFWVXNSMEZCUnp0SlFVTjBRaXhKUVVGSkxFVkJRVVVzVlVGQlF5eExRVUZMTEVWQlFVVXNVMEZCUnl4RFFVRkRMRU5CUVVNc2IwSkJRVzlDTEVWQlFVVTdVVUZEY2tNc1EwRkJReXhEUVVGRExIRkNRVUZ4UWl4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETzFGQlF6TkRMRU5CUVVNc1EwRkJReXh2UWtGQmIwSXNSVUZCUlN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF6dExRVU0xUXl4RFFVRkRMRWRCUVVFN1EwRkRUQ3hEUVVGQk96dEJRVVZFTEVGQlFVOUJMRWxCUVUwc1ZVRkJWU3hIUVVGSE8wbEJRM1JDTEVsQlFVa3NSVUZCUlN4VlFVRkRMRXRCUVVzc1JVRkJSU3hUUVVGSExFTkJRVU1zUTBGQlF5eHZRa0ZCYjBJc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVRTdRMEZETTBRc1EwRkJRVHM3UVVGRlJDeEJRVUZQUVN4SlFVRk5MR05CUVdNc1IwRkJSenRKUVVNeFFpeEpRVUZKTEVWQlFVVXNWVUZCUXl4TFFVRkxMRVZCUVVVc1UwRkJSeXhEUVVGRExFTkJRVU1zYjBKQlFXOUNMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZCTzBOQlEzaEVMRU5CUVVFN08wRkJSVVFzUVVGQlQwRXNTVUZCVFN4WFFVRlhMRWRCUVVjN1NVRkRka0lzU1VGQlNTeEZRVUZGTEZWQlFVRXNTMEZCU3l4RlFVRkRMRk5CUVVjc1EwRkJReXhEUVVGRExHVkJRV1VzUlVGQlJTeExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWRCUVVFN1EwRkRjRVFzUTBGQlFUczdRVUZGUkN4QlFVRlBRU3hKUVVGTkxFbEJRVWtzUjBGQlJ6dEpRVU5vUWl4SlFVRkpMRVZCUVVVc1ZVRkJReXhMUVVGTExFVkJRVVVzVTBGRFZpeERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlFUdERRVU5xUXl4RFFVRkJPenRCUXk5Q1JFRXNTVUZCVFVVc1UwRkJUeXhIUVVGSExGVkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SFFVRkhMRVZCUVVVc1UwRkRMMElzV1VGQlJ6dFJRVU5ETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFZEJRVWNzUTBGQlFUdFJRVU40UWl4SlFVRkpMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVRXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVRXNSVUZCUVR0TFFVTnlSQ3hIUVVGQkxFTkJRVUU3TzBGQlJVd3NRVUZCVDBZc1NVRkJUU3hSUVVGUkxFZEJRVWM3U1VGRGNFSXNUVUZCVFN4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4SFFVRkJPenRKUVVVM1JDeEpRVUZKTEVWQlFVVXNWVUZCUVN4TFFVRkxMRVZCUVVNc1UwRkJSeXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpPMUZCUXpWQ0xFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVWQlFVVXNVMEZET1VJc1EwRkJReXhEUVVGRExFbEJRVWs3WjBKQlEwWTdiMEpCUTBrc1MwRkJTeXhGUVVGRkxFZEJRVWNzUzBGQlN5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhYUVVGWExFZEJRVWNzU1VGQlNUdHZRa0ZEZEVRc1QwRkJUeXhGUVVGRlJTeFRRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1JVRkJSU3hIUVVGSExFTkJRVU03YVVKQlEzSkRPMmRDUVVORUxFTkJRVU1zUTBGQlF5eEhRVUZITEVWQlFVVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1IwRkJSenR2UWtGRFppeERRVUZETEVOQlFVTXNiMEpCUVc5Q08yOUNRVU4wUWl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUzBGQlN5eEZRVUZGTEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzNOQ1FVTTFSQ3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETzJGQlEzQkNMRWRCUVVFN1UwRkRTanRMUVVOS0xFTkJRVU1zUjBGQlFUdERRVU5NTEVOQlFVRTdPenRCUVVkRVJpeEpRVUZOUnl4alFVRlpMRWRCUVVjc1ZVRkJRU3hMUVVGTExFVkJRVU1zVTBGRGRrSXNWVUZCUVN4SlFVRkpMRVZCUVVNc1UwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhOUVVGQkxFTkJRVUU3TzBGQlJYcERMRUZCUVU5SUxFbEJRVTBzU1VGQlNTeEhRVUZITzBsQlEyaENMRTFCUVUwc1JVRkJSU3hWUVVGQkxFdEJRVXNzUlVGQlF6dFJRVU5XTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1EwRkJRVHRSUVVNMVF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1ZVRkJReXhKUVVGSkxFVkJRVVVzUjBGQlJ5eEZRVUZGTzFsQlEyeEVMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZCTzFsQlEyUXNUMEZCVHl4SlFVRkpPMU5CUTJRc1EwRkJReXhEUVVGQk8wdEJRMHc3TzBsQlJVUXNTVUZCU1N4RlFVRkZMRlZCUVVFc1MwRkJTeXhGUVVGRExGTkJRMUlzUTBGQlF5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRExFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hMUVVGTExFVkJRVVVzVFVGQlRTeEZRVUZGTEdkQ1FVRm5RaXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETEVWQlFVVTdXVUZEZGtZc1EwRkJReXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeFBRVUZQTEVWQlFVVkhMR05CUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU5xUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCUVN4SlFVRkpMRVZCUVVNc1UwRkRka0lzUTBGQlF5eERRVUZETEV0QlFVczdiMEpCUTBnc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF5eFBRVUZQTEVWQlFVVXNTVUZCU1N4RFFVRkRMRWRCUVVjc1MwRkJTeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4UFFVRlBMRVZCUVVVc1RVRkJUU3hGUVVGRkxHRkJRV0VzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0dlFrRkROVVlzU1VGQlNTeERRVUZETEU5QlFVODdhVUpCUTJZc1IwRkJRVHRoUVVOS08xTkJRMG9zUTBGQlF5eEhRVUZCT3p0RFFVVlVMRU5CUVVFN08wRkRha1JFU0N4SlFVRk5SU3hUUVVGUExFZEJRVWNzVlVGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hUUVVNdlFpeFpRVUZITzFGQlEwTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUzBGQlN5eEhRVUZITEVWQlFVVXNSVUZCUVN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVRXNSVUZCUVR0aFFVTndSQ3hGUVVGQkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRWRCUVVjc1EwRkJRU3hGUVVGQk8xRkJRemRDTEVsQlFVa3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlFTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlFTeEZRVUZCTzB0QlEzSkVMRWRCUVVFc1EwRkJRVHM3UVVGRlRDeEJRVUZQUml4SlFVRk5MRXRCUVVzc1IwRkJSenRKUVVOcVFpeEpRVUZKTEVWQlFVVXNWVUZCUVN4TFFVRkxMRVZCUVVNc1UwRkJSeXhEUVVGRExFTkJRVU1zVjBGQlZ5eEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJRVHREUVVOb1JDeERRVUZCT3p0QlFVVkVMRUZCUVU5QkxFbEJRVTBzV1VGQldTeEhRVUZITzBsQlEzaENMRWxCUVVrc1JVRkJSU3hWUVVGQkxFdEJRVXNzUlVGQlF5eFRRVUZITEVOQlFVTXNRMEZCUXl4cFFrRkJhVUlzUlVGQlJTeExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWRCUVVFN1EwRkRkRVFzUTBGQlFUczdRVUZGUkN4QlFVRlBRU3hKUVVGTkxGTkJRVk1zUjBGQlJ6dEpRVU55UWl4TlFVRk5MRVZCUVVVc1ZVRkJRU3hMUVVGTExFVkJRVU1zVTBGQlJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNTVUZCU1N4SlFVRkpMRWRCUVVFN08wbEJSV2hGTEVsQlFVa3NSVUZCUlN4VlFVRkJMRXRCUVVzc1JVRkJReXhUUVVGSExFTkJRVU1zUTBGQlF5eGhRVUZoTzFGQlF6RkNMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGSExFVkJRVVVzVTBGRE9VSXNRMEZCUXl4RFFVRkRMRWRCUVVjN1owSkJRMFE3YjBKQlEwa3NTMEZCU3l4RlFVRkZMRWRCUVVjc1MwRkJTeXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4WFFVRlhMRWRCUVVjc1NVRkJTVHR2UWtGRGRFUXNUMEZCVHl4RlFVRkZSU3hUUVVGUExFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNN2FVSkJRM0pETEVWQlFVVXNTVUZCU1N4RFFVRkRMRXRCUVVzN1lVRkRhRUlzUjBGQlFUdFRRVU5LTzB0QlEwb3NSMEZCUVR0RFFVTktMRU5CUVVFN08wRkJSVVFzUVVGQlQwWXNRVUZGVGpzN1FVRkZSQ3hCUVVGUFFTeEpRVUZOTEZkQlFWY3NSMEZCUnp0SlFVTjJRaXhOUVVGTkxFVkJRVVVzVlVGQlFTeExRVUZMTEVWQlFVTXNVMEZCUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1NVRkJTU3hKUVVGSkxFZEJRVUU3TzBsQlJXaEZMRWxCUVVrc1JVRkJSU3hWUVVGQkxFdEJRVXNzUlVGQlF5eFRRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRVZCUVVVc1UwRkROME1zUTBGQlF5eERRVUZETEdWQlFXVXNSVUZCUlR0blFrRkRXQ3hMUVVGTExFVkJRVVVzUjBGQlJ5eExRVUZMTEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExGZEJRVmNzUjBGQlJ5eEpRVUZKTzJkQ1FVTjBSQ3hQUVVGUExFVkJRVVZGTEZOQlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF6dGhRVU55UXl4RlFVRkZPMWxCUTBnc1EwRkJReXhEUVVGRExHbENRVUZwUWl4RlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6TkVMRWxCUVVrc1EwRkJReXhMUVVGTE8xTkJRMklzUTBGQlF5eEhRVUZCTzB0QlEwd3NSMEZCUVR0RFFVTktMRU5CUVVFN095SjlcbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCAqIGFzIGJtIGZyb20gJy4uL2J1aWxkL2J1bG1pdC5taW4uanMnXG5cbmNvbnN0IERhdGFTdGF0ZSA9IHtcbiAgICBjb3VudDogMCxcbiAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICBwYWdlOiBudWxsLFxuXG4gICAgYWRkOiAoKSA9PiB7XG4gICAgICAgIFxuICAgICAgICBEYXRhU3RhdGUuY291bnQgKz0gMVxuICAgICAgICBEYXRhU3RhdGUubG9hZGluZyA9IHRydWVcbiAgICAgICAgY29uc29sZS5sb2coJ3lvdXV1dXV1dScgKyBEYXRhU3RhdGUuY291bnQpXG4gICAgICAgIGJtLnNsZWVwKDUwMCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBEYXRhU3RhdGUubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgICBtLnJlZHJhdygpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2xlZXAnICsgRGF0YVN0YXRlLmNvdW50KVxuICAgICAgICB9KVxuICAgIH1cbn1cblxuY29uc3QgRGVtb0JveCA9IHtcbiAgICB2aWV3OiAoKSA9PiBtKGJtLkJveCwgJ2EgYm94Jylcbn1cblxuY29uc3QgRGVtb0J1dHRvbiA9IHtcbiAgICB2aWV3OiAoKSA9PiBbXG4gICAgICAgIG0oYm0uVGl0bGUsIHtzaXplOiAzfSwgJ0V2ZW50IGhhbmRsZXIgJiBzdGF0ZScpLFxuICAgICAgICBtKGJtLkJ1dHRvbiwge1xuICAgICAgICAgICAgb25jbGljazogRGF0YVN0YXRlLmFkZCxcbiAgICAgICAgICAgIGxvYWRpbmc6IERhdGFTdGF0ZS5sb2FkaW5nLFxuICAgICAgICAgICAgc3RhdGU6IERhdGFTdGF0ZS5sb2FkaW5nID8gJ3ByaW1hcnknIDogbnVsbCxcbiAgICAgICAgICAgIHNpemU6ICdsYXJnZScsXG4gICAgICAgICAgICBjb250ZW50OiAnYSBidXR0b24gJyArIERhdGFTdGF0ZS5jb3VudCxcbiAgICAgICAgICAgIGljb246ICdhbGlnbi1sZWZ0JywgaWNvbl9yaWdodDogdHJ1ZX0pLFxuXG4gICAgICAgIG0oYm0uVGl0bGUsIHtzaXplOiAzfSwgJ0NvbG9ycycpLFxuICAgICAgICBibS5DT0xPUlMubWFwKGNvbG9yID0+IG0oYm0uQnV0dG9uLCB7Y29sb3I6IGNvbG9yLCBjb250ZW50OiAnYSAnICsgY29sb3IgKyAnIGJ1dHRvbid9KSksXG5cbiAgICAgICAgbShibS5UaXRsZSwge3NpemU6IDN9LCAnQ29sb3JzJyksXG4gICAgICAgIGJtLlNUQVRFUy5tYXAoc3RhdGUgPT4gbShibS5CdXR0b24sIHtzdGF0ZTogc3RhdGUsIGNvbnRlbnQ6ICdhICcgKyBzdGF0ZSArICcgYnV0dG9uJ30pKSxcbiAgICBdXG59XG5cbmNvbnN0IERlbW9UYWJsZSA9IHtcbiAgICB2aWV3OiAoKSA9PiBtKGJtLlRhYmxlLCB7XG4gICAgICAgIHN0cmlwZWQ6IHRydWUsXG4gICAgICAgIGJvcmRlcmVkOiB0cnVlLFxuICAgICAgICBwYWdpbmF0ZV9ieTogNixcbiAgICAgICAgaGVhZGVyOiBbXG4gICAgICAgICAgICB7bmFtZTogJ1BvcycsIHRpdGxlOiAnUG9zaXRpb24nfSxcbiAgICAgICAgICAgIHtuYW1lOiAnVGVhbScsIHNvcnRhYmxlOiB0cnVlfSxcbiAgICAgICAgICAgIHtuYW1lOiAnVycsIHRpdGxlOiAnV29uJywgc29ydGFibGU6IHRydWV9XG4gICAgICAgIF0sXG4gICAgICAgIGZvb3RlcjogW1xuICAgICAgICAgICAge25hbWU6ICdQb3MnLCB0aXRsZTogJ1Bvc2l0aW9uJ30sXG4gICAgICAgICAgICB7bmFtZTogJ1RlYW0nfSxcbiAgICAgICAgICAgIHtuYW1lOiAnVycsIHRpdGxlOiAnV29uJ31cbiAgICAgICAgXSxcbiAgICAgICAgcm93czogW1xuICAgICAgICAgICAgWzEsICdMZWljZXN0ZXIgQ2l0eScsIDIzXSxcbiAgICAgICAgICAgIFsyLCAnQXJzZW5hbCcsIDIwXSxcbiAgICAgICAgICAgIFszLCAnVG90dGVuaGFtIEhvdHNwdXInLCAxOV0sXG4gICAgICAgICAgICBbMSwgJ2RkIENpdHknLCAyM10sXG4gICAgICAgICAgICBbMiwgJ2VlJywgMjBdLFxuICAgICAgICAgICAgWzMsICdmZiBIb3RzcHVyJywgMTldLFxuICAgICAgICAgICAgWzEsICdnZyBDaXR5JywgMjNdLFxuICAgICAgICAgICAgWzIsICdoaCcsIDIwXSxcbiAgICAgICAgICAgIFszLCAnaWkgSG90c3B1cicsIDE5XSxcbiAgICAgICAgICAgIFsxLCAnamogQ2l0eScsIDIzXSxcbiAgICAgICAgICAgIFsyLCAna2snLCAyMF0sXG4gICAgICAgICAgICBbMywgJ2xsIEhvdHNwdXInLCAxOV1cbiAgICAgICAgXVxuICAgIH0pXG59XG5cblxuY29uc3QgRGVtb0Zvcm0gPSB7XG4gICAgdmlldzogKCkgPT4gW1xuICAgICAgICBtKGJtLkxhYmVsLCAnTGUgbm9tID8nKSxcbiAgICAgICAgbShibS5JbnB1dCwge3BsYWNlaG9sZGVyOiAnd29vbycsIHZhbHVlOiAndG90bycsIGljb246ICdjaGVjayd9KSxcbiAgICAgICAgbShibS5JbnB1dCwge3BsYWNlaG9sZGVyOiAnZW1haWwnLCBzdGF0ZTogJ2RhbmdlcicsIGljb246ICd3YXJuaW5nJ30pLFxuICAgICAgICBtKGJtLkxhYmVsLCAnTGUgY2hvaXggPycpLFxuICAgICAgICBtKGJtLlNlbGVjdCwge2Nob2ljZXM6IFtbMSwgJ2JvJ10sIFsyLCAndXUnXV0sIHNpemU6ICdsYXJnZSd9KSxcbiAgICAgICAgbShibS5UZXh0QXJlYSwge3BsYWNlaG9sZGVyOiAnY29tbWVudHMnLCB2YWx1ZTogJ2JvYicsIGxvYWRpbmc6IHRydWV9KSxcbiAgICAgICAgbShibS5DaGVja0JveCwge2NvbnRlbnQ6ICdjbGljayAhJ30pLFxuICAgICAgICBtKGJtLlJhZGlvLCB7bmFtZTogJ3h4JywgY2hvaWNlczogW1sxMCwgJ25vcGUnXSwgWzEsICd5ZWFoJ11dfSlcbiAgICBdXG59XG5cblxuY29uc3QgRGVtb0ltYWdlID0ge1xuICAgIHZpZXc6ICgpID0+IFtcbiAgICAgICAgbShibS5JbWFnZSwge3NpemU6IDEyOCwgXG4gICAgICAgICAgICBzcmM6IFwiaHR0cDovL2J1bG1hLmlvL2ltYWdlcy9wbGFjZWhvbGRlcnMvMTI4eDEyOC5wbmdcIn0pLFxuICAgICAgICBtKGJtLkltYWdlLCB7cmF0aW86ICcyYnkxJywgXG4gICAgICAgICAgICBzcmM6IFwiaHR0cDovL2J1bG1hLmlvL2ltYWdlcy9wbGFjZWhvbGRlcnMvMTI4eDEyOC5wbmdcIn0pXG4gICAgXVxufVxuXG5cbmNvbnN0IERlbW9Ob3RpZmljYXRpb24gPSB7XG4gICAgdmlldzogKCkgPT4gbShibS5Ob3RpZmljYXRpb24sIHtcbiAgICAgICAgICAgIHN0YXRlOiAnZGFuZ2VyJywgJ2RlbGV0ZSc6IHRydWUsIG9uY2xpY2s6ICgpID0+IGNvbnNvbGUubG9nKCdjbGljaycpfSwgXG4gICAgICAgICAgICAnV2hhdCB0aGUgaGVsbCAhJyksXG5cbn1cblxuY29uc3QgRGVtb1Byb2dyZXNzID0ge1xuICAgIHZpZXc6ICgpID0+IFtcbiAgICAgICAgbShibS5Qcm9ncmVzcywge3N0YXRlOiAnaW5mbycsICdtYXgnOiA4MCwgdmFsdWU6IDYwfSksXG4gICAgICAgIG0oYm0uUHJvZ3Jlc3MsIHsnbWF4JzogODAsIHZhbHVlOiAzMCwgc2l6ZTogJ2xhcmdlJ30pXG4gICAgXVxufVxuXG5cbmNvbnN0IERlbW9UYWcgPSB7XG4gICAgdmlldzogKCkgPT4gW1xuICAgICAgICBtKGJtLlRhZywge3N0YXRlOiAnaW5mbyd9LCAnd29vb3QnKSxcbiAgICAgICAgbShibS5UYWcsIHtzaXplOiAnbGFyZ2UnfSwgJ2JpZycpLFxuICAgIF1cbn1cblxuY29uc3QgRGVtb1RpdGxlID0ge1xuICAgIHZpZXc6ICgpID0+IFsxLCAyLCAzLCA0LCA1LCA2XS5tYXAoeCA9PiBbXG4gICAgICAgIG0oYm0uVGl0bGUsIHtzaXplOiB4fSwgJ1RpdGxlICcgKyB4KSxcbiAgICAgICAgbShibS5TdWJUaXRsZSwge3NpemU6IHh9LCAnU3ViVGl0bGUgJyArIHgpLFxuICAgIF0pXG59XG5cbmNvbnN0IERlbW9MZXZlbCA9IHtcbiAgICB2aWV3OiAoKSA9PiBcbiAgICAgICAgbShibS5MZXZlbCwgW1xuICAgICAgICAgICAgbShibS5MZXZlbEl0ZW0sIHtjZW50ZXJlZDogdHJ1ZX0sIG0oJ2RpdicsIG0oJ3AuaGVhZGluZycsICdUd3d3ZXRzJyksIG0oJ3AudGl0bGUnLCAnNDAwaycpKSksXG4gICAgICAgICAgICBtKGJtLkxldmVsSXRlbSwge2NlbnRlcmVkOiB0cnVlfSwgbSgnZGl2JywgbSgncC5oZWFkaW5nJywgJ0ZvbGxvd2luZycpLCBtKCdwLnRpdGxlJywgJzI1NDQnKSkpLFxuICAgICAgICAgICAgbShibS5MZXZlbEl0ZW0sIHtjZW50ZXJlZDogdHJ1ZX0sIG0oJ2RpdicsIG0oJ3AuaGVhZGluZycsICdGb2xsb3dlcnMnKSwgbSgncC50aXRsZScsICc4NzknKSkpLFxuICAgICAgICAgICAgbShibS5MZXZlbEl0ZW0sIHtjZW50ZXJlZDogdHJ1ZX0sIG0oJ2RpdicsIG0oJ3AuaGVhZGluZycsICdMaWtlcycpLCBtKCdwLnRpdGxlJywgJzIwMC4xMCcpKSksXG4gICAgICAgIF0pXG59XG5cbmNvbnN0IERlbW9NZWRpYSA9IHtcbiAgICB2aWV3OiAoKSA9PiBbMSwgMiwgM10ubWFwKHggPT5cbiAgICAgICAgbShibS5NZWRpYSwge1xuICAgICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHJhdGlvOiAnNjR4NjQnLFxuICAgICAgICAgICAgICAgICAgICBzcmM6ICdodHRwOi8vYnVsbWEuaW8vaW1hZ2VzL3BsYWNlaG9sZGVycy8xMjh4MTI4LnBuZyd9LFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogbShibS5CdXR0b24sIHtjbGFzczogJ2RlbGV0ZSd9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG0oJy5jb250ZW50JywgJ01lZGlhICcgKyB4KVxuICAgICAgICApXG4gICAgKVxufVxuXG5jb25zdCBEZW1vTWVudSA9IHtcbiAgICB2aWV3OiAoKSA9PlxuICAgICAgICBtKGJtLk1lbnUsIHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnbXl0JyxcbiAgICAgICAgICAgIGNvbGxhcHNhYmxlOiB0cnVlLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQWRtaW5pc3RyYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXk6ICd0cycsIGxhYmVsOidUZWFtIFNldHRpbmdzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXk6ICdteXQnLCBsYWJlbDogJ01hbmFnZSBZb3VyIFRlYW0nLCBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiAnbXl0MScsIHVybDogJy8nLCBsYWJlbDogJ01lbWJlcnMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXk6ICdteXQyJywgb25jbGljazogKCkgPT4gY29uc29sZS5sb2coJ29uY2xpY2sgISEnKSwgbGFiZWw6ICdBZGQgbWVtYmVyJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KVxufVxuXG5jb25zdCBEZW1vTWVzc2FnZSA9IHtcbiAgICB2aWV3OiAoKSA9PiBbXG4gICAgICAgIG0oYm0uTWVzc2FnZSwge2NvbG9yOiAnd2FybmluZycsIGhlYWRlcjogJ3NhbHV0Jywgb25jbG9zZTogKCkgPT4gY29uc29sZS5sb2coJ3lvJyl9LFxuICAgICAgICAgICAgXCJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LlwiICtcbiAgICAgICAgICAgIFwiUGVsbGVudGVzcXVlIHJpc3VzIG1pPC9zdHJvbmc+LCB0ZW1wdXMgcXVpcyBwbGFjZXJhdCB1dCwgXCIgK1xuICAgICAgICAgICAgXCJwb3J0YSBuZWMgbnVsbGEuIFZlc3RpYnVsdW0gcmhvbmN1cyBhYyBleCBzaXQgYW1ldCBmcmluZ2lsbGEuXCIgK1xuICAgICAgICAgICAgXCJOdWxsYW0gZ3JhdmlkYSBwdXJ1cyBkaWFtLCBldCBkaWN0dW0gZmVsaXMgdmVuZW5hdGlzIGVmZmljaXR1clwiKSxcblxuICAgICAgICBtKGJtLk1lc3NhZ2UsIHtjb2xvcjogJ2RhcmsnfSxcbiAgICAgICAgICAgIFwiTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC5cIiArXG4gICAgICAgICAgICBcIlBlbGxlbnRlc3F1ZSByaXN1cyBtaTwvc3Ryb25nPiwgdGVtcHVzIHF1aXMgcGxhY2VyYXQgdXQsIFwiICtcbiAgICAgICAgICAgIFwicG9ydGEgbmVjIG51bGxhLiBWZXN0aWJ1bHVtIHJob25jdXMgYWMgZXggc2l0IGFtZXQgZnJpbmdpbGxhLlwiICtcbiAgICAgICAgICAgIFwiTnVsbGFtIGdyYXZpZGEgcHVydXMgZGlhbSwgZXQgZGljdHVtIGZlbGlzIHZlbmVuYXRpcyBlZmZpY2l0dXJcIiksXG4gICAgXVxufVxuXG5jb25zdCBEZW1vTW9kYWwgPSB7XG4gICAgdmlldzogKCkgPT4gW1xuICAgICAgICBtKGJtLkJ1dHRvbiwge29uY2xpY2s6ICgpID0+IERhdGFTdGF0ZS5hY3RpdmU9dHJ1ZSwgdGV4dDogJ2xhdW5jaCBtb2RhbCd9KSxcbiAgICAgICAgbShibS5Nb2RhbCwge29uY2xvc2U6ICgpID0+IERhdGFTdGF0ZS5hY3RpdmU9ZmFsc2UsIGFjdGl2ZTpEYXRhU3RhdGUuYWN0aXZlfSxcbiAgICAgICAgICAgIG0oJy5ib3gnLCAnSGVsbG8gdGhlcmUnKSksXG4gICAgXVxufVxuXG5jb25zdCBEZW1vTmF2ID0ge1xuICAgIHZpZXc6ICgpID0+IG0oYm0uTmF2LCB7XG4gICAgICAgIGxlZnQ6IFttKCdpbWdbc3JjPVwiaHR0cDovL2J1bG1hLmlvL2ltYWdlcy9idWxtYS1sb2dvLnBuZ1wiXVthbHQ9XCJCdWxtYSBsb2dvXCJdJyldLFxuICAgICAgICBjZW50ZXI6IFttKGJtLkljb24sIHtpY29uOiAnZ2l0aHViJ30pXSxcbiAgICAgICAgcmlnaHQ6IFsnSG9tZScsICdEb2NzJ11cbiAgICB9KVxufVxuXG5jb25zdCBEZW1vQ2FyZCA9IHtcbiAgICB2aWV3OiAoKSA9PiBtKGJtLkNhcmQsIFtcbiAgICAgICAgbShibS5DYXJkSGVhZGVyLCB7aWNvbjogbShibS5JY29uLCB7aWNvbjogJ2FuZ2xlLWRvd24nfSksIHRpdGxlOiAnYSBjYXJkJ30pLFxuICAgICAgICBtKGJtLkNhcmRDb250ZW50LCBtKGJtLkNvbnRlbnQsICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCcpKSxcbiAgICAgICAgbShibS5DYXJkRm9vdGVyLCBbXG4gICAgICAgICAgICBtKGJtLkNhcmRGb290ZXJJdGVtLCB7dGV4dDogJ1NhdmUnfSksXG4gICAgICAgICAgICBtKGJtLkNhcmRGb290ZXJJdGVtLCB7dGV4dDogJ0RlbGV0ZSd9KVxuICAgICAgICBdKVxuICAgIF0pXG59XG5cbmNvbnN0IERlbW9QYWdpbmF0aW9uID0ge1xuICAgIHZpZXc6ICgpID0+IG0oYm0uUGFnaW5hdGlvbiwgXG4gICAgICAgIHtuYjogMTAwLCBjdXJyZW50OiA1MSwgb25jbGljazogKG5iKSA9PiBjb25zb2xlLmxvZyhuYiArICcgY2xpY2tlZCcpfSlcbn1cblxuXG5jb25zdCBEZW1vUGFuZWwgPSB7XG4gICAgdmlldzogKCkgPT4gbShibS5QYW5lbCwgW1xuICAgICAgICBtKGJtLlBhbmVsSGVhZGluZywgJ0EgUGFuZWwgIScpLFxuICAgICAgICBtKGJtLlBhbmVsVGFicywge2l0ZW1zOiBbXG4gICAgICAgICAgICB7bGFiZWw6ICdBbGwnfSxcbiAgICAgICAgICAgIHtsYWJlbDogJ1B1YmxpYyd9LFxuICAgICAgICAgICAge2xhYmVsOiAnUHJpdmF0ZSd9XX0pLFxuICAgICAgICBtKGJtLlBhbmVsQmxvY2tzLCB7aXRlbXM6IFtcbiAgICAgICAgICAgIHtsYWJlbDogJ21hcmtzaGVldCcsIGljb246ICdib29rJ30sXG4gICAgICAgICAgICB7bGFiZWw6ICdtaW5pcmVzZXQuY3NzJywgaWNvbjogJ2Jvb2snfSxcbiAgICAgICAgICAgIHtsYWJlbDogJ2dpdGh1YicsIGljb246ICdjb2RlLWZvcmsnfV19KVxuICAgIF0pXG59XG5cbmNvbnN0IERlbW9UYWJzID0ge1xuICAgIHZpZXc6ICgpID0+IG0oYm0uVGFicywge2l0ZW1zOiBbXG4gICAgICAgIHtsYWJlbDogJ0FsbCcsIGljb246ICdpbWFnZScsIGNvbnRlbnQ6ICdibG9iJ30sXG4gICAgICAgIHtsYWJlbDogJ1B1YmxpYycsIGljb246ICdmaWxtJywgY29udGVudDogJ3dvb290J30sXG4gICAgICAgIHtsYWJlbDogJ1ByaXZhdGUnLCBjb250ZW50OiAncHJpdmUgISEnfV19XG4gICAgKVxufVxuXG5cbmNvbnN0IEVsZW1lbnRzID0ge1xuICAgIGJveDogWydCb3gnLCBEZW1vQm94XSxcbiAgICBidXR0b246IFsnQnV0dG9uJywgRGVtb0J1dHRvbl0sXG4gICAgZm9ybTogWydGb3JtJywgRGVtb0Zvcm1dLFxuICAgIGltYWdlOiBbJ0ltYWdlJywgRGVtb0ltYWdlXSxcbiAgICBub3RpZjogWydOb3RpZmljYXRpb24nLCBEZW1vTm90aWZpY2F0aW9uXSxcbiAgICBwcm9ncmVzczogWydQcm9ncmVzcycsIERlbW9Qcm9ncmVzc10sXG4gICAgdGFnOiBbJ1RhZycsIERlbW9UYWddLFxuICAgIHRhYmxlOiBbJ1RhYmxlJywgRGVtb1RhYmxlXSxcbiAgICB0aXRsZTogWydUaXRsZScsIERlbW9UaXRsZV1cbn1cblxuXG5jb25zdCBDb21wb25lbnRzID0ge1xuICAgIGxldmVsOiBbJ0xldmVsJywgRGVtb0xldmVsXSxcbiAgICBtZWRpYTogWydNZWRpYScsIERlbW9NZWRpYV0sXG4gICAgbWVudTogWydNZW51JywgRGVtb01lbnVdLFxuICAgIG1lc3NhZ2U6IFsnTWVzc2FnZScsIERlbW9NZXNzYWdlXSxcbiAgICBtb2RhbDogWydNb2RhbCcsIERlbW9Nb2RhbF0sXG4gICAgbmF2OiBbJ05hdicsIERlbW9OYXZdLFxuICAgIGNhcmQ6IFsnQ2FyZCcsIERlbW9DYXJkXSxcbiAgICBwYWdpbmF0aW9uOiBbJ1BhZ2luYXRpb24nLCBEZW1vUGFnaW5hdGlvbl0sXG4gICAgcGFuZWw6IFsnUGFuZWwnLCBEZW1vUGFuZWxdLFxuICAgIHRhYnM6IFsnVGFicycsIERlbW9UYWJzXVxufVxuXG5cbmNvbnN0IE1lbnUgPSB7XG4gICAgdmlldzogKCkgPT4gbShibS5NZW51LCB7XG4gICAgICAgIHNlbGVjdGVkOiBEYXRhU3RhdGUucGFnZSxcbiAgICAgICAgY29sbGFwc2FibGU6IHRydWUsXG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdEZW1vcycsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyAgIGtleTogJ2VsZW1lbnRzJywgbGFiZWw6ICdFbGVtZW50cycsIFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IE9iamVjdC5rZXlzKEVsZW1lbnRzKS5tYXAoa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBrZXkgPT4gRGF0YVN0YXRlLnBhZ2UgPSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogRWxlbWVudHNba2V5XVswXSB9fSlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyAgIGtleTogJ2NvbXBvbmVudHMnLCBsYWJlbDogJ0NvbXBvbmVudHMnLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBPYmplY3Qua2V5cyhDb21wb25lbnRzKS5tYXAoa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBrZXkgPT4gRGF0YVN0YXRlLnBhZ2UgPSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogQ29tcG9uZW50c1trZXldWzBdIH19KVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pXG59XG5cbmNvbnN0IGdldF9kZW1vID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKERhdGFTdGF0ZS5wYWdlKVxuICAgIGlmIChEYXRhU3RhdGUucGFnZSBpbiBFbGVtZW50cykgcmV0dXJuIG0oRWxlbWVudHNbRGF0YVN0YXRlLnBhZ2VdWzFdKVxuICAgIGlmIChEYXRhU3RhdGUucGFnZSBpbiBDb21wb25lbnRzKSByZXR1cm4gbShDb21wb25lbnRzW0RhdGFTdGF0ZS5wYWdlXVsxXSlcbiAgICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgY29uc3QgQXBwID0ge1xuICAgIHZpZXc6ICgpID0+IFxuICAgICAgICBtKCcuY29udGFpbmVyJyxcbiAgICAgICAgICAgIG0oYm0uVGl0bGUsICdCdWxtaXQnKSxcbiAgICAgICAgICAgIG0oXCIuY29sdW1ucy5pcy1tb2JpbGVcIiwgXG4gICAgICAgICAgICAgICAgbSgnLmNvbHVtbi5pcy1vbmUtdGhpcmQnLCBtKE1lbnUpKSxcbiAgICAgICAgICAgICAgICBtKCcuY29sdW1uJywgZ2V0X2RlbW8oKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxufVxuXG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpLCBBcHApIl0sIm5hbWVzIjpbImFyZ3VtZW50cyIsImdsb2JhbCIsIm0iLCJNZW51IiwiY29uc3QiLCJibS5zbGVlcCIsImJtLkJveCIsImJtLlRpdGxlIiwiYm0uQnV0dG9uIiwiYm0uQ09MT1JTIiwiYm0uU1RBVEVTIiwiYm0uVGFibGUiLCJibS5MYWJlbCIsImJtLklucHV0IiwiYm0uU2VsZWN0IiwiYm0uVGV4dEFyZWEiLCJibS5DaGVja0JveCIsImJtLlJhZGlvIiwiYm0uSW1hZ2UiLCJibS5Ob3RpZmljYXRpb24iLCJibS5Qcm9ncmVzcyIsImJtLlRhZyIsImJtLlN1YlRpdGxlIiwiYm0uTGV2ZWwiLCJibS5MZXZlbEl0ZW0iLCJibS5NZWRpYSIsImJtLk1lbnUiLCJibS5NZXNzYWdlIiwiYm0uTW9kYWwiLCJibS5OYXYiLCJibS5JY29uIiwiYm0uQ2FyZCIsImJtLkNhcmRIZWFkZXIiLCJibS5DYXJkQ29udGVudCIsImJtLkNvbnRlbnQiLCJibS5DYXJkRm9vdGVyIiwiYm0uQ2FyZEZvb3Rlckl0ZW0iLCJibS5QYWdpbmF0aW9uIiwiYm0uUGFuZWwiLCJibS5QYW5lbEhlYWRpbmciLCJibS5QYW5lbFRhYnMiLCJibS5QYW5lbEJsb2NrcyIsImJtLlRhYnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSSxXQUFXOztBQUVmLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFFBQVEs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QUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUEsRUFBQTtJQUN0RixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUUsRUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBLEVBQUE7U0FDNUMsRUFBQSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxJQUFJLElBQUksQ0FBQSxFQUFBO0lBQzdDO0dBQ0Q7RUFDRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUEsVUFBVSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEVBQUE7RUFDaEUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsS0FBSyxFQUFFLFFBQVEsRUFBRTtHQUNuRCxJQUFJLFFBQVEsR0FBRyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQTtHQUNyQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUE7R0FDOUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxVQUFVLEVBQUUsRUFBQSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEVBQUE7R0FDeEQsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO0lBQzVCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7S0FDOUIsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7S0FDdkIsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7S0FDM0I7SUFDRCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLEVBQUEsS0FBSyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUEsRUFBQTtJQUNoRztHQUNELEtBQUssSUFB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R0FBRyxPQUFPLFFBQVEsS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLElBQUksWUFBWSxRQUFRLEdBQUcsU0FBUyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUEsRUFBQTtHQUM3SyxJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUUsRUFBQSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQSxFQUFBO0dBQzFFLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRSxFQUFBLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBLEVBQUE7R0FDOUQsSUFBSSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDM0MsSUFBSSxPQUFPLEVBQUUsRUFBQSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBLEVBQUE7UUFDN0MsRUFBQSxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxFQUFBO0dBQzdDLElBQUksR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFBO0dBQ3RDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsRUFBRSxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUE7R0FDMU0sSUFBSSxJQUFJLENB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TSxDQUFDLE1BQU0sRUFBRTtJQUNqQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7SUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7S0FDdkMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7TUFDeEMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFBO01BQ3ZELEtBQUs7TUFDTDtLQUNEO0lBQ0QsSUFBSSxTQUFTLEVBQUU7S0FDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUNwQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQSxRQUFRLEVBQUE7V0FDN0IsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBQSxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBLEVBQUE7V0FDMUgsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUEsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQSxFQUFBO1dBQ3pELEVBQUEsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFD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LENBQUMsRUFBRTtDQUNQLENBQUM7O0FBRUYsSUFBSSxHQUFHLEdBQUc7SUFDTixJQUFJLEVBQUUsVUFBVSxLQUFLLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Q0FDekYsQ0FBQzs7QUFFRixJQUFJLEtBQUssR0FBRztJQUNSLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUN0SCxDQUFDOzs7QUFHRixJQUFJLFFBQVEsR0FBRztJQUNYLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsV0FBVyxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUN6SCxDQUFDOztBQUVGLElBQUksT0FBTyxHQUFHO0lBQ1YsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzlGLEtBQUssQ0FBQyxRQUFRO1NBQ2pCLENBQUMsRUFBRTtDQUNYLENBQUM7O0FBRUYsSUFBSSxLQUFLLEdBQUc7SUFDUixJQUFJLEVBQUUsVUFBVSxLQUFLLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsV0FBVztRQUN6QyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO0NBQzVELENBQUM7Ozs7OztBQU1GLElBQUksU0FBUyxHQUFHO0lBQ1osSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLGNBQWM7UUFDNUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Q0FDbEYsQ0FBQzs7QUFFRixJQUFJLFNBQVMsR0FBRztJQUNaLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUM1RSxDQUFDOztBQUVGLElBQUksWUFBWSxHQUFHO0lBQ2YsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO0NBQzVFLENBQUM7O0FBRUYsSUFBSSxVQUFVLEdBQUc7SUFDYixJQUFJLEVBQUUsVUFBVSxLQUFLLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Q0FDMUUsQ0FBQzs7QUFFRixJQUFJLEtBQUssR0FBRztJQUNSLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxlQUFlLEVBQUU7O1FBRS9DLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSztZQUNiQSxPQUFDLENBQUMsU0FBUyxFQUFFQSxPQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzlEQSxPQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7O1FBRXZEQSxPQUFDLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUM7O1FBRS9CLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHQSxPQUFDLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtLQUM5RCxDQUFDLENBQUMsRUFBRTtDQUNSLENBQUM7O0FBRUYsSUFBSSxZQUFZLEdBQUcsVUFBVSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sWUFBWTtRQUNyRSxZQUFZLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDakMsSUFBSSxZQUFZLENBQUMsV0FBVyxJQUFJLEtBQUssRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDL0UsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtLQUNoRCxDQUFDLEVBQUUsQ0FBQzs7O0FBR1QsSUFBSSxRQUFRLEdBQUc7SUFDWCxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUU7UUFDckIsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQztLQUMvRDtJQUNELElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU87WUFDeEJBLE9BQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzNFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ2hGLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUs7Z0JBQ3RCLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVc7b0JBQ3pCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTO3dCQUNsQkEsT0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOzBCQUN4Q0EsT0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDbEUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSztnQkFDaEZBLE9BQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxJQUFJLEVBQUVBLE9BQUMsQ0FBQyxHQUFHLEVBQUU7d0JBQ25FLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxXQUFXLEdBQUcsSUFBSTt3QkFDbkUsT0FBTyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztrQkFDOUUsSUFBSTtTQUNiLENBQUMsRUFBRTtDQUNYLENBQUM7O0FBRUYsSUFBSUMsTUFBSSxHQUFHO0lBQ1AsTUFBTSxFQUFFLFVBQVUsS0FBSyxFQUFFO1FBQ3JCLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQixLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7UUFDNUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDO0tBQzFEO0lBQ0QsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0QsT0FBQyxDQUFDLFlBQVk7UUFDMUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQUUsT0FBTztZQUMzQ0EsT0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVc7Z0JBQy9DLFlBQVksRUFBRSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDOUUsSUFBSSxDQUFDLEtBQUs7Z0JBQ1YsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXO29CQUNuQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUzt3QkFDbEJBLE9BQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzswQkFDeENBLE9BQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2xFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVM7Z0JBQzlDQSxPQUFDLENBQUMsY0FBYztvQkFDWixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxJQUFJLEVBQUVBLE9BQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7cUJBQ2hHO2lCQUNKLEdBQUcsSUFBSTtTQUNmLENBQUMsRUFBRSxDQUFDO0tBQ1IsQ0FBQyxFQUFFO0NBQ1AsQ0FBQzs7QUFFRixJQUFJLE9BQU8sR0FBRztJQUNWLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxpQkFBaUI7UUFDL0MsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFO1FBQzdELEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTTtZQUNkQSxPQUFDLENBQUMsaUJBQWlCLEVBQUVBLE9BQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQzNDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHQSxPQUFDLENBQUMsUUFBUTtvQkFDNUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1VBQy9ELEVBQUU7UUFDSkEsT0FBQyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQ3JDLENBQUMsQ0FBQyxFQUFFO0NBQ1IsQ0FBQzs7QUFFRixJQUFJLEtBQUssR0FBRztJQUNSLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ25GQSxPQUFDLENBQUMsbUJBQW1CLENBQUM7WUFDdEJBLE9BQUMsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ25DLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHQSxPQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUU7S0FDekYsQ0FBQyxDQUFDLEVBQUU7Q0FDUixDQUFDOztBQUVGLElBQUksR0FBRyxHQUFHO0lBQ04sSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLFNBQVMsRUFBRTtRQUN6QyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBR0EsT0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRTtRQUMvRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBR0EsT0FBQyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRTtRQUNySCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBR0EsT0FBQyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRTtLQUNySCxDQUFDLENBQUMsRUFBRTtDQUNSLENBQUM7O0FBRUYsSUFBSSxVQUFVLEdBQUc7SUFDYixJQUFJLEVBQUUsVUFBVSxLQUFLLEVBQUUsRUFBRSxPQUFPQSxPQUFDLENBQUMsb0JBQW9CLEVBQUU7UUFDcERBLE9BQUMsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMzQ0EsT0FBQyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0tBQzVDLENBQUMsQ0FBQyxFQUFFO0NBQ1IsQ0FBQzs7QUFFRixJQUFJLFVBQVUsR0FBRztJQUNiLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUM3RSxDQUFDOztBQUVGLElBQUksY0FBYyxHQUFHO0lBQ2pCLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUMxRSxDQUFDOztBQUVGLElBQUksV0FBVyxHQUFHO0lBQ2QsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUN4RSxDQUFDOztBQUVGLElBQUksSUFBSSxHQUFHO0lBQ1AsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUNoRSxDQUFDOztBQUVGLElBQUksU0FBUyxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxPQUFPLFlBQVk7UUFDekQsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO0tBQzFELENBQUMsRUFBRSxDQUFDOztBQUVULElBQUksUUFBUSxHQUFHO0lBQ1gsTUFBTSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsRUFBRTs7SUFFakYsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLE9BQU8sRUFBRUEsT0FBQyxDQUFDLElBQUk7UUFDN0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxJQUFJO2dCQUNsRDtvQkFDSSxLQUFLLEVBQUUsR0FBRyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFdBQVcsR0FBRyxJQUFJO29CQUN0RCxPQUFPLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO2lCQUN2QztnQkFDREEsT0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHO29CQUNmQSxPQUFDLENBQUMsb0JBQW9CO29CQUN0QkEsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRUEsT0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7c0JBQzVELElBQUksQ0FBQyxLQUFLLENBQUM7YUFDcEIsQ0FBQyxFQUFFO1NBQ1A7S0FDSixDQUFDLENBQUMsRUFBRTtDQUNSLENBQUM7OztBQUdGLElBQUksY0FBYyxHQUFHLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxVQUFVLElBQUksRUFBRSxFQUFFLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUU1RyxJQUFJLElBQUksR0FBRztJQUNQLE1BQU0sRUFBRSxVQUFVLEtBQUssRUFBRTtRQUNyQixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDN0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUMzRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNmLE9BQU8sSUFBSTtTQUNkLENBQUMsQ0FBQztLQUNOOztJQUVELElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO1lBQ25IQSxPQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLEtBQUs7b0JBQzlDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzVGLElBQUksQ0FBQyxPQUFPO2lCQUNmLENBQUMsRUFBRTthQUNQO1NBQ0osQ0FBQyxDQUFDLEVBQUU7O0NBRVosQ0FBQzs7QUFFRixJQUFJLFNBQVMsR0FBRyxVQUFVLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsT0FBTyxZQUFZO1FBQ3pELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUU7YUFDekQsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRTtRQUNsQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtLQUMxRCxDQUFDLEVBQUUsQ0FBQzs7QUFFVCxJQUFJLEtBQUssR0FBRztJQUNSLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Q0FDcEUsQ0FBQzs7QUFFRixJQUFJLFlBQVksR0FBRztJQUNmLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUMxRSxDQUFDOztBQUVGLElBQUksU0FBUyxHQUFHO0lBQ1osTUFBTSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTs7SUFFcEYsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLGFBQWE7UUFDM0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLE9BQU9BLE9BQUMsQ0FBQyxHQUFHO2dCQUNqRDtvQkFDSSxLQUFLLEVBQUUsR0FBRyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFdBQVcsR0FBRyxJQUFJO29CQUN0RCxPQUFPLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO2lCQUN2QyxFQUFFLElBQUksQ0FBQyxLQUFLO2FBQ2hCLENBQUMsRUFBRTtTQUNQO0tBQ0osQ0FBQyxFQUFFO0NBQ1AsQ0FBQzs7OztBQUlGLElBQUksV0FBVyxHQUFHO0lBQ2QsTUFBTSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTs7SUFFcEYsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsT0FBT0EsT0FBQyxDQUFDLGVBQWUsRUFBRTtnQkFDM0YsS0FBSyxFQUFFLEdBQUcsS0FBSyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxXQUFXLEdBQUcsSUFBSTtnQkFDdEQsT0FBTyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQzthQUN2QyxFQUFFO1lBQ0hBLE9BQUMsQ0FBQyxpQkFBaUIsRUFBRUEsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLEtBQUs7U0FDYixDQUFDLENBQUMsRUFBRTtLQUNSLENBQUMsRUFBRTtDQUNQLENBQUMsQUFFRixBQUFvWjs7QUNwZ0JwWkUsSUFBTSxTQUFTLEdBQUc7SUFDZCxLQUFLLEVBQUUsQ0FBQztJQUNSLE9BQU8sRUFBRSxLQUFLO0lBQ2QsSUFBSSxFQUFFLElBQUk7O0lBRVYsR0FBRyxFQUFFLFlBQUc7O1FBRUosU0FBUyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUE7UUFDcEIsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzFDQyxLQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQUc7WUFDbEIsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7WUFDekJILE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUN6QyxDQUFDLENBQUE7S0FDTDtDQUNKLENBQUE7O0FBRURFLElBQU0sT0FBTyxHQUFHO0lBQ1osSUFBSSxFQUFFLFlBQUcsU0FBR0YsT0FBQyxDQUFDSSxHQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUE7Q0FDakMsQ0FBQTs7QUFFREYsSUFBTSxVQUFVLEdBQUc7SUFDZixJQUFJLEVBQUUsWUFBRyxTQUFHO1FBQ1JGLE9BQUMsQ0FBQ0ssS0FBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLHVCQUF1QixDQUFDO1FBQy9DTCxPQUFDLENBQUNNLE1BQVMsRUFBRTtZQUNULE9BQU8sRUFBRSxTQUFTLENBQUMsR0FBRztZQUN0QixPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87WUFDMUIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUk7WUFDM0MsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLO1lBQ3RDLElBQUksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDOztRQUUxQ04sT0FBQyxDQUFDSyxLQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDO1FBQ2hDRSxNQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxFQUFDLFNBQUdQLE9BQUMsQ0FBQ00sTUFBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFBLENBQUM7O1FBRXZGTixPQUFDLENBQUNLLEtBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUM7UUFDaENHLE1BQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLEVBQUMsU0FBR1IsT0FBQyxDQUFDTSxNQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUEsQ0FBQyxFQUMxRixHQUFBO0NBQ0osQ0FBQTs7QUFFREosSUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsWUFBRyxTQUFHRixPQUFDLENBQUNTLEtBQVEsRUFBRTtRQUNwQixPQUFPLEVBQUUsSUFBSTtRQUNiLFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLENBQUM7UUFDZCxNQUFNLEVBQUU7WUFDSixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQztZQUNoQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztZQUM5QixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO1NBQzVDO1FBQ0QsTUFBTSxFQUFFO1lBQ0osQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUM7WUFDaEMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO1lBQ2QsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7U0FDNUI7UUFDRCxJQUFJLEVBQUU7WUFDRixDQUFDLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztZQUNsQixDQUFDLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxFQUFFLENBQUM7WUFDNUIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztZQUNsQixDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQztZQUNyQixDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7WUFDbEIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNiLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUM7U0FDeEI7S0FDSixDQUFDLEdBQUE7Q0FDTCxDQUFBOzs7QUFHRFAsSUFBTSxRQUFRLEdBQUc7SUFDYixJQUFJLEVBQUUsWUFBRyxTQUFHO1FBQ1JGLE9BQUMsQ0FBQ1UsS0FBUSxFQUFFLFVBQVUsQ0FBQztRQUN2QlYsT0FBQyxDQUFDVyxLQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFWCxPQUFDLENBQUNXLEtBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDckVYLE9BQUMsQ0FBQ1UsS0FBUSxFQUFFLFlBQVksQ0FBQztRQUN6QlYsT0FBQyxDQUFDWSxNQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RFosT0FBQyxDQUFDYSxRQUFXLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RFYixPQUFDLENBQUNjLFFBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwQ2QsT0FBQyxDQUFDZSxLQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsRSxHQUFBO0NBQ0osQ0FBQTs7O0FBR0RiLElBQU0sU0FBUyxHQUFHO0lBQ2QsSUFBSSxFQUFFLFlBQUcsU0FBRztRQUNSRixPQUFDLENBQUNnQixLQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRztZQUNsQixHQUFHLEVBQUUsaURBQWlELENBQUMsQ0FBQztRQUM1RGhCLE9BQUMsQ0FBQ2dCLEtBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNO1lBQ3RCLEdBQUcsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO0tBQy9ELEdBQUE7Q0FDSixDQUFBOzs7QUFHRGQsSUFBTSxnQkFBZ0IsR0FBRztJQUNyQixJQUFJLEVBQUUsWUFBRyxTQUFHRixPQUFDLENBQUNpQixZQUFlLEVBQUU7WUFDdkIsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFHLFNBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBQSxDQUFDO1lBQ3JFLGlCQUFpQixDQUFDLEdBQUE7O0NBRTdCLENBQUE7O0FBRURmLElBQU0sWUFBWSxHQUFHO0lBQ2pCLElBQUksRUFBRSxZQUFHLFNBQUc7UUFDUkYsT0FBQyxDQUFDa0IsUUFBVyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRGxCLE9BQUMsQ0FBQ2tCLFFBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDeEQsR0FBQTtDQUNKLENBQUE7OztBQUdEaEIsSUFBTSxPQUFPLEdBQUc7SUFDWixJQUFJLEVBQUUsWUFBRyxTQUFHO1FBQ1JGLE9BQUMsQ0FBQ21CLEdBQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUM7UUFDbkNuQixPQUFDLENBQUNtQixHQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3BDLEdBQUE7Q0FDSixDQUFBOztBQUVEakIsSUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsWUFBRyxTQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLEVBQUMsU0FBRztRQUNwQ0YsT0FBQyxDQUFDSyxLQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNwQ0wsT0FBQyxDQUFDb0IsUUFBVyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsRUFDN0MsR0FBQSxDQUFDLEdBQUE7Q0FDTCxDQUFBOztBQUVEbEIsSUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsWUFBRyxTQUNMRixPQUFDLENBQUNxQixLQUFRLEVBQUU7WUFDUnJCLE9BQUMsQ0FBQ3NCLFNBQVksRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRXRCLE9BQUMsQ0FBQyxLQUFLLEVBQUVBLE9BQUMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUVBLE9BQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1RkEsT0FBQyxDQUFDc0IsU0FBWSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFdEIsT0FBQyxDQUFDLEtBQUssRUFBRUEsT0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRUEsT0FBQyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlGQSxPQUFDLENBQUNzQixTQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUV0QixPQUFDLENBQUMsS0FBSyxFQUFFQSxPQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFQSxPQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0ZBLE9BQUMsQ0FBQ3NCLFNBQVksRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRXRCLE9BQUMsQ0FBQyxLQUFLLEVBQUVBLE9BQUMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUVBLE9BQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUMvRixDQUFDLEdBQUE7Q0FDVCxDQUFBOztBQUVERSxJQUFNLFNBQVMsR0FBRztJQUNkLElBQUksRUFBRSxZQUFHLFNBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsRUFBQyxTQUN4QkYsT0FBQyxDQUFDdUIsS0FBUSxFQUFFO2dCQUNKLEtBQUssRUFBRTtvQkFDSCxLQUFLLEVBQUUsT0FBTztvQkFDZCxHQUFHLEVBQUUsaURBQWlELENBQUM7Z0JBQzNELE1BQU0sRUFBRXZCLE9BQUMsQ0FBQ00sTUFBUyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzFDO1lBQ0ROLE9BQUMsQ0FBQyxVQUFVLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQztTQUM5QixHQUFBO0tBQ0osR0FBQTtDQUNKLENBQUE7O0FBRURFLElBQU0sUUFBUSxHQUFHO0lBQ2IsSUFBSSxFQUFFLFlBQUcsU0FDTEYsT0FBQyxDQUFDd0IsTUFBTyxFQUFFO1lBQ1AsUUFBUSxFQUFFLEtBQUs7WUFDZixXQUFXLEVBQUUsSUFBSTtZQUNqQixLQUFLLEVBQUU7Z0JBQ0g7b0JBQ0ksS0FBSyxFQUFFLGdCQUFnQjtvQkFDdkIsS0FBSyxFQUFFO3dCQUNILEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsZUFBZSxFQUFFO3dCQUNwQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRTs0QkFDNUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTs0QkFDM0MsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxZQUFHLFNBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBQSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7eUJBQ2pGLENBQUM7cUJBQ0w7aUJBQ0o7YUFDSjtTQUNKLENBQUMsR0FBQTtDQUNULENBQUE7O0FBRUR0QixJQUFNLFdBQVcsR0FBRztJQUNoQixJQUFJLEVBQUUsWUFBRyxTQUFHO1FBQ1JGLE9BQUMsQ0FBQ3lCLE9BQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBRyxTQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUEsQ0FBQztZQUMvRSwwREFBMEQ7WUFDMUQsMkRBQTJEO1lBQzNELCtEQUErRDtZQUMvRCxnRUFBZ0UsQ0FBQzs7UUFFckV6QixPQUFDLENBQUN5QixPQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO1lBQ3pCLDBEQUEwRDtZQUMxRCwyREFBMkQ7WUFDM0QsK0RBQStEO1lBQy9ELGdFQUFnRSxDQUFDLEVBQ3hFLEdBQUE7Q0FDSixDQUFBOztBQUVEdkIsSUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsWUFBRyxTQUFHO1FBQ1JGLE9BQUMsQ0FBQ00sTUFBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQUcsU0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksR0FBQSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUMxRU4sT0FBQyxDQUFDMEIsS0FBUSxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQUcsU0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3hFMUIsT0FBQyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyxFQUNoQyxHQUFBO0NBQ0osQ0FBQTs7QUFFREUsSUFBTSxPQUFPLEdBQUc7SUFDWixJQUFJLEVBQUUsWUFBRyxTQUFHRixPQUFDLENBQUMyQixHQUFNLEVBQUU7UUFDbEIsSUFBSSxFQUFFLENBQUMzQixPQUFDLENBQUMsb0VBQW9FLENBQUMsQ0FBQztRQUMvRSxNQUFNLEVBQUUsQ0FBQ0EsT0FBQyxDQUFDNEIsSUFBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztLQUMxQixDQUFDLEdBQUE7Q0FDTCxDQUFBOztBQUVEMUIsSUFBTSxRQUFRLEdBQUc7SUFDYixJQUFJLEVBQUUsWUFBRyxTQUFHRixPQUFDLENBQUM2QixJQUFPLEVBQUU7UUFDbkI3QixPQUFDLENBQUM4QixVQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUU5QixPQUFDLENBQUM0QixJQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0U1QixPQUFDLENBQUMrQixXQUFjLEVBQUUvQixPQUFDLENBQUNnQyxPQUFVLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUM5RGhDLE9BQUMsQ0FBQ2lDLFVBQWEsRUFBRTtZQUNiakMsT0FBQyxDQUFDa0MsY0FBaUIsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwQ2xDLE9BQUMsQ0FBQ2tDLGNBQWlCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDekMsQ0FBQztLQUNMLENBQUMsR0FBQTtDQUNMLENBQUE7O0FBRURoQyxJQUFNLGNBQWMsR0FBRztJQUNuQixJQUFJLEVBQUUsWUFBRyxTQUFHRixPQUFDLENBQUNtQyxVQUFhO1FBQ3ZCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFDLEVBQUUsRUFBRSxTQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFBLENBQUMsQ0FBQyxHQUFBO0NBQzdFLENBQUE7OztBQUdEakMsSUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsWUFBRyxTQUFHRixPQUFDLENBQUNvQyxLQUFRLEVBQUU7UUFDcEJwQyxPQUFDLENBQUNxQyxZQUFlLEVBQUUsV0FBVyxDQUFDO1FBQy9CckMsT0FBQyxDQUFDc0MsU0FBWSxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ3BCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUNkLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztZQUNqQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekJ0QyxPQUFDLENBQUN1QyxXQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDdEIsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7WUFDbEMsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7WUFDdEMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUMsQ0FBQyxHQUFBO0NBQ0wsQ0FBQTs7QUFFRHJDLElBQU0sUUFBUSxHQUFHO0lBQ2IsSUFBSSxFQUFFLFlBQUcsU0FBR0YsT0FBQyxDQUFDd0MsSUFBTyxFQUFFLENBQUMsS0FBSyxFQUFFO1FBQzNCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7UUFDOUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztRQUNqRCxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7S0FDNUMsR0FBQTtDQUNKLENBQUE7OztBQUdEdEMsSUFBTSxRQUFRLEdBQUc7SUFDYixHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO0lBQ3JCLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUM7SUFDOUIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztJQUN4QixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0lBQzNCLEtBQUssRUFBRSxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQztJQUN6QyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO0lBQ3BDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7SUFDckIsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztJQUMzQixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0NBQzlCLENBQUE7OztBQUdEQSxJQUFNLFVBQVUsR0FBRztJQUNmLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7SUFDM0IsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztJQUMzQixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0lBQ3hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7SUFDakMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztJQUMzQixHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO0lBQ3JCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7SUFDeEIsVUFBVSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQztJQUMxQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0lBQzNCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7Q0FDM0IsQ0FBQTs7O0FBR0RBLElBQU1ELE9BQUksR0FBRztJQUNULElBQUksRUFBRSxZQUFHLFNBQUdELE9BQUMsQ0FBQ3dCLE1BQU8sRUFBRTtRQUNuQixRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUk7UUFDeEIsV0FBVyxFQUFFLElBQUk7UUFDakIsS0FBSyxFQUFFO1lBQ0g7Z0JBQ0ksS0FBSyxFQUFFLE9BQU87Z0JBQ2QsS0FBSyxFQUFFO29CQUNILElBQUksR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVTt3QkFDbEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxFQUFDOzRCQUNqQyxPQUFPO2dDQUNILEdBQUcsRUFBRSxHQUFHO2dDQUNSLE9BQU8sRUFBRSxVQUFBLEdBQUcsRUFBQyxTQUFHLFNBQVMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFBO2dDQUNwQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDdEM7b0JBQ0QsSUFBSSxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxZQUFZO3dCQUN0QyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUM7NEJBQ25DLE9BQU87Z0NBQ0gsR0FBRyxFQUFFLEdBQUc7Z0NBQ1IsT0FBTyxFQUFFLFVBQUEsR0FBRyxFQUFDLFNBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUE7Z0NBQ3BDLEtBQUssRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUN4QyxFQUNKO2FBQ0o7U0FDSjtLQUNKLENBQUMsR0FBQTtDQUNMLENBQUE7O0FBRUR0QixJQUFNLFFBQVEsR0FBRyxZQUFHO0lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzNCLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxRQUFRLEVBQUUsRUFBQSxPQUFPRixPQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFBO0lBQ3JFLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxVQUFVLEVBQUUsRUFBQSxPQUFPQSxPQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFBO0lBQ3pFLE9BQU8sSUFBSTtDQUNkLENBQUE7O0FBRUQsQUFBT0UsSUFBTSxHQUFHLEdBQUc7SUFDZixJQUFJLEVBQUUsWUFBRyxTQUNMRixPQUFDLENBQUMsWUFBWTtZQUNWQSxPQUFDLENBQUNLLEtBQVEsRUFBRSxRQUFRLENBQUM7WUFDckJMLE9BQUMsQ0FBQyxvQkFBb0I7Z0JBQ2xCQSxPQUFDLENBQUMsc0JBQXNCLEVBQUVBLE9BQUMsQ0FBQ0MsT0FBSSxDQUFDLENBQUM7Z0JBQ2xDRCxPQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO2FBQzNCO1NBQ0osR0FBQTtDQUNSLENBQUE7OztBQUdEQSxPQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRzs7OzsifQ==
