<template>
  <v-container fluid class="background-blob">
    <v-row justify="space-around" align="center" class="ma-10">
      <v-col cols="12" sm="5">
        <v-img src="@/assets/aboutTop.png"></v-img>
      </v-col>
      <v-col cols="12" sm="6">
        <h4 class="display-1 text-left mb-3">Quickly get feedback on your projects</h4>
        <p
          align="justify"
          style="line-height: 1.6"
          >UX Remote LAB has been created to give a set of toold for different UX experts that want to create their own UX tests and perform it with the users.</p>
        <p
          align="justify"
          style="line-height: 1.6"
          >COVID-19 has shown to the world that sometimes the physical presence of real users is not possible so we are here to solve this problem!</p>
        <v-row justify="center" class="d-none">
          <v-btn outlined rounded class="mt-2">Read More</v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="space-around" align="center" class="ma-10">
      <v-col cols="12" sm="5">
        <h4 class="display-1 text-left mb-3">Start your own UX LAB</h4>
        <p
          align="justify"
          style="line-height: 1.6"
        >If you are a researcher, a company, or a professional that you want to perform an UX test, here you will find several tools to help to aanalyze and track your tests using different UX techniques.</p>
        <p
          align="justify"
          style="line-height: 1.6"
        >Help us to grou up this Open Source community and join us on gitlab! :)</p>
        <v-row justify="left" class="">
          <v-btn outlined rounded class="mt-2">See the Code</v-btn>
        </v-row>
      </v-col>

      <v-col cols="12" sm="5">
        <v-img src="@/assets/aboutBottom.png"></v-img>
      </v-col>
    </v-row>


  </v-container>
</template>

<style scoped>
.background-blob {
  background-image: url("https://i.ibb.co/C7F8Vmq/blob.png");
  background-size: contain;
  background-position: center;
}
</style>
