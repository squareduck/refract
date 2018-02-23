import m from 'mithril'
import * as R from 'ramda'

const lenses = {
    taskList: ['planning', 'tasks'],
    currentTask: ['router', 'task_id']
    input: ['planning', 'task_input']
}

const actions = (foci, lenses) => ({
})

const view = (foci, actions, navigate) => m('div', [
    m('button', {onclick: navigate('Home')}, 'Go home'),
    m('div', foci.currentTask() || 'no'),
    m('div', R.map(task => m('div', {onclick: navigate('Task', {id: task.id})}, task.name), foci.taskList()))
])

export default {
    lenses,
    actions,
    view
}

