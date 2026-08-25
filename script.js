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
    static formAssociated = true;

    constructor() {
        super();

        this._internals = this.attachInternals();
        this._options = BRANDS;
        this.selected = new Set();
        this.isMultiple = false;
        this.isSearchable = false;
    }

    connectedCallback() {
        this._renderDOM();
        this._syncAttributes();
        this._bindEvents();
        this._renderOptions();

        this.resizeObserver = new ResizeObserver(() => {
            if (this.classList.contains("is-open")) {
                this._positionDropdown();
            }
        });

        this.resizeObserver.observe(this.trigger);
    }

    _renderDOM() {
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

        this.overlay = document.createElement("div");
        this.overlay.className = "select__overlay";

        this.append(this.trigger, this.overlay, this.dropdown);
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
    }

    _syncAttributes() {
        this.isMultiple = this.hasAttribute("multiple");
        this.isSearchable = this.hasAttribute("searchable");
        this.classList.toggle("has-search", this.isSearchable);
    }

    _bindEvents() {
        this.trigger.addEventListener("click", () => this._toggleOpen());

        this.valueEl.addEventListener("click", (event) => {
            const tag = event.target.closest(".select__tag");

            if (tag) {
                this._deselectOption(tag.dataset.value);
            }
        });

        this.optionsList.addEventListener("click", (event) => {
            event.stopPropagation();
            const option = event.target.closest(".select__option[data-value]");

            if (option) {
                this._selectOption(option.dataset.value);
            }
        });

        this.searchInput.addEventListener("input", () => {
            this._renderOptions(this._getFilteredOptions());
        });

        this.overlay.addEventListener("click", () => this._close());
    }

    _toggleOpen() {
        if (this.classList.contains("is-open")) {
            this._close();
        } else {
            this._open();
        }
    }

    _open() {
        this.classList.add("is-open");
        this._positionDropdown();

        if (this.isSearchable) {
            this._resetSearch();
            this.searchInput.focus();
        }
    }

    _close() {
        this.classList.remove("is-open");
    }

    _positionDropdown() {
        this.dropdown.classList.remove(
            "select__dropdown--down",
            "select__dropdown--up",
        );

        const { top, bottom } = this.trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - bottom;

        if (spaceBelow >= top) {
            this.dropdown.classList.add("select__dropdown--down");
            this.dropdown.style.maxHeight = `${spaceBelow - 10}px`;
        } else {
            this.dropdown.classList.add("select__dropdown--up");
            this.dropdown.style.maxHeight = `${top - 10}px`;
        }
    }

    _resetSearch() {
        this.searchInput.value = "";
        this._renderOptions();
    }

    _getFilteredOptions() {
        const query = this.searchInput.value.trim().toLowerCase();

        return this._options.filter((option) =>
            option.toLowerCase().includes(query),
        );
    }

    _renderOptions(options = this._options) {
        if (options.length === 0) {
            this.optionsList.replaceChildren(this._createEmptyItem());
            return;
        }

        const items = options.map((option) => this._createOptionItem(option));
        this.optionsList.replaceChildren(...items);
    }

    _createOptionItem(option) {
        const isSelected = this.selected.has(option);

        const item = document.createElement("li");
        item.className = "select__option";
        item.textContent = option;
        item.dataset.value = option;
        item.classList.toggle("is-selected", isSelected);

        return item;
    }

    _createEmptyItem() {
        const item = document.createElement("li");
        item.className = "select__option select__option--empty";
        item.textContent = EMPTY_MESSAGE;

        return item;
    }

    _selectOption(value) {
        if (this.isMultiple) {
            if (this.selected.has(value)) {
                this.selected.delete(value);
                this._removeTag(value);
            } else {
                this.selected.add(value);
                this._addTag(value);
            }
        } else {
            this.selected = new Set([value]);
            this.valueEl.replaceChildren(this._createTag(value));
        }

        this._syncFormValue();
        this._renderOptions(this._getFilteredOptions());
    }

    _deselectOption(value) {
        this.selected.delete(value);
        this._removeTag(value);
        this._syncFormValue();
        this._renderOptions(this._getFilteredOptions());
    }

    _syncFormValue() {
        this._internals.setFormValue([...this.selected].join(", "));
    }

    _addTag(value) {
        if (this.selected.size === 1) {
            this.valueEl.replaceChildren();
        }

        this.valueEl.append(this._createTag(value));
    }

    _removeTag(value) {
        const tag = [...this.valueEl.children].find(
            (child) => child.dataset.value === value,
        );

        tag?.remove();

        if (this.selected.size === 0) {
            this.valueEl.textContent = PLACEHOLDER;
        }
    }

    _createTag(value) {
        const tag = document.createElement("span");
        tag.className = "select__tag";
        tag.dataset.value = value;
        tag.textContent = value;

        return tag;
    }
}

customElements.define("custom-select", CustomSelect);
