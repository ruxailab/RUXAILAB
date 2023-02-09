<template>
    <div class="whole-test">
        <div class="whole-test-title">{{ this.test.title }}</div>
        <div v-for="heuristic in heuristics">
            <div class="heuristic-title">{{ heuristic.title }}</div>
            <div v-for="question in questions">title: {{ question.title }}</div>
        </div>
    </div>
</template>
<script>
export default {
    data: () => ({
        heuristics: {
            title: "teste",
        },
    }),
};
</script>
