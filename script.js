(() => {
    "use strict";

    const BRANDS = [
        "01001LAB",
        "12 STOREEZ",
        "2aN",
        "2MOOD",
        "3INA",
        "7DAYS",
        "A'Pieu",
        "ABC",
        "BeCurly",
        "Carmex",
        "d'Alba",
        "DKNY",
        "ECOLATIER",
        "Frudia",
        "GANZO",
        "Holika Holika",
        "INFLUENCE",
        "Jimmy Choo",
        "KIKO Milano",
        "MAC",
        "NATASHA DENONA",
        "OKOLO",
        "PAYOT",
        "RAD",
        "SEVEN7EEN",
        "Tangle Teezer",
        "UNNA",
        "Valentino",
        "Weleda",
        "Yadah",
        "Zielinski & Rozen",
    ];

    const PLACEHOLDER = "ВЫБЕРИТЕ БРЕНД";
    const EMPTY_MESSAGE = "НИЧЕГО НЕ НАЙДЕНО";

    class CustomSelect {
        constructor(root, options) {
            this.root = root;
            this.options = options;

            this.trigger = root.querySelector(".select__trigger");
            this.valueEl = root.querySelector(".select__value");
            this.dropdown = root.querySelector(".select__dropdown");
            this.searchInput = root.querySelector(".select__search");
            this.optionsList = root.querySelector(".select__options");

            this.selected = new Set();
            this.isMultiple = false;
            this.isSearchable = false;

            this.bindEvents();
            this.renderOptions(this.options);
        }

        bindEvents() {
            this.trigger.addEventListener("click", () => this.toggleOpen());

            this.optionsList.addEventListener("click", (event) => {
                const option = event.target.closest(
                    ".select__option[data-value]",
                );

                if (option) this.selectOption(option.dataset.value);
            });

            this.searchInput.addEventListener("input", () => {
                this.renderOptions(this.getFilteredOptions());
            });

            document.addEventListener("click", (event) => {
                if (!this.root.contains(event.target)) this.close();
            });
        }

        toggleOpen() {
            if (this.root.classList.contains("is-open")) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            this.root.classList.add("is-open");
            this.trigger.setAttribute("aria-expanded", "true");
            this.positionDropdown();

            if (this.isSearchable) {
                this.resetSearch();
                this.searchInput.focus();
            }
        }

        close() {
            this.root.classList.remove("is-open");
            this.trigger.setAttribute("aria-expanded", "false");
        }

        positionDropdown() {
            this.dropdown.classList.remove(
                "select__dropdown--down",
                "select__dropdown--up",
            );

            const { bottom } = this.trigger.getBoundingClientRect();
            const spaceBelow = window.innerHeight - bottom;
            const direction =
                spaceBelow < this.dropdown.offsetHeight ? "up" : "down";

            this.dropdown.classList.add(`select__dropdown--${direction}`);
        }

        resetSearch() {
            this.searchInput.value = "";
            this.renderOptions(this.options);
        }

        getFilteredOptions() {
            const query = this.searchInput.value.trim().toLowerCase();

            return this.options.filter((option) =>
                option.toLowerCase().includes(query),
            );
        }

        renderOptions(options) {
            this.optionsList.replaceChildren();

            if (options.length === 0) {
                this.optionsList.append(this.createEmptyItem());
                return;
            }

            options.forEach((option) =>
                this.optionsList.append(this.createOptionItem(option)),
            );
        }

        createOptionItem(option) {
            const isSelected = this.selected.has(option);

            const item = document.createElement("li");
            item.className = "select__option";
            item.textContent = option;
            item.dataset.value = option;
            item.classList.toggle("is-selected", isSelected);

            return item;
        }

        createEmptyItem() {
            const item = document.createElement("li");
            item.className = "select__option select__option--empty";
            item.textContent = EMPTY_MESSAGE;

            return item;
        }

        selectOption(value) {
            if (this.isMultiple) {
                if (this.selected.has(value)) {
                    this.selected.delete(value);
                } else {
                    this.selected.add(value);
                }
            } else {
                this.selected = new Set([value]);
                // this.close();
            }

            this.updateValueText();
            this.renderOptions(this.getFilteredOptions());
        }

        updateValueText() {
            this.valueEl.textContent = this.selected.size
                ? [...this.selected].join(", ")
                : PLACEHOLDER;
        }

        setSearchable(isSearchable) {
            this.isSearchable = isSearchable;
            this.root.classList.toggle("has-search", isSearchable);
            this.resetSearch();
        }

        setMultiple(isMultiple) {
            this.isMultiple = isMultiple;

            if (!isMultiple && this.selected.size > 1) {
                this.selected = new Set([[...this.selected].at(-1)]);
            }

            this.updateValueText();
            this.renderOptions(this.getFilteredOptions());
        }
    }

    const select = new CustomSelect(document.getElementById("select"), BRANDS);

    document
        .getElementById("toggle-search")
        .addEventListener("change", (event) => {
            select.setSearchable(event.target.checked);
        });

    document
        .getElementById("toggle-multiple")
        .addEventListener("change", (event) => {
            select.setMultiple(event.target.checked);
        });
})();
