import m from 'mithril'
import * as R from 'ramda'

const sockets = [
    'tasks',
    'notes',
]

const actions = () => ({})

const view = ({foci, navigate}) => m('div', {class: 'page'}, [
    m('h1', 'Refract demo app'),
    m('button', {onclick: navigate('Tasks')}, 'Go to tasks'),
    m('h3', 'Total tasks: ' + foci.tasks().length),
    m('h3', 'Total notes: ' + foci.notes().length),
])

export default {
    sockets,
    actions,
    view
}
