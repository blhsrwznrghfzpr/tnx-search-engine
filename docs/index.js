/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const ready = loaded => {
  if (['interactive', 'complete'].includes(document.readyState)) {
    loaded();
  } else {
    document.addEventListener('DOMContentLoaded', loaded);
  }
};

const STYLES = [
  'カブキ',
  'バサラ',
  'タタラ',
  'ミストレス',
  'カブト',
  'カリスマ',
  'マネキン',
  'カゼ',
  'フェイト',
  'クロマク',
  'エグゼク',
  'カタナ',
  'クグツ',
  'カゲ',
  'チャクラ',
  'レッガー',
  'カブトワリ',
  'ハイランダー',
  'マヤカシ',
  'トーキー',
  'イヌ',
  'ニューロ',
  'コモン',
  'ヒルコ',
  'クロガネ',
  'イブキ',
  'シキガミ',
  'アラシ',
  'カゲムシャ',
  'アヤカシ',
  'エトランゼ',
  'ワークス',
  '' // 本来は不要だが、打ち込み途中のデータで発生しうる
];

ready(() => {
  Vue.component('labeled-checkbox', {
    props: ['label', 'checked'],
    model: {
      prop: 'checked',
      event: 'change'
    },
    template: `
      <label class="checkbox ml-1">
        <input
          type="checkbox"
          v-bind:checked="checked"
          v-on:change="$emit('change', $event.target.checked)"
        />
        {{ label }}
      </label>
    `
  });

  const app = new Vue({
    el: '#app',
    data: {
      query: '',
      isLoading: false,
      isSkillTypeAll: false,
      skillTypes: [
        { label: '特技', checked: false },
        { label: '秘技', checked: false },
        { label: '奥義', checked: false }
      ],
      error: '',
      skills: []
    },
    methods: {
      search() {
        this.error = '';
        this.query = this.query.trim();
        if (!this.query || this.isLoading) {
          return;
        }
        this.isLoading = true;
        const url = new URL(
          'https://script.google.com/macros/s/AKfycbwbeP5W2JqLRvbySz3sr2i_S5MEedkgBdayOsrIX0M13KCw7Xfo/exec'
        );
        url.searchParams.append('type', 'skill');
        url.searchParams.append('query', this.query);
        if (!this.isSkillTypeAll && this.skillTypes.some(skillType => skillType.checked)) {
          this.skillTypes
            .filter(skillType => skillType.checked)
            .forEach(skillType => url.searchParams.append('skillTypes', skillType.label));
        }
        fetch(url)
          .then(r => {
            if (!r.ok) {
              throw new Error(`status code: ${r.status}`);
            }
            return r.json();
          })
          .then(d => {
            if (!d.ok) {
              throw new Error(d.reason);
            }
            app.skills = d.skills.sort((a, b) => {
              const aStyleId = STYLES.indexOf(a.style);
              const bStyleId = STYLES.indexOf(b.style);
              if (aStyleId < bStyleId) return -1;
              if (aStyleId > bStyleId) return 1;
              if (a.category < b.category) return -1;
              if (a.category > b.category) return 1;
              return a.id - b.id;
            });
          })
          .catch(e => {
            console.error(e);
            app.error = e.message;
          })
          .finally(() => {
            app.isLoading = false;
          });
      },
      changeSkillTypeAll() {
        this.skillTypes.forEach(skillType => {
          skillType.checked = this.isSkillTypeAll;
        });
      },
      changeSkillType() {
        this.isSkillTypeAll = this.skillTypes.every(skillType => skillType.checked);
      }
    }
  });
});
