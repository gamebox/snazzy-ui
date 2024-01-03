# Snazzy UI

A modern, functional UI library that is API compatible with Hyperapp, but built
on top of the battle-tested Snabbdom VDOM library.  Great for building fast
little apps or used with [Snazzy Elements](https://github.com/gamebox/snazzy-elements)
to build design systems with Custom Web Elements (web components).

## Installation

### npm
```
npm i @snazzyui/snazzy-ui
```
### pnpm
```
pnpm add @snazzyui/snazzy-ui
```

## Getting started

```js
// Import from the package
import { app, h } from '@snazzyui/snazzy-ui';

// An update function, will be passed to your app's dispatch function. It can
// return just a new state, or a tuple of newState and a list of effects to run
// asynchronously after the newState has been applied.
const Increment = (state) => {
    const newCount = state.count + 1;
    const newState = { ...state, count: newCount};

    if (newCount % 15 === 0) {
        return [newState, [[notifyUser, { message: "fizzbuzz" }]]]
    }[
    if (newCount % 5 === 0) {
        return [newState, [[notifyUser, { message: "buzz" }]]];
    } 
    if (newCount % 3 === 0) {
        return [newState, [[notifyUser, { message: "fizz" }]]];
    }
    return newState;
};

// An effect function.  This can be async and do work in the background.  It
// notifies that app of changes to state that need to be made through the
// dispatch function that is passed in.
const notifyUser = (dispatch, payload) => {
    window.alert(payload.message);
};

// This sets up the app
app({
    // This can either be a static object(must be an object), or a function that
    // returns one.
    init: { count: 0 },
    // This is the function that will be called to render your UI whenever the
    // state is changed.
    // The first parameter is the current state
    // The second parameter is a function that will call update functions.  It
    // takes the update function as the first argument, and it's argument as the
    // second argument.
    //
    // Notice that we use the h function imported from the package, this comes
    // directly from Snabbdom. See [Snabbdom docs on h](https://github.com/snabbdom/snabbdom?tab=readme-ov-file#h) to see how to use it.
    view: (state, dispatch) => h('div', {}, [
        h('h1', {}, state.count),
        h('button', { on: { click: () => dispatch(Increment, {}) } }, 'Increment'),
    ]),
    // This is a function that will be called with state on every state change
    // and return a list of subscriptions.  Subscriptions can set up and clean
    // up event watchers or other events you want to listen to outside of the
    // DOM.
    subscriptions: () => [],
    // The second argument of app is the element used to mount your application in.
}, document.querySelector("#app'))
```
