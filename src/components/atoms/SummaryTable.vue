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
          <tr>
            <td>Name 1</td>
            <td>25%</td>
            <td>Annoyance</td>
            <td>10 minutes</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>
  </template>
  
  <script>
  export default {
    name: 'SummaryTable',
  }
  </script>
  
  <style scoped>
  .v-card {
    border: 1px solid #f4b700;
  }
  </style>
  