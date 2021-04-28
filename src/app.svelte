<script lang="ts">
  import {onMount} from 'svelte';
  import {three} from './three';

  onMount(() => {
    three.init().catch(error => {
      console.error(error);
    });
  })
</script>

<style lang="scss" global>
  @import './styles/_main';
</style>
