import m from "mithril"

const tt = (vnode, tag) => {
    const size = vnode.attrs.size || 1
    return m('h' + size + tag + '.is-' + size, vnode.attrs.text)
}

export const Title = {
    view: (vnode) => tt(vnode, '.title')
}

export const SubTitle = {
    view: (vnode) => tt(vnode, '.subtitle')
}
