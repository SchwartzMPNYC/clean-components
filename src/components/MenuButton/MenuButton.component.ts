import { define } from "../../utils/decorators/define/Define";
import { selector } from "../../utils/decorators/selector";
import BaseCustomEl from "../Base/Base";
import markup from "./MenuButton.template.html";
import styles from "./MenuButton.styles.scss";

const stateKeys = [
	"toggleContent",
	"expanded",
	"listItems",
	"_highlightedItemIndex",
	"_highlightedItemId",
	"openUp",
] as const;

@define("clean-menu-button", {
	markup,
	styles,
	observedAttributes: ["expanded"],
	stateKeys,
	booleanReflect: ["expanded", "open-up"],
})
export default class MenuButton extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	@selector("#toggle") private _toggle: HTMLElement;
	@selector("[role='menu']") private _list: HTMLElement;
	@selector('slot[name="list-items"]') private _childrenSlot: HTMLSlotElement;

	public openUp = false;

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
		if (this.state.expanded === newState) return;
		this.state.expanded = newState || null;

		if (newState) {
			this.listen(window, "keydown", this._handleWindowEscPress);

			const rect = this._list.getBoundingClientRect();
			if (this.openUp) {
				const { bottom, height } = rect;
				this.openUp = bottom + height - this._toggle.getBoundingClientRect().height > window.innerHeight;
			} else {
				this.openUp = rect.bottom > window.innerHeight;
			}

			if (rect.left <= 0) {
				this._list.style.setProperty("--offset", `${rect.left}px`);
			}
		} else {
			this.stopListening(window, "keydown", this._handleWindowEscPress);
			this._highlightedItemIndex = null;
			this._currentHighlighted?.setAttribute("part", "menuitem");
			this._list.style.removeProperty("--offset");
		}
	}

	// This lets users set list items by passing in an array of elements.
	public set listItems(newListItems: HTMLElement[]) {
		this.state.listItems = newListItems;
		this._insertListItems(newListItems);
	}

	connectedCallback() {
		this.expanded = false;

		this.listen(this._toggle, "click", this._handleToggleClick);
		this.listen(this._toggle, "keydown", this._handleToggleKeydown);

		this.listen(this._list, "click", this._dispatchMenuItemClick);
		this.listen(this._list, "keydown", this._handleListKeydown);

		this.listen(this._childrenSlot, "slotchange", this._handleListItemSlotChange);

		this.listen(this, "focusout", this.handleFocusout);
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
			this.listItems = [...(wrapperChild?.children ?? [])] as HTMLElement[];
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

	private _handleListKeydown = (event: KeyboardEvent) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				this._highlightedItemIndex = (this._highlightedItemIndex + 1) % this.listItems.length;
				break;
			case "ArrowUp":
				event.preventDefault();
				this._highlightedItemIndex =
					this._highlightedItemIndex !== 0 ? this._highlightedItemIndex - 1 : this.listItems.length - 1;
				break;
			case "Home":
				event.preventDefault();
				this._highlightedItemIndex = 0;
				break;
			case "End":
				event.preventDefault();
				this._highlightedItemIndex = this.listItems.length - 1;
				break;
			case " ":
				event.preventDefault();
			// eslint-disable-next-line no-fallthrough
			case "Enter":
				this._currentHighlighted.click();
				break;
		}
	};

	private _handleToggleKeydown = (event: KeyboardEvent) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				this._highlightedItemIndex = 0;
				this.expanded = true;
				this._list.focus();
				break;
			case "ArrowUp":
				event.preventDefault();
				this._highlightedItemIndex = this.listItems.length - 1;
				this.expanded = true;
				this._list.focus();
				break;
		}
	};

	private _dispatchMenuItemClick = ({ target: buttonClicked }: HTMLElementEvent<HTMLElement, MouseEvent>) => {
		this.dispatch("menuitemclick", { buttonClicked });
	};

	private _handleWindowEscPress = ({ key }: KeyboardEvent) => {
		if (key === "Escape") {
			this.expanded = false;
			this._toggle.focus();
		}
	};

	private handleFocusout = ({ relatedTarget }: FocusEvent & { relatedTarget: HTMLElement }) => {
		this.expanded = this.shadow.contains(relatedTarget);
	};
}
