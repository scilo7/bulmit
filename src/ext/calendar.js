import m from "mithril"
import startOfMonth from 'date-fns/start_of_month'
import endOfMonth from 'date-fns/end_of_month'
import startOfWeek from 'date-fns/start_of_week'
import endOfWeek from 'date-fns/end_of_week'
import eachDay from 'date-fns/each_day'
import isSameDay from 'date-fns/is_same_day'
import subMonths from 'date-fns/sub_months'
import addMonths from 'date-fns/add_months'
import addYears from 'date-fns/add_years'
import subYears from 'date-fns/sub_years'
import { Input } from '../elements/form.js'
import format from 'date-fns/format'

import 'bulma-calendar/bulma-calendar.min.css'

const langs = {
    en: {
      weekStart: 0,
      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
      today : 'today',
      format: 'MM/DD/YYYY',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    fr: {
      weekStart: 1,
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      format: 'DD/MM/YYYY',
      today: "aujourd'hui",
      months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthsShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Auo', 'Sep', 'Oct', 'Nov', 'Déc'],
      weekdays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      weekdaysShort: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    },
}

const CalNav = {
  view: vnode => 
    m(".calendar-nav", [          
      m(".calendar-nav-left", 
          m("button.button.is-text", {onclick: vnode.attrs.on_previous_year},
              m("i.fa.fa-backward")
          ),
          m("button.button.is-text", {onclick: vnode.attrs.on_previous_month},
              m("i.fa.fa-chevron-left")
          )
      ),
      m("div", vnode.attrs.label),
      m(".calendar-nav-right", 
          m("button.button.is-text", {onclick: vnode.attrs.on_next_month},
              m("i.fa.fa-chevron-right")
          ),
          m("button.button.is-text", {onclick: vnode.attrs.on_next_year},
              m("i.fa.fa-forward")
          )
      ),
          
    ])
}

const month_year = vnode => {
  const short = langs[vnode.state.lang].monthsShort[vnode.state.date.getMonth()]
  return short + ' ' + vnode.state.date.getFullYear()
}

const get_dates = (date, week_starts_on) => {
  // return dates to diplay in a calendar view
  const start = startOfWeek(startOfMonth(date), {weekStartsOn: week_starts_on}) 
  const end = endOfWeek(endOfMonth(date), {weekStartsOn: week_starts_on})
  return eachDay(start, end)

}

const get_attrs = (vnode, dt) => {
  const classes = []
  const attrs = {}
  if (dt.getMonth() !== vnode.state.date.getMonth()){
    classes.push('is-disabled')
  }
  if (isSameDay(dt, vnode.state.selected)){
    classes.push('tooltip')
    attrs['data-tooltip'] = 'selection' //langs[vnode.state.lang].today || "Today"
  }
  if (classes){
    attrs['class'] = classes.join(' ')
  }
  return attrs
}

export const Calendar = {

    oninit: vnode => {
      vnode.state.selected = vnode.attrs.date || new Date()
      vnode.state.date = startOfMonth(vnode.state.selected)
      vnode.state.lang = vnode.attrs.lang || 'en'
    },

    view: vnode => 
      m(".calendar", 
        {
          style: vnode.attrs.style,
          class: vnode.attrs.large ? 'is-large' : ''
        },
        m(CalNav, 
          {
            label: month_year(vnode),
            on_previous_month: () => vnode.state.date = subMonths(vnode.state.date, 1),
            on_next_month: () => vnode.state.date = addMonths(vnode.state.date, 1),
            on_previous_year: () => vnode.state.date = subYears(vnode.state.date, 1),
            on_next_year: () => vnode.state.date = addYears(vnode.state.date, 1)
          }
        ),
        m(".calendar-container", [
            m(".calendar-header",
              langs[vnode.state.lang].weekdaysShort.map(day => m(".calendar-date", day))
            ),
          
            m(".calendar-body",
              get_dates(vnode.state.date, langs[vnode.state.lang].weekStart).map(dt =>
                m(".calendar-date", get_attrs(vnode, dt),
                  m("button.date-item", 
                    {
                      class: isSameDay(dt, vnode.state.selected) ? 'is-today' : '',
                      onclick: () => {
                        vnode.state.selected = dt
                        vnode.attrs.onclick(dt)
                      }
                    }, 
                    dt.getDate())
                ),
              )
            )
        ])
      )
}


export const DatePicker = {

  oninit: vnode => {
    vnode.state.lang = vnode.attrs.lang || 'en'
    vnode.state.open = false
    vnode.state.date = vnode.attrs.date || null
  },
  
  view: vnode => [
    m(Input, {
      onclick: () => vnode.state.open = !vnode.state.open,
      value: vnode.state.date ? 
        format(vnode.state.date, langs[vnode.state.lang].format)
        : null
    }),
    vnode.state.open ? 
      m('div.datepicker.is-active', {style: {'z-index': 'auto'}},
        m(Calendar, 
          {
            lang: vnode.state.lang, 
            date: vnode.attrs.date,
            onclick: (dt) => {
              vnode.state.date = dt
              vnode.state.open = !vnode.state.open
            },
            style: {
              position: 'absolute'
            },
            large: vnode.attrs.large
          }) 
        ) : null
  ]
}