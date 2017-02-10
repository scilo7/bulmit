import m from "mithril"

export const Content = {
    view: (vnode) =>
        m('content', {class: vnode.attrs.size ? 'is-' + vnode.attrs.size : ''},
            vnode.children
        )
}
