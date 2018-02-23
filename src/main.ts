import m from 'mithril'
import * as R from 'ramda'
import { createApp } from './refract'
import Tasks from './components/tasks'
import Home from './components/home'

const initialState = {
    planning: {
        taskInput: 'New task',
        tasks: [{id: 1, name: 'First task'}]
    },
    writing: {
        notes: [{id: 1, name: 'First note'}]
    }
}

export const app = createApp(initialState)

const tasks = app.createComponent(Tasks, {
    selectedTask: ['planning', 'currentTask']
})

const home = app.createComponent(Home, {
    tasks: ['planning', 'tasks'],
    notes: ['writing', 'notes'],
})

app.route('Home', '/', home, [
     () => R.assocPath(['router', 'page'], 'Home')
])

app.route('Tasks', '/tasks', tasks, [
    () => R.assocPath(['router', 'page'], 'Tasks')
])

app.subroute('Task', 'Tasks', '/:id', [
    ({id}) => R.assocPath(['planning', 'currentTask'], id)
])

app.start(document.body)
