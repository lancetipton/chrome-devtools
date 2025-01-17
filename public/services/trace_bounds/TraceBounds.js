// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../models/trace/trace.js';
let instance = null;
export class StateChangedEvent extends Event {
    state;
    updateType;
    options;
    static eventName = 'traceboundsstatechanged';
    constructor(state, updateType, options = { shouldAnimate: false }) {
        super(StateChangedEvent.eventName, { composed: true, bubbles: true });
        this.state = state;
        this.updateType = updateType;
        this.options = options;
    }
}
export class BoundsManager extends EventTarget {
    static instance(opts = { forceNew: null }) {
        const forceNew = Boolean(opts.forceNew);
        if (!instance || forceNew) {
            instance = new BoundsManager();
        }
        return instance;
    }
    static removeInstance() {
        instance = null;
    }
    #currentState = null;
    constructor() {
        // Defined to enable us to mark it as Private.
        super();
    }
    resetWithNewBounds(initialBounds) {
        this.#currentState = {
            entireTraceBounds: initialBounds,
            minimapTraceBounds: initialBounds,
            timelineTraceWindow: initialBounds,
        };
        this.dispatchEvent(new StateChangedEvent(this.state(), 'RESET'));
        return this;
    }
    state() {
        if (this.#currentState === null) {
            return null;
        }
        const entireBoundsMilli = TraceEngine.Helpers.Timing.traceWindowMilliSeconds(this.#currentState.entireTraceBounds);
        const minimapBoundsMilli = TraceEngine.Helpers.Timing.traceWindowMilliSeconds(this.#currentState.minimapTraceBounds);
        const timelineTraceWindowMilli = TraceEngine.Helpers.Timing.traceWindowMilliSeconds(this.#currentState.timelineTraceWindow);
        return {
            micro: this.#currentState,
            milli: {
                entireTraceBounds: entireBoundsMilli,
                minimapTraceBounds: minimapBoundsMilli,
                timelineTraceWindow: timelineTraceWindowMilli,
            },
        };
    }
    setMiniMapBounds(newBounds) {
        if (!this.#currentState) {
            // If we don't have the existing state and know the trace bounds, we cannot set the minimap bounds.
            return;
        }
        const existingBounds = this.#currentState.minimapTraceBounds;
        if (newBounds.min === existingBounds.min && newBounds.max === existingBounds.max) {
            // New bounds are identical to the old ones so no action required.
            return;
        }
        if (newBounds.range < 1_000) {
            // Minimum minimap bounds range is 1 millisecond.
            return;
        }
        this.#currentState.minimapTraceBounds = newBounds;
        // this.state() cannot be null here.
        this.dispatchEvent(new StateChangedEvent(this.state(), 'MINIMAP_BOUNDS'));
    }
    setTimelineVisibleWindow(newWindow, options = {
        shouldAnimate: false,
    }) {
        if (!this.#currentState) {
            return;
        }
        const existingWindow = this.#currentState.timelineTraceWindow;
        if (newWindow.min === existingWindow.min && newWindow.max === existingWindow.max) {
            // New bounds are identical to the old ones so no action required.
            return;
        }
        if (newWindow.range < 1_000) {
            // Minimum timeline visible window range is 1 millisecond.
            return;
        }
        this.#currentState.timelineTraceWindow = newWindow;
        this.dispatchEvent(new StateChangedEvent(this.state(), 'VISIBLE_WINDOW', { shouldAnimate: options.shouldAnimate }));
    }
}
//# sourceMappingURL=TraceBounds.js.map