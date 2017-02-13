import m from "mithril"


const get_class = (vnode, item) => {
    let classes = vnode.attrs.tab ? 'is-tab' : ''
    if (item.hidden) classes +=  ' is-hidden' + item.hidden
    if (vnode.state.active === item.key) classes +=  ' is-active'
    return classes
}

const clickhandler = (vnode, item) =>
    () => {
        vnode.state.active = item.key
        if (vnode.attrs.onclick) vnode.attrs.onclick(item)
        if (item.onclick) item.onclick(item)
    }

export const NavToggle = {
    view: () => m('span.nav-toggle', m('span'), m('span'), m('span'))
}

export const NavItems = {
    oninit: vnode => vnode.state.active = vnode.attrs.active,
    view: vnode => vnode.attrs.items.map(item =>
        m('a.nav-item', {class: get_class(vnode, item), onclick: clickhandler(item)}, item.content))
}

export const Nav = {
    view: vnode => m('nav.nav', {class: vnode.attrs.shadow ? 'has-shadow': null}, [
        vnode.attrs.left ? m('.nav-left', vnode.attrs.left.map(item => m('a.nav-item', item))) : null,
        vnode.attrs.center ? m('.nav-center', vnode.attrs.center.map(item => m('a.nav-item', item))) : null,
        vnode.attrs.right ? m('.nav-right', vnode.attrs.right.map(item => m('a.nav-item', item))) : null
    ])
}
