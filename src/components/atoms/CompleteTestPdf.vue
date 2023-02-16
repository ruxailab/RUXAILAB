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
                                <div class="answers-option">
                                    {{ resp1 }} -
                                    {{ question.value1 }}
                                </div>
                                <div class="answers-option">
                                    {{ resp2 }} - {{ question.value2 }}
                                </div>
                                <div class="answers-option">
                                    {{ resp3 }} - {{ question.value2 }}
                                </div>
                                <div class="answers-option">
                                    {{ resp4 }} - {{ question.value2 }}
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
                        resp1: "Si/Yes",
                        value1: "8",
                        resp2: "Ni Sí, ni No / Neither",
                        value2: "2",
                        resp3: "No",
                        resp4:
                            "No aplica-No es problema / Not applicable-It is not a problem",
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
    background-color: rgb(240, 238, 238);
    padding-left: 10px;
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

.answers {
    min-width: 800px;
}

@media print {
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
    canvas {
        visibility: hidden;
    }
    .question-page {
        page-break-after: always;
    }
    .buttonIsHidden {
        visibility: hidden;
    }

    .img-container {
        text-align: center !important;
    }

    p {
        page-break-inside: avoid;
    }

    .heuristic-question {
        page-break-after: always;
    }
}
</style>
