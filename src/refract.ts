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
    /*
     * Stream of update functions.
     * All actions defined by components end up in this stream.
     *
     * All update functions have the same signature:
     * (store: Store) => Store
     */
    const updateStream = stream()

    /*
     * Reducer stream over updateStream.
     * Latest value in this stream is our current global Store.
     *
     */
    const applyUpdate = (store: Store, updateFn: any): Store => updateFn(store)
    const storeStream = stream.scan(applyUpdate, initialState, updateStream)

    /*
     *
     * -------
     * Routing
     * -------
     *
     * Route is a named URL mapped to a component and a list of update functions.
     *
     */

    // A map from URL to route name
    let routeMap = {}
    // A map from route name to list of update functions
    let routeUpdates = {}

    /*
     * Navigate takes the name of the route and optional placeholder params.
     * Changes current top component to route component.
     * Changes browser url.
     * Pushes all update functions for the current route into updateStream
     *
     */
    const navigate = (name: string, params = {}: any) => {
        const routePath = R.head(R.keys(R.filter(route => route.name === name, routeMap)))
        const routeComponent = routeMap[routePath].component
        window.history.pushState({}, "", `#${urlMapper.stringify(routePath, params)}`)
        topComponent = () => routeComponent
        const updates = routeUpdates[name]
        R.map(update => updateStream(update(params)), updates)
    }

    /*
     * Add a new route
     */
    const route = (name: string, path: string, component: Component, updates: Function[]) => {
        routeMap[path] = {name, component}
        routeUpdates[name] = updates
    }

    /*
     * Add a new subroute.
     * Retains the component of parent route.
     * Adds its own update functions at the end of parent route update list.
     */
    const subroute = (name: string, parentName: string, path: string, updates: Function[]) => {
        const parentRoute = R.filter(route => route.name === parentName, routeMap)
        const parentPath = R.head(R.keys(parentRoute))
        routeMap[parentPath + path] = {name, component: parentRoute[parentPath].component}
        console.log(routeMap)
        routeUpdates[name] = R.concat(routeUpdates[parentName], updates)
    }

    /*
     * Resolve browser URL into route
     */
    const resolveRoute = () => {
        const route = document.location.hash.substring(1)
        const resolved = urlMapper.map(route, routeMap)
        if (resolved) {
            const routeName = resolved.match.name
            navigate(routeName, resolved.values)
        }
    }

    /*
     *
     * ----------
     * Components
     * ----------
     *
     */

    // A map of all components created for the application (name: component)
    const components: ComponentMap = {}
    // A focus is a read only lens into Store
    const focus = (lens: R.Lens) => R.view(lens, storeStream())
    /*
     * Helper placeholder functions for component templates.
     * {
     *     lenses: noLenses,
     *     actions: noActions,
     *     view: ...
     * }
     *
     */
    const noLenses = {}
    const noActions = () => ({})

    /*
     * Creates a new component from template in the context of current app.
     * This makes components aware of app-specific streams (update and store).
     * Also registers component by name in 'components'
     *
     * A component template is a simple object:
     * {
     *     lenses: {name: [paths], ...}, // map paths in the global store to component specific accessors
     *     actions: (foci, lenses, navigate) => ({name: (params) => <update function>}), // describe possible update functions
     *     view: (foci, actions, navigate) => <mithril virtual nodes> // describe view
     * }
     *
     * foci: a map of read-only accessors for each lens path described in component template
     * lenses: a map of lenses usable for updating the store
     * actions: a map of actions ready to be associated with events {onclick: actions.myaction}
     * navigate: a function that allows to invoke any registered route with optional params
     *
     */
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
            view: () => componentTemplate.view(foci, actions, (name, params) => () => navigate(name, params))
        }

        components[name] = component

        return component
    }

    /*
     *
     * -----------
     * Application
     * -----------
     *
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
