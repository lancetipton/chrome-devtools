/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { InspectorFrontendHostInstance } from './InspectorFrontendHost.js';
import { EnumeratedHistogram } from './InspectorFrontendHostAPI.js';
export class UserMetrics {
    #panelChangedSinceLaunch;
    #firedLaunchHistogram;
    #launchPanelName;
    constructor() {
        this.#panelChangedSinceLaunch = false;
        this.#firedLaunchHistogram = false;
        this.#launchPanelName = '';
    }
    breakpointWithConditionAdded(breakpointWithConditionAdded) {
        if (breakpointWithConditionAdded >= 2 /* BreakpointWithConditionAdded.MaxValue */) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.BreakpointWithConditionAdded, breakpointWithConditionAdded, 2 /* BreakpointWithConditionAdded.MaxValue */);
    }
    breakpointEditDialogRevealedFrom(breakpointEditDialogRevealedFrom) {
        if (breakpointEditDialogRevealedFrom >= 7 /* BreakpointEditDialogRevealedFrom.MaxValue */) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.BreakpointEditDialogRevealedFrom, breakpointEditDialogRevealedFrom, 7 /* BreakpointEditDialogRevealedFrom.MaxValue */);
    }
    panelShown(panelName, isLaunching) {
        const code = PanelCodes[panelName] || 0;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.PanelShown, code, PanelCodes.MaxValue);
        InspectorFrontendHostInstance.recordUserMetricsAction('DevTools_PanelShown_' + panelName);
        // Store that the user has changed the panel so we know launch histograms should not be fired.
        if (!isLaunching) {
            this.#panelChangedSinceLaunch = true;
        }
    }
    /**
     * Fired when a panel is closed (regardless if it exists in the main panel or the drawer)
     */
    panelClosed(panelName) {
        const code = PanelCodes[panelName] || 0;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.PanelClosed, code, PanelCodes.MaxValue);
        // Store that the user has changed the panel so we know launch histograms should not be fired.
        this.#panelChangedSinceLaunch = true;
    }
    elementsSidebarTabShown(sidebarPaneName) {
        const code = ElementsSidebarTabCodes[sidebarPaneName] || 0;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ElementsSidebarTabShown, code, ElementsSidebarTabCodes.MaxValue);
    }
    sourcesSidebarTabShown(sidebarPaneName) {
        const code = SourcesSidebarTabCodes[sidebarPaneName] || 0;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.SourcesSidebarTabShown, code, SourcesSidebarTabCodes.MaxValue);
    }
    settingsPanelShown(settingsViewId) {
        this.panelShown('settings-' + settingsViewId);
    }
    sourcesPanelFileDebugged(mediaType) {
        const code = (mediaType && MediaTypes[mediaType]) || MediaTypes.Unknown;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.SourcesPanelFileDebugged, code, MediaTypes.MaxValue);
    }
    sourcesPanelFileOpened(mediaType) {
        const code = (mediaType && MediaTypes[mediaType]) || MediaTypes.Unknown;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.SourcesPanelFileOpened, code, MediaTypes.MaxValue);
    }
    networkPanelResponsePreviewOpened(mediaType) {
        const code = (mediaType && MediaTypes[mediaType]) || MediaTypes.Unknown;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.NetworkPanelResponsePreviewOpened, code, MediaTypes.MaxValue);
    }
    actionTaken(action) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ActionTaken, action, Action.MaxValue);
    }
    panelLoaded(panelName, histogramName) {
        if (this.#firedLaunchHistogram || panelName !== this.#launchPanelName) {
            return;
        }
        this.#firedLaunchHistogram = true;
        // Use rAF and window.setTimeout to ensure the marker is fired after layout and rendering.
        // This will give the most accurate representation of the tool being ready for a user.
        requestAnimationFrame(() => {
            window.setTimeout(() => {
                // Mark the load time so that we can pinpoint it more easily in a trace.
                performance.mark(histogramName);
                // If the user has switched panel before we finished loading, ignore the histogram,
                // since the launch timings will have been affected and are no longer valid.
                if (this.#panelChangedSinceLaunch) {
                    return;
                }
                // This fires the event for the appropriate launch histogram.
                // The duration is measured as the time elapsed since the time origin of the document.
                InspectorFrontendHostInstance.recordPerformanceHistogram(histogramName, performance.now());
            }, 0);
        });
    }
    setLaunchPanel(panelName) {
        this.#launchPanelName = panelName;
    }
    performanceTraceLoad(measure) {
        InspectorFrontendHostInstance.recordPerformanceHistogram('DevTools.TraceLoad', measure.duration);
    }
    keybindSetSettingChanged(keybindSet) {
        const value = KeybindSetSettings[keybindSet] || 0;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.KeybindSetSettingChanged, value, KeybindSetSettings.MaxValue);
    }
    keyboardShortcutFired(actionId) {
        const action = KeyboardShortcutAction[actionId] || KeyboardShortcutAction.OtherShortcut;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.KeyboardShortcutFired, action, KeyboardShortcutAction.MaxValue);
    }
    issuesPanelOpenedFrom(issueOpener) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.IssuesPanelOpenedFrom, issueOpener, IssueOpener.MaxValue);
    }
    issuesPanelIssueExpanded(issueExpandedCategory) {
        if (issueExpandedCategory === undefined) {
            return;
        }
        const issueExpanded = IssueExpanded[issueExpandedCategory];
        if (issueExpanded === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.IssuesPanelIssueExpanded, issueExpanded, IssueExpanded.MaxValue);
    }
    issuesPanelResourceOpened(issueCategory, type) {
        const key = issueCategory + type;
        const value = IssueResourceOpened[key];
        if (value === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.IssuesPanelResourceOpened, value, IssueResourceOpened.MaxValue);
    }
    issueCreated(code) {
        const issueCreated = IssueCreated[code];
        if (issueCreated === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.IssueCreated, issueCreated, IssueCreated.MaxValue);
    }
    experimentEnabledAtLaunch(experimentId) {
        const experiment = DevtoolsExperiments[experimentId];
        if (experiment === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ExperimentEnabledAtLaunch, experiment, DevtoolsExperiments.MaxValue);
    }
    experimentDisabledAtLaunch(experimentId) {
        const experiment = DevtoolsExperiments[experimentId];
        if (experiment === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ExperimentDisabledAtLaunch, experiment, DevtoolsExperiments.MaxValue);
    }
    experimentChanged(experimentId, isEnabled) {
        const experiment = DevtoolsExperiments[experimentId];
        if (experiment === undefined) {
            return;
        }
        const actionName = isEnabled ? EnumeratedHistogram.ExperimentEnabled : EnumeratedHistogram.ExperimentDisabled;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(actionName, experiment, DevtoolsExperiments.MaxValue);
    }
    developerResourceLoaded(developerResourceLoaded) {
        if (developerResourceLoaded >= DeveloperResourceLoaded.MaxValue) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.DeveloperResourceLoaded, developerResourceLoaded, DeveloperResourceLoaded.MaxValue);
    }
    developerResourceScheme(developerResourceScheme) {
        if (developerResourceScheme >= DeveloperResourceScheme.MaxValue) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.DeveloperResourceScheme, developerResourceScheme, DeveloperResourceScheme.MaxValue);
    }
    inlineScriptParsed(inlineScriptType) {
        if (inlineScriptType >= 2 /* VMInlineScriptType.MaxValue */) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.InlineScriptParsed, inlineScriptType, 2 /* VMInlineScriptType.MaxValue */);
    }
    vmInlineScriptContentShown(inlineScriptType) {
        if (inlineScriptType >= 2 /* VMInlineScriptType.MaxValue */) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.VMInlineScriptTypeShown, inlineScriptType, 2 /* VMInlineScriptType.MaxValue */);
    }
    linearMemoryInspectorRevealedFrom(linearMemoryInspectorRevealedFrom) {
        if (linearMemoryInspectorRevealedFrom >= LinearMemoryInspectorRevealedFrom.MaxValue) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.LinearMemoryInspectorRevealedFrom, linearMemoryInspectorRevealedFrom, LinearMemoryInspectorRevealedFrom.MaxValue);
    }
    linearMemoryInspectorTarget(linearMemoryInspectorTarget) {
        if (linearMemoryInspectorTarget >= LinearMemoryInspectorTarget.MaxValue) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.LinearMemoryInspectorTarget, linearMemoryInspectorTarget, LinearMemoryInspectorTarget.MaxValue);
    }
    language(language) {
        const languageCode = Language[language];
        if (languageCode === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.Language, languageCode, Language.MaxValue);
    }
    syncSetting(devtoolsSyncSettingEnabled) {
        InspectorFrontendHostInstance.getSyncInformation(syncInfo => {
            let settingValue = SyncSetting.ChromeSyncDisabled;
            if (syncInfo.isSyncActive && !syncInfo.arePreferencesSynced) {
                settingValue = SyncSetting.ChromeSyncSettingsDisabled;
            }
            else if (syncInfo.isSyncActive && syncInfo.arePreferencesSynced) {
                settingValue = devtoolsSyncSettingEnabled ? SyncSetting.DevToolsSyncSettingEnabled :
                    SyncSetting.DevToolsSyncSettingDisabled;
            }
            InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.SyncSetting, settingValue, SyncSetting.MaxValue);
        });
    }
    recordingAssertion(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingAssertion, value, RecordingAssertion.MaxValue);
    }
    recordingToggled(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingToggled, value, RecordingToggled.MaxValue);
    }
    recordingReplayFinished(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingReplayFinished, value, RecordingReplayFinished.MaxValue);
    }
    recordingReplaySpeed(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingReplaySpeed, value, RecordingReplaySpeed.MaxValue);
    }
    recordingReplayStarted(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingReplayStarted, value, RecordingReplayStarted.MaxValue);
    }
    recordingEdited(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingEdited, value, RecordingEdited.MaxValue);
    }
    recordingExported(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingExported, value, RecordingExported.MaxValue);
    }
    recordingCodeToggled(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingCodeToggled, value, RecordingCodeToggled.MaxValue);
    }
    recordingCopiedToClipboard(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.RecordingCopiedToClipboard, value, RecordingCopiedToClipboard.MaxValue);
    }
    styleTextCopied(value) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.StyleTextCopied, value, StyleTextCopied.MaxValue);
    }
    manifestSectionSelected(sectionTitle) {
        const code = ManifestSectionCodes[sectionTitle] || ManifestSectionCodes.OtherSection;
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ManifestSectionSelected, code, ManifestSectionCodes.MaxValue);
    }
    cssHintShown(type) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.CSSHintShown, type, CSSHintType.MaxValue);
    }
    lighthouseModeRun(type) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.LighthouseModeRun, type, LighthouseModeRun.MaxValue);
    }
    lighthouseCategoryUsed(type) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.LighthouseCategoryUsed, type, LighthouseCategoryUsed.MaxValue);
    }
    colorConvertedFrom(type) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ColorConvertedFrom, type, 2 /* ColorConvertedFrom.MaxValue */);
    }
    colorPickerOpenedFrom(type) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ColorPickerOpenedFrom, type, 2 /* ColorPickerOpenedFrom.MaxValue */);
    }
    cssPropertyDocumentation(type) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.CSSPropertyDocumentation, type, 3 /* CSSPropertyDocumentation.MaxValue */);
    }
    swatchActivated(swatch) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.SwatchActivated, swatch, 10 /* SwatchType.MaxValue */);
    }
    badgeActivated(badge) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.BadgeActivated, badge, 9 /* BadgeType.MaxValue */);
    }
    breakpointsRestoredFromStorage(count) {
        const countBucket = this.#breakpointCountToBucket(count);
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.BreakpointsRestoredFromStorageCount, countBucket, 10 /* BreakpointsRestoredFromStorageCount.MaxValue */);
    }
    animationPlaybackRateChanged(playbackRate) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.AnimationPlaybackRateChanged, playbackRate, 4 /* AnimationsPlaybackRate.MaxValue */);
    }
    animationPointDragged(dragType) {
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.AnimationPointDragged, dragType, 5 /* AnimationPointDragType.MaxValue */);
    }
    #breakpointCountToBucket(count) {
        if (count < 100) {
            return 0 /* BreakpointsRestoredFromStorageCount.LessThan100 */;
        }
        if (count < 300) {
            return 1 /* BreakpointsRestoredFromStorageCount.LessThan300 */;
        }
        if (count < 1000) {
            return 2 /* BreakpointsRestoredFromStorageCount.LessThan1000 */;
        }
        if (count < 3000) {
            return 3 /* BreakpointsRestoredFromStorageCount.LessThan3000 */;
        }
        if (count < 10000) {
            return 4 /* BreakpointsRestoredFromStorageCount.LessThan10000 */;
        }
        if (count < 30000) {
            return 5 /* BreakpointsRestoredFromStorageCount.LessThan30000 */;
        }
        if (count < 100000) {
            return 6 /* BreakpointsRestoredFromStorageCount.LessThan100000 */;
        }
        if (count < 300000) {
            return 7 /* BreakpointsRestoredFromStorageCount.LessThan300000 */;
        }
        if (count < 1000000) {
            return 8 /* BreakpointsRestoredFromStorageCount.LessThan1000000 */;
        }
        return 9 /* BreakpointsRestoredFromStorageCount.Above1000000 */;
    }
    workspacesPopulated(wallClockTimeInMilliseconds) {
        InspectorFrontendHostInstance.recordPerformanceHistogram('DevTools.Workspaces.PopulateWallClocktime', wallClockTimeInMilliseconds);
    }
    visualLoggingProcessingDone(timeInMilliseconds) {
        InspectorFrontendHostInstance.recordPerformanceHistogram('DevTools.VisualLogging.ProcessingTime', timeInMilliseconds);
    }
    legacyResourceTypeFilterNumberOfSelectedChanged(itemCount) {
        const boundItemCount = Math.max(Math.min(itemCount, ResourceType.MaxValue - 1), 1);
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.LegacyResourceTypeFilterNumberOfSelectedChanged, boundItemCount, ResourceType.MaxValue);
    }
    legacyResourceTypeFilterItemSelected(resourceTypeName) {
        const resourceType = ResourceType[resourceTypeName];
        if (resourceType === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.LegacyResourceTypeFilterItemSelected, resourceType, ResourceType.MaxValue);
    }
    resourceTypeFilterNumberOfSelectedChanged(itemCount) {
        const boundItemCount = Math.max(Math.min(itemCount, ResourceType.MaxValue - 1), 1);
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ResourceTypeFilterNumberOfSelectedChanged, boundItemCount, ResourceType.MaxValue);
    }
    resourceTypeFilterItemSelected(resourceTypeName) {
        const resourceType = ResourceType[resourceTypeName];
        if (resourceType === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.ResourceTypeFilterItemSelected, resourceType, ResourceType.MaxValue);
    }
    networkPanelMoreFiltersNumberOfSelectedChanged(itemCount) {
        const boundItemCount = Math.max(Math.min(itemCount, NetworkPanelMoreFilters.MaxValue), 0);
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.NetworkPanelMoreFiltersNumberOfSelectedChanged, boundItemCount, NetworkPanelMoreFilters.MaxValue);
    }
    networkPanelMoreFiltersItemSelected(filterName) {
        const filter = NetworkPanelMoreFilters[filterName];
        if (filter === undefined) {
            return;
        }
        InspectorFrontendHostInstance.recordEnumeratedHistogram(EnumeratedHistogram.NetworkPanelMoreFiltersItemSelected, filter, NetworkPanelMoreFilters.MaxValue);
    }
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
// Codes below are used to collect UMA histograms in the Chromium port.
// Do not change the values below, additional actions are needed on the Chromium side
// in order to add more codes.
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Action;
(function (Action) {
    Action[Action["WindowDocked"] = 1] = "WindowDocked";
    Action[Action["WindowUndocked"] = 2] = "WindowUndocked";
    Action[Action["ScriptsBreakpointSet"] = 3] = "ScriptsBreakpointSet";
    Action[Action["TimelineStarted"] = 4] = "TimelineStarted";
    Action[Action["ProfilesCPUProfileTaken"] = 5] = "ProfilesCPUProfileTaken";
    Action[Action["ProfilesHeapProfileTaken"] = 6] = "ProfilesHeapProfileTaken";
    Action[Action["ConsoleEvaluated"] = 8] = "ConsoleEvaluated";
    Action[Action["FileSavedInWorkspace"] = 9] = "FileSavedInWorkspace";
    Action[Action["DeviceModeEnabled"] = 10] = "DeviceModeEnabled";
    Action[Action["AnimationsPlaybackRateChanged"] = 11] = "AnimationsPlaybackRateChanged";
    Action[Action["RevisionApplied"] = 12] = "RevisionApplied";
    Action[Action["FileSystemDirectoryContentReceived"] = 13] = "FileSystemDirectoryContentReceived";
    Action[Action["StyleRuleEdited"] = 14] = "StyleRuleEdited";
    Action[Action["CommandEvaluatedInConsolePanel"] = 15] = "CommandEvaluatedInConsolePanel";
    Action[Action["DOMPropertiesExpanded"] = 16] = "DOMPropertiesExpanded";
    Action[Action["ResizedViewInResponsiveMode"] = 17] = "ResizedViewInResponsiveMode";
    Action[Action["TimelinePageReloadStarted"] = 18] = "TimelinePageReloadStarted";
    Action[Action["ConnectToNodeJSFromFrontend"] = 19] = "ConnectToNodeJSFromFrontend";
    Action[Action["ConnectToNodeJSDirectly"] = 20] = "ConnectToNodeJSDirectly";
    Action[Action["CpuThrottlingEnabled"] = 21] = "CpuThrottlingEnabled";
    Action[Action["CpuProfileNodeFocused"] = 22] = "CpuProfileNodeFocused";
    Action[Action["CpuProfileNodeExcluded"] = 23] = "CpuProfileNodeExcluded";
    Action[Action["SelectFileFromFilePicker"] = 24] = "SelectFileFromFilePicker";
    Action[Action["SelectCommandFromCommandMenu"] = 25] = "SelectCommandFromCommandMenu";
    Action[Action["ChangeInspectedNodeInElementsPanel"] = 26] = "ChangeInspectedNodeInElementsPanel";
    Action[Action["StyleRuleCopied"] = 27] = "StyleRuleCopied";
    Action[Action["CoverageStarted"] = 28] = "CoverageStarted";
    Action[Action["LighthouseStarted"] = 29] = "LighthouseStarted";
    Action[Action["LighthouseFinished"] = 30] = "LighthouseFinished";
    Action[Action["ShowedThirdPartyBadges"] = 31] = "ShowedThirdPartyBadges";
    Action[Action["LighthouseViewTrace"] = 32] = "LighthouseViewTrace";
    Action[Action["FilmStripStartedRecording"] = 33] = "FilmStripStartedRecording";
    Action[Action["CoverageReportFiltered"] = 34] = "CoverageReportFiltered";
    Action[Action["CoverageStartedPerBlock"] = 35] = "CoverageStartedPerBlock";
    Action[Action["SettingsOpenedFromGear-deprecated"] = 36] = "SettingsOpenedFromGear-deprecated";
    Action[Action["SettingsOpenedFromMenu-deprecated"] = 37] = "SettingsOpenedFromMenu-deprecated";
    Action[Action["SettingsOpenedFromCommandMenu-deprecated"] = 38] = "SettingsOpenedFromCommandMenu-deprecated";
    Action[Action["TabMovedToDrawer"] = 39] = "TabMovedToDrawer";
    Action[Action["TabMovedToMainPanel"] = 40] = "TabMovedToMainPanel";
    Action[Action["CaptureCssOverviewClicked"] = 41] = "CaptureCssOverviewClicked";
    Action[Action["VirtualAuthenticatorEnvironmentEnabled"] = 42] = "VirtualAuthenticatorEnvironmentEnabled";
    Action[Action["SourceOrderViewActivated"] = 43] = "SourceOrderViewActivated";
    Action[Action["UserShortcutAdded"] = 44] = "UserShortcutAdded";
    Action[Action["ShortcutRemoved"] = 45] = "ShortcutRemoved";
    Action[Action["ShortcutModified"] = 46] = "ShortcutModified";
    Action[Action["CustomPropertyLinkClicked"] = 47] = "CustomPropertyLinkClicked";
    Action[Action["CustomPropertyEdited"] = 48] = "CustomPropertyEdited";
    Action[Action["ServiceWorkerNetworkRequestClicked"] = 49] = "ServiceWorkerNetworkRequestClicked";
    Action[Action["ServiceWorkerNetworkRequestClosedQuickly"] = 50] = "ServiceWorkerNetworkRequestClosedQuickly";
    Action[Action["NetworkPanelServiceWorkerRespondWith"] = 51] = "NetworkPanelServiceWorkerRespondWith";
    Action[Action["NetworkPanelCopyValue"] = 52] = "NetworkPanelCopyValue";
    Action[Action["ConsoleSidebarOpened"] = 53] = "ConsoleSidebarOpened";
    Action[Action["PerfPanelTraceImported"] = 54] = "PerfPanelTraceImported";
    Action[Action["PerfPanelTraceExported"] = 55] = "PerfPanelTraceExported";
    Action[Action["StackFrameRestarted"] = 56] = "StackFrameRestarted";
    Action[Action["CaptureTestProtocolClicked"] = 57] = "CaptureTestProtocolClicked";
    Action[Action["BreakpointRemovedFromRemoveButton"] = 58] = "BreakpointRemovedFromRemoveButton";
    Action[Action["BreakpointGroupExpandedStateChanged"] = 59] = "BreakpointGroupExpandedStateChanged";
    Action[Action["HeaderOverrideFileCreated"] = 60] = "HeaderOverrideFileCreated";
    Action[Action["HeaderOverrideEnableEditingClicked"] = 61] = "HeaderOverrideEnableEditingClicked";
    Action[Action["HeaderOverrideHeaderAdded"] = 62] = "HeaderOverrideHeaderAdded";
    Action[Action["HeaderOverrideHeaderEdited"] = 63] = "HeaderOverrideHeaderEdited";
    Action[Action["HeaderOverrideHeaderRemoved"] = 64] = "HeaderOverrideHeaderRemoved";
    Action[Action["HeaderOverrideHeadersFileEdited"] = 65] = "HeaderOverrideHeadersFileEdited";
    Action[Action["PersistenceNetworkOverridesEnabled"] = 66] = "PersistenceNetworkOverridesEnabled";
    Action[Action["PersistenceNetworkOverridesDisabled"] = 67] = "PersistenceNetworkOverridesDisabled";
    Action[Action["BreakpointRemovedFromContextMenu"] = 68] = "BreakpointRemovedFromContextMenu";
    Action[Action["BreakpointsInFileRemovedFromRemoveButton"] = 69] = "BreakpointsInFileRemovedFromRemoveButton";
    Action[Action["BreakpointsInFileRemovedFromContextMenu"] = 70] = "BreakpointsInFileRemovedFromContextMenu";
    Action[Action["BreakpointsInFileCheckboxToggled"] = 71] = "BreakpointsInFileCheckboxToggled";
    Action[Action["BreakpointsInFileEnabledDisabledFromContextMenu"] = 72] = "BreakpointsInFileEnabledDisabledFromContextMenu";
    Action[Action["BreakpointConditionEditedFromSidebar"] = 73] = "BreakpointConditionEditedFromSidebar";
    Action[Action["WorkspaceTabAddFolder"] = 74] = "WorkspaceTabAddFolder";
    Action[Action["WorkspaceTabRemoveFolder"] = 75] = "WorkspaceTabRemoveFolder";
    Action[Action["OverrideTabAddFolder"] = 76] = "OverrideTabAddFolder";
    Action[Action["OverrideTabRemoveFolder"] = 77] = "OverrideTabRemoveFolder";
    Action[Action["WorkspaceSourceSelected"] = 78] = "WorkspaceSourceSelected";
    Action[Action["OverridesSourceSelected"] = 79] = "OverridesSourceSelected";
    Action[Action["StyleSheetInitiatorLinkClicked"] = 80] = "StyleSheetInitiatorLinkClicked";
    Action[Action["BreakpointRemovedFromGutterContextMenu"] = 81] = "BreakpointRemovedFromGutterContextMenu";
    Action[Action["BreakpointRemovedFromGutterToggle"] = 82] = "BreakpointRemovedFromGutterToggle";
    Action[Action["StylePropertyInsideKeyframeEdited"] = 83] = "StylePropertyInsideKeyframeEdited";
    Action[Action["OverrideContentFromSourcesContextMenu"] = 84] = "OverrideContentFromSourcesContextMenu";
    Action[Action["OverrideContentFromNetworkContextMenu"] = 85] = "OverrideContentFromNetworkContextMenu";
    Action[Action["OverrideScript"] = 86] = "OverrideScript";
    Action[Action["OverrideStyleSheet"] = 87] = "OverrideStyleSheet";
    Action[Action["OverrideDocument"] = 88] = "OverrideDocument";
    Action[Action["OverrideFetchXHR"] = 89] = "OverrideFetchXHR";
    Action[Action["OverrideImage"] = 90] = "OverrideImage";
    Action[Action["OverrideFont"] = 91] = "OverrideFont";
    Action[Action["OverrideContentContextMenuSetup"] = 92] = "OverrideContentContextMenuSetup";
    Action[Action["OverrideContentContextMenuAbandonSetup"] = 93] = "OverrideContentContextMenuAbandonSetup";
    Action[Action["OverrideContentContextMenuActivateDisabled"] = 94] = "OverrideContentContextMenuActivateDisabled";
    Action[Action["OverrideContentContextMenuOpenExistingFile"] = 95] = "OverrideContentContextMenuOpenExistingFile";
    Action[Action["OverrideContentContextMenuSaveNewFile"] = 96] = "OverrideContentContextMenuSaveNewFile";
    Action[Action["ShowAllOverridesFromSourcesContextMenu"] = 97] = "ShowAllOverridesFromSourcesContextMenu";
    Action[Action["ShowAllOverridesFromNetworkContextMenu"] = 98] = "ShowAllOverridesFromNetworkContextMenu";
    Action[Action["AnimationGroupsCleared"] = 99] = "AnimationGroupsCleared";
    Action[Action["AnimationsPaused"] = 100] = "AnimationsPaused";
    Action[Action["AnimationsResumed"] = 101] = "AnimationsResumed";
    Action[Action["AnimatedNodeDescriptionClicked"] = 102] = "AnimatedNodeDescriptionClicked";
    Action[Action["AnimationGroupScrubbed"] = 103] = "AnimationGroupScrubbed";
    Action[Action["AnimationGroupReplayed"] = 104] = "AnimationGroupReplayed";
    Action[Action["OverrideTabDeleteFolderContextMenu"] = 105] = "OverrideTabDeleteFolderContextMenu";
    Action[Action["WorkspaceDropFolder"] = 107] = "WorkspaceDropFolder";
    Action[Action["WorkspaceSelectFolder"] = 108] = "WorkspaceSelectFolder";
    Action[Action["OverrideContentContextMenuSourceMappedWarning"] = 109] = "OverrideContentContextMenuSourceMappedWarning";
    Action[Action["OverrideContentContextMenuRedirectToDeployed"] = 110] = "OverrideContentContextMenuRedirectToDeployed";
    Action[Action["NewStyleRuleAdded"] = 111] = "NewStyleRuleAdded";
    Action[Action["TraceExpanded"] = 112] = "TraceExpanded";
    Action[Action["InsightConsoleMessageShown"] = 113] = "InsightConsoleMessageShown";
    Action[Action["InsightRequestedViaContextMenu"] = 114] = "InsightRequestedViaContextMenu";
    Action[Action["InsightRequestedViaHoverButton"] = 115] = "InsightRequestedViaHoverButton";
    Action[Action["InsightRefined"] = 116] = "InsightRefined";
    Action[Action["InsightRatedPositive"] = 117] = "InsightRatedPositive";
    Action[Action["InsightRatedNegative"] = 118] = "InsightRatedNegative";
    Action[Action["InsightClosed"] = 119] = "InsightClosed";
    Action[Action["InsightErrored"] = 120] = "InsightErrored";
    Action[Action["InsightHoverButtonShown"] = 121] = "InsightHoverButtonShown";
    Action[Action["MaxValue"] = 122] = "MaxValue";
})(Action || (Action = {}));
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var PanelCodes;
(function (PanelCodes) {
    PanelCodes[PanelCodes["elements"] = 1] = "elements";
    PanelCodes[PanelCodes["resources"] = 2] = "resources";
    PanelCodes[PanelCodes["network"] = 3] = "network";
    PanelCodes[PanelCodes["sources"] = 4] = "sources";
    PanelCodes[PanelCodes["timeline"] = 5] = "timeline";
    PanelCodes[PanelCodes["heap_profiler"] = 6] = "heap_profiler";
    PanelCodes[PanelCodes["console"] = 8] = "console";
    PanelCodes[PanelCodes["layers"] = 9] = "layers";
    PanelCodes[PanelCodes["console-view"] = 10] = "console-view";
    PanelCodes[PanelCodes["animations"] = 11] = "animations";
    PanelCodes[PanelCodes["network.config"] = 12] = "network.config";
    PanelCodes[PanelCodes["rendering"] = 13] = "rendering";
    PanelCodes[PanelCodes["sensors"] = 14] = "sensors";
    PanelCodes[PanelCodes["sources.search"] = 15] = "sources.search";
    PanelCodes[PanelCodes["security"] = 16] = "security";
    PanelCodes[PanelCodes["js_profiler"] = 17] = "js_profiler";
    PanelCodes[PanelCodes["lighthouse"] = 18] = "lighthouse";
    PanelCodes[PanelCodes["coverage"] = 19] = "coverage";
    PanelCodes[PanelCodes["protocol-monitor"] = 20] = "protocol-monitor";
    PanelCodes[PanelCodes["remote-devices"] = 21] = "remote-devices";
    PanelCodes[PanelCodes["web-audio"] = 22] = "web-audio";
    PanelCodes[PanelCodes["changes.changes"] = 23] = "changes.changes";
    PanelCodes[PanelCodes["performance.monitor"] = 24] = "performance.monitor";
    PanelCodes[PanelCodes["release-note"] = 25] = "release-note";
    PanelCodes[PanelCodes["live_heap_profile"] = 26] = "live_heap_profile";
    PanelCodes[PanelCodes["sources.quick"] = 27] = "sources.quick";
    PanelCodes[PanelCodes["network.blocked-urls"] = 28] = "network.blocked-urls";
    PanelCodes[PanelCodes["settings-preferences"] = 29] = "settings-preferences";
    PanelCodes[PanelCodes["settings-workspace"] = 30] = "settings-workspace";
    PanelCodes[PanelCodes["settings-experiments"] = 31] = "settings-experiments";
    PanelCodes[PanelCodes["settings-blackbox"] = 32] = "settings-blackbox";
    PanelCodes[PanelCodes["settings-devices"] = 33] = "settings-devices";
    PanelCodes[PanelCodes["settings-throttling-conditions"] = 34] = "settings-throttling-conditions";
    PanelCodes[PanelCodes["settings-emulation-locations"] = 35] = "settings-emulation-locations";
    PanelCodes[PanelCodes["settings-shortcuts"] = 36] = "settings-shortcuts";
    PanelCodes[PanelCodes["issues-pane"] = 37] = "issues-pane";
    PanelCodes[PanelCodes["settings-keybinds"] = 38] = "settings-keybinds";
    PanelCodes[PanelCodes["cssoverview"] = 39] = "cssoverview";
    PanelCodes[PanelCodes["chrome_recorder"] = 40] = "chrome_recorder";
    PanelCodes[PanelCodes["trust_tokens"] = 41] = "trust_tokens";
    PanelCodes[PanelCodes["reporting_api"] = 42] = "reporting_api";
    PanelCodes[PanelCodes["interest_groups"] = 43] = "interest_groups";
    PanelCodes[PanelCodes["back_forward_cache"] = 44] = "back_forward_cache";
    PanelCodes[PanelCodes["service_worker_cache"] = 45] = "service_worker_cache";
    PanelCodes[PanelCodes["background_service_backgroundFetch"] = 46] = "background_service_backgroundFetch";
    PanelCodes[PanelCodes["background_service_backgroundSync"] = 47] = "background_service_backgroundSync";
    PanelCodes[PanelCodes["background_service_pushMessaging"] = 48] = "background_service_pushMessaging";
    PanelCodes[PanelCodes["background_service_notifications"] = 49] = "background_service_notifications";
    PanelCodes[PanelCodes["background_service_paymentHandler"] = 50] = "background_service_paymentHandler";
    PanelCodes[PanelCodes["background_service_periodicBackgroundSync"] = 51] = "background_service_periodicBackgroundSync";
    PanelCodes[PanelCodes["service_workers"] = 52] = "service_workers";
    PanelCodes[PanelCodes["app_manifest"] = 53] = "app_manifest";
    PanelCodes[PanelCodes["storage"] = 54] = "storage";
    PanelCodes[PanelCodes["cookies"] = 55] = "cookies";
    PanelCodes[PanelCodes["frame_details"] = 56] = "frame_details";
    PanelCodes[PanelCodes["frame_resource"] = 57] = "frame_resource";
    PanelCodes[PanelCodes["frame_window"] = 58] = "frame_window";
    PanelCodes[PanelCodes["frame_worker"] = 59] = "frame_worker";
    PanelCodes[PanelCodes["dom_storage"] = 60] = "dom_storage";
    PanelCodes[PanelCodes["indexed_db"] = 61] = "indexed_db";
    PanelCodes[PanelCodes["web_sql"] = 62] = "web_sql";
    PanelCodes[PanelCodes["performance_insights"] = 63] = "performance_insights";
    PanelCodes[PanelCodes["preloading"] = 64] = "preloading";
    PanelCodes[PanelCodes["bounce_tracking_mitigations"] = 65] = "bounce_tracking_mitigations";
    PanelCodes[PanelCodes["developer-resources"] = 66] = "developer-resources";
    PanelCodes[PanelCodes["autofill-view"] = 67] = "autofill-view";
    PanelCodes[PanelCodes["MaxValue"] = 68] = "MaxValue";
})(PanelCodes || (PanelCodes = {}));
/* eslint-enable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var ElementsSidebarTabCodes;
(function (ElementsSidebarTabCodes) {
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["OtherSidebarPane"] = 0] = "OtherSidebarPane";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["Styles"] = 1] = "Styles";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["Computed"] = 2] = "Computed";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["elements.layout"] = 3] = "elements.layout";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["elements.eventListeners"] = 4] = "elements.eventListeners";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["elements.domBreakpoints"] = 5] = "elements.domBreakpoints";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["elements.domProperties"] = 6] = "elements.domProperties";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["accessibility.view"] = 7] = "accessibility.view";
    ElementsSidebarTabCodes[ElementsSidebarTabCodes["MaxValue"] = 8] = "MaxValue";
})(ElementsSidebarTabCodes || (ElementsSidebarTabCodes = {}));
/* eslint-enable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var SourcesSidebarTabCodes;
(function (SourcesSidebarTabCodes) {
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["OtherSidebarPane"] = 0] = "OtherSidebarPane";
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["navigator-network"] = 1] = "navigator-network";
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["navigator-files"] = 2] = "navigator-files";
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["navigator-overrides"] = 3] = "navigator-overrides";
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["navigator-contentScripts"] = 4] = "navigator-contentScripts";
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["navigator-snippets"] = 5] = "navigator-snippets";
    SourcesSidebarTabCodes[SourcesSidebarTabCodes["MaxValue"] = 6] = "MaxValue";
})(SourcesSidebarTabCodes || (SourcesSidebarTabCodes = {}));
/* eslint-enable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var MediaTypes;
(function (MediaTypes) {
    MediaTypes[MediaTypes["Unknown"] = 0] = "Unknown";
    MediaTypes[MediaTypes["text/css"] = 2] = "text/css";
    MediaTypes[MediaTypes["text/html"] = 3] = "text/html";
    MediaTypes[MediaTypes["application/xml"] = 4] = "application/xml";
    MediaTypes[MediaTypes["application/wasm"] = 5] = "application/wasm";
    MediaTypes[MediaTypes["application/manifest+json"] = 6] = "application/manifest+json";
    MediaTypes[MediaTypes["application/x-aspx"] = 7] = "application/x-aspx";
    MediaTypes[MediaTypes["application/jsp"] = 8] = "application/jsp";
    MediaTypes[MediaTypes["text/x-c++src"] = 9] = "text/x-c++src";
    MediaTypes[MediaTypes["text/x-coffeescript"] = 10] = "text/x-coffeescript";
    MediaTypes[MediaTypes["application/vnd.dart"] = 11] = "application/vnd.dart";
    MediaTypes[MediaTypes["text/typescript"] = 12] = "text/typescript";
    MediaTypes[MediaTypes["text/typescript-jsx"] = 13] = "text/typescript-jsx";
    MediaTypes[MediaTypes["application/json"] = 14] = "application/json";
    MediaTypes[MediaTypes["text/x-csharp"] = 15] = "text/x-csharp";
    MediaTypes[MediaTypes["text/x-java"] = 16] = "text/x-java";
    MediaTypes[MediaTypes["text/x-less"] = 17] = "text/x-less";
    MediaTypes[MediaTypes["application/x-httpd-php"] = 18] = "application/x-httpd-php";
    MediaTypes[MediaTypes["text/x-python"] = 19] = "text/x-python";
    MediaTypes[MediaTypes["text/x-sh"] = 20] = "text/x-sh";
    MediaTypes[MediaTypes["text/x-gss"] = 21] = "text/x-gss";
    MediaTypes[MediaTypes["text/x-sass"] = 22] = "text/x-sass";
    MediaTypes[MediaTypes["text/x-scss"] = 23] = "text/x-scss";
    MediaTypes[MediaTypes["text/markdown"] = 24] = "text/markdown";
    MediaTypes[MediaTypes["text/x-clojure"] = 25] = "text/x-clojure";
    MediaTypes[MediaTypes["text/jsx"] = 26] = "text/jsx";
    MediaTypes[MediaTypes["text/x-go"] = 27] = "text/x-go";
    MediaTypes[MediaTypes["text/x-kotlin"] = 28] = "text/x-kotlin";
    MediaTypes[MediaTypes["text/x-scala"] = 29] = "text/x-scala";
    MediaTypes[MediaTypes["text/x.svelte"] = 30] = "text/x.svelte";
    MediaTypes[MediaTypes["text/javascript+plain"] = 31] = "text/javascript+plain";
    MediaTypes[MediaTypes["text/javascript+minified"] = 32] = "text/javascript+minified";
    MediaTypes[MediaTypes["text/javascript+sourcemapped"] = 33] = "text/javascript+sourcemapped";
    MediaTypes[MediaTypes["text/x.angular"] = 34] = "text/x.angular";
    MediaTypes[MediaTypes["text/x.vue"] = 35] = "text/x.vue";
    MediaTypes[MediaTypes["MaxValue"] = 36] = "MaxValue";
})(MediaTypes || (MediaTypes = {}));
/* eslint-enable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var KeybindSetSettings;
(function (KeybindSetSettings) {
    KeybindSetSettings[KeybindSetSettings["devToolsDefault"] = 0] = "devToolsDefault";
    KeybindSetSettings[KeybindSetSettings["vsCode"] = 1] = "vsCode";
    KeybindSetSettings[KeybindSetSettings["MaxValue"] = 2] = "MaxValue";
})(KeybindSetSettings || (KeybindSetSettings = {}));
/* eslint-enable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var KeyboardShortcutAction;
(function (KeyboardShortcutAction) {
    KeyboardShortcutAction[KeyboardShortcutAction["OtherShortcut"] = 0] = "OtherShortcut";
    KeyboardShortcutAction[KeyboardShortcutAction["commandMenu.show"] = 1] = "commandMenu.show";
    KeyboardShortcutAction[KeyboardShortcutAction["console.clear"] = 2] = "console.clear";
    KeyboardShortcutAction[KeyboardShortcutAction["console.toggle"] = 3] = "console.toggle";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.step"] = 4] = "debugger.step";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.step-into"] = 5] = "debugger.step-into";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.step-out"] = 6] = "debugger.step-out";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.step-over"] = 7] = "debugger.step-over";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.toggle-breakpoint"] = 8] = "debugger.toggle-breakpoint";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.toggle-breakpoint-enabled"] = 9] = "debugger.toggle-breakpoint-enabled";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.toggle-pause"] = 10] = "debugger.toggle-pause";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.edit-as-html"] = 11] = "elements.edit-as-html";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.hide-element"] = 12] = "elements.hide-element";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.redo"] = 13] = "elements.redo";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.toggle-element-search"] = 14] = "elements.toggle-element-search";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.undo"] = 15] = "elements.undo";
    KeyboardShortcutAction[KeyboardShortcutAction["main.search-in-panel.find"] = 16] = "main.search-in-panel.find";
    KeyboardShortcutAction[KeyboardShortcutAction["main.toggle-drawer"] = 17] = "main.toggle-drawer";
    KeyboardShortcutAction[KeyboardShortcutAction["network.hide-request-details"] = 18] = "network.hide-request-details";
    KeyboardShortcutAction[KeyboardShortcutAction["network.search"] = 19] = "network.search";
    KeyboardShortcutAction[KeyboardShortcutAction["network.toggle-recording"] = 20] = "network.toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["quickOpen.show"] = 21] = "quickOpen.show";
    KeyboardShortcutAction[KeyboardShortcutAction["settings.show"] = 22] = "settings.show";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.search"] = 23] = "sources.search";
    KeyboardShortcutAction[KeyboardShortcutAction["background-service.toggle-recording"] = 24] = "background-service.toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["components.collect-garbage"] = 25] = "components.collect-garbage";
    KeyboardShortcutAction[KeyboardShortcutAction["console.clear.history"] = 26] = "console.clear.history";
    KeyboardShortcutAction[KeyboardShortcutAction["console.create-pin"] = 27] = "console.create-pin";
    KeyboardShortcutAction[KeyboardShortcutAction["coverage.start-with-reload"] = 28] = "coverage.start-with-reload";
    KeyboardShortcutAction[KeyboardShortcutAction["coverage.toggle-recording"] = 29] = "coverage.toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.breakpoint-input-window"] = 30] = "debugger.breakpoint-input-window";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.evaluate-selection"] = 31] = "debugger.evaluate-selection";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.next-call-frame"] = 32] = "debugger.next-call-frame";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.previous-call-frame"] = 33] = "debugger.previous-call-frame";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.run-snippet"] = 34] = "debugger.run-snippet";
    KeyboardShortcutAction[KeyboardShortcutAction["debugger.toggle-breakpoints-active"] = 35] = "debugger.toggle-breakpoints-active";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.capture-area-screenshot"] = 36] = "elements.capture-area-screenshot";
    KeyboardShortcutAction[KeyboardShortcutAction["emulation.capture-full-height-screenshot"] = 37] = "emulation.capture-full-height-screenshot";
    KeyboardShortcutAction[KeyboardShortcutAction["emulation.capture-node-screenshot"] = 38] = "emulation.capture-node-screenshot";
    KeyboardShortcutAction[KeyboardShortcutAction["emulation.capture-screenshot"] = 39] = "emulation.capture-screenshot";
    KeyboardShortcutAction[KeyboardShortcutAction["emulation.show-sensors"] = 40] = "emulation.show-sensors";
    KeyboardShortcutAction[KeyboardShortcutAction["emulation.toggle-device-mode"] = 41] = "emulation.toggle-device-mode";
    KeyboardShortcutAction[KeyboardShortcutAction["help.release-notes"] = 42] = "help.release-notes";
    KeyboardShortcutAction[KeyboardShortcutAction["help.report-issue"] = 43] = "help.report-issue";
    KeyboardShortcutAction[KeyboardShortcutAction["input.start-replaying"] = 44] = "input.start-replaying";
    KeyboardShortcutAction[KeyboardShortcutAction["input.toggle-pause"] = 45] = "input.toggle-pause";
    KeyboardShortcutAction[KeyboardShortcutAction["input.toggle-recording"] = 46] = "input.toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["inspector_main.focus-debuggee"] = 47] = "inspector_main.focus-debuggee";
    KeyboardShortcutAction[KeyboardShortcutAction["inspector_main.hard-reload"] = 48] = "inspector_main.hard-reload";
    KeyboardShortcutAction[KeyboardShortcutAction["inspector_main.reload"] = 49] = "inspector_main.reload";
    KeyboardShortcutAction[KeyboardShortcutAction["live-heap-profile.start-with-reload"] = 50] = "live-heap-profile.start-with-reload";
    KeyboardShortcutAction[KeyboardShortcutAction["live-heap-profile.toggle-recording"] = 51] = "live-heap-profile.toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["main.debug-reload"] = 52] = "main.debug-reload";
    KeyboardShortcutAction[KeyboardShortcutAction["main.next-tab"] = 53] = "main.next-tab";
    KeyboardShortcutAction[KeyboardShortcutAction["main.previous-tab"] = 54] = "main.previous-tab";
    KeyboardShortcutAction[KeyboardShortcutAction["main.search-in-panel.cancel"] = 55] = "main.search-in-panel.cancel";
    KeyboardShortcutAction[KeyboardShortcutAction["main.search-in-panel.find-next"] = 56] = "main.search-in-panel.find-next";
    KeyboardShortcutAction[KeyboardShortcutAction["main.search-in-panel.find-previous"] = 57] = "main.search-in-panel.find-previous";
    KeyboardShortcutAction[KeyboardShortcutAction["main.toggle-dock"] = 58] = "main.toggle-dock";
    KeyboardShortcutAction[KeyboardShortcutAction["main.zoom-in"] = 59] = "main.zoom-in";
    KeyboardShortcutAction[KeyboardShortcutAction["main.zoom-out"] = 60] = "main.zoom-out";
    KeyboardShortcutAction[KeyboardShortcutAction["main.zoom-reset"] = 61] = "main.zoom-reset";
    KeyboardShortcutAction[KeyboardShortcutAction["network-conditions.network-low-end-mobile"] = 62] = "network-conditions.network-low-end-mobile";
    KeyboardShortcutAction[KeyboardShortcutAction["network-conditions.network-mid-tier-mobile"] = 63] = "network-conditions.network-mid-tier-mobile";
    KeyboardShortcutAction[KeyboardShortcutAction["network-conditions.network-offline"] = 64] = "network-conditions.network-offline";
    KeyboardShortcutAction[KeyboardShortcutAction["network-conditions.network-online"] = 65] = "network-conditions.network-online";
    KeyboardShortcutAction[KeyboardShortcutAction["profiler.heap-toggle-recording"] = 66] = "profiler.heap-toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["profiler.js-toggle-recording"] = 67] = "profiler.js-toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["resources.clear"] = 68] = "resources.clear";
    KeyboardShortcutAction[KeyboardShortcutAction["settings.documentation"] = 69] = "settings.documentation";
    KeyboardShortcutAction[KeyboardShortcutAction["settings.shortcuts"] = 70] = "settings.shortcuts";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.add-folder-to-workspace"] = 71] = "sources.add-folder-to-workspace";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.add-to-watch"] = 72] = "sources.add-to-watch";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.close-all"] = 73] = "sources.close-all";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.close-editor-tab"] = 74] = "sources.close-editor-tab";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.create-snippet"] = 75] = "sources.create-snippet";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.go-to-line"] = 76] = "sources.go-to-line";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.go-to-member"] = 77] = "sources.go-to-member";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.jump-to-next-location"] = 78] = "sources.jump-to-next-location";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.jump-to-previous-location"] = 79] = "sources.jump-to-previous-location";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.rename"] = 80] = "sources.rename";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.save"] = 81] = "sources.save";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.save-all"] = 82] = "sources.save-all";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.switch-file"] = 83] = "sources.switch-file";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.jump-to-next-frame"] = 84] = "timeline.jump-to-next-frame";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.jump-to-previous-frame"] = 85] = "timeline.jump-to-previous-frame";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.load-from-file"] = 86] = "timeline.load-from-file";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.next-recording"] = 87] = "timeline.next-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.previous-recording"] = 88] = "timeline.previous-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.record-reload"] = 89] = "timeline.record-reload";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.save-to-file"] = 90] = "timeline.save-to-file";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.show-history"] = 91] = "timeline.show-history";
    KeyboardShortcutAction[KeyboardShortcutAction["timeline.toggle-recording"] = 92] = "timeline.toggle-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.increment-css"] = 93] = "sources.increment-css";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.increment-css-by-ten"] = 94] = "sources.increment-css-by-ten";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.decrement-css"] = 95] = "sources.decrement-css";
    KeyboardShortcutAction[KeyboardShortcutAction["sources.decrement-css-by-ten"] = 96] = "sources.decrement-css-by-ten";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.reset-view"] = 97] = "layers.reset-view";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.pan-mode"] = 98] = "layers.pan-mode";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.rotate-mode"] = 99] = "layers.rotate-mode";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.zoom-in"] = 100] = "layers.zoom-in";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.zoom-out"] = 101] = "layers.zoom-out";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.up"] = 102] = "layers.up";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.down"] = 103] = "layers.down";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.left"] = 104] = "layers.left";
    KeyboardShortcutAction[KeyboardShortcutAction["layers.right"] = 105] = "layers.right";
    KeyboardShortcutAction[KeyboardShortcutAction["help.report-translation-issue"] = 106] = "help.report-translation-issue";
    KeyboardShortcutAction[KeyboardShortcutAction["rendering.toggle-prefers-color-scheme"] = 107] = "rendering.toggle-prefers-color-scheme";
    KeyboardShortcutAction[KeyboardShortcutAction["chrome_recorder.start-recording"] = 108] = "chrome_recorder.start-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["chrome_recorder.replay-recording"] = 109] = "chrome_recorder.replay-recording";
    KeyboardShortcutAction[KeyboardShortcutAction["chrome_recorder.toggle-code-view"] = 110] = "chrome_recorder.toggle-code-view";
    KeyboardShortcutAction[KeyboardShortcutAction["chrome_recorder.copy-recording-or-step"] = 111] = "chrome_recorder.copy-recording-or-step";
    KeyboardShortcutAction[KeyboardShortcutAction["changes.revert"] = 112] = "changes.revert";
    KeyboardShortcutAction[KeyboardShortcutAction["changes.copy"] = 113] = "changes.copy";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.new-style-rule"] = 114] = "elements.new-style-rule";
    KeyboardShortcutAction[KeyboardShortcutAction["elements.refresh-event-listeners"] = 115] = "elements.refresh-event-listeners";
    KeyboardShortcutAction[KeyboardShortcutAction["coverage.clear"] = 116] = "coverage.clear";
    KeyboardShortcutAction[KeyboardShortcutAction["coverage.export"] = 117] = "coverage.export";
    KeyboardShortcutAction[KeyboardShortcutAction["MaxValue"] = 118] = "MaxValue";
})(KeyboardShortcutAction || (KeyboardShortcutAction = {}));
/* eslint-enable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var IssueOpener;
(function (IssueOpener) {
    IssueOpener[IssueOpener["ConsoleInfoBar"] = 0] = "ConsoleInfoBar";
    IssueOpener[IssueOpener["LearnMoreLinkCOEP"] = 1] = "LearnMoreLinkCOEP";
    IssueOpener[IssueOpener["StatusBarIssuesCounter"] = 2] = "StatusBarIssuesCounter";
    IssueOpener[IssueOpener["HamburgerMenu"] = 3] = "HamburgerMenu";
    IssueOpener[IssueOpener["Adorner"] = 4] = "Adorner";
    IssueOpener[IssueOpener["CommandMenu"] = 5] = "CommandMenu";
    IssueOpener[IssueOpener["MaxValue"] = 6] = "MaxValue";
})(IssueOpener || (IssueOpener = {}));
/**
 * This list should contain the currently active Devtools Experiments,
 * gaps are expected.
 */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var DevtoolsExperiments;
(function (DevtoolsExperiments) {
    DevtoolsExperiments[DevtoolsExperiments["applyCustomStylesheet"] = 0] = "applyCustomStylesheet";
    DevtoolsExperiments[DevtoolsExperiments["captureNodeCreationStacks"] = 1] = "captureNodeCreationStacks";
    DevtoolsExperiments[DevtoolsExperiments["liveHeapProfile"] = 11] = "liveHeapProfile";
    DevtoolsExperiments[DevtoolsExperiments["protocolMonitor"] = 13] = "protocolMonitor";
    DevtoolsExperiments[DevtoolsExperiments["samplingHeapProfilerTimeline"] = 17] = "samplingHeapProfilerTimeline";
    DevtoolsExperiments[DevtoolsExperiments["showOptionToExposeInternalsInHeapSnapshot"] = 18] = "showOptionToExposeInternalsInHeapSnapshot";
    DevtoolsExperiments[DevtoolsExperiments["timelineEventInitiators"] = 24] = "timelineEventInitiators";
    DevtoolsExperiments[DevtoolsExperiments["timelineInvalidationTracking"] = 26] = "timelineInvalidationTracking";
    DevtoolsExperiments[DevtoolsExperiments["timelineShowAllEvents"] = 27] = "timelineShowAllEvents";
    DevtoolsExperiments[DevtoolsExperiments["timelineV8RuntimeCallStats"] = 28] = "timelineV8RuntimeCallStats";
    DevtoolsExperiments[DevtoolsExperiments["APCA"] = 39] = "APCA";
    DevtoolsExperiments[DevtoolsExperiments["fontEditor"] = 41] = "fontEditor";
    DevtoolsExperiments[DevtoolsExperiments["fullAccessibilityTree"] = 42] = "fullAccessibilityTree";
    DevtoolsExperiments[DevtoolsExperiments["ignoreListJSFramesOnTimeline"] = 43] = "ignoreListJSFramesOnTimeline";
    DevtoolsExperiments[DevtoolsExperiments["contrastIssues"] = 44] = "contrastIssues";
    DevtoolsExperiments[DevtoolsExperiments["experimentalCookieFeatures"] = 45] = "experimentalCookieFeatures";
    DevtoolsExperiments[DevtoolsExperiments["stylesPaneCSSChanges"] = 55] = "stylesPaneCSSChanges";
    DevtoolsExperiments[DevtoolsExperiments["evaluateExpressionsWithSourceMaps"] = 58] = "evaluateExpressionsWithSourceMaps";
    DevtoolsExperiments[DevtoolsExperiments["instrumentationBreakpoints"] = 61] = "instrumentationBreakpoints";
    DevtoolsExperiments[DevtoolsExperiments["authoredDeployedGrouping"] = 63] = "authoredDeployedGrouping";
    DevtoolsExperiments[DevtoolsExperiments["importantDOMProperties"] = 64] = "importantDOMProperties";
    DevtoolsExperiments[DevtoolsExperiments["justMyCode"] = 65] = "justMyCode";
    DevtoolsExperiments[DevtoolsExperiments["timelineAsConsoleProfileResultPanel"] = 67] = "timelineAsConsoleProfileResultPanel";
    DevtoolsExperiments[DevtoolsExperiments["preloadingStatusPanel"] = 68] = "preloadingStatusPanel";
    DevtoolsExperiments[DevtoolsExperiments["outermostTargetSelector"] = 71] = "outermostTargetSelector";
    DevtoolsExperiments[DevtoolsExperiments["jsProfilerTemporarilyEnable"] = 72] = "jsProfilerTemporarilyEnable";
    DevtoolsExperiments[DevtoolsExperiments["highlightErrorsElementsPanel"] = 73] = "highlightErrorsElementsPanel";
    DevtoolsExperiments[DevtoolsExperiments["setAllBreakpointsEagerly"] = 74] = "setAllBreakpointsEagerly";
    DevtoolsExperiments[DevtoolsExperiments["selfXssWarning"] = 75] = "selfXssWarning";
    DevtoolsExperiments[DevtoolsExperiments["useSourceMapScopes"] = 76] = "useSourceMapScopes";
    DevtoolsExperiments[DevtoolsExperiments["storageBucketsTree"] = 77] = "storageBucketsTree";
    DevtoolsExperiments[DevtoolsExperiments["networkPanelFilterBarRedesign"] = 79] = "networkPanelFilterBarRedesign";
    DevtoolsExperiments[DevtoolsExperiments["breadcrumbsPerformancePanel"] = 80] = "breadcrumbsPerformancePanel";
    DevtoolsExperiments[DevtoolsExperiments["trackContextMenu"] = 81] = "trackContextMenu";
    DevtoolsExperiments[DevtoolsExperiments["autofillView"] = 82] = "autofillView";
    DevtoolsExperiments[DevtoolsExperiments["sourcesFrameIndentationMarkersTemporarilyDisable"] = 83] = "sourcesFrameIndentationMarkersTemporarilyDisable";
    // Increment this when new experiments are added.
    DevtoolsExperiments[DevtoolsExperiments["MaxValue"] = 84] = "MaxValue";
})(DevtoolsExperiments || (DevtoolsExperiments = {}));
// Update DevToolsIssuesPanelIssueExpanded from tools/metrics/histograms/enums.xml if new enum is added.
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var IssueExpanded;
(function (IssueExpanded) {
    IssueExpanded[IssueExpanded["CrossOriginEmbedderPolicy"] = 0] = "CrossOriginEmbedderPolicy";
    IssueExpanded[IssueExpanded["MixedContent"] = 1] = "MixedContent";
    IssueExpanded[IssueExpanded["SameSiteCookie"] = 2] = "SameSiteCookie";
    IssueExpanded[IssueExpanded["HeavyAd"] = 3] = "HeavyAd";
    IssueExpanded[IssueExpanded["ContentSecurityPolicy"] = 4] = "ContentSecurityPolicy";
    IssueExpanded[IssueExpanded["Other"] = 5] = "Other";
    IssueExpanded[IssueExpanded["Generic"] = 6] = "Generic";
    IssueExpanded[IssueExpanded["ThirdPartyPhaseoutCookie"] = 7] = "ThirdPartyPhaseoutCookie";
    IssueExpanded[IssueExpanded["GenericCookie"] = 8] = "GenericCookie";
    IssueExpanded[IssueExpanded["MaxValue"] = 9] = "MaxValue";
})(IssueExpanded || (IssueExpanded = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var IssueResourceOpened;
(function (IssueResourceOpened) {
    IssueResourceOpened[IssueResourceOpened["CrossOriginEmbedderPolicyRequest"] = 0] = "CrossOriginEmbedderPolicyRequest";
    IssueResourceOpened[IssueResourceOpened["CrossOriginEmbedderPolicyElement"] = 1] = "CrossOriginEmbedderPolicyElement";
    IssueResourceOpened[IssueResourceOpened["MixedContentRequest"] = 2] = "MixedContentRequest";
    IssueResourceOpened[IssueResourceOpened["SameSiteCookieCookie"] = 3] = "SameSiteCookieCookie";
    IssueResourceOpened[IssueResourceOpened["SameSiteCookieRequest"] = 4] = "SameSiteCookieRequest";
    IssueResourceOpened[IssueResourceOpened["HeavyAdElement"] = 5] = "HeavyAdElement";
    IssueResourceOpened[IssueResourceOpened["ContentSecurityPolicyDirective"] = 6] = "ContentSecurityPolicyDirective";
    IssueResourceOpened[IssueResourceOpened["ContentSecurityPolicyElement"] = 7] = "ContentSecurityPolicyElement";
    IssueResourceOpened[IssueResourceOpened["CrossOriginEmbedderPolicyLearnMore"] = 8] = "CrossOriginEmbedderPolicyLearnMore";
    IssueResourceOpened[IssueResourceOpened["MixedContentLearnMore"] = 9] = "MixedContentLearnMore";
    IssueResourceOpened[IssueResourceOpened["SameSiteCookieLearnMore"] = 10] = "SameSiteCookieLearnMore";
    IssueResourceOpened[IssueResourceOpened["HeavyAdLearnMore"] = 11] = "HeavyAdLearnMore";
    IssueResourceOpened[IssueResourceOpened["ContentSecurityPolicyLearnMore"] = 12] = "ContentSecurityPolicyLearnMore";
    IssueResourceOpened[IssueResourceOpened["MaxValue"] = 13] = "MaxValue";
})(IssueResourceOpened || (IssueResourceOpened = {}));
/**
 * This list should contain the currently active issue types,
 * gaps are expected.
 */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var IssueCreated;
(function (IssueCreated) {
    IssueCreated[IssueCreated["MixedContentIssue"] = 0] = "MixedContentIssue";
    IssueCreated[IssueCreated["ContentSecurityPolicyIssue::kInlineViolation"] = 1] = "ContentSecurityPolicyIssue::kInlineViolation";
    IssueCreated[IssueCreated["ContentSecurityPolicyIssue::kEvalViolation"] = 2] = "ContentSecurityPolicyIssue::kEvalViolation";
    IssueCreated[IssueCreated["ContentSecurityPolicyIssue::kURLViolation"] = 3] = "ContentSecurityPolicyIssue::kURLViolation";
    IssueCreated[IssueCreated["ContentSecurityPolicyIssue::kTrustedTypesSinkViolation"] = 4] = "ContentSecurityPolicyIssue::kTrustedTypesSinkViolation";
    IssueCreated[IssueCreated["ContentSecurityPolicyIssue::kTrustedTypesPolicyViolation"] = 5] = "ContentSecurityPolicyIssue::kTrustedTypesPolicyViolation";
    IssueCreated[IssueCreated["HeavyAdIssue::NetworkTotalLimit"] = 6] = "HeavyAdIssue::NetworkTotalLimit";
    IssueCreated[IssueCreated["HeavyAdIssue::CpuTotalLimit"] = 7] = "HeavyAdIssue::CpuTotalLimit";
    IssueCreated[IssueCreated["HeavyAdIssue::CpuPeakLimit"] = 8] = "HeavyAdIssue::CpuPeakLimit";
    IssueCreated[IssueCreated["CrossOriginEmbedderPolicyIssue::CoepFrameResourceNeedsCoepHeader"] = 9] = "CrossOriginEmbedderPolicyIssue::CoepFrameResourceNeedsCoepHeader";
    IssueCreated[IssueCreated["CrossOriginEmbedderPolicyIssue::CoopSandboxedIFrameCannotNavigateToCoopPage"] = 10] = "CrossOriginEmbedderPolicyIssue::CoopSandboxedIFrameCannotNavigateToCoopPage";
    IssueCreated[IssueCreated["CrossOriginEmbedderPolicyIssue::CorpNotSameOrigin"] = 11] = "CrossOriginEmbedderPolicyIssue::CorpNotSameOrigin";
    IssueCreated[IssueCreated["CrossOriginEmbedderPolicyIssue::CorpNotSameOriginAfterDefaultedToSameOriginByCoep"] = 12] = "CrossOriginEmbedderPolicyIssue::CorpNotSameOriginAfterDefaultedToSameOriginByCoep";
    IssueCreated[IssueCreated["CrossOriginEmbedderPolicyIssue::CorpNotSameSite"] = 13] = "CrossOriginEmbedderPolicyIssue::CorpNotSameSite";
    IssueCreated[IssueCreated["CookieIssue::ExcludeSameSiteNoneInsecure::ReadCookie"] = 14] = "CookieIssue::ExcludeSameSiteNoneInsecure::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::ExcludeSameSiteNoneInsecure::SetCookie"] = 15] = "CookieIssue::ExcludeSameSiteNoneInsecure::SetCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteNoneInsecure::ReadCookie"] = 16] = "CookieIssue::WarnSameSiteNoneInsecure::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteNoneInsecure::SetCookie"] = 17] = "CookieIssue::WarnSameSiteNoneInsecure::SetCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Secure"] = 18] = "CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Secure";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Insecure"] = 19] = "CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Insecure";
    IssueCreated[IssueCreated["CookieIssue::WarnCrossDowngrade::ReadCookie::Secure"] = 20] = "CookieIssue::WarnCrossDowngrade::ReadCookie::Secure";
    IssueCreated[IssueCreated["CookieIssue::WarnCrossDowngrade::ReadCookie::Insecure"] = 21] = "CookieIssue::WarnCrossDowngrade::ReadCookie::Insecure";
    IssueCreated[IssueCreated["CookieIssue::WarnCrossDowngrade::SetCookie::Secure"] = 22] = "CookieIssue::WarnCrossDowngrade::SetCookie::Secure";
    IssueCreated[IssueCreated["CookieIssue::WarnCrossDowngrade::SetCookie::Insecure"] = 23] = "CookieIssue::WarnCrossDowngrade::SetCookie::Insecure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeNavigationContextDowngrade::Secure"] = 24] = "CookieIssue::ExcludeNavigationContextDowngrade::Secure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeNavigationContextDowngrade::Insecure"] = 25] = "CookieIssue::ExcludeNavigationContextDowngrade::Insecure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeContextDowngrade::ReadCookie::Secure"] = 26] = "CookieIssue::ExcludeContextDowngrade::ReadCookie::Secure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeContextDowngrade::ReadCookie::Insecure"] = 27] = "CookieIssue::ExcludeContextDowngrade::ReadCookie::Insecure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeContextDowngrade::SetCookie::Secure"] = 28] = "CookieIssue::ExcludeContextDowngrade::SetCookie::Secure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeContextDowngrade::SetCookie::Insecure"] = 29] = "CookieIssue::ExcludeContextDowngrade::SetCookie::Insecure";
    IssueCreated[IssueCreated["CookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::ReadCookie"] = 30] = "CookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::SetCookie"] = 31] = "CookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::SetCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::ReadCookie"] = 32] = "CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::SetCookie"] = 33] = "CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::SetCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::ReadCookie"] = 34] = "CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::SetCookie"] = 35] = "CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::SetCookie";
    IssueCreated[IssueCreated["SharedArrayBufferIssue::TransferIssue"] = 36] = "SharedArrayBufferIssue::TransferIssue";
    IssueCreated[IssueCreated["SharedArrayBufferIssue::CreationIssue"] = 37] = "SharedArrayBufferIssue::CreationIssue";
    IssueCreated[IssueCreated["LowTextContrastIssue"] = 41] = "LowTextContrastIssue";
    IssueCreated[IssueCreated["CorsIssue::InsecurePrivateNetwork"] = 42] = "CorsIssue::InsecurePrivateNetwork";
    IssueCreated[IssueCreated["CorsIssue::InvalidHeaders"] = 44] = "CorsIssue::InvalidHeaders";
    IssueCreated[IssueCreated["CorsIssue::WildcardOriginWithCredentials"] = 45] = "CorsIssue::WildcardOriginWithCredentials";
    IssueCreated[IssueCreated["CorsIssue::PreflightResponseInvalid"] = 46] = "CorsIssue::PreflightResponseInvalid";
    IssueCreated[IssueCreated["CorsIssue::OriginMismatch"] = 47] = "CorsIssue::OriginMismatch";
    IssueCreated[IssueCreated["CorsIssue::AllowCredentialsRequired"] = 48] = "CorsIssue::AllowCredentialsRequired";
    IssueCreated[IssueCreated["CorsIssue::MethodDisallowedByPreflightResponse"] = 49] = "CorsIssue::MethodDisallowedByPreflightResponse";
    IssueCreated[IssueCreated["CorsIssue::HeaderDisallowedByPreflightResponse"] = 50] = "CorsIssue::HeaderDisallowedByPreflightResponse";
    IssueCreated[IssueCreated["CorsIssue::RedirectContainsCredentials"] = 51] = "CorsIssue::RedirectContainsCredentials";
    IssueCreated[IssueCreated["CorsIssue::DisallowedByMode"] = 52] = "CorsIssue::DisallowedByMode";
    IssueCreated[IssueCreated["CorsIssue::CorsDisabledScheme"] = 53] = "CorsIssue::CorsDisabledScheme";
    IssueCreated[IssueCreated["CorsIssue::PreflightMissingAllowExternal"] = 54] = "CorsIssue::PreflightMissingAllowExternal";
    IssueCreated[IssueCreated["CorsIssue::PreflightInvalidAllowExternal"] = 55] = "CorsIssue::PreflightInvalidAllowExternal";
    IssueCreated[IssueCreated["CorsIssue::NoCorsRedirectModeNotFollow"] = 57] = "CorsIssue::NoCorsRedirectModeNotFollow";
    IssueCreated[IssueCreated["QuirksModeIssue::QuirksMode"] = 58] = "QuirksModeIssue::QuirksMode";
    IssueCreated[IssueCreated["QuirksModeIssue::LimitedQuirksMode"] = 59] = "QuirksModeIssue::LimitedQuirksMode";
    IssueCreated[IssueCreated["DeprecationIssue"] = 60] = "DeprecationIssue";
    IssueCreated[IssueCreated["ClientHintIssue::MetaTagAllowListInvalidOrigin"] = 61] = "ClientHintIssue::MetaTagAllowListInvalidOrigin";
    IssueCreated[IssueCreated["ClientHintIssue::MetaTagModifiedHTML"] = 62] = "ClientHintIssue::MetaTagModifiedHTML";
    IssueCreated[IssueCreated["CorsIssue::PreflightAllowPrivateNetworkError"] = 63] = "CorsIssue::PreflightAllowPrivateNetworkError";
    IssueCreated[IssueCreated["GenericIssue::CrossOriginPortalPostMessageError"] = 64] = "GenericIssue::CrossOriginPortalPostMessageError";
    IssueCreated[IssueCreated["GenericIssue::FormLabelForNameError"] = 65] = "GenericIssue::FormLabelForNameError";
    IssueCreated[IssueCreated["GenericIssue::FormDuplicateIdForInputError"] = 66] = "GenericIssue::FormDuplicateIdForInputError";
    IssueCreated[IssueCreated["GenericIssue::FormInputWithNoLabelError"] = 67] = "GenericIssue::FormInputWithNoLabelError";
    IssueCreated[IssueCreated["GenericIssue::FormAutocompleteAttributeEmptyError"] = 68] = "GenericIssue::FormAutocompleteAttributeEmptyError";
    IssueCreated[IssueCreated["GenericIssue::FormEmptyIdAndNameAttributesForInputError"] = 69] = "GenericIssue::FormEmptyIdAndNameAttributesForInputError";
    IssueCreated[IssueCreated["GenericIssue::FormAriaLabelledByToNonExistingId"] = 70] = "GenericIssue::FormAriaLabelledByToNonExistingId";
    IssueCreated[IssueCreated["GenericIssue::FormInputAssignedAutocompleteValueToIdOrNameAttributeError"] = 71] = "GenericIssue::FormInputAssignedAutocompleteValueToIdOrNameAttributeError";
    IssueCreated[IssueCreated["GenericIssue::FormLabelHasNeitherForNorNestedInput"] = 72] = "GenericIssue::FormLabelHasNeitherForNorNestedInput";
    IssueCreated[IssueCreated["GenericIssue::FormLabelForMatchesNonExistingIdError"] = 73] = "GenericIssue::FormLabelForMatchesNonExistingIdError";
    IssueCreated[IssueCreated["GenericIssue::FormHasPasswordFieldWithoutUsernameFieldError"] = 74] = "GenericIssue::FormHasPasswordFieldWithoutUsernameFieldError";
    IssueCreated[IssueCreated["GenericIssue::FormInputHasWrongButWellIntendedAutocompleteValueError"] = 75] = "GenericIssue::FormInputHasWrongButWellIntendedAutocompleteValueError";
    IssueCreated[IssueCreated["StylesheetLoadingIssue::LateImportRule"] = 76] = "StylesheetLoadingIssue::LateImportRule";
    IssueCreated[IssueCreated["StylesheetLoadingIssue::RequestFailed"] = 77] = "StylesheetLoadingIssue::RequestFailed";
    IssueCreated[IssueCreated["CorsIssue::PreflightMissingPrivateNetworkAccessId"] = 78] = "CorsIssue::PreflightMissingPrivateNetworkAccessId";
    IssueCreated[IssueCreated["CorsIssue::PreflightMissingPrivateNetworkAccessName"] = 79] = "CorsIssue::PreflightMissingPrivateNetworkAccessName";
    IssueCreated[IssueCreated["CorsIssue::PrivateNetworkAccessPermissionUnavailable"] = 80] = "CorsIssue::PrivateNetworkAccessPermissionUnavailable";
    IssueCreated[IssueCreated["CorsIssue::PrivateNetworkAccessPermissionDenied"] = 81] = "CorsIssue::PrivateNetworkAccessPermissionDenied";
    IssueCreated[IssueCreated["CookieIssue::WarnThirdPartyPhaseout::ReadCookie"] = 82] = "CookieIssue::WarnThirdPartyPhaseout::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::WarnThirdPartyPhaseout::SetCookie"] = 83] = "CookieIssue::WarnThirdPartyPhaseout::SetCookie";
    IssueCreated[IssueCreated["CookieIssue::ExcludeThirdPartyPhaseout::ReadCookie"] = 84] = "CookieIssue::ExcludeThirdPartyPhaseout::ReadCookie";
    IssueCreated[IssueCreated["CookieIssue::ExcludeThirdPartyPhaseout::SetCookie"] = 85] = "CookieIssue::ExcludeThirdPartyPhaseout::SetCookie";
    IssueCreated[IssueCreated["MaxValue"] = 86] = "MaxValue";
})(IssueCreated || (IssueCreated = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var DeveloperResourceLoaded;
(function (DeveloperResourceLoaded) {
    DeveloperResourceLoaded[DeveloperResourceLoaded["LoadThroughPageViaTarget"] = 0] = "LoadThroughPageViaTarget";
    DeveloperResourceLoaded[DeveloperResourceLoaded["LoadThroughPageViaFrame"] = 1] = "LoadThroughPageViaFrame";
    DeveloperResourceLoaded[DeveloperResourceLoaded["LoadThroughPageFailure"] = 2] = "LoadThroughPageFailure";
    DeveloperResourceLoaded[DeveloperResourceLoaded["LoadThroughPageFallback"] = 3] = "LoadThroughPageFallback";
    DeveloperResourceLoaded[DeveloperResourceLoaded["FallbackAfterFailure"] = 4] = "FallbackAfterFailure";
    DeveloperResourceLoaded[DeveloperResourceLoaded["FallbackPerOverride"] = 5] = "FallbackPerOverride";
    DeveloperResourceLoaded[DeveloperResourceLoaded["FallbackPerProtocol"] = 6] = "FallbackPerProtocol";
    DeveloperResourceLoaded[DeveloperResourceLoaded["FallbackFailure"] = 7] = "FallbackFailure";
    DeveloperResourceLoaded[DeveloperResourceLoaded["MaxValue"] = 8] = "MaxValue";
})(DeveloperResourceLoaded || (DeveloperResourceLoaded = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var DeveloperResourceScheme;
(function (DeveloperResourceScheme) {
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeOther"] = 0] = "SchemeOther";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeUnknown"] = 1] = "SchemeUnknown";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeHttp"] = 2] = "SchemeHttp";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeHttps"] = 3] = "SchemeHttps";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeHttpLocalhost"] = 4] = "SchemeHttpLocalhost";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeHttpsLocalhost"] = 5] = "SchemeHttpsLocalhost";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeData"] = 6] = "SchemeData";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeFile"] = 7] = "SchemeFile";
    DeveloperResourceScheme[DeveloperResourceScheme["SchemeBlob"] = 8] = "SchemeBlob";
    DeveloperResourceScheme[DeveloperResourceScheme["MaxValue"] = 9] = "MaxValue";
})(DeveloperResourceScheme || (DeveloperResourceScheme = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var ResourceType;
(function (ResourceType) {
    /* eslint-disable @typescript-eslint/naming-convention */
    ResourceType[ResourceType["all"] = 0] = "all";
    /* eslint-enable @typescript-eslint/naming-convention */
    ResourceType[ResourceType["Documents"] = 1] = "Documents";
    ResourceType[ResourceType["Scripts"] = 2] = "Scripts";
    ResourceType[ResourceType["XHR and Fetch"] = 3] = "XHR and Fetch";
    ResourceType[ResourceType["Stylesheets"] = 4] = "Stylesheets";
    ResourceType[ResourceType["Fonts"] = 5] = "Fonts";
    ResourceType[ResourceType["Images"] = 6] = "Images";
    ResourceType[ResourceType["Media"] = 7] = "Media";
    ResourceType[ResourceType["Manifest"] = 8] = "Manifest";
    ResourceType[ResourceType["WebSockets"] = 9] = "WebSockets";
    ResourceType[ResourceType["WebAssembly"] = 10] = "WebAssembly";
    ResourceType[ResourceType["Other"] = 11] = "Other";
    ResourceType[ResourceType["MaxValue"] = 12] = "MaxValue";
})(ResourceType || (ResourceType = {}));
// TODO(crbug.com/1167717): Make this a const enum again
/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line rulesdir/const_enum
export var NetworkPanelMoreFilters;
(function (NetworkPanelMoreFilters) {
    NetworkPanelMoreFilters[NetworkPanelMoreFilters["Hide data URLs"] = 0] = "Hide data URLs";
    NetworkPanelMoreFilters[NetworkPanelMoreFilters["Hide extension URLs"] = 1] = "Hide extension URLs";
    NetworkPanelMoreFilters[NetworkPanelMoreFilters["Blocked response cookies"] = 2] = "Blocked response cookies";
    NetworkPanelMoreFilters[NetworkPanelMoreFilters["Blocked requests"] = 3] = "Blocked requests";
    NetworkPanelMoreFilters[NetworkPanelMoreFilters["3rd-party requests"] = 4] = "3rd-party requests";
    NetworkPanelMoreFilters[NetworkPanelMoreFilters["MaxValue"] = 5] = "MaxValue";
})(NetworkPanelMoreFilters || (NetworkPanelMoreFilters = {}));
/* eslint-enable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var LinearMemoryInspectorRevealedFrom;
(function (LinearMemoryInspectorRevealedFrom) {
    LinearMemoryInspectorRevealedFrom[LinearMemoryInspectorRevealedFrom["ContextMenu"] = 0] = "ContextMenu";
    LinearMemoryInspectorRevealedFrom[LinearMemoryInspectorRevealedFrom["MemoryIcon"] = 1] = "MemoryIcon";
    LinearMemoryInspectorRevealedFrom[LinearMemoryInspectorRevealedFrom["MaxValue"] = 2] = "MaxValue";
})(LinearMemoryInspectorRevealedFrom || (LinearMemoryInspectorRevealedFrom = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var LinearMemoryInspectorTarget;
(function (LinearMemoryInspectorTarget) {
    LinearMemoryInspectorTarget[LinearMemoryInspectorTarget["DWARFInspectableAddress"] = 0] = "DWARFInspectableAddress";
    LinearMemoryInspectorTarget[LinearMemoryInspectorTarget["ArrayBuffer"] = 1] = "ArrayBuffer";
    LinearMemoryInspectorTarget[LinearMemoryInspectorTarget["DataView"] = 2] = "DataView";
    LinearMemoryInspectorTarget[LinearMemoryInspectorTarget["TypedArray"] = 3] = "TypedArray";
    LinearMemoryInspectorTarget[LinearMemoryInspectorTarget["WebAssemblyMemory"] = 4] = "WebAssemblyMemory";
    LinearMemoryInspectorTarget[LinearMemoryInspectorTarget["MaxValue"] = 5] = "MaxValue";
})(LinearMemoryInspectorTarget || (LinearMemoryInspectorTarget = {}));
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717) = Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Language;
(function (Language) {
    Language[Language["af"] = 1] = "af";
    Language[Language["am"] = 2] = "am";
    Language[Language["ar"] = 3] = "ar";
    Language[Language["as"] = 4] = "as";
    Language[Language["az"] = 5] = "az";
    Language[Language["be"] = 6] = "be";
    Language[Language["bg"] = 7] = "bg";
    Language[Language["bn"] = 8] = "bn";
    Language[Language["bs"] = 9] = "bs";
    Language[Language["ca"] = 10] = "ca";
    Language[Language["cs"] = 11] = "cs";
    Language[Language["cy"] = 12] = "cy";
    Language[Language["da"] = 13] = "da";
    Language[Language["de"] = 14] = "de";
    Language[Language["el"] = 15] = "el";
    Language[Language["en-GB"] = 16] = "en-GB";
    Language[Language["en-US"] = 17] = "en-US";
    Language[Language["es-419"] = 18] = "es-419";
    Language[Language["es"] = 19] = "es";
    Language[Language["et"] = 20] = "et";
    Language[Language["eu"] = 21] = "eu";
    Language[Language["fa"] = 22] = "fa";
    Language[Language["fi"] = 23] = "fi";
    Language[Language["fil"] = 24] = "fil";
    Language[Language["fr-CA"] = 25] = "fr-CA";
    Language[Language["fr"] = 26] = "fr";
    Language[Language["gl"] = 27] = "gl";
    Language[Language["gu"] = 28] = "gu";
    Language[Language["he"] = 29] = "he";
    Language[Language["hi"] = 30] = "hi";
    Language[Language["hr"] = 31] = "hr";
    Language[Language["hu"] = 32] = "hu";
    Language[Language["hy"] = 33] = "hy";
    Language[Language["id"] = 34] = "id";
    Language[Language["is"] = 35] = "is";
    Language[Language["it"] = 36] = "it";
    Language[Language["ja"] = 37] = "ja";
    Language[Language["ka"] = 38] = "ka";
    Language[Language["kk"] = 39] = "kk";
    Language[Language["km"] = 40] = "km";
    Language[Language["kn"] = 41] = "kn";
    Language[Language["ko"] = 42] = "ko";
    Language[Language["ky"] = 43] = "ky";
    Language[Language["lo"] = 44] = "lo";
    Language[Language["lt"] = 45] = "lt";
    Language[Language["lv"] = 46] = "lv";
    Language[Language["mk"] = 47] = "mk";
    Language[Language["ml"] = 48] = "ml";
    Language[Language["mn"] = 49] = "mn";
    Language[Language["mr"] = 50] = "mr";
    Language[Language["ms"] = 51] = "ms";
    Language[Language["my"] = 52] = "my";
    Language[Language["ne"] = 53] = "ne";
    Language[Language["nl"] = 54] = "nl";
    Language[Language["no"] = 55] = "no";
    Language[Language["or"] = 56] = "or";
    Language[Language["pa"] = 57] = "pa";
    Language[Language["pl"] = 58] = "pl";
    Language[Language["pt-PT"] = 59] = "pt-PT";
    Language[Language["pt"] = 60] = "pt";
    Language[Language["ro"] = 61] = "ro";
    Language[Language["ru"] = 62] = "ru";
    Language[Language["si"] = 63] = "si";
    Language[Language["sk"] = 64] = "sk";
    Language[Language["sl"] = 65] = "sl";
    Language[Language["sq"] = 66] = "sq";
    Language[Language["sr-Latn"] = 67] = "sr-Latn";
    Language[Language["sr"] = 68] = "sr";
    Language[Language["sv"] = 69] = "sv";
    Language[Language["sw"] = 70] = "sw";
    Language[Language["ta"] = 71] = "ta";
    Language[Language["te"] = 72] = "te";
    Language[Language["th"] = 73] = "th";
    Language[Language["tr"] = 74] = "tr";
    Language[Language["uk"] = 75] = "uk";
    Language[Language["ur"] = 76] = "ur";
    Language[Language["uz"] = 77] = "uz";
    Language[Language["vi"] = 78] = "vi";
    Language[Language["zh"] = 79] = "zh";
    Language[Language["zh-HK"] = 80] = "zh-HK";
    Language[Language["zh-TW"] = 81] = "zh-TW";
    Language[Language["zu"] = 82] = "zu";
    Language[Language["MaxValue"] = 83] = "MaxValue";
})(Language || (Language = {}));
/* eslint-enable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var SyncSetting;
(function (SyncSetting) {
    SyncSetting[SyncSetting["ChromeSyncDisabled"] = 1] = "ChromeSyncDisabled";
    SyncSetting[SyncSetting["ChromeSyncSettingsDisabled"] = 2] = "ChromeSyncSettingsDisabled";
    SyncSetting[SyncSetting["DevToolsSyncSettingDisabled"] = 3] = "DevToolsSyncSettingDisabled";
    SyncSetting[SyncSetting["DevToolsSyncSettingEnabled"] = 4] = "DevToolsSyncSettingEnabled";
    SyncSetting[SyncSetting["MaxValue"] = 5] = "MaxValue";
})(SyncSetting || (SyncSetting = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingToggled;
(function (RecordingToggled) {
    RecordingToggled[RecordingToggled["RecordingStarted"] = 1] = "RecordingStarted";
    RecordingToggled[RecordingToggled["RecordingFinished"] = 2] = "RecordingFinished";
    RecordingToggled[RecordingToggled["MaxValue"] = 3] = "MaxValue";
})(RecordingToggled || (RecordingToggled = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingAssertion;
(function (RecordingAssertion) {
    RecordingAssertion[RecordingAssertion["AssertionAdded"] = 1] = "AssertionAdded";
    RecordingAssertion[RecordingAssertion["PropertyAssertionEdited"] = 2] = "PropertyAssertionEdited";
    RecordingAssertion[RecordingAssertion["AttributeAssertionEdited"] = 3] = "AttributeAssertionEdited";
    RecordingAssertion[RecordingAssertion["MaxValue"] = 4] = "MaxValue";
})(RecordingAssertion || (RecordingAssertion = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingReplayFinished;
(function (RecordingReplayFinished) {
    RecordingReplayFinished[RecordingReplayFinished["Success"] = 1] = "Success";
    RecordingReplayFinished[RecordingReplayFinished["TimeoutErrorSelectors"] = 2] = "TimeoutErrorSelectors";
    RecordingReplayFinished[RecordingReplayFinished["TimeoutErrorTarget"] = 3] = "TimeoutErrorTarget";
    RecordingReplayFinished[RecordingReplayFinished["OtherError"] = 4] = "OtherError";
    RecordingReplayFinished[RecordingReplayFinished["MaxValue"] = 5] = "MaxValue";
})(RecordingReplayFinished || (RecordingReplayFinished = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingReplaySpeed;
(function (RecordingReplaySpeed) {
    RecordingReplaySpeed[RecordingReplaySpeed["Normal"] = 1] = "Normal";
    RecordingReplaySpeed[RecordingReplaySpeed["Slow"] = 2] = "Slow";
    RecordingReplaySpeed[RecordingReplaySpeed["VerySlow"] = 3] = "VerySlow";
    RecordingReplaySpeed[RecordingReplaySpeed["ExtremelySlow"] = 4] = "ExtremelySlow";
    RecordingReplaySpeed[RecordingReplaySpeed["MaxValue"] = 5] = "MaxValue";
})(RecordingReplaySpeed || (RecordingReplaySpeed = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingReplayStarted;
(function (RecordingReplayStarted) {
    RecordingReplayStarted[RecordingReplayStarted["ReplayOnly"] = 1] = "ReplayOnly";
    RecordingReplayStarted[RecordingReplayStarted["ReplayWithPerformanceTracing"] = 2] = "ReplayWithPerformanceTracing";
    RecordingReplayStarted[RecordingReplayStarted["ReplayViaExtension"] = 3] = "ReplayViaExtension";
    RecordingReplayStarted[RecordingReplayStarted["MaxValue"] = 4] = "MaxValue";
})(RecordingReplayStarted || (RecordingReplayStarted = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingEdited;
(function (RecordingEdited) {
    RecordingEdited[RecordingEdited["SelectorPickerUsed"] = 1] = "SelectorPickerUsed";
    RecordingEdited[RecordingEdited["StepAdded"] = 2] = "StepAdded";
    RecordingEdited[RecordingEdited["StepRemoved"] = 3] = "StepRemoved";
    RecordingEdited[RecordingEdited["SelectorAdded"] = 4] = "SelectorAdded";
    RecordingEdited[RecordingEdited["SelectorRemoved"] = 5] = "SelectorRemoved";
    RecordingEdited[RecordingEdited["SelectorPartAdded"] = 6] = "SelectorPartAdded";
    RecordingEdited[RecordingEdited["SelectorPartEdited"] = 7] = "SelectorPartEdited";
    RecordingEdited[RecordingEdited["SelectorPartRemoved"] = 8] = "SelectorPartRemoved";
    RecordingEdited[RecordingEdited["TypeChanged"] = 9] = "TypeChanged";
    RecordingEdited[RecordingEdited["OtherEditing"] = 10] = "OtherEditing";
    RecordingEdited[RecordingEdited["MaxValue"] = 11] = "MaxValue";
})(RecordingEdited || (RecordingEdited = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingExported;
(function (RecordingExported) {
    RecordingExported[RecordingExported["ToPuppeteer"] = 1] = "ToPuppeteer";
    RecordingExported[RecordingExported["ToJSON"] = 2] = "ToJSON";
    RecordingExported[RecordingExported["ToPuppeteerReplay"] = 3] = "ToPuppeteerReplay";
    RecordingExported[RecordingExported["ToExtension"] = 4] = "ToExtension";
    RecordingExported[RecordingExported["ToLighthouse"] = 5] = "ToLighthouse";
    RecordingExported[RecordingExported["MaxValue"] = 6] = "MaxValue";
})(RecordingExported || (RecordingExported = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingCodeToggled;
(function (RecordingCodeToggled) {
    RecordingCodeToggled[RecordingCodeToggled["CodeShown"] = 1] = "CodeShown";
    RecordingCodeToggled[RecordingCodeToggled["CodeHidden"] = 2] = "CodeHidden";
    RecordingCodeToggled[RecordingCodeToggled["MaxValue"] = 3] = "MaxValue";
})(RecordingCodeToggled || (RecordingCodeToggled = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordingCopiedToClipboard;
(function (RecordingCopiedToClipboard) {
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedRecordingWithPuppeteer"] = 1] = "CopiedRecordingWithPuppeteer";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedRecordingWithJSON"] = 2] = "CopiedRecordingWithJSON";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedRecordingWithReplay"] = 3] = "CopiedRecordingWithReplay";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedRecordingWithExtension"] = 4] = "CopiedRecordingWithExtension";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedStepWithPuppeteer"] = 5] = "CopiedStepWithPuppeteer";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedStepWithJSON"] = 6] = "CopiedStepWithJSON";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedStepWithReplay"] = 7] = "CopiedStepWithReplay";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["CopiedStepWithExtension"] = 8] = "CopiedStepWithExtension";
    RecordingCopiedToClipboard[RecordingCopiedToClipboard["MaxValue"] = 9] = "MaxValue";
})(RecordingCopiedToClipboard || (RecordingCopiedToClipboard = {}));
/* eslint-disable @typescript-eslint/naming-convention */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var ConsoleShowsCorsErrors;
(function (ConsoleShowsCorsErrors) {
    ConsoleShowsCorsErrors[ConsoleShowsCorsErrors["false"] = 0] = "false";
    ConsoleShowsCorsErrors[ConsoleShowsCorsErrors["true"] = 1] = "true";
    ConsoleShowsCorsErrors[ConsoleShowsCorsErrors["MaxValue"] = 2] = "MaxValue";
})(ConsoleShowsCorsErrors || (ConsoleShowsCorsErrors = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var StyleTextCopied;
(function (StyleTextCopied) {
    StyleTextCopied[StyleTextCopied["DeclarationViaChangedLine"] = 1] = "DeclarationViaChangedLine";
    StyleTextCopied[StyleTextCopied["AllChangesViaStylesPane"] = 2] = "AllChangesViaStylesPane";
    StyleTextCopied[StyleTextCopied["DeclarationViaContextMenu"] = 3] = "DeclarationViaContextMenu";
    StyleTextCopied[StyleTextCopied["PropertyViaContextMenu"] = 4] = "PropertyViaContextMenu";
    StyleTextCopied[StyleTextCopied["ValueViaContextMenu"] = 5] = "ValueViaContextMenu";
    StyleTextCopied[StyleTextCopied["DeclarationAsJSViaContextMenu"] = 6] = "DeclarationAsJSViaContextMenu";
    StyleTextCopied[StyleTextCopied["RuleViaContextMenu"] = 7] = "RuleViaContextMenu";
    StyleTextCopied[StyleTextCopied["AllDeclarationsViaContextMenu"] = 8] = "AllDeclarationsViaContextMenu";
    StyleTextCopied[StyleTextCopied["AllDeclarationsAsJSViaContextMenu"] = 9] = "AllDeclarationsAsJSViaContextMenu";
    StyleTextCopied[StyleTextCopied["SelectorViaContextMenu"] = 10] = "SelectorViaContextMenu";
    StyleTextCopied[StyleTextCopied["MaxValue"] = 11] = "MaxValue";
})(StyleTextCopied || (StyleTextCopied = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var ManifestSectionCodes;
(function (ManifestSectionCodes) {
    ManifestSectionCodes[ManifestSectionCodes["OtherSection"] = 0] = "OtherSection";
    ManifestSectionCodes[ManifestSectionCodes["Identity"] = 1] = "Identity";
    ManifestSectionCodes[ManifestSectionCodes["Presentation"] = 2] = "Presentation";
    ManifestSectionCodes[ManifestSectionCodes["Protocol Handlers"] = 3] = "Protocol Handlers";
    ManifestSectionCodes[ManifestSectionCodes["Icons"] = 4] = "Icons";
    ManifestSectionCodes[ManifestSectionCodes["Window Controls Overlay"] = 5] = "Window Controls Overlay";
    ManifestSectionCodes[ManifestSectionCodes["MaxValue"] = 6] = "MaxValue";
})(ManifestSectionCodes || (ManifestSectionCodes = {}));
// The names here match the CSSRuleValidator names in CSSRuleValidator.ts.
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var CSSHintType;
(function (CSSHintType) {
    CSSHintType[CSSHintType["Other"] = 0] = "Other";
    CSSHintType[CSSHintType["AlignContent"] = 1] = "AlignContent";
    CSSHintType[CSSHintType["FlexItem"] = 2] = "FlexItem";
    CSSHintType[CSSHintType["FlexContainer"] = 3] = "FlexContainer";
    CSSHintType[CSSHintType["GridContainer"] = 4] = "GridContainer";
    CSSHintType[CSSHintType["GridItem"] = 5] = "GridItem";
    CSSHintType[CSSHintType["FlexGrid"] = 6] = "FlexGrid";
    CSSHintType[CSSHintType["MulticolFlexGrid"] = 7] = "MulticolFlexGrid";
    CSSHintType[CSSHintType["Padding"] = 8] = "Padding";
    CSSHintType[CSSHintType["Position"] = 9] = "Position";
    CSSHintType[CSSHintType["ZIndex"] = 10] = "ZIndex";
    CSSHintType[CSSHintType["Sizing"] = 11] = "Sizing";
    CSSHintType[CSSHintType["FlexOrGridItem"] = 12] = "FlexOrGridItem";
    CSSHintType[CSSHintType["FontVariationSettings"] = 13] = "FontVariationSettings";
    CSSHintType[CSSHintType["MaxValue"] = 14] = "MaxValue";
})(CSSHintType || (CSSHintType = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var LighthouseModeRun;
(function (LighthouseModeRun) {
    LighthouseModeRun[LighthouseModeRun["Navigation"] = 0] = "Navigation";
    LighthouseModeRun[LighthouseModeRun["Timespan"] = 1] = "Timespan";
    LighthouseModeRun[LighthouseModeRun["Snapshot"] = 2] = "Snapshot";
    LighthouseModeRun[LighthouseModeRun["LegacyNavigation"] = 3] = "LegacyNavigation";
    LighthouseModeRun[LighthouseModeRun["MaxValue"] = 4] = "MaxValue";
})(LighthouseModeRun || (LighthouseModeRun = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var LighthouseCategoryUsed;
(function (LighthouseCategoryUsed) {
    LighthouseCategoryUsed[LighthouseCategoryUsed["Performance"] = 0] = "Performance";
    LighthouseCategoryUsed[LighthouseCategoryUsed["Accessibility"] = 1] = "Accessibility";
    LighthouseCategoryUsed[LighthouseCategoryUsed["BestPractices"] = 2] = "BestPractices";
    LighthouseCategoryUsed[LighthouseCategoryUsed["SEO"] = 3] = "SEO";
    LighthouseCategoryUsed[LighthouseCategoryUsed["PWA"] = 4] = "PWA";
    LighthouseCategoryUsed[LighthouseCategoryUsed["PubAds"] = 5] = "PubAds";
    LighthouseCategoryUsed[LighthouseCategoryUsed["MaxValue"] = 6] = "MaxValue";
})(LighthouseCategoryUsed || (LighthouseCategoryUsed = {}));
//# sourceMappingURL=UserMetrics.js.map