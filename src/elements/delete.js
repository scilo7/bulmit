import m from "mithril"

export const Delete = {
    view: (vnode) =>
        m('a.delete', {class: vnode.attrs.size ? 'is-' + vnode.attrs.size : ''},
            vnode.children
        )
}
