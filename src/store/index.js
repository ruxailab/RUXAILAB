import Vue from "vue";
import Vuex from "vuex";
import Auth from "@/store/modules/newStores/Auth";
//import Heuristics from '@/store/modules/newStores/Heuristic'
import Templates from "@/store/modules/newStores/Template";
import Tests from "@/store/modules/newStores/Test";
import Users from "@/store/modules/newStores/User";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        Auth,
        // Heuristics,
        Templates,
        Tests,
        Users,
    },
});
