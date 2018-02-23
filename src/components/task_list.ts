import m from 'mithril'
import * as R from 'ramda'

const sockets = [
    'taskList',
    'currentTask',
]

const actions = (foci, lenses) => ({
})

const view = ({foci, actions, navigate}) => m('div', [
    m('div', R.map(task => m('div', {onclick: navigate('Task', {id: task.id})}, task.name), foci.taskList()))
])

export default {
    sockets,
    actions,
    view
}

