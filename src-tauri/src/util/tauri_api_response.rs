use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct TauriResponseError {
    code: usize,
    message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export)]
pub struct TauriResponse<Data> {
    data: Option<Data>,
    error: Option<TauriResponseError>,
}

impl<Data> TauriResponse<Data> {
    pub fn new(data: Data) -> TauriResponse<Data> {
        TauriResponse {
            data: Some(data),
            error: None,
        }
    }

    pub fn new_error(code: usize, message: &str) -> TauriResponse<Data> {
        TauriResponse {
            data: None,
            error: Some(TauriResponseError {
                code,
                message: message.to_string(),
            }),
        }
    }

    pub fn new_error_string(code: usize, message: String) -> TauriResponse<Data> {
        TauriResponse {
            data: None,
            error: Some(TauriResponseError {
                code,
                message,
            }),
        }
    }
}

