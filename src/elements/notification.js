import m from "mithril"
import { bulmify } from '../common'

export const Notification = {
    view: vnode =>
        m(".notification", bulmify(vnode.attrs),
            vnode.attrs.delete ?
                m("button.delete", {onclick: vnode.attrs.onclick}) : '',
            vnode.children
        )
}
