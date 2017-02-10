import m from "mithril"

export const Modal = {
    view: vnode => m('.modal', {class: vnode.attrs.active ? 'is-active': ''}, [
            m('.modal-background'),
            m('.modal-content', vnode.children),
            vnode.attrs.onclose ? m('.button.modal-close', {onclick: vnode.attrs.onclose}): ''
    ])
}
