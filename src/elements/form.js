import m from "mithril"
import { Icon } from './icon'
import { bulmify } from '../common'

export const Label = {
    view: (vnode) => m('label.label', vnode.children)
}

export const Input = {
    view: (vnode) => m('p.control',
        { class: vnode.attrs.icon ? 'has-icon has-icon-right' : '' },
        [
            m('input.input[type=text]', bulmify(vnode.attrs)),
            vnode.attrs.icon ? m(Icon, {size: 'small', icon: vnode.attrs.icon}) : ''
        ]
    )
}

export const Select = {
    view: vnode =>
        m('p.control',
            m('span.select', bulmify(vnode.attrs),
                m('select',
                    vnode.attrs.choices.map(k => m('option', {value: k[0]}, k[1]))
                )
            )
        )
}


export const TextArea = {
    view: vnode =>
        m("p.control",
            m("textarea.textarea", bulmify(vnode.attrs))
        )
}


export const CheckBox = {
    view: vnode =>
        m("p.control",
            m("label.checkbox",
                m("input[type='checkbox']", bulmify(vnode.attrs)),
                vnode.attrs.content
            )
        )
}


export const Radio = {
    view: vnode =>
        m("p.control",
            vnode.attrs.choices.map(k =>
                m("label.radio",
                    m("input[type='radio']", {value: k[0], name: vnode.attrs.name}),
                    k[1]
                )
            )
        )
}
