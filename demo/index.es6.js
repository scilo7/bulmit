import m from "mithril"
import * as bm from '../build/bulmit.min.js'

const DataState = {
    count: 0,
    loading: false,
    page: null,

    add: () => {
        
        DataState.count += 1
        DataState.loading = true
        console.log('youuuuuuu' + DataState.count)
        bm.sleep(500).then(() => {
            DataState.loading = false
            m.redraw()
            console.log('sleep' + DataState.count)
        })
    }
}

const DemoBox = {
    view: () => m(bm.Box, 'a box')
}

const DemoButton = {
    view: () => [
        m(bm.Title, {size: 3}, 'Event handler & state'),
        m(bm.Button, {
            onclick: DataState.add,
            loading: DataState.loading,
            state: DataState.loading ? 'primary' : null,
            size: 'large',
            content: 'a button ' + DataState.count,
            icon: 'align-left', icon_right: true}),

        m(bm.Title, {size: 3}, 'Colors'),
        bm.COLORS.map(color => m(bm.Button, {color: color, content: 'a ' + color + ' button'})),

        m(bm.Title, {size: 3}, 'Colors'),
        bm.STATES.map(state => m(bm.Button, {state: state, content: 'a ' + state + ' button'})),
    ]
}

const DemoTable = {
    view: () => m(bm.Table, {
        striped: true,
        bordered: true,
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
        m(bm.Label, 'Le nom ?'),
        m(bm.Input, {placeholder: 'wooo', value: 'toto', icon: 'check'}),
        m(bm.Input, {placeholder: 'email', state: 'danger', icon: 'warning'}),
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
            state: 'danger', 'delete': true, onclick: () => console.log('click')}, 
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
        m(bm.Tag, {state: 'info'}, 'wooot'),
        m(bm.Tag, {size: 'large'}, 'big'),
    ]
}

const DemoTitle = {
    view: () => [1, 2, 3, 4, 5, 6].map(x => [
        m(bm.Title, {size: x}, 'Title ' + x),
        m(bm.SubTitle, {size: x}, 'SubTitle ' + x),
    ])
}

const DemoLevel = {
    view: () => 
        m(bm.Level, [
            m(bm.LevelItem, {centered: true}, m('div', m('p.heading', 'Twwwets'), m('p.title', '400k'))),
            m(bm.LevelItem, {centered: true}, m('div', m('p.heading', 'Following'), m('p.title', '2544'))),
            m(bm.LevelItem, {centered: true}, m('div', m('p.heading', 'Followers'), m('p.title', '879'))),
            m(bm.LevelItem, {centered: true}, m('div', m('p.heading', 'Likes'), m('p.title', '200.10'))),
        ])
}

const DemoMedia = {
    view: () => [1, 2, 3].map(x =>
        m(bm.Media, {
                image: {
                    ratio: '64x64',
                    src: 'http://bulma.io/images/placeholders/128x128.png'},
                button: m(bm.Button, {class: 'delete'})
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

const DemoNav = {
    view: () => m(bm.Nav, {
        shadow: true,
        left: [m('img[src="http://bulma.io/images/bulma-logo.png"][alt="Bulma logo"]')],
        center: [m(bm.Icon, {icon: 'github'})],
        right: ['Home', 'Docs']
    })
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


const Elements = {
    box: ['Box', DemoBox],
    button: ['Button', DemoButton],
    form: ['Form', DemoForm],
    image: ['Image', DemoImage],
    notif: ['Notification', DemoNotification],
    progress: ['Progress', DemoProgress],
    tag: ['Tag', DemoTag],
    table: ['Table', DemoTable],
    title: ['Title', DemoTitle]
}


const Components = {
    level: ['Level', DemoLevel],
    media: ['Media', DemoMedia],
    menu: ['Menu', DemoMenu],
    message: ['Message', DemoMessage],
    modal: ['Modal', DemoModal],
    nav: ['Nav', DemoNav],
    card: ['Card', DemoCard],
    pagination: ['Pagination', DemoPagination],
    panel: ['Panel', DemoPanel],
    tabs: ['Tabs', DemoTabs]
}


const Menu = {
    view: () => m(bm.Menu, {
        selected: DataState.page,
        collapsable: true,
        items: [
            {
                label: 'Demos',
                items: [
                    {   key: 'elements', label: 'Elements', 
                        items: Object.keys(Elements).map(key => {
                            return { 
                                key: key, 
                                onclick: key => DataState.page = key, 
                                label: Elements[key][0] }})
                    },
                    {   key: 'components', label: 'Components', 
                        items: Object.keys(Components).map(key => {
                            return { 
                                key: key, 
                                onclick: key => DataState.page = key, 
                                label: Components[key][0] }})
                    },
                ]
            }
        ]
    })
}

const get_demo = () => {
    console.log(DataState.page)
    if (DataState.page in Elements) return m(Elements[DataState.page][1])
    if (DataState.page in Components) return m(Components[DataState.page][1])
    return null
}

export const App = {
    view: () => 
        m('.container',
            m(bm.Title, 'Bulmit'),
            m(".columns.is-mobile", 
                m('.column.is-one-third', m(Menu)),
                m('.column', get_demo())
            )
        )
}


m.mount(document.getElementById('app'), App)