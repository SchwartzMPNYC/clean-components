import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Table.template.html";
import styles from "./Table.styles.scss";

const observedAttributes = [];
const stateKeys = [] as const;

const getRowProxy = (row: HTMLTableRowElement) => {
	return new Proxy(row, {
		get(_, prop: string | symbol | number) {
			// default stuff
			if (prop in row) {
				return typeof row[prop] === "function"
					? (...args: unknown[]) => Reflect.apply(row[prop], row, args)
					: row[prop];
			}
			// child td access
			else if (Number(prop) == prop) {
				return row.children[Number(prop)];
			}
		},
	});
};

@define("clean-table", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
})
export default class Table extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	public rowTemplate: DocumentFragment;
	public headerRowTemplate: DocumentFragment;

	public tbody = this.shadow.querySelector("tbody");
	public thead = this.shadow.querySelector("thead");

	public cells = [];
	public headerRow: HTMLTableRowElement;

	private _data = [[]];

	get stickyCols() {
		return Number(this.getAttribute("sticky-cols")) - 1;
	}

	private _headerNames = [];
	set headerConfig(newheaders: { name: string; sortable: boolean }[]) {
		this._headerNames = newheaders;
		this.setRowTemplate(true);
		this.appendHeaders();
	}

	get headerConfig() {
		return this._headerNames;
	}

	set tabularData(newData) {
		this._data = newData;

		this.setRowTemplate();
		this.appendRows();
	}
	get tabularData() {
		return this._data;
	}

	constructor() {
		super();

		this.setRowTemplate();
		this.appendRows();
	}

	public sort(colIndToSortBy = 0, direction: "asc" | "desc" = "asc") {
		const dirModifier = direction === "asc" ? 1 : -1;

		this.tabularData.sort((rowA, rowB) => (rowA[colIndToSortBy] - rowB[colIndToSortBy]) * dirModifier);
		this.appendRows();
	}

	private setRowTemplate(headerRow = false) {
		const rt = document.createElement("template");
		rt.innerHTML = `<tr>${headerRow ? this.buildHeaderCells() : this.buildDataCells()}</tr>`;

		if (headerRow) this.headerRowTemplate = rt.content;
		else this.rowTemplate = rt.content;
	}

	private getStickyStuff = (colInd: number, stickyCols) => {
		return colInd <= stickyCols
			? {
					cls: "sticky",
					style: `left: var(--sticky-col-offset_${colInd}, 0)`,
					// prettier problem
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  }
			: { cls: "", style: "" };
	};

	private buildDataCells() {
		const stickyCols = this.stickyCols;

		return this.tabularData[0].reduce((cellsStr, _, i) => {
			const { cls, style } = this.getStickyStuff(i, stickyCols);
			return (cellsStr += `<td class="${cls}" style="${style}" data-col=${i}></td>`);
		}, "");
	}

	private buildHeaderCells() {
		const stickyCols = this.stickyCols;

		return this.headerConfig.reduce((cellsStr, { name, sortable }, i) => {
			const { cls, style } = this.getStickyStuff(i, stickyCols);

			const attrs = `class="${cls}" style="${style}" data-col=${i}`;

			return (cellsStr += sortable ? `<th ${attrs}><button>${name}</button></th>` : `<th ${attrs}>${name}</th>`);
		}, "");
	}

	private appendHeaders() {
		const row = document.importNode(this.headerRowTemplate, true).firstChild as HTMLTableRowElement;
		this.headerRow = getRowProxy(row);

		this.headerConfig.forEach(({ sortable }, i) => {
			if (sortable)
				this.headerRow[i].addEventListener("click", ({ target }) => {
					const sortDirection = target.classList.contains("asc") ? "desc" : "asc";
					this.sort(i, sortDirection);
					this.headerRow?.querySelector(".sorted")?.classList.remove("sorted", "asc", "desc");

					target.classList.add("sorted", sortDirection);
				});
		});

		this.thead.replaceChildren(row);
	}

	private appendRows() {
		const rows = [];

		this.cells = [];
		for (let rowIndex = 0; rowIndex < this.tabularData.length; rowIndex++) {
			const row = document.importNode(this.rowTemplate, true).firstChild as HTMLTableRowElement;
			rows.push(row);
			this.cells.push(getRowProxy(row));
			this.tabularData[rowIndex].forEach((val, colIndex) => {
				this.cells[rowIndex].dataset.row = rowIndex;
				this.cells[rowIndex][colIndex].textContent = val;
			});
		}

		this.tbody.replaceChildren(...rows);

		setTimeout(() => {
			let offsetTotal = 0;
			for (let i = 0; i <= this.stickyCols; i++) {
				this.style.setProperty(`--sticky-col-offset_${i}`, `calc(${offsetTotal}px)`);
				offsetTotal += this.cells[0][i]?.getBoundingClientRect().width;
			}
		}, 500);
	}
}
