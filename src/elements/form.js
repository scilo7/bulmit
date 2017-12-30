import m from "mithril"
import { Icon } from './icon.js'
import { bulmify } from '../common'

const get_icons = (attrs) =>{
    const data = {}
    const classes = []
    if (attrs.icon_left) classes.push('has-icon-left')
    if (attrs.icon_right) classes.push('has-icon-right')
    if (classes.length) {
        classes.push('has-icon')
        data.class = classes.join(' ')
    }
    return data
}

const input_modifiers = ['state', 'placeholder']


export const Label = {
    view: (vnode) => m('label.label', vnode.children)
}


export const Input = {
    view: (vnode) => m('div.control',
        get_icons(vnode.attrs), [
            m('input.input[type=text]', bulmify(vnode.attrs, input_modifiers)),
            vnode.attrs.icon_left ? m(Icon, {
                size: vnode.attrs.icon_left.size,
                symbol: vnode.attrs.icon_left.symbol,
                position: 'left'}) : null,
            vnode.attrs.icon_right ? m(Icon, {
                size: vnode.attrs.icon_right.size,
                symbol: vnode.attrs.icon_right.symbol,
                position: 'right'}) : null
        ]
    )
}

export const Select = {
    view: vnode =>
        m('div.control',
            m('div.select',
                m('select',
                    vnode.attrs.choices.map(k => m('option', {value: k[0]}, k[1]))
                )
            )
        )
}


export const TextArea = {
    view: vnode =>
        m("p.control",
            m("textarea.textarea", bulmify(vnode.attrs, []))
        )
}


export const CheckBox = {
    view: vnode =>
        m("p.control",
            m("label.checkbox",
                m("input[type='checkbox']", bulmify(vnode.attrs, [])),
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
