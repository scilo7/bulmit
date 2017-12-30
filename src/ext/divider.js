import m from "mithril"
import 'bulma-divider/bulma-divider.min.css'

export const Divider = {
    view: vnode => m('div', 
        {
            'data-content': vnode.attrs.text || "OR",
            class: vnode.attrs.vertical ? 'is-divider-vertical' : 'is-divider'
        }
    )
}