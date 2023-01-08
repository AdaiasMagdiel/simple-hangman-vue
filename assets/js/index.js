Vue.createApp({
  data() {
    return {
      ready: false,
      word: "",
      wordSecret: "",
      category: "",
      meanings: [],
      letters: [],
    };
  },
  methods: {
    normalize(word) {
      return word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    },
    keyPressed(key, evt) {
      if (evt.target.classList.value.includes("clicked")) return;

      evt.target.classList.add("clicked");
      this.letters.push(key);

      normalized = this.normalize(this.word);
      secret = this.wordSecret.split("");

      normalized.split("").forEach((letter, idx) => {
        if (key.toLowerCase() === letter) {
          secret[idx] = this.word[idx];
        }
      });

      this.wordSecret = secret.join("");
    },
    parseMeaning(meaning) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(meaning["xml"], "text/xml");

      console.log(meaning["xml"]);

      const defs = Array.from(xmlDoc.getElementsByTagName("def"))
        .map((item) => item.textContent.replace(/_/gim, '"'))
        .join("")
        .split("\n")
        .filter((item) => item.length > 0);

      const category = xmlDoc.getElementsByTagName("gramGrp")[0].textContent;
      console.log(category);

      return [defs, category];
    },
    async getWordAndMeaning() {
      API_URL = "https://api.dicionario-aberto.net";

      const word = await (await fetch(`${API_URL}/random`)).json();
      this.word = word["word"];
      this.wordSecret = this.word.replace(/./gim, "_");

      const meaning = await (
        await fetch(`${API_URL}/word/${this.word}`)
      ).json();

      parsed = this.parseMeaning(meaning[0]);
      this.meanings = parsed[0];
      this.category = parsed[1];

      this.ready = true;
    },
    async restart(evt) {
      this.ready = false;
      this.word = "";
      this.wordSecret = "";
      this.category = "";
      this.meanings = [];
      this.letters = [];

      await this.getWordAndMeaning();
      Array.from(
        evt.target.parentElement.querySelectorAll(".keyboard__key")
      ).map((item) => {
        item.classList.remove("clicked");
      });
    },
  },
  async mounted() {
    await this.getWordAndMeaning();
  },
  computed: {
    lettersPlayed() {
      return this.letters.join(", ").toUpperCase();
    },
  },
}).mount("#app");
