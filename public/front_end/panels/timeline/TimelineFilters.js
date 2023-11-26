// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
import { TimelineUIUtils } from './TimelineUIUtils.js';
export class IsLong extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    minimumRecordDuration;
    constructor() {
        super();
        this.minimumRecordDuration = 0;
    }
    setMinimumRecordDuration(value) {
        this.minimumRecordDuration = value;
    }
    accept(event) {
        if (TraceEngine.Legacy.eventIsFromNewEngine(event)) {
            const { duration } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(event);
            return duration >= this.minimumRecordDuration;
        }
        const duration = event.endTime ? event.endTime - event.startTime : 0;
        return duration >= this.minimumRecordDuration;
    }
}
export class Category extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    constructor() {
        super();
    }
    accept(event) {
        return !TimelineUIUtils.eventStyle(event).category.hidden;
    }
}
export class TimelineRegExp extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    regExpInternal;
    constructor(regExp) {
        super();
        this.setRegExp(regExp || null);
    }
    setRegExp(regExp) {
        this.regExpInternal = regExp;
    }
    regExp() {
        return this.regExpInternal;
    }
    accept(event, traceParsedData) {
        return !this.regExpInternal || TimelineUIUtils.testContentMatching(event, this.regExpInternal, traceParsedData);
    }
}
//# sourceMappingURL=TimelineFilters.js.map