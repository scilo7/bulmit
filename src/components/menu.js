import m from "mithril"

const clickhandler = (state, item) =>
    () => {
        state.selected = item.key
        if (item.url) console.log('redirect to ' + item.url)
        if (item.onclick) item.onclick(item.key)
    }


const MenuItem = {
    view: vnode =>
        [
            m('a', {onclick: clickhandler(vnode.attrs.state, vnode.attrs.root),
                class: vnode.attrs.state.selected === vnode.attrs.root.key ? "is-active" : ''},
                vnode.attrs.root.label),
            vnode.attrs.root.items ?
                m('ul', vnode.attrs.root.items.map(item =>
                    m('li', m('a', {
                        class: vnode.attrs.state.selected === item.key ? "is-active" : '',
                        onclick: clickhandler(vnode.attrs.state, item)}, item.label))))
                : ''
        ]
}

export const Menu = {
    oninit: vnode => vnode.state = vnode.attrs,
    view: vnode => m('aside.menu',
        vnode.state.items.map(menu => [
            m('p.menu-label', menu.label),
            m('ul.menu-list',
                menu.items.map(item =>
                    m('li', m(MenuItem, {state: vnode.state, root: item}))
                )
            )
        ])
    )
}
