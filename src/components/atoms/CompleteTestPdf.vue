<template>
  <div class="whole-test">
    <button @click="makePdf('makepdf')">pdf</button>
    <div id="makepdf" class="whole-test-title">{{ title }}</div>
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
                <div class="answers-option" v-if="question.comments1 != 0">
                  {{ resp1 }} -
                  {{ question.value1 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments1"
                      :key="comment.id"
                    >
                      {{ index + 1 }} - {{ comment }}
                      <br />
                    </li>
                  </ul>
                </div>
                <div class="answers-option " v-if="question.comments2 != 0">
                  {{ resp2 }} -
                  {{ question.value2 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments2"
                      :key="comment.id"
                    >
                      {{ index + 1 }} - {{ comment }}
                      <br />
                    </li>
                  </ul>
                </div>
                <div class="answers-option" v-if="question.comments3 != 0">
                  {{ resp3 }} -
                  {{ question.value3 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments3"
                      :key="comment.id"
                    >
                      {{ index + 1 }} - {{ comment }}
                      <br />
                    </li>
                  </ul>
                </div>
                <div class="answers-option" v-if="question.comments4 != 0">
                  {{ resp4 }} -
                  {{ question.value4 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments4"
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
export default {
  data: () => ({
    title: 'Havaluacion heuristica',
    heuristics: [
      {
        id: 0,
        title: 'Visibilidad y estado del sistema ',
        questions: [
          {
            title:
              'La aplicación incluye de forma visible el título de la página, de la sección o del sitio?',

            value1: '8',
            value2: '2',
            value3: '0',
            value4: '0',

            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'El usuario sabe en todo momento dónde está?',

            value1: '3',

            value2: '7',
            value3: '0',
            value4: '0',
            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title:
              'El usuario sabe en todo momento qué está haciendo el sistema o aplicación?',

            value1: '1',

            value2: '9',
            value3: '0',
            value4: '0',
            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'Los enlaces están claramente definidos?',

            value1: '6',

            value2: '4',
            value3: '0',
            value4: '0',
            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title:
              'Todas las acciones pueden verse directamente? (Sin requerir acciones adicionales)s',

            value1: '5',

            value2: '5',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
            ],
            comments2: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments3: [],
            comments4: [],
          },
        ],
      },
      {
        id: 0,
        title:
          'Connexión entre el sistema y el mundo real, uso de metáforas y objetos humanos',
        questions: [
          {
            title:
              'La información aparece de una manera lógica para el usuario común?',

            value1: '10',

            value2: '0',
            value3: '0',
            value4: '0',
            comments1: [],
            comments2: ['puta', 'tales'],
            comments3: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments4: [],
          },
          {
            title:
              'El diseño de los iconos se correspone con objetos cotidianos?',
            value1: '2',
            value2: '2',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
              'asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
              'asdfasdfa',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'Cada icono realiza la acción que el usuario espera?',
            value1: '4',
            value2: '5',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
              'asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
              'asdfasdfa',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'Se utilizan frases y conceptos familiares para el usuario?',

            value1: '1',
            value2: '4',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
              'asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
              'asdfasdfa',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
        ],
      },
    ],

    resp1: 'Si/Yes',
    resp2: 'Ni Sí, ni No / Neither',
    resp3: 'No',
    resp4: 'No aplica-No es problema / Not applicable-It is not a problem',

    barColors: [
      '#b91d47',
      '#F6F614',
      '#41CA2B',
      '#00aba9',
      '#2b5797',
      '#e8c3b9',
      '#1e7145',
      '#712BCA',
      '#B81818',
    ],
  }),
  methods: {
    makePdf(divName) {
      console.log(divName)
      console.log(document)
      window.print()
    },
  },
}
</script>

<style>
ul,
li {
  width: 100%;
  margin: 1rem;
}
.whole-test {
  display: hidden !important;
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

  canvas {
    display: none;
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
  li {
    max-width: 95%;
    text-align: justify;
    margin-left: 0;
  }
  .heuristic-question {
    page-break-after: always;
  }
  .answers-option {
    page-break-after: always;
  }
}
</style>
<template>
  <div class="whole-test">
    <button @click="makePdf('makepdf')">pdf</button>
    <div id="makepdf" class="whole-test-title">{{ title }}</div>
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
                <div class="answers-option" v-if="question.comments1 != 0">
                  {{ resp1 }} -
                  {{ question.value1 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments1"
                      :key="comment.id"
                    >
                      {{ index + 1 }} - {{ comment }}
                      <br />
                    </li>
                  </ul>
                </div>
                <div class="answers-option " v-if="question.comments2 != 0">
                  {{ resp2 }} -
                  {{ question.value2 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments2"
                      :key="comment.id"
                    >
                      {{ index + 1 }} - {{ comment }}
                      <br />
                    </li>
                  </ul>
                </div>
                <div class="answers-option" v-if="question.comments3 != 0">
                  {{ resp3 }} -
                  {{ question.value3 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments3"
                      :key="comment.id"
                    >
                      {{ index + 1 }} - {{ comment }}
                      <br />
                    </li>
                  </ul>
                </div>
                <div class="answers-option" v-if="question.comments4 != 0">
                  {{ resp4 }} -
                  {{ question.value4 }}
                  <ul>
                    <li
                      v-for="(comment, index) in question.comments4"
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
    title: 'Havaluacion heuristica',
    heuristics: [
      {
        id: 0,
        title: 'Visibilidad y estado del sistema ',
        questions: [
          {
            title:
              'La aplicación incluye de forma visible el título de la página, de la sección o del sitio?',

            value1: '8',
            value2: '2',
            value3: '0',
            value4: '0',

            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'El usuario sabe en todo momento dónde está?',

            value1: '3',

            value2: '7',
            value3: '0',
            value4: '0',
            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title:
              'El usuario sabe en todo momento qué está haciendo el sistema o aplicación?',

            value1: '1',

            value2: '9',
            value3: '0',
            value4: '0',
            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'Los enlaces están claramente definidos?',

            value1: '6',

            value2: '4',
            value3: '0',
            value4: '0',
            comments1: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title:
              'Todas las acciones pueden verse directamente? (Sin requerir acciones adicionales)s',

            value1: '5',

            value2: '5',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
            ],
            comments2: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments3: [],
            comments4: [],
          },
        ],
      },
      {
        id: 0,
        title:
          'Connexión entre el sistema y el mundo real, uso de metáforas y objetos humanos',
        questions: [
          {
            title:
              'La información aparece de una manera lógica para el usuario común?',

            value1: '10',

            value2: '0',
            value3: '0',
            value4: '0',
            comments1: [],
            comments2: ['puta', 'tales'],
            comments3: [
              "I recently discovered a new type of fruit that's called a kiwano, and it tastes like a mix of cucumber and kiwi! It has a spiky exterior that's yellow and orange, and the flesh is green with edible seeds. It's so unique and refreshing, and I love adding it to salads or smoothies.",
              "Have you ever tried bubble tea before? It's a Taiwanese drink that has tea, milk, and chewy tapioca pearls. It's a fun and tasty drink that comes in all sorts of flavors like taro, matcha, or mango. The tapioca pearls add a nice texture to the drink, and it's perfect for a hot day.",
              "I recently watched a documentary about the Great Barrier Reef, and it's such a fascinating and beautiful place. It's home to thousands of species of fish, coral, and other marine life, and it's one of the natural wonders of the world. It's also facing many challenges like coral bleaching and climate change, so it's important that we protect it for future generations.",
              'I went on a hike last weekend and saw the most amazing sunset. The sky was painted with shades of pink, purple, and orange, and it was so peaceful and serene. It reminded me of the beauty of nature and how important it is to take time to appreciate it.',
              "I recently started learning how to code, and it's been challenging but also very rewarding. It's amazing to see how a few lines of code can create a website or an app, and I'm excited to see where this new skill will take me.",
              "I love watching cooking shows and trying out new recipes. One of my favorite dishes to make is homemade pizza with fresh ingredients like tomatoes, basil, and mozzarella cheese. It's a fun and delicious activity to do with friends or family, and you can customize it to your liking.",
              "I'm a big fan of reading, and I just finished a novel called 'The Nightingale' by Kristin Hannah. It's a historical fiction set in World War II and tells the story of two sisters who navigate the challenges of war and occupation. It's a heartbreaking but inspiring story, and it made me appreciate the sacrifices of those who lived through that time.",
              "I recently visited a museum dedicated to the history of space exploration, and it was mind-blowing. I saw real rockets, spacesuits, and artifacts from the Apollo missions. It made me realize how far we've come in our understanding of the universe, and how much more we have to discover.",
            ],
            comments4: [],
          },
          {
            title:
              'El diseño de los iconos se correspone con objetos cotidianos?',
            value1: '2',
            value2: '2',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
              'asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
              'asdfasdfa',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'Cada icono realiza la acción que el usuario espera?',
            value1: '4',
            value2: '5',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
              'asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
              'asdfasdfa',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
          {
            title: 'Se utilizan frases y conceptos familiares para el usuario?',

            value1: '1',
            value2: '4',
            value3: '0',
            value4: '0',
            comments1: [
              'A todo momento o título é visível',
              'dfjasdfnasdnfkajsndfjasdofkaokdfa',
              'asdkfnalksdlkm,ml,smkmodflaknsudnfasjsssssssssssssssss',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
              'asdfasdfa',
              'asdfasdfasdfasdfasdfasdf',
              'werqfgxcbnhgjygsdfSDGFSHFHJDASDFASFA',
            ],
            comments2: ['puta', 'tales'],
            comments3: [],
            comments4: [],
          },
        ],
      },
    ],

    resp1: 'Si/Yes',
    resp2: 'Ni Sí, ni No / Neither',
    resp3: 'No',
    resp4: 'No aplica-No es problema / Not applicable-It is not a problem',

    barColors: [
      '#b91d47',
      '#F6F614',
      '#41CA2B',
      '#00aba9',
      '#2b5797',
      '#e8c3b9',
      '#1e7145',
      '#712BCA',
      '#B81818',
    ],
  }),
  methods: {
    makePdf(divName) {
      console.log(divName)
      console.log(document)
      window.print()
    },
  },
}
</script>

<style>
ul,
li {
  width: 100%;
  margin: 1rem;
}
.whole-test {
  display: hidden !important;
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

  canvas {
    display: none;
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
  li {
    max-width: 95%;
    text-align: justify;
    margin-left: 0;
  }
  .heuristic-question {
    page-break-after: always;
  }
  .answers-option {
    page-break-after: always;
  }
}
</style>
