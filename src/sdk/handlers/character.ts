import { api_call } from '@fdd/rust/api-call';
import { Character } from '@fdd/types/rs';

export class CharacterHandler {
    getAll = api_call<void, Character[]>('character_get_all');
    get = api_call<{ id: string }, Character>('character_get');
}
