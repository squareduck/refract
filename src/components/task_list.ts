import m from 'mithril'
import * as R from 'ramda'

const lenses = {
    taskList: ['planning', 'tasks']
    input: ['planning', 'task_input']
}

const actions = (foci, lenses) => ({
})

const view = (foci, actions) => m('div', R.map(task => m('div', task.name), foci.taskList()))

export default {
    lenses,
    actions,
    view
}

