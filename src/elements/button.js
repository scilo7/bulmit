import m from "mithril"
import { bulmify, smaller_than } from '../common'
import { Icon } from './icon.js'

export const icon_button = (vnode) =>{

    const pos = vnode.attrs.icon.position || 'left'
    const icon = m(Icon,
        {
            symbol: vnode.attrs.icon.symbol,
            size: smaller_than(vnode.attrs.size)
        }
    )

    return [
        pos === 'left' ? icon : null,
        m('span', vnode.attrs.text),
        pos === 'right' ? icon : null
    ]
}


const modifiers = ['color', 'state', 'size',
        'outlined', 'inverted', 'hovered', 'focused',
        'active', 'loading', 'static', 'disabled', 'delete']

export const Button = {
    view: (vnode) => m('a.button', bulmify(vnode.attrs, modifiers),
        vnode.attrs.icon ? icon_button(vnode) : vnode.attrs.text)
}
