import m from 'mithril'
import * as R from 'ramda'
import { createApp } from './refract'
import TaskList from './components/task_list'
import TaskInput from './components/task_input'

const initialState = {
    planning: {
        task_input: 'New task',
        tasks: [{name: 'Test'}]
    }
}

const app = createApp(initialState)

app.createComponent('List', TaskList.lenses, TaskList.actions, TaskList.view)
app.createComponent('Input', TaskInput.lenses, TaskInput.actions, TaskInput.view)

app.createComponent('Main', app.noLenses, app.noActions, (foci, actions) => m('div', [
    app.components['Input'].view(),
    app.components['List'].view(),
]))

app.start(document.body)
