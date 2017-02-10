import m from "mithril"
import { Icon } from '../elements/icon.js'

export const CardImage = {
    view: (vnode) =>
        m('card-image',
            m('figure.image', {class: 'is-' + vnode.attrs.ratio},
                m('img', {src: vnode.attrs.src})
            )
        )
}

export const CardHeader = {
    view: (vnode) => m('header.card-header', [
        m('p.card-header-title', vnode.attrs.title),
        m('a.card-header-icon', vnode.attrs.icon)
    ])
}

export const CardFooter = {
    view: (vnode) => m('footer.card-footer', vnode.children)
}

export const CardFooterItem = {
    view: (vnode) => m('a.card-footer-item', vnode.attrs)
}

export const CardContent = {
    view: vnode => m('.card-content', vnode.children)
}

export const Card = {
    view: (vnode) =>
        m('.card', vnode.children)
}
