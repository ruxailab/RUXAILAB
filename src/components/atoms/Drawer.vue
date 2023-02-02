<template>
    <v-navigation-drawer
        clipped
        v-model="drawer"
        :mini-variant="mini"
        permanent
        color="#3F3D56"
        class="hidden-sm-and-down"
    >
        <!-- Navigation header -->
        <div class="header" v-if="!mini">
            <v-list-item>
                <v-row dense>
                    <v-col class="pa-0 ma-0">
                        <div class="idText">{{ test.id }}</div>
                        <v-overflow-btn
                            class="pa-0 ma-0"
                            dark
                            dense
                            v-model="selectedTest"
                            @change="pushToTest()"
                            item-value="id"
                            item-text="title"
                            :items="testsList"
                            :label="test.testTitle"
                            background-color="#343344"
                            style="max-width: 240px"
                        ></v-overflow-btn>
                    </v-col>
                </v-row>
            </v-list-item>
        </div>

        <!-- Navigation options -->
        <v-list flat dense v-if="items">
            <div v-if="mini">
                <v-tooltip right v-for="(item, n) in items" :key="n">
                    <template v-slot:activator="{ on, attrs }">
                        <v-list-item
                            @click="(index = n), go(item)"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <v-list-item-icon>
                                <v-icon
                                    :color="
                                        index == item.id ? '#fca326' : '#bababa'
                                    "
                                    >{{ item.icon }}</v-icon
                                >
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title
                                    :style="
                                        index == item.id
                                            ? 'color: #fca326'
                                            : 'color:#bababa'
                                    "
                                    >{{ item.title }}</v-list-item-title
                                >
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                    <span>{{ item.title }}</span>
                </v-tooltip>
            </div>

            <div v-else>
                <v-list-item
                    v-for="(item, n) in items"
                    :key="n"
                    @click="(index = n), go(item)"
                >
                    <v-list-item-icon>
                        <v-icon
                            :color="index == item.id ? '#fca326' : '#bababa'"
                            >{{ item.icon }}</v-icon
                        >
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title
                            :style="
                                index == item.id
                                    ? 'color: #fca326'
                                    : 'color:#bababa'
                            "
                            >{{ item.title }}</v-list-item-title
                        >
                    </v-list-item-content>
                </v-list-item>
            </div>
        </v-list>

        <!-- Navigation footer -->
        <div class="footer" v-if="!mini">
            <v-btn
                icon
                @click="go(`/settingsview/${test.id}`)"
                class="ml-3"
                v-if="props == 0"
            >
                <v-icon :color="isSettings ? '#fca326' : 'white'"
                    >mdi-cog</v-icon
                >
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="mini = !mini" class="mr-2">
                <v-icon color="white">mdi-chevron-left</v-icon>
            </v-btn>
        </div>

        <div class="footer" :style="props == 0 ? 'height:16%' : ''" v-else>
            <v-col>
                <v-btn
                    icon
                    @click="go(`/settingsview/${test.id}`)"
                    v-if="props == 0"
                >
                    <v-icon :color="isSettings ? '#fca326' : 'white'"
                        >mdi-cog</v-icon
                    >
                </v-btn>
                <v-btn icon @click.stop="mini = !mini" class="mt-2">
                    <v-icon color="white">mdi-chevron-right</v-icon>
                </v-btn>
            </v-col>
        </div>
    </v-navigation-drawer>
</template>
<script>
export default {
    props: ["props"],
    data: () => ({
        drawer: true,
        mini: true,
        selectedTest: null,
    }),
    methods: {
        go(item) {
            if (item.id == undefined) this.$router.push(item).catch(() => {});
            else {
                if (item.id == 2) window.open(item.path);
                else this.$router.push(item.path).catch(() => {});
            }
        },
    },
    computed: {
        test() {
            // console.log("TEST---> " + this.$store.state.Tests.Test);
            return this.$store.state.Tests.Test;
        },
        testsList() {
            if (!this.isCoops) return this.$store.getters.user.myTests;
            else return this.$store.getters.user.myCoops;
        },
        index: {
            get() {
                if (this.items) {
                    return this.items.indexOf(
                        this.items.find((item) =>
                            item.path
                                .split("/")
                                .includes(this.$route.path.split("/")[1])
                        )
                    );
                }
                return 0;
            },
            set(item) {
                return item;
            },
        },
        items() {
            let items;
            if (this.test) {
                items = [
                    {
                        title: "Manager",
                        icon: "mdi-home",
                        path: `/managerview/${this.test.id}`,
                        id: 0,
                    },
                    {
                        title: "Test",
                        icon: "mdi-file-document-edit",
                        path: `/edittest/${this.test.id}`,
                        id: 1,
                    },
                    {
                        title: "Preview",
                        icon: "mdi-file-eye",
                        path: `/testview/${this.test.id}`,
                        id: 2,
                    },
                    {
                        title: "Reports",
                        icon: "mdi-book-multiple",
                        path: `/reportview/${this.test.reports}`,
                        id: 3,
                    },
                    {
                        title: "Answers",
                        icon: "mdi-order-bool-ascending-variant",
                        path: `/answerview/${this.test.answers}`,
                        id: 4,
                    },
                    {
                        title: "Analytics",
                        icon: "mdi-chart-bar",
                        path: `/analyticsview/${this.test.answers}`,
                        id: 5,
                    },
                ];

                if (this.props == 0) {
                    items.push({
                        title: "Cooperators",
                        icon: "mdi-account-group",
                        path: `/cooperators/${this.test.cooperators}`,
                        id: 6,
                    });
                }

                if (this.test.template) {
                    items.push({
                        title: "Template",
                        icon: "mdi-file-compare",
                        path: `/templateview/${this.test.template.id}`,
                        id: 7,
                    });
                }
            }

            return items;
        },
    },
};
</script>
