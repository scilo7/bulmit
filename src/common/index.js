
export const COLORS = ['white', 'light', 'dark', 'black', 'link']
export const STATES = ['primary', 'info', 'success', 'warning', 'danger']
export const SIZES = ['small', '', 'medium', 'large']


export const get_classes = (state) => {
    let classes = []
    if (state.color) classes.push('is-' + state.color)
    if (state.state) classes.push('is-' + state.state)
    if (state.size) classes.push('is-' + state.size)
    if (state.loading) classes.push('is-loading')
    if (state.hovered) classes.push('is-hovered')
    if (state.focused) classes.push('is-focused')

    return classes.join(' ')
}


export const bulmify = (state) => {
    let classes = get_classes(state)
    let new_state = {}
    if (classes) new_state.class = classes
    Object.keys(state).forEach(key => {
        if (['color', 'state', 'size', 'loading',
            'icon', 'content', 'hovered', 'focused'].indexOf(key) === -1)
            new_state[key] = state[key]
    })
    return new_state
}

export const collect_boolean = (state, names) => {
    let styles = []
    names.forEach(name => {
        if (name in state && state[name] === true)
            styles.push('is-' + name)
    })
}


export const sleep = (time) =>
    new Promise((resolve) => setTimeout(resolve, time))


export const smaller_than = (sz) => sz ? SIZES[SIZES.indexOf(sz) - 1] : 'small'
