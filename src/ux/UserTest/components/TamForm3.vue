<template>
  <v-form ref="form" v-model="valid">
    <!-- Information header -->
    <v-card variant="outlined" color="primary" class="mb-6">
      <v-card-text class="text-center">
        <v-icon size="48" color="primary" class="mb-2">mdi-router-wireless</v-icon>
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          Technology Acceptance Model - TAM-3
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Comprehensive technology acceptance assessment based on TAM-3 (Venkatesh & Bala 2008). Rate each statement on a scale from <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          This advanced assessment measures {{ completedCount }}/38 items across the integrated TAM-3 model.
        </p>
      </v-card-text>
    </v-card>

    <!-- Tab Navigation -->
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="form">Form</v-tab>
      <v-tab value="summary">Summary</v-tab>
    </v-tabs>

    <!-- Form Content -->
    <div v-show="activeTab === 'form'">
      <!-- Progress indicator -->
      <div class="d-flex align-center mb-4">
        <span class="text-subtitle-1">Progress: {{ completedCount }}/38</span>
        <v-progress-linear
          class="ml-4"
          :model-value="(completedCount / 38) * 100"
          :color="completedCount === 38 ? 'success' : 'primary'"
        />
      </div>

    <!-- Perceived Usefulness -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-blue-darken-4">
        <v-icon size="24" color="blue-darken-4" class="mr-2">mdi-target-variant</v-icon>
        Perceived Usefulness (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in puQuestions" :key="`pu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedUsefulness[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedUsefulness[i]" inline @update:model-value="updateDimensionAnswer('perceivedUsefulness', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Ease of Use -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-green-darken-4">
        <v-icon size="24" color="green-darken-4" class="mr-2">mdi-lightning-bolt</v-icon>
        Perceived Ease of Use (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in peuQuestions" :key="`peu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedEaseOfUse[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedEaseOfUse[i]" inline @update:model-value="updateDimensionAnswer('perceivedEaseOfUse', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Subjective Norm -->
    <v-card variant="outlined" class="mb-6 pa-4" color="pink-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-pink-darken-4">
        <v-icon size="24" color="pink-darken-4" class="mr-2">mdi-people</v-icon>
        Subjective Norm (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in snQuestions" :key="`sn-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.subjectiveNorm[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.subjectiveNorm[i]" inline @update:model-value="updateDimensionAnswer('subjectiveNorm', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Image -->
    <v-card variant="outlined" class="mb-6 pa-4" color="orange-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-orange-darken-4">
        <v-icon size="24" color="orange-darken-4" class="mr-2">mdi-image</v-icon>
        Image (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in imgQuestions" :key="`img-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.image[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.image[i]" inline @update:model-value="updateDimensionAnswer('image', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Job Relevance -->
    <v-card variant="outlined" class="mb-6 pa-4" color="cyan-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-cyan-darken-4">
        <v-icon size="24" color="cyan-darken-4" class="mr-2">mdi-briefcase</v-icon>
        Job Relevance (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in jrQuestions" :key="`jr-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.jobRelevance[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.jobRelevance[i]" inline @update:model-value="updateDimensionAnswer('jobRelevance', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Output Quality -->
    <v-card variant="outlined" class="mb-6 pa-4" color="teal-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-teal-darken-4">
        <v-icon size="24" color="teal-darken-4" class="mr-2">mdi-check-all</v-icon>
        Output Quality (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in oqQuestions" :key="`oq-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.outputQuality[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.outputQuality[i]" inline @update:model-value="updateDimensionAnswer('outputQuality', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Result Demonstrability -->
    <v-card variant="outlined" class="mb-6 pa-4" color="deep-orange-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-deep-orange-darken-4">
        <v-icon size="24" color="deep-orange-darken-4" class="mr-2">mdi-lightbulb-on</v-icon>
        Result Demonstrability (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in rdQuestions" :key="`rd-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.resultDemonstrability[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.resultDemonstrability[i]" inline @update:model-value="updateDimensionAnswer('resultDemonstrability', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Computer Self-Efficacy -->
    <v-card variant="outlined" class="mb-6 pa-4" color="indigo-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-indigo-darken-4">
        <v-icon size="24" color="indigo-darken-4" class="mr-2">mdi-brain</v-icon>
        Computer Self-Efficacy (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in cseQuestions" :key="`cse-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.computerSelfEfficacy[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.computerSelfEfficacy[i]" inline @update:model-value="updateDimensionAnswer('computerSelfEfficacy', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceptions of External Control -->
    <v-card variant="outlined" class="mb-6 pa-4" color="teal-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-teal-darken-4">
        <v-icon size="24" color="teal-darken-4" class="mr-2">mdi-lock-open</v-icon>
        Perceptions of External Control (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in pecQuestions" :key="`pec-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceptionsOfExternalControl[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceptionsOfExternalControl[i]" inline @update:model-value="updateDimensionAnswer('perceptionsOfExternalControl', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Computer Anxiety -->
    <v-card variant="outlined" class="mb-6 pa-4" color="red-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-red-darken-4">
        <v-icon size="24" color="red-darken-4" class="mr-2">mdi-alert-circle</v-icon>
        Computer Anxiety (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in caQuestions" :key="`ca-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.computerAnxiety[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.computerAnxiety[i]" inline @update:model-value="updateDimensionAnswer('computerAnxiety', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Computer Playfulness -->
    <v-card variant="outlined" class="mb-6 pa-4" color="amber-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-amber-darken-4">
        <v-icon size="24" color="amber-darken-4" class="mr-2">mdi-gamepad-variant</v-icon>
        Computer Playfulness (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in cpQuestions" :key="`cp-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.computerPlayfulness[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.computerPlayfulness[i]" inline @update:model-value="updateDimensionAnswer('computerPlayfulness', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Enjoyment -->
    <v-card variant="outlined" class="mb-6 pa-4" color="lime-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-lime-darken-4">
        <v-icon size="24" color="lime-darken-4" class="mr-2">mdi-heart</v-icon>
        Perceived Enjoyment (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in peQuestions" :key="`pe-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedEnjoyment[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedEnjoyment[i]" inline @update:model-value="updateDimensionAnswer('perceivedEnjoyment', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Objective Usability -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-green-darken-4">
        <v-icon size="24" color="green-darken-4" class="mr-2">mdi-check-circle</v-icon>
        Objective Usability (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in ouQuestions" :key="`ou-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.objectiveUsability[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.objectiveUsability[i]" inline @update:model-value="updateDimensionAnswer('objectiveUsability', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Behavioral Intention -->
    <v-card variant="outlined" class="mb-6 pa-4" color="purple-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-purple-darken-4">
        <v-icon size="24" color="purple-darken-4" class="mr-2">mdi-target-check</v-icon>
        Behavioral Intention (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in biQuestions" :key="`bi-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.behavioralIntention[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.behavioralIntention[i]" inline @update:model-value="updateDimensionAnswer('behavioralIntention', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Use Behavior -->
    <v-card variant="outlined" class="mb-6 pa-4" color="orange-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-orange-darken-4">
        <v-icon size="24" color="orange-darken-4" class="mr-2">mdi-pulse</v-icon>
        Use Behavior (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in useQuestions" :key="`use-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.usePatterns[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.usePatterns[i]" inline @update:model-value="updateDimensionAnswer('usePatterns', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Experience -->
    <v-card variant="outlined" class="mb-6 pa-4" color="teal-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-teal-darken-4">
        <v-icon size="24" color="teal-darken-4" class="mr-2">mdi-history</v-icon>
        Experience (Moderator) (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in expQuestions" :key="`exp-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.experience[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.experience[i]" inline @update:model-value="updateDimensionAnswer('experience', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Voluntariness -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-grey-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-blue-grey-darken-4">
        <v-icon size="24" color="blue-grey-darken-4" class="mr-2">mdi-hand-okay</v-icon>
        Voluntariness (Moderator) (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in volQuestions" :key="`vol-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.voluntariness[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.voluntariness[i]" inline @update:model-value="updateDimensionAnswer('voluntariness', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>
    </div>

    <!-- Summary Content -->
    <div v-show="activeTab === 'summary'" class="mt-6">
      <!-- Header -->
      <v-card variant="outlined" class="mb-6 pa-6" style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%); color: white;">
        <v-card-title class="text-h5 font-weight-bold">Your TAM-3 Responses</v-card-title>
        <p class="text-body-2 mt-2">Summary of your answers to this TAM-3 assessment</p>
      </v-card>

      <div v-if="completedCount === 0" class="text-center pa-6">
        <v-icon size="64" color="grey">mdi-checkbox-blank-outline</v-icon>
        <p class="text-h6 text-grey mt-4">No responses yet</p>
        <p class="text-body-2 text-grey">Fill out the form to see your responses here</p>
      </div>

      <div v-else>
        <!-- Overall Stats -->
        <v-row class="mb-6">
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #2196F3;">
              <div class="text-caption font-weight-bold text-blue">TOTAL RESPONSES</div>
              <div class="text-h4 font-weight-bold my-2">{{ completedCount }}/38</div>
              <v-progress-linear :model-value="(completedCount / 38) * 100" color="blue" class="mt-2"></v-progress-linear>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #4CAF50;">
              <div class="text-caption font-weight-bold text-success">CONSTRUCTS COMPLETE</div>
              <div class="text-h4 font-weight-bold my-2">{{ completeDimensions }}/17</div>
              <v-progress-linear :model-value="(completeDimensions / 17) * 100" color="success" class="mt-2"></v-progress-linear>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #FF9800;">
              <div class="text-caption font-weight-bold text-warning">OVERALL AVERAGE</div>
              <div class="text-h4 font-weight-bold my-2">{{ overallAverage.toFixed(2) }}/5</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #2196F3;">
              <div class="text-caption font-weight-bold text-primary">STATUS</div>
              <div class="text-h6 font-weight-bold my-2" :style="{ color: completedCount === 38 ? '#4CAF50' : '#FF9800' }">
                {{ completedCount === 38 ? 'COMPLETE' : 'IN PROGRESS' }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Dimensions Breakdown -->
        <v-card variant="outlined" class="pa-6 mb-6">
          <v-card-title class="text-h6 font-weight-bold mb-4">Dimension Scores</v-card-title>
          <v-row>
            <v-col v-for="dimension in summaryDimensions" :key="dimension.key" cols="12" md="6" lg="4">
              <v-card variant="flat" class="pa-4 mb-3" style="border-left: 4px solid;" :style="{ borderLeftColor: dimension.color, background: '#fafafa' }">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-2 font-weight-bold">{{ dimension.label }}</div>
                  <v-chip v-if="dimension.answered > 0" :color="dimension.color" theme="dark" size="small">{{ dimension.average.toFixed(1) }}</v-chip>
                  <v-chip v-else color="grey" theme="dark" size="small">-</v-chip>
                </div>
                <v-progress-linear v-if="dimension.answered > 0" :model-value="(dimension.average / 5) * 100" :color="dimension.color" class="my-2"></v-progress-linear>
                <div class="text-caption text-grey-darken-2">
                  {{ dimension.answered }}/{{ dimension.total }} questions answered
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>

        <!-- Detailed Responses -->
        <v-card variant="outlined" class="pa-6">
          <v-card-title class="text-h6 font-weight-bold mb-4">Your Detailed Responses</v-card-title>
          
          <v-expansion-panels>
            <v-expansion-panel v-for="dimension in detailedResponses" :key="dimension.key">
              <template #title>
                <div class="font-weight-bold" :style="{ color: dimension.color }">
                  {{ dimension.label }} 
                  <v-chip :color="dimension.color" theme="dark" size="x-small" class="ml-2">
                    {{ dimension.responses.filter(r => r.value).length }}/{{ dimension.responses.length }}
                  </v-chip>
                </div>
              </template>
              <template #text>
                <v-table>
                  <thead>
                    <tr>
                      <th scope="col">Question</th>
                      <th scope="col" style="width: 200px;">Your Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(response, idx) in dimension.responses" :key="idx">
                      <td class="text-body-2">{{ response.question }}</td>
                      <td>
                        <v-chip v-if="response.value" :color="dimension.color" theme="dark" size="small">
                          {{ response.value }} - {{ likertLabels[response.value - 1] }}
                        </v-chip>
                        <v-chip v-else color="grey" theme="dark" size="small">Not answered</v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </div>
    </div>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue";

const activeTab = ref('form')

const props = defineProps({
  taskIndex: { type: Number, required: true },
  modelValue: {
    type: Object,
    default: () => ({
      perceivedUsefulness: new Array(3).fill(undefined),
      perceivedEaseOfUse: new Array(3).fill(undefined),
      behavioralIntention: new Array(2).fill(undefined),
      usePatterns: new Array(2).fill(undefined),
      subjectiveNorm: new Array(3).fill(undefined),
      image: new Array(2).fill(undefined),
      jobRelevance: new Array(3).fill(undefined),
      outputQuality: new Array(3).fill(undefined),
      resultDemonstrability: new Array(2).fill(undefined),
      computerSelfEfficacy: new Array(3).fill(undefined),
      perceptionsOfExternalControl: new Array(3).fill(undefined),
      computerAnxiety: new Array(2).fill(undefined),
      computerPlayfulness: new Array(2).fill(undefined),
      perceivedEnjoyment: new Array(3).fill(undefined),
      objectiveUsability: new Array(2).fill(undefined),
      experience: new Array(2).fill(undefined),
      voluntariness: new Array(2).fill(undefined)
    })
  }
});

const emit = defineEmits(['update:modelValue']);
const form = ref(null);
const valid = ref(false);

const likertLabels = ref(["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]);

const puQuestions = ref([
  "Using the technology improves my job performance.",
  "Using the technology increases my productivity.",
  "I find the technology to be useful in my job."
]);

const peuQuestions = ref([
  "My interaction with the technology is clear and understandable.",
  "I find the technology easy to use.",
  "Learning to operate the technology is easy for me."
]);

const snQuestions = ref([
  "People who are important to me would think that I should use the technology.",
  "People who influence my behavior would think that I should use the technology.",
  "People in my organization who use the technology have more prestige than those who do not."
]);

const imgQuestions = ref([
  "Using the technology improves how others perceive me professionally.",
  "Using the technology enhances my professional image."
]);

const jrQuestions = ref([
  "In my job, usage of the technology is important.",
  "In my job, usage of the technology is relevant.",
  "The technology is applicable to my job."
]);

const oqQuestions = ref([
  "The technology provides high-quality output.",
  "I have full confidence in the output of the technology.",
  "The quality of the output from the technology is very good."
]);

const rdQuestions = ref([
  "I would have difficulty explaining why using the technology might be beneficial.",
  "The results of using the technology are apparent to me."
]);

const cseQuestions = ref([
  "I feel confident using the technology.",
  "I can competently use the technology.",
  "I would not feel threatened using the technology if someone was watching me."
]);

const pecQuestions = ref([
  "I have the resources necessary to use the technology.",
  "I have the knowledge necessary to use the technology.",
  "The technology is compatible with other systems I use."
]);

const biQuestions = ref([
  "Assuming I have access to the technology, I intend to use it.",
  "I will strongly recommend this technology to my colleagues."
]);

const useQuestions = ref([
  "How frequently do you use the technology? (1=rarely, 5=constantly)",
  "Approximately how many hours per week do you use the technology?"
]);

const expQuestions = ref([
  "I have prior experience with similar technologies.",
  "I am an experienced computer user."
]);

const volQuestions = ref([
  "My use of the technology is voluntary.",
  "Using the technology is not mandatory in my job."
]);

const caQuestions = ref([
  "Using the technology makes me nervous.",
  "I am apprehensive about using the technology."
]);

const cpQuestions = ref([
  "I find using the technology to be enjoyable.",
  "Using the technology is fun."
]);

const peQuestions = ref([
  "I find the technology enjoyable to use.",
  "Using the technology is pleasurable.",
  "Using the technology is entertaining."
]);

const ouQuestions = ref([
  "The technology is user-friendly.",
  "The technology requires minimal effort to use."
]);

const completedCount = computed(() => {
  let count = 0;
  Object.entries(dimSizes).forEach(([dim, size]) => {
    const arr = answers.value[dim] || [];
    for (let i = 0; i < size; i++) {
      if (typeof arr[i] === 'number') count++;
    }
  });
  return count;
});

const answers = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue);
  }
});

const updateDimensionAnswer = (dimension, index, value) => {
  const newAnswers = { ...answers.value };
  newAnswers[dimension] = [...newAnswers[dimension]];
  newAnswers[dimension][index] = value;
  emit('update:modelValue', newAnswers);
};

// Dimension sizes mapping
const dimSizes = {
  perceivedUsefulness: 3,
  perceivedEaseOfUse: 3,
  behavioralIntention: 2,
  usePatterns: 2,
  subjectiveNorm: 3,
  image: 2,
  jobRelevance: 3,
  outputQuality: 3,
  resultDemonstrability: 2,
  computerSelfEfficacy: 3,
  perceptionsOfExternalControl: 3,
  computerAnxiety: 2,
  computerPlayfulness: 2,
  perceivedEnjoyment: 2,
  objectiveUsability: 2,
  experience: 2,
  voluntariness: 2
};

// Summary computed properties
const dimensionConfig = ref([
  // Core TAM constructs
  { key: 'perceivedUsefulness', label: 'Perceived Usefulness (PU)', questions: puQuestions.value, color: '#2196F3', section: 'core' },
  { key: 'perceivedEaseOfUse', label: 'Perceived Ease of Use (PEOU)', questions: peuQuestions.value, color: '#4CAF50', section: 'core' },
  { key: 'behavioralIntention', label: 'Behavioral Intention (BI)', questions: biQuestions.value, color: '#673AB7', section: 'core' },
  { key: 'usePatterns', label: 'Use Behavior (USE)', questions: useQuestions.value, color: '#FF9800', section: 'core' },
  // Determinants of PU
  { key: 'subjectiveNorm', label: 'Subjective Norm (SN)', questions: snQuestions.value, color: '#E91E63', section: 'puDeterminants' },
  { key: 'image', label: 'Image (IMG)', questions: imgQuestions.value, color: '#9C27B0', section: 'puDeterminants' },
  { key: 'jobRelevance', label: 'Job Relevance (REL)', questions: jrQuestions.value, color: '#00BCD4', section: 'puDeterminants' },
  { key: 'outputQuality', label: 'Output Quality (OUT)', questions: oqQuestions.value, color: '#8BC34A', section: 'puDeterminants' },
  { key: 'resultDemonstrability', label: 'Result Demonstrability (RES)', questions: rdQuestions.value, color: '#FF5722', section: 'puDeterminants' },
  // Determinants of PEOU - Anchors
  { key: 'computerSelfEfficacy', label: 'Computer Self-Efficacy (CSE)', questions: cseQuestions.value, color: '#03A9F4', section: 'peuAnchors' },
  { key: 'perceptionsOfExternalControl', label: 'Perceptions of External Control (PEC)', questions: pecQuestions.value, color: '#009688', section: 'peuAnchors' },
  { key: 'computerAnxiety', label: 'Computer Anxiety (CANX)', questions: caQuestions.value, color: '#F44336', section: 'peuAnchors' },
  { key: 'computerPlayfulness', label: 'Computer Playfulness (CPLAY)', questions: cpQuestions.value, color: '#FF5722', section: 'peuAnchors' },
  // Determinants of PEOU - Adjustments
  { key: 'perceivedEnjoyment', label: 'Perceived Enjoyment (ENJ)', questions: peQuestions.value, color: '#FFEB3B', section: 'peuAdjustments' },
  { key: 'objectiveUsability', label: 'Objective Usability (OU)', questions: ouQuestions.value, color: '#4CAF50', section: 'peuAdjustments' },
  // Moderators
  { key: 'experience', label: 'Experience (EXP)', questions: expQuestions.value, color: '#2E7D32', section: 'moderators' },
  { key: 'voluntariness', label: 'Voluntariness (VOL)', questions: volQuestions.value, color: '#455A64', section: 'moderators' }
]);

const summaryDimensions = computed(() => {
  return dimensionConfig.value.map(dim => {
    const responses = answers.value[dim.key] || [];
    const validSize = dimSizes[dim.key] || responses.length;
    let answered = 0;
    let sum = 0;
    for (let i = 0; i < validSize; i++) {
      if (typeof responses[i] === 'number') {
        answered++;
        sum += responses[i];
      }
    }
    const average = answered > 0 ? sum / answered : 0;
    return {
      key: dim.key,
      label: dim.label,
      color: dim.color,
      average,
      answered,
      total: validSize
    };
  });
});

const detailedResponses = computed(() => {
  return dimensionConfig.value.map(dim => {
    const responses = answers.value[dim.key] || [];
    return {
      key: dim.key,
      label: dim.label,
      color: dim.color,
      responses: dim.questions.map((question, idx) => ({
        question,
        value: responses[idx]
      }))
    };
  });
});

const completeDimensions = computed(() => {
  return dimensionConfig.value.filter(dim => {
    const responses = answers.value[dim.key] || [];
    const validSize = dimSizes[dim.key] || responses.length;
    for (let i = 0; i < validSize; i++) {
      if (typeof responses[i] !== 'number') return false;
    }
    return true;
  }).length;
});

const overallAverage = computed(() => {
  let totalScore = 0;
  let totalAnswers = 0;
  
  dimensionConfig.value.forEach(dim => {
    const responses = answers.value[dim.key] || [];
    const validSize = dimSizes[dim.key] || responses.length;
    for (let i = 0; i < validSize; i++) {
      if (typeof responses[i] === 'number') {
        totalScore += responses[i];
        totalAnswers++;
      }
    }
  });
  
  return totalAnswers > 0 ? totalScore / totalAnswers : 0;
});
</script>

<style scoped>
.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
}

:deep(.v-radio .v-label) {
  color: rgba(0, 0, 0, 0.87) !important;
}

:deep(.v-radio.v-selection-control--checked .v-icon) {
  color: #1e3a8a !important;
}

:deep(.v-radio .v-selection-control__input .v-icon) {
  color: #1e3a8a !important;
}
</style>
