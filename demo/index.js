import m from "mithril"
import * as bm from '../src'


const DataState = {
    count: 0,
    loading: false,
    page: null,

    add: () => {

        DataState.count += 1
        DataState.loading = true
        bm.sleep(500).then(() => {
            DataState.loading = false
            m.redraw()
        })
    }
}


const DemoButton = {
    view: () => [
        m(bm.Title, {size: 2, text: 'Buttons demo'}),
        m(bm.Title, {size: 3, text: 'Event handler & state'}),
        m(bm.Button, {
            events: {onclick: DataState.add},
            loading: DataState.loading,
            state: DataState.loading ? 'primary' : null,
            size: 'large',
            text: 'click me ! ' + DataState.count,
            icon: {
                symbol: 'align-left',
                position: 'right'
            }
        }),

        m(bm.Title, {size: 3, text: 'Colors'}),
        m('div.buttons',
            bm.COLORS.map(color => m(bm.Button, {color: color, text: color + ' button'}))
        ),

        m(bm.Title, {size: 3, text: 'States'}),
        m('div.buttons',
            bm.STATES.map(state => m(bm.Button, {state: state, text: state + ' button'}))
        )
    ]
}

const DemoTable = {
    view: () => m(bm.Table, {
        striped: true,
        bordered: true,
        fullwidth: true,
        paginate_by: 6,
        header: [
            {name: 'Pos', title: 'Position'},
            {name: 'Team', sortable: true},
            {name: 'W', title: 'Won', sortable: true}
        ],
        footer: [
            {name: 'Pos', title: 'Position'},
            {name: 'Team'},
            {name: 'W', title: 'Won'}
        ],
        rows: [
            [1, 'Leicester City', 23],
            [2, 'Arsenal', 20],
            [3, 'Tottenham Hotspur', 19],
            [1, 'dd City', 23],
            [2, 'ee', 20],
            [3, 'ff Hotspur', 19],
            [1, 'gg City', 23],
            [2, 'hh', 20],
            [3, 'ii Hotspur', 19],
            [1, 'jj City', 23],
            [2, 'kk', 20],
            [3, 'll Hotspur', 19]
        ]
    })
}


const DemoForm = {
    view: () => [
        m(bm.Title, {size: 2, text: 'Forms demo'}),
        m(bm.Label, 'Le nom ?'),
        m(bm.Input, {placeholder: 'wooo', value: 'toto', icon_right: {symbol: 'check'}}),
        m(bm.Input, {placeholder: 'email', state: 'danger', icon_left: {symbol: 'warning'}}),
        m(bm.Label, 'Le choix ?'),
        m(bm.Select, {choices: [[1, 'bo'], [2, 'uu']], size: 'large'}),
        m(bm.TextArea, {placeholder: 'comments', value: 'bob', loading: true}),
        m(bm.CheckBox, {content: 'click !'}),
        m(bm.Radio, {name: 'xx', choices: [[10, 'nope'], [1, 'yeah']]})
    ]
}


const DemoImage = {
    view: () => [
        m(bm.Image, {size: 128,
            src: "http://bulma.io/images/placeholders/128x128.png"}),
        m(bm.Image, {ratio: '2by1',
            src: "http://bulma.io/images/placeholders/128x128.png"})
    ]
}


const DemoNotification = {
    view: () => m(bm.Notification, {
            state: 'danger', 'delete': true,
            events: {onclick: () => console.log('click')}},
            'What the hell !'),

}

const DemoProgress = {
    view: () => [
        m(bm.Progress, {state: 'info', 'max': 80, value: 60}),
        m(bm.Progress, {'max': 80, value: 30, size: 'large'})
    ]
}


const DemoTag = {
    view: () => [
        m(bm.Tag, {state: 'info'}, 'blue tag'),
        m(bm.Tag, {size: 'large'}, 'big tag'),
    ]
}

const DemoTitle = {
    view: () => [1, 2, 3, 4, 5, 6].map(x => [
        m(bm.Title, {size: x, text: 'Title ' + x}),
        m(bm.SubTitle, {size: x, text: 'SubTitle ' + x}),
    ])
}

const DemoLevel = {
    view: () =>
        m(bm.Level, {
            center: [
                m('div', m('p.heading', 'Twwwets'), m('p.title', '400k')),
                m('div', m('p.heading', 'Following'), m('p.title', '2544')),
                m('div', m('p.heading', 'Followers'), m('p.title', '879')),
                m('div', m('p.heading', 'Likes'), m('p.title', '200.10'))]
            }
        )
}

const DemoMedia = {
    view: () => [1, 2, 3].map(x =>
        m(bm.Media,
            {
                image: {
                    ratio: '64x64',
                    src: 'http://bulma.io/images/placeholders/128x128.png'},
                ondelete: () => alert('close me: ' + x)
            },
            m('.content', 'Media ' + x)
        )
    )
}

const DemoMenu = {
    view: () =>
        m(bm.Menu, {
            selected: 'myt',
            collapsable: true,
            items: [
                {
                    label: 'Administration',
                    items: [
                        { key: 'ts', label:'Team Settings' },
                        { key: 'myt', label: 'Manage Your Team', items: [
                            { key: 'myt1', url: '/', label: 'Members' },
                            { key: 'myt2', onclick: () => console.log('onclick !!'), label: 'Add member' }
                        ]}
                    ]
                }
            ]
        })
}

const DemoMessage = {
    view: () => [
        m(bm.Message, {color: 'warning', header: 'salut', onclose: () => console.log('yo')},
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            "Pellentesque risus mi</strong>, tempus quis placerat ut, " +
            "porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla." +
            "Nullam gravida purus diam, et dictum felis venenatis efficitur"),

        m(bm.Message, {color: 'dark'},
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            "Pellentesque risus mi</strong>, tempus quis placerat ut, " +
            "porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla." +
            "Nullam gravida purus diam, et dictum felis venenatis efficitur"),
    ]
}

const DemoModal = {
    view: () => [
        m(bm.Button, {onclick: () => DataState.active=true, text: 'launch modal'}),
        m(bm.Modal, {onclose: () => DataState.active=false, active:DataState.active},
            m('.box', 'Hello there')),
    ]
}

const DemoCard = {
    view: () => m(bm.Card, [
        m(bm.CardHeader, {icon: m(bm.Icon, {icon: 'angle-down'}), title: 'a card'}),
        m(bm.CardContent, m(bm.Content, 'Lorem ipsum dolor sit amet')),
        m(bm.CardFooter, [
            m(bm.CardFooterItem, {text: 'Save'}),
            m(bm.CardFooterItem, {text: 'Delete'})
        ])
    ])
}

const DemoPagination = {
    view: () => m(bm.Pagination,
        {nb: 100, current: 51, onclick: (nb) => console.log(nb + ' clicked')})
}


const DemoPanel = {
    view: () => m(bm.Panel, [
        m(bm.PanelHeading, 'A Panel !'),
        m(bm.PanelTabs, {items: [
            {label: 'All'},
            {label: 'Public'},
            {label: 'Private'}]}),
        m(bm.PanelBlocks, {items: [
            {label: 'marksheet', icon: 'book'},
            {label: 'minireset.css', icon: 'book'},
            {label: 'github', icon: 'code-fork'}]})
    ])
}

const DemoTabs = {
    view: () => m(bm.Tabs, {items: [
        {label: 'All', icon: 'image', content: 'blob'},
        {label: 'Public', icon: 'film', content: 'wooot'},
        {label: 'Private', content: 'prive !!'}]}
    )
}

const DemoHero = {
    view: () => m(bm.Hero, {color:'success', body: m(bm.Title, {text: 'My Hero !'})}),
}

const DemoCalendar = {
    view: () => [
        m(bm.Title, {size: 3, text: 'A plain inline calendar'}),
        m(bm.Calendar, {lang: 'fr', onclick: (dt) => console.log('selected=' + dt)}),
        m(bm.Title, {size: 3, text: 'A date picker'}),
        m(bm.DatePicker, {lang: 'fr'}),
        m(bm.Title, {size: 3, text: 'Full width calendar'}),
        m(bm.Calendar, {large: true}),
    ]
}

const DemoDivider = {
    view: () => [
        m(bm.Title, {size: 3, text: 'Horizontal divider'}),
        m('div', 'choice 1'),
        m(bm.Divider, {text: 'OU'}),
        m('div', 'choice 2'),
        m(bm.Title, {size: 3, text: 'Vertical divider'}),
        m('.columns',
            m('.column', m('div', 'choice 1')),
            m(bm.Divider, {vertical: true}),
            m('.column', m('div', 'choice 2'))
        )
    ]
}


const Elements = [
    // box: ['Box', DemoBox],
    ['Button', DemoButton],
    ['Form', DemoForm],
    ['Image', DemoImage],
    ['Notification', DemoNotification],
    ['Progress', DemoProgress],
    ['Tag', DemoTag],
    ['Table', DemoTable],
    ['Title', DemoTitle]
]


const Components = [
    ['Media', DemoMedia],
    ['Menu', DemoMenu],
    ['Message', DemoMessage],
    ['Card', DemoCard],
    ['Pagination', DemoPagination],
    ['Panel', DemoPanel],
    ['Tabs', DemoTabs]
]

const Layout = [
    ['Level', DemoLevel],
    ['Hero', DemoHero]
]

const Ext = [
    ['Calendar', DemoCalendar],
    ['Divider', DemoDivider]
]

const MenuBar = {
    view: () => m(bm.Navbar, {
        start: [

            {
                label: 'Layout',
                type: 'dropdown',
                items: Layout.map(data => {
                    return {
                        onclick: () => DataState.page = data[1],
                        label: data[0]
                    }
                })
            },
            {
                label: 'Elements',
                type: 'dropdown',
                items: Elements.map(data => {
                    return {
                        onclick: key => DataState.page = data[1],
                        label: data[0] }})
            },
            {
                label: 'Components',
                type: 'dropdown',
                items: Components.map(data => {
                    return {
                        onclick: () => DataState.page = data[1],
                        label: data[0] }})
            },
            {
                label: 'Extensions',
                type: 'dropdown',
                items: Ext.map(data => {
                    return {
                        onclick: () => DataState.page = data[1],
                        label: data[0] }})
            }
        ]
    })
}

export const App = {
    view: () => [
        m(bm.Hero, {color:'black', body: m(bm.Title, {text: 'Bulmit'})}),
        m(MenuBar),
        DataState.page ? m('section.section', m('div.container', m(DataState.page))) : ''
    ]

}


m.mount(document.getElementById('app'), App)
