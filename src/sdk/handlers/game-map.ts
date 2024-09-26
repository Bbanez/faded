import { api_call } from '@fdd/rust/api-call';
import {
    GameMap,
    GameMapLandscapeSet,
    GameMapLite,
    Point3,
    UPoint,
    USize3,
} from '@fdd/types/rs';

export class GameMapHandler {
    private rust = {
        create: api_call<{ name: string; desc: string; size: USize3 }, GameMap>(
            'game_map_create',
        ),
        save: api_call<{ gameMapId: string }, GameMap>('game_map_save'),
        get: api_call<{ gameMapId: string }, GameMap>('game_map_get'),
        getAll: api_call<void, GameMapLite[]>('game_map_get_all'),
        landscapeSetCamera: api_call<
            {
                gameMapId: string;
                cameraPosition: Point3;
                cameraRotation: number;
                cameraDistance: number;
                cameraSpeed: number;
            },
            Point3
        >('game_map_landscape_set_camera'),
        landscapeSetSelectedLevel: api_call<
            { gameMapId: string; level: number },
            number
        >('game_map_landscape_set_selected_level'),
        landscapeSetChunk: api_call<
            { gameMapId: string; chunkData: [number, number] },
            [number, number]
        >('game_map_landscape_set_chunk'),
        landscapeGetSets: api_call<void, GameMapLandscapeSet[]>(
            'game_map_landscape_get_sets',
        ),
        navMeshMetadata: api_call<{ gameMapId: string }, number[]>(
            'game_map_nav_mesh_metadata',
        ),
        pathFind: api_call<
            { start: UPoint; end: UPoint; mapId: string },
            UPoint[]
        >('game_map_path_find'),
    };

    private landscape_sets: GameMapLandscapeSet[] | null = null;

    async create(name: string, desc: string, size: USize3): Promise<GameMap> {
        return await this.rust.create({ name, desc, size });
    }

    async save(gameMapId: string): Promise<GameMap> {
        return await this.rust.save({ gameMapId });
    }

    async get(gameMapId: string): Promise<GameMap> {
        return await this.rust.get({ gameMapId });
    }

    async getAll(): Promise<GameMapLite[]> {
        return await this.rust.getAll();
    }

    async landscapeSetCamera(
        gameMapId: string,
        cameraPosition: Point3,
        cameraRotation: number,
        cameraDistance: number,
        cameraSpeed: number,
    ): Promise<void> {
        await this.rust.landscapeSetCamera({
            gameMapId,
            cameraPosition,
            cameraRotation,
            cameraSpeed,
            cameraDistance,
        });
    }

    async landscapeSetSelectedLevel(
        gameMapId: string,
        level: number,
    ): Promise<void> {
        await this.rust.landscapeSetSelectedLevel({ gameMapId, level });
    }

    async landscapeSetChunk(
        gameMapId: string,
        chunkData: [number, number],
    ): Promise<[number, number]> {
        return await this.rust.landscapeSetChunk({ gameMapId, chunkData });
    }

    async landscapeGetSets(): Promise<GameMapLandscapeSet[]> {
        if (!this.landscape_sets) {
            this.landscape_sets = await this.rust.landscapeGetSets();
        }
        return this.landscape_sets;
    }

    async navMeshMetadata(gameMapId: string): Promise<number[]> {
        return await this.rust.navMeshMetadata({ gameMapId });
    }

    async pathFind(mapId: string, start: UPoint, end: UPoint) {
        return await this.rust.pathFind({ mapId, start, end });
    }
}
