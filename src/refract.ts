import m from 'mithril'
import stream, { Stream } from 'mithril/stream'
import Immutable from 'seamless-immutable'
import * as R from 'ramda'

type LensMap = {[key: string]: R.Lens}
type FociMap = {[key: string]: Function}
type ComponentMap = {[key: string]: object}

export const createApp = (initialState: object) => {
    const components: ComponentMap = {}
    const updateStream = stream()
    const applyUpdate = (store, updateFn) => updateFn(store)
    const storeStream = stream.scan(applyUpdate, initialState, updateStream)

    const focus = (lens: R.Lens) => R.view(lens, storeStream())
    const noLenses = {}
    const noActions = () => ({})

    const createComponent = (name: string, lensMap: {[key: string]: (string | number)[]}, actionBuilder, view) => {
        const lenses: LensMap = R.reduce((acc, key) => R.assoc(key, R.lensPath(lensMap[key]), acc), {}, R.keys(lensMap))
        const foci = R.reduce((acc, key) => R.assoc(key, () => focus(lenses[key]), acc), {}, R.keys(lenses))
        const actionMap = actionBuilder(foci, lenses)
        const actions = R.reduce((acc, key) => R.assoc(key, (...args) => updateStream(actionMap[key](...args)), acc), {}, R.keys(actionMap))

        const component = {
            name,
            lenses,
            actions,
            foci,
            view: () => view(foci, actions)
        }

        components[name] = component

        return component
    }

    const start = (rootElement: HTMLElement) => {
        storeStream.map((store) => {
            m.render(rootElement, components['Main'].view())
        })
    }

    return {
        storeStream,
        components,
        focus,
        noLenses,
        noActions,
        createComponent,
        start
    }
}
