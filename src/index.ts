import {
  init as snabbDomInit,
  eventListenersModule as elm,
  propsModule as pm,
  attributesModule as am,
  h,
  jsx,
} from 'snabbdom';

type SnazzyConfig = {
  view: Function;
  init: Function | { [key: string]: any };
  subscriptions: Function;
};

// Snazzy - a lightweight vdom UI library
const patch = snabbDomInit([pm, elm, am]);
const app = (s: SnazzyConfig, mount: HTMLElement) => {
  let queue: [Function, any][] = [],
    state = typeof s.init === 'function' ? s.init() : s.init,
    subs = s.subscriptions?.(state) ?? [],
    cleanups = new Array(subs.length),
    effects: [Function, any][] = [];
  if (Array.isArray(state)) {
    (effects = state.slice(1)), (state = state[0]);
  }
  const dispatch = (type: Function, payload: any) =>
    queue.push([type, payload]);
  for (let x = 0; x < subs.length; x = x + 1) {
    subs[x] &&
      typeof subs[x][0] === 'function' &&
      (cleanups[x] = subs[x][0](dispatch, subs[x][1]));
  }
  let vnode = s.view(state, dispatch);
  const render = () => {
    let newState = state,
      newSubs = [];
    for (const entry of queue) {
      newState = entry[0](state, entry[1]);
      if (Array.isArray(newState)) {
        const [s, ...e] = newState;
        (newState = s), (effects = [...effects, ...e]);
      }
    }
    if (newState !== state) {
      (queue = []), (state = newState);
      const newVnode = s.view(state, dispatch);
      patch(vnode, newVnode);
      vnode = newVnode;
      s.subscriptions && (newSubs = s.subscriptions(state) ?? []);
      for (let x = 0; x < newSubs.length; x = x + 1) {
        if (!subs[x] && newSubs[x]) {
          cleanups[x] = newSubs[x][0](dispatch, newSubs[x][1]);
        } else if (subs[x] && !newSubs[x]) {
          cleanups[x]?.() && (cleanups[x] = null);
        }
      }
      for (const e of effects) {
        e && e[0](dispatch, e[1]);
      }
      (subs = newSubs), (effects = []);
    } else if (effects.length) {
      for (const e of effects) {
        e && e[0](dispatch, e[1]);
      }
      effects = [];
    }
    requestAnimationFrame(render);
  };
  patch(mount, vnode);
  requestAnimationFrame(render);
  return dispatch;
};

export { h, jsx, app };
