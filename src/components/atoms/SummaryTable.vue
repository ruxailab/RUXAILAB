<template>
  <v-card class="mx-auto my-4 pa-2" outlined>
    <v-simple-table>
      <thead>
        <tr>
          <th class="text-center">COLLABORATOR</th>
          <th class="text-center">AVG HAPPINESS</th>
          <th class="text-center">DOMINANT EMOTION</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="collaborator in collaborators" :key="collaborator.name">
          <td class="text-center">{{ collaborator.name }}</td>
          <td class="text-center">{{ collaborator.attention }}</td>
          <td class="text-center">{{ collaborator.emotion }}</td>        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
export default {
  name: 'SummaryTable',
  props: {
    collaborators: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped>
.v-card {
  border: 1px solid #f4b700;
}
.text-center {
  text-align: center;
}
</style>
