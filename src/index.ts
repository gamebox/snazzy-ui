import {
  init as snabbDomInit,
  eventListenersModule as elm,
  propsModule as pm,
  attributesModule as am,
  h,
} from 'snabbdom';

import type {VNode, VNodeData} from 'snabbdom';

type SnazzyConfig<S> = {
  view: ViewFn<S>;
  init: Update<S> | InitFn<S>;
  subscriptions: Subscriptions<S>;
};
export type InitFn<S> = () => Update<S>;
export type ViewFn<S> = (state: S, dispatch: DispatchFn<S>) => VNode;
export type UpdateFn<S, P = any> = (state: S, payload: P) => Update<S>;
export type Update<S> = Readonly<S | [S, Effect<S>[]]>;
export type DispatchFn<S, P = any> = (type: UpdateFn<S, P>, payload: P) => void;
export type EffectFn<S, P = any> = (dispatch: DispatchFn<S>, payload: P) => void;
export type Effect<S, P = any> = Readonly<[EffectFn<S, P>, P]>;
export type SubscriptionFn<S, P = any> = (dispatch: DispatchFn<S>, payload: P) => VoidFunction;
export type Subscription<S, P = any> = [SubscriptionFn<S, P>, P];
export type PossibleSubscription<S, P = any> = Readonly<false|Subscription<S, P>>;
export type Subscriptions<S> = (state: S) => PossibleSubscription<S>[];
type InternalState<S extends Object> = [
  state: S,
  effects: Effect<S>[],
  subs: PossibleSubscription<S>[],
  cleanups: (VoidFunction|null)[],
  vnode: Element|VNode
];

// Snazzy - a lightweight vdom UI library
const patch = snabbDomInit([pm, elm, am]);
const app = <S>(c: SnazzyConfig<S>, mount: HTMLElement): DispatchFn<S> => {
  let queue: [Function, any][] = [[() => typeof c.init === 'function' ? c.init() : c.init, null]],
    [state, effects, subs, cleanups, vnode]: InternalState<S> = [{} as S, [], [], [], mount],
    scheduled: number|null, render: VoidFunction;
  const dispatch = (t: Function, p: any) => queue.push([t, p]) && scheduled === null && (scheduled = requestAnimationFrame(render));
  render = () => {
    scheduled = null;
    let newState: S = state, update, newSubs = subs, entry;
    while ((entry = queue.shift(), entry)) {
      update = entry[0](newState, entry[1]);
      [newState, effects] = Array.isArray(update) ? [update[0], [...effects, ...update[1]]] : [update, effects];
    }
    if (newState !== state) {
      vnode = patch(vnode, c.view(state = newState, dispatch));
      newSubs = c.subscriptions?.(state) ?? [];
      for (const [x, ns] of newSubs.entries()) {
        (!subs[x] && ns) && (cleanups[x] = ns[0](dispatch, ns[1]));
        (subs[x] && !ns) && cleanups[x]?.() && (cleanups[x] = null);
      }
    }
    for (const e of effects) {
      e[0](dispatch, e[1]);
    }
    effects = [], subs = newSubs;
  };
  render();
  return dispatch;
};
// app: 1283 chars
export { h, app, VNode, VNodeData };