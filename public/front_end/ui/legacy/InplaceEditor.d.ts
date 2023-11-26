export declare class InplaceEditor<T> {
    private focusRestorer?;
    static startEditing<T>(element: Element, config?: Config<T>): Controller | null;
    editorContent(editingContext: EditingContext<T>): string;
    setUpEditor(editingContext: EditingContext<T>): void;
    closeEditor(editingContext: EditingContext<T>): void;
    cancelEditing(editingContext: EditingContext<T>): void;
    startEditing(element: Element, inputConfig?: Config<T>): Controller | null;
}
export type CommitHandler<T> = (arg0: Element, arg1: string, arg2: string, arg3: T, arg4: string) => void;
export type CancelHandler<T> = (arg0: Element, arg1: T) => void;
export type BlurHandler = (arg0: Element, arg1?: Event | undefined) => boolean;
export declare class Config<T = undefined> {
    commitHandler: CommitHandler<T>;
    cancelHandler: CancelHandler<T>;
    context: T;
    blurHandler: BlurHandler | undefined;
    pasteHandler: EventHandler | null;
    postKeydownFinishHandler: EventHandler | null;
    constructor(commitHandler: CommitHandler<T>, cancelHandler: CancelHandler<T>, context?: T, blurHandler?: BlurHandler);
    setPasteHandler(pasteHandler: EventHandler): void;
    setPostKeydownFinishHandler(postKeydownFinishHandler: EventHandler): void;
}
export type EventHandler = (event: Event) => string | undefined;
export interface Controller {
    cancel: () => void;
    commit: () => void;
}
export interface EditingContext<T> {
    element: Element;
    config: Config<T>;
    oldRole: string | null;
    oldText: string | null;
    oldTabIndex: string | null;
}
