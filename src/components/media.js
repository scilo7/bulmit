import m from "mithril"

export const MediaLeft = {
    view: (vnode) => m('figure.media-left', vnode.children)
}

export const MediaContent = {
    view: (vnode) => m('div.media-content', vnode.children)
}

export const MediaRight = {
    view: (vnode) => m('div.media-right', vnode.children)
}

export const Media = {
    view: (vnode) => m('article.media', [

        vnode.attrs.image ?
            m(MediaLeft, m('p.image', {class: 'is-' + vnode.attrs.image.ratio},
                m('img', {'src': vnode.attrs.image.src}))) : '',

        m(MediaContent, vnode.children),

        vnode.attrs.button ? m(MediaRight, vnode.attrs.button) : ''
    ])
}
