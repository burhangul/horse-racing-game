<script setup lang="ts"></script>

<template>
  <v-container fluid class="fill-height d-flex align-center justify-center">
    <v-card class="not-found-card border-thin pa-8 text-center" max-width="520">
      <v-icon icon="mdi-horse-variant" size="84" color="warning" class="mb-4" />
      <h1 class="text-h4 font-weight-bold mb-2">404</h1>
      <p class="text-h6 mb-2">The horse you are looking for could not be found.</p>
      <p class="text-body-2 text-medium-emphasis mb-6">
        The track may be closed, or you may have gone to the wrong route.
      </p>
      <v-btn color="primary" variant="elevated" to="/">Back to Home Track</v-btn>
    </v-card>
  </v-container>
</template>

<style lang="scss" scoped>
.not-found-card {
  background: linear-gradient(140deg, rgba(29, 35, 45, 0.96), rgba(18, 23, 32, 0.96));
}
</style>
