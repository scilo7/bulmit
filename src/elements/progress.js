import m from "mithril"
import { bulmify } from '../common'

export const Progress = {
    view: vnode =>
        m("progress.progress", bulmify(vnode.attrs),
            vnode.children
        )
}
