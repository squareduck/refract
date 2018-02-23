import m from 'mithril'
import * as R from 'ramda'
import { createApp } from './refract'
import TaskList from './components/task_list'
import TaskInput from './components/task_input'

const initialState = {
    planning: {
        task_input: 'New task',
        tasks: [{id: 1, name: 'Test'}]
    }
}

const app = createApp(initialState)

app.createComponent('Tasks', TaskList)
app.createComponent('Input', TaskInput)

app.createComponent('Main', {
    lenses: app.noLenses,
    actions: app.noActions, 
    view: (foci, actions, navigate) => m('div', [
        m('button', {onclick: navigate('Tasks')}, 'Go to tasks'),
        app.components['Input'].view(),
    ])
})


app.route('Home', '/', app.components.Main, [
    () => R.assocPath(['router', 'page'], 'Main')
])

app.route('Tasks', '/tasks', app.components.Tasks, [
    () => R.assocPath(['router', 'page'], 'Tasks')
])

app.subroute('Task', 'Tasks', '/:id', [
    ({id}) => R.assocPath(['router', 'task_id'], id)
])

app.start(document.body)
