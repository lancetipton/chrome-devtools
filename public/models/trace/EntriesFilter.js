// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as Helpers from './helpers/helpers.js';
import * as Types from './types/types.js';
const filterApplyActionSet = new Set([
    "MERGE_FUNCTION" /* FilterApplyAction.MERGE_FUNCTION */,
    "COLLAPSE_FUNCTION" /* FilterApplyAction.COLLAPSE_FUNCTION */,
    "COLLAPSE_REPEATING_DESCENDANTS" /* FilterApplyAction.COLLAPSE_REPEATING_DESCENDANTS */,
]);
const filterUndoActionSet = new Set([
    "UNDO_ALL_ACTIONS" /* FilterUndoAction.UNDO_ALL_ACTIONS */,
    "UNDO_COLLAPSE_FUNCTION" /* FilterUndoAction.UNDO_COLLAPSE_FUNCTION */,
    "UNDO_COLLAPSE_REPEATING_DESCENDANTS" /* FilterUndoAction.UNDO_COLLAPSE_REPEATING_DESCENDANTS */,
]);
const actionToUndoActionMap = new Map([
    ["UNDO_COLLAPSE_FUNCTION" /* FilterUndoAction.UNDO_COLLAPSE_FUNCTION */, "COLLAPSE_FUNCTION" /* FilterApplyAction.COLLAPSE_FUNCTION */],
    ["UNDO_COLLAPSE_REPEATING_DESCENDANTS" /* FilterUndoAction.UNDO_COLLAPSE_REPEATING_DESCENDANTS */, "COLLAPSE_REPEATING_DESCENDANTS" /* FilterApplyAction.COLLAPSE_REPEATING_DESCENDANTS */],
]);
/**
 * This class can take in a thread that has been generated by the
 * RendererHandler and apply certain actions to it in order to modify what is
 * shown to the user. These actions can be automatically applied by DevTools or
 * applied by the user.
 *
 * Once actions are applied, the invisibleEntries() method will return the
 * entries that are invisible, and this is the list of entries that should be
 * removed before rendering the resulting thread on the timeline.
 **/
export class EntriesFilter {
    // Maps from an individual TraceEvent entry to its representation as a
    // RendererEntryNode. We need this so we can then parse the tree structure
    // generated by the RendererHandler.
    #entryToNode;
    // Track the last calculated set of invisible entries. This means we can avoid
    // re-generating this if the set of actions that have been applied has not
    // changed.
    #lastInvisibleEntries = null;
    #activeActions = [];
    // List of entries whose children are modified. This list is used to
    // keep track of entries that should be identified in the UI as modified.
    #modifiedVisibleEntries = [];
    constructor(entryToNode) {
        this.#entryToNode = entryToNode;
    }
    /**
     * Adds or removes an action (filter) to/from activeActions
     * array depending on the type of action.
     **/
    applyAction(action) {
        if ( /* FilterApplyActions */this.isUserApplyFilterAction(action)) {
            this.#modifiedVisibleEntries.push(action.entry);
            if (this.#actionIsActive(action)) {
                // If the action is already active there is no reason to apply it again.
                return;
            }
            this.#activeActions.push(action);
        }
        else if ( /* FilterUndoActions */this.isFilterUndoAction(action.type)) {
            const entryIndex = this.#modifiedVisibleEntries.indexOf(action.entry);
            this.#modifiedVisibleEntries.splice(entryIndex);
            this.#applyUndoAction(action.type, action.entry);
        }
        // Clear the last list of invisible entries - this invalidates the cache and
        // ensures that the invisible list will be recalculated, which we have to do
        // now we have changed the list of actions.
        this.#lastInvisibleEntries = null;
    }
    /**
     * If undo action is UNDO_ALL_ACTIONS, assign activeActions array to an empty one.
     * Otherwise, get the action to remove from actionToUndoActionMap and remove it form the activeActions array.
     * Afterwards, the FlameChart will be rerendered and activeActions will be reaplied without the removed action.
     * **/
    #applyUndoAction(action, entry) {
        switch (action) {
            case "UNDO_ALL_ACTIONS" /* FilterUndoAction.UNDO_ALL_ACTIONS */: {
                this.#activeActions = [];
                this.#modifiedVisibleEntries = [];
                break;
            }
            default: {
                const actionToRemove = actionToUndoActionMap.get(action);
                if (actionToRemove) {
                    this.removeActiveAction({
                        type: actionToRemove,
                        entry: entry,
                    });
                }
                break;
            }
        }
    }
    /**
     * Removes a matching action, if one is found, from the active actions set.
     * Note that we do not match on action equality and instead search through
     * the set of active actions for one that is of the same type, and has the
     * same entry associated with it.
     *
     * This is a no-op if the action is not active.
     **/
    removeActiveAction(action) {
        this.#activeActions = this.#activeActions.filter(activeAction => {
            if (activeAction.type === action.type && activeAction.entry === action.entry) {
                return false;
            }
            return true;
        });
    }
    #actionIsActive(action) {
        return this.#activeActions.some(activeAction => {
            return action.entry === activeAction.entry && action.type === activeAction.type;
        });
    }
    /**
     * The set of entries that are invisible given the set of applied actions. If
     * no actions are applied, this will return an empty list of entries.
     *
     * This method is cached, so it is safe to call multiple times.
     **/
    invisibleEntries() {
        if (this.#activeActions.length === 0) {
            return [];
        }
        return this.#calculateInvisibleEntries();
    }
    #calculateInvisibleEntries() {
        // When an action is added, we clear this cache. So if this cache is
        // present it means that the set of active actions has not changed, and so
        // we do not need to recalculate anything.
        if (this.#lastInvisibleEntries) {
            return this.#lastInvisibleEntries;
        }
        // We apply each user action in turn to the set of all entries, and mark
        // any that should be hidden by adding them to this set. We do this to
        // ensure we minimise the amount of passes through the list of all entries.
        // Another approach would be to use splice() to remove items from the
        // array, but doing this would be a mutation of the arry for every hidden
        // event. Instead, we add entries to this set and return it as an array at the end.
        const entriesToHide = new Set();
        for (const action of this.#activeActions) {
            switch (action.type) {
                case "MERGE_FUNCTION" /* FilterApplyAction.MERGE_FUNCTION */: {
                    // The entry that was clicked on is merged into its parent. All its
                    // children remain visible, so we just have to hide the entry that was
                    // selected.
                    entriesToHide.add(action.entry);
                    break;
                }
                case "COLLAPSE_FUNCTION" /* FilterApplyAction.COLLAPSE_FUNCTION */: {
                    // The entry itself remains visible, but all of its ancestors are hidden.
                    const entryNode = this.#entryToNode.get(action.entry);
                    if (!entryNode) {
                        // Invalid node was given, just ignore and move on.
                        continue;
                    }
                    const allAncestors = this.#findAllAncestorsOfNode(entryNode);
                    allAncestors.forEach(ancestor => entriesToHide.add(ancestor));
                    break;
                }
                case "COLLAPSE_REPEATING_DESCENDANTS" /* FilterApplyAction.COLLAPSE_REPEATING_DESCENDANTS */: {
                    const entryNode = this.#entryToNode.get(action.entry);
                    if (!entryNode) {
                        // Invalid node was given, just ignore and move on.
                        continue;
                    }
                    const allRepeatingDescendants = this.#findAllRepeatingDescendantsOfNext(entryNode);
                    allRepeatingDescendants.forEach(ancestor => entriesToHide.add(ancestor));
                    break;
                }
                default:
                    Platform.assertNever(action.type, `Unknown EntriesFilter action: ${action.type}`);
            }
        }
        // Now we have applied all actions, return the invisible entries.
        // We cache this under lastInvisibleEntries - if this function is called
        // again and the user actions have not changed, we can avoid recalculating
        // this and just return the last one. This cache is automatically cleared
        // when the user actions are changed.
        this.#lastInvisibleEntries = [...entriesToHide];
        return this.#lastInvisibleEntries;
    }
    #findAllAncestorsOfNode(root) {
        const ancestors = [];
        // Walk through all the ancestors, starting at the root node.
        const children = [...root.children];
        while (children.length > 0) {
            const childNode = children.shift();
            if (childNode) {
                ancestors.push(childNode.entry);
                children.push(...childNode.children);
            }
        }
        return ancestors;
    }
    #findAllRepeatingDescendantsOfNext(root) {
        // Walk through all the ancestors, starting at the root node.
        const children = [...root.children];
        const repeatingNodes = [];
        const rootIsProfileCall = Types.TraceEvents.isProfileCall(root.entry);
        while (children.length > 0) {
            const childNode = children.shift();
            if (childNode) {
                const childIsProfileCall = Types.TraceEvents.isProfileCall(childNode.entry);
                if ( /* Handle TraceEventSyntheticProfileCalls */rootIsProfileCall && childIsProfileCall) {
                    const rootNodeEntry = root.entry;
                    const childNodeEntry = childNode.entry;
                    if (Helpers.SamplesIntegrator.SamplesIntegrator.framesAreEqual(rootNodeEntry.callFrame, childNodeEntry.callFrame)) {
                        repeatingNodes.push(childNode.entry);
                    }
                } /* Handle SyntheticRendererEvents */
                else if (!rootIsProfileCall && !childIsProfileCall) {
                    if (root.entry.name === childNode.entry.name) {
                        repeatingNodes.push(childNode.entry);
                    }
                }
                children.push(...childNode.children);
            }
        }
        return repeatingNodes;
    }
    isEntryModified(event) {
        return this.#modifiedVisibleEntries.includes(event);
    }
    isUserApplyFilterAction(action) {
        return filterApplyActionSet.has(action.type);
    }
    isFilterUndoAction(action) {
        return filterUndoActionSet.has(action);
    }
}
//# sourceMappingURL=EntriesFilter.js.map