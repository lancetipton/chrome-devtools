// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as Platform from '../../../core/platform/platform.js';
import * as Root from '../../../core/root/root.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as Bindings from '../../../models/bindings/bindings.js';
import * as Workspace from '../../../models/workspace/workspace.js';
import * as NetworkForward from '../../../panels/network/forward/forward.js';
import * as CspEvaluator from '../../../third_party/csp_evaluator/csp_evaluator.js';
import * as ExpandableList from '../../../ui/components/expandable_list/expandable_list.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as Coordinator from '../../../ui/components/render_coordinator/render_coordinator.js';
import * as ReportView from '../../../ui/components/report_view/report_view.js';
import * as Components from '../../../ui/legacy/components/utils/utils.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import frameDetailsReportViewStyles from './frameDetailsReportView.css.js';
import { OriginTrialTreeView } from './OriginTrialTreeView.js';
import { PermissionsPolicySection, renderIconLink, } from './PermissionsPolicySection.js';
import { StackTrace } from './StackTrace.js';
const UIStrings = {
    /**
     *@description Section header in the Frame Details view
     */
    additionalInformation: 'Additional Information',
    /**
     *@description Explanation for why the additional information section is being shown
     */
    thisAdditionalDebugging: 'This additional (debugging) information is shown because the \'Protocol Monitor\' experiment is enabled.',
    /**
     *@description Label for subtitle of frame details view
     */
    frameId: 'Frame ID',
    /**
     *@description Name of a network resource type
     */
    document: 'Document',
    /**
     *@description A web URL (for a lot of languages this does not need to be translated, please translate only where necessary)
     */
    url: 'URL',
    /**
    /**
     *@description Title for a link to the Sources panel
     */
    clickToRevealInSourcesPanel: 'Click to reveal in Sources panel',
    /**
     *@description Title for a link to the Network panel
     */
    clickToRevealInNetworkPanel: 'Click to reveal in Network panel',
    /**
     *@description Title for unreachable URL field
     */
    unreachableUrl: 'Unreachable URL',
    /**
     *@description Title for a link that applies a filter to the network panel
     */
    clickToRevealInNetworkPanelMight: 'Click to reveal in Network panel (might require page reload)',
    /**
     *@description The origin of a URL (https://web.dev/same-site-same-origin/#origin)
     *(for a lot of languages this does not need to be translated, please translate only where necessary)
     */
    origin: 'Origin',
    /**
    /**
     *@description Related node label in Timeline UIUtils of the Performance panel
     */
    ownerElement: 'Owner Element',
    /**
     *@description Title for a link to the Elements panel
     */
    clickToRevealInElementsPanel: 'Click to reveal in Elements panel',
    /**
     *@description Title for ad frame type field
     */
    adStatus: 'Ad Status',
    /**
     *@description Description for ad frame type
     */
    rootDescription: 'This frame has been identified as the root frame of an ad',
    /**
     *@description Value for ad frame type
     */
    root: 'root',
    /**
     *@description Description for ad frame type
     */
    childDescription: 'This frame has been identified as a child frame of an ad',
    /**
     *@description Value for ad frame type
     */
    child: 'child',
    /**
     *@description Section header in the Frame Details view
     */
    securityIsolation: 'Security & Isolation',
    /**
     *@description Section header in the Frame Details view
     */
    contentSecurityPolicy: 'Content Security Policy (CSP)',
    /**
     *@description Row title for in the Frame Details view
     */
    secureContext: 'Secure Context',
    /**
     *@description Text in Timeline indicating that input has happened recently
     */
    yes: 'Yes',
    /**
     *@description Text in Timeline indicating that input has not happened recently
     */
    no: 'No',
    /**
     *@description Label for whether a frame is cross-origin isolated
     *(https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/)
     *(for a lot of languages this does not need to be translated, please translate only where necessary)
     */
    crossoriginIsolated: 'Cross-Origin Isolated',
    /**
     *@description Explanatory text in the Frame Details view
     */
    localhostIsAlwaysASecureContext: '`Localhost` is always a secure context',
    /**
     *@description Explanatory text in the Frame Details view
     */
    aFrameAncestorIsAnInsecure: 'A frame ancestor is an insecure context',
    /**
     *@description Explanatory text in the Frame Details view
     */
    theFramesSchemeIsInsecure: 'The frame\'s scheme is insecure',
    /**
     *@description This label specifies the server endpoints to which the server is reporting errors
     *and warnings through the Report-to API. Following this label will be the URL of the server.
     */
    reportingTo: 'reporting to',
    /**
     *@description Section header in the Frame Details view
     */
    apiAvailability: 'API availability',
    /**
     *@description Explanation of why cross-origin isolation is important
     *(https://web.dev/why-coop-coep/)
     *(for a lot of languages 'cross-origin isolation' does not need to be translated, please translate only where necessary)
     */
    availabilityOfCertainApisDepends: 'Availability of certain APIs depends on the document being cross-origin isolated.',
    /**
     *@description Description of the SharedArrayBuffer status
     */
    availableTransferable: 'available, transferable',
    /**
     *@description Description of the SharedArrayBuffer status
     */
    availableNotTransferable: 'available, not transferable',
    /**
     *@description Explanation for the SharedArrayBuffer availability status
     */
    unavailable: 'unavailable',
    /**
     *@description Tooltip for the SharedArrayBuffer availability status
     */
    sharedarraybufferConstructorIs: '`SharedArrayBuffer` constructor is available and `SABs` can be transferred via `postMessage`',
    /**
     *@description Tooltip for the SharedArrayBuffer availability status
     */
    sharedarraybufferConstructorIsAvailable: '`SharedArrayBuffer` constructor is available but `SABs` cannot be transferred via `postMessage`',
    /**
     *@description Explanation why SharedArrayBuffer will not be available in the future
     *(https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/)
     *(for a lot of languages 'cross-origin isolation' does not need to be translated, please translate only where necessary)
     */
    willRequireCrossoriginIsolated: '⚠️ will require cross-origin isolated context in the future',
    /**
     *@description Explanation why SharedArrayBuffer is not available
     *(https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/)
     *(for a lot of languages 'cross-origin isolation' does not need to be translated, please translate only where necessary).
     */
    requiresCrossoriginIsolated: 'requires cross-origin isolated context',
    /**
     *@description Explanation for the SharedArrayBuffer availability status in case the transfer of a SAB requires the
     * permission policy `cross-origin-isolated` to be enabled (e.g. because the message refers to the situation in an iframe).
     */
    transferRequiresCrossoriginIsolatedPermission: '`SharedArrayBuffer` transfer requires enabling the permission policy:',
    /**
     *@description Explanation for the Measure Memory availability status
     */
    available: 'available',
    /**
     *@description Tooltip for the Measure Memory availability status
     */
    thePerformanceAPI: 'The `performance.measureUserAgentSpecificMemory()` API is available',
    /**
     *@description Tooltip for the Measure Memory availability status
     */
    thePerformancemeasureuseragentspecificmemory: 'The `performance.measureUserAgentSpecificMemory()` API is not available',
    /**
     *@description Entry in the API availability section of the frame details view
     */
    measureMemory: 'Measure Memory',
    /**
     *@description Text that is usually a hyperlink to more documentation
     */
    learnMore: 'Learn more',
    /**
     *@description Label for a stack trace. If a frame is created programmatically (i.e. via JavaScript), there is a
     * stack trace for the line of code which caused the creation of the iframe. This is the stack trace we are showing here.
     */
    creationStackTrace: 'Frame Creation `Stack Trace`',
    /**
     *@description Tooltip for 'Frame Creation Stack Trace' explaining that the stack
     *trace shows where in the code the frame has been created programmatically
     */
    creationStackTraceExplanation: 'This frame was created programmatically. The `stack trace` shows where this happened.',
    /**
     *@description Text descripting why a frame has been indentified as an advertisement.
     */
    parentIsAdExplanation: 'This frame is considered an ad frame because its parent frame is an ad frame.',
    /**
     *@description Text descripting why a frame has been indentified as an advertisement.
     */
    matchedBlockingRuleExplanation: 'This frame is considered an ad frame because its current (or previous) main document is an ad resource.',
    /**
     *@description Text descripting why a frame has been indentified as an advertisement.
     */
    createdByAdScriptExplanation: 'There was an ad script in the `(async) stack` when this frame was created. Examining the creation `stack trace` of this frame might provide more insight.',
    /**
     *@description Label for a button which when clicked causes some information to be refreshed/updated.
     */
    refresh: 'Refresh',
    /**
     *@description Label for a link to an ad script, which created the current iframe.
     */
    creatorAdScript: 'Creator Ad Script',
    /**
     *@description Text describing the absence of a value.
     */
    none: 'None',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/components/FrameDetailsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
export class FrameDetailsReportView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    static litTagName = LitHtml.literal `devtools-resources-frame-details-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #frame;
    #target;
    #protocolMonitorExperimentEnabled = false;
    #permissionsPolicies = null;
    #permissionsPolicySectionData = { policies: [], showDetails: false };
    #originTrialTreeView = new OriginTrialTreeView();
    #linkifier = new Components.Linkifier.Linkifier();
    #adScriptId = null;
    constructor(frame) {
        super();
        this.#frame = frame;
        void this.render();
    }
    connectedCallback() {
        this.parentElement?.classList.add('overflow-auto');
        this.#protocolMonitorExperimentEnabled = Root.Runtime.experiments.isEnabled('protocolMonitor');
        this.#shadow.adoptedStyleSheets = [frameDetailsReportViewStyles];
    }
    async render() {
        this.#adScriptId = (await this.#frame?.parentFrame()?.getAdScriptId(this.#frame?.id)) || null;
        const debuggerModel = this.#adScriptId?.debuggerId ?
            await SDK.DebuggerModel.DebuggerModel.modelForDebuggerId(this.#adScriptId?.debuggerId) :
            null;
        this.#target = debuggerModel?.target();
        if (!this.#permissionsPolicies && this.#frame) {
            this.#permissionsPolicies = this.#frame.getPermissionsPolicyState();
        }
        await coordinator.write('FrameDetailsView render', () => {
            if (!this.#frame) {
                return;
            }
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            LitHtml.render(LitHtml.html `
        <${ReportView.ReportView.Report.litTagName} .data=${{ reportTitle: this.#frame.displayName() }}>
          ${this.#renderDocumentSection()}
          ${this.#renderIsolationSection()}
          ${this.#renderApiAvailabilitySection()}
          ${this.#renderOriginTrial()}
          ${LitHtml.Directives.until(this.#permissionsPolicies?.then(policies => {
                this.#permissionsPolicySectionData.policies = policies || [];
                return LitHtml.html `
              <${PermissionsPolicySection.litTagName}
                .data=${this.#permissionsPolicySectionData}
              >
              </${PermissionsPolicySection.litTagName}>
            `;
            }), LitHtml.nothing)}
          ${this.#protocolMonitorExperimentEnabled ? this.#renderAdditionalInfoSection() : LitHtml.nothing}
        </${ReportView.ReportView.Report.litTagName}>
      `, this.#shadow, { host: this });
            // clang-format on
        });
    }
    #renderOriginTrial() {
        if (!this.#frame) {
            return LitHtml.nothing;
        }
        this.#originTrialTreeView.classList.add('span-cols');
        const frame = this.#frame;
        const refreshOriginTrials = () => {
            void frame.getOriginTrials().then(trials => {
                this.#originTrialTreeView.data = { trials };
            });
        };
        refreshOriginTrials();
        return LitHtml.html `
    <${ReportView.ReportView.ReportSectionHeader.litTagName}>
      ${i18n.i18n.lockedString('Origin Trials')}
      <${IconButton.IconButton.IconButton.litTagName} class="inline-button" .data=${{
            clickHandler: refreshOriginTrials,
            groups: [
                {
                    iconName: 'refresh',
                    text: i18nString(UIStrings.refresh),
                    iconColor: 'var(--icon-default-hover)',
                    iconWidth: '14px',
                    iconHeight: '14px',
                },
            ],
        }}>
      </${IconButton.IconButton.IconButton.litTagName}>
    </${ReportView.ReportView.ReportSectionHeader.litTagName}>
    ${this.#originTrialTreeView}
    <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    #renderDocumentSection() {
        if (!this.#frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.document)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.url)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <div class="inline-items">
          ${this.#maybeRenderSourcesLinkForURL()}
          ${this.#maybeRenderNetworkLinkForURL()}
          <div class="text-ellipsis" title=${this.#frame.url}>${this.#frame.url}</div>
        </div>
      </${ReportView.ReportView.ReportValue.litTagName}>
      ${this.#maybeRenderUnreachableURL()}
      ${this.#maybeRenderOrigin()}
      ${LitHtml.Directives.until(this.#renderOwnerElement(), LitHtml.nothing)}
      ${this.#maybeRenderCreationStacktrace()}
      ${this.#maybeRenderAdStatus()}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    #maybeRenderSourcesLinkForURL() {
        if (!this.#frame || this.#frame.unreachableUrl()) {
            return LitHtml.nothing;
        }
        const sourceCode = this.#uiSourceCodeForFrame(this.#frame);
        return renderIconLink('breakpoint-circle', i18nString(UIStrings.clickToRevealInSourcesPanel), () => Common.Revealer.reveal(sourceCode));
    }
    #maybeRenderNetworkLinkForURL() {
        if (this.#frame) {
            const resource = this.#frame.resourceForURL(this.#frame.url);
            if (resource && resource.request) {
                const request = resource.request;
                return renderIconLink('arrow-up-down-circle', i18nString(UIStrings.clickToRevealInNetworkPanel), () => {
                    const requestLocation = NetworkForward.UIRequestLocation.UIRequestLocation.tab(request, NetworkForward.UIRequestLocation.UIRequestTabs.HeadersComponent);
                    return Common.Revealer.reveal(requestLocation);
                });
            }
        }
        return LitHtml.nothing;
    }
    #uiSourceCodeForFrame(frame) {
        for (const project of Workspace.Workspace.WorkspaceImpl.instance().projects()) {
            const projectTarget = Bindings.NetworkProject.NetworkProject.getTargetForProject(project);
            if (projectTarget && projectTarget === frame.resourceTreeModel().target()) {
                const uiSourceCode = project.uiSourceCodeForURL(frame.url);
                if (uiSourceCode) {
                    return uiSourceCode;
                }
            }
        }
        return null;
    }
    #maybeRenderUnreachableURL() {
        if (!this.#frame || !this.#frame.unreachableUrl()) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.unreachableUrl)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <div class="inline-items">
          ${this.#renderNetworkLinkForUnreachableURL()}
          <div class="text-ellipsis" title=${this.#frame.unreachableUrl()}>${this.#frame.unreachableUrl()}</div>
        </div>
      </${ReportView.ReportView.ReportValue.litTagName}>
    `;
    }
    #renderNetworkLinkForUnreachableURL() {
        if (this.#frame) {
            const unreachableUrl = Common.ParsedURL.ParsedURL.fromString(this.#frame.unreachableUrl());
            if (unreachableUrl) {
                return renderIconLink('arrow-up-down-circle', i18nString(UIStrings.clickToRevealInNetworkPanelMight), () => {
                    void Common.Revealer.reveal(NetworkForward.UIFilter.UIRequestFilter.filters([
                        {
                            filterType: NetworkForward.UIFilter.FilterType.Domain,
                            filterValue: unreachableUrl.domain(),
                        },
                        {
                            filterType: null,
                            filterValue: unreachableUrl.path,
                        },
                    ]));
                });
            }
        }
        return LitHtml.nothing;
    }
    #maybeRenderOrigin() {
        if (this.#frame && this.#frame.securityOrigin && this.#frame.securityOrigin !== '://') {
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.origin)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <div class="text-ellipsis" title=${this.#frame.securityOrigin}>${this.#frame.securityOrigin}</div>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
        }
        return LitHtml.nothing;
    }
    async #renderOwnerElement() {
        if (this.#frame) {
            const linkTargetDOMNode = await this.#frame.getOwnerDOMNodeOrDocument();
            if (linkTargetDOMNode) {
                // Disabled until https://crbug.com/1079231 is fixed.
                // clang-format off
                return LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.ownerElement)}</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} class="without-min-width">
            <div class="inline-items">
              <button class="link" role="link" tabindex=0
                @mouseenter=${() => this.#frame?.highlight()}
                @mouseleave=${() => SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight()}
                @click=${() => Common.Revealer.reveal(linkTargetDOMNode)}
                title=${i18nString(UIStrings.clickToRevealInElementsPanel)}
              >
                <${IconButton.Icon.Icon.litTagName} .data=${{
                    iconName: 'code-circle',
                    color: 'var(--icon-link)',
                    width: '16px',
                    height: '16px',
                }}>
                </${IconButton.Icon.Icon.litTagName}>
              </button>
              <button class="link text-link" role="link" tabindex=0 title=${i18nString(UIStrings.clickToRevealInElementsPanel)}
                @mouseenter=${() => this.#frame?.highlight()}
                @mouseleave=${() => SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight()}
                @click=${() => Common.Revealer.reveal(linkTargetDOMNode)}
              >
                &lt;${linkTargetDOMNode.nodeName().toLocaleLowerCase()}&gt;
              </button>
            </div>
          </${ReportView.ReportView.ReportValue.litTagName}>
        `;
                // clang-format on
            }
        }
        return LitHtml.nothing;
    }
    #maybeRenderCreationStacktrace() {
        const creationStackTraceData = this.#frame?.getCreationStackTraceData();
        if (creationStackTraceData && creationStackTraceData.creationStackTrace) {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName} title=${i18nString(UIStrings.creationStackTraceExplanation)}>${i18nString(UIStrings.creationStackTrace)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <${StackTrace.litTagName} .data=${{
                frame: this.#frame,
                buildStackTraceRows: Components.JSPresentationUtils.buildStackTraceRows,
            }}>
          </${StackTrace.litTagName}>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
            // clang-format on
        }
        return LitHtml.nothing;
    }
    #getAdFrameTypeStrings(type) {
        switch (type) {
            case "child" /* Protocol.Page.AdFrameType.Child */:
                return { value: i18nString(UIStrings.child), description: i18nString(UIStrings.childDescription) };
            case "root" /* Protocol.Page.AdFrameType.Root */:
                return { value: i18nString(UIStrings.root), description: i18nString(UIStrings.rootDescription) };
        }
    }
    #getAdFrameExplanationString(explanation) {
        switch (explanation) {
            case "CreatedByAdScript" /* Protocol.Page.AdFrameExplanation.CreatedByAdScript */:
                return i18nString(UIStrings.createdByAdScriptExplanation);
            case "MatchedBlockingRule" /* Protocol.Page.AdFrameExplanation.MatchedBlockingRule */:
                return i18nString(UIStrings.matchedBlockingRuleExplanation);
            case "ParentIsAd" /* Protocol.Page.AdFrameExplanation.ParentIsAd */:
                return i18nString(UIStrings.parentIsAdExplanation);
        }
    }
    #maybeRenderAdStatus() {
        if (!this.#frame) {
            return LitHtml.nothing;
        }
        const adFrameType = this.#frame.adFrameType();
        if (adFrameType === "none" /* Protocol.Page.AdFrameType.None */) {
            return LitHtml.nothing;
        }
        const typeStrings = this.#getAdFrameTypeStrings(adFrameType);
        const rows = [LitHtml.html `<div title=${typeStrings.description}>${typeStrings.value}</div>`];
        for (const explanation of this.#frame.adFrameStatus()?.explanations || []) {
            rows.push(LitHtml.html `<div>${this.#getAdFrameExplanationString(explanation)}</div>`);
        }
        const adScriptLinkElement = this.#target ? this.#linkifier.linkifyScriptLocation(this.#target, this.#adScriptId?.scriptId || null, Platform.DevToolsPath.EmptyUrlString, undefined, undefined) :
            null;
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.adStatus)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <${ExpandableList.ExpandableList.ExpandableList.litTagName} .data=${{ rows }}></${ExpandableList.ExpandableList.ExpandableList.litTagName}></${ReportView.ReportView.ReportValue.litTagName}>
      ${this.#target ? LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.creatorAdScript)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName} class="ad-script-link">${adScriptLinkElement}</${ReportView.ReportView.ReportValue.litTagName}>
      ` : LitHtml.nothing}
    `;
        // clang-format on
    }
    #renderIsolationSection() {
        if (!this.#frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.securityIsolation)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.secureContext)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        ${this.#frame.isSecureContext() ? i18nString(UIStrings.yes) : i18nString(UIStrings.no)}\xA0${this.#maybeRenderSecureContextExplanation()}
      </${ReportView.ReportView.ReportValue.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.crossoriginIsolated)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        ${this.#frame.isCrossOriginIsolated() ? i18nString(UIStrings.yes) : i18nString(UIStrings.no)}
      </${ReportView.ReportView.ReportValue.litTagName}>
      ${LitHtml.Directives.until(this.#maybeRenderCoopCoepCSPStatus(), LitHtml.nothing)}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    #maybeRenderSecureContextExplanation() {
        const explanation = this.#getSecureContextExplanation();
        if (explanation) {
            return LitHtml.html `<span class="inline-comment">${explanation}</span>`;
        }
        return LitHtml.nothing;
    }
    #getSecureContextExplanation() {
        switch (this.#frame?.getSecureContextType()) {
            case "Secure" /* Protocol.Page.SecureContextType.Secure */:
                return null;
            case "SecureLocalhost" /* Protocol.Page.SecureContextType.SecureLocalhost */:
                return i18nString(UIStrings.localhostIsAlwaysASecureContext);
            case "InsecureAncestor" /* Protocol.Page.SecureContextType.InsecureAncestor */:
                return i18nString(UIStrings.aFrameAncestorIsAnInsecure);
            case "InsecureScheme" /* Protocol.Page.SecureContextType.InsecureScheme */:
                return i18nString(UIStrings.theFramesSchemeIsInsecure);
        }
        return null;
    }
    async #maybeRenderCoopCoepCSPStatus() {
        if (this.#frame) {
            const model = this.#frame.resourceTreeModel().target().model(SDK.NetworkManager.NetworkManager);
            const info = model && await model.getSecurityIsolationStatus(this.#frame.id);
            if (info) {
                return LitHtml.html `
          ${this.#maybeRenderCrossOriginStatus(info.coep, i18n.i18n.lockedString('Cross-Origin Embedder Policy (COEP)'), "None" /* Protocol.Network.CrossOriginEmbedderPolicyValue.None */)}
          ${this.#maybeRenderCrossOriginStatus(info.coop, i18n.i18n.lockedString('Cross-Origin Opener Policy (COOP)'), "UnsafeNone" /* Protocol.Network.CrossOriginOpenerPolicyValue.UnsafeNone */)}
          ${this.#renderCSPSection(info.csp)}
        `;
            }
        }
        return LitHtml.nothing;
    }
    #maybeRenderCrossOriginStatus(info, policyName, noneValue) {
        if (!info) {
            return LitHtml.nothing;
        }
        const isEnabled = info.value !== noneValue;
        const isReportOnly = (!isEnabled && info.reportOnlyValue !== noneValue);
        const endpoint = isEnabled ? info.reportingEndpoint : info.reportOnlyReportingEndpoint;
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${policyName}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        ${isEnabled ? info.value : info.reportOnlyValue}
        ${isReportOnly ? LitHtml.html `<span class="inline-comment">report-only</span>` : LitHtml.nothing}
        ${endpoint ? LitHtml.html `<span class="inline-name">${i18nString(UIStrings.reportingTo)}</span>${endpoint}` :
            LitHtml.nothing}
      </${ReportView.ReportView.ReportValue.litTagName}>
    `;
    }
    #renderEffectiveDirectives(directives) {
        const parsedDirectives = new CspEvaluator.CspParser.CspParser(directives).csp.directives;
        const result = [];
        for (const directive in parsedDirectives) {
            result.push(LitHtml.html `<div><span class="bold">${directive}</span>${': ' + parsedDirectives[directive]?.join(', ')}</div>`);
        }
        return result;
    }
    #renderSingleCSP(cspInfo) {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${cspInfo.isEnforced ? i18n.i18n.lockedString('Content-Security-Policy') :
            LitHtml.html `${i18n.i18n.lockedString('Content-Security-Policy-Report-Only')}<x-link
            class="link"
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only"
          ><${IconButton.Icon.Icon.litTagName} .data=${{
                iconName: 'help',
                color: 'var(--icon-link)',
                width: '16px',
                height: '16px',
            }}>
            </${IconButton.Icon.Icon.litTagName}></x-link>`}
      </${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <${IconButton.Icon.Icon.litTagName} class="inline-icon" .data=${{
            iconName: 'code',
            color: 'var(--icon-default)',
            width: '18px',
            height: '18px',
        }}>
        </${IconButton.Icon.Icon.litTagName}>
        ${cspInfo.source === "HTTP" /* Protocol.Network.ContentSecurityPolicySource.HTTP */ ? i18n.i18n.lockedString('HTTP header') : i18n.i18n.lockedString('Meta tag')}
        ${this.#renderEffectiveDirectives(cspInfo.effectiveDirectives)}
      </${ReportView.ReportView.ReportValue.litTagName}>
    `;
        // clang-format on
    }
    #renderCSPSection(cspInfos) {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>
        ${i18nString(UIStrings.contentSecurityPolicy)}
      </${ReportView.ReportView.ReportSectionHeader.litTagName}>
      ${(cspInfos && cspInfos.length) ? cspInfos.map(cspInfo => this.#renderSingleCSP(cspInfo)) : LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18n.i18n.lockedString('Content-Security-Policy')}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          ${i18nString(UIStrings.none)}
        </${ReportView.ReportView.ReportValue.litTagName}>
      `}
    `;
        // clang-format on
    }
    #renderApiAvailabilitySection() {
        if (!this.#frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.apiAvailability)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <div class="span-cols">
        ${i18nString(UIStrings.availabilityOfCertainApisDepends)}
        <x-link href="https://web.dev/why-coop-coep/" class="link">${i18nString(UIStrings.learnMore)}</x-link>
      </div>
      ${this.#renderSharedArrayBufferAvailability()}
      ${this.#renderMeasureMemoryAvailability()}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    #renderSharedArrayBufferAvailability() {
        if (this.#frame) {
            const features = this.#frame.getGatedAPIFeatures();
            if (features) {
                const sabAvailable = features.includes("SharedArrayBuffers" /* Protocol.Page.GatedAPIFeatures.SharedArrayBuffers */);
                const sabTransferAvailable = sabAvailable && features.includes("SharedArrayBuffersTransferAllowed" /* Protocol.Page.GatedAPIFeatures.SharedArrayBuffersTransferAllowed */);
                const availabilityText = sabTransferAvailable ?
                    i18nString(UIStrings.availableTransferable) :
                    (sabAvailable ? i18nString(UIStrings.availableNotTransferable) : i18nString(UIStrings.unavailable));
                const tooltipText = sabTransferAvailable ?
                    i18nString(UIStrings.sharedarraybufferConstructorIs) :
                    (sabAvailable ? i18nString(UIStrings.sharedarraybufferConstructorIsAvailable) : '');
                function renderHint(frame) {
                    switch (frame.getCrossOriginIsolatedContextType()) {
                        case "Isolated" /* Protocol.Page.CrossOriginIsolatedContextType.Isolated */:
                            return LitHtml.nothing;
                        case "NotIsolated" /* Protocol.Page.CrossOriginIsolatedContextType.NotIsolated */:
                            if (sabAvailable) {
                                return LitHtml.html `<span class="inline-comment">${i18nString(UIStrings.willRequireCrossoriginIsolated)}</span>`;
                            }
                            return LitHtml.html `<span class="inline-comment">${i18nString(UIStrings.requiresCrossoriginIsolated)}</span>`;
                        case "NotIsolatedFeatureDisabled" /* Protocol.Page.CrossOriginIsolatedContextType.NotIsolatedFeatureDisabled */:
                            if (!sabTransferAvailable) {
                                return LitHtml.html `<span class="inline-comment">${i18nString(UIStrings
                                    .transferRequiresCrossoriginIsolatedPermission)} <code>cross-origin-isolated</code></span>`;
                            }
                            break;
                    }
                    return LitHtml.nothing;
                }
                // SharedArrayBuffer is an API name, so we don't translate it.
                return LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>SharedArrayBuffers</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} title=${tooltipText}>
            ${availabilityText}\xA0${renderHint(this.#frame)}
          </${ReportView.ReportView.ReportValue.litTagName}>
        `;
            }
        }
        return LitHtml.nothing;
    }
    #renderMeasureMemoryAvailability() {
        if (this.#frame) {
            const measureMemoryAvailable = this.#frame.isCrossOriginIsolated();
            const availabilityText = measureMemoryAvailable ? i18nString(UIStrings.available) : i18nString(UIStrings.unavailable);
            const tooltipText = measureMemoryAvailable ? i18nString(UIStrings.thePerformanceAPI) :
                i18nString(UIStrings.thePerformancemeasureuseragentspecificmemory);
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.measureMemory)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <span title=${tooltipText}>${availabilityText}</span>\xA0<x-link class="link" href="https://web.dev/monitor-total-page-memory-usage/">${i18nString(UIStrings.learnMore)}</x-link>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
        }
        return LitHtml.nothing;
    }
    #renderAdditionalInfoSection() {
        if (!this.#frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}
        title=${i18nString(UIStrings.thisAdditionalDebugging)}
      >${i18nString(UIStrings.additionalInformation)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.frameId)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <div class="text-ellipsis" title=${this.#frame.id}>${this.#frame.id}</div>
      </${ReportView.ReportView.ReportValue.litTagName}>
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-resources-frame-details-view', FrameDetailsReportView);
//# sourceMappingURL=FrameDetailsView.js.map