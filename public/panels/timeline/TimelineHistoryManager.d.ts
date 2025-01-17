import type * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type PerformanceModel } from './PerformanceModel.js';
import { type TimelineMiniMap } from './TimelineMiniMap.js';
export type RecordingData = {
    legacyModel: PerformanceModel;
    traceParseDataIndex: number;
};
export interface NewHistoryRecordingData {
    data: RecordingData;
    filmStripForPreview: TraceEngine.Extras.FilmStrip.Data | null;
    traceParsedData: TraceEngine.Handlers.Types.TraceParseData;
}
export declare class TimelineHistoryManager {
    #private;
    private recordings;
    private readonly action;
    private readonly nextNumberByDomain;
    private readonly buttonInternal;
    private readonly allOverviews;
    private totalHeight;
    private enabled;
    private lastActiveModel;
    constructor(minimapComponent?: TimelineMiniMap);
    addRecording(newInput: NewHistoryRecordingData): void;
    setEnabled(enabled: boolean): void;
    button(): ToolbarButton;
    clear(): void;
    showHistoryDropDown(): Promise<RecordingData | null>;
    cancelIfShowing(): void;
    navigate(direction: number): RecordingData | null;
    private setCurrentModel;
    private updateState;
    static previewElement(performanceModel: PerformanceModel): Element;
    private static coarseAge;
    private title;
    private buildPreview;
    private buildTextDetails;
    private buildScreenshotThumbnail;
    private buildOverview;
    private static dataForModel;
}
export declare const maxRecordings = 5;
export declare const previewWidth = 450;
export declare class DropDown implements UI.ListControl.ListDelegate<PerformanceModel> {
    private readonly glassPane;
    private readonly listControl;
    private readonly focusRestorer;
    private selectionDone;
    constructor(models: PerformanceModel[]);
    static show(models: PerformanceModel[], currentModel: PerformanceModel, anchor: Element): Promise<PerformanceModel | null>;
    static cancelIfShowing(): void;
    private show;
    private onMouseMove;
    private onClick;
    private onKeyDown;
    private close;
    createElementForItem(item: PerformanceModel): Element;
    heightForItem(_item: PerformanceModel): number;
    isItemSelectable(_item: PerformanceModel): boolean;
    selectedItemChanged(from: PerformanceModel | null, to: PerformanceModel | null, fromElement: Element | null, toElement: Element | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    private static instance;
}
export declare class ToolbarButton extends UI.Toolbar.ToolbarItem {
    private contentElement;
    constructor(action: UI.ActionRegistration.Action);
    setText(text: string): void;
}
export interface PreviewData {
    preview: Element;
    time: Element;
    lastUsed: number;
    title: string;
}
