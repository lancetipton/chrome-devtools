export declare class UserMetrics {
    #private;
    constructor();
    breakpointWithConditionAdded(breakpointWithConditionAdded: BreakpointWithConditionAdded): void;
    breakpointEditDialogRevealedFrom(breakpointEditDialogRevealedFrom: BreakpointEditDialogRevealedFrom): void;
    panelShown(panelName: string, isLaunching?: boolean): void;
    /**
     * Fired when a panel is closed (regardless if it exists in the main panel or the drawer)
     */
    panelClosed(panelName: string): void;
    elementsSidebarTabShown(sidebarPaneName: string): void;
    sourcesSidebarTabShown(sidebarPaneName: string): void;
    settingsPanelShown(settingsViewId: string): void;
    sourcesPanelFileDebugged(mediaType?: string): void;
    sourcesPanelFileOpened(mediaType?: string): void;
    networkPanelResponsePreviewOpened(mediaType: string): void;
    actionTaken(action: Action): void;
    panelLoaded(panelName: string, histogramName: string): void;
    setLaunchPanel(panelName: string | null): void;
    performanceTraceLoad(measure: PerformanceMeasure): void;
    keybindSetSettingChanged(keybindSet: string): void;
    keyboardShortcutFired(actionId: string): void;
    issuesPanelOpenedFrom(issueOpener: IssueOpener): void;
    issuesPanelIssueExpanded(issueExpandedCategory: string | undefined): void;
    issuesPanelResourceOpened(issueCategory: string, type: string): void;
    issueCreated(code: string): void;
    experimentEnabledAtLaunch(experimentId: string): void;
    experimentDisabledAtLaunch(experimentId: string): void;
    experimentChanged(experimentId: string, isEnabled: boolean): void;
    developerResourceLoaded(developerResourceLoaded: DeveloperResourceLoaded): void;
    developerResourceScheme(developerResourceScheme: DeveloperResourceScheme): void;
    inlineScriptParsed(inlineScriptType: VMInlineScriptType): void;
    vmInlineScriptContentShown(inlineScriptType: VMInlineScriptType): void;
    linearMemoryInspectorRevealedFrom(linearMemoryInspectorRevealedFrom: LinearMemoryInspectorRevealedFrom): void;
    linearMemoryInspectorTarget(linearMemoryInspectorTarget: LinearMemoryInspectorTarget): void;
    language(language: Intl.UnicodeBCP47LocaleIdentifier): void;
    syncSetting(devtoolsSyncSettingEnabled: boolean): void;
    recordingAssertion(value: RecordingAssertion): void;
    recordingToggled(value: RecordingToggled): void;
    recordingReplayFinished(value: RecordingReplayFinished): void;
    recordingReplaySpeed(value: RecordingReplaySpeed): void;
    recordingReplayStarted(value: RecordingReplayStarted): void;
    recordingEdited(value: RecordingEdited): void;
    recordingExported(value: RecordingExported): void;
    recordingCodeToggled(value: RecordingCodeToggled): void;
    recordingCopiedToClipboard(value: RecordingCopiedToClipboard): void;
    styleTextCopied(value: StyleTextCopied): void;
    manifestSectionSelected(sectionTitle: string): void;
    cssHintShown(type: CSSHintType): void;
    lighthouseModeRun(type: LighthouseModeRun): void;
    lighthouseCategoryUsed(type: LighthouseCategoryUsed): void;
    colorConvertedFrom(type: ColorConvertedFrom): void;
    colorPickerOpenedFrom(type: ColorPickerOpenedFrom): void;
    cssPropertyDocumentation(type: CSSPropertyDocumentation): void;
    swatchActivated(swatch: SwatchType): void;
    badgeActivated(badge: BadgeType): void;
    breakpointsRestoredFromStorage(count: number): void;
    animationPlaybackRateChanged(playbackRate: AnimationsPlaybackRate): void;
    animationPointDragged(dragType: AnimationPointDragType): void;
    workspacesPopulated(wallClockTimeInMilliseconds: number): void;
    visualLoggingProcessingDone(timeInMilliseconds: number): void;
    legacyResourceTypeFilterNumberOfSelectedChanged(itemCount: number): void;
    legacyResourceTypeFilterItemSelected(resourceTypeName: string): void;
    resourceTypeFilterNumberOfSelectedChanged(itemCount: number): void;
    resourceTypeFilterItemSelected(resourceTypeName: string): void;
    networkPanelMoreFiltersNumberOfSelectedChanged(itemCount: number): void;
    networkPanelMoreFiltersItemSelected(filterName: string): void;
}
/**
 * The numeric enum values are not necessarily continuous! It is possible that
 * values have been removed, which results in gaps in the sequence of values.
 * When adding a new value:
 * 1. Add an entry to the bottom of the enum before 'MaxValue'.
 * 2. Set the value of the new entry to the current value of 'MaxValue'.
 * 2. Increment the value of 'MaxValue' by 1.
 * When removing a value which is no longer needed:
 * 1. Delete the line with the unneeded value
 * 2. Do not update any 'MaxValue' or any other value.
 */
export declare enum Action {
    WindowDocked = 1,
    WindowUndocked = 2,
    ScriptsBreakpointSet = 3,
    TimelineStarted = 4,
    ProfilesCPUProfileTaken = 5,
    ProfilesHeapProfileTaken = 6,
    ConsoleEvaluated = 8,
    FileSavedInWorkspace = 9,
    DeviceModeEnabled = 10,
    AnimationsPlaybackRateChanged = 11,
    RevisionApplied = 12,
    FileSystemDirectoryContentReceived = 13,
    StyleRuleEdited = 14,
    CommandEvaluatedInConsolePanel = 15,
    DOMPropertiesExpanded = 16,
    ResizedViewInResponsiveMode = 17,
    TimelinePageReloadStarted = 18,
    ConnectToNodeJSFromFrontend = 19,
    ConnectToNodeJSDirectly = 20,
    CpuThrottlingEnabled = 21,
    CpuProfileNodeFocused = 22,
    CpuProfileNodeExcluded = 23,
    SelectFileFromFilePicker = 24,
    SelectCommandFromCommandMenu = 25,
    ChangeInspectedNodeInElementsPanel = 26,
    StyleRuleCopied = 27,
    CoverageStarted = 28,
    LighthouseStarted = 29,
    LighthouseFinished = 30,
    ShowedThirdPartyBadges = 31,
    LighthouseViewTrace = 32,
    FilmStripStartedRecording = 33,
    CoverageReportFiltered = 34,
    CoverageStartedPerBlock = 35,
    'SettingsOpenedFromGear-deprecated' = 36,
    'SettingsOpenedFromMenu-deprecated' = 37,
    'SettingsOpenedFromCommandMenu-deprecated' = 38,
    TabMovedToDrawer = 39,
    TabMovedToMainPanel = 40,
    CaptureCssOverviewClicked = 41,
    VirtualAuthenticatorEnvironmentEnabled = 42,
    SourceOrderViewActivated = 43,
    UserShortcutAdded = 44,
    ShortcutRemoved = 45,
    ShortcutModified = 46,
    CustomPropertyLinkClicked = 47,
    CustomPropertyEdited = 48,
    ServiceWorkerNetworkRequestClicked = 49,
    ServiceWorkerNetworkRequestClosedQuickly = 50,
    NetworkPanelServiceWorkerRespondWith = 51,
    NetworkPanelCopyValue = 52,
    ConsoleSidebarOpened = 53,
    PerfPanelTraceImported = 54,
    PerfPanelTraceExported = 55,
    StackFrameRestarted = 56,
    CaptureTestProtocolClicked = 57,
    BreakpointRemovedFromRemoveButton = 58,
    BreakpointGroupExpandedStateChanged = 59,
    HeaderOverrideFileCreated = 60,
    HeaderOverrideEnableEditingClicked = 61,
    HeaderOverrideHeaderAdded = 62,
    HeaderOverrideHeaderEdited = 63,
    HeaderOverrideHeaderRemoved = 64,
    HeaderOverrideHeadersFileEdited = 65,
    PersistenceNetworkOverridesEnabled = 66,
    PersistenceNetworkOverridesDisabled = 67,
    BreakpointRemovedFromContextMenu = 68,
    BreakpointsInFileRemovedFromRemoveButton = 69,
    BreakpointsInFileRemovedFromContextMenu = 70,
    BreakpointsInFileCheckboxToggled = 71,
    BreakpointsInFileEnabledDisabledFromContextMenu = 72,
    BreakpointConditionEditedFromSidebar = 73,
    WorkspaceTabAddFolder = 74,
    WorkspaceTabRemoveFolder = 75,
    OverrideTabAddFolder = 76,
    OverrideTabRemoveFolder = 77,
    WorkspaceSourceSelected = 78,
    OverridesSourceSelected = 79,
    StyleSheetInitiatorLinkClicked = 80,
    BreakpointRemovedFromGutterContextMenu = 81,
    BreakpointRemovedFromGutterToggle = 82,
    StylePropertyInsideKeyframeEdited = 83,
    OverrideContentFromSourcesContextMenu = 84,
    OverrideContentFromNetworkContextMenu = 85,
    OverrideScript = 86,
    OverrideStyleSheet = 87,
    OverrideDocument = 88,
    OverrideFetchXHR = 89,
    OverrideImage = 90,
    OverrideFont = 91,
    OverrideContentContextMenuSetup = 92,
    OverrideContentContextMenuAbandonSetup = 93,
    OverrideContentContextMenuActivateDisabled = 94,
    OverrideContentContextMenuOpenExistingFile = 95,
    OverrideContentContextMenuSaveNewFile = 96,
    ShowAllOverridesFromSourcesContextMenu = 97,
    ShowAllOverridesFromNetworkContextMenu = 98,
    AnimationGroupsCleared = 99,
    AnimationsPaused = 100,
    AnimationsResumed = 101,
    AnimatedNodeDescriptionClicked = 102,
    AnimationGroupScrubbed = 103,
    AnimationGroupReplayed = 104,
    OverrideTabDeleteFolderContextMenu = 105,
    WorkspaceDropFolder = 107,
    WorkspaceSelectFolder = 108,
    OverrideContentContextMenuSourceMappedWarning = 109,
    OverrideContentContextMenuRedirectToDeployed = 110,
    NewStyleRuleAdded = 111,
    TraceExpanded = 112,
    InsightConsoleMessageShown = 113,
    InsightRequestedViaContextMenu = 114,
    InsightRequestedViaHoverButton = 115,
    InsightRefined = 116,
    InsightRatedPositive = 117,
    InsightRatedNegative = 118,
    InsightClosed = 119,
    InsightErrored = 120,
    InsightHoverButtonShown = 121,
    MaxValue = 122
}
export declare enum PanelCodes {
    elements = 1,
    resources = 2,
    network = 3,
    sources = 4,
    timeline = 5,
    heap_profiler = 6,
    console = 8,
    layers = 9,
    'console-view' = 10,
    'animations' = 11,
    'network.config' = 12,
    'rendering' = 13,
    'sensors' = 14,
    'sources.search' = 15,
    security = 16,
    js_profiler = 17,
    lighthouse = 18,
    'coverage' = 19,
    'protocol-monitor' = 20,
    'remote-devices' = 21,
    'web-audio' = 22,
    'changes.changes' = 23,
    'performance.monitor' = 24,
    'release-note' = 25,
    'live_heap_profile' = 26,
    'sources.quick' = 27,
    'network.blocked-urls' = 28,
    'settings-preferences' = 29,
    'settings-workspace' = 30,
    'settings-experiments' = 31,
    'settings-blackbox' = 32,
    'settings-devices' = 33,
    'settings-throttling-conditions' = 34,
    'settings-emulation-locations' = 35,
    'settings-shortcuts' = 36,
    'issues-pane' = 37,
    'settings-keybinds' = 38,
    'cssoverview' = 39,
    'chrome_recorder' = 40,
    'trust_tokens' = 41,
    'reporting_api' = 42,
    'interest_groups' = 43,
    'back_forward_cache' = 44,
    'service_worker_cache' = 45,
    'background_service_backgroundFetch' = 46,
    'background_service_backgroundSync' = 47,
    'background_service_pushMessaging' = 48,
    'background_service_notifications' = 49,
    'background_service_paymentHandler' = 50,
    'background_service_periodicBackgroundSync' = 51,
    'service_workers' = 52,
    'app_manifest' = 53,
    'storage' = 54,
    'cookies' = 55,
    'frame_details' = 56,
    'frame_resource' = 57,
    'frame_window' = 58,
    'frame_worker' = 59,
    'dom_storage' = 60,
    'indexed_db' = 61,
    'web_sql' = 62,
    'performance_insights' = 63,
    'preloading' = 64,
    'bounce_tracking_mitigations' = 65,
    'developer-resources' = 66,
    'autofill-view' = 67,
    MaxValue = 68
}
export declare enum ElementsSidebarTabCodes {
    'OtherSidebarPane' = 0,
    'Styles' = 1,
    'Computed' = 2,
    'elements.layout' = 3,
    'elements.eventListeners' = 4,
    'elements.domBreakpoints' = 5,
    'elements.domProperties' = 6,
    'accessibility.view' = 7,
    MaxValue = 8
}
export declare enum SourcesSidebarTabCodes {
    'OtherSidebarPane' = 0,
    'navigator-network' = 1,
    'navigator-files' = 2,
    'navigator-overrides' = 3,
    'navigator-contentScripts' = 4,
    'navigator-snippets' = 5,
    MaxValue = 6
}
export declare enum MediaTypes {
    Unknown = 0,
    'text/css' = 2,
    'text/html' = 3,
    'application/xml' = 4,
    'application/wasm' = 5,
    'application/manifest+json' = 6,
    'application/x-aspx' = 7,
    'application/jsp' = 8,
    'text/x-c++src' = 9,
    'text/x-coffeescript' = 10,
    'application/vnd.dart' = 11,
    'text/typescript' = 12,
    'text/typescript-jsx' = 13,
    'application/json' = 14,
    'text/x-csharp' = 15,
    'text/x-java' = 16,
    'text/x-less' = 17,
    'application/x-httpd-php' = 18,
    'text/x-python' = 19,
    'text/x-sh' = 20,
    'text/x-gss' = 21,
    'text/x-sass' = 22,
    'text/x-scss' = 23,
    'text/markdown' = 24,
    'text/x-clojure' = 25,
    'text/jsx' = 26,
    'text/x-go' = 27,
    'text/x-kotlin' = 28,
    'text/x-scala' = 29,
    'text/x.svelte' = 30,
    'text/javascript+plain' = 31,
    'text/javascript+minified' = 32,
    'text/javascript+sourcemapped' = 33,
    'text/x.angular' = 34,
    'text/x.vue' = 35,
    MaxValue = 36
}
export declare enum KeybindSetSettings {
    'devToolsDefault' = 0,
    'vsCode' = 1,
    MaxValue = 2
}
export declare enum KeyboardShortcutAction {
    OtherShortcut = 0,
    'commandMenu.show' = 1,
    'console.clear' = 2,
    'console.toggle' = 3,
    'debugger.step' = 4,
    'debugger.step-into' = 5,
    'debugger.step-out' = 6,
    'debugger.step-over' = 7,
    'debugger.toggle-breakpoint' = 8,
    'debugger.toggle-breakpoint-enabled' = 9,
    'debugger.toggle-pause' = 10,
    'elements.edit-as-html' = 11,
    'elements.hide-element' = 12,
    'elements.redo' = 13,
    'elements.toggle-element-search' = 14,
    'elements.undo' = 15,
    'main.search-in-panel.find' = 16,
    'main.toggle-drawer' = 17,
    'network.hide-request-details' = 18,
    'network.search' = 19,
    'network.toggle-recording' = 20,
    'quickOpen.show' = 21,
    'settings.show' = 22,
    'sources.search' = 23,
    'background-service.toggle-recording' = 24,
    'components.collect-garbage' = 25,
    'console.clear.history' = 26,
    'console.create-pin' = 27,
    'coverage.start-with-reload' = 28,
    'coverage.toggle-recording' = 29,
    'debugger.breakpoint-input-window' = 30,
    'debugger.evaluate-selection' = 31,
    'debugger.next-call-frame' = 32,
    'debugger.previous-call-frame' = 33,
    'debugger.run-snippet' = 34,
    'debugger.toggle-breakpoints-active' = 35,
    'elements.capture-area-screenshot' = 36,
    'emulation.capture-full-height-screenshot' = 37,
    'emulation.capture-node-screenshot' = 38,
    'emulation.capture-screenshot' = 39,
    'emulation.show-sensors' = 40,
    'emulation.toggle-device-mode' = 41,
    'help.release-notes' = 42,
    'help.report-issue' = 43,
    'input.start-replaying' = 44,
    'input.toggle-pause' = 45,
    'input.toggle-recording' = 46,
    'inspector_main.focus-debuggee' = 47,
    'inspector_main.hard-reload' = 48,
    'inspector_main.reload' = 49,
    'live-heap-profile.start-with-reload' = 50,
    'live-heap-profile.toggle-recording' = 51,
    'main.debug-reload' = 52,
    'main.next-tab' = 53,
    'main.previous-tab' = 54,
    'main.search-in-panel.cancel' = 55,
    'main.search-in-panel.find-next' = 56,
    'main.search-in-panel.find-previous' = 57,
    'main.toggle-dock' = 58,
    'main.zoom-in' = 59,
    'main.zoom-out' = 60,
    'main.zoom-reset' = 61,
    'network-conditions.network-low-end-mobile' = 62,
    'network-conditions.network-mid-tier-mobile' = 63,
    'network-conditions.network-offline' = 64,
    'network-conditions.network-online' = 65,
    'profiler.heap-toggle-recording' = 66,
    'profiler.js-toggle-recording' = 67,
    'resources.clear' = 68,
    'settings.documentation' = 69,
    'settings.shortcuts' = 70,
    'sources.add-folder-to-workspace' = 71,
    'sources.add-to-watch' = 72,
    'sources.close-all' = 73,
    'sources.close-editor-tab' = 74,
    'sources.create-snippet' = 75,
    'sources.go-to-line' = 76,
    'sources.go-to-member' = 77,
    'sources.jump-to-next-location' = 78,
    'sources.jump-to-previous-location' = 79,
    'sources.rename' = 80,
    'sources.save' = 81,
    'sources.save-all' = 82,
    'sources.switch-file' = 83,
    'timeline.jump-to-next-frame' = 84,
    'timeline.jump-to-previous-frame' = 85,
    'timeline.load-from-file' = 86,
    'timeline.next-recording' = 87,
    'timeline.previous-recording' = 88,
    'timeline.record-reload' = 89,
    'timeline.save-to-file' = 90,
    'timeline.show-history' = 91,
    'timeline.toggle-recording' = 92,
    'sources.increment-css' = 93,
    'sources.increment-css-by-ten' = 94,
    'sources.decrement-css' = 95,
    'sources.decrement-css-by-ten' = 96,
    'layers.reset-view' = 97,
    'layers.pan-mode' = 98,
    'layers.rotate-mode' = 99,
    'layers.zoom-in' = 100,
    'layers.zoom-out' = 101,
    'layers.up' = 102,
    'layers.down' = 103,
    'layers.left' = 104,
    'layers.right' = 105,
    'help.report-translation-issue' = 106,
    'rendering.toggle-prefers-color-scheme' = 107,
    'chrome_recorder.start-recording' = 108,
    'chrome_recorder.replay-recording' = 109,
    'chrome_recorder.toggle-code-view' = 110,
    'chrome_recorder.copy-recording-or-step' = 111,
    'changes.revert' = 112,
    'changes.copy' = 113,
    'elements.new-style-rule' = 114,
    'elements.refresh-event-listeners' = 115,
    'coverage.clear' = 116,
    'coverage.export' = 117,
    MaxValue = 118
}
export declare enum IssueOpener {
    ConsoleInfoBar = 0,
    LearnMoreLinkCOEP = 1,
    StatusBarIssuesCounter = 2,
    HamburgerMenu = 3,
    Adorner = 4,
    CommandMenu = 5,
    MaxValue = 6
}
/**
 * This list should contain the currently active Devtools Experiments,
 * gaps are expected.
 */
export declare enum DevtoolsExperiments {
    'applyCustomStylesheet' = 0,
    'captureNodeCreationStacks' = 1,
    'liveHeapProfile' = 11,
    'protocolMonitor' = 13,
    'samplingHeapProfilerTimeline' = 17,
    'showOptionToExposeInternalsInHeapSnapshot' = 18,
    'timelineEventInitiators' = 24,
    'timelineInvalidationTracking' = 26,
    'timelineShowAllEvents' = 27,
    'timelineV8RuntimeCallStats' = 28,
    'APCA' = 39,
    'fontEditor' = 41,
    'fullAccessibilityTree' = 42,
    'ignoreListJSFramesOnTimeline' = 43,
    'contrastIssues' = 44,
    'experimentalCookieFeatures' = 45,
    'stylesPaneCSSChanges' = 55,
    'evaluateExpressionsWithSourceMaps' = 58,
    'instrumentationBreakpoints' = 61,
    'authoredDeployedGrouping' = 63,
    'importantDOMProperties' = 64,
    'justMyCode' = 65,
    'timelineAsConsoleProfileResultPanel' = 67,
    'preloadingStatusPanel' = 68,
    'outermostTargetSelector' = 71,
    'jsProfilerTemporarilyEnable' = 72,
    'highlightErrorsElementsPanel' = 73,
    'setAllBreakpointsEagerly' = 74,
    'selfXssWarning' = 75,
    'useSourceMapScopes' = 76,
    'storageBucketsTree' = 77,
    'networkPanelFilterBarRedesign' = 79,
    'breadcrumbsPerformancePanel' = 80,
    'trackContextMenu' = 81,
    'autofillView' = 82,
    'sourcesFrameIndentationMarkersTemporarilyDisable' = 83,
    'MaxValue' = 84
}
export declare const enum BreakpointWithConditionAdded {
    Logpoint = 0,
    ConditionalBreakpoint = 1,
    MaxValue = 2
}
export declare const enum BreakpointEditDialogRevealedFrom {
    BreakpointSidebarContextMenu = 0,
    BreakpointSidebarEditButton = 1,
    BreakpointMarkerContextMenu = 2,
    LineGutterContextMenu = 3,
    KeyboardShortcut = 4,
    Linkifier = 5,
    MouseClick = 6,
    MaxValue = 7
}
export declare const enum ColorConvertedFrom {
    ColorSwatch = 0,
    ColorPicker = 1,
    MaxValue = 2
}
export declare const enum ColorPickerOpenedFrom {
    SourcesPanel = 0,
    StylesPane = 1,
    MaxValue = 2
}
export declare const enum CSSPropertyDocumentation {
    Shown = 0,
    ToggledOn = 1,
    ToggledOff = 2,
    MaxValue = 3
}
export declare const enum BreakpointsRestoredFromStorageCount {
    LessThan100 = 0,
    LessThan300 = 1,
    LessThan1000 = 2,
    LessThan3000 = 3,
    LessThan10000 = 4,
    LessThan30000 = 5,
    LessThan100000 = 6,
    LessThan300000 = 7,
    LessThan1000000 = 8,
    Above1000000 = 9,
    MaxValue = 10
}
export declare enum IssueExpanded {
    CrossOriginEmbedderPolicy = 0,
    MixedContent = 1,
    SameSiteCookie = 2,
    HeavyAd = 3,
    ContentSecurityPolicy = 4,
    Other = 5,
    Generic = 6,
    ThirdPartyPhaseoutCookie = 7,
    GenericCookie = 8,
    MaxValue = 9
}
export declare enum IssueResourceOpened {
    CrossOriginEmbedderPolicyRequest = 0,
    CrossOriginEmbedderPolicyElement = 1,
    MixedContentRequest = 2,
    SameSiteCookieCookie = 3,
    SameSiteCookieRequest = 4,
    HeavyAdElement = 5,
    ContentSecurityPolicyDirective = 6,
    ContentSecurityPolicyElement = 7,
    CrossOriginEmbedderPolicyLearnMore = 8,
    MixedContentLearnMore = 9,
    SameSiteCookieLearnMore = 10,
    HeavyAdLearnMore = 11,
    ContentSecurityPolicyLearnMore = 12,
    MaxValue = 13
}
/**
 * This list should contain the currently active issue types,
 * gaps are expected.
 */
export declare enum IssueCreated {
    MixedContentIssue = 0,
    'ContentSecurityPolicyIssue::kInlineViolation' = 1,
    'ContentSecurityPolicyIssue::kEvalViolation' = 2,
    'ContentSecurityPolicyIssue::kURLViolation' = 3,
    'ContentSecurityPolicyIssue::kTrustedTypesSinkViolation' = 4,
    'ContentSecurityPolicyIssue::kTrustedTypesPolicyViolation' = 5,
    'HeavyAdIssue::NetworkTotalLimit' = 6,
    'HeavyAdIssue::CpuTotalLimit' = 7,
    'HeavyAdIssue::CpuPeakLimit' = 8,
    'CrossOriginEmbedderPolicyIssue::CoepFrameResourceNeedsCoepHeader' = 9,
    'CrossOriginEmbedderPolicyIssue::CoopSandboxedIFrameCannotNavigateToCoopPage' = 10,
    'CrossOriginEmbedderPolicyIssue::CorpNotSameOrigin' = 11,
    'CrossOriginEmbedderPolicyIssue::CorpNotSameOriginAfterDefaultedToSameOriginByCoep' = 12,
    'CrossOriginEmbedderPolicyIssue::CorpNotSameSite' = 13,
    'CookieIssue::ExcludeSameSiteNoneInsecure::ReadCookie' = 14,
    'CookieIssue::ExcludeSameSiteNoneInsecure::SetCookie' = 15,
    'CookieIssue::WarnSameSiteNoneInsecure::ReadCookie' = 16,
    'CookieIssue::WarnSameSiteNoneInsecure::SetCookie' = 17,
    'CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Secure' = 18,
    'CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Insecure' = 19,
    'CookieIssue::WarnCrossDowngrade::ReadCookie::Secure' = 20,
    'CookieIssue::WarnCrossDowngrade::ReadCookie::Insecure' = 21,
    'CookieIssue::WarnCrossDowngrade::SetCookie::Secure' = 22,
    'CookieIssue::WarnCrossDowngrade::SetCookie::Insecure' = 23,
    'CookieIssue::ExcludeNavigationContextDowngrade::Secure' = 24,
    'CookieIssue::ExcludeNavigationContextDowngrade::Insecure' = 25,
    'CookieIssue::ExcludeContextDowngrade::ReadCookie::Secure' = 26,
    'CookieIssue::ExcludeContextDowngrade::ReadCookie::Insecure' = 27,
    'CookieIssue::ExcludeContextDowngrade::SetCookie::Secure' = 28,
    'CookieIssue::ExcludeContextDowngrade::SetCookie::Insecure' = 29,
    'CookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::ReadCookie' = 30,
    'CookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::SetCookie' = 31,
    'CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::ReadCookie' = 32,
    'CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::SetCookie' = 33,
    'CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::ReadCookie' = 34,
    'CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::SetCookie' = 35,
    'SharedArrayBufferIssue::TransferIssue' = 36,
    'SharedArrayBufferIssue::CreationIssue' = 37,
    LowTextContrastIssue = 41,
    'CorsIssue::InsecurePrivateNetwork' = 42,
    'CorsIssue::InvalidHeaders' = 44,
    'CorsIssue::WildcardOriginWithCredentials' = 45,
    'CorsIssue::PreflightResponseInvalid' = 46,
    'CorsIssue::OriginMismatch' = 47,
    'CorsIssue::AllowCredentialsRequired' = 48,
    'CorsIssue::MethodDisallowedByPreflightResponse' = 49,
    'CorsIssue::HeaderDisallowedByPreflightResponse' = 50,
    'CorsIssue::RedirectContainsCredentials' = 51,
    'CorsIssue::DisallowedByMode' = 52,
    'CorsIssue::CorsDisabledScheme' = 53,
    'CorsIssue::PreflightMissingAllowExternal' = 54,
    'CorsIssue::PreflightInvalidAllowExternal' = 55,
    'CorsIssue::NoCorsRedirectModeNotFollow' = 57,
    'QuirksModeIssue::QuirksMode' = 58,
    'QuirksModeIssue::LimitedQuirksMode' = 59,
    DeprecationIssue = 60,
    'ClientHintIssue::MetaTagAllowListInvalidOrigin' = 61,
    'ClientHintIssue::MetaTagModifiedHTML' = 62,
    'CorsIssue::PreflightAllowPrivateNetworkError' = 63,
    'GenericIssue::CrossOriginPortalPostMessageError' = 64,
    'GenericIssue::FormLabelForNameError' = 65,
    'GenericIssue::FormDuplicateIdForInputError' = 66,
    'GenericIssue::FormInputWithNoLabelError' = 67,
    'GenericIssue::FormAutocompleteAttributeEmptyError' = 68,
    'GenericIssue::FormEmptyIdAndNameAttributesForInputError' = 69,
    'GenericIssue::FormAriaLabelledByToNonExistingId' = 70,
    'GenericIssue::FormInputAssignedAutocompleteValueToIdOrNameAttributeError' = 71,
    'GenericIssue::FormLabelHasNeitherForNorNestedInput' = 72,
    'GenericIssue::FormLabelForMatchesNonExistingIdError' = 73,
    'GenericIssue::FormHasPasswordFieldWithoutUsernameFieldError' = 74,
    'GenericIssue::FormInputHasWrongButWellIntendedAutocompleteValueError' = 75,
    'StylesheetLoadingIssue::LateImportRule' = 76,
    'StylesheetLoadingIssue::RequestFailed' = 77,
    'CorsIssue::PreflightMissingPrivateNetworkAccessId' = 78,
    'CorsIssue::PreflightMissingPrivateNetworkAccessName' = 79,
    'CorsIssue::PrivateNetworkAccessPermissionUnavailable' = 80,
    'CorsIssue::PrivateNetworkAccessPermissionDenied' = 81,
    'CookieIssue::WarnThirdPartyPhaseout::ReadCookie' = 82,
    'CookieIssue::WarnThirdPartyPhaseout::SetCookie' = 83,
    'CookieIssue::ExcludeThirdPartyPhaseout::ReadCookie' = 84,
    'CookieIssue::ExcludeThirdPartyPhaseout::SetCookie' = 85,
    MaxValue = 86
}
export declare enum DeveloperResourceLoaded {
    LoadThroughPageViaTarget = 0,
    LoadThroughPageViaFrame = 1,
    LoadThroughPageFailure = 2,
    LoadThroughPageFallback = 3,
    FallbackAfterFailure = 4,
    FallbackPerOverride = 5,
    FallbackPerProtocol = 6,
    FallbackFailure = 7,
    MaxValue = 8
}
export declare enum DeveloperResourceScheme {
    SchemeOther = 0,
    SchemeUnknown = 1,
    SchemeHttp = 2,
    SchemeHttps = 3,
    SchemeHttpLocalhost = 4,
    SchemeHttpsLocalhost = 5,
    SchemeData = 6,
    SchemeFile = 7,
    SchemeBlob = 8,
    MaxValue = 9
}
export declare enum ResourceType {
    all = 0,
    Documents = 1,
    Scripts = 2,
    'XHR and Fetch' = 3,
    Stylesheets = 4,
    Fonts = 5,
    Images = 6,
    Media = 7,
    Manifest = 8,
    WebSockets = 9,
    WebAssembly = 10,
    Other = 11,
    MaxValue = 12
}
export declare enum NetworkPanelMoreFilters {
    'Hide data URLs' = 0,
    'Hide extension URLs' = 1,
    'Blocked response cookies' = 2,
    'Blocked requests' = 3,
    '3rd-party requests' = 4,
    MaxValue = 5
}
export declare enum LinearMemoryInspectorRevealedFrom {
    ContextMenu = 0,
    MemoryIcon = 1,
    MaxValue = 2
}
export declare enum LinearMemoryInspectorTarget {
    DWARFInspectableAddress = 0,
    ArrayBuffer = 1,
    DataView = 2,
    TypedArray = 3,
    WebAssemblyMemory = 4,
    MaxValue = 5
}
export declare const enum VMInlineScriptType {
    MODULE_SCRIPT = 0,
    CLASSIC_SCRIPT = 1,
    MaxValue = 2
}
export declare enum Language {
    'af' = 1,
    'am' = 2,
    'ar' = 3,
    'as' = 4,
    'az' = 5,
    'be' = 6,
    'bg' = 7,
    'bn' = 8,
    'bs' = 9,
    'ca' = 10,
    'cs' = 11,
    'cy' = 12,
    'da' = 13,
    'de' = 14,
    'el' = 15,
    'en-GB' = 16,
    'en-US' = 17,
    'es-419' = 18,
    'es' = 19,
    'et' = 20,
    'eu' = 21,
    'fa' = 22,
    'fi' = 23,
    'fil' = 24,
    'fr-CA' = 25,
    'fr' = 26,
    'gl' = 27,
    'gu' = 28,
    'he' = 29,
    'hi' = 30,
    'hr' = 31,
    'hu' = 32,
    'hy' = 33,
    'id' = 34,
    'is' = 35,
    'it' = 36,
    'ja' = 37,
    'ka' = 38,
    'kk' = 39,
    'km' = 40,
    'kn' = 41,
    'ko' = 42,
    'ky' = 43,
    'lo' = 44,
    'lt' = 45,
    'lv' = 46,
    'mk' = 47,
    'ml' = 48,
    'mn' = 49,
    'mr' = 50,
    'ms' = 51,
    'my' = 52,
    'ne' = 53,
    'nl' = 54,
    'no' = 55,
    'or' = 56,
    'pa' = 57,
    'pl' = 58,
    'pt-PT' = 59,
    'pt' = 60,
    'ro' = 61,
    'ru' = 62,
    'si' = 63,
    'sk' = 64,
    'sl' = 65,
    'sq' = 66,
    'sr-Latn' = 67,
    'sr' = 68,
    'sv' = 69,
    'sw' = 70,
    'ta' = 71,
    'te' = 72,
    'th' = 73,
    'tr' = 74,
    'uk' = 75,
    'ur' = 76,
    'uz' = 77,
    'vi' = 78,
    'zh' = 79,
    'zh-HK' = 80,
    'zh-TW' = 81,
    'zu' = 82,
    MaxValue = 83
}
export declare enum SyncSetting {
    ChromeSyncDisabled = 1,
    ChromeSyncSettingsDisabled = 2,
    DevToolsSyncSettingDisabled = 3,
    DevToolsSyncSettingEnabled = 4,
    MaxValue = 5
}
export declare enum RecordingToggled {
    RecordingStarted = 1,
    RecordingFinished = 2,
    MaxValue = 3
}
export declare enum RecordingAssertion {
    AssertionAdded = 1,
    PropertyAssertionEdited = 2,
    AttributeAssertionEdited = 3,
    MaxValue = 4
}
export declare enum RecordingReplayFinished {
    Success = 1,
    TimeoutErrorSelectors = 2,
    TimeoutErrorTarget = 3,
    OtherError = 4,
    MaxValue = 5
}
export declare enum RecordingReplaySpeed {
    Normal = 1,
    Slow = 2,
    VerySlow = 3,
    ExtremelySlow = 4,
    MaxValue = 5
}
export declare enum RecordingReplayStarted {
    ReplayOnly = 1,
    ReplayWithPerformanceTracing = 2,
    ReplayViaExtension = 3,
    MaxValue = 4
}
export declare enum RecordingEdited {
    SelectorPickerUsed = 1,
    StepAdded = 2,
    StepRemoved = 3,
    SelectorAdded = 4,
    SelectorRemoved = 5,
    SelectorPartAdded = 6,
    SelectorPartEdited = 7,
    SelectorPartRemoved = 8,
    TypeChanged = 9,
    OtherEditing = 10,
    MaxValue = 11
}
export declare enum RecordingExported {
    ToPuppeteer = 1,
    ToJSON = 2,
    ToPuppeteerReplay = 3,
    ToExtension = 4,
    ToLighthouse = 5,
    MaxValue = 6
}
export declare enum RecordingCodeToggled {
    CodeShown = 1,
    CodeHidden = 2,
    MaxValue = 3
}
export declare enum RecordingCopiedToClipboard {
    CopiedRecordingWithPuppeteer = 1,
    CopiedRecordingWithJSON = 2,
    CopiedRecordingWithReplay = 3,
    CopiedRecordingWithExtension = 4,
    CopiedStepWithPuppeteer = 5,
    CopiedStepWithJSON = 6,
    CopiedStepWithReplay = 7,
    CopiedStepWithExtension = 8,
    MaxValue = 9
}
export declare enum ConsoleShowsCorsErrors {
    'false' = 0,
    'true' = 1,
    MaxValue = 2
}
export declare enum StyleTextCopied {
    DeclarationViaChangedLine = 1,
    AllChangesViaStylesPane = 2,
    DeclarationViaContextMenu = 3,
    PropertyViaContextMenu = 4,
    ValueViaContextMenu = 5,
    DeclarationAsJSViaContextMenu = 6,
    RuleViaContextMenu = 7,
    AllDeclarationsViaContextMenu = 8,
    AllDeclarationsAsJSViaContextMenu = 9,
    SelectorViaContextMenu = 10,
    MaxValue = 11
}
export declare enum ManifestSectionCodes {
    OtherSection = 0,
    'Identity' = 1,
    'Presentation' = 2,
    'Protocol Handlers' = 3,
    'Icons' = 4,
    'Window Controls Overlay' = 5,
    MaxValue = 6
}
export declare enum CSSHintType {
    Other = 0,
    AlignContent = 1,
    FlexItem = 2,
    FlexContainer = 3,
    GridContainer = 4,
    GridItem = 5,
    FlexGrid = 6,
    MulticolFlexGrid = 7,
    Padding = 8,
    Position = 9,
    ZIndex = 10,
    Sizing = 11,
    FlexOrGridItem = 12,
    FontVariationSettings = 13,
    MaxValue = 14
}
export declare enum LighthouseModeRun {
    Navigation = 0,
    Timespan = 1,
    Snapshot = 2,
    LegacyNavigation = 3,
    MaxValue = 4
}
export declare enum LighthouseCategoryUsed {
    Performance = 0,
    Accessibility = 1,
    BestPractices = 2,
    SEO = 3,
    PWA = 4,
    PubAds = 5,
    MaxValue = 6
}
export declare const enum SwatchType {
    VarLink = 0,
    AnimationNameLink = 1,
    Color = 2,
    AnimationTiming = 3,
    Shadow = 4,
    Grid = 5,
    Flex = 6,
    Angle = 7,
    Length = 8,
    PositionFallbackLink = 9,
    MaxValue = 10
}
export declare const enum BadgeType {
    GRID = 0,
    SUBGRID = 1,
    FLEX = 2,
    AD = 3,
    SCROLL_SNAP = 4,
    CONTAINER = 5,
    SLOT = 6,
    TOP_LAYER = 7,
    REVEAL = 8,
    MaxValue = 9
}
export declare const enum AnimationsPlaybackRate {
    Percent100 = 0,
    Percent25 = 1,
    Percent10 = 2,
    Other = 3,
    MaxValue = 4
}
export declare const enum AnimationPointDragType {
    AnimationDrag = 0,
    KeyframeMove = 1,
    StartEndpointMove = 2,
    FinishEndpointMove = 3,
    Other = 4,
    MaxValue = 5
}
