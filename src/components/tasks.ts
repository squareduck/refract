import m from 'mithril'
import * as R from 'ramda'
import TaskList from './task_list'
import TaskInput from './task_input'

const sockets = [
    'selectedTask'
]

const actions = () => ({})

const paths = {
    taskList: {
        taskList: ['planning', 'tasks'],
        currentTask: ['planning', 'currentTask'],
    },
    taskInput: {
        taskList: ['planning', 'tasks'],
        input: ['planning', 'taskInput'],
    },
}
const view = ({createComponent, foci, actions, navigate}) => m('div', {class: 'page'}, [
    m('h1', 'Tasks'),
    m('button', {onclick: navigate('Home')}, 'Go to home'),
    m('h4', 'Selected task ' + foci.selectedTask()),
    createComponent(TaskInput, paths.taskInput).view(),
    createComponent(TaskList, paths.taskList).view(),
])

export default {
    sockets,
    actions,
    view
}
