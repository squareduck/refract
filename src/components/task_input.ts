import m from 'mithril'
import * as R from 'ramda'

const sockets = [
    'taskList',
    'input',
]

const actions = (foci, lenses) => ({
    updateValue: (value) => R.set(lenses.input, value),
    add: () => R.set(lenses.taskList, R.append({id: foci.taskList().length + 1, name: foci.input()}, foci.taskList()))
})

const view = ({foci, actions}) => m('div', [
    m('input', {
        value: foci.input(),
        oninput: m.withAttr('value', actions.updateValue)
    }),
    m('button', {onclick: actions.add}, 'Add')
])

export default {
    sockets,
    actions,
    view
}

