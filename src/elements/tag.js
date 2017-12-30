import m from "mithril"
import { bulmify } from '../common'

export const Tag = {
    view: (vnode) =>
        m('span.tag', bulmify(vnode.attrs, ['state', 'color', 'size']),
            vnode.children)
}
