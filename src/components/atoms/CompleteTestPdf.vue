<template>
    <div class="whole-test">
        <div class="whole-test-title">{{ title }}</div>
        <div v-for="(heuristic, index) in heuristics" :key="heuristic.id">
            <br />

            <div class="heuristic">
                <div class="heuristic-title">
                    {{ index + 1 }} - {{ heuristic.title }}
                </div>
                <div
                    v-for="(question, index) in heuristic.questions"
                    :key="question.id"
                >
                    <div class="heuristic-question">
                        {{ index + 1 }} - {{ question.title }}
                        <div class="heuristic-question-answers">
                            <div class="answer1">
                                {{ question.resp1 }} - {{ question.value1 }}
                            </div>
                            <div class="answer2">
                                {{ question.resp2 }} - {{ question.value2 }}
                                <div
                                    class="pie animate"
                                    style="--p:`${question.value1}`;--c:orange"
                                >
                                    60%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {{ heuristic.allComments }}
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data: () => ({
        title: "Havaluacion heuristica",
        heuristics: [
            {
                id: 0,
                title: "Visibilidad y estado del sistema ",
                questions: [
                    {
                        title:
                            "La aplicación incluye de forma visible el título de la página, de la sección o del sitio?",
                        resp1: "si",
                        value1: "80",
                        resp2: "no",
                        value2: "2",
                    },
                    {
                        title: "El usuario sabe en todo momento dónde está?",
                        resp1: "si",
                        value1: "3",
                        resp2: "no",
                        value2: "7",
                    },
                    {
                        title:
                            "El usuario sabe en todo momento qué está haciendo el sistema o aplicación?",
                        resp1: "si",
                        value1: "1",
                        resp2: "no",
                        value2: "9",
                    },
                    {
                        title: "Los enlaces están claramente definidos?",
                        resp1: "si",
                        value1: "6",
                        resp2: "no",
                        value2: "4",
                    },
                    {
                        title:
                            "Todas las acciones pueden verse directamente? (Sin requerir acciones adicionales)s",
                        resp1: "si",
                        value1: "5",
                        resp2: "no",
                        value2: "5",
                    },
                ],
                allComments: [
                    "Puta",
                    "Esse programa é maravilhoso",
                    "na verdade não achei bom",
                ],
            },
            {
                id: 0,
                title:
                    "Connexión entre el sistema y el mundo real, uso de metáforas y objetos humanos",
                questions: [
                    {
                        title:
                            "La información aparece de una manera lógica para el usuario común?",
                        resp1: "si",
                        value1: "10",
                        resp2: "no",
                        value2: "0",
                    },
                    {
                        title:
                            "El diseño de los iconos se correspone con objetos cotidianos?",
                        resp1: "si",
                        value1: "2",
                        resp2: "no",
                        value2: "2",
                    },
                    {
                        title:
                            "Cada icono realiza la acción que el usuario espera?",
                        resp1: "si",
                        value1: "4",
                        resp2: "no",
                        value2: "5",
                    },
                    {
                        title:
                            "Se utilizan frases y conceptos familiares para el usuario?",
                        resp1: "si",
                        value1: "1",
                        resp2: "no",
                        value2: "4",
                    },
                ],
                allComments: [
                    "Puta",
                    "Esse programa é maravilhoso",
                    "na verdade não achei bom",
                ],
            },
        ],
    }),
};
</script>

<style>
.whole-test-title {
    padding: 5px;
    font-weight: bold;
    font-size: xx-large;
}
.heuristic {
    display: block;

    padding: 5px;
    align-items: baseline;
}
.heuristic-title {
    color: orange;
    font-size: x-large;
}
.heuristic-question {
    font-weight: bold;

    padding-left: 50px;
}
.heuristic-question-answers {
    padding-left: 22px;
    display: block;
    width: 10%;
    justify-content: space-between;
}

@property --p {
    syntax: "<number>";
    inherits: true;
    initial-value: 1;
}

.pie {
    --p: 20;
    --b: 22px;
    --c: darkred;
    --w: 150px;

    width: var(--w);
    aspect-ratio: 1;
    position: relative;
    display: inline-grid;
    margin: 5px;
    place-content: center;
    font-size: 25px;
    font-weight: bold;
    font-family: sans-serif;
}
.pie:before,
.pie:after {
    content: "";
    position: absolute;
    border-radius: 50%;
}
.pie:before {
    inset: 0;
    background: radial-gradient(farthest-side, var(--c) 98%, #0000) top/var(--b)
            var(--b) no-repeat,
        conic-gradient(var(--c) calc(var(--p) * 1%), #0000 0);
    -webkit-mask: radial-gradient(
        farthest-side,
        #0000 calc(99% - var(--b)),
        #000 calc(100% - var(--b))
    );
    mask: radial-gradient(
        farthest-side,
        #0000 calc(99% - var(--b)),
        #000 calc(100% - var(--b))
    );
}
.pie:after {
    inset: calc(50% - var(--b) / 2);
    background: var(--c);
    transform: rotate(calc(var(--p) * 3.6deg))
        translateY(calc(50% - var(--w) / 2));
}
.animate {
    animation: p 1s 0.5s both;
}
@keyframes p {
    from {
        --p: 0;
    }
}
</style>
