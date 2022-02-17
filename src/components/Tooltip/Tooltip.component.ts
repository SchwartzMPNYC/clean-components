import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import { attrTransform } from "../../utils/StateMachine/stateMachine";
import markup from "./Tooltip.template.html";
import styles from "./Tooltip.styles.scss";

/* 
	This component originally didn't add the content to the DOM until the tooltip was shown. (See modal for example.)

	This was refactored out because without the content in the DOM, we can use tooltip content for `aria-describedby` 
	for something unless we can guarantee that it would get focus/the tooltip would be open (which we can't really do.)

	That's also why we're using a screen reader only paradigm for the closed tooltip instead of display: none.
*/

type ArrowVariableLengths = `${"-" | ""}${number}${"px" | "%"}` | `calc(${number}% - ${number}px)`;

const enum POSITIONS {
	blockStart = "block-start",
	inlineStart = "inline-start",
	inlineEnd = "inline-end",
	blockEnd = "block-end",
	center = "center",
}

export interface Directionality {
	vertical: POSITIONS.blockStart | POSITIONS.blockEnd | POSITIONS.center;
	horizontal: POSITIONS.inlineStart | POSITIONS.inlineEnd | POSITIONS.center;
}

// TODO: this should probably be made into a mixin
enum WritingModes {
	horizontal_tb = "horizontal-tb",
	vertical_rl = "vertical-rl",
	vertical_lr = "vertical-lr",
	// These are apparently experimental, just here for info
	// sideways_rl: "sideways-rl",
	// sideways_lr: "sideways-lr",
}

enum TextDirections {
	rtl = "rtl",
	ltr = "ltr",
}

const enum NonLogicalProperties {
	top,
	bottom,
	left,
	right,
}

interface LogicalPropertyDirections {
	blockStart: NonLogicalProperties.top | NonLogicalProperties.bottom;
	inlineStart: NonLogicalProperties.left | NonLogicalProperties.right;
}

const arrayOfPositions = [POSITIONS.blockStart, POSITIONS.inlineStart, POSITIONS.inlineEnd, POSITIONS.blockEnd];

const observedAttributes = [
	"open",
	"hoverable",
	"clickable",
	"descriptive",
	"labelling",
	"offset",
	"delay",
	...arrayOfPositions,
];
const stateKeys = [
	"open",
	"clickable",
	"hoverable",
	"descriptive",
	"labelling",
	"offset",
	"delay",
	...arrayOfPositions.map(attrTransform),
] as const;

const booleanReflect = ["open", "hoverable", "clickable", ...arrayOfPositions, "descriptive", "labelling"];

@define("clean-tooltip", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
	booleanReflect,
})
export default class Tooltip extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private _anchor = this.shadow.querySelector<HTMLDivElement>(".content-wrapper");
	private _arrows = this._anchor.querySelectorAll(".arrow");

	private _triggerWrapper = this.shadow.querySelector<HTMLDivElement>("#trigger-wrapper");
	private _tiggerSlot = this.shadow.querySelector<HTMLSlotElement>("#trigger-slot");

	private _toggleTipBtn = this.shadow.querySelector<HTMLButtonElement>("#toggle-tip-trigger");

	private _liveRegion = this.shadow.querySelector<HTMLDivElement>("#live-region");
	private _content = this.shadow.querySelector<HTMLDivElement>("#content");

	private _mouseEnterTimeout: number;

	private get isToggleTip(): boolean {
		return !this._tiggerSlot.assignedNodes().length && !(this.descriptive || this.labelling);
	}

	private _getTextDirection(): LogicalPropertyDirections {
		const { writingMode, direction: textDirection } = document.defaultView.getComputedStyle(this, null);

		const blockStart =
			writingMode === WritingModes.horizontal_tb ||
			(textDirection === TextDirections.ltr &&
				(writingMode === WritingModes.vertical_lr || writingMode === WritingModes.vertical_rl))
				? NonLogicalProperties.top
				: NonLogicalProperties.bottom;

		const inlineStart =
			textDirection === TextDirections.ltr ? NonLogicalProperties.left : NonLogicalProperties.right;

		return {
			blockStart,
			inlineStart,
		};
	}

	public set open(newState: boolean) {
		if (this.state.open === newState) return;
		this.state.open = newState;

		if (newState) {
			this._positionOnScreen();
			this.listen(window, "keydown", this._closeOnEsc);
		} else {
			this._anchor.style.cssText = "";
			this.stopListening(window, "keydown", this._closeOnEsc);
			this.stopListening(window, "click", this._closeClick);
		}

		if (this.isToggleTip) {
			this._toggleTipBtn.setAttribute("aria-expanded", String(newState));
			this._anchor.setAttribute("aria-hidden", String(!newState));
		}
	}

	public get arrowHeight(): number {
		return this._arrows[0].clientHeight;
	}

	public set offset(offset: string | number) {
		this.state.offset = Number(offset);
	}

	public get offset(): number {
		return this.state.offset ?? this.arrowHeight;
	}

	public set delay(delay: number | string) {
		this.state.delay = Number(delay);
	}

	public get delay(): number {
		return (this.state.delay ?? 3) * 100;
	}

	public set hoverable(openOnOverOrFocus: boolean) {
		if (this.state.hoverable === openOnOverOrFocus) return;

		this.state.hoverable = openOnOverOrFocus;

		if (openOnOverOrFocus) {
			this.listen(this._triggerWrapper, "mouseenter", this._mouseEnter);
			this.listen(this._triggerWrapper, "focusin", this._mouseEnter);
			this.listen(this._triggerWrapper, "mouseleave", this._mouseLeave);
			this.listen(this._triggerWrapper, "focusout", this._mouseLeave);

			this.listen(this._toggleTipBtn, "click", this._readIntoLiveRegion);
		} else {
			this.stopListening(this._triggerWrapper, "mouseenter", this._mouseEnter);
			this.stopListening(this._triggerWrapper, "focusin", this._mouseEnter);
			this.stopListening(this._triggerWrapper, "mouseleave", this._mouseLeave);
			this.stopListening(this._triggerWrapper, "focusout", this._mouseLeave);

			this.stopListening(this._toggleTipBtn, "click", this._readIntoLiveRegion);
		}
	}

	// TODO: debounce this
	private _readIntoLiveRegion = () => {
		this._liveRegion.textContent = (this._content.firstElementChild as HTMLSlotElement)
			.assignedNodes()
			.reduce((acc, curr) => (acc += `${curr.textContent}`), "");

		setTimeout(() => (this._liveRegion.textContent = ""), 1000);
	};

	public set clickable(openOnClick: boolean) {
		if (this.state.hoverable === openOnClick) return;

		this.state.clickable = openOnClick;

		if (openOnClick) {
			this.listen(this._triggerWrapper, "click", this._toggleOnClick);
		} else {
			this.stopListening(this._triggerWrapper, "click", this._toggleOnClick);
		}
	}

	public set inlineStart(newState: boolean) {
		this.state.inlineStart = newState;
		if (newState) this.state.inlineEnd = false;
	}

	public set inlineEnd(newState: boolean) {
		this.state.inlineEnd = newState;
		if (newState) this.state.inlineStart = false;
	}

	public set blockStart(newState: boolean) {
		this.state.blockStart = newState;
		if (newState) this.state.blockEnd = false;
	}

	public set blockEnd(newState: boolean) {
		this.state.blockEnd = newState;
		if (newState) this.state.blockStart = false;
	}

	public set descriptive(descriptive: boolean) {
		this.state.descriptive = descriptive;

		if (descriptive) this._toggleTipBtn.setAttribute("aria-describedby", "content");
		else this._toggleTipBtn.removeAttribute("aria-describedby");
	}

	public set labelling(labelling: boolean) {
		this.state.labelling = labelling;

		if (labelling) this._toggleTipBtn.setAttribute("aria-labelledby", "content");
		else this._toggleTipBtn.removeAttribute("aria-labelledby");
	}

	connectedCallback() {
		// Set hoverable to default
		this.hoverable ??= !this.clickable;
		// set aria expanded for toggle tips
		if (this.isToggleTip) this._toggleTipBtn.setAttribute("aria-expanded", "false");
	}

	private _positionOnScreen() {
		const { vertical, horizontal } = this.getDirectionality();
		const { blockStart, inlineStart } = this._getTextDirection();
		const triggerRect = this._triggerWrapper.getBoundingClientRect();
		const anchorRect = this._anchor.getBoundingClientRect();
		const halfArrowHeight: number = this.arrowHeight / 2;

		const centerer = (basePosition: number, anchorMeasure: number, triggerMeasure: number) =>
			basePosition - (anchorMeasure - triggerMeasure) / 2;

		const toolTipContentVerticalPositioner = (isBlockStart: boolean) =>
			blockStart === NonLogicalProperties.top && isBlockStart
				? triggerRect.top - anchorRect.height - this.offset
				: triggerRect.bottom + this.offset;

		const toolTipArrowVerticalPositioner = (isBlockStart: boolean): ArrowVariableLengths =>
			blockStart === NonLogicalProperties.top && isBlockStart
				? `calc(100% - ${halfArrowHeight}px)`
				: `-${halfArrowHeight}px`;

		const toolTipContentHorizontalPositioner = (isInlineStart: boolean) =>
			inlineStart === NonLogicalProperties.left && isInlineStart
				? triggerRect.right + this.offset
				: triggerRect.left - anchorRect.width - this.offset;

		const toolTipArrowHorizontalPositioner = (isInlineStart: boolean): ArrowVariableLengths =>
			inlineStart === NonLogicalProperties.left && isInlineStart
				? `-${halfArrowHeight}px`
				: `calc(100% - ${halfArrowHeight}px)`;

		const adjustedArrowHorizontalPositioner = (tooltipLeft: number): number =>
			triggerRect.left + triggerRect.width / 2 - tooltipLeft;

		let tooltipTop: number;
		let arrowTop: ArrowVariableLengths;
		let triggerArrowPointTargetY: number;

		switch (vertical) {
			case POSITIONS.blockStart:
				tooltipTop = toolTipContentVerticalPositioner(true);
				arrowTop = toolTipArrowVerticalPositioner(true);

				triggerArrowPointTargetY = triggerRect.top;
				break;

			case POSITIONS.blockEnd:
				tooltipTop = toolTipContentVerticalPositioner(false);
				arrowTop = toolTipArrowVerticalPositioner(false);
				triggerArrowPointTargetY = triggerRect.bottom;
				break;

			case POSITIONS.center: {
				tooltipTop = centerer(triggerRect.top, anchorRect.height, triggerRect.height);
				triggerArrowPointTargetY = triggerRect.top + triggerRect.height / 2;
				break;
			}
		}

		let tooltipLeft: number;
		let arrowLeft: ArrowVariableLengths;
		let triggerArrowPointTargetX: number;
		switch (horizontal) {
			case POSITIONS.inlineEnd:
				tooltipLeft = toolTipContentHorizontalPositioner(true);
				arrowLeft = toolTipArrowHorizontalPositioner(true);

				// TODO: all of these need to be logical property'd
				triggerArrowPointTargetX = triggerRect.right;

				// if tooltip would spill offscreen...
				if (tooltipLeft + anchorRect.width > innerWidth) {
					console.log("overflow inline end");
					// ... make the right of the tooltip this.offset length from the edge
					tooltipLeft = Math.min(
						innerWidth - anchorRect.width - this.offset,
						triggerRect.right - halfArrowHeight * 3
					);
					arrowLeft = `${Math.max(adjustedArrowHorizontalPositioner(tooltipLeft), halfArrowHeight)}px`;
					triggerArrowPointTargetX = null;

					if (vertical === POSITIONS.center) {
						tooltipTop = toolTipContentVerticalPositioner(true);
						arrowTop = `calc(100% - ${halfArrowHeight}px)`;
					}
				}
				break;

			case POSITIONS.inlineStart:
				tooltipLeft = toolTipContentHorizontalPositioner(false);
				arrowLeft = toolTipArrowHorizontalPositioner(false);
				triggerArrowPointTargetX = triggerRect.left;

				// if tooltip would spill offscreen...
				if (tooltipLeft < 0) {
					// ... make the left of the tooltip this.offset length from the edge
					tooltipLeft = Math.max(this.offset, triggerRect.left - anchorRect.width + halfArrowHeight * 3);
					arrowLeft = `${Math.min(
						adjustedArrowHorizontalPositioner(tooltipLeft),
						anchorRect.width - halfArrowHeight * 3
					)}px`;

					triggerArrowPointTargetX = null;

					if (vertical === POSITIONS.center) {
						tooltipTop = toolTipContentVerticalPositioner(true);
						arrowTop = `calc(100% - ${halfArrowHeight}px)`;
					}
				}
				break;

			case POSITIONS.center: {
				tooltipLeft = centerer(triggerRect.left, anchorRect.width, triggerRect.width);
				arrowLeft = "calc(50% - 5px)";

				if (tooltipLeft < 0) {
					// ... make the left of the tooltip this.offset length from the edge
					tooltipLeft = this.offset;
					arrowLeft = `${Math.min(
						adjustedArrowHorizontalPositioner(tooltipLeft),
						this._anchor.getBoundingClientRect().right - halfArrowHeight
					)}px`;

					triggerArrowPointTargetX = null;

					if (vertical === POSITIONS.center) {
						tooltipTop = toolTipContentVerticalPositioner(true);
						arrowTop = `calc(100% - ${halfArrowHeight}px)`;
					}
				}

				if (tooltipLeft + anchorRect.width > innerWidth) {
					// ... make the right of the tooltip this.offset length from the edge
					tooltipLeft = innerWidth - anchorRect.width - this.offset;
					arrowLeft = `${adjustedArrowHorizontalPositioner(tooltipLeft)}px`;
					triggerArrowPointTargetX = null;

					if (vertical === POSITIONS.center) {
						tooltipTop = toolTipContentVerticalPositioner(true);
						arrowTop = `calc(100% - ${halfArrowHeight}px)`;
					}
				}
				break;
			}
		}

		this._anchor.style.left = `${tooltipLeft}px`;
		this._anchor.style.top = `${tooltipTop}px`;

		this._anchor.style.setProperty("--tooltip__content-top", arrowTop);
		this._anchor.style.setProperty("--tooltip__content-left", arrowLeft);

		const {
			y: arrowY,
			x: arrowX,
			height: arrowHeight,
			width: arrowWidth,
		} = this._arrows[0].getBoundingClientRect();

		const arrowCenterY = arrowY + arrowHeight / 2;
		const arrowCenterX = arrowX + arrowWidth / 2;

		// we need degrees for the next step, so just doing that here
		const degrees =
			(Math.atan2(
				arrowCenterY - (triggerArrowPointTargetY ?? arrowCenterY),
				arrowCenterX - (triggerArrowPointTargetX ?? arrowCenterX)
			) *
				180) /
			Math.PI;
		this._anchor.style.setProperty("--tooltip__arrow-rotate", `${degrees}deg`);

		// if our angle is rougly a right one, then translate arrow forward.
		if (!(Math.round(degrees) % 90))
			this._anchor.style.setProperty("--tooltip__arrow-adjust", `-${halfArrowHeight}px`);
	}

	private _mouseEnter = () => {
		this._mouseEnterTimeout = window.setTimeout(() => (this.open = true), this.delay);
	};

	private _mouseLeave = () => {
		clearTimeout(this._mouseEnterTimeout);
		this.open = false;
	};

	private _closeOnEsc = ({ key }: KeyboardEvent) => {
		if (key === "Escape") this.open = false;
	};

	private _closeClick = () => {
		this.open = false;
	};

	private _toggleOnClick = () => {
		if (!this.open) {
			this.open = true;
			setTimeout(() => this.listen(window, "click", this._closeClick));
		}
	};

	public show() {
		this.open = true;
	}

	public hide() {
		this.open = false;
	}

	public getDirectionality(): Directionality {
		// prettier-ignore
		const horizontal = this.state.inlineEnd 
			? POSITIONS.inlineEnd 
			: this.state.inlineStart 
				? POSITIONS.inlineStart 
				: POSITIONS.center;

		// prettier-ignore
		const vertical = this.state.blockEnd 
			? POSITIONS.blockEnd 
			: this.state.blockStart || horizontal === POSITIONS.center
				? POSITIONS.blockStart
				: POSITIONS.center;

		return {
			vertical,
			horizontal,
		};
	}
}
