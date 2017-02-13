import m from "mithril"
import * as bm from '../build/bulmit.min.js'

const layout = {
    view: vnode => [
        m('section.hero.is-dark', 
            m('hero-body',
                m('.container', 
                    m(bm.Title, {size: 1}, 'Bulmit'),
                    m(bm.SubTitle, {size: 4}, m.trust('[Bulma + Mithril] = &#9825;'))
                )
            ),
            m('.hero-foot',
                m('.container', m(bm.Nav, {
                    left: [
                        m('a[href=#/api]', 'api'),
                        m('a[href=#/api]', 'demo'),
                    ],
                    right: [
                        m('a[href=https://github.com/scilo7/bulmit]', m(bm.Icon, {icon: 'github'}))
                    ]
                }))
            )
        ),
        m('.container', vnode.children)
    ]
}

export const App = {
    view: () => 
        m(layout, 'hello world')
}


m.mount(document.getElementById('app'), App)