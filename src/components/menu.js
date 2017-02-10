import m from "mithril"
import { Icon } from '../elements/icon.js'

const clickhandler = (global_state, item, state) =>
    () => {
        global_state.selected = item.key
        if (global_state.collapsable && state) state.collapsed = ! state.collapsed
        if (item.onclick) item.onclick(item.key)
    }


const MenuItem = {
    oninit: vnode => {
        vnode.state.collapsed = vnode.attrs.root.collapsed || false
    },
    view: vnode =>
        [
            m('a', {onclick: clickhandler(vnode.attrs.state, vnode.attrs.root, vnode.state),
                class: vnode.attrs.state.selected === vnode.attrs.root.key ? "is-active" : null},
                vnode.attrs.root.label,
                vnode.attrs.state.collapsable ? 
                    (vnode.state.collapsed ? 
                        m(Icon, {icon: 'caret-up', size: 'small'})
                        : m(Icon, {icon: 'caret-down', size: 'small'})): null),
            (!vnode.attrs.state.collapsable || !vnode.state.collapsed) && vnode.attrs.root.items ?
                m('ul', vnode.attrs.root.items.map(item =>
                    m('li', m('a', {
                        class: vnode.attrs.state.selected === item.key ? "is-active" : null,
                        onclick: clickhandler(vnode.attrs.state, item, null)}, item.label))))
                : null
        ]
}

export const Menu = {
    oninit: vnode => {
        vnode.state = vnode.attrs
        vnode.state.collapsable =  vnode.attrs.collapsable || false
        vnode.state.collapsed = vnode.attrs.collapsed || false
    },
    view: vnode => m('aside.menu',
        vnode.state.items.map(menu => [
            m('p.menu-label', {onclick: vnode.attrs.collapsable ? 
                () => vnode.state.collapsed = !vnode.state.collapsed : null}, 
                menu.label, 
                vnode.state.collapsable ? 
                    (vnode.state.collapsed ? 
                        m(Icon, {icon: 'caret-up', size: 'small'})
                        : m(Icon, {icon: 'caret-down', size: 'small'})): null),
            !vnode.state.collapsable || !vnode.state.collapsed ?
                m('ul.menu-list',
                    menu.items.map(item =>
                        m('li', m(MenuItem, {state: vnode.state, root: item}))
                    )
                ) : null
        ])
    )
}
