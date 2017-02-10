import m from 'mithril';

var Box = {
    view: function (vnode) { return m('.box', vnode.children); }
};

var COLORS = ['white', 'light', 'dark', 'black', 'link'];
var STATES = ['primary', 'info', 'success', 'warning', 'danger'];
var SIZES = ['small', '', 'medium', 'large'];


var get_classes = function (state) {
    var classes = [];
    if (state.color) { classes.push('is-' + state.color); }
    if (state.state) { classes.push('is-' + state.state); }
    if (state.size) { classes.push('is-' + state.size); }
    if (state.loading) { classes.push('is-loading'); }
    if (state.hovered) { classes.push('is-hovered'); }
    if (state.focused) { classes.push('is-focused'); }

    return classes.join(' ')
};


var bulmify = function (state) {
    var classes = get_classes(state);
    var new_state = {};
    if (classes) { new_state.class = classes; }
    Object.keys(state).forEach(function (key) {
        if (['color', 'state', 'size', 'loading',
            'icon', 'content', 'hovered', 'focused'].indexOf(key) === -1)
            { new_state[key] = state[key]; }
    });
    return new_state
};

var collect_boolean = function (state, names) {
    var styles = [];
    names.forEach(function (name) {
        if (name in state && state[name] === true)
            { styles.push('is-' + name); }
    });
};


var sleep = function (time) { return new Promise(function (resolve) { return setTimeout(resolve, time); }); };


var smaller_than = function (sz) { return sz ? SIZES[SIZES.indexOf(sz) - 1] : 'small'; };

var Icon = {
    view: function (ref) {
            var attrs = ref.attrs;

            return m('span.icon', {class: attrs.size ? 'is-' + attrs.size : ''},
            m('i.fa', {class: 'fa-' + attrs.icon})
        );
}
};

var icon_button = function (vnode) { return [
    !vnode.attrs.icon_right ?
        m(Icon, {icon: vnode.attrs.icon, size: smaller_than(vnode.attrs.size)}) : '',
    m('span', vnode.attrs.content),
    vnode.attrs.icon_right ?
        m(Icon, {icon: vnode.attrs.icon, size: smaller_than(vnode.attrs.size)}) : ''
]; };

var Button = {
    view: function (vnode) { return m('a.button', bulmify(vnode.attrs),
        vnode.attrs.icon ? icon_button(vnode) : vnode.attrs.content); }
};

var Label = {
    view: function (vnode) { return m('label.label', vnode.children); }
};

var Input = {
    view: function (vnode) { return m('p.control',
        { class: vnode.attrs.icon ? 'has-icon has-icon-right' : '' },
        [
            m('input.input[type=text]', bulmify(vnode.attrs)),
            vnode.attrs.icon ? m(Icon, {size: 'small', icon: vnode.attrs.icon}) : ''
        ]
    ); }
};

var Select = {
    view: function (vnode) { return m('p.control',
            m('span.select', bulmify(vnode.attrs),
                m('select',
                    vnode.attrs.choices.map(function (k) { return m('option', {value: k[0]}, k[1]); })
                )
            )
        ); }
};


var TextArea = {
    view: function (vnode) { return m("p.control",
            m("textarea.textarea", bulmify(vnode.attrs))
        ); }
};


var CheckBox = {
    view: function (vnode) { return m("p.control",
            m("label.checkbox",
                m("input[type='checkbox']", bulmify(vnode.attrs)),
                vnode.attrs.content
            )
        ); }
};


var Radio = {
    view: function (vnode) { return m("p.control",
            vnode.attrs.choices.map(function (k) { return m("label.radio",
                    m("input[type='radio']", {value: k[0], name: vnode.attrs.name}),
                    k[1]
                ); }
            )
        ); }
};

var Image = {
    view: function (vnode) { return m('figure.image',
            {class: vnode.attrs.size ?
                'is-' + vnode.attrs.size + 'x' + vnode.attrs.size :
                'is-' + vnode.attrs.ratio},
            m('img', {src: vnode.attrs.src})); }
};

var Notification = {
    view: function (vnode) { return m(".notification", bulmify(vnode.attrs),
            vnode.attrs.delete ?
                m("button.delete", {onclick: vnode.attrs.onclick}) : '',
            vnode.children
        ); }
};

var Progress = {
    view: function (vnode) { return m("progress.progress", bulmify(vnode.attrs),
            vnode.children
        ); }
};

var onclick = function (vnode, val) { return function () {
        reset(vnode, val);
        if (vnode.attrs.onclick) { vnode.attrs.onclick(val); }
    }; };

var reset = function (vnode, val) {
    vnode.state.current = val;
    var max_buttons = vnode.attrs.max_buttons || 10;
    var nb = vnode.attrs.nb;
    if (nb > max_buttons) {
        var mid = nb / 2;
        if ([1, 2].includes(val)) { vnode.state.buttons = [1, 2, 3, null, mid, null, nb]; }
        else if ([nb-1, nb].includes(val)) { vnode.state.buttons = [1, null, mid, null, nb-2, nb-1, nb]; }
        else { vnode.state.buttons = [1, null, val - 1, val, val + 1, null, nb]; }
    } else {
        vnode.state.buttons = [];
        for (var i = 1; i <= nb; i++) { vnode.state.buttons.push(i); }
    }
};

var Pagination = {
    oninit: function (vnode) { return reset(vnode, vnode.attrs.current || 1); },

    view: function (vnode) { return m('nav.pagination',
        m('a.pagination-previous',
            {onclick: onclick(vnode, vnode.state.current - 1),
                disabled: vnode.state.current === 1},
            vnode.attrs.previous_text || 'Previous'),
        m('a.pagination-next',
            {onclick: onclick(vnode, vnode.state.current + 1),
                disabled: vnode.state.current === vnode.state.buttons.length},
            vnode.attrs.next_text || 'Next'),
        m('ul.pagination-list',
            vnode.state.buttons.map(function (val) { return val === null ?
                m('li', m('span.pagination-ellipsis', m.trust('&hellip;'))) :
                m('li', m('a.pagination-link',
                    {
                        class: vnode.state.current === val ? 'is-current' : null,
                        onclick: onclick(vnode, val)
                    }, val)); }
            )
        )
    ); }
};

var STYLES = ['bordered', 'striped', 'narrow'];

var header_col = function (vnode, item, idx) {
    var way = (idx === vnode.state.sort_by) ?
        (vnode.state.sort_asc ? ' U' : ' D') : '';
    return item.name + way
};


var th_tf = function (vnode, tag) { return m(tag === 'header' ? 'thead' : 'tfoot',
        m('tr',
            vnode.attrs[tag].map(function (item, idx) { return m('th', {onclick: item.sortable ? sorthandler(vnode, idx): null},
                    item.title ?
                        m('abbr', {title: item.title}, header_col(vnode, item, idx))
                        : header_col(vnode, item, idx)); }
            )
        )
    ); };

var comparator = function (idx) { return function (a, b) {
      if (a[idx] < b[idx])
        { return -1 }
      if (a[idx] > b[idx])
        { return 1 }
      return 0
    }; };

var sorthandler = function (vnode, idx) { return function () {
        if (vnode.state.sort_by === idx)
            { vnode.state.sort_asc = ! vnode.state.sort_asc; }
        else
            { vnode.state.sort_asc = true; }

        vnode.state.sort_by = idx;
        vnode.state.rows.sort(comparator(idx));
        if (! vnode.state.sort_asc)
            { vnode.state.rows.reverse(); }
    }; };

var Table = {

    oninit: function (vnode) {
        vnode.state.sort_by = null;
        vnode.state.sort_asc = true;
        vnode.state.rows = vnode.attrs.rows;
        if (vnode.attrs.paginate_by){
            vnode.state.page = 1;
            vnode.state.start_at = 0;
        }
        else
            { vnode.state.display_rows = vnode.attrs.rows; }
    },

    view: function (vnode) { return [
        m('table.table', {class: collect_boolean(vnode.attrs, STYLES)},
            vnode.attrs.header ? th_tf(vnode, 'header') : null,
            vnode.attrs.footer ? th_tf(vnode, 'footer') : null,
            m('tbody',
                vnode.state.rows.slice(
                    vnode.state.start_at,
                    vnode.state.start_at + vnode.attrs.paginate_by).map(function (row) { return m('tr', row.map(function (col) { return m('td', col); })); }
                )
           )
        ),

        vnode.attrs.paginate_by ?
            m(Pagination,
                {
                    nb: Math.ceil(vnode.state.rows.length / vnode.attrs.paginate_by),
                    onclick: function (nb) {
                        vnode.state.page = nb;
                        vnode.state.start_at = nb === 1 ? 0 : ((nb -1) * vnode.attrs.paginate_by);
                    }
                }
            ) : null
    ]; }
};

var Tag = {
    view: function (vnode) { return m('span.tag', bulmify(vnode.attrs), vnode.children); }
};

var Title = {
    view: function (vnode) { return m('h' + vnode.attrs.size + '.title' + '.is-' + vnode.attrs.size, vnode.children); }
};


var SubTitle = {
    view: function (vnode) { return m('h' + vnode.attrs.size + '.subtitle' + '.is-' + vnode.attrs.size, vnode.children); }
};

var Content = {
    view: function (vnode) { return m('content', {class: vnode.attrs.size ? 'is-' + vnode.attrs.size : ''},
            vnode.children
        ); }
};

var Level = {
    view: function (vnode) { return m('nav.level',
        {'is-mobile': vnode.attrs.mobile}, vnode.children); }
};





var LevelItem = {
    view: function (vnode) { return m('p.level-item',
        {class: vnode.attrs.centered ? 'has-text-centered': ''}, vnode.children); }
};

var MediaLeft = {
    view: function (vnode) { return m('figure.media-left', vnode.children); }
};

var MediaContent = {
    view: function (vnode) { return m('div.media-content', vnode.children); }
};

var MediaRight = {
    view: function (vnode) { return m('div.media-right', vnode.children); }
};

var Media = {
    view: function (vnode) { return m('article.media', [

        vnode.attrs.image ?
            m(MediaLeft, m('p.image', {class: 'is-' + vnode.attrs.image.ratio},
                m('img', {'src': vnode.attrs.image.src}))) : '',

        m(MediaContent, vnode.children),

        vnode.attrs.button ? m(MediaRight, vnode.attrs.button) : ''
    ]); }
};

var clickhandler = function (state, item) { return function () {
        state.selected = item.key;
        if (item.onclick) { item.onclick(item.key); }
    }; };


var MenuItem = {
    view: function (vnode) { return [
            m('a', {onclick: clickhandler(vnode.attrs.state, vnode.attrs.root),
                class: vnode.attrs.state.selected === vnode.attrs.root.key ? "is-active" : null},
                vnode.attrs.root.label),
            vnode.attrs.root.items ?
                m('ul', vnode.attrs.root.items.map(function (item) { return m('li', m('a', {
                        class: vnode.attrs.state.selected === item.key ? "is-active" : null,
                        onclick: clickhandler(vnode.attrs.state, item)}, item.label)); }))
                : null
        ]; }
};

var Menu = {
    oninit: function (vnode) {
        vnode.state = vnode.attrs;
        if (vnode.attrs.collapsable)
            { vnode.state.collapsed = vnode.attrs.collapsed || false; }
        console.log(vnode.state.collapsed);
    },
    view: function (vnode) { return m('aside.menu',
        vnode.state.items.map(function (menu) { return [
            m('p.menu-label', {onclick: vnode.attrs.collapsable ? 
                function () { return vnode.state.collapsed = !vnode.state.collapsed; } : null}, 
                menu.label),
            vnode.attrs.collapsable && !vnode.state.collapsed ?
                m('ul.menu-list',
                    menu.items.map(function (item) { return m('li', m(MenuItem, {state: vnode.state, root: item})); }
                    )
                ) : null
        ]; })
    ); }
};

var Message = {
    view: function (vnode) { return m('article.message',
        {class: vnode.attrs.color ? 'is-' + vnode.attrs.color : ''}, [
        vnode.attrs.header ?
            m('.message-header', m('p', vnode.attrs.header),
                vnode.attrs.onclose ? m('button',
                    {class: 'delete', onclick: vnode.attrs.onclose}): '')
        : '',
        m('.message-body', vnode.children)
    ]); }
};

var Modal = {
    view: function (vnode) { return m('.modal', {class: vnode.attrs.active ? 'is-active': ''}, [
            m('.modal-background'),
            m('.modal-content', vnode.children),
            vnode.attrs.onclose ? m('.button.modal-close', {onclick: vnode.attrs.onclose}): ''
    ]); }
};

var Nav = {
    view: function (vnode) { return m('nav.nav', [
        vnode.attrs.left ? m('.nav-left', vnode.attrs.left.map(function (item) { return m('a.nav-item', item); })) : '',
        vnode.attrs.center ? m('.nav-center', vnode.attrs.center.map(function (item) { return m('a.nav-item', item); })) : '',
        vnode.attrs.right ? m('.nav-right', vnode.attrs.right.map(function (item) { return m('a.nav-item', item); })) : ''
    ]); }
};

var CardHeader = {
    view: function (vnode) { return m('header.card-header', [
        m('p.card-header-title', vnode.attrs.title),
        m('a.card-header-icon', vnode.attrs.icon)
    ]); }
};

var CardFooter = {
    view: function (vnode) { return m('footer.card-footer', vnode.children); }
};

var CardFooterItem = {
    view: function (vnode) { return m('a.card-footer-item', vnode.attrs); }
};

var CardContent = {
    view: function (vnode) { return m('.card-content', vnode.children); }
};

var Card = {
    view: function (vnode) { return m('.card', vnode.children); }
};

var onclick$1 = function (vnode, item, idx) { return function () {
        vnode.state.active = idx;
        if (vnode.attrs.onclick) { vnode.attrs.onclick(item); }
    }; };

var TabsMenu = {
    oninit: function (vnode) { return vnode.state.active = vnode.attrs.active || 0; },

    view: function (vnode) { return m('.tabs', m('ul',
        vnode.attrs.items.map(function (item, idx) { return m('li',
                {
                    class: idx === vnode.state.active ? 'is-active' : null,
                    onclick: onclick$1(vnode, item, idx)
                },
                m('a', item.icon ? [
                    m('span.icon.is-small',
                    m('i.fa', {class: 'fa-' + item.icon})), m('span', item.label)]
                    : item.label)
            ); }
        )
    )); }
};


var clickhandler$1 = function (vnode) { return function (item) { return vnode.state.active = item.key; }; };

var Tabs = {
    oninit: function (vnode) {
        vnode.state.active = vnode.attrs.active || 0;
        vnode.state.items = vnode.attrs.items.map(function (item, idx) {
            item.key = idx;
            return item
        });
    },

    view: function (vnode) { return m('div', {style: {display: 'flex', flex: '1', width: '100%', 'flex-direction': 'column'}}, [
            m(TabsMenu, {active: vnode.state.active, onclick: clickhandler$1(vnode), items: vnode.state.items}),
            vnode.state.items.map(function (item) { return m('div',
                    {style: {display: item.key === vnode.state.active ? 'block': 'none', 'margin-left': '10px'}},
                    item.content
                ); }
            )
        ]); }

};

var onclick$2 = function (vnode, item, idx) { return function () {
        if (vnode.state.active === idx) { vnode.state.active = null; }
        else { vnode.state.active = idx; }
        if (vnode.attrs.onclick) { vnode.attrs.onclick(item); }
    }; };

var Panel = {
    view: function (vnode) { return m('nav.panel', vnode.children); }
};

var PanelHeading = {
    view: function (vnode) { return m('p.panel-heading', vnode.children); }
};

var PanelTabs = {
    oninit: function (vnode) { return vnode.state.active = vnode.attrs.active || null; },

    view: function (vnode) { return m('.panel-tabs',
        vnode.attrs.items.map(function (item, idx) { return m('a',
                {
                    class: idx === vnode.state.active ? 'is-active' : null,
                    onclick: onclick$2(vnode, item, idx)
                }, item.label
            ); }
        )
    ); }
};



var PanelBlocks = {
    oninit: function (vnode) { return vnode.state.active = vnode.attrs.active || null; },

    view: function (vnode) { return vnode.attrs.items.map(function (item, idx) { return m('a.panel-block', {
                class: idx === vnode.state.active ? 'is-active' : null,
                onclick: onclick$2(vnode, item, idx)
            }, [
            m('span.panel-icon', m('i.fa', {class: 'fa-' + item.icon})),
            item.label
        ]); }
    ); }
};

export { Box, Button, Icon, Label, Input, Select, TextArea, CheckBox, Radio, Image, Notification, Progress, Table, Tag, Title, SubTitle, Content, Level, LevelItem, Media, Menu, Message, Modal, Nav, Card, CardHeader, CardContent, CardFooter, CardFooterItem, Pagination, Tabs, Panel, PanelHeading, PanelTabs, PanelBlocks, COLORS, STATES, SIZES, get_classes, bulmify, collect_boolean, sleep, smaller_than };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uL3NyYy9lbGVtZW50cy9ib3guanMiLCIuLi9zcmMvY29tbW9uL2luZGV4LmpzIiwiLi4vc3JjL2VsZW1lbnRzL2ljb24uanMiLCIuLi9zcmMvZWxlbWVudHMvYnV0dG9uLmpzIiwiLi4vc3JjL2VsZW1lbnRzL2Zvcm0uanMiLCIuLi9zcmMvZWxlbWVudHMvaW1hZ2UuanMiLCIuLi9zcmMvZWxlbWVudHMvbm90aWZpY2F0aW9uLmpzIiwiLi4vc3JjL2VsZW1lbnRzL3Byb2dyZXNzLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvcGFnaW5hdGlvbi5qcyIsIi4uL3NyYy9lbGVtZW50cy90YWJsZS5qcyIsIi4uL3NyYy9lbGVtZW50cy90YWcuanMiLCIuLi9zcmMvZWxlbWVudHMvdGl0bGUuanMiLCIuLi9zcmMvZWxlbWVudHMvY29udGVudC5qcyIsIi4uL3NyYy9jb21wb25lbnRzL2xldmVsLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvbWVkaWEuanMiLCIuLi9zcmMvY29tcG9uZW50cy9tZW51LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvbWVzc2FnZS5qcyIsIi4uL3NyYy9jb21wb25lbnRzL21vZGFsLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvbmF2LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvY2FyZC5qcyIsIi4uL3NyYy9jb21wb25lbnRzL3RhYnMuanMiLCIuLi9zcmMvY29tcG9uZW50cy9wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5leHBvcnQgY29uc3QgQm94ID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCcuYm94Jywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuIiwiXHJcbmV4cG9ydCBjb25zdCBDT0xPUlMgPSBbJ3doaXRlJywgJ2xpZ2h0JywgJ2RhcmsnLCAnYmxhY2snLCAnbGluayddXHJcbmV4cG9ydCBjb25zdCBTVEFURVMgPSBbJ3ByaW1hcnknLCAnaW5mbycsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJ11cclxuZXhwb3J0IGNvbnN0IFNJWkVTID0gWydzbWFsbCcsICcnLCAnbWVkaXVtJywgJ2xhcmdlJ11cclxuXHJcblxyXG5leHBvcnQgY29uc3QgZ2V0X2NsYXNzZXMgPSAoc3RhdGUpID0+IHtcclxuICAgIGxldCBjbGFzc2VzID0gW11cclxuICAgIGlmIChzdGF0ZS5jb2xvcikgY2xhc3Nlcy5wdXNoKCdpcy0nICsgc3RhdGUuY29sb3IpXHJcbiAgICBpZiAoc3RhdGUuc3RhdGUpIGNsYXNzZXMucHVzaCgnaXMtJyArIHN0YXRlLnN0YXRlKVxyXG4gICAgaWYgKHN0YXRlLnNpemUpIGNsYXNzZXMucHVzaCgnaXMtJyArIHN0YXRlLnNpemUpXHJcbiAgICBpZiAoc3RhdGUubG9hZGluZykgY2xhc3Nlcy5wdXNoKCdpcy1sb2FkaW5nJylcclxuICAgIGlmIChzdGF0ZS5ob3ZlcmVkKSBjbGFzc2VzLnB1c2goJ2lzLWhvdmVyZWQnKVxyXG4gICAgaWYgKHN0YXRlLmZvY3VzZWQpIGNsYXNzZXMucHVzaCgnaXMtZm9jdXNlZCcpXHJcblxyXG4gICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3QgYnVsbWlmeSA9IChzdGF0ZSkgPT4ge1xyXG4gICAgbGV0IGNsYXNzZXMgPSBnZXRfY2xhc3NlcyhzdGF0ZSlcclxuICAgIGxldCBuZXdfc3RhdGUgPSB7fVxyXG4gICAgaWYgKGNsYXNzZXMpIG5ld19zdGF0ZS5jbGFzcyA9IGNsYXNzZXNcclxuICAgIE9iamVjdC5rZXlzKHN0YXRlKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgaWYgKFsnY29sb3InLCAnc3RhdGUnLCAnc2l6ZScsICdsb2FkaW5nJyxcclxuICAgICAgICAgICAgJ2ljb24nLCAnY29udGVudCcsICdob3ZlcmVkJywgJ2ZvY3VzZWQnXS5pbmRleE9mKGtleSkgPT09IC0xKVxyXG4gICAgICAgICAgICBuZXdfc3RhdGVba2V5XSA9IHN0YXRlW2tleV1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gbmV3X3N0YXRlXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb2xsZWN0X2Jvb2xlYW4gPSAoc3RhdGUsIG5hbWVzKSA9PiB7XHJcbiAgICBsZXQgc3R5bGVzID0gW11cclxuICAgIG5hbWVzLmZvckVhY2gobmFtZSA9PiB7XHJcbiAgICAgICAgaWYgKG5hbWUgaW4gc3RhdGUgJiYgc3RhdGVbbmFtZV0gPT09IHRydWUpXHJcbiAgICAgICAgICAgIHN0eWxlcy5wdXNoKCdpcy0nICsgbmFtZSlcclxuICAgIH0pXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3Qgc2xlZXAgPSAodGltZSkgPT5cclxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHRpbWUpKVxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBzbWFsbGVyX3RoYW4gPSAoc3opID0+IHN6ID8gU0laRVNbU0laRVMuaW5kZXhPZihzeikgLSAxXSA6ICdzbWFsbCdcclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IEljb24gPSB7XHJcbiAgICB2aWV3OiAoe2F0dHJzfSkgPT5cclxuICAgICAgICBtKCdzcGFuLmljb24nLCB7Y2xhc3M6IGF0dHJzLnNpemUgPyAnaXMtJyArIGF0dHJzLnNpemUgOiAnJ30sXHJcbiAgICAgICAgICAgIG0oJ2kuZmEnLCB7Y2xhc3M6ICdmYS0nICsgYXR0cnMuaWNvbn0pXHJcbiAgICAgICAgKVxyXG59XHJcbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuaW1wb3J0IHsgYnVsbWlmeSwgc21hbGxlcl90aGFuIH0gZnJvbSAnLi4vY29tbW9uJ1xyXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnLi9pY29uLmpzJ1xyXG5cclxuZXhwb3J0IGNvbnN0IGljb25fYnV0dG9uID0gKHZub2RlKSA9PiBbXHJcbiAgICAhdm5vZGUuYXR0cnMuaWNvbl9yaWdodCA/XHJcbiAgICAgICAgbShJY29uLCB7aWNvbjogdm5vZGUuYXR0cnMuaWNvbiwgc2l6ZTogc21hbGxlcl90aGFuKHZub2RlLmF0dHJzLnNpemUpfSkgOiAnJyxcclxuICAgIG0oJ3NwYW4nLCB2bm9kZS5hdHRycy5jb250ZW50KSxcclxuICAgIHZub2RlLmF0dHJzLmljb25fcmlnaHQgP1xyXG4gICAgICAgIG0oSWNvbiwge2ljb246IHZub2RlLmF0dHJzLmljb24sIHNpemU6IHNtYWxsZXJfdGhhbih2bm9kZS5hdHRycy5zaXplKX0pIDogJydcclxuXVxyXG5cclxuZXhwb3J0IGNvbnN0IEJ1dHRvbiA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnYS5idXR0b24nLCBidWxtaWZ5KHZub2RlLmF0dHJzKSxcclxuICAgICAgICB2bm9kZS5hdHRycy5pY29uID8gaWNvbl9idXR0b24odm5vZGUpIDogdm5vZGUuYXR0cnMuY29udGVudClcclxufVxyXG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcbmltcG9ydCB7IEljb24gfSBmcm9tICcuL2ljb24nXHJcbmltcG9ydCB7IGJ1bG1pZnkgfSBmcm9tICcuLi9jb21tb24nXHJcblxyXG5leHBvcnQgY29uc3QgTGFiZWwgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2xhYmVsLmxhYmVsJywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBJbnB1dCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgncC5jb250cm9sJyxcclxuICAgICAgICB7IGNsYXNzOiB2bm9kZS5hdHRycy5pY29uID8gJ2hhcy1pY29uIGhhcy1pY29uLXJpZ2h0JyA6ICcnIH0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBtKCdpbnB1dC5pbnB1dFt0eXBlPXRleHRdJywgYnVsbWlmeSh2bm9kZS5hdHRycykpLFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5pY29uID8gbShJY29uLCB7c2l6ZTogJ3NtYWxsJywgaWNvbjogdm5vZGUuYXR0cnMuaWNvbn0pIDogJydcclxuICAgICAgICBdXHJcbiAgICApXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTZWxlY3QgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PlxyXG4gICAgICAgIG0oJ3AuY29udHJvbCcsXHJcbiAgICAgICAgICAgIG0oJ3NwYW4uc2VsZWN0JywgYnVsbWlmeSh2bm9kZS5hdHRycyksXHJcbiAgICAgICAgICAgICAgICBtKCdzZWxlY3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLmNob2ljZXMubWFwKGsgPT4gbSgnb3B0aW9uJywge3ZhbHVlOiBrWzBdfSwga1sxXSkpXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3QgVGV4dEFyZWEgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PlxyXG4gICAgICAgIG0oXCJwLmNvbnRyb2xcIixcclxuICAgICAgICAgICAgbShcInRleHRhcmVhLnRleHRhcmVhXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKVxyXG4gICAgICAgIClcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBDaGVja0JveCA9IHtcclxuICAgIHZpZXc6IHZub2RlID0+XHJcbiAgICAgICAgbShcInAuY29udHJvbFwiLFxyXG4gICAgICAgICAgICBtKFwibGFiZWwuY2hlY2tib3hcIixcclxuICAgICAgICAgICAgICAgIG0oXCJpbnB1dFt0eXBlPSdjaGVja2JveCddXCIsIGJ1bG1pZnkodm5vZGUuYXR0cnMpKSxcclxuICAgICAgICAgICAgICAgIHZub2RlLmF0dHJzLmNvbnRlbnRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBSYWRpbyA9IHtcclxuICAgIHZpZXc6IHZub2RlID0+XHJcbiAgICAgICAgbShcInAuY29udHJvbFwiLFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5jaG9pY2VzLm1hcChrID0+XHJcbiAgICAgICAgICAgICAgICBtKFwibGFiZWwucmFkaW9cIixcclxuICAgICAgICAgICAgICAgICAgICBtKFwiaW5wdXRbdHlwZT0ncmFkaW8nXVwiLCB7dmFsdWU6IGtbMF0sIG5hbWU6IHZub2RlLmF0dHJzLm5hbWV9KSxcclxuICAgICAgICAgICAgICAgICAgICBrWzFdXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbn1cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuXG5leHBvcnQgY29uc3QgSW1hZ2UgPSB7XG4gICAgdmlldzogdm5vZGUgPT5cbiAgICAgICAgbSgnZmlndXJlLmltYWdlJyxcbiAgICAgICAgICAgIHtjbGFzczogdm5vZGUuYXR0cnMuc2l6ZSA/XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5zaXplICsgJ3gnICsgdm5vZGUuYXR0cnMuc2l6ZSA6XG4gICAgICAgICAgICAgICAgJ2lzLScgKyB2bm9kZS5hdHRycy5yYXRpb30sXG4gICAgICAgICAgICBtKCdpbWcnLCB7c3JjOiB2bm9kZS5hdHRycy5zcmN9KSlcbn1cbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGJ1bG1pZnkgfSBmcm9tICcuLi9jb21tb24nXG5cbmV4cG9ydCBjb25zdCBOb3RpZmljYXRpb24gPSB7XG4gICAgdmlldzogdm5vZGUgPT5cbiAgICAgICAgbShcIi5ub3RpZmljYXRpb25cIiwgYnVsbWlmeSh2bm9kZS5hdHRycyksXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5kZWxldGUgP1xuICAgICAgICAgICAgICAgIG0oXCJidXR0b24uZGVsZXRlXCIsIHtvbmNsaWNrOiB2bm9kZS5hdHRycy5vbmNsaWNrfSkgOiAnJyxcbiAgICAgICAgICAgIHZub2RlLmNoaWxkcmVuXG4gICAgICAgIClcbn1cbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGJ1bG1pZnkgfSBmcm9tICcuLi9jb21tb24nXG5cbmV4cG9ydCBjb25zdCBQcm9ncmVzcyA9IHtcbiAgICB2aWV3OiB2bm9kZSA9PlxuICAgICAgICBtKFwicHJvZ3Jlc3MucHJvZ3Jlc3NcIiwgYnVsbWlmeSh2bm9kZS5hdHRycyksXG4gICAgICAgICAgICB2bm9kZS5jaGlsZHJlblxuICAgICAgICApXG59XG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5cclxuY29uc3Qgb25jbGljayA9ICh2bm9kZSwgdmFsKSA9PlxyXG4gICAgKCkgPT4ge1xyXG4gICAgICAgIHJlc2V0KHZub2RlLCB2YWwpXHJcbiAgICAgICAgaWYgKHZub2RlLmF0dHJzLm9uY2xpY2spIHZub2RlLmF0dHJzLm9uY2xpY2sodmFsKVxyXG4gICAgfVxyXG5cclxuY29uc3QgcmVzZXQgPSAodm5vZGUsIHZhbCkgPT4ge1xyXG4gICAgdm5vZGUuc3RhdGUuY3VycmVudCA9IHZhbFxyXG4gICAgbGV0IG1heF9idXR0b25zID0gdm5vZGUuYXR0cnMubWF4X2J1dHRvbnMgfHwgMTBcclxuICAgIGxldCBuYiA9IHZub2RlLmF0dHJzLm5iXHJcbiAgICBpZiAobmIgPiBtYXhfYnV0dG9ucykge1xyXG4gICAgICAgIGxldCBtaWQgPSBuYiAvIDJcclxuICAgICAgICBpZiAoWzEsIDJdLmluY2x1ZGVzKHZhbCkpIHZub2RlLnN0YXRlLmJ1dHRvbnMgPSBbMSwgMiwgMywgbnVsbCwgbWlkLCBudWxsLCBuYl1cclxuICAgICAgICBlbHNlIGlmIChbbmItMSwgbmJdLmluY2x1ZGVzKHZhbCkpIHZub2RlLnN0YXRlLmJ1dHRvbnMgPSBbMSwgbnVsbCwgbWlkLCBudWxsLCBuYi0yLCBuYi0xLCBuYl1cclxuICAgICAgICBlbHNlIHZub2RlLnN0YXRlLmJ1dHRvbnMgPSBbMSwgbnVsbCwgdmFsIC0gMSwgdmFsLCB2YWwgKyAxLCBudWxsLCBuYl1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuYnV0dG9ucyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbmI7IGkrKykgdm5vZGUuc3RhdGUuYnV0dG9ucy5wdXNoKGkpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBQYWdpbmF0aW9uID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiByZXNldCh2bm9kZSwgdm5vZGUuYXR0cnMuY3VycmVudCB8fCAxKSxcclxuXHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCduYXYucGFnaW5hdGlvbicsXHJcbiAgICAgICAgbSgnYS5wYWdpbmF0aW9uLXByZXZpb3VzJyxcclxuICAgICAgICAgICAge29uY2xpY2s6IG9uY2xpY2sodm5vZGUsIHZub2RlLnN0YXRlLmN1cnJlbnQgLSAxKSxcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB2bm9kZS5zdGF0ZS5jdXJyZW50ID09PSAxfSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMucHJldmlvdXNfdGV4dCB8fCAnUHJldmlvdXMnKSxcclxuICAgICAgICBtKCdhLnBhZ2luYXRpb24tbmV4dCcsXHJcbiAgICAgICAgICAgIHtvbmNsaWNrOiBvbmNsaWNrKHZub2RlLCB2bm9kZS5zdGF0ZS5jdXJyZW50ICsgMSksXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdm5vZGUuc3RhdGUuY3VycmVudCA9PT0gdm5vZGUuc3RhdGUuYnV0dG9ucy5sZW5ndGh9LFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5uZXh0X3RleHQgfHwgJ05leHQnKSxcclxuICAgICAgICBtKCd1bC5wYWdpbmF0aW9uLWxpc3QnLFxyXG4gICAgICAgICAgICB2bm9kZS5zdGF0ZS5idXR0b25zLm1hcCh2YWwgPT4gdmFsID09PSBudWxsID9cclxuICAgICAgICAgICAgICAgIG0oJ2xpJywgbSgnc3Bhbi5wYWdpbmF0aW9uLWVsbGlwc2lzJywgbS50cnVzdCgnJmhlbGxpcDsnKSkpIDpcclxuICAgICAgICAgICAgICAgIG0oJ2xpJywgbSgnYS5wYWdpbmF0aW9uLWxpbmsnLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHZub2RlLnN0YXRlLmN1cnJlbnQgPT09IHZhbCA/ICdpcy1jdXJyZW50JyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IG9uY2xpY2sodm5vZGUsIHZhbClcclxuICAgICAgICAgICAgICAgICAgICB9LCB2YWwpKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG4gICAgKVxyXG59XHJcbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGNvbGxlY3RfYm9vbGVhbiB9IGZyb20gJy4uL2NvbW1vbidcbmltcG9ydCB7IFBhZ2luYXRpb24gfSBmcm9tICcuLi9jb21wb25lbnRzL3BhZ2luYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFUyA9IFsnYm9yZGVyZWQnLCAnc3RyaXBlZCcsICduYXJyb3cnXVxuXG5jb25zdCBoZWFkZXJfY29sID0gKHZub2RlLCBpdGVtLCBpZHgpID0+IHtcbiAgICBsZXQgd2F5ID0gKGlkeCA9PT0gdm5vZGUuc3RhdGUuc29ydF9ieSkgP1xuICAgICAgICAodm5vZGUuc3RhdGUuc29ydF9hc2MgPyAnIFUnIDogJyBEJykgOiAnJ1xuICAgIHJldHVybiBpdGVtLm5hbWUgKyB3YXlcbn1cblxuXG5jb25zdCB0aF90ZiA9ICh2bm9kZSwgdGFnKSA9PlxuICAgIG0odGFnID09PSAnaGVhZGVyJyA/ICd0aGVhZCcgOiAndGZvb3QnLFxuICAgICAgICBtKCd0cicsXG4gICAgICAgICAgICB2bm9kZS5hdHRyc1t0YWddLm1hcCgoaXRlbSwgaWR4KSA9PlxuICAgICAgICAgICAgICAgIG0oJ3RoJywge29uY2xpY2s6IGl0ZW0uc29ydGFibGUgPyBzb3J0aGFuZGxlcih2bm9kZSwgaWR4KTogbnVsbH0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udGl0bGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYWJicicsIHt0aXRsZTogaXRlbS50aXRsZX0sIGhlYWRlcl9jb2wodm5vZGUsIGl0ZW0sIGlkeCkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGhlYWRlcl9jb2wodm5vZGUsIGl0ZW0sIGlkeCkpXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICApXG5cbmNvbnN0IGNvbXBhcmF0b3IgPSBpZHggPT5cbiAgICAoYSwgYikgPT4ge1xuICAgICAgaWYgKGFbaWR4XSA8IGJbaWR4XSlcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiAoYVtpZHhdID4gYltpZHhdKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgICB9XG5cbmNvbnN0IHNvcnRoYW5kbGVyID0gKHZub2RlLCBpZHgpID0+XG4gICAgKCkgPT4ge1xuICAgICAgICBpZiAodm5vZGUuc3RhdGUuc29ydF9ieSA9PT0gaWR4KVxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuc29ydF9hc2MgPSAhIHZub2RlLnN0YXRlLnNvcnRfYXNjXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLnNvcnRfYXNjID0gdHJ1ZVxuXG4gICAgICAgIHZub2RlLnN0YXRlLnNvcnRfYnkgPSBpZHhcbiAgICAgICAgdm5vZGUuc3RhdGUucm93cy5zb3J0KGNvbXBhcmF0b3IoaWR4KSlcbiAgICAgICAgaWYgKCEgdm5vZGUuc3RhdGUuc29ydF9hc2MpXG4gICAgICAgICAgICB2bm9kZS5zdGF0ZS5yb3dzLnJldmVyc2UoKVxuICAgIH1cblxuZXhwb3J0IGNvbnN0IFRhYmxlID0ge1xuXG4gICAgb25pbml0OiB2bm9kZSA9PiB7XG4gICAgICAgIHZub2RlLnN0YXRlLnNvcnRfYnkgPSBudWxsXG4gICAgICAgIHZub2RlLnN0YXRlLnNvcnRfYXNjID0gdHJ1ZVxuICAgICAgICB2bm9kZS5zdGF0ZS5yb3dzID0gdm5vZGUuYXR0cnMucm93c1xuICAgICAgICBpZiAodm5vZGUuYXR0cnMucGFnaW5hdGVfYnkpe1xuICAgICAgICAgICAgdm5vZGUuc3RhdGUucGFnZSA9IDFcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLnN0YXJ0X2F0ID0gMFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLmRpc3BsYXlfcm93cyA9IHZub2RlLmF0dHJzLnJvd3NcbiAgICB9LFxuXG4gICAgdmlldzogdm5vZGUgPT4gW1xuICAgICAgICBtKCd0YWJsZS50YWJsZScsIHtjbGFzczogY29sbGVjdF9ib29sZWFuKHZub2RlLmF0dHJzLCBTVFlMRVMpfSxcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLmhlYWRlciA/IHRoX3RmKHZub2RlLCAnaGVhZGVyJykgOiBudWxsLFxuICAgICAgICAgICAgdm5vZGUuYXR0cnMuZm9vdGVyID8gdGhfdGYodm5vZGUsICdmb290ZXInKSA6IG51bGwsXG4gICAgICAgICAgICBtKCd0Ym9keScsXG4gICAgICAgICAgICAgICAgdm5vZGUuc3RhdGUucm93cy5zbGljZShcbiAgICAgICAgICAgICAgICAgICAgdm5vZGUuc3RhdGUuc3RhcnRfYXQsXG4gICAgICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLnN0YXJ0X2F0ICsgdm5vZGUuYXR0cnMucGFnaW5hdGVfYnkpLm1hcChyb3cgPT5cbiAgICAgICAgICAgICAgICAgICAgbSgndHInLCByb3cubWFwKGNvbCA9PiBtKCd0ZCcsIGNvbCkpKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgKVxuICAgICAgICApLFxuXG4gICAgICAgIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5ID9cbiAgICAgICAgICAgIG0oUGFnaW5hdGlvbixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5iOiBNYXRoLmNlaWwodm5vZGUuc3RhdGUucm93cy5sZW5ndGggLyB2bm9kZS5hdHRycy5wYWdpbmF0ZV9ieSksXG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IG5iID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZub2RlLnN0YXRlLnBhZ2UgPSBuYlxuICAgICAgICAgICAgICAgICAgICAgICAgdm5vZGUuc3RhdGUuc3RhcnRfYXQgPSBuYiA9PT0gMSA/IDAgOiAoKG5iIC0xKSAqIHZub2RlLmF0dHJzLnBhZ2luYXRlX2J5KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSA6IG51bGxcbiAgICBdXG59XG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcbmltcG9ydCB7IGJ1bG1pZnkgfSBmcm9tICcuLi9jb21tb24nXHJcblxyXG5leHBvcnQgY29uc3QgVGFnID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdzcGFuLnRhZycsIGJ1bG1pZnkodm5vZGUuYXR0cnMpLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5cblxuZXhwb3J0IGNvbnN0IFRpdGxlID0ge1xuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnaCcgKyB2bm9kZS5hdHRycy5zaXplICsgJy50aXRsZScgKyAnLmlzLScgKyB2bm9kZS5hdHRycy5zaXplLCB2bm9kZS5jaGlsZHJlbilcbn1cblxuXG5leHBvcnQgY29uc3QgU3ViVGl0bGUgPSB7XG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdoJyArIHZub2RlLmF0dHJzLnNpemUgKyAnLnN1YnRpdGxlJyArICcuaXMtJyArIHZub2RlLmF0dHJzLnNpemUsIHZub2RlLmNoaWxkcmVuKVxufVxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IENvbnRlbnQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+XHJcbiAgICAgICAgbSgnY29udGVudCcsIHtjbGFzczogdm5vZGUuYXR0cnMuc2l6ZSA/ICdpcy0nICsgdm5vZGUuYXR0cnMuc2l6ZSA6ICcnfSxcclxuICAgICAgICAgICAgdm5vZGUuY2hpbGRyZW5cclxuICAgICAgICApXHJcbn1cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IExldmVsID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCduYXYubGV2ZWwnLFxyXG4gICAgICAgIHsnaXMtbW9iaWxlJzogdm5vZGUuYXR0cnMubW9iaWxlfSwgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBMZXZlbExlZnQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2Rpdi5sZXZlbC1sZWZ0Jywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBMZXZlbFJpZ2h0ID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdkaXYubGV2ZWwtcmlnaHQnLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IExldmVsSXRlbSA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgncC5sZXZlbC1pdGVtJyxcclxuICAgICAgICB7Y2xhc3M6IHZub2RlLmF0dHJzLmNlbnRlcmVkID8gJ2hhcy10ZXh0LWNlbnRlcmVkJzogJyd9LCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IE1lZGlhTGVmdCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnZmlndXJlLm1lZGlhLWxlZnQnLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IE1lZGlhQ29udGVudCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnZGl2Lm1lZGlhLWNvbnRlbnQnLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IE1lZGlhUmlnaHQgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2Rpdi5tZWRpYS1yaWdodCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgTWVkaWEgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+IG0oJ2FydGljbGUubWVkaWEnLCBbXHJcblxyXG4gICAgICAgIHZub2RlLmF0dHJzLmltYWdlID9cclxuICAgICAgICAgICAgbShNZWRpYUxlZnQsIG0oJ3AuaW1hZ2UnLCB7Y2xhc3M6ICdpcy0nICsgdm5vZGUuYXR0cnMuaW1hZ2UucmF0aW99LFxyXG4gICAgICAgICAgICAgICAgbSgnaW1nJywgeydzcmMnOiB2bm9kZS5hdHRycy5pbWFnZS5zcmN9KSkpIDogJycsXHJcblxyXG4gICAgICAgIG0oTWVkaWFDb250ZW50LCB2bm9kZS5jaGlsZHJlbiksXHJcblxyXG4gICAgICAgIHZub2RlLmF0dHJzLmJ1dHRvbiA/IG0oTWVkaWFSaWdodCwgdm5vZGUuYXR0cnMuYnV0dG9uKSA6ICcnXHJcbiAgICBdKVxyXG59XHJcbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuXHJcbmNvbnN0IGNsaWNraGFuZGxlciA9IChzdGF0ZSwgaXRlbSkgPT5cclxuICAgICgpID0+IHtcclxuICAgICAgICBzdGF0ZS5zZWxlY3RlZCA9IGl0ZW0ua2V5XHJcbiAgICAgICAgaWYgKGl0ZW0ub25jbGljaykgaXRlbS5vbmNsaWNrKGl0ZW0ua2V5KVxyXG4gICAgfVxyXG5cclxuXHJcbmNvbnN0IE1lbnVJdGVtID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT5cclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIG0oJ2EnLCB7b25jbGljazogY2xpY2toYW5kbGVyKHZub2RlLmF0dHJzLnN0YXRlLCB2bm9kZS5hdHRycy5yb290KSxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5hdHRycy5zdGF0ZS5zZWxlY3RlZCA9PT0gdm5vZGUuYXR0cnMucm9vdC5rZXkgPyBcImlzLWFjdGl2ZVwiIDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICB2bm9kZS5hdHRycy5yb290LmxhYmVsKSxcclxuICAgICAgICAgICAgdm5vZGUuYXR0cnMucm9vdC5pdGVtcyA/XHJcbiAgICAgICAgICAgICAgICBtKCd1bCcsIHZub2RlLmF0dHJzLnJvb3QuaXRlbXMubWFwKGl0ZW0gPT5cclxuICAgICAgICAgICAgICAgICAgICBtKCdsaScsIG0oJ2EnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB2bm9kZS5hdHRycy5zdGF0ZS5zZWxlY3RlZCA9PT0gaXRlbS5rZXkgPyBcImlzLWFjdGl2ZVwiIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY2xpY2toYW5kbGVyKHZub2RlLmF0dHJzLnN0YXRlLCBpdGVtKX0sIGl0ZW0ubGFiZWwpKSkpXHJcbiAgICAgICAgICAgICAgICA6IG51bGxcclxuICAgICAgICBdXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBNZW51ID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUgPSB2bm9kZS5hdHRyc1xyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5jb2xsYXBzYWJsZSlcclxuICAgICAgICAgICAgdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gdm5vZGUuYXR0cnMuY29sbGFwc2VkIHx8wqBmYWxzZVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHZub2RlLnN0YXRlLmNvbGxhcHNlZClcclxuICAgIH0sXHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCdhc2lkZS5tZW51JyxcclxuICAgICAgICB2bm9kZS5zdGF0ZS5pdGVtcy5tYXAobWVudSA9PiBbXHJcbiAgICAgICAgICAgIG0oJ3AubWVudS1sYWJlbCcsIHtvbmNsaWNrOiB2bm9kZS5hdHRycy5jb2xsYXBzYWJsZSA/IFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdm5vZGUuc3RhdGUuY29sbGFwc2VkID0gIXZub2RlLnN0YXRlLmNvbGxhcHNlZCA6IG51bGx9LCBcclxuICAgICAgICAgICAgICAgIG1lbnUubGFiZWwpLFxyXG4gICAgICAgICAgICB2bm9kZS5hdHRycy5jb2xsYXBzYWJsZSAmJiAhdm5vZGUuc3RhdGUuY29sbGFwc2VkID9cclxuICAgICAgICAgICAgICAgIG0oJ3VsLm1lbnUtbGlzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5pdGVtcy5tYXAoaXRlbSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsaScsIG0oTWVudUl0ZW0sIHtzdGF0ZTogdm5vZGUuc3RhdGUsIHJvb3Q6IGl0ZW19KSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApIDogbnVsbFxyXG4gICAgICAgIF0pXHJcbiAgICApXHJcbn1cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IE1lc3NhZ2UgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCdhcnRpY2xlLm1lc3NhZ2UnLFxyXG4gICAgICAgIHtjbGFzczogdm5vZGUuYXR0cnMuY29sb3IgPyAnaXMtJyArIHZub2RlLmF0dHJzLmNvbG9yIDogJyd9LCBbXHJcbiAgICAgICAgdm5vZGUuYXR0cnMuaGVhZGVyID9cclxuICAgICAgICAgICAgbSgnLm1lc3NhZ2UtaGVhZGVyJywgbSgncCcsIHZub2RlLmF0dHJzLmhlYWRlciksXHJcbiAgICAgICAgICAgICAgICB2bm9kZS5hdHRycy5vbmNsb3NlID8gbSgnYnV0dG9uJyxcclxuICAgICAgICAgICAgICAgICAgICB7Y2xhc3M6ICdkZWxldGUnLCBvbmNsaWNrOiB2bm9kZS5hdHRycy5vbmNsb3NlfSk6ICcnKVxyXG4gICAgICAgIDogJycsXHJcbiAgICAgICAgbSgnLm1lc3NhZ2UtYm9keScsIHZub2RlLmNoaWxkcmVuKVxyXG4gICAgXSlcclxufVxyXG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXHJcblxyXG5leHBvcnQgY29uc3QgTW9kYWwgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCcubW9kYWwnLCB7Y2xhc3M6IHZub2RlLmF0dHJzLmFjdGl2ZSA/ICdpcy1hY3RpdmUnOiAnJ30sIFtcclxuICAgICAgICAgICAgbSgnLm1vZGFsLWJhY2tncm91bmQnKSxcclxuICAgICAgICAgICAgbSgnLm1vZGFsLWNvbnRlbnQnLCB2bm9kZS5jaGlsZHJlbiksXHJcbiAgICAgICAgICAgIHZub2RlLmF0dHJzLm9uY2xvc2UgPyBtKCcuYnV0dG9uLm1vZGFsLWNsb3NlJywge29uY2xpY2s6IHZub2RlLmF0dHJzLm9uY2xvc2V9KTogJydcclxuICAgIF0pXHJcbn1cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5cclxuZXhwb3J0IGNvbnN0IE5hdiA9IHtcclxuICAgIHZpZXc6IHZub2RlID0+IG0oJ25hdi5uYXYnLCBbXHJcbiAgICAgICAgdm5vZGUuYXR0cnMubGVmdCA/IG0oJy5uYXYtbGVmdCcsIHZub2RlLmF0dHJzLmxlZnQubWFwKGl0ZW0gPT4gbSgnYS5uYXYtaXRlbScsIGl0ZW0pKSkgOiAnJyxcclxuICAgICAgICB2bm9kZS5hdHRycy5jZW50ZXIgPyBtKCcubmF2LWNlbnRlcicsIHZub2RlLmF0dHJzLmNlbnRlci5tYXAoaXRlbSA9PiBtKCdhLm5hdi1pdGVtJywgaXRlbSkpKSA6ICcnLFxyXG4gICAgICAgIHZub2RlLmF0dHJzLnJpZ2h0ID8gbSgnLm5hdi1yaWdodCcsIHZub2RlLmF0dHJzLnJpZ2h0Lm1hcChpdGVtID0+IG0oJ2EubmF2LWl0ZW0nLCBpdGVtKSkpIDogJydcclxuICAgIF0pXHJcbn1cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnLi4vZWxlbWVudHMvaWNvbi5qcydcclxuXHJcbmV4cG9ydCBjb25zdCBDYXJkSW1hZ2UgPSB7XHJcbiAgICB2aWV3OiAodm5vZGUpID0+XHJcbiAgICAgICAgbSgnY2FyZC1pbWFnZScsXHJcbiAgICAgICAgICAgIG0oJ2ZpZ3VyZS5pbWFnZScsIHtjbGFzczogJ2lzLScgKyB2bm9kZS5hdHRycy5yYXRpb30sXHJcbiAgICAgICAgICAgICAgICBtKCdpbWcnLCB7c3JjOiB2bm9kZS5hdHRycy5zcmN9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgQ2FyZEhlYWRlciA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT4gbSgnaGVhZGVyLmNhcmQtaGVhZGVyJywgW1xyXG4gICAgICAgIG0oJ3AuY2FyZC1oZWFkZXItdGl0bGUnLCB2bm9kZS5hdHRycy50aXRsZSksXHJcbiAgICAgICAgbSgnYS5jYXJkLWhlYWRlci1pY29uJywgdm5vZGUuYXR0cnMuaWNvbilcclxuICAgIF0pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBDYXJkRm9vdGVyID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdmb290ZXIuY2FyZC1mb290ZXInLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IENhcmRGb290ZXJJdGVtID0ge1xyXG4gICAgdmlldzogKHZub2RlKSA9PiBtKCdhLmNhcmQtZm9vdGVyLWl0ZW0nLCB2bm9kZS5hdHRycylcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IENhcmRDb250ZW50ID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT4gbSgnLmNhcmQtY29udGVudCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgQ2FyZCA9IHtcclxuICAgIHZpZXc6ICh2bm9kZSkgPT5cclxuICAgICAgICBtKCcuY2FyZCcsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcbiIsImltcG9ydCBtIGZyb20gXCJtaXRocmlsXCJcclxuaW1wb3J0IHsgSWNvbiB9IGZyb20gJy4uL2VsZW1lbnRzL2ljb24uanMnXHJcblxyXG5jb25zdCBvbmNsaWNrID0gKHZub2RlLCBpdGVtLCBpZHgpID0+XHJcbiAgICAoKSA9PiB7XHJcbiAgICAgICAgdm5vZGUuc3RhdGUuYWN0aXZlID0gaWR4XHJcbiAgICAgICAgaWYgKHZub2RlLmF0dHJzLm9uY2xpY2spIHZub2RlLmF0dHJzLm9uY2xpY2soaXRlbSlcclxuICAgIH1cclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzTWVudSA9IHtcclxuICAgIG9uaW5pdDogdm5vZGUgPT4gdm5vZGUuc3RhdGUuYWN0aXZlID0gdm5vZGUuYXR0cnMuYWN0aXZlIHx8IDAsXHJcblxyXG4gICAgdmlldzogdm5vZGUgPT4gbSgnLnRhYnMnLCBtKCd1bCcsXHJcbiAgICAgICAgdm5vZGUuYXR0cnMuaXRlbXMubWFwKChpdGVtLCBpZHgpID0+XHJcbiAgICAgICAgICAgIG0oJ2xpJyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogaWR4ID09PSB2bm9kZS5zdGF0ZS5hY3RpdmUgPyAnaXMtYWN0aXZlJyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogb25jbGljayh2bm9kZSwgaXRlbSwgaWR4KVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG0oJ2EnLCBpdGVtLmljb24gPyBbXHJcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5pY29uLmlzLXNtYWxsJyxcclxuICAgICAgICAgICAgICAgICAgICBtKCdpLmZhJywge2NsYXNzOiAnZmEtJyArIGl0ZW0uaWNvbn0pKSwgbSgnc3BhbicsIGl0ZW0ubGFiZWwpXVxyXG4gICAgICAgICAgICAgICAgICAgIDogaXRlbS5sYWJlbClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICkpXHJcbn1cclxuXHJcblxyXG5jb25zdCBjbGlja2hhbmRsZXIgPSB2bm9kZSA9PlxyXG4gICAgaXRlbSA9PiB2bm9kZS5zdGF0ZS5hY3RpdmUgPSBpdGVtLmtleVxyXG5cclxuZXhwb3J0IGNvbnN0IFRhYnMgPSB7XHJcbiAgICBvbmluaXQ6IHZub2RlID0+IHtcclxuICAgICAgICB2bm9kZS5zdGF0ZS5hY3RpdmUgPSB2bm9kZS5hdHRycy5hY3RpdmUgfHwgMFxyXG4gICAgICAgIHZub2RlLnN0YXRlLml0ZW1zID0gdm5vZGUuYXR0cnMuaXRlbXMubWFwKChpdGVtLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgaXRlbS5rZXkgPSBpZHhcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1cclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICB2aWV3OiB2bm9kZSA9PlxyXG4gICAgICAgIG0oJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4JywgZmxleDogJzEnLCB3aWR0aDogJzEwMCUnLCAnZmxleC1kaXJlY3Rpb24nOiAnY29sdW1uJ319LCBbXHJcbiAgICAgICAgICAgIG0oVGFic01lbnUsIHthY3RpdmU6IHZub2RlLnN0YXRlLmFjdGl2ZSwgb25jbGljazogY2xpY2toYW5kbGVyKHZub2RlKSwgaXRlbXM6IHZub2RlLnN0YXRlLml0ZW1zfSksXHJcbiAgICAgICAgICAgIHZub2RlLnN0YXRlLml0ZW1zLm1hcChpdGVtID0+XHJcbiAgICAgICAgICAgICAgICBtKCdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgIHtzdHlsZToge2Rpc3BsYXk6IGl0ZW0ua2V5ID09PSB2bm9kZS5zdGF0ZS5hY3RpdmUgPyAnYmxvY2snOiAnbm9uZScsICdtYXJnaW4tbGVmdCc6ICcxMHB4J319LFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY29udGVudFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgXSlcclxuXHJcbn1cclxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxyXG5pbXBvcnQgeyBJY29uIH0gZnJvbSAnLi4vZWxlbWVudHMvaWNvbi5qcydcclxuXHJcbmNvbnN0IG9uY2xpY2sgPSAodm5vZGUsIGl0ZW0sIGlkeCkgPT5cclxuICAgICgpID0+IHtcclxuICAgICAgICBpZiAodm5vZGUuc3RhdGUuYWN0aXZlID09PSBpZHgpIHZub2RlLnN0YXRlLmFjdGl2ZSA9IG51bGxcclxuICAgICAgICBlbHNlIHZub2RlLnN0YXRlLmFjdGl2ZSA9IGlkeFxyXG4gICAgICAgIGlmICh2bm9kZS5hdHRycy5vbmNsaWNrKSB2bm9kZS5hdHRycy5vbmNsaWNrKGl0ZW0pXHJcbiAgICB9XHJcblxyXG5leHBvcnQgY29uc3QgUGFuZWwgPSB7XHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCduYXYucGFuZWwnLCB2bm9kZS5jaGlsZHJlbilcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFBhbmVsSGVhZGluZyA9IHtcclxuICAgIHZpZXc6IHZub2RlID0+IG0oJ3AucGFuZWwtaGVhZGluZycsIHZub2RlLmNoaWxkcmVuKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUGFuZWxUYWJzID0ge1xyXG4gICAgb25pbml0OiB2bm9kZSA9PiB2bm9kZS5zdGF0ZS5hY3RpdmUgPSB2bm9kZS5hdHRycy5hY3RpdmUgfHwgbnVsbCxcclxuXHJcbiAgICB2aWV3OiB2bm9kZSA9PiBtKCcucGFuZWwtdGFicycsXHJcbiAgICAgICAgdm5vZGUuYXR0cnMuaXRlbXMubWFwKChpdGVtLCBpZHgpID0+XHJcbiAgICAgICAgICAgIG0oJ2EnLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBpZHggPT09IHZub2RlLnN0YXRlLmFjdGl2ZSA/ICdpcy1hY3RpdmUnIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBvbmNsaWNrKHZub2RlLCBpdGVtLCBpZHgpXHJcbiAgICAgICAgICAgICAgICB9LCBpdGVtLmxhYmVsXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICApXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBQYW5lbEJsb2NrID0ge1xyXG4gICAgdmlldzogdm5vZGUgPT4gbSgnLnBhbmVsLWJsb2NrJywgdm5vZGUuY2hpbGRyZW4pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBQYW5lbEJsb2NrcyA9IHtcclxuICAgIG9uaW5pdDogdm5vZGUgPT4gdm5vZGUuc3RhdGUuYWN0aXZlID0gdm5vZGUuYXR0cnMuYWN0aXZlIHx8IG51bGwsXHJcblxyXG4gICAgdmlldzogdm5vZGUgPT4gdm5vZGUuYXR0cnMuaXRlbXMubWFwKChpdGVtLCBpZHgpID0+XHJcbiAgICAgICAgbSgnYS5wYW5lbC1ibG9jaycsIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBpZHggPT09IHZub2RlLnN0YXRlLmFjdGl2ZSA/ICdpcy1hY3RpdmUnIDogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9uY2xpY2s6IG9uY2xpY2sodm5vZGUsIGl0ZW0sIGlkeClcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICBtKCdzcGFuLnBhbmVsLWljb24nLCBtKCdpLmZhJywge2NsYXNzOiAnZmEtJyArIGl0ZW0uaWNvbn0pKSxcclxuICAgICAgICAgICAgaXRlbS5sYWJlbFxyXG4gICAgICAgIF0pXHJcbiAgICApXHJcbn1cclxuIl0sIm5hbWVzIjpbImNvbnN0IiwibGV0Iiwib25jbGljayIsImNsaWNraGFuZGxlciJdLCJtYXBwaW5ncyI6Ijs7QUFFT0EsSUFBTSxHQUFHLEdBQUc7SUFDZixJQUFJLEVBQUUsVUFBQyxLQUFLLEVBQUUsU0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBQTtDQUM3QyxDQUFBOztBQ0hNQSxJQUFNLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNqRSxBQUFPQSxJQUFNLE1BQU0sR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN6RSxBQUFPQSxJQUFNLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBOzs7QUFHckQsQUFBT0EsSUFBTSxXQUFXLEdBQUcsVUFBQyxLQUFLLEVBQUU7SUFDL0JDLElBQUksT0FB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Q0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQSxFQUFBO2FBQ3pFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQSxFQUFBO2FBQ3hGLEVBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBLEVBQUE7S0FDeEUsTUFBTTtRQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTtRQUN4QixLQUFLQSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxFQUFBO0tBQzVEO0NBQ0osQ0FBQTs7QUFFRCxBQUFPRCxJQUFNLFVBQVUsR0FBRztJQUN0QixNQUFNLEVBQUUsVUFBQSxLQUFLLEVBQUMsU0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFBOztJQUV2RCxJQUFJLEVBQUUsVUFBQSxLQUFL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
