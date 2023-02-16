<template>
    <div class="whole-test">
        <button @click="makePdf('makepdf')">pdf</button>
        <div id="makepdf" class="whole-test-title">{{ title }}</div>
        <!-- <canvas id="myChart" style="width:100%;max-width:700px"></canvas>
        <image id="image1"></image> -->

        <!-- <button @click="convertToImage()">Convert to Image Element</button>
        <div id="imageContainer"></div>
        <button @click="teste()">tales</button> -->

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
                            <div class="answers">
                                <div
                                    class="answers-option"
                                    v-if="question.comments1 != 0"
                                >
                                    {{ resp1 }} -
                                    {{ question.value1 }}
                                    <ul>
                                        <li
                                            v-for="(comment,
                                            index) in question.comments1"
                                            :key="comment.id"
                                        >
                                            {{ index + 1 }} - {{ comment }}
                                            <br />
                                        </li>
                                    </ul>
                                </div>
                                <div
                                    class="answers-option "
                                    v-if="question.comments2 != 0"
                                >
                                    {{ resp2 }} -
                                    {{ question.value2 }}
                                    <ul>
                                        <li
                                            v-for="(comment,
                                            index) in question.comments2"
                                            :key="comment.id"
                                        >
                                            {{ index + 1 }} - {{ comment }}
                                            <br />
                                        </li>
                                    </ul>
                                </div>
                                <div
                                    class="answers-option"
                                    v-if="question.comments3 != 0"
                                >
                                    {{ resp3 }} -
                                    {{ question.value3 }}
                                    <ul>
                                        <li
                                            v-for="(comment,
                                            index) in question.comments3"
                                            :key="comment.id"
                                        >
                                            {{ index + 1 }} - {{ comment }}
                                            <br />
                                        </li>
                                    </ul>
                                </div>
                                <div
                                    class="answers-option"
                                    v-if="question.comments4 != 0"
                                >
                                    {{ resp4 }} -
                                    {{ question.value4 }}
                                    <ul>
                                        <li
                                            v-for="(comment,
                                            index) in question.comments4"
                                            :key="comment.id"
                                        >
                                            {{ index + 1 }} - {{ comment }}
                                            <br />
                                        </li>
                                    </ul>
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
// import Chart from "chart.js";
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

                        value1: "8",
                        value2: "2",
                        value3: "0",
                        value4: "0",

                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title: "El usuario sabe en todo momento dónde está?",

                        value1: "3",

                        value2: "7",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title:
                            "El usuario sabe en todo momento qué está haciendo el sistema o aplicación?",

                        value1: "1",

                        value2: "9",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title: "Los enlaces están claramente definidos?",

                        value1: "6",

                        value2: "4",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title:
                            "Todas las acciones pueden verse directamente? (Sin requerir acciones adicionales)s",

                        value1: "5",

                        value2: "5",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
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

                        value1: "10",

                        value2: "0",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title:
                            "El diseño de los iconos se correspone con objetos cotidianos?",
                        value1: "2",
                        value2: "2",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title:
                            "Cada icono realiza la acción que el usuario espera?",
                        value1: "4",
                        value2: "5",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                    {
                        title:
                            "Se utilizan frases y conceptos familiares para el usuario?",

                        value1: "1",
                        value2: "4",
                        value3: "0",
                        value4: "0",
                        comments1: [
                            "A todo momento o título é visível",
                            "dfjasdfnasdnfkajsndfjasdofkaokdfa",
                            "asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                            "asdfasdfa",
                            "asdfasdfasdfasdfasdfasdf",
                            "werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA",
                        ],
                        comments2: ["puta", "tales"],
                        comments3: [],
                        comments4: [],
                    },
                ],
            },
        ],

        resp1: "Si/Yes",
        resp2: "Ni Sí, ni No / Neither",
        resp3: "No",
        resp4: "No aplica-No es problema / Not applicable-It is not a problem",

        // barColors: [
        //     "#b91d47",
        //     "#F6F614",
        //     "#41CA2B",
        //     "#00aba9",
        //     "#2b5797",
        //     "#e8c3b9",
        //     "#1e7145",
        //     "#712BCA",
        //     "#B81818",
        // ],
    }),
    methods: {
        // teste() {
        //     console.log(this.heuristics[1].questions);
        //     let auxTitle = [];
        //     let auxAnsw = [];
        //     let auxValue = [];
        //     for (let i = 0; i < this.heuristics.length; i++) {
        //         for (let j = 0; j < this.heuristics[i].questions.length; j++) {
        //             auxTitle.push(this.heuristics[i].questions[j].title);
        //             auxAnsw.push(this.heuristics[i].questions[j].resp1);
        //             auxValue.push(
        //                 parseInt(this.heuristics[i].questions[j].value1)
        //             );
        //         }
        //     }
        //     console.log(this.heuristics[0].questions[0].value1);
        //     console.log(auxValue);
        //     new Chart("myChart", {
        //         type: "pie",
        //         data: {
        //             labels: auxTitle,
        //             datasets: [
        //                 {
        //                     backgroundColor: this.barColors,
        //                     data: auxValue,
        //                 },
        //             ],
        //         },
        //         options: {
        //             title: {
        //                 display: true,
        //                 text: this.heuristics[0].title,
        //             },
        //         },
        //     });

        //     let canvas = document.getElementById("myChart");
        //     let image = new Image();
        //     image.src = canvas.toDataURL();

        //     document.getElementById("image1").appendChild(image);
        // },

        makePdf(divName) {
            console.log(divName);
            console.log(document);
            window.print();
        },
        // convertToImage() {
        //     // Get the canvas element
        //     var canvas = document.getElementById("myChart");
        //     // Get the 2D rendering context for the canvas

        //     // Create a new image element
        //     var img = new Image();
        //     // Set the source of the image to the data URI for the canvas
        //     img.src = canvas.toDataURL("image/png");
        //     // Add the image to the page
        //     var container = document.getElementById("imageContainer");
        //     container.appendChild(img);
        // },
    },
};
</script>

<style>
ul,
li {
    width: 100%;
    margin: 1rem;
}
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
    font-size: xx-large;
    background-color: rgb(240, 238, 238);
    padding-left: 10px;
}
.heuristic-question {
    font-size: x-large;
    font-weight: bold;

    padding-left: 50px;
}
.heuristic-question-answers {
    padding-left: 22px;
    display: block;
    width: 100%;
    justify-content: space-around;
}

.answers {
    width: 100%;
    font-size: large;
    padding-top: 2%;

    /* display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: 2fr repeat(4, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px; */
}

@media print {
    * {
        visibility: hidden;
    }
    .whole-test-title,
    .heuristic,
    .heuristic-title,
    .heuristic-question,
    .heuristic-question-answers,
    .answers,
    .answers-option,
    ul,
    li {
        visibility: visible !important;
    }
    header {
        display: none !important;
    }
    .print {
        background-color: white;
        height: 100%;
        width: 100%;
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        margin: 0;
        padding: 15px;
        font-size: 14px;
        line-height: 18px;
    }
    @page {
        margin-top: 2cm;
        margin-bottom: 2cm;
        margin-left: 2cm;
        margin-right: 2cm;
    }

    p {
        page-break-inside: avoid;
    }

    .heuristic-question {
        page-break-after: always;
    }
    .answers-option {
        page-break-after: always;
    }
}
</style>
