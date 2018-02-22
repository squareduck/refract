import m from 'mithril'
import * as R from 'ramda'

const lenses = {
    taskList: ['planning', 'tasks']
    input: ['planning', 'task_input']
}

const actions = (foci, lenses) => ({
    updateValue: (value) => {
        console.log(value)
        return R.set(lenses.input, value)
    },
    add: () => R.set(lenses.taskList, R.append({name: foci.input()}, foci.taskList()))
})

const view = (foci, actions) => m('div', [
    m('input', {
        value: foci.input(),
        oninput: m.withAttr('value', actions.updateValue)
    }),
    m('button', {onclick: actions.add}, 'Add')
])

export default {
    lenses,
    actions,
    view
}

