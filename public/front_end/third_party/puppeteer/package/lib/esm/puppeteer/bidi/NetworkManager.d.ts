/**
 * Copyright 2023 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { EventEmitter } from '../common/EventEmitter.js';
import { type NetworkManagerEvents } from '../common/NetworkManagerEvents.js';
import type { BidiConnection } from './Connection.js';
import type { BidiFrame } from './Frame.js';
import { BidiHTTPResponse } from './HTTPResponse.js';
import type { BidiPage } from './Page.js';
/**
 * @internal
 */
export declare class BidiNetworkManager extends EventEmitter<NetworkManagerEvents> {
    #private;
    constructor(connection: BidiConnection, page: BidiPage);
    getNavigationResponse(navigationId?: string | null): BidiHTTPResponse | null;
    inFlightRequestsCount(): number;
    clearMapAfterFrameDispose(frame: BidiFrame): void;
    dispose(): void;
}
//# sourceMappingURL=NetworkManager.d.ts.map