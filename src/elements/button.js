import m from "mithril"
import { bulmify, smaller_than } from '../common'
import { Icon } from './icon.js'

export const icon_button = (vnode) => [
    !vnode.attrs.icon_right ?
        m(Icon, {icon: vnode.attrs.icon, size: smaller_than(vnode.attrs.size)}) : '',
    m('span', vnode.attrs.content),
    vnode.attrs.icon_right ?
        m(Icon, {icon: vnode.attrs.icon, size: smaller_than(vnode.attrs.size)}) : ''
]

export const Button = {
    view: (vnode) => m('a.button', bulmify(vnode.attrs),
        vnode.attrs.icon ? icon_button(vnode) : vnode.attrs.content)
}
