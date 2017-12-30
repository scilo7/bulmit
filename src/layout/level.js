import m from "mithril"

export const Level = {
    view: (vnode) => m('nav.level', {'is-mobile': vnode.attrs.mobile},
        vnode.attrs.left ?
            m('div.level-left', vnode.attrs.left.map(children => m(LevelItem, children)))
            : null,

        vnode.attrs.center ?
            vnode.attrs.center.map(children => m(LevelItem, {centered: true}, children))
            : null,

        vnode.attrs.right ?
        m('div.level-right', vnode.attrs.right.map(children => m(LevelItem, children)))
        : null)
}

const LevelItem = {
    view: (vnode) => m('p.level-item',
        {class: vnode.attrs.centered ? 'has-text-centered': null}, vnode.children)
}

