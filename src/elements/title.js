import m from "mithril"


export const Title = {
    view: (vnode) => m('h' + vnode.attrs.size + '.title' + '.is-' + vnode.attrs.size, vnode.children)
}


export const SubTitle = {
    view: (vnode) => m('h' + vnode.attrs.size + '.subtitle' + '.is-' + vnode.attrs.size, vnode.children)
}
