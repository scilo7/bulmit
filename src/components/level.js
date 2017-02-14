import m from "mithril"

export const Level = {
    view: (vnode) => m('nav.level',
        {'is-mobile': vnode.attrs.mobile}, vnode.children)
}

export const LevelLeft = {
    view: (vnode) => m('div.level-left', vnode.children)
}

export const LevelRight = {
    view: (vnode) => m('div.level-right', vnode.children)
}

export const LevelItem = {
    view: (vnode) => m('p.level-item',
        {class: vnode.attrs.centered ? 'has-text-centered': null}, vnode.children)
}

