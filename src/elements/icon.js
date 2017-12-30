import m from "mithril"
import { bulmify } from '../common'

const modifiers = ['size', 'position']


export const Icon = {
    view: ({attrs}) =>
        m('span.icon', bulmify(attrs, modifiers),
            m('i.fa', {class: 'fa-' + attrs.symbol})
        )
}
