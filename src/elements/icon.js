import m from "mithril"

export const Icon = {
    view: ({attrs}) =>
        m('span.icon', {class: attrs.size ? 'is-' + attrs.size : ''},
            m('i.fa', {class: 'fa-' + attrs.icon})
        )
}
