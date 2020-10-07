const ready = (loaded) => {
  if (['interactive', 'complete'].includes(document.readyState)) {
    loaded();
  } else {
    document.addEventListener('DOMContentLoaded', loaded);
  }
};

/**
 * ひらがなをカタカナに変換する
 * @param {string} str
 */
const hiraToKata = (str) => {
  return str.replace(/[\u3041-\u3096]/g, function (match) {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
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
];

const books = [
  { name: 'TNX', checked: false },
  { name: 'TOS', checked: false },
  { name: 'CTL', checked: false },
  { name: 'CHM', checked: false },
  { name: 'BTD', checked: false },
  { name: 'HDB', checked: false },
  { name: 'ATS', checked: false },
  { name: 'SKD', checked: false },
];

const sortByName = (isAsc) => (a, b) => {
  const order = isAsc ? 1 : -1;
  if (a.name < b.name) return -1 * order;
  if (a.name > b.name) return order;
  return 0;
};

const sortByStyle = (isAsc) => (a, b) => {
  const order = isAsc ? 1 : -1;
  const aStyleId = STYLES.indexOf(a.style);
  const bStyleId = STYLES.indexOf(b.style);
  if (aStyleId < bStyleId) return -1 * order;
  if (aStyleId > bStyleId) return order;
  if (a.category < b.category) return -1 * order;
  if (a.category > b.category) return order;
  return a.id - b.id;
};

const sortByReference = (isAsc) => (a, b) => {
  const order = isAsc ? 1 : -1;
  return (a.id - b.id) * order;
};

ready(() => {
  Vue.component('labeled-checkbox', {
    props: ['label', 'checked'],
    model: {
      prop: 'checked',
      event: 'change',
    },
    template: `
      <label class="checkbox ml-2">
        <input
          type="checkbox"
          v-bind:checked="checked"
          v-on:change="$emit('change', $event.target.checked)"
        />
        {{ label }}
      </label>
    `,
  });

  Vue.component('checks-columns', {
    props: ['label', 'option'],
    template: `
      <div class="columns">
        <div class="field is-horizontal column is-three-fifths">
          <div class="field-label">
            <labeled-checkbox
              v-bind:label="label"
              class="label"
              v-model="option.isAllChecked"
              v-on:change="changeAll"
            ></labeled-checkbox>
          </div>
          <div class="field-body">
            <labeled-checkbox
              v-for="item of option.items"
              v-bind:key="item.name"
              v-bind:label="item.name"
              v-model="item.checked"
              v-on:change="changeOne"
            ></labeled-checkbox>
          </div>
        </div>
      </div>
    `,
    methods: {
      changeAll() {
        this.option.items.forEach((item) => {
          item.checked = this.option.isAllChecked;
        });
      },
      changeOne() {
        this.option.isAllChecked = this.option.items.every((item) => item.checked);
      },
    },
  });

  const app = new Vue({
    el: '#app',
    data: {
      query: '',
      isLoading: false,
      error: '',

      skills: [],
      sortKey: '',
      isAsc: true,

      styles: [],
      styleQuery: '',
      inEntryStyle: false,
      searchingStyles: STYLES,

      skillTypeOption: {
        isAllChecked: false,
        items: [
          { name: '特技', checked: false },
          { name: '秘技', checked: false },
          { name: '奥義', checked: false },
        ],
      },
      bookOption: {
        isAllChecked: false,
        items: books,
      },
    },
    methods: {
      search() {
        this.query = this.query.trim();
        if (this.isLoading) {
          return;
        }
        if (!this.query && (this.styles.length < 1 || this.styles.length === STYLES.length)) {
          this.error = '検索ワードを入力するか、スタイルを選択してください。';
          return;
        }
        this.error = '';
        this.isLoading = true;
        const url = new URL(
          'https://script.google.com/macros/s/AKfycbwbeP5W2JqLRvbySz3sr2i_S5MEedkgBdayOsrIX0M13KCw7Xfo/exec'
        );
        url.searchParams.append('type', 'skill');
        url.searchParams.append('query', this.query);
        if (this.styles.length != STYLES.length) {
          this.styles.forEach((style) => url.searchParams.append('styles', style));
        }
        if (
          !this.skillTypeOption.isAllChecked &&
          this.skillTypeOption.items.some((skillType) => skillType.checked)
        ) {
          this.skillTypeOption.items
            .filter((skillType) => skillType.checked)
            .forEach((skillType) => url.searchParams.append('skillTypes', skillType.name));
        }
        if (
          !this.bookOption.isAllChecked &&
          this.bookOption.items.some((skillType) => skillType.checked)
        ) {
          this.bookOption.items
            .filter((book) => book.checked)
            .forEach((book) => url.searchParams.append('books', book.name));
        }
        fetch(url)
          .then((r) => {
            if (!r.ok) {
              throw new Error(`status code: ${r.status}`);
            }
            return r.json();
          })
          .then((d) => {
            if (!d.ok) {
              throw new Error(d.reason);
            }
            app.sortKey = 'style';
            app.isAsc = true;
            app.skills = d.skills
              .map((skill) => {
                if (skill.searchRefs === skill.allRefs) return skill;
                const searchRefs = skill.searchRefs.split(',');
                const allRefs = skill.allRefs.split(',');
                const others = allRefs.filter((ref) => !searchRefs.includes(ref)).join(',');
                return { ...skill, searchRefs: `${skill.searchRefs} (${others})` };
              })
              .sort(sortByStyle(app.isAsc));
            if (d.skills.length < 1) {
              app.error = '検索結果がありませんでした';
            }
          })
          .catch((e) => {
            console.error(e);
            app.error = e.message;
          })
          .finally(() => {
            app.isLoading = false;
          });
      },
      focusStyleQuery() {
        this.inEntryStyle = true;
      },
      blurStyleQuery() {
        setTimeout(() => {
          app.inEntryStyle = false;
        }, 200);
      },
      searchStyle() {
        if (!this.styleQuery) {
          this.searchingStyles = STYLES.filter((style) => !this.styles.includes(style));
          return;
        }
        const regex = new RegExp([...hiraToKata(this.styleQuery)].join('.*'), 'i');
        this.searchingStyles = STYLES.filter(
          (style) => regex.test(style) && !this.styles.includes(style)
        );
      },
      appendStyle(style) {
        this.styles.push(style);
        this.styleQuery = '';
        this.inEntryStyle = false;
        this.searchStyle();
      },
      deleteStyle(index) {
        this.styles.splice(index, 1);
        this.searchStyle();
      },
      deleteStyleAll() {
        this.styles.splice(0, this.styles.length);
        this.searchStyle();
      },
      sort(sortKey) {
        if (sortKey === this.sortKey) {
          this.isAsc = !this.isAsc;
        } else {
          this.isAsc = true;
          this.sortKey = sortKey;
        }
        switch (sortKey) {
          case 'name':
            this.skills = this.skills.sort(sortByName(this.isAsc));
            return;
          case 'style':
            this.skills = this.skills.sort(sortByStyle(this.isAsc));
            return;
          case 'reference':
            this.skills = this.skills.sort(sortByReference(this.isAsc));
            return;
          default:
            console.error(`unknown sortKey=${sortKey}`);
            return;
        }
      },
      sortClass(sortKey) {
        return {
          asc: sortKey === this.sortKey && this.isAsc,
          desc: sortKey === this.sortKey && !this.isAsc,
        };
      },
    },
  });
});
