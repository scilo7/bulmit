import m from "mithril"


const onclick = (vnode, val) =>
    () => {
        reset(vnode, val)
        if (vnode.attrs.onclick) vnode.attrs.onclick(val)
    }

const reset = (vnode, val) => {
    vnode.state.current = val
    let max_buttons = vnode.attrs.max_buttons || 10
    let nb = vnode.attrs.nb
    if (nb > max_buttons) {
        let mid = nb / 2
        if ([1, 2].includes(val)) vnode.state.buttons = [1, 2, 3, null, mid, null, nb]
        else if ([nb-1, nb].includes(val)) vnode.state.buttons = [1, null, mid, null, nb-2, nb-1, nb]
        else vnode.state.buttons = [1, null, val - 1, val, val + 1, null, nb]
    } else {
        vnode.state.buttons = []
        for (let i = 1; i <= nb; i++) vnode.state.buttons.push(i)
    }
}

export const Pagination = {
    oninit: vnode => reset(vnode, vnode.attrs.current || 1),

    view: vnode => m('nav.pagination',
        m('a.pagination-previous',
            {onclick: onclick(vnode, vnode.state.current - 1),
                disabled: vnode.state.current === 1},
            vnode.attrs.previous_text || 'Previous'),
        m('a.pagination-next',
            {onclick: onclick(vnode, vnode.state.current + 1),
                disabled: vnode.state.current === vnode.state.buttons.length},
            vnode.attrs.next_text || 'Next'),
        m('ul.pagination-list',
            vnode.state.buttons.map(val => val === null ?
                m('li', m('span.pagination-ellipsis', m.trust('&hellip;'))) :
                m('li', m('a.pagination-link',
                    {
                        class: vnode.state.current === val ? 'is-current' : null,
                        onclick: onclick(vnode, val)
                    }, val))
            )
        )
    )
}
