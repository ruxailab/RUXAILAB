<template>
  <v-card class="mx-auto my-4 pa-2" outlined>
    <v-simple-table>
      <thead>
        <tr>
          <th class="text-left">COLLABORATOR</th>
          <th class="text-left">AVG ATTENTION</th>
          <th class="text-left">DOMINANT EMOTION</th>
          <th class="text-left">CONTINUED FOCUS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="collaborator in collaborators" :key="collaborator.name">
          <td>{{ collaborator.name }}</td>
          <td>{{ collaborator.attention }}</td>
          <td>{{ collaborator.emotion }}</td>
          <td>{{ collaborator.focus }}</td>
        </tr>
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
</style>
