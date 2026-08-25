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

class CustomSelect extends HTMLElement {
    constructor() {
        super();

        this.options = BRANDS;
        this.selected = new Set();
        this.isMultiple = false;
        this.isSearchable = false;
    }

    connectedCallback() {
        this.renderDOM();
        this.syncAttributes();
        this.bindEvents();
        this.renderOptions();

        this.resizeObserver = new ResizeObserver(() => {
            if (this.classList.contains("is-open")) {
                this.positionDropdown();
                this.updateDropdownHeight();
            }
        });

        this.resizeObserver.observe(this.trigger);
    }

    renderDOM() {
        this.trigger = document.createElement("button");
        this.trigger.type = "button";
        this.trigger.className = "select__trigger";

        this.valueEl = document.createElement("span");
        this.valueEl.className = "select__value";
        this.valueEl.textContent = PLACEHOLDER;
        this.trigger.append(this.valueEl);

        this.searchInput = document.createElement("input");
        this.searchInput.type = "text";
        this.searchInput.className = "select__search";
        this.searchInput.placeholder = "Поиск";

        this.optionsList = document.createElement("ul");
        this.optionsList.className = "select__options";

        const wrapper = document.createElement("div");
        wrapper.className = "select__wrapper";
        wrapper.append(this.optionsList);

        this.dropdown = document.createElement("div");
        this.dropdown.className = "select__dropdown";
        this.dropdown.append(this.searchInput, wrapper);

        this.append(this.trigger, this.dropdown);
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
        document.removeEventListener("click", this._onDocumentClick);
    }

    syncAttributes() {
        this.isMultiple = this.hasAttribute("multiple");
        this.isSearchable = this.hasAttribute("searchable");
        this.classList.toggle("has-search", this.isSearchable);
    }

    bindEvents() {
        this.trigger.addEventListener("click", () => this.toggleOpen());

        this.valueEl.addEventListener("click", (event) => {
            const tag = event.target.closest(".select__tag");

            if (tag) {
                event.stopPropagation();
                this.deselectOption(tag.dataset.value);
            }
        });

        this.optionsList.addEventListener("click", (event) => {
            event.stopPropagation();
            const option = event.target.closest(".select__option[data-value]");

            if (option) {
                this.selectOption(option.dataset.value);
            }
        });

        this.searchInput.addEventListener("input", () => {
            this.renderOptions(this.getFilteredOptions());
        });

        this._onDocumentClick = (event) => {
            if (!this.contains(event.target)) {
                this.close();
            }
        };
        document.addEventListener("click", this._onDocumentClick);
    }

    toggleOpen() {
        if (this.classList.contains("is-open")) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.classList.add("is-open");
        this.positionDropdown();

        if (this.isSearchable) {
            this.resetSearch();
            this.searchInput.focus();
        }
    }

    close() {
        this.classList.remove("is-open");
    }

    positionDropdown() {
        this.dropdown.classList.remove(
            "select__dropdown--down",
            "select__dropdown--up",
        );

        const { top, bottom } = this.trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - bottom;
        const direction = spaceBelow >= top ? "down" : "up";

        this.dropdown.classList.add(`select__dropdown--${direction}`);
        this.setMaxHeight(direction === "down" ? spaceBelow : top);
    }

    updateDropdownHeight() {
        // Пересчитывает max-height
        const isUp = this.dropdown.classList.contains("select__dropdown--up");
        const { top, bottom } = this.trigger.getBoundingClientRect();
        this.setMaxHeight(isUp ? top : window.innerHeight - bottom);
    }

    setMaxHeight(space) {
        this.dropdown.style.maxHeight = `${space - 10}px`;
    }

    resetSearch() {
        this.searchInput.value = "";
        this.renderOptions();
    }

    getFilteredOptions() {
        const query = this.searchInput.value.trim().toLowerCase();

        return this.options.filter((option) =>
            option.toLowerCase().includes(query),
        );
    }

    renderOptions(options = this.options) {
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
                this.removeTag(value);
            } else {
                this.selected.add(value);
                this.addTag(value);
            }
        } else {
            this.selected = new Set([value]);
            this.valueEl.replaceChildren(this.createTag(value));
        }

        this.renderOptions(this.getFilteredOptions());
    }

    deselectOption(value) {
        this.selected.delete(value);
        this.removeTag(value);
        this.renderOptions(this.getFilteredOptions());
    }

    addTag(value) {
        if (this.selected.size === 1) {
            this.valueEl.replaceChildren();
        }

        this.valueEl.append(this.createTag(value));
    }

    removeTag(value) {
        const tag = [...this.valueEl.children].find(
            (child) => child.dataset.value === value,
        );

        tag?.remove();

        if (this.selected.size === 0) {
            this.valueEl.textContent = PLACEHOLDER;
        }
    }

    createTag(value) {
        const tag = document.createElement("span");
        tag.className = "select__tag";
        tag.dataset.value = value;
        tag.textContent = value;

        return tag;
    }
}

customElements.define("custom-select", CustomSelect);
