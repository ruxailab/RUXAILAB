import Vue from "vue";
import Vuex from "vuex";
import Auth from "@/store/modules/newStores/Auth";
import Templates from "@/store/modules/newStores/Template";
import Tests from "@/store/modules/newStores/Test";
import Users from "@/store/modules/newStores/User";
import Database from "@/store/modules/newStores/Database";
import Cooperators from "@/store/modules/newStores/Cooperators";
import Reports from "@/store/modules/newStores/Reports";
import Heuristic from "@/store/modules/newStores/Heuristic";
import Answer from "@/store/modules/newStores/Answer";


Vue.use(Vuex);

export default new Vuex.Store({
    state:{
        loading:false,
        error:null,
        dialogLeave:false,
        localChanges:false,
        pathTo:null,
    },
    mutations: {
        setLoading(state, payload) {
          state.loading = payload
        },
        setError(state, payload) {
          state.error = payload
        },
        SET_DIALOG_LEAVE(state,payload){
          console.log('aqui')
          state.dialogLeave = payload
        },
        SET_LOCAL_CHANGES(state,payload){
          state.localChanges = payload
        },
        SET_PATH_TO(state,payload){
          state.pathTo = payload
        }
    },
    getters:{
      getDialogLeaveStatus(state){
        return state.dialogLeave
      },
      localChanges(state){
        return state.localChanges
      }
    },
    modules: {
        Auth,
        Templates,
        Tests,
        Users,
        Database,
        Cooperators,
        Reports,
      Heuristic,
      Answer,
    },
});
