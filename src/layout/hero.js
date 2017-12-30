import m from "mithril"
import { bulmify } from '../common'


const modifiers = ['color', 'state', 'bold', 'size']

export const Hero = {
    view: (vnode) =>
        m('section.hero', bulmify(vnode.attrs, modifiers),
        vnode.attrs.head ? m('div.hero-head', vnode.attrs.head): null,
        vnode.attrs.body ? m('div.hero-body', vnode.attrs.body): null,
        vnode.attrs.foot ? m('div.hero-foot', vnode.attrs.foot): null
        )

}
