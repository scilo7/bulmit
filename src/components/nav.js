import m from "mithril"

export const Nav = {
    view: vnode => m('nav.nav', [
        vnode.attrs.left ? m('.nav-left', vnode.attrs.left.map(item => m('a.nav-item', item))) : '',
        vnode.attrs.center ? m('.nav-center', vnode.attrs.center.map(item => m('a.nav-item', item))) : '',
        vnode.attrs.right ? m('.nav-right', vnode.attrs.right.map(item => m('a.nav-item', item))) : ''
    ])
}
