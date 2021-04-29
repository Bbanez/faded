// import {
//   ActionContext,
//   ActionTree,
//   CommitOptions,
//   createLogger,
//   createStore,
//   DispatchOptions,
//   GetterTree,
//   MutationTree,
//   Store as VuexStore,
// } from 'vuex';
//
// export interface State {
//   rm: unknown[];
// }
// export const state: State = {
//   rm: [],
// };
//
// export type Mutations = unknown;
// export const mutations: MutationTree<State> & Mutations = {};
//
// // -----------------
// // ---- Getters ----
// // -----------------
// export type Getters = unknown;
// export const getters: GetterTree<State, State> & Getters = {};
//
// // -----------------
// // ---- Actions ----
// // -----------------
// export type ActionAugments = Omit<ActionContext<State, State>, 'commit'> & {
//   commit<K extends keyof Mutations>(
//     key: K,
//     payload: Parameters<Mutations[K]>[1]
//   ): ReturnType<Mutations[K]>;
// };
// export type Actions = unknown;
// export const actions: ActionTree<State, State> & Actions = {};
//
// // ---------------
// // ---- Store ----
// // ---------------
// export type Store = Omit<
//   VuexStore<State>,
//   'getters' | 'commit' | 'dispatch'
// > & {
//   commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
//     key: K,
//     payload: P,
//     options?: CommitOptions
//   ): ReturnType<Mutations[K]>;
// } & {
//   dispatch<K extends keyof Actions>(
//     key: K,
//     payload?: Parameters<Actions[K]>[1],
//     options?: DispatchOptions
//   ): ReturnType<Actions[K]>;
// } & {
//   getters: {
//     [K in keyof Getters]: ReturnType<Getters[K]>;
//   };
// };
// export const store = createStore<State>({
//   state,
//   mutations,
//   getters,
//   plugins: [createLogger()],
// });
// export function useStore(): Store {
//   return store;
// }
