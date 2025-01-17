// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import * as UI from '../../ui/legacy/legacy.js';
let loadedChangesModule;
const UIStrings = {
    /**
     * @description Title of the 'Changes' tool in the bottom drawer
     */
    changes: 'Changes',
    /**
     * @description Command for showing the 'Changes' tool in the bottom drawer
     */
    showChanges: 'Show Changes',
    /**
     *@description Title for action in the Changes tool that reverts all changes to the currently open file.
     */
    revertAllChangesToCurrentFile: 'Revert all changes to current file',
    /**
     *@description Title for action in the Changes tool that copies all changes from the currently open file.
     */
    copyAllChangesFromCurrentFile: 'Copy all changes from current file',
};
const str_ = i18n.i18n.registerUIStrings('panels/changes/changes-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
async function loadChangesModule() {
    if (!loadedChangesModule) {
        loadedChangesModule = await import('./changes.js');
    }
    return loadedChangesModule;
}
function maybeRetrieveContextTypes(getClassCallBack) {
    if (loadedChangesModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedChangesModule);
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* UI.ViewManager.ViewLocationValues.DRAWER_VIEW */,
    id: 'changes.changes',
    title: i18nLazyString(UIStrings.changes),
    commandPrompt: i18nLazyString(UIStrings.showChanges),
    persistence: "closeable" /* UI.ViewManager.ViewPersistence.CLOSEABLE */,
    async loadView() {
        const Changes = await loadChangesModule();
        return Changes.ChangesView.ChangesView.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'changes.revert',
    category: UI.ActionRegistration.ActionCategory.CHANGES,
    title: i18nLazyString(UIStrings.revertAllChangesToCurrentFile),
    iconClass: "undo" /* UI.ActionRegistration.IconClass.UNDO */,
    async loadActionDelegate() {
        const Changes = await loadChangesModule();
        return new Changes.ChangesView.ActionDelegate();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Changes => [Changes.ChangesView.ChangesView]);
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'changes.copy',
    category: UI.ActionRegistration.ActionCategory.CHANGES,
    title: i18nLazyString(UIStrings.copyAllChangesFromCurrentFile),
    iconClass: "copy" /* UI.ActionRegistration.IconClass.COPY */,
    async loadActionDelegate() {
        const Changes = await loadChangesModule();
        return new Changes.ChangesView.ActionDelegate();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Changes => [Changes.ChangesView.ChangesView]);
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            WorkspaceDiff.WorkspaceDiff.DiffUILocation,
        ];
    },
    destination: Common.Revealer.RevealerDestination.CHANGES_DRAWER,
    async loadRevealer() {
        const Changes = await loadChangesModule();
        return new Changes.ChangesView.DiffUILocationRevealer();
    },
});
//# sourceMappingURL=changes-meta.js.map