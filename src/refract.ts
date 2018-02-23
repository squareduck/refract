import m from 'mithril'
import stream, { Stream } from 'mithril/stream'
import Immutable from 'seamless-immutable'
import * as R from 'ramda'
import Mapper from 'url-mapper'

interface ComponentTemplate {
    lenses: {[key: string]: (string | number)[]}
    actions: Function
    view: Function
}

interface Component {
    name: string
    lenses: LensMap
    foci: FociMap
    actions: ActionMap
    view: Function
}

type Store = {[key: string]: any}
type UpdateFn = (store: Store) => Store

type LensMap = {[key: string]: R.Lens}
type FociMap = {[key: string]: Function}
type ActionMap = {[key: string]: Function}
type RouteMap = {[key: string]: Component}
type ComponentMap = {[key: string]: Component}

const urlMapper = Mapper()

export const createApp = (initialState: Store) => {
    const updateStream = stream()
    const applyUpdate = (store: Store, updateFn: any): Store => updateFn(store)
    const storeStream = stream.scan(applyUpdate, initialState, updateStream)

    /*
     * Routing
     */

    let routeMap = {}
    let routeActions = {}

    const navigate = (name: string, params: any) => {
        const routePath = R.head(R.keys(R.filter(route => route.name === name, routeMap)))
        const routeComponent = routeMap[routePath].component
        params = params || {}
        window.history.pushState({}, "", `#${urlMapper.stringify(routePath, params)}`)
        topComponent = () => routeComponent
        const updates = routeActions[name]
        R.map(update => updateStream(update(params)), updates)
    }

    const route = (name: string, path: string, component: Component, updates: Function[]) => {
        routeMap[path] = {name, component}
        routeActions[name] = updates
    }

    const subroute = (name: string, parentName: string, path: string, updates: Function[]) => {
        const parentRoute = R.filter(route => route.name === parentName, routeMap)
        const parentPath = R.head(R.keys(parentRoute))
        routeMap[parentPath + path] = {name, component: parentRoute[parentPath].component}
        console.log(routeMap)
        routeActions[name] = R.concat(routeActions[parentName], updates)
    }

    const resolveRoute = () => {
        const route = document.location.hash.substring(1)
        const resolved = urlMapper.map(route, routeMap)
        if (resolved) {
            const routeName = resolved.match.name
            navigate(routeName, resolved.values)
        }
    }

    /*
     * Components
     */

    const components: ComponentMap = {}
    const focus = (lens: R.Lens) => R.view(lens, storeStream())
    const noLenses = {}
    const noActions = () => ({})

    const createComponent = (name: string, componentTemplate: ComponentTemplate): Component => {
        const lenses: LensMap = R.reduce((acc, key) => R.assoc(key, R.lensPath(componentTemplate.lenses[key]), acc), {}, R.keys(componentTemplate.lenses))
        const foci = R.reduce((acc, key) => R.assoc(key, () => focus(lenses[key]), acc), {}, R.keys(lenses))
        const actionMap = componentTemplate.actions(foci, lenses, navigate)
        const actions = R.reduce((acc, key) => R.assoc(key, (...args: any[]) => updateStream(actionMap[key](...args)), acc), {}, R.keys(actionMap))

        const component = {
            name,
            lenses,
            actions,
            foci,
            view: () => componentTemplate.view(foci, actions, navigate)
        }

        components[name] = component

        return component
    }

    /*
     * App
     */

    let topComponent = () => components['Main']

    const start = (rootElement: HTMLElement) => {
        if (R.keys(routeMap).length > 0) {
            window.onpopstate = resolveRoute
            if (document.location.hash === '') window.history.pushState({}, "", "#/")
            resolveRoute()
        }
        storeStream.map((store) => {
            console.log(store)
            m.render(rootElement, topComponent().view())
        })
    }

    return {
        storeStream,
        components,
        focus,
        noLenses,
        noActions,
        createComponent,
        route,
        subroute,
        navigate,
        start,
    }
}
