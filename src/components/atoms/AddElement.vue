<template>
  <v-dialog v-model="dialog" width="800" persistent>
    <v-card>
        <v-card-title
          class="headline white--text"
          style="background-color:#fca326"
          primary-title
        >{{items.title}}</v-card-title>
        <v-stepper v-model="el">
            <v-stepper-header v-if="items.steps.length > 1">
                <div v-for="(step,i) in items.steps" :key="i">
                    <v-stepper-step 
                     color="#fca326"
                     :step="i+1" 
                     :complete="step>i"
                    >{{step.stepTitle}}</v-stepper-step>
                </div>
            </v-stepper-header>
             <v-stepper-items>
                <v-stepper-content v-for="(step,i) in items.steps" :key="i" :step="i+1">
                    <v-row>
                        <v-col>
                            <v-form :ref="`form${i}`" @submit.prevent="items.steps.lenght < i+1? next(i) : submmit(i) " >
                                {{step}}
                                <v-text-field
                                    v-model="step.model"
                                    dense
                                    :label="step.label"
                                    outlined
                                    :rules="step.rules"
                                    autofocus
                                ></v-text-field>
                            </v-form>
                        </v-col>
                    </v-row>
                     
                </v-stepper-content>
                
             </v-stepper-items>
        </v-stepper>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
    props: ["dialog","items"],
    data:()=>({
        el:1
    }),
    methods:{
        close(i){
            this.$emit('close') 
            console.log(i)
            this.$refs[`form${i}`].resetValidation();
        },
        next(i){
            console.log(this.$refs)
            if(this.$refs[`form${i}`].validate())
                this.el += 1 
        },
        back(){
            this.el -= 1
        },
        submmit(){

        }
        
    }
 
}
</script>

<style>

</style>