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

        this.resizeObserver = new ResizeObserver(() => {
            if (this.root.classList.contains("is-open")) {
                this.updateDropdownHeight();
            }
        });

        this.resizeObserver.observe(this.trigger);
    }

    bindEvents() {
        this.optionsList.addEventListener("click", (event) => {
            event.stopPropagation(); // Предотвращаем всплытие иначе дойдёт до document и там закроет
            const option = event.target.closest(".select__option[data-value]");

            if (option) {
                this.selectOption(option.dataset.value);
            }
        });

        this.searchInput.addEventListener("input", () => {
            this.renderOptions(this.getFilteredOptions());
        });

        this.valueEl.addEventListener("click", (event) => {
            const tag = event.target.closest(".select__tag");

            // stopPropagation только тут, а не сразу для всего valueEl иначе клик по плейсхолдеру тоже перестанет открывать дропдаун
            if (tag) {
                event.stopPropagation();
                this.deselectOption(tag.dataset.value);
            }
        });

        this.trigger.addEventListener("click", () => this.toggleOpen());

        document.addEventListener("click", (event) => {
            if (!this.root.contains(event.target)) {
                this.close();
            }
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
        this.positionDropdown();

        if (this.isSearchable) {
            this.resetSearch();
            this.searchInput.focus();
        }
    }

    close() {
        this.root.classList.remove("is-open");
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

    renderValue() {
        this.valueEl.replaceChildren();

        if (this.selected.size === 0) {
            this.valueEl.textContent = PLACEHOLDER;
            return;
        }

        this.selected.forEach((value) =>
            this.valueEl.append(this.createTag(value)),
        );
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
        tag.remove();

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

    set searchable(value) {
        this.isSearchable = value;
        this.root.classList.toggle("has-search", value);
        this.resetSearch();
    }

    set multiple(value) {
        this.isMultiple = value;
        if (!value && this.selected.size > 1) {
            this.selected = new Set([[...this.selected].at(-1)]);
        }
        this.renderValue();
        this.renderOptions(this.getFilteredOptions());
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const select = new CustomSelect(document.getElementById("select"), BRANDS);

    document
        .getElementById("toggle-search")
        .addEventListener("change", (event) => {
            select.searchable = event.target.checked;
        });

    document
        .getElementById("toggle-multiple")
        .addEventListener("change", (event) => {
            select.multiple = event.target.checked;
        });
});
