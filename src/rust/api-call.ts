import { invoke } from '@tauri-apps/api';
import { TauriResponse } from '../types/rs';

export function api_call<
    Data extends Record<string, unknown> | unknown = undefined,
    Result = unknown,
>(name: string) {
    return async (data: Data): Promise<Result> => {
        const res = await invoke<TauriResponse<Result>>(name, data as never);
        if (res.error) {
            throw res.error;
        }
        return res.data as Result;
    };
}
