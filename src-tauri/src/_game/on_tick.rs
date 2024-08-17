use crate::GameState;
use crate::response::TauriResponse;

#[tauri::command]
pub fn on_tick(state: tauri::State<GameState>) -> TauriResponse<usize> {
    let mut state_guard = state.0.lock().unwrap();
    if let Some(mut manager) = state_guard.manager.clone() {
        // manager.player.on_tick();
        manager.on_tick();
        state_guard.manager = Some(manager);
    }
    // Loop over enemies
    // {
    //     let mut i = 0;
    //     while i < state_guard.enemies.len() {
    //         if state_guard.enemies[i].base_stats.hp <= 0.0 {
    //             state_guard.enemies.remove(i);
    //         } else {
    //             state_guard.enemies[i].destination = state_guard.player.obj.get_position();
    //             state_guard.enemies[i].update();
    //             i += 1;
    //         }
    //     }
    // }
    // Loop over projectiles
    TauriResponse::new(1)
}
