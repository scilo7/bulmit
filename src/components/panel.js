import m from "mithril"
import { Icon } from '../elements/icon.js'

const onclick = (vnode, item, idx) =>
    () => {
        if (vnode.state.active === idx) vnode.state.active = null
        else vnode.state.active = idx
        if (vnode.attrs.onclick) vnode.attrs.onclick(item)
    }

export const Panel = {
    view: vnode => m('nav.panel', vnode.children)
}

export const PanelHeading = {
    view: vnode => m('p.panel-heading', vnode.children)
}

export const PanelTabs = {
    oninit: vnode => vnode.state.active = vnode.attrs.active || null,

    view: vnode => m('.panel-tabs',
        vnode.attrs.items.map((item, idx) =>
            m('a',
                {
                    class: idx === vnode.state.active ? 'is-active' : null,
                    onclick: onclick(vnode, item, idx)
                }, item.label
            )
        )
    )
}

export const PanelBlock = {
    view: vnode => m('.panel-block', vnode.children)
}

export const PanelBlocks = {
    oninit: vnode => vnode.state.active = vnode.attrs.active || null,

    view: vnode => vnode.attrs.items.map((item, idx) =>
        m('a.panel-block', {
                class: idx === vnode.state.active ? 'is-active' : null,
                onclick: onclick(vnode, item, idx)
            }, [
            m('span.panel-icon', m('i.fa', {class: 'fa-' + item.icon})),
            item.label
        ])
    )
}
