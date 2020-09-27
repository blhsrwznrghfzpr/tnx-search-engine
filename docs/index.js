/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const ready = loaded => {
  if (['interactive', 'complete'].includes(document.readyState)) {
    loaded();
  } else {
    document.addEventListener('DOMContentLoaded', loaded);
  }
};

ready(() => {
  const app = new Vue({
    el: '#app',
    data: {
      query: '',
      error: '',
      skills: []
    },
    methods: {
      search: function() {
        this.error = '';
        this.query = this.query.trim();
        if (!this.query) {
          return;
        }
        const url = new URL(
          'https://script.google.com/macros/s/AKfycbwbeP5W2JqLRvbySz3sr2i_S5MEedkgBdayOsrIX0M13KCw7Xfo/exec'
        );
        url.searchParams.append('type', 'skill');
        url.searchParams.append('query', this.query);
        console.log(url);
        fetch(url)
          .then(r => {
            if (!r.ok) {
              throw new Error(`status code: ${r.status}`);
            }
            return r.json();
          })
          .then(d => {
            console.log(d);
            if (!d.ok) {
              throw new Error(d.reason);
            }
            app.skills = d.skills;
          })
          .catch(e => {
            console.error(e);
            app.error = e.message;
          });
      }
    }
  });
});
