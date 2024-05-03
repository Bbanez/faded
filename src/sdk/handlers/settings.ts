import { api_call } from '../../rust/api-call.ts';
import { Settings, USize } from '../../types/rs';
import { ref } from 'vue';

export class SettingsHandler {
    private rust_get = api_call<{ resolution: USize }, Settings>(
        'settings_get',
    );
    private rust_set = api_call<{ resolution: USize }, Settings>(
        'settings_set',
    );

    store = ref<Settings>();

    async get(resolution: USize) {
        if (!this.store.value) {
            this.store.value = await this.rust_get({ resolution });
        }
        return this.store.value;
    }

    async set(resolution: USize) {
        this.store.value = await this.rust_set({ resolution });
        return this.store.value;
    }
}
