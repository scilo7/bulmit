import m from "mithril"
import stream from "mithril/stream"


const clickhandler = (item, active_item) =>
    () => {
        // active_item(item.key)
        if ('onclick' in item)
            item.onclick()
    }

const get_item = (item, active_item) => {

    const attrs = {
        // class: (item.key && item.key === active_item()) ? 'is-active' : null,
        onclick: clickhandler(item, active_item)
    }

    switch (item.type) {
        case 'dropdown':
            return m('div.navbar-item.has-dropdown.is-hoverable', attrs,
                m('a.navbar-link', item.label),
                m('div.navbar-dropdown',
                    item.items.map(subitem => get_item(subitem, active_item))
                )
            )
        case 'anything':
            return m('a.navbar-item', attrs, item.content)
        default:
            return m('a.navbar-item', attrs, item.label)
    }
}

export const Navbar = {
    oninit: vnode => {
        vnode.state.active = stream(null)
        vnode.state.expanded = false
    },

    view: vnode =>
        m('nav.navbar[role="navigation"][aria-label="main navigation"]',

            m('div.navbar-brand',
                m('a.navbar-item',
                    m('a', {href: "https://bulma.io"},
                        m('img', {src: 'https://bulma.io/images/bulma-logo.png', width: 112, height:28})
                    )
                ),
                m('button.button.navbar-burger',
                    {class: vnode.state.expanded ? 'is-active' : null,
                    onclick: () => vnode.state.expanded = !vnode.state.expanded },
                    m('span'), m('span'), m('span')
                )
            ),
            m('div.navbar-menu', {class: vnode.state.expanded ? 'is-active' : null },
                vnode.attrs.start ?
                    m('div.navbar-start', vnode.attrs.start.map(item => get_item(item, vnode.state.active)))
                    : null,
                vnode.attrs.end ?
                    m('div.navbar-end', vnode.attrs.end.map(item => get_item(item, vnode.state.active)))
                    : null,
            )
        )
}
