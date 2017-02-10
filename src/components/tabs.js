import m from "mithril"
import { Icon } from '../elements/icon.js'

const onclick = (vnode, item, idx) =>
    () => {
        vnode.state.active = idx
        if (vnode.attrs.onclick) vnode.attrs.onclick(item)
    }

export const TabsMenu = {
    oninit: vnode => vnode.state.active = vnode.attrs.active || 0,

    view: vnode => m('.tabs', m('ul',
        vnode.attrs.items.map((item, idx) =>
            m('li',
                {
                    class: idx === vnode.state.active ? 'is-active' : null,
                    onclick: onclick(vnode, item, idx)
                },
                m('a', item.icon ? [
                    m('span.icon.is-small',
                    m('i.fa', {class: 'fa-' + item.icon})), m('span', item.label)]
                    : item.label)
            )
        )
    ))
}


const clickhandler = vnode =>
    item => vnode.state.active = item.key

export const Tabs = {
    oninit: vnode => {
        vnode.state.active = vnode.attrs.active || 0
        vnode.state.items = vnode.attrs.items.map((item, idx) => {
            item.key = idx
            return item
        })
    },

    view: vnode =>
        m('div', {style: {display: 'flex', flex: '1', width: '100%', 'flex-direction': 'column'}}, [
            m(TabsMenu, {active: vnode.state.active, onclick: clickhandler(vnode), items: vnode.state.items}),
            vnode.state.items.map(item =>
                m('div',
                    {style: {display: item.key === vnode.state.active ? 'block': 'none', 'margin-left': '10px'}},
                    item.content
                )
            )
        ])

}
