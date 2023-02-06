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


Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        Auth,
        Templates,
        Tests,
        Users,
        Database,
        Cooperators,
        Reports,
        Heuristic
    },
});
