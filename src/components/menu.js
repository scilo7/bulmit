import m from "mithril"
import stream from "mithril/stream"
import { Icon } from '../elements/icon.js'

const clickhandler = vnode => () => {
    vnode.attrs.active_item(vnode.attrs.item.key)
    if (vnode.attrs.collapsable) vnode.state.collapsed = ! vnode.state.collapsed
    if (vnode.attrs.item.onclick) vnode.attrs.item.onclick(vnode.attrs.item.key)
}


const MenuItem = {
    oninit: vnode => {
        vnode.state.collapsed = vnode.attrs.collapsed || false
        console.log(vnode.attrs)
        console.log(vnode.attrs.item.items)
    },
    view: vnode =>
        [
            m('a', {
                onclick: clickhandler(vnode),
                class: vnode.attrs.active_item === vnode.attrs.item.key ? "is-active" : null},
            vnode.attrs.item.label),

            (!vnode.attrs.collapsable || !vnode.state.collapsed) && vnode.attrs.item.items ?
                m('ul', vnode.attrs.item.items.map(item =>
                    m('li', m(MenuItem, {
                        item: item,
                        active_item: vnode.attrs.active_item})
                    )
                ))
                : null
        ]
}

export const Menu = {
    oninit: vnode => {
        vnode.state.collapsable =  vnode.attrs.collapsable || false
        vnode.state.collapsed = vnode.attrs.collapsed || false
        vnode.state.active_item = stream(null)
    },
    view: vnode => m('aside.menu',
        vnode.attrs.items.map(menu => [
            m('p.menu-label', menu.label),
            m('ul.menu-list',
                menu.items.map(item =>
                    m('li', m(MenuItem, {
                        collapsed: item.collapsed,
                        collapsable: vnode.attrs.collapsable,
                        item: item,
                        active_item: vnode.state.active_item
                    }))
                )
            )
        ])
    )
}
