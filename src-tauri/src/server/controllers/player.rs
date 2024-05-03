use actix_web::{error, get, HttpRequest, Responder, Result, Scope, web};
use tauri::Manager;

use crate::GameState;
use crate::server::{ActixTauriAppState, security};

#[get("/host")]
async fn get_host_player(data: web::Data<ActixTauriAppState>, req: HttpRequest) -> Result<impl Responder> {
    let unauthorized = security::validate(&req);
    match unauthorized {
        Ok(()) => {
            let data_locked = data.app.lock().unwrap();
            let game_state = data_locked.state::<GameState>();
            let state_guard = game_state.0.lock().unwrap();
            println!("{}", req.path());
            Ok(web::Json(state_guard.manager.clone()))
        }
        Err(err) => {
            Err(error::ErrorUnauthorized(err))
        }
    }
}

pub fn player_controller() -> Scope {
    web::scope("/api/v1/player").service(get_host_player)
}