
const unprefixed_modifiers = ['has-icon', 'has-icon-left', 'has_icon_right', 'delete']
const binary_modifiers = ['color', 'state', 'size']
const boolean_modifiers = ['outlined', 'inverted', 'hovered', 'focused',
    'active', 'loading', 'static', 'disabled',
    'bordered', 'striped', 'narrow', 'hoverable', 'fullwidth', 'bold']
const events = ['onclick']

export const COLORS = ['white', 'light', 'dark', 'black', 'text']
export const STATES = ['primary', 'link', 'info', 'success', 'warning', 'danger']
export const SIZES = ['small', '', 'medium', 'large']

export const bulmify = (attrs, modifiers) => {
    const classes = attrs.class || []
    const data = {}

    modifiers.forEach(mod =>{
        if (mod in attrs){
            if (binary_modifiers.includes(mod))
                classes.push('is-' + attrs[mod])
            else if (unprefixed_modifiers.includes(mod))
                classes.push(mod)
            else if (boolean_modifiers.includes(mod) && attrs[mod] === true)
                classes.push('is-' + mod)
            else data[mod] = attrs[mod]
        }
    })

    if ('events' in attrs) Object.assign(data, attrs.events)
    if ('onclick' in attrs) data.onclick = attrs.onclick
    if ('value' in attrs) data.value = attrs.value
    if ('style' in attrs) data.style = attrs.style
    if (classes && classes.length) data.class = classes.join(' ')
    return data
}


export const sleep = (time) =>
    new Promise((resolve) => setTimeout(resolve, time))


export const smaller_than = (sz) => sz ? SIZES[SIZES.indexOf(sz) - 1] : 'small'
