import { api_call } from '@fdd/rust/api-call';
import { UPoint, USize } from '@fdd/types/rs';

export class PathFinderHandler {
    rust = {
        aStar: api_call<
            { start: UPoint; end: UPoint; navMesh: number[]; mapSize: USize },
            Array<UPoint>
        >('path_finder_a_star'),
        map: api_call<
            { start: UPoint; end: UPoint; mapId: string },
            Array<UPoint>
        >('path_finder_map'),
    };
}
