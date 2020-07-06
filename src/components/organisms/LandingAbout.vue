<template>
  <v-container fluid class="background-blob-desktop">
    <v-row justify="space-around" align="center" class="my-10 background-blob-mobile1">
      <h4
        class="display-1 text-center mb-3 mx-1 hidden-md-and-up"
      >Quickly get feedback on your projects</h4>
      <v-col cols="12" md="5">
        <v-img src="@/assets/aboutTop.png"></v-img>
      </v-col>
      <v-col cols="12" md="6">
        <h4
          class="display-1 text-left mb-3 hidden-sm-and-down"
        >Quickly get feedback on your projects</h4>

        <p
          align="justify"
          style="line-height: 1.6"
        >UX Remote LAB has been created to give a set of toold for different UX experts that want to create their own UX tests and perform it with the users.</p>
        <p
          align="justify"
          style="line-height: 1.6"
        >COVID-19 has shown to the world that sometimes the physical presence of real users is not possible so we are here to solve this problem!</p>

        <!-- <v-row justify="center">
          <v-btn outlined rounded class="mt-2">Read More</v-btn>
        </v-row>-->
      </v-col>
    </v-row>

    <v-row justify="space-around" align="center" class="my-10 background-blob-mobile2">
      <v-col cols="12" md="5">
        <h4 class="display-1 text-left mb-3 hidden-sm-and-down">Start your own UX LAB</h4>
        <h4 class="display-1 text-center mb-3 hidden-md-and-up">Start your own UX LAB</h4>

        <v-img src="@/assets/aboutBottom.png" class="mb-4 hidden-md-and-up"></v-img>

        <p
          align="justify"
          style="line-height: 1.6"
        >If you are a researcher, a company, or a professional that you want to perform an UX test, here you will find several tools to help to aanalyze and track your tests using different UX techniques.</p>
        <p
          align="justify"
          style="line-height: 1.6"
        >Help us to grou up this Open Source community and join us on gitlab! :)</p>
        <v-row justify="left" class="hidden-sm-and-down">
          <v-btn outlined rounded class="mt-2">See the Code</v-btn>
        </v-row>
        <v-row justify="center" class="hidden-md-and-up">
          <v-btn outlined rounded class="mt-2">See the Code</v-btn>
        </v-row>
      </v-col>

      <v-col cols="12" md="5" class="hidden-sm-and-down">
        <v-img src="@/assets/aboutBottom.png"></v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.background-blob-desktop {
  background-image: url("https://i.ibb.co/C7F8Vmq/blob.png");
  background-size: contain;
  background-position: center;
}
.background-blob-mobile1 {
  background-image: none;
}
.background-blob-mobile2 {
  background-image: none;
}

@media screen and (max-width: 960px) {
  .background-blob-desktop {
    background-image: none;
  }
  .background-blob-mobile1 {
  background-image: url("https://i.ibb.co/C7F8Vmq/blob.png");
  background-size: contain;
  background-position: center;
  }
  .background-blob-mobile2 {
  background-image: url("https://i.ibb.co/hgZWz0Z/blob2.png");
  background-size: contain;
  background-position: center;
  
  }
}
</style>
