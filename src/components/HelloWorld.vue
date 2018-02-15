<!--Example of a component with a link and how to watch for state changes-->
<template>
  <div>
    <p>
      {{text}}
    </p>
    <p>
      <button type="button" class="btn" v-on:click="setText('any other text')">Change text</button>
    </p>
    <p>
      <label for="input">Demo typeahead (type any digit):</label>
      <input id="input" class="form-control" type="text" placeholder="Type to search...">
      <uiv-typeahead v-model="selected" target="#input" :data="items" item-key="key" append-to-body open-on-focus/>
      <uiv-alert v-show="selected">You selected {{selected.key}}</uiv-alert>
    </p>
    <p>
      <router-link :to="{name: 'HelloAgain', params: { text }}">
        Some link
      </router-link>
    </p>
    <div>
      <table class="table table-sm table-striped table-bordered">
        <thead class="text-center">
        <tr>
          <th colspan="3">Examples</th>
        </tr>
        <tr>
          <th width="33%">D3</th>
          <th width="33%">Vega</th>
          <th>Leaflet</th>
        </tr>
        </thead>
        <tbody class="text-center">
        <tr>
          <td>
            <d3-example></d3-example>
          </td>
          <td>
            <vega-example></vega-example>
          </td>
          <td>
            <leaflet-example></leaflet-example>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import helloAgain from './HelloAgain'
import d3Example from './D3Example'
import vegaExample from './VegaExample'
import leafletExample from './LeafletExample'

export default {
  name: 'HelloWorld',
  components: {
    'hello-again': helloAgain,
    'd3-example': d3Example,
    'vega-example': vegaExample,
    'leaflet-example': leafletExample
  },
  data () {
    return {
      selected: '',
      items: Array.from(Array(100).keys()).map(i => ({key: i.toString() + ' element'}))
    }
  },
  computed: {
    ...mapGetters([
      'text'
    ])
  },
  methods: {
    ...mapActions({
      setText: 'setText'
    })
  },
  watch: {
    'text' (to, from) {
      // Example of a state change watch
      console.log('text has changed', from, to)
    },
    'selected' (to, from) {
      const found = this.items.find(i => i.key === to.key)
      if (found) {
        console.log('you have selected', found.key)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
