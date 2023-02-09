<template>
    <div class="whole-test">
        <div class="whole-test-title">{{ this.test.title }}</div>
        <v-for heuristic in heuristics>
            <div class="heuristic-title">{{ this.test.heuristic.title }}</div>
            <v-for question in questions> </v-for>
        </v-for>
    </div>
</template>
