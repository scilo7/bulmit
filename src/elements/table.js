import m from "mithril"
import { collect_boolean } from '../common'
import { Pagination } from '../components/pagination.js'

const STYLES = ['bordered', 'striped', 'narrow']

const header_col = (vnode, item, idx) => {
    let way = (idx === vnode.state.sort_by) ?
        (vnode.state.sort_asc ? ' U' : ' D') : ''
    return item.name + way
}


const th_tf = (vnode, tag) =>
    m(tag === 'header' ? 'thead' : 'tfoot',
        m('tr',
            vnode.attrs[tag].map((item, idx) =>
                m('th', {onclick: item.sortable ? sorthandler(vnode, idx): null},
                    item.title ?
                        m('abbr', {title: item.title}, header_col(vnode, item, idx))
                        : header_col(vnode, item, idx))
            )
        )
    )

const comparator = idx =>
    (a, b) => {
      if (a[idx] < b[idx])
        return -1
      if (a[idx] > b[idx])
        return 1
      return 0
    }

const sorthandler = (vnode, idx) =>
    () => {
        if (vnode.state.sort_by === idx)
            vnode.state.sort_asc = ! vnode.state.sort_asc
        else
            vnode.state.sort_asc = true

        vnode.state.sort_by = idx
        vnode.state.rows.sort(comparator(idx))
        if (! vnode.state.sort_asc)
            vnode.state.rows.reverse()
    }

export const Table = {

    oninit: vnode => {
        vnode.state.sort_by = null
        vnode.state.sort_asc = true
        vnode.state.rows = vnode.attrs.rows
        if (vnode.attrs.paginate_by){
            vnode.state.page = 1
            vnode.state.start_at = 0
        }
        else
            vnode.state.display_rows = vnode.attrs.rows
    },

    view: vnode => [
        m('table.table', {class: collect_boolean(vnode.attrs, STYLES)},
            vnode.attrs.header ? th_tf(vnode, 'header') : null,
            vnode.attrs.footer ? th_tf(vnode, 'footer') : null,
            m('tbody',
                vnode.state.rows.slice(
                    vnode.state.start_at,
                    vnode.state.start_at + vnode.attrs.paginate_by).map(row =>
                    m('tr', row.map(col => m('td', col)))
                )
           )
        ),

        vnode.attrs.paginate_by ?
            m(Pagination,
                {
                    nb: Math.ceil(vnode.state.rows.length / vnode.attrs.paginate_by),
                    onclick: nb => {
                        vnode.state.page = nb
                        vnode.state.start_at = nb === 1 ? 0 : ((nb -1) * vnode.attrs.paginate_by)
                    }
                }
            ) : null
    ]
}
