// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as ColorPicker from '../../ui/legacy/components/color_picker/color_picker.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { BezierPopoverIcon, ColorSwatchPopoverIcon, ShadowSwatchPopoverHelper, } from './ColorSwatchPopoverIcon.js';
import * as ElementsComponents from './components/components.js';
import { cssRuleValidatorsMap } from './CSSRuleValidator.js';
import { ElementsPanel } from './ElementsPanel.js';
import { StyleEditorWidget } from './StyleEditorWidget.js';
import { getCssDeclarationAsJavascriptProperty } from './StylePropertyUtils.js';
import { CSSPropertyPrompt, REGISTERED_PROPERTY_SECTION_NAME, StylesSidebarPane, StylesSidebarPropertyRenderer, } from './StylesSidebarPane.js';
const FlexboxEditor = ElementsComponents.StylePropertyEditor.FlexboxEditor;
const GridEditor = ElementsComponents.StylePropertyEditor.GridEditor;
export const activeHints = new WeakMap();
const UIStrings = {
    /**
     *@description Text in Color Swatch Popover Icon of the Elements panel
     */
    shiftClickToChangeColorFormat: 'Shift + Click to change color format.',
    /**
     *@description Swatch icon element title in Color Swatch Popover Icon of the Elements panel
     *@example {Shift + Click to change color format.} PH1
     */
    openColorPickerS: 'Open color picker. {PH1}',
    /**
     *@description Context menu item for style property in edit mode
     */
    togglePropertyAndContinueEditing: 'Toggle property and continue editing',
    /**
     *@description Context menu item for style property in edit mode
     */
    revealInSourcesPanel: 'Reveal in Sources panel',
    /**
     *@description A context menu item in Styles panel to copy CSS declaration
     */
    copyDeclaration: 'Copy declaration',
    /**
     *@description A context menu item in Styles panel to copy CSS property
     */
    copyProperty: 'Copy property',
    /**
     *@description A context menu item in the Watch Expressions Sidebar Pane of the Sources panel and Network pane request.
     */
    copyValue: 'Copy value',
    /**
     *@description A context menu item in Styles panel to copy CSS rule
     */
    copyRule: 'Copy rule',
    /**
     *@description A context menu item in Styles panel to copy all CSS declarations
     */
    copyAllDeclarations: 'Copy all declarations',
    /**
     *@description  A context menu item in Styles panel to copy all the CSS changes
     */
    copyAllCSSChanges: 'Copy all CSS changes',
    /**
     *@description A context menu item in Styles panel to view the computed CSS property value.
     */
    viewComputedValue: 'View computed value',
    /**
     * @description Title of the button that opens the flexbox editor in the Styles panel.
     */
    flexboxEditorButton: 'Open `flexbox` editor',
    /**
     * @description Title of the button that opens the CSS Grid editor in the Styles panel.
     */
    gridEditorButton: 'Open `grid` editor',
    /**
     *@description A context menu item in Styles panel to copy CSS declaration as JavaScript property.
     */
    copyCssDeclarationAsJs: 'Copy declaration as JS',
    /**
     *@description A context menu item in Styles panel to copy all declarations of CSS rule as JavaScript properties.
     */
    copyAllCssDeclarationsAsJs: 'Copy all declarations as JS',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/StylePropertyTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const parentMap = new WeakMap();
export class StylePropertyTreeElement extends UI.TreeOutline.TreeElement {
    style;
    matchedStylesInternal;
    property;
    inheritedInternal;
    overloadedInternal;
    parentPaneInternal;
    isShorthand;
    applyStyleThrottler;
    newProperty;
    expandedDueToFilter;
    valueElement;
    nameElement;
    expandElement;
    originalPropertyText;
    hasBeenEditedIncrementally;
    prompt;
    lastComputedValue;
    computedStyles = null;
    parentsComputedStyles = null;
    contextForTest;
    #propertyTextFromSource;
    constructor({ stylesPane, matchedStyles, property, isShorthand, inherited, overloaded, newProperty }) {
        // Pass an empty title, the title gets made later in onattach.
        super('', isShorthand);
        this.style = property.ownerStyle;
        this.matchedStylesInternal = matchedStyles;
        this.property = property;
        this.inheritedInternal = inherited;
        this.overloadedInternal = overloaded;
        this.selectable = false;
        this.parentPaneInternal = stylesPane;
        this.isShorthand = isShorthand;
        this.applyStyleThrottler = new Common.Throttler.Throttler(0);
        this.newProperty = newProperty;
        if (this.newProperty) {
            this.listItemElement.textContent = '';
        }
        this.expandedDueToFilter = false;
        this.valueElement = null;
        this.nameElement = null;
        this.expandElement = null;
        this.originalPropertyText = '';
        this.hasBeenEditedIncrementally = false;
        this.prompt = null;
        this.lastComputedValue = null;
        this.#propertyTextFromSource = property.propertyText || '';
    }
    matchedStyles() {
        return this.matchedStylesInternal;
    }
    editable() {
        const isLonghandInsideShorthand = this.parent instanceof StylePropertyTreeElement && this.parent.isShorthand;
        const hasSourceData = Boolean(this.style.styleSheetId && this.style.range);
        return !isLonghandInsideShorthand && hasSourceData;
    }
    inherited() {
        return this.inheritedInternal;
    }
    overloaded() {
        return this.overloadedInternal;
    }
    setOverloaded(x) {
        if (x === this.overloadedInternal) {
            return;
        }
        this.overloadedInternal = x;
        this.updateState();
    }
    setComputedStyles(computedStyles) {
        this.computedStyles = computedStyles;
    }
    setParentsComputedStyles(parentsComputedStyles) {
        this.parentsComputedStyles = parentsComputedStyles;
    }
    get name() {
        return this.property.name;
    }
    get value() {
        return this.property.value;
    }
    updateFilter() {
        const regex = this.parentPaneInternal.filterRegex();
        const matches = regex !== null && (regex.test(this.property.name) || regex.test(this.property.value));
        this.listItemElement.classList.toggle('filter-match', matches);
        void this.onpopulate();
        let hasMatchingChildren = false;
        for (let i = 0; i < this.childCount(); ++i) {
            const child = this.childAt(i);
            if (!child || (child && !child.updateFilter())) {
                continue;
            }
            hasMatchingChildren = true;
        }
        if (!regex) {
            if (this.expandedDueToFilter) {
                this.collapse();
            }
            this.expandedDueToFilter = false;
        }
        else if (hasMatchingChildren && !this.expanded) {
            this.expand();
            this.expandedDueToFilter = true;
        }
        else if (!hasMatchingChildren && this.expanded && this.expandedDueToFilter) {
            this.collapse();
            this.expandedDueToFilter = false;
        }
        return matches;
    }
    renderColorSwatch(text, valueChild) {
        const useUserSettingFormat = this.editable();
        const shiftClickMessage = i18nString(UIStrings.shiftClickToChangeColorFormat);
        const tooltip = this.editable() ? i18nString(UIStrings.openColorPickerS, { PH1: shiftClickMessage }) : '';
        const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
        swatch.setReadonly(!this.editable());
        swatch.renderColor(text, useUserSettingFormat, tooltip);
        if (!valueChild) {
            valueChild = swatch.createChild('span');
            const color = swatch.getColor();
            valueChild.textContent =
                color ? (color.getAuthoredText() ?? color.asString(swatch.getFormat() ?? undefined)) : text;
        }
        swatch.appendChild(valueChild);
        const onColorChanged = (event) => {
            const { data } = event;
            swatch.firstElementChild && swatch.firstElementChild.remove();
            swatch.createChild('span').textContent = data.text;
            // This is a terrible hack to make sure that color swatch works for CSS variable usages with
            // variable fallbacks. The issue is `StylesSidebarPropertyRenderer` renders CSS variables with var() fallbacks
            // with two additions to the value element: CSS var swatch that renders `var(--red, var(--blue)` part -- without the last parens
            // and a text node with a closing parenthesis. If the color is changed through color swatch, the value becomes invalid with an
            // additional parenthesis like `#000)`; so in here, we explicitly remove the last parenthesis.
            if (swatch.nextSibling?.textContent === ')') {
                swatch.nextSibling.textContent = '';
            }
            void this.applyStyleText(this.renderedPropertyText(), false);
        };
        swatch.addEventListener(InlineEditor.ColorSwatch.ClickEvent.eventName, () => {
            Host.userMetrics.swatchActivated(2 /* Host.UserMetrics.SwatchType.Color */);
        });
        swatch.addEventListener(InlineEditor.ColorSwatch.ColorChangedEvent.eventName, onColorChanged);
        if (this.editable()) {
            const swatchIcon = new ColorSwatchPopoverIcon(this, this.parentPaneInternal.swatchPopoverHelper(), swatch);
            swatchIcon.addEventListener("colorchanged" /* ColorSwatchPopoverIconEvents.ColorChanged */, ev => {
                // TODO(crbug.com/1402233): Is it really okay to dispatch an event from `Swatch` here?
                // This needs consideration as current structure feels a bit different:
                // There are: ColorSwatch, ColorSwatchPopoverIcon, and Spectrum
                // * Our entry into the Spectrum is `ColorSwatch` and `ColorSwatch` is able to
                // update the color too. (its format at least, don't know the difference)
                // * ColorSwatchPopoverIcon is a helper to show/hide the Spectrum popover
                // * Spectrum is the color picker
                //
                // My idea is: merge `ColorSwatch` and `ColorSwatchPopoverIcon`
                // and emit `ColorChanged` event whenever color is changed.
                // Until then, this is a hack to kind of emulate the behavior described above
                // `swatch` is dispatching its own ColorChangedEvent with the changed
                // color text whenever the color changes.
                swatch.dispatchEvent(new InlineEditor.ColorSwatch.ColorChangedEvent(ev.data));
            });
            void this.addColorContrastInfo(swatchIcon);
        }
        return swatch;
    }
    processAnimationName(animationNamePropertyText) {
        const animationNames = animationNamePropertyText.split(',').map(name => name.trim());
        const contentChild = document.createElement('span');
        for (let i = 0; i < animationNames.length; i++) {
            const animationName = animationNames[i];
            const swatch = new InlineEditor.LinkSwatch.LinkSwatch();
            UI.UIUtils.createTextChild(swatch, animationName);
            const isDefined = Boolean(this.matchedStylesInternal.keyframes().find(kf => kf.name().text === animationName));
            swatch.data = {
                text: animationName,
                isDefined,
                onLinkActivate: () => {
                    Host.userMetrics.swatchActivated(1 /* Host.UserMetrics.SwatchType.AnimationNameLink */);
                    this.parentPaneInternal.jumpToSectionBlock(`@keyframes ${animationName}`);
                },
                jslogContext: 'cssAnimationName',
            };
            contentChild.appendChild(swatch);
            if (i !== animationNames.length - 1) {
                contentChild.appendChild(document.createTextNode(', '));
            }
        }
        return contentChild;
    }
    processAnimation(animationPropertyValue) {
        const animationNameProperty = this.property.getLonghandProperties().find(longhand => longhand.name === 'animation-name');
        if (!animationNameProperty) {
            return document.createTextNode(animationPropertyValue);
        }
        const animationNames = animationNameProperty.value.split(',').map(name => name.trim());
        const cssAnimationModel = InlineEditor.CSSAnimationModel.CSSAnimationModel.parse(animationPropertyValue, animationNames);
        const contentChild = document.createElement('span');
        for (let i = 0; i < cssAnimationModel.parts.length; i++) {
            const part = cssAnimationModel.parts[i];
            switch (part.type) {
                case "T" /* InlineEditor.CSSAnimationModel.PartType.Text */:
                    contentChild.appendChild(document.createTextNode(part.value));
                    break;
                case "EF" /* InlineEditor.CSSAnimationModel.PartType.EasingFunction */:
                    contentChild.appendChild(this.processBezier(part.value));
                    break;
                case "AN" /* InlineEditor.CSSAnimationModel.PartType.AnimationName */:
                    contentChild.appendChild(this.processAnimationName(part.value));
                    break;
                case "V" /* InlineEditor.CSSAnimationModel.PartType.Variable */:
                    contentChild.appendChild(this.processVar(part.value));
                    break;
            }
            if (cssAnimationModel.parts[i + 1]?.value !== ',' && i !== cssAnimationModel.parts.length - 1) {
                contentChild.appendChild(document.createTextNode(' '));
            }
        }
        return contentChild;
    }
    processPositionFallback(propertyText) {
        const contentChild = document.createElement('span');
        const swatch = new InlineEditor.LinkSwatch.LinkSwatch();
        UI.UIUtils.createTextChild(swatch, propertyText);
        const isDefined = Boolean(this.matchedStylesInternal.positionFallbackRules().find(pf => pf.name().text === propertyText));
        swatch.data = {
            text: propertyText,
            isDefined,
            onLinkActivate: () => {
                Host.userMetrics.swatchActivated(9 /* Host.UserMetrics.SwatchType.PositionFallbackLink */);
                this.parentPaneInternal.jumpToSectionBlock(`@position-fallback ${propertyText}`);
            },
            jslogContext: 'cssPositionFallback',
        };
        contentChild.appendChild(swatch);
        return contentChild;
    }
    processFontPalette(propertyText) {
        const contentChild = document.createElement('span');
        const swatch = new InlineEditor.LinkSwatch.LinkSwatch();
        UI.UIUtils.createTextChild(swatch, propertyText);
        const isDefined = this.matchedStylesInternal.fontPaletteValuesRule()?.name().text === propertyText;
        swatch.data = {
            text: propertyText,
            isDefined,
            onLinkActivate: () => {
                this.parentPaneInternal.jumpToSectionBlock(`@font-palette-values ${propertyText}`);
            },
            jslogContext: 'cssFontPalette',
        };
        contentChild.appendChild(swatch);
        return contentChild;
    }
    processColor(text, valueChild) {
        return this.renderColorSwatch(text, valueChild);
    }
    processColorMix(text) {
        let colorMixText = text;
        let interpolationMethodResolvedCorrectly = false;
        const paramColorValues = [];
        const colorMixModel = InlineEditor.ColorMixModel.ColorMixModel.parse(text);
        if (!colorMixModel) {
            return document.createTextNode(text);
        }
        const handleInterpolationMethod = (interpolationMethod) => {
            const matches = TextUtils.TextUtils.Utils.splitStringByRegexes(interpolationMethod, [SDK.CSSMetadata.VariableRegex]);
            for (const match of matches) {
                if (match.regexIndex === 0) {
                    const computedSingleValue = this.matchedStylesInternal.computeSingleVariableValue(this.style, match.value);
                    if (!computedSingleValue || !computedSingleValue.computedValue) {
                        return;
                    }
                    colorMixText = colorMixText.replace(match.value, computedSingleValue.computedValue);
                    const varSwatch = this.processVar(match.value);
                    contentChild.appendChild(varSwatch);
                }
                else {
                    contentChild.appendChild(document.createTextNode(match.value));
                }
            }
            interpolationMethodResolvedCorrectly = true;
            return;
        };
        const handleValue = (value, onChange) => {
            // Parameter is a CSS variable
            if (value.match(SDK.CSSMetadata.VariableRegex)) {
                const computedSingleValue = this.matchedStylesInternal.computeSingleVariableValue(this.style, value);
                // The variable is not defined or it is not a color
                if (!computedSingleValue || !computedSingleValue.computedValue ||
                    !Common.Color.parse(computedSingleValue.computedValue)) {
                    return;
                }
                const { computedValue } = computedSingleValue;
                // Update `var` reference in the color mix text with the variable's
                // computed value since the same variable is not defined in DevTools
                // reference to that in the CSS will result in undefined color.
                colorMixText = colorMixText.replace(value, computedValue);
                const varSwatch = this.processVar(value);
                if (varSwatch instanceof InlineEditor.ColorSwatch.ColorSwatch) {
                    varSwatch.addEventListener(InlineEditor.ColorSwatch.ColorChangedEvent.eventName, (ev) => {
                        onChange(ev.data.text);
                    });
                }
                contentChild.appendChild(varSwatch);
                paramColorValues.push(computedSingleValue.computedValue);
                return;
            }
            // Parameter is specified as an actual color (i.e. #000)
            if (value.match(Common.Color.Regex)) {
                const colorSwatch = this.processColor(value);
                if (colorSwatch instanceof InlineEditor.ColorSwatch.ColorSwatch) {
                    colorSwatch.addEventListener(InlineEditor.ColorSwatch.ColorChangedEvent.eventName, (ev) => {
                        onChange(ev.data.text);
                    });
                }
                contentChild.appendChild(colorSwatch);
                paramColorValues.push(value);
            }
        };
        const handleParam = (paramParts, onChange) => {
            for (let i = 0; i < paramParts.length; i++) {
                const part = paramParts[i];
                if (part.name === "V" /* InlineEditor.ColorMixModel.PartName.Value */) {
                    handleValue(part.value, onChange);
                }
                else {
                    contentChild.appendChild(document.createTextNode(part.value));
                }
                if (i !== paramParts.length - 1) {
                    contentChild.appendChild(document.createTextNode(' '));
                }
            }
        };
        const [interpolationMethod, firstParam, secondParam] = colorMixModel.parts;
        const swatch = new InlineEditor.ColorMixSwatch.ColorMixSwatch();
        const contentChild = document.createElement('span');
        contentChild.appendChild(document.createTextNode('color-mix('));
        handleInterpolationMethod(interpolationMethod.value);
        contentChild.appendChild(document.createTextNode(', '));
        handleParam(firstParam.value, (color) => {
            swatch.setFirstColor(color);
        });
        contentChild.appendChild(document.createTextNode(', '));
        handleParam(secondParam.value, (color) => {
            swatch.setSecondColor(color);
        });
        contentChild.appendChild(document.createTextNode(')'));
        if (paramColorValues.length !== 2 || !interpolationMethodResolvedCorrectly) {
            return document.createTextNode(text);
        }
        swatch.appendChild(contentChild);
        swatch.setFirstColor(paramColorValues[0]);
        swatch.setSecondColor(paramColorValues[1]);
        swatch.setColorMixText(colorMixText);
        return swatch;
    }
    processVar(text, { shouldShowColorSwatch = true } = {}) {
        // The regex that matches to variables in `StylesSidebarPropertyRenderer`
        // uses a lazy match. Because of this, when there are multiple right parantheses inside the
        // var() function, it stops the match. So, for a match like `var(--a, var(--b))`, the text
        // corresponds to `var(--a, var(--b)`; before processing it, we make sure that parantheses
        // are matched.
        const parenthesesBalancedText = text + ')'.repeat(Platform.StringUtilities.countUnmatchedLeftParentheses(text));
        const computedSingleValue = this.matchedStylesInternal.computeSingleVariableValue(this.style, parenthesesBalancedText);
        const { variableName, fallback } = SDK.CSSMatchedStyles.parseCSSVariableNameAndFallback(parenthesesBalancedText);
        if (!computedSingleValue || !variableName) {
            return document.createTextNode(parenthesesBalancedText);
        }
        const { computedValue, fromFallback } = computedSingleValue;
        let fallbackHtml = null;
        if (fromFallback && fallback?.startsWith('var(')) {
            fallbackHtml = this.processVar(fallback, { shouldShowColorSwatch: false });
        }
        else if (fallback) {
            fallbackHtml = document.createTextNode(fallback);
        }
        const varSwatch = new InlineEditor.LinkSwatch.CSSVarSwatch();
        UI.UIUtils.createTextChild(varSwatch, text);
        varSwatch.data = {
            computedValue,
            variableName,
            fromFallback,
            fallbackHtml,
            onLinkActivate: this.handleVarDefinitionActivate.bind(this),
        };
        if (varSwatch.link?.linkElement) {
            const { textContent } = varSwatch.link.linkElement;
            if (textContent) {
                const computedValueOfLink = textContent ?
                    this.matchedStylesInternal.computeSingleVariableValue(this.style, `var(${textContent})`) :
                    null;
                this.parentPaneInternal.addPopover(varSwatch.link, () => this.#getVariablePopoverContents(textContent, computedValueOfLink?.computedValue ?? null));
            }
        }
        if (!computedValue || !Common.Color.parse(computedValue) || !shouldShowColorSwatch) {
            return varSwatch;
        }
        return this.processColor(computedValue, varSwatch);
    }
    handleVarDefinitionActivate(variableName) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.CustomPropertyLinkClicked);
        Host.userMetrics.swatchActivated(0 /* Host.UserMetrics.SwatchType.VarLink */);
        this.parentPaneInternal.jumpToProperty(variableName) ||
            this.parentPaneInternal.jumpToProperty('initial-value', variableName, REGISTERED_PROPERTY_SECTION_NAME);
    }
    async addColorContrastInfo(swatchIcon) {
        if (this.property.name !== 'color' || !this.parentPaneInternal.cssModel() || !this.node()) {
            return;
        }
        const cssModel = this.parentPaneInternal.cssModel();
        const node = this.node();
        if (cssModel && node && typeof node.id !== 'undefined') {
            const contrastInfo = new ColorPicker.ContrastInfo.ContrastInfo(await cssModel.getBackgroundColors(node.id));
            swatchIcon.setContrastInfo(contrastInfo);
        }
    }
    renderedPropertyText() {
        if (!this.nameElement || !this.valueElement) {
            return '';
        }
        return this.nameElement.textContent + ': ' + this.valueElement.textContent;
    }
    processBezier(text) {
        if (!this.editable() || !InlineEditor.AnimationTimingModel.AnimationTimingModel.parse(text)) {
            return document.createTextNode(text);
        }
        const swatchPopoverHelper = this.parentPaneInternal.swatchPopoverHelper();
        const swatch = InlineEditor.Swatches.BezierSwatch.create();
        swatch.iconElement().addEventListener('click', () => {
            Host.userMetrics.swatchActivated(3 /* Host.UserMetrics.SwatchType.AnimationTiming */);
        });
        swatch.setBezierText(text);
        new BezierPopoverIcon({ treeElement: this, swatchPopoverHelper, swatch });
        return swatch;
    }
    processFont(text) {
        const section = this.section();
        if (section) {
            section.registerFontProperty(this);
        }
        return document.createTextNode(text);
    }
    processShadow(propertyValue, propertyName) {
        if (!this.editable()) {
            return document.createTextNode(propertyValue);
        }
        let shadows;
        if (propertyName === 'text-shadow') {
            shadows = InlineEditor.CSSShadowModel.CSSShadowModel.parseTextShadow(propertyValue);
        }
        else {
            shadows = InlineEditor.CSSShadowModel.CSSShadowModel.parseBoxShadow(propertyValue);
        }
        if (!shadows.length) {
            return document.createTextNode(propertyValue);
        }
        const container = document.createDocumentFragment();
        const swatchPopoverHelper = this.parentPaneInternal.swatchPopoverHelper();
        for (let i = 0; i < shadows.length; i++) {
            if (i !== 0) {
                container.appendChild(document.createTextNode(', '));
            } // Add back commas and spaces between each shadow.
            // TODO(flandy): editing the property value should use the original value with all spaces.
            const cssShadowSwatch = InlineEditor.Swatches.CSSShadowSwatch.create();
            cssShadowSwatch.setAttribute('jslog', `${VisualLogging.showStyleEditor().context('cssShadow').track({ click: true })}`);
            cssShadowSwatch.setCSSShadow(shadows[i]);
            cssShadowSwatch.iconElement().addEventListener('click', () => {
                Host.userMetrics.swatchActivated(4 /* Host.UserMetrics.SwatchType.Shadow */);
            });
            new ShadowSwatchPopoverHelper(this, swatchPopoverHelper, cssShadowSwatch);
            const colorSwatch = cssShadowSwatch.colorSwatch();
            if (colorSwatch) {
                colorSwatch.addEventListener(InlineEditor.ColorSwatch.ClickEvent.eventName, () => {
                    Host.userMetrics.swatchActivated(2 /* Host.UserMetrics.SwatchType.Color */);
                });
                const swatchIcon = new ColorSwatchPopoverIcon(this, swatchPopoverHelper, colorSwatch);
                swatchIcon.addEventListener("colorchanged" /* ColorSwatchPopoverIconEvents.ColorChanged */, ev => {
                    // TODO(crbug.com/1402233): Is it really okay to dispatch an event from `Swatch` here?
                    colorSwatch.dispatchEvent(new InlineEditor.ColorSwatch.ColorChangedEvent(ev.data));
                });
                colorSwatch.addEventListener(InlineEditor.ColorSwatch.ColorChangedEvent.eventName, () => {
                    void this.applyStyleText(this.renderedPropertyText(), false);
                });
            }
            container.appendChild(cssShadowSwatch);
        }
        return container;
    }
    processGrid(propertyValue, _propertyName) {
        const splitResult = TextUtils.TextUtils.Utils.splitStringByRegexes(propertyValue, [SDK.CSSMetadata.GridAreaRowRegex]);
        if (splitResult.length <= 1) {
            return document.createTextNode(propertyValue);
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const container = document.createDocumentFragment();
        for (const result of splitResult) {
            const value = result.value.trim();
            const content = UI.Fragment.html `<br /><span class='styles-clipboard-only'>${indent.repeat(2)}</span>${value}`;
            container.appendChild(content);
        }
        return container;
    }
    processAngle(angleText) {
        if (!this.editable()) {
            return document.createTextNode(angleText);
        }
        const cssAngle = new InlineEditor.CSSAngle.CSSAngle();
        cssAngle.setAttribute('jslog', `${VisualLogging.showStyleEditor().track({ click: true }).context('cssAngle')}`);
        const valueElement = document.createElement('span');
        valueElement.textContent = angleText;
        const computedPropertyValue = this.matchedStylesInternal.computeValue(this.property.ownerStyle, this.property.value) || '';
        cssAngle.data = {
            propertyName: this.property.name,
            propertyValue: computedPropertyValue,
            angleText,
            containingPane: this.parentPaneInternal.element.enclosingNodeOrSelfWithClass('style-panes-wrapper'),
        };
        cssAngle.append(valueElement);
        const popoverToggled = (event) => {
            const section = this.section();
            if (!section) {
                return;
            }
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = event;
            if (data.open) {
                this.parentPaneInternal.hideAllPopovers();
                this.parentPaneInternal.activeCSSAngle = cssAngle;
                Host.userMetrics.swatchActivated(7 /* Host.UserMetrics.SwatchType.Angle */);
            }
            section.element.classList.toggle('has-open-popover', data.open);
            this.parentPaneInternal.setEditingStyle(data.open);
        };
        const valueChanged = async (event) => {
            const { data } = event;
            valueElement.textContent = data.value;
            await this.applyStyleText(this.renderedPropertyText(), false);
            const computedPropertyValue = this.matchedStylesInternal.computeValue(this.property.ownerStyle, this.property.value) || '';
            cssAngle.updateProperty(this.property.name, computedPropertyValue);
        };
        const unitChanged = async (event) => {
            const { data } = event;
            valueElement.textContent = data.value;
        };
        cssAngle.addEventListener('popovertoggled', popoverToggled);
        cssAngle.addEventListener('valuechanged', valueChanged);
        cssAngle.addEventListener('unitchanged', unitChanged);
        return cssAngle;
    }
    processLength(lengthText) {
        if (!this.editable()) {
            return document.createTextNode(lengthText);
        }
        const cssLength = new InlineEditor.CSSLength.CSSLength();
        const valueElement = document.createElement('span');
        valueElement.textContent = lengthText;
        cssLength.data = {
            lengthText,
            overloaded: this.overloadedInternal,
        };
        cssLength.append(valueElement);
        const onValueChanged = (event) => {
            const { data } = event;
            valueElement.textContent = data.value;
            this.parentPaneInternal.setEditingStyle(true);
            void this.applyStyleText(this.renderedPropertyText(), false);
        };
        const onDraggingFinished = () => {
            this.parentPaneInternal.setEditingStyle(false);
        };
        cssLength.addEventListener('valuechanged', onValueChanged);
        cssLength.addEventListener('draggingfinished', onDraggingFinished);
        return cssLength;
    }
    updateState() {
        if (!this.listItemElement) {
            return;
        }
        if (this.style.isPropertyImplicit(this.name)) {
            this.listItemElement.classList.add('implicit');
        }
        else {
            this.listItemElement.classList.remove('implicit');
        }
        const hasIgnorableError = !this.property.parsedOk && StylesSidebarPane.ignoreErrorsForProperty(this.property);
        if (hasIgnorableError) {
            this.listItemElement.classList.add('has-ignorable-error');
        }
        else {
            this.listItemElement.classList.remove('has-ignorable-error');
        }
        if (this.inherited()) {
            this.listItemElement.classList.add('inherited');
        }
        else {
            this.listItemElement.classList.remove('inherited');
        }
        if (this.overloaded()) {
            this.listItemElement.classList.add('overloaded');
        }
        else {
            this.listItemElement.classList.remove('overloaded');
        }
        if (this.property.disabled) {
            this.listItemElement.classList.add('disabled');
        }
        else {
            this.listItemElement.classList.remove('disabled');
        }
        this.listItemElement.classList.toggle('changed', this.isPropertyChanged(this.property));
    }
    node() {
        return this.parentPaneInternal.node();
    }
    parentPane() {
        return this.parentPaneInternal;
    }
    section() {
        if (!this.treeOutline) {
            return null;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.treeOutline.section;
    }
    updatePane() {
        const section = this.section();
        if (section) {
            section.refreshUpdate(this);
        }
    }
    async toggleDisabled(disabled) {
        const oldStyleRange = this.style.range;
        if (!oldStyleRange) {
            return;
        }
        this.parentPaneInternal.setUserOperation(true);
        const success = await this.property.setDisabled(disabled);
        this.parentPaneInternal.setUserOperation(false);
        if (!success) {
            return;
        }
        this.matchedStylesInternal.resetActiveProperties();
        this.updatePane();
        this.styleTextAppliedForTest();
    }
    isPropertyChanged(property) {
        if (!Root.Runtime.experiments.isEnabled(Root.Runtime.ExperimentName.STYLES_PANE_CSS_CHANGES)) {
            return false;
        }
        // Check local cache first, then check against diffs from the workspace.
        return this.#propertyTextFromSource !== property.propertyText || this.parentPane().isPropertyChanged(property);
    }
    async onpopulate() {
        // Only populate once and if this property is a shorthand.
        if (this.childCount() || !this.isShorthand) {
            return;
        }
        const longhandProperties = this.property.getLonghandProperties();
        const leadingProperties = this.style.leadingProperties();
        for (const property of longhandProperties) {
            const name = property.name;
            let inherited = false;
            let overloaded = false;
            const section = this.section();
            if (section) {
                inherited = section.isPropertyInherited(name);
                overloaded =
                    this.matchedStylesInternal.propertyState(property) === SDK.CSSMatchedStyles.PropertyState.Overloaded;
            }
            const leadingProperty = leadingProperties.find(property => property.name === name && property.activeInStyle());
            if (leadingProperty) {
                overloaded = true;
            }
            const item = new StylePropertyTreeElement({
                stylesPane: this.parentPaneInternal,
                matchedStyles: this.matchedStylesInternal,
                property,
                isShorthand: false,
                inherited,
                overloaded,
                newProperty: false,
            });
            item.setComputedStyles(this.computedStyles);
            item.setParentsComputedStyles(this.parentsComputedStyles);
            this.appendChild(item);
        }
    }
    onattach() {
        this.updateTitle();
        this.listItemElement.addEventListener('mousedown', event => {
            if (event.button === 0) {
                parentMap.set(this.parentPaneInternal, this);
            }
        }, false);
        this.listItemElement.addEventListener('mouseup', this.mouseUp.bind(this));
        this.listItemElement.addEventListener('click', event => {
            if (!event.target) {
                return;
            }
            const node = event.target;
            if (!node.hasSelection() && event.target !== this.listItemElement) {
                event.consume(true);
            }
        });
        // Copy context menu.
        this.listItemElement.addEventListener('contextmenu', this.handleCopyContextMenuEvent.bind(this));
    }
    onexpand() {
        this.updateExpandElement();
    }
    oncollapse() {
        this.updateExpandElement();
    }
    updateExpandElement() {
        if (!this.expandElement) {
            return;
        }
        if (this.expanded) {
            this.expandElement.setIconType('triangle-down');
        }
        else {
            this.expandElement.setIconType('triangle-right');
        }
    }
    #getRegisteredPropertyDetails(variableName) {
        const registration = this.matchedStyles().getRegisteredProperty(variableName);
        const goToDefinition = () => this.parentPaneInternal.jumpToSection(variableName, REGISTERED_PROPERTY_SECTION_NAME);
        return registration ? { registration, goToDefinition } : undefined;
    }
    #getVariablePopoverContents(variableName, computedValue) {
        return new ElementsComponents.CSSVariableValueView.CSSVariableValueView({
            variableName,
            value: computedValue ?? undefined,
            details: this.#getRegisteredPropertyDetails(variableName),
        });
    }
    updateTitleIfComputedValueChanged() {
        const computedValue = this.matchedStylesInternal.computeValue(this.property.ownerStyle, this.property.value);
        if (computedValue === this.lastComputedValue) {
            return;
        }
        this.lastComputedValue = computedValue;
        this.innerUpdateTitle();
    }
    updateTitle() {
        this.lastComputedValue = this.matchedStylesInternal.computeValue(this.property.ownerStyle, this.property.value);
        this.innerUpdateTitle();
    }
    innerUpdateTitle() {
        this.updateState();
        if (this.isExpandable()) {
            this.expandElement = UI.Icon.Icon.create('triangle-right', 'expand-icon');
            this.expandElement.setAttribute('jslog', `${VisualLogging.treeItemExpand().track({ click: true })}`);
        }
        const propertyRenderer = new StylesSidebarPropertyRenderer(this.style.parentRule, this.node(), this.name, this.value);
        if (this.property.parsedOk) {
            propertyRenderer.setVarHandler(this.processVar.bind(this));
            propertyRenderer.setAnimationNameHandler(this.processAnimationName.bind(this));
            propertyRenderer.setAnimationHandler(this.processAnimation.bind(this));
            propertyRenderer.setColorHandler(this.processColor.bind(this));
            propertyRenderer.setColorMixHandler(this.processColorMix.bind(this));
            propertyRenderer.setBezierHandler(this.processBezier.bind(this));
            propertyRenderer.setFontHandler(this.processFont.bind(this));
            propertyRenderer.setShadowHandler(this.processShadow.bind(this));
            propertyRenderer.setGridHandler(this.processGrid.bind(this));
            propertyRenderer.setAngleHandler(this.processAngle.bind(this));
            propertyRenderer.setLengthHandler(this.processLength.bind(this));
            propertyRenderer.setPositionFallbackHandler(this.processPositionFallback.bind(this));
            propertyRenderer.setFontPaletteHandler(this.processFontPalette.bind(this));
        }
        this.listItemElement.removeChildren();
        this.nameElement = propertyRenderer.renderName();
        if (this.property.name.startsWith('--') && this.nameElement) {
            this.parentPaneInternal.addPopover(this.nameElement, () => this.#getVariablePopoverContents(this.property.name, this.matchedStylesInternal.computeCSSVariable(this.style, this.property.name)));
        }
        this.valueElement = propertyRenderer.renderValue();
        if (!this.treeOutline) {
            return;
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        UI.UIUtils.createTextChild(this.listItemElement.createChild('span', 'styles-clipboard-only'), indent + (this.property.disabled ? '/* ' : ''));
        if (this.nameElement) {
            this.listItemElement.appendChild(this.nameElement);
        }
        if (this.valueElement) {
            const lineBreakValue = this.valueElement.firstElementChild && this.valueElement.firstElementChild.tagName === 'BR';
            const separator = lineBreakValue ? ':' : ': ';
            this.listItemElement.createChild('span', 'styles-name-value-separator').textContent = separator;
            if (this.expandElement) {
                this.listItemElement.appendChild(this.expandElement);
            }
            this.listItemElement.appendChild(this.valueElement);
            const semicolon = this.listItemElement.createChild('span', 'styles-semicolon');
            semicolon.textContent = ';';
            semicolon.onmouseup = this.mouseUp.bind(this);
            if (this.property.disabled) {
                UI.UIUtils.createTextChild(this.listItemElement.createChild('span', 'styles-clipboard-only'), ' */');
            }
        }
        const section = this.section();
        if (this.valueElement && section && section.editable && this.property.name === 'display') {
            const propertyValue = this.property.trimmedValueWithoutImportant();
            const isFlex = propertyValue === 'flex' || propertyValue === 'inline-flex';
            const isGrid = propertyValue === 'grid' || propertyValue === 'inline-grid';
            if (isFlex || isGrid) {
                const key = `${section.getSectionIdx()}_${section.nextEditorTriggerButtonIdx}`;
                const button = StyleEditorWidget.createTriggerButton(this.parentPaneInternal, section, isFlex ? FlexboxEditor : GridEditor, isFlex ? i18nString(UIStrings.flexboxEditorButton) : i18nString(UIStrings.gridEditorButton), key);
                button.setAttribute('jslog', `${VisualLogging.showStyleEditor().track({ click: true }).context(isFlex ? 'flex' : 'grid')}`);
                section.nextEditorTriggerButtonIdx++;
                button.addEventListener('click', () => {
                    Host.userMetrics.swatchActivated(isFlex ? 6 /* Host.UserMetrics.SwatchType.Flex */ : 5 /* Host.UserMetrics.SwatchType.Grid */);
                });
                this.listItemElement.appendChild(button);
                const helper = this.parentPaneInternal.swatchPopoverHelper();
                if (helper.isShowing(StyleEditorWidget.instance()) && StyleEditorWidget.instance().getTriggerKey() === key) {
                    helper.setAnchorElement(button);
                }
            }
        }
        if (this.property.parsedOk) {
            this.updateAuthoringHint();
        }
        else {
            // Avoid having longhands under an invalid shorthand.
            this.listItemElement.classList.add('not-parsed-ok');
            const registrationDetails = this.#getRegisteredPropertyDetails(this.property.name);
            const tooltip = registrationDetails ?
                new ElementsComponents.CSSVariableValueView.CSSVariableParserError(registrationDetails) :
                null;
            // Add a separate exclamation mark IMG element with a tooltip.
            this.listItemElement.insertBefore(this.parentPaneInternal.createExclamationMark(this.property, tooltip), this.listItemElement.firstChild);
            // When the property is valid but the property value is invalid,
            // add line-through only to the property value.
            const invalidPropertyValue = SDK.CSSMetadata.cssMetadata().isCSSPropertyName(this.property.name);
            if (invalidPropertyValue) {
                this.listItemElement.classList.add('invalid-property-value');
            }
        }
        if (!this.property.activeInStyle()) {
            this.listItemElement.classList.add('inactive');
        }
        this.updateFilter();
        if (this.property.parsedOk && this.section() && this.parent && this.parent.root) {
            const enabledCheckboxElement = document.createElement('input');
            enabledCheckboxElement.className = 'enabled-button';
            enabledCheckboxElement.type = 'checkbox';
            enabledCheckboxElement.checked = !this.property.disabled;
            enabledCheckboxElement.setAttribute('jslog', `${VisualLogging.toggle().track({ click: true })}`);
            enabledCheckboxElement.addEventListener('mousedown', event => event.consume(), false);
            enabledCheckboxElement.addEventListener('click', event => {
                void this.toggleDisabled(!this.property.disabled);
                event.consume();
            }, false);
            if (this.nameElement && this.valueElement) {
                UI.ARIAUtils.setLabel(enabledCheckboxElement, `${this.nameElement.textContent} ${this.valueElement.textContent}`);
            }
            const copyIcon = UI.Icon.Icon.create('copy', 'copy');
            UI.Tooltip.Tooltip.install(copyIcon, i18nString(UIStrings.copyDeclaration));
            copyIcon.addEventListener('click', () => {
                const propertyText = `${this.property.name}: ${this.property.value};`;
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(propertyText);
                Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.DeclarationViaChangedLine);
            });
            this.listItemElement.append(copyIcon);
            this.listItemElement.insertBefore(enabledCheckboxElement, this.listItemElement.firstChild);
        }
    }
    updateAuthoringHint() {
        this.listItemElement.classList.remove('inactive-property');
        const existingElement = this.listItemElement.querySelector('.hint');
        if (existingElement) {
            activeHints.delete(existingElement);
            existingElement?.closest('.hint-wrapper')?.remove();
        }
        const propertyName = this.property.name;
        if (!cssRuleValidatorsMap.has(propertyName)) {
            return;
        }
        // Different rules apply to SVG nodes altogether. We currently don't have SVG-specific hints.
        if (this.node()?.isSVGNode()) {
            return;
        }
        const cssModel = this.parentPaneInternal.cssModel();
        const fontFaces = cssModel?.fontFaces() || [];
        const localName = this.node()?.localName();
        for (const validator of cssRuleValidatorsMap.get(propertyName) || []) {
            const hint = validator.getHint(propertyName, this.computedStyles || undefined, this.parentsComputedStyles || undefined, localName?.toLowerCase(), fontFaces);
            if (hint) {
                Host.userMetrics.cssHintShown(validator.getMetricType());
                const wrapper = document.createElement('span');
                wrapper.classList.add('hint-wrapper');
                const hintIcon = new IconButton.Icon.Icon();
                hintIcon.data = { iconName: 'info', color: 'var(--icon-default)', width: '14px', height: '14px' };
                hintIcon.classList.add('hint');
                wrapper.append(hintIcon);
                activeHints.set(hintIcon, hint);
                this.listItemElement.append(wrapper);
                this.listItemElement.classList.add('inactive-property');
                break;
            }
        }
    }
    mouseUp(event) {
        const activeTreeElement = parentMap.get(this.parentPaneInternal);
        parentMap.delete(this.parentPaneInternal);
        if (!activeTreeElement) {
            return;
        }
        if (this.listItemElement.hasSelection()) {
            return;
        }
        if (UI.UIUtils.isBeingEdited(event.target)) {
            return;
        }
        event.consume(true);
        if (event.target === this.listItemElement) {
            return;
        }
        const section = this.section();
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlEquivalentKey(event) && section && section.navigable) {
            this.navigateToSource(event.target);
            return;
        }
        this.startEditing(event.target);
    }
    handleContextMenuEvent(context, event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        if (this.property.parsedOk && this.section() && this.parent && this.parent.root) {
            const sectionIndex = this.parentPaneInternal.focusedSectionIndex();
            contextMenu.defaultSection().appendCheckboxItem(i18nString(UIStrings.togglePropertyAndContinueEditing), async () => {
                if (this.treeOutline) {
                    const propertyIndex = this.treeOutline.rootElement().indexOfChild(this);
                    // order matters here: this.editingCancelled may invalidate this.treeOutline.
                    this.editingCancelled(null, context);
                    await this.toggleDisabled(!this.property.disabled);
                    event.consume();
                    this.parentPaneInternal.continueEditingElement(sectionIndex, propertyIndex);
                }
            }, !this.property.disabled);
        }
        const revealCallback = this.navigateToSource.bind(this);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.revealInSourcesPanel), revealCallback);
        void contextMenu.show();
    }
    handleCopyContextMenuEvent(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const contextMenu = this.createCopyContextMenu(event);
        void contextMenu.show();
    }
    createCopyContextMenu(event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyDeclaration), () => {
            const propertyText = `${this.property.name}: ${this.property.value};`;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(propertyText);
            Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.DeclarationViaContextMenu);
        });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyProperty), () => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this.property.name);
            Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.PropertyViaContextMenu);
        });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyValue), () => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this.property.value);
            Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.ValueViaContextMenu);
        });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyRule), () => {
            const section = this.section();
            const ruleText = StylesSidebarPane.formatLeadingProperties(section).ruleText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(ruleText);
            Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.RuleViaContextMenu);
        });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyCssDeclarationAsJs), this.copyCssDeclarationAsJs.bind(this));
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyAllDeclarations), () => {
            const section = this.section();
            const allDeclarationText = StylesSidebarPane.formatLeadingProperties(section).allDeclarationText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(allDeclarationText);
            Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.AllDeclarationsViaContextMenu);
        });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyAllCssDeclarationsAsJs), this.copyAllCssDeclarationAsJs.bind(this));
        // TODO(changhaohan): conditionally add this item only when there are changes to copy
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.copyAllCSSChanges), async () => {
            const allChanges = await this.parentPane().getFormattedChanges();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(allChanges);
            Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.AllChangesViaStylesPane);
        });
        contextMenu.footerSection().appendItem(i18nString(UIStrings.viewComputedValue), () => {
            void this.viewComputedValue();
        });
        return contextMenu;
    }
    async viewComputedValue() {
        const computedStyleWidget = ElementsPanel.instance().getComputedStyleWidget();
        if (!computedStyleWidget.isShowing()) {
            await UI.ViewManager.ViewManager.instance().showView('Computed');
        }
        let propertyNamePattern = '';
        if (this.isShorthand) {
            propertyNamePattern = '^' + this.property.name + '-';
        }
        else {
            propertyNamePattern = '^' + this.property.name + '$';
        }
        const regex = new RegExp(propertyNamePattern, 'i');
        await computedStyleWidget.filterComputedStyles(regex);
        computedStyleWidget.input.setValue(this.property.name);
        computedStyleWidget.input.element.focus();
    }
    copyCssDeclarationAsJs() {
        const cssDeclarationValue = getCssDeclarationAsJavascriptProperty(this.property);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(cssDeclarationValue);
        Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.DeclarationAsJSViaContextMenu);
    }
    copyAllCssDeclarationAsJs() {
        const section = this.section();
        const leadingProperties = (section.style()).leadingProperties();
        const cssDeclarationsAsJsProperties = leadingProperties.filter(property => !property.disabled).map(getCssDeclarationAsJavascriptProperty);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(cssDeclarationsAsJsProperties.join(',\n'));
        Host.userMetrics.styleTextCopied(Host.UserMetrics.StyleTextCopied.AllDeclarationsAsJSViaContextMenu);
    }
    navigateToSource(element, omitFocus) {
        const section = this.section();
        if (!section || !section.navigable) {
            return;
        }
        const propertyNameClicked = element === this.nameElement;
        const uiLocation = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().propertyUILocation(this.property, propertyNameClicked);
        if (uiLocation) {
            void Common.Revealer.reveal(uiLocation, omitFocus);
        }
    }
    startEditing(selectElement) {
        // FIXME: we don't allow editing of longhand properties under a shorthand right now.
        if (this.parent instanceof StylePropertyTreeElement && this.parent.isShorthand) {
            return;
        }
        if (this.expandElement && selectElement === this.expandElement) {
            return;
        }
        const section = this.section();
        if (section && !section.editable) {
            return;
        }
        if (selectElement) {
            selectElement = selectElement.enclosingNodeOrSelfWithClass('webkit-css-property') ||
                selectElement.enclosingNodeOrSelfWithClass('value') ||
                selectElement.enclosingNodeOrSelfWithClass('styles-semicolon');
        }
        if (!selectElement) {
            selectElement = this.nameElement;
        }
        if (UI.UIUtils.isBeingEdited(selectElement)) {
            return;
        }
        const isEditingName = selectElement === this.nameElement;
        if (!isEditingName && this.valueElement) {
            if (SDK.CSSMetadata.cssMetadata().isGridAreaDefiningProperty(this.name)) {
                this.valueElement.textContent = restoreGridIndents(this.value);
            }
            this.valueElement.textContent = restoreURLs(this.valueElement.textContent || '', this.value);
            selectElement = this.valueElement;
        }
        function restoreGridIndents(value) {
            const splitResult = TextUtils.TextUtils.Utils.splitStringByRegexes(value, [SDK.CSSMetadata.GridAreaRowRegex]);
            return splitResult.map(result => result.value.trim()).join('\n');
        }
        function restoreURLs(fieldValue, modelValue) {
            const splitFieldValue = fieldValue.split(SDK.CSSMetadata.URLRegex);
            if (splitFieldValue.length === 1) {
                return fieldValue;
            }
            const modelUrlRegex = new RegExp(SDK.CSSMetadata.URLRegex);
            for (let i = 1; i < splitFieldValue.length; i += 2) {
                const match = modelUrlRegex.exec(modelValue);
                if (match) {
                    splitFieldValue[i] = match[0];
                }
            }
            return splitFieldValue.join('');
        }
        const previousContent = selectElement ? (selectElement.textContent || '') : '';
        const context = {
            expanded: this.expanded,
            hasChildren: this.isExpandable(),
            isEditingName: isEditingName,
            originalProperty: this.property,
            previousContent: previousContent,
            originalName: undefined,
            originalValue: undefined,
        };
        this.contextForTest = context;
        // Lie about our children to prevent expanding on double click and to collapse shorthands.
        this.setExpandable(false);
        if (selectElement) {
            if (selectElement.parentElement) {
                selectElement.parentElement.classList.add('child-editing');
            }
            selectElement.textContent = selectElement.textContent; // remove color swatch and the like
        }
        function pasteHandler(context, event) {
            const clipboardEvent = event;
            const clipboardData = clipboardEvent.clipboardData;
            if (!clipboardData) {
                return;
            }
            const data = clipboardData.getData('Text');
            if (!data) {
                return;
            }
            const colonIdx = data.indexOf(':');
            if (colonIdx < 0) {
                return;
            }
            const name = data.substring(0, colonIdx).trim();
            const value = data.substring(colonIdx + 1).trim();
            event.preventDefault();
            if (typeof context.originalName === 'undefined') {
                if (this.nameElement) {
                    context.originalName = this.nameElement.textContent || '';
                }
                if (this.valueElement) {
                    context.originalValue = this.valueElement.textContent || '';
                }
            }
            this.property.name = name;
            this.property.value = value;
            if (this.nameElement) {
                this.nameElement.textContent = name;
                this.nameElement.normalize();
            }
            if (this.valueElement) {
                this.valueElement.textContent = value;
                this.valueElement.normalize();
            }
            const target = event.target;
            void this.editingCommitted(target.textContent || '', context, 'forward');
        }
        function blurListener(context, event) {
            const target = event.target;
            let text = target.textContent;
            if (!context.isEditingName) {
                text = this.value || text;
            }
            void this.editingCommitted(text || '', context, '');
        }
        this.originalPropertyText = this.property.propertyText || '';
        this.parentPaneInternal.setEditingStyle(true, this);
        if (selectElement && selectElement.parentElement) {
            selectElement.parentElement.scrollIntoViewIfNeeded(false);
        }
        this.prompt = new CSSPropertyPrompt(this, isEditingName);
        this.prompt.setAutocompletionTimeout(0);
        this.prompt.addEventListener(UI.TextPrompt.Events.TextChanged, _event => {
            void this.applyFreeFlowStyleTextEdit(context);
        });
        const invalidString = this.property.getInvalidStringForInvalidProperty();
        if (invalidString && selectElement) {
            UI.ARIAUtils.alert(invalidString);
        }
        if (selectElement) {
            const proxyElement = this.prompt.attachAndStartEditing(selectElement, blurListener.bind(this, context));
            this.navigateToSource(selectElement, true);
            proxyElement.addEventListener('keydown', this.editingNameValueKeyDown.bind(this, context), false);
            proxyElement.addEventListener('keypress', this.editingNameValueKeyPress.bind(this, context), false);
            if (isEditingName) {
                proxyElement.addEventListener('paste', pasteHandler.bind(this, context), false);
                proxyElement.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this, context), false);
            }
            const componentSelection = selectElement.getComponentSelection();
            if (componentSelection) {
                componentSelection.selectAllChildren(selectElement);
            }
        }
    }
    editingNameValueKeyDown(context, event) {
        if (event.handled) {
            return;
        }
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        let result;
        if ((keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) ||
            (context.isEditingName && keyboardEvent.key === ' ')) {
            result = 'forward';
        }
        else if (keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Esc.code ||
            keyboardEvent.key === Platform.KeyboardUtilities.ESCAPE_KEY) {
            result = 'cancel';
        }
        else if (!context.isEditingName && this.newProperty &&
            keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Backspace.code) {
            // For a new property, when Backspace is pressed at the beginning of new property value, move back to the property name.
            const selection = target.getComponentSelection();
            if (selection && selection.isCollapsed && !selection.focusOffset) {
                event.preventDefault();
                result = 'backward';
            }
        }
        else if (keyboardEvent.key === 'Tab') {
            result = keyboardEvent.shiftKey ? 'backward' : 'forward';
            event.preventDefault();
        }
        if (result) {
            switch (result) {
                case 'cancel':
                    this.editingCancelled(null, context);
                    break;
                case 'forward':
                case 'backward':
                    void this.editingCommitted(target.textContent || '', context, result);
                    break;
            }
            event.consume();
            return;
        }
    }
    editingNameValueKeyPress(context, event) {
        function shouldCommitValueSemicolon(text, cursorPosition) {
            // FIXME: should this account for semicolons inside comments?
            let openQuote = '';
            for (let i = 0; i < cursorPosition; ++i) {
                const ch = text[i];
                if (ch === '\\' && openQuote !== '') {
                    ++i;
                } // skip next character inside string
                else if (!openQuote && (ch === '"' || ch === '\'')) {
                    openQuote = ch;
                }
                else if (openQuote === ch) {
                    openQuote = '';
                }
            }
            return !openQuote;
        }
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        const keyChar = String.fromCharCode(keyboardEvent.charCode);
        const selectionLeftOffset = this.#selectionLeftOffset(target);
        const isFieldInputTerminated = (context.isEditingName ? keyChar === ':' :
            keyChar === ';' && selectionLeftOffset !== null &&
                shouldCommitValueSemicolon(target.textContent || '', selectionLeftOffset));
        if (isFieldInputTerminated) {
            // Enter or colon (for name)/semicolon outside of string (for value).
            event.consume(true);
            void this.editingCommitted(target.textContent || '', context, 'forward');
            return;
        }
    }
    /** @returns Selection offset relative to `element` */
    #selectionLeftOffset(element) {
        const selection = element.getComponentSelection();
        if (!selection?.containsNode(element, true)) {
            return null;
        }
        let leftOffset = selection.anchorOffset;
        let node = selection.anchorNode;
        while (node !== element) {
            while (node?.previousSibling) {
                node = node.previousSibling;
                leftOffset += node.textContent?.length ?? 0;
            }
            node = node?.parentNodeOrShadowHost() ?? null;
        }
        return leftOffset;
    }
    async applyFreeFlowStyleTextEdit(context) {
        if (!this.prompt || !this.parentPaneInternal.node()) {
            return;
        }
        const enteredText = this.prompt.text();
        if (context.isEditingName && enteredText.includes(':')) {
            void this.editingCommitted(enteredText, context, 'forward');
            return;
        }
        const valueText = this.prompt.textWithCurrentSuggestion();
        if (valueText.includes(';')) {
            return;
        }
        // Prevent destructive side-effects during live-edit. crbug.com/433889
        const parentNode = this.parentPaneInternal.node();
        if (parentNode) {
            const isPseudo = Boolean(parentNode.pseudoType());
            if (isPseudo) {
                if (this.name.toLowerCase() === 'content') {
                    return;
                }
                const lowerValueText = valueText.trim().toLowerCase();
                if (lowerValueText.startsWith('content:') || lowerValueText === 'display: none') {
                    return;
                }
            }
        }
        if (context.isEditingName) {
            if (valueText.includes(':')) {
                await this.applyStyleText(valueText, false);
            }
            else if (this.hasBeenEditedIncrementally) {
                await this.applyOriginalStyle(context);
            }
        }
        else {
            if (this.nameElement) {
                await this.applyStyleText(`${this.nameElement.textContent}: ${valueText}`, false);
            }
        }
    }
    kickFreeFlowStyleEditForTest() {
        const context = this.contextForTest;
        return this.applyFreeFlowStyleTextEdit(context);
    }
    editingEnded(context) {
        this.setExpandable(context.hasChildren);
        if (context.expanded) {
            this.expand();
        }
        const editedElement = context.isEditingName ? this.nameElement : this.valueElement;
        // The proxyElement has been deleted, no need to remove listener.
        if (editedElement && editedElement.parentElement) {
            editedElement.parentElement.classList.remove('child-editing');
        }
        this.parentPaneInternal.setEditingStyle(false);
    }
    editingCancelled(element, context) {
        this.removePrompt();
        if (this.hasBeenEditedIncrementally) {
            void this.applyOriginalStyle(context);
        }
        else if (this.newProperty && this.treeOutline) {
            this.treeOutline.removeChild(this);
        }
        this.updateTitle();
        // This should happen last, as it clears the info necessary to restore the property value after [Page]Up/Down changes.
        this.editingEnded(context);
    }
    async applyOriginalStyle(context) {
        await this.applyStyleText(this.originalPropertyText, false, context.originalProperty);
    }
    findSibling(moveDirection) {
        let target = this;
        do {
            const sibling = moveDirection === 'forward' ? target.nextSibling : target.previousSibling;
            target = sibling instanceof StylePropertyTreeElement ? sibling : null;
        } while (target && target.inherited());
        return target;
    }
    async editingCommitted(userInput, context, moveDirection) {
        this.removePrompt();
        this.editingEnded(context);
        const isEditingName = context.isEditingName;
        // If the underlying property has been ripped out, always assume that the value having been entered was
        // a name-value pair and attempt to process it via the SDK.
        if (!this.nameElement || !this.valueElement) {
            return;
        }
        const nameElementValue = this.nameElement.textContent || '';
        const nameValueEntered = (isEditingName && nameElementValue.includes(':')) || !this.property;
        // Determine where to move to before making changes
        let createNewProperty = false;
        let moveToSelector = false;
        const isDataPasted = typeof context.originalName !== 'undefined';
        const isDirtyViaPaste = isDataPasted &&
            (this.nameElement.textContent !== context.originalName ||
                this.valueElement.textContent !== context.originalValue);
        const isPropertySplitPaste = isDataPasted && isEditingName && this.valueElement.textContent !== context.originalValue;
        let moveTo = this;
        const moveToOther = (isEditingName !== (moveDirection === 'forward'));
        const abandonNewProperty = this.newProperty && !userInput && (moveToOther || isEditingName);
        if (moveDirection === 'forward' && (!isEditingName || isPropertySplitPaste) ||
            moveDirection === 'backward' && isEditingName) {
            moveTo = moveTo.findSibling(moveDirection);
            if (!moveTo) {
                if (moveDirection === 'forward' && (!this.newProperty || userInput)) {
                    createNewProperty = true;
                }
                else if (moveDirection === 'backward') {
                    moveToSelector = true;
                }
            }
        }
        // Make the Changes and trigger the moveToNextCallback after updating.
        let moveToIndex = -1;
        if (moveTo !== null && this.treeOutline) {
            moveToIndex = this.treeOutline.rootElement().indexOfChild(moveTo);
        }
        const blankInput = Platform.StringUtilities.isWhitespace(userInput);
        const shouldCommitNewProperty = this.newProperty &&
            (isPropertySplitPaste || moveToOther || (!moveDirection && !isEditingName) || (isEditingName && blankInput) ||
                nameValueEntered);
        const section = this.section();
        if (((userInput !== context.previousContent || isDirtyViaPaste) && !this.newProperty) || shouldCommitNewProperty) {
            let propertyText;
            if (nameValueEntered) {
                propertyText = this.nameElement.textContent;
            }
            else if (blankInput ||
                (this.newProperty && Platform.StringUtilities.isWhitespace(this.valueElement.textContent || ''))) {
                propertyText = '';
            }
            else {
                if (isEditingName) {
                    propertyText = userInput + ': ' + this.property.value;
                }
                else {
                    propertyText = this.property.name + ': ' + userInput;
                }
            }
            await this.applyStyleText(propertyText || '', true);
            moveToNextCallback.call(this, this.newProperty, !blankInput, section);
        }
        else {
            if (isEditingName) {
                this.property.name = userInput;
            }
            else {
                this.property.value = userInput;
            }
            if (!isDataPasted && !this.newProperty) {
                this.updateTitle();
            }
            moveToNextCallback.call(this, this.newProperty, false, section);
        }
        /**
         * The Callback to start editing the next/previous property/selector.
         */
        function moveToNextCallback(alreadyNew, valueChanged, section) {
            if (!moveDirection) {
                this.parentPaneInternal.resetFocus();
                return;
            }
            // User just tabbed through without changes.
            if (moveTo && moveTo.parent) {
                moveTo.startEditing(!isEditingName ? moveTo.nameElement : moveTo.valueElement);
                return;
            }
            // User has made a change then tabbed, wiping all the original treeElements.
            // Recalculate the new treeElement for the same property we were going to edit next.
            if (moveTo && !moveTo.parent) {
                const rootElement = section.propertiesTreeOutline.rootElement();
                if (moveDirection === 'forward' && blankInput && !isEditingName) {
                    --moveToIndex;
                }
                if (moveToIndex >= rootElement.childCount() && !this.newProperty) {
                    createNewProperty = true;
                }
                else {
                    const treeElement = (moveToIndex >= 0 ? rootElement.childAt(moveToIndex) : null);
                    if (treeElement) {
                        let elementToEdit = !isEditingName || isPropertySplitPaste ? treeElement.nameElement : treeElement.valueElement;
                        if (alreadyNew && blankInput) {
                            elementToEdit = moveDirection === 'forward' ? treeElement.nameElement : treeElement.valueElement;
                        }
                        treeElement.startEditing(elementToEdit);
                        return;
                    }
                    if (!alreadyNew) {
                        moveToSelector = true;
                    }
                }
            }
            // Create a new attribute in this section (or move to next editable selector if possible).
            if (createNewProperty) {
                if (alreadyNew && !valueChanged && (isEditingName !== (moveDirection === 'backward'))) {
                    return;
                }
                section.addNewBlankProperty().startEditing();
                return;
            }
            if (abandonNewProperty) {
                moveTo = this.findSibling(moveDirection);
                const sectionToEdit = (moveTo || moveDirection === 'backward') ? section : section.nextEditableSibling();
                if (sectionToEdit) {
                    if (sectionToEdit.style().parentRule) {
                        sectionToEdit.startEditingSelector();
                    }
                    else {
                        sectionToEdit.moveEditorFromSelector(moveDirection);
                    }
                }
                return;
            }
            if (moveToSelector) {
                if (section.style().parentRule) {
                    section.startEditingSelector();
                }
                else {
                    section.moveEditorFromSelector(moveDirection);
                }
            }
        }
    }
    removePrompt() {
        // BUG 53242. This cannot go into editingEnded(), as it should always happen first for any editing outcome.
        if (this.prompt) {
            this.prompt.detach();
            this.prompt = null;
        }
    }
    styleTextAppliedForTest() {
    }
    applyStyleText(styleText, majorChange, property) {
        return this.applyStyleThrottler.schedule(this.innerApplyStyleText.bind(this, styleText, majorChange, property));
    }
    async innerApplyStyleText(styleText, majorChange, property) {
        // this.property might have been nulled at the end of the last innerApplyStyleText
        if (!this.treeOutline || !this.property) {
            return;
        }
        const oldStyleRange = this.style.range;
        if (!oldStyleRange) {
            return;
        }
        const hasBeenEditedIncrementally = this.hasBeenEditedIncrementally;
        styleText = styleText.replace(/[\xA0\t]/g, ' ').trim(); // Replace &nbsp; with whitespace.
        if (!styleText.length && majorChange && this.newProperty && !hasBeenEditedIncrementally) {
            // The user deleted everything and never applied a new property value via Up/Down scrolling/live editing, so remove the tree element and update.
            this.parent && this.parent.removeChild(this);
            return;
        }
        const currentNode = this.parentPaneInternal.node();
        this.parentPaneInternal.setUserOperation(true);
        styleText += Platform.StringUtilities.findUnclosedCssQuote(styleText);
        styleText += ')'.repeat(Platform.StringUtilities.countUnmatchedLeftParentheses(styleText));
        // Append a ";" if the new text does not end in ";".
        // FIXME: this does not handle trailing comments.
        if (styleText.length && !/;\s*$/.test(styleText)) {
            styleText += ';';
        }
        const overwriteProperty = !this.newProperty || hasBeenEditedIncrementally;
        let success = await this.property.setText(styleText, majorChange, overwriteProperty);
        // Revert to the original text if applying the new text failed
        if (hasBeenEditedIncrementally && majorChange && !success) {
            majorChange = false;
            success = await this.property.setText(this.originalPropertyText, majorChange, overwriteProperty);
        }
        this.parentPaneInternal.setUserOperation(false);
        // TODO: using this.property.index to access its containing StyleDeclaration's property will result in
        // off-by-1 errors when the containing StyleDeclaration's respective property has already been deleted.
        // These referencing logic needs to be updated to be more robust.
        const updatedProperty = property || this.style.propertyAt(this.property.index);
        const isPropertyWithinBounds = this.property.index < this.style.allProperties().length;
        if (!success || (!updatedProperty && isPropertyWithinBounds)) {
            if (majorChange) {
                // It did not apply, cancel editing.
                if (this.newProperty) {
                    this.treeOutline.removeChild(this);
                }
                else {
                    this.updateTitle();
                }
            }
            this.styleTextAppliedForTest();
            return;
        }
        if (updatedProperty) {
            this.listItemElement.classList.toggle('changed', this.isPropertyChanged(updatedProperty));
            this.parentPane().updateChangeStatus();
        }
        this.matchedStylesInternal.resetActiveProperties();
        this.hasBeenEditedIncrementally = true;
        // null check for updatedProperty before setting this.property as the code never expects this.property to be undefined or null.
        // This occurs when deleting the last index of a StylePropertiesSection as this.style._allProperties array gets updated
        // before we index it when setting the value for updatedProperty
        const deleteProperty = majorChange && !styleText.length;
        const section = this.section();
        if (deleteProperty && section) {
            section.resetToolbars();
        }
        else if (!deleteProperty && updatedProperty) {
            this.property = updatedProperty;
        }
        if (currentNode === this.node()) {
            this.updatePane();
        }
        this.styleTextAppliedForTest();
    }
    ondblclick() {
        return true; // handled
    }
    isEventWithinDisclosureTriangle(event) {
        return event.target === this.expandElement;
    }
}
//# sourceMappingURL=StylePropertyTreeElement.js.map