import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./MenuButton.template.html";
import styles from "./MenuButton.styles.scss";

const stateKeys = [
	"toggleContent",
	"expanded",
	"listItems",
	"_highlightedItemIndex",
	"_highlightedItemId",
] as const;

@define("clean-menu-button", {
	markup,
	styles,
	observedAttributes: ["expanded"],
	stateKeys,
})
export default class MenuButton extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private static booleanReflect = ["expanded"];

	private _toggle: HTMLElement = this.shadow.querySelector("#toggle");
	private _list: HTMLElement = this.shadow.querySelector("[role='menu']");
	private _childrenSlot: HTMLSlotElement = this.shadow.querySelector('slot[name="list-items"]');

	private set _highlightedItemIndex(newIndex: number) {
		// remove current highlights
		this._currentHighlighted?.setAttribute("part", "menuitem");

		// set state
		this.state._highlightedItemIndex = newIndex;

		// set id for active descendant and clean active attribute for styling
		this.state._highlightedItemId = this._currentHighlighted?.id ?? null;
		this._currentHighlighted?.setAttribute("part", "menuitem highlighted");
	}

	private get _currentHighlighted(): HTMLElement {
		return this.listItems?.[this._highlightedItemIndex];
	}

	public set expanded(newState: boolean) {
		// This caught me by surprise looking at the aria 1.2 authoring practices draft, but:
		// > When the menu is displayed, the element with role button has aria-expanded set to true. When the menu is hidden, it is recommended that aria-expanded is not present.
		// > https://www.w3.org/TR/wai-aria-practices-1.2/#menu
		this.state.expanded = newState || null;

		if (newState) {
			window.addEventListener("keydown", this._handleWindowEscPress);
		} else {
			window.removeEventListener("keydown", this._handleWindowEscPress);
			this._highlightedItemIndex = null;
			this._currentHighlighted?.setAttribute("part", "menuitem");
		}
	}

	// This lets users set list items by passing in an array of elements.
	public set listItems(newListItems: HTMLElement[]) {
		this.state.listItems = newListItems;
		this._insertListItems(newListItems);
	}

	connectedCallback() {
		this.expanded = false;

		this._toggle.addEventListener("click", this._handleToggleClick);
		this._toggle.addEventListener("keydown", this._handleToggleKeydown);

		this._list.addEventListener("click", this._dispatchMenuItemClick);
		this._list.addEventListener("keydown", this._handleListKeydown);

		this._childrenSlot.addEventListener("slotchange", this._handleListItemSlotChange);

		this.shadow.addEventListener("focusout", this.handleFocusout);
	}

	disconnectedCallback() {
		this._toggle.removeEventListener("click", this._handleToggleClick);
		this._toggle.removeEventListener("keydown", this._handleToggleKeydown);

		this._list.removeEventListener("click", this._dispatchMenuItemClick);
		this._list.removeEventListener("keydown", this._handleListKeydown);

		this._childrenSlot.removeEventListener("slotchange", this._handleListItemSlotChange);

		this.shadow.removeEventListener("focusout", this.handleFocusout);

		// In case this gets removed from DOM while menu is open
		window.removeEventListener("click", this._handleWindowEscPress);
	}

	// This is the function that actually inserts our list items where they need to go.
	private _insertListItems(items: HTMLElement[]) {
		// Doing this this way instead of just a straight up slot lets me provide default styling for the menu items.
		this._list.replaceChildren(
			...items.map((menuitem, index) => {
				menuitem.setAttribute("role", "menuitem");
				menuitem.setAttribute("part", "menuitem");
				menuitem.tabIndex = -1;

				if (!menuitem.id) menuitem.id = `menuitem-${index}`;

				return menuitem;
			})
		);
	}

	// This will fire when the content of the slot changes and will update the list of list items in the state.
	private _handleListItemSlotChange = () => {
		const wrapperChild = this._childrenSlot.assignedElements()[0];
		if (wrapperChild) {
			this.listItems = [...wrapperChild?.children] as HTMLElement[];
			wrapperChild.remove();
		}
	};

	private _handleToggleClick = ({ pointerType: isMouse }: PointerEvent) => {
		this.expanded = !this.expanded;

		if (this.expanded) {
			this._highlightedItemIndex = 0;
			// TODO: Gotta make sure this works with screen readers.
			if (!isMouse) this._list.focus();
		}
	};

	private _handleListKeydown = ({ key }: KeyboardEvent) => {
		switch (key) {
			case "ArrowDown":
				this._highlightedItemIndex = (this._highlightedItemIndex + 1) % this.listItems.length;
				break;
			case "ArrowUp":
				this._highlightedItemIndex =
					this._highlightedItemIndex !== 0 ? this._highlightedItemIndex - 1 : this.listItems.length - 1;
				break;
			case "Home":
				this._highlightedItemIndex = 0;
				break;
			case "End":
				this._highlightedItemIndex = this.listItems.length - 1;
				break;
			case " ":
			case "Enter":
				this._currentHighlighted.click();
				break;
		}
	};

	private _handleToggleKeydown = ({ key }: KeyboardEvent) => {
		switch (key) {
			case "ArrowDown":
				this._highlightedItemIndex = 0;
				this.expanded = true;
				this._list.focus();
				break;
			case "ArrowUp":
				this._highlightedItemIndex = this.listItems.length - 1;
				this.expanded = true;
				this._list.focus();
				break;
		}
	};

	private _dispatchMenuItemClick = ({ target: buttonClicked }) => {
		this.dispatch("menuitemclick", { buttonClicked });
	};

	private _handleWindowEscPress = ({ key }: KeyboardEvent) => {
		if (key === "Escape") {
			this.expanded = false;
			this._toggle.focus();
		}
	};

	private handleFocusout = ({ relatedTarget }: FocusEvent) => {
		this.expanded = this.shadow.contains(relatedTarget as Node);
	};
}
