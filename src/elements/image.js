import m from "mithril"

export const Image = {
    view: vnode =>
        m('figure.image',
            {class: vnode.attrs.size ?
                'is-' + vnode.attrs.size + 'x' + vnode.attrs.size :
                'is-' + vnode.attrs.ratio},
            m('img', {src: vnode.attrs.src}))
}
