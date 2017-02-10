import m from "mithril"

export const Message = {
    view: vnode => m('article.message',
        {class: vnode.attrs.color ? 'is-' + vnode.attrs.color : ''}, [
        vnode.attrs.header ?
            m('.message-header', m('p', vnode.attrs.header),
                vnode.attrs.onclose ? m('button',
                    {class: 'delete', onclick: vnode.attrs.onclose}): '')
        : '',
        m('.message-body', vnode.children)
    ])
}
