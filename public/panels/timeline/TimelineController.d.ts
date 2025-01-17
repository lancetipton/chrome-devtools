import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
import { PerformanceModel } from './PerformanceModel.js';
export declare class TimelineController implements TraceEngine.TracingManager.TracingManagerClient {
    #private;
    readonly primaryPageTarget: SDK.Target.Target;
    readonly rootTarget: SDK.Target.Target;
    private tracingManager;
    private performanceModel;
    private readonly client;
    private readonly tracingModel;
    private tracingCompleteCallback?;
    /**
     * We always need to profile against the DevTools root target, which is
     * the target that DevTools is attached to.
     *
     * In most cases, this will be the tab that DevTools is inspecting.
     * Now pre-rendering is active, tabs can have multiple pages - only one
     * of which the user is being shown. This is the "primary page" and hence
     * why in code we have "primaryPageTarget". When there's a prerendered
     * page in a background, tab target would have multiple subtargets, one
     * of them being primaryPageTarget.
     *
     * The problems with with using primary page target for tracing are:
     * 1. Performance trace doesn't include information from the other pages on
     *    the tab which is probably not what the user wants as it does not
     *    reflect reality.
     * 2. Capturing trace never finishes after prerendering activation as
     *    we've started on one target and ending on another one, and
     *    tracingComplete event never gets processed.
     *
     * However, when we want to look at the URL of the current page, we need
     * to use the primaryPageTarget to ensure we get the URL of the tab and
     * the tab's page that is being shown to the user. This is because the tab
     * target (which is what rootTarget is) only exposes the Target and Tracing
     * domains. We need the Page target to navigate as it implements the Page
     * domain. That is why here we have to store both.
     **/
    constructor(rootTarget: SDK.Target.Target, primaryPageTarget: SDK.Target.Target, client: Client);
    dispose(): Promise<void>;
    startRecording(options: RecordingOptions): Promise<Protocol.ProtocolResponseWithError>;
    stopRecording(): Promise<PerformanceModel>;
    getPerformanceModel(): PerformanceModel;
    private waitForTracingToStop;
    private startRecordingWithCategories;
    traceEventsCollected(events: TraceEngine.TracingManager.EventPayload[]): void;
    tracingComplete(): void;
    private allSourcesFinished;
    private finalizeTrace;
    tracingBufferUsage(usage: number): void;
    eventsRetrievalProgress(progress: number): void;
}
export interface Client {
    recordingProgress(usage: number): void;
    loadingStarted(): void;
    processingStarted(): void;
    loadingProgress(progress?: number): void;
    loadingComplete(collectedEvents: TraceEngine.Types.TraceEvents.TraceEventData[], tracingModel: TraceEngine.Legacy.TracingModel | null, exclusiveFilter: TimelineModel.TimelineModelFilter.TimelineModelFilter | null, isCpuProfile: boolean): Promise<void>;
    loadingCompleteForTest(): void;
}
export interface RecordingOptions {
    enableJSSampling?: boolean;
    capturePictures?: boolean;
    captureFilmStrip?: boolean;
}
