import m from "mithril"
import {Button} from '../elements/button.js'

export const Media = {
    view: (vnode) => m('article.media', [

        vnode.attrs.image ?
            m('figure.media-left', m('p.image', {class: ['is-' + vnode.attrs.image.ratio]},
                m('img', {'src': vnode.attrs.image.src}))) : '',

        m('div.media-content', vnode.children),

        m(Button, {delete: true, onclick: () => vnode.attrs.ondelete()})
    ])
}
